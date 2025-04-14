import { notFound } from "next/navigation";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { decryptPassword } from "~/lib/crypto";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import syncTA from "~/server/teachassist";

const tasks = ["sync-all-users"] as const;
const TaskSchema = z.object({ task: z.enum(tasks) });

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    notFound();
  }

  const list = req.nextUrl.searchParams.get("list");
  if (list === "true") {
    return NextResponse.json({ scripts: tasks });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return new NextResponse("Invalid JSON body", { status: 400 });
  }

  const result = TaskSchema.safeParse(json);
  if (!result.success) {
    return new NextResponse("Invalid request body", { status: 400 });
  }

  const { task } = result.data;

  if (task === "sync-all-users") {
    try {
      await db.transaction(async (tx) => {
        const users = await tx.select().from(user);

        for (const currentUser of users) {
          const { studentId, taPassword } = currentUser;

          if (studentId && taPassword) {
            const decryptedPassword = decryptPassword(taPassword);

            const syncResult = await syncTA({
              bypassLimit: true,
              manualDecryptedCredentials: {
                studentId,
                password: decryptedPassword,
              },
            });

            console.log(`✅ Synced user ${studentId}:`, syncResult);
          } else {
            console.warn(`⚠️ Missing credentials for user ID: ${studentId ?? "unknown"}`);
          }
        }
      });

      return NextResponse.json({ message: "All users synced successfully." });
    } catch (err) {
      console.error("❌ Sync transaction failed:", err);
      return new NextResponse("Failed to sync all users", { status: 500 });
    }
  }

  return new NextResponse("Unknown or unsupported task", { status: 400 });
}