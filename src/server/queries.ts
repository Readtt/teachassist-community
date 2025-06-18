import "server-only";

import { and, eq, ilike, like, or, sql } from "drizzle-orm";
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

// TODO: change code so that it just shows courses that have at least one active user (current code works)
export async function searchClasses(q: string, page = 1, limit = 10) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    throw new Error("You must be logged in to perform this action.");
  }

  const offset = (page - 1) * limit;

  // Get results, only include courses where the user is active
  const results = await db
    .selectDistinct({
      code: course.code,
      name: course.name,
      schoolIdentifier: course.schoolIdentifier,
    })
    .from(course)
    .innerJoin(user, eq(course.userId, user.id))
    .where(
      and(
        eq(user.isActive, true),
        or(
          ilike(course.code, `%${q}%`),
          ilike(course.name, `%${q}%`),
          ilike(course.schoolIdentifier, `%${q}%`),
        ),
      ),
    )
    .orderBy(course.code)
    .limit(limit)
    .offset(offset);

  // Count total distinct rows (raw SQL for composite count), only for active users
  const countResult = await db.execute(
    sql`
      SELECT COUNT(*) FROM (
        SELECT DISTINCT c.code, c.name, c.school_identifier
        FROM ${course} AS c
        INNER JOIN ${user} AS u ON c.user_id = u.id
        WHERE u.is_active = true
          AND (
            c.code ILIKE ${`%${q}%`}
            OR c.name ILIKE ${`%${q}%`}
            OR c.school_identifier ILIKE ${`%${q}%`}
          )
      ) AS subquery;
    `,
  );

  const totalCount = parseInt((countResult?.[0]?.count ?? "0") as string);
  const totalPages = Math.ceil(totalCount / limit);

  return {
    results,
    totalPages,
    totalCount,
  };
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
  // Always filter for active users
  let whereClause;
  switch (mode) {
    case "class":
      whereClause = and(
        eq(course.code, code),
        eq(course.schoolIdentifier, school),
        eq(user.isActive, true)
      );
      break;
    case "school":
      whereClause = and(
        like(course.code, `%${globalCode}%`),
        eq(course.schoolIdentifier, school),
        eq(user.isActive, true)
      );
      break;
    case "global":
      whereClause = and(
        like(course.code, `%${globalCode}%`),
        eq(user.isActive, true)
      );
      break;
  }

  // --- Fetch relevant data concurrently ---
  const [studentCourse, allMarks, totalCountResult, rankedCourses, anonymity] =
    await Promise.all([
      // Student's course record (no need to filter for isActive here, just for the current user)
      db.query.course.findFirst({
        where: (model, { eq, and }) =>
          and(
            eq(model.userId, session.user.id),
            eq(model.code, code),
            eq(model.schoolIdentifier, school),
          ),
      }),
      // All student marks for ranking calculations (only active users)
      db
        .select({ userId: course.userId, overallMark: course.overallMark })
        .from(course)
        .innerJoin(user, eq(course.userId, user.id))
        .where(whereClause),
      // Total number of students for pagination (only active users)
      db
        .select({ count: sql<number>`COUNT(*)` })
        .from(course)
        .innerJoin(user, eq(course.userId, user.id))
        .where(whereClause),
      // Paginated leaderboard with calculated rank and conditional anonymity (only active users)
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
          schoolIdentifier: course.schoolIdentifier,
          lastSyncedAt: user.lastSyncedAt
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

  // --- Emulate sql RANK function in js ---
  let studentRank = null;
  let currentRank = 1;
  let prevMark = null;
  let skip = 0;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_, markObj] of sortedMarks.entries()) {
    const mark = Number(markObj.overallMark);

    if (prevMark !== null && mark === prevMark) {
      skip++;
    } else {
      currentRank += skip;
      skip = 1;
    }

    if (markObj.userId === session.user.id) {
      studentRank = currentRank;
      break;
    }

    prevMark = mark;
  }

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
    where: (model, { eq, and }) => and(eq(model.userId, session.user.id))
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
