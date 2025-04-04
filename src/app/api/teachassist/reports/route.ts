import { load } from "cheerio";
import makeFetchCookie from "fetch-cookie";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { loginSchema } from "~/common/types/login";
import { type ReportsResponse } from "~/common/types/reports";
import type { Course } from "~/common/types/teachassist";
import { getBaseURL } from "~/lib/utils";
import { tryCatch } from "~/server/helpers";

const fetchCookie = makeFetchCookie(fetch);

export async function POST(req: Request) {
  try {
    const bodyRaw = (await req.json()) as z.infer<typeof loginSchema>;
    const body = loginSchema.parse(bodyRaw);
    const { studentId, password } = body;

    const URL =
      getBaseURL() +
      `/api/proxy?url=${encodeURIComponent(`https://ta.yrdsb.ca/live/index.php?username=${studentId}&password=${password}&submit=Login&subject_id=0`)}`;

    const loginResponse = await tryCatch(
      fetchCookie(URL, {
        method: "POST",
        body: "credentials",
      }),
    );

    if (loginResponse.error)
      return NextResponse.json<ReportsResponse>(
        { error: "Teachassist is currently unavailable", courses: [] },
        { status: 503 },
      );

    const html = await tryCatch(loginResponse.data.text());
    if (
      html.error ||
      [
        "Invalid Login",
        "Access Denied",
        "Session Expired",
        "YRDSB teachassist login",
      ].some((err) => html.data.includes(err))
    ) {
      return NextResponse.json<ReportsResponse>(
        { error: "Invalid student number or password", courses: [] },
        { status: 401 },
      );
    }

    const $ = load(html.data);
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

        const [courseInfo, blockInfo, rawStartTime, timeInfo, mark] =
          courseData;

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

    return NextResponse.json<ReportsResponse>(
      { error: null, courses },
      { status: 200 },
    );
  } catch {
    return NextResponse.json<ReportsResponse>(
      { error: "There was an issue getting student reports", courses: [] },
      { status: 500 },
    );
  }
}
