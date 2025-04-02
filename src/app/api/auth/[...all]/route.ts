import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "~/server/auth";
 
export const maxDuration = 30;
export const { POST, GET } = toNextJsHandler(auth);