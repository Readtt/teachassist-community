"use server";

import { auth } from "~/server/auth";

export async function doesUserExistByEmail(email: string) {
  const user = await (
    await auth.$context
  ).internalAdapter.findUserByEmail(email);
  
  return user !== null;
}
