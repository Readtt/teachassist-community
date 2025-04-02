import "server-only";

import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import { auth } from "./auth";
import { db } from "./db";
import { course, user } from "./db/schema";

export async function getStudentClassAnonymity(code: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

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
  if (!session) throw new Error("Unauthorized");

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
  if (!session) throw new Error("Unauthorized");

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
  if (!session) throw new Error("Unauthorized");

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
    )

  return rankedCourses;
}

export async function getActiveClasses() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const currentDate = new Date().toISOString();

  const courses = await db.query.course.findMany({
    where: (model, { eq, and, sql }) =>
      and(
        eq(model.userId, session.user.id),
        sql`(${model.times}->>'startTime')::timestamptz <= ${currentDate}::timestamptz`,
        sql`(${model.times}->>'endTime')::timestamptz >= ${currentDate}::timestamptz`,
      ),
    with: {
      assignments: true,
    },
  });

  return courses;
}

export async function getPastClasses() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

  const currentDate = new Date().toISOString(); // Ensure correct format

  const courses = await db.query.course.findMany({
    where: (model, { eq, and, sql }) =>
      and(
        eq(model.userId, session.user.id),
        sql`(${model.times}->>'endTime')::timestamptz < ${currentDate}::timestamptz`,
      ),
    with: {
      assignments: true,
    },
  });

  return courses;
}
