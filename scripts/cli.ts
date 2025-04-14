import { Command } from "commander";
import "dotenv/config";
import fetch from "node-fetch";
import { z } from "zod";

// === Zod Schemas for API responses ===
const TaskListResponseSchema = z.object({
  scripts: z.array(z.string()),
});

const TaskPostResponseSchema = z.object({
  message: z.string(),
});

// === Constants ===
const DEV_TASKS_URL = process.env.BETTER_AUTH_URL + "/api/dev-tasks";
if (!DEV_TASKS_URL) {
  throw new Error("Missing BETTER_AUTH_URL in environment variables.");
}

const program = new Command();

// === Commands ===

// 🔹 List tasks
program
  .command("list")
  .description("List all available dev tasks")
  .action(async () => {
    try {
      const res = await fetch(`${DEV_TASKS_URL}?list=true`, {method:"POST"});
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      const parsed = TaskListResponseSchema.parse(json);

      console.log("Available tasks:");
      parsed.scripts.forEach((script) => console.log(`- ${script}`));
    } catch (err) {
      console.error("❌ Failed to fetch task list:", (err as Error).message);
    }
  });

// 🔹 Run task
program
  .command("run")
  .argument("<task>", "The task to run")
  .description("Run a dev task by name")
  .action(async (task: string) => {
    try {
      const res = await fetch(DEV_TASKS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      const parsed = TaskPostResponseSchema.parse(json);

      console.log(`✅ ${parsed.message}`);
    } catch (err) {
      console.error(`❌ Failed to run task "${task}":`, (err as Error).message);
    }
  });

program.parse(process.argv);