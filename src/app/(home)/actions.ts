"use server";

import { revalidatePath } from "next/cache";
import syncTA from "~/server/teachassist";

export async function syncTAFromClient() {
  const sync = await syncTA()

  revalidatePath("/");
  return sync;
}
