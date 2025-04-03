import { and, eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import { db } from "./db";
import { course, user } from "./db/schema";
import { getStudentTAInfo } from "./teachassist";

export default async function syncTA(studentId: string, password: string) {
  try {
    const courses = await getStudentTAInfo(studentId, password);
    const [existingUser] = await db
      .select()
      .from(user)
      .where(eq(user.studentId, studentId));

    if (!existingUser) throw new Error("Could not find student: " + studentId);
    const userId = existingUser.id;

    await db.transaction(async (trx) => {
      for (const c of courses) {
        const [existingCourse] = await trx
          .select()
          .from(course)
          .where(and(eq(course.code, c.code), eq(course.userId, userId), eq(course.room, c.room)));

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

        // for (const a of c.assignments) {
        //   const [existingAssignment] = await trx
        //     .select()
        //     .from(assignment)
        //     .where(
        //       and(
        //         eq(assignment.name, a.name),
        //         eq(assignment.courseId, courseId),
        //       ),
        //     );

        //   const assignmentId = existingAssignment?.id ?? uuidv4();

        //   if (existingAssignment) {
        //     await trx
        //       .update(assignment)
        //       .set({
        //         name: a.name,
        //         feedback: a.feedback,
        //         categories: a.categories,
        //       })
        //       .where(eq(assignment.id, assignmentId));
        //   } else {
        //     await trx.insert(assignment).values({
        //       id: assignmentId,
        //       name: a.name,
        //       feedback: a.feedback,
        //       categories: a.categories,
        //       courseId,
        //     });
        //   }
        // }

        await trx
          .update(user)
          .set({ lastSyncedAt: new Date() })
          .where(eq(user.id, userId));
      }
    });
  } catch (e) {
    console.log(e);
    throw new Error("There was an issue while syncing");
  }
}
