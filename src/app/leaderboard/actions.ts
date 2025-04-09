"use server";

import { revalidatePath } from "next/cache";
import { tryCatch } from "~/server/helpers";
import { toggleAnonymous } from "~/server/queries";

export async function toggleAnonymousFromClient(code: string) {
  const toggle = await tryCatch(toggleAnonymous(code));

  revalidatePath("/");
  return toggle;
}
