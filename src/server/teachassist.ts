import "server-only";

import { load } from "cheerio";
import { and, eq, or, sql } from "drizzle-orm";
import makeFetchCookie from "fetch-cookie";
import { headers } from "next/headers";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";
import type { Course, LoginTA } from "~/common/types/teachassist";
import { env } from "~/env";
import { decryptPassword } from "~/lib/crypto";
import { auth } from "./auth";
import { db } from "./db";
import { course, user } from "./db/schema";
import { tryCatch } from "./helpers";

const fetchCookie = makeFetchCookie(
  fetch,
  new makeFetchCookie.toughCookie.CookieJar(),
  false,
);

export async function loginTA(
  studentId?: string,
  password?: string,
): Promise<LoginTA> {
  if (!studentId || !password)
    throw new Error("Invalid student number or password");

  const URL = `https://ta.yrdsb.ca/live/index.php?username=${studentId}&password=${password}&submit=Login&subject_id=0`;
  const loginResponse = await tryCatch(
    fetchCookie("https://api.brightdata.com/request", {
      method: "POST",
      body: JSON.stringify({
        zone: env.BRIGHT_DATA_ZONE,
        url: URL,
        format: "raw",
        method: "POST",
      }),
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${env.BRIGHT_DATA_TOKEN}`,
      },
    }),
  );

  if (loginResponse.error) {
    // 503 error
    throw new Error("Teachassist is currently unavailable");
  }

  const html = await tryCatch(loginResponse.data.text());
  if (html.error || !html.data.includes("Student Reports")) {
    // 401 error
    throw new Error("Invalid student number or password");
  }

  return {
    html: html.data,
  };
}

export default async function syncTA() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) throw new Error("You must be logged in to perform this action.");

    const studentId = session.user.studentId;
    const password = decryptPassword(session.user.taPassword);

    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.studentId, studentId));

    if (!existingUser) throw new Error("Could not find student: " + studentId);

    const lastSynced = existingUser.lastSyncedAt;
    const now = new Date();

    if (lastSynced) {
      const twelveHoursAgo = new Date();
      twelveHoursAgo.setHours(now.getHours() - 12);
    
      if (lastSynced > twelveHoursAgo) {
        const nextAllowedSync = new Date(lastSynced.getTime() + 12 * 60 * 60 * 1000);
        const diffMs = nextAllowedSync.getTime() - now.getTime();
    
        const hours = Math.floor(diffMs / (1000 * 60 * 60));
        const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
        throw new Error(
          `You can only sync once every 12 hours. Try again in ${hours}h ${minutes}m.`
        );
      }
    }

    const { data: courses, error } = await tryCatch(
      getTAReports({ studentId, password }),
    );
    if (error) throw error;

    const userId = existingUser.id;
    const nowISO = now.toISOString();

    await db.transaction(async (trx) => {
      // Delete outdated courses
      await trx
      .delete(course)
      .where(and(
        eq(course.userId, userId),
        or(
          sql`(${course.times}->>'endTime')::timestamptz < ${nowISO}::timestamptz`,
          sql`(${course.times}->>'startTime')::timestamptz > ${nowISO}::timestamptz`
        )
      ));

      for (const c of courses) {
        const [existingCourse] = await trx
          .select()
          .from(course)
          .where(
            and(
              eq(course.code, c.code),
              eq(course.userId, userId),
            ),
          );

        const courseId = existingCourse?.id ?? uuidv4();

        if (existingCourse) {
          await trx
            .update(course)
            .set({
              code: c.code,
              name: c.name ?? existingCourse.name,
              block: c.block.toString(),
              room: c.room,
              times: c.times,
              overallMark: (
                c.overallMark ?? existingCourse.overallMark
              )?.toString(),
              isFinal: c.isFinal,
              isMidterm: c.isMidterm,
              link: c.link ?? existingCourse.link,
            })
            .where(eq(course.id, courseId));
        } else {
          await trx.insert(course).values({
            id: courseId,
            code: c.code,
            name: c.name,
            block: c.block.toString(),
            room: c.room,
            times: c.times,
            overallMark: c.overallMark?.toString(),
            isFinal: c.isFinal,
            isMidterm: c.isMidterm,
            link: c.link,
            userId,
          });
        }

        await trx
          .update(user)
          .set({ lastSyncedAt: new Date() })
          .where(eq(user.id, userId));
      }
    });

    return { data: { success: true } };
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }

    return {
      error: "There was an unexpected error while syncing",
    };
  }
}

async function getTAReports({
  studentId,
  password,
  html,
}: {
  studentId?: string;
  password?: string;
  html?: string;
}): Promise<Course[]> {
  const hasCredentials = studentId && password;
  const hasHtml = !!html;

  if (!(hasCredentials || hasHtml) || (hasCredentials && hasHtml)) {
    throw new Error(
      "You must provide either both studentId and password, or just html.",
    );
  }

  let htmlContent: string;

  if (html) {
    htmlContent = html;
  } else {
    const { data, error } = await tryCatch(loginTA(studentId, password));
    if (error) throw error;
    htmlContent = data.html;
  }

  const $ = load(htmlContent);
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

      courses.push(course);
    } catch {}
  }

  function getMark(rawMark?: string) {
    if (!rawMark)
      return { overallMark: null, isFinal: false, isMidterm: false };

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

  return courses;
}
