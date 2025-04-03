import "server-only";

import { load, type Cheerio } from "cheerio";
import { ElementType } from "domelementtype";
import { type AnyNode } from "domhandler";
import type { Assignment, Course, LoginTA } from "~/common/types/teachassist";
import { tryCatch } from "./helpers";
import { fetch as cookieFetch, CookieJar } from "node-fetch-cookies";

export async function loginTA(
  studentId: string,
  password: string,
): Promise<LoginTA> {
  const URL = `https://ta.yrdsb.ca/live/index.php?username=${studentId}&password=${password}&submit=Login&subject_id=0`;
  const cookieJar = new CookieJar();

  const loginResponse = await tryCatch(
    cookieFetch(cookieJar, URL, { method: "POST", body: "credentials" }),
  );
  if (loginResponse.error)
    throw new Error("Teachassist is currently unavailable");

  const html = await tryCatch(loginResponse.data.text());
  if (
    html.error ||
    ["Invalid Login", "Access Denied", "Session Expired", "YRDSB teachassist login"].some((err) =>
      html.data.includes(err),
    )
  ) {
    throw new Error("Invalid student number or password");
  }

  return { html: html.data, credentials: { studentId, password } };
}

export async function getStudentTAInfo(
  studentId: string,
  password: string,
): Promise<Course[]> {
  const { error, data } = await tryCatch(loginTA(studentId, password));
  if (error) throw error;

  const { error: courseError, data: courseData } = await tryCatch(
    getCourseInfo(data),
  );

  if (courseError) throw courseError;

  return [...courseData];
}

async function getCourseInfo(loginData: LoginTA): Promise<Course[]> {
  const $ = load(loginData.html);
  const courses: Course[] = [];

  for (const elem of $(".green_border_message div table tr")) {
    try {
      const link = $(elem).find("a").attr("href") ?? null;
      const courseData = $(elem)
        .text()
        .split("\n")
        .map((c) => c.trim())
        .filter((c) => c.length > 0);

      if (
        courseData.length <= 3 ||
        !courseData[1] ||
        courseData[1].includes("Course Name")
      )
        continue;

      const [courseInfo, blockInfo, rawStartTime, timeInfo, mark] = courseData;

      const [rawCode, rawName] = courseInfo?.split(" : ") ?? [];
      const code = rawCode
        ?.replace(":", "")
        .trim()
        .replace("Hodan Nalayeh Secondary School - ", "");
      const name = rawName ?? null;
      const startTime = new Date(rawStartTime?.split("~")[0]?.trim() ?? "");
      const hasDropped = timeInfo?.includes("Dropped on");
      const rawBlock = blockInfo
        .replace("Block: ", "")
        .trim()
        .split(" - ")[0]
        ?.trim();
      const block = Number(rawBlock?.replace(/[^0-9]/g, ""));
      const room = blockInfo.split("rm. ")[1];

      const endTime = new Date(
        (hasDropped
          ? timeInfo?.split("Dropped")[0]?.trim()
          : timeInfo?.trim()) ?? "",
      );

      const droppedTime = new Date(
        (hasDropped ? timeInfo?.split("Dropped on")[1]?.trim() : null) ?? "",
      );

      const markInfo = getMark(mark);

      if (!code || !startTime || !endTime || !block || !room) continue;

      const course: Course = {
        code,
        name,
        block,
        room,
        times: {
          startTime,
          endTime,
          droppedTime,
        },
        ...markInfo,
        link,
        assignments: [],
      };

      // const assignments = await getAssignments(course);
      // course.assignments = assignments;

      courses.push(course);
    } catch (e) {
      console.log(e);
      console.log("Error with pushing course");
    }
  }

  return courses;
}

async function getAssignments(course: Course): Promise<Assignment[]> {
  const assignments: Assignment[] = [];

  if (course.link == null) {
    return [];
  }

  const { error, data: courseResponse } = await tryCatch(
    fetch(`https://ta.yrdsb.ca/live/students/${course.link}`, {
      method: "POST",
      body: "credentials",
    }),
  );
  if (error) throw error;

  const $ = load(await courseResponse.text());

  $('table[width="100%"] tr').each((i, elem) => {
    if (i === 0) return;

    const assignmentName =
      $(elem).find('td[rowspan="2"]').text().trim() ?? null;
    if (!assignmentName) return;

    const KU_color = "ffffaa";
    const T_color = "c0fea4";
    const C_color = "afafff";
    const A_color = "ffd490";
    const O_color = "dedede";

    const KU = $(elem).find(`td[bgcolor="${KU_color}"]`);
    const T = $(elem).find(`td[bgcolor="${T_color}"]`);
    const C = $(elem).find(`td[bgcolor="${C_color}"]`);
    const A = $(elem).find(`td[bgcolor="${A_color}"]`);
    const O = $(elem).find(`td[bgcolor="${O_color}"]`);

    assignments.push({
      name: assignmentName,
      feedback: null,
      categories: {
        KU: createCategory(KU),
        T: createCategory(T),
        C: createCategory(C),
        A: createCategory(A),
        O: createCategory(O),
      },
    });
  });

  return assignments;
}

function getWeight(elem: Cheerio<AnyNode>): number {
  const text = elem.find('td font[size="-2"]').text().trim();
  return text === "no weight" ? 0 : Number(/\d+/.exec(text)?.[0] ?? 0);
}

function getScore(elem: Cheerio<AnyNode>) {
  const equation = elem
    .find("td")
    .first()
    .contents()
    .filter((_, e) => e.type === ElementType.Text)
    .text()
    .trim()
    .split("=")[0]
    ?.trim();
  const score = equation?.split("/").map(Number) ?? [];
  return { scored: score[0], max: score[1] };
}

function createCategory(elem: Cheerio<AnyNode>) {
  if (!elem.children().length) return null;

  const { scored, max } = getScore(elem);
  if (!max || !scored) return null;

  return {
    weight: getWeight(elem),
    scored,
    max,
  };
}

function getMark(rawMark?: string) {
  if (!rawMark) return { overallMark: null, isFinal: false, isMidterm: false };

  const cleanMark = rawMark.replace(/\s/g, "");
  const patterns = [
    { key: "FINALMARK:", isFinal: true, isMidterm: false },
    { key: "currentmark=", isFinal: false, isMidterm: false },
    { key: "MIDTERMMARK:", isFinal: false, isMidterm: true },
  ];

  for (const { key, isFinal, isMidterm } of patterns) {
    if (cleanMark.includes(key)) {
      const splitMark = cleanMark.split(key);
      const markPart = splitMark[1]?.split("%")[0];
      if (markPart !== undefined) {
        const overallMark = parseFloat(markPart);
        return { overallMark, isFinal, isMidterm };
      }
    }
  }

  return { overallMark: null, isFinal: false, isMidterm: false };
}
