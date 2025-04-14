import "server-only";

import { and, eq, like, sql } from "drizzle-orm";
import { headers } from "next/headers";
import type { z } from "zod";
import type { leaderboardModes } from "~/common/types/leaderboard-modes";
import { classCodeToGlobalCode } from "~/lib/utils";
import { auth } from "./auth";
import { db } from "./db";
import { course, user } from "./db/schema";

export async function toggleAnonymous(code: string, school: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      throw new Error("You must be logged in to perform this action");

    const userId = session.user.id;

    const [existingCourse] = await db
      .select()
      .from(course)
      .where(
        and(
          eq(course.code, code),
          eq(course.userId, userId),
          eq(course.schoolIdentifier, school),
        ),
      )
      .limit(1);

    if (!existingCourse)
      throw new Error(
        "No active course found with this code, or you are not enrolled in it. Please check the course code and your enrollment status",
      );
    const newAnonymousState = existingCourse.isAnonymous;

    await db
      .update(course)
      .set({ isAnonymous: !newAnonymousState })
      .where(and(eq(course.code, code), eq(course.userId, userId)));

    return {
      data: {
        isAnonymous: !newAnonymousState,
      },
    };
  } catch (e) {
    if (e instanceof Error) {
      return { error: e.message };
    }

    return {
      error:
        "An unexpected error occurred while trying to toggle anonymity. Please try again or contact support",
    };
  }
}

export async function getStudentClassAnonymity(code: string, school: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    throw new Error("You must be logged in to perform this action.");

  const [studentClassAnonymity] = await db
    .select({
      isAnonymous: course.isAnonymous,
    })
    .from(course)
    .where(
      and(
        eq(course.userId, session.user.id),
        eq(course.code, code),
        eq(course.schoolIdentifier, school),
      ),
    );

  return studentClassAnonymity?.isAnonymous;
}

export async function getRankingsData({
  mode,
  code,
  school,
  page = 1,
  pageSize = 25,
}: {
  mode: z.infer<typeof leaderboardModes>;
  code: string;
  school: string;
  page?: number;
  pageSize?: number;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    throw new Error("You must be logged in to perform this action.");

  const offset = (page - 1) * pageSize;
  const globalCode = classCodeToGlobalCode(code);

  // --- Determine filter criteria based on selected leaderboard mode ---
  let whereClause;
  switch (mode) {
    case "class":
      whereClause = and(
        eq(course.code, code),
        eq(course.schoolIdentifier, school),
      );
      break;
    case "school":
      whereClause = and(
        like(course.code, `%${globalCode}%`),
        eq(course.schoolIdentifier, school),
      );
      break;
    case "global":
      whereClause = like(course.code, `${globalCode}%`);
      break;
  }

  // --- Fetch relevant data concurrently ---
  const [studentCourse, allMarks, totalCountResult, rankedCourses, anonymity] =
    await Promise.all([
      // Student's course record
      db.query.course.findFirst({
        where: (model, { eq, and }) =>
          and(
            eq(model.userId, session.user.id),
            eq(model.code, code),
            eq(model.schoolIdentifier, school),
          ),
      }),
      // All student marks for ranking calculations
      db
        .select({ userId: course.userId, overallMark: course.overallMark })
        .from(course)
        .where(whereClause),
      // Total number of students for pagination
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(course)
        .where(whereClause),
      // Paginated leaderboard with calculated rank and conditional anonymity
      db
        .select({
          id: course.id,
          code: course.code,
          name: course.name,
          overallMark: course.overallMark,
          rank: sql<string>`RANK() OVER (ORDER BY ${course.overallMark} DESC NULLS LAST)`.as(
            "rank",
          ),
          studentId: sql<string>`CASE 
          WHEN ${course.isAnonymous} = FALSE AND ${user.id} = ${session.user.id}
          THEN ${user.studentId}
          ELSE NULL 
        END`.as("studentId"),
        })
        .from(course)
        .leftJoin(user, eq(course.userId, user.id))
        .where(whereClause)
        .orderBy(sql`${course.overallMark} DESC NULLS LAST`)
        .limit(pageSize)
        .offset(offset),
      // Check if the current student is anonymous
      db
        .select({ isAnonymous: course.isAnonymous })
        .from(course)
        .where(
          and(
            eq(course.userId, session.user.id),
            eq(course.code, code),
            eq(course.schoolIdentifier, school),
          ),
        ),
    ]);

  // --- Calculate rank and average for the current student ---
  const sortedMarks = allMarks
    .filter((m) => m.overallMark !== null)
    .sort((a, b) => Number(b.overallMark) - Number(a.overallMark));

  const studentIndex = sortedMarks.findIndex(
    (m) => m.userId === session.user.id,
  );
  const studentRank = studentIndex !== -1 ? studentIndex + 1 : null;
  const studentAverage = studentCourse?.overallMark ?? null;

  // --- Compute overall class/school/global average ---
  const { sum, count } = sortedMarks.reduce(
    (acc, c) => {
      acc.sum += Number(c.overallMark);
      acc.count += 1;
      return acc;
    },
    { sum: 0, count: 0 },
  );

  const average = count > 0 ? sum / count : null;
  const totalCount = totalCountResult[0]?.count ?? 0;
  const maxPages = Math.ceil(totalCount / pageSize);

  // --- Return formatted ranking data and student info ---
  return {
    data: {
      student: {
        average: studentAverage,
        rank: studentRank,
        isAnonymous: anonymity[0]?.isAnonymous,
      },
      average,
      rankings: rankedCourses,
      totalStudents: totalCount,
      maxPages,
    },
  };
}

export async function getUserClasses() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    throw new Error("You must be logged in to perform this action.");

  const courses = await db.query.course.findMany({
    where: (model, { eq, and }) => and(eq(model.userId, session.user.id)),
    with: {
      assignments: true,
    },
  });

  courses.sort((a, b) => {
    const aIsNum = /^\d+$/.test(a.block);
    const bIsNum = /^\d+$/.test(b.block);

    if (aIsNum && bIsNum) {
      return parseInt(a.block) - parseInt(b.block);
    }
    if (aIsNum) return -1;
    if (bIsNum) return 1;

    return a.block.localeCompare(b.block);
  });

  return courses;
}
