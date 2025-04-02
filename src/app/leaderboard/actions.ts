"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { auth } from "~/server/auth";
import { db } from "~/server/db";
import { course } from "~/server/db/schema";

export async function toggleAnonymous(code: string) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");

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

  if (!existingCourse) throw new Error("Course not found, or you are not enrolled in the course.");
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

  revalidatePath("/");
  return { isAnonymous: !newAnonymousState };
}
