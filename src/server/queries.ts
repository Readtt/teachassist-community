import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";
import { course, user } from "./db/schema";

export async function toggleAnonymous(code: string) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session)
      throw new Error("You must be logged in to perform this action");

    const userId = session.user.id;

    const currentDate = new Date().toISOString();
    const [existingCourse] = await db
      .select()
      .from(course)
      .where(
        and(
          eq(course.code, code),
          eq(course.userId, userId),
          sql`(${course.times}->>'startTime')::timestamptz <= ${currentDate}::timestamptz`,
          sql`(${course.times}->>'endTime')::timestamptz >= ${currentDate}::timestamptz`,
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
      .where(
        and(
          eq(course.code, code),
          eq(course.userId, userId),
          sql`(${course.times}->>'startTime')::timestamptz <= ${currentDate}::timestamptz`,
          sql`(${course.times}->>'endTime')::timestamptz >= ${currentDate}::timestamptz`,
        ),
      );

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

export async function getStudentClassAnonymity(code: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    throw new Error("You must be logged in to perform this action.");

  const currentDate = new Date().toISOString();
  const [studentClassAnonymity] = await db
    .select({
      isAnonymous: course.isAnonymous,
    })
    .from(course)
    .where(
      and(
        eq(course.code, code),
        eq(course.userId, session.user.id),
        sql`(${course.times}->>'startTime')::timestamptz <= ${currentDate}::timestamptz`,
        sql`(${course.times}->>'endTime')::timestamptz >= ${currentDate}::timestamptz`,
      ),
    );

  return studentClassAnonymity?.isAnonymous;
}

export async function getClassAverage(code: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    throw new Error("You must be logged in to perform this action.");

  const currentDate = new Date().toISOString();

  // Fetch courses that are currently active and match the given code
  const courses = await db
    .select({ overallMark: course.overallMark })
    .from(course)
    .where(
      and(
        eq(course.code, code),
        sql`(${course.times}->>'startTime')::timestamptz <= ${currentDate}::timestamptz`,
        sql`(${course.times}->>'endTime')::timestamptz >= ${currentDate}::timestamptz`,
      ),
    );

  let totalMarks = 0;
  let totalMarksCount = 0;

  for (const course of courses) {
    if (course.overallMark !== null) {
      totalMarks += Number(course.overallMark);
      totalMarksCount++;
    }
  }

  return totalMarksCount > 0 ? totalMarks / totalMarksCount : null;
}

export async function getStudentClassRanking(code: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    throw new Error("You must be logged in to perform this action.");

  const currentDate = new Date().toISOString();
  const studentRankings = await db
    .select({
      userId: course.userId,
      rank: sql<string>`RANK() OVER (ORDER BY ${course.overallMark} DESC NULLS LAST)`.as(
        "rank",
      ),
    })
    .from(course)
    .where(
      and(
        eq(course.code, code),
        sql`(${course.times}->>'startTime')::timestamptz <= ${currentDate}::timestamptz`,
        sql`(${course.times}->>'endTime')::timestamptz >= ${currentDate}::timestamptz`,
      ),
    );

  const studentClassRanking = studentRankings.find(
    (student) => student.userId === session.user.id,
  );

  return studentClassRanking;
}

export async function getClassRankings(code: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session)
    throw new Error("You must be logged in to perform this action.");

  const currentDate = new Date().toISOString();
  const rankedCourses = await db
    .select({
      id: course.id,
      code: course.code,
      name: course.name,
      overallMark: course.overallMark,
      rank: sql<string>`RANK() OVER (ORDER BY ${course.overallMark} DESC NULLS LAST)`.as(
        "rank",
      ),
      studentId: sql<string>`
        CASE 
          WHEN ${course.isAnonymous} = FALSE AND ${user.id} = ${session.user.id} 
          THEN ${user.studentId} 
          ELSE NULL 
        END`.as("studentId"),
    })
    .from(course)
    .leftJoin(user, eq(course.userId, user.id))
    .where(
      and(
        eq(course.code, code),
        sql`(${course.times}->>'startTime')::timestamptz <= ${currentDate}::timestamptz`,
        sql`(${course.times}->>'endTime')::timestamptz >= ${currentDate}::timestamptz`,
      ),
    );

  return rankedCourses;
}

export async function getUserClasses() {
  const session = await auth.api.getSession({headers: await headers()});
  if (!session)
    throw new Error("You must be logged in to perform this action.");

  const courses = await db.query.course.findMany({
    where: (model, { eq, and }) =>
      and(
        eq(model.userId, session.user.id)
      ),
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