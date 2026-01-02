import { logger, schedules, timeout } from "@trigger.dev/sdk/v3";
import { eq, isNull, lt, or } from "drizzle-orm";
import pLimit from "p-limit";
import { decryptPassword } from "~/lib/crypto";
import { db } from "~/server/db";
import { user } from "~/server/db/schema";
import syncTA from "~/server/teachassist";

export const syncTask = schedules.task({
  id: "sync-all-users-task",
  cron: "0 1 * * *", // Every day at 1 AM
  maxDuration: timeout.None,
  run: async (payload, { ctx }) => {
    if (ctx.environment.type == "PRODUCTION") {
      logger.log("🔁 Starting sync-all-users cron job", {
        triggeredAt: payload.timestamp.toISOString(),
        timezone: payload.timezone,
      });

      const cutoffDate = new Date(Date.now() - 27 * 24 * 60 * 60 * 1000); // 27 days ago

      let users;
      try {
        users = await db
          .select()
          .from(user)
          .where((fields) =>
            or(
              isNull(fields.lastSyncedAt),
              lt(fields.lastSyncedAt, cutoffDate),
            ),
          );

        logger.log(`👥 Users fetched from DB: ${users.length}`);
      } catch (err) {
        logger.error("❌ Failed to fetch users from DB", { error: err });
        return;
      }

      const validUsers = users.filter((u) => u.studentId && u.taPassword);
      const skippedCount = users.length - validUsers.length;

      let successCount = 0;
      let errorCount = 0;

      const limit = pLimit(8);

      await Promise.allSettled(
        validUsers.map((u) =>
          limit(async () => {
            try {
              logger.log(`🔄 Syncing student: ${u.studentId}`);
              const decryptedPassword = decryptPassword(u.taPassword);
              await syncTA({
                bypassLimit: true,
                manualDecryptedCredentials: {
                  studentId: u.studentId,
                  password: decryptedPassword,
                },
              });
              logger.log(`✅ Synced successfully: ${u.studentId}`);
              successCount++;
            } catch (error) {
              const message =
                error instanceof Error ? error.message : String(error);

                if(message === "Invalid student number or password") {
                  logger.error(`❌ Unable to login for ${u.studentId}... setting status to inactive`, {
                    error: message,
                  });
        
                  try {
                    await db.update(user).set({
                      isActive: false,
                    }).where(eq(user.id, u.id));
                    logger.log(`🗑️ Set user ${u.studentId} (${u.id}) to inactive`);
                  } catch (deleteErr) {
                    logger.error(`❌ Failed to set user ${u.studentId} to inactive`, {
                      error: deleteErr instanceof Error
                        ? deleteErr.message
                        : String(deleteErr),
                    });
                  }
                } else {
                  logger.error(`❌ Sync failed for ${u.studentId}`, {
                    error: message,
                  });
                  errorCount++;
                }
            }
          }),
        ),
      );

      logger.log("📦 Sync batch complete", {
        total: users.length,
        attempted: validUsers.length,
        success: successCount,
        skipped: skippedCount,
        failed: errorCount,
      });
    }
  },
});
