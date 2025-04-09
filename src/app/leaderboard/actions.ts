"use server";

import { revalidatePath } from "next/cache";
import { toggleAnonymous } from "~/server/queries";

export async function toggleAnonymousFromClient(code: string) {
  const toggle = await toggleAnonymous(code);
  
  revalidatePath("/");
  return toggle;
}
