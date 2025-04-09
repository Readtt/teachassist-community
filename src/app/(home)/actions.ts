"use server";

import { revalidatePath } from "next/cache";
import { tryCatch } from "~/server/helpers";
import syncTA from "~/server/teachassist";

export async function syncTAFromClient() {
  const sync = await tryCatch(syncTA());

  revalidatePath("/");
  return sync;
}
