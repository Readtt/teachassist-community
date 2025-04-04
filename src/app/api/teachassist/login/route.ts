/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { NextResponse } from "next/server";
import type { z } from "zod";
import { type LoginResponse, loginSchema } from "~/common/types/login";
import { tryCatch } from "~/server/helpers";

//@ts-expect-error No type definition
import { fetch as cookieFetch, CookieJar } from "node-fetch-cookies";

import Cors from "cors";

const cors = Cors({
  methods: ["POST"],
});

function runMiddleware(req: any, res: any, fn: any) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }

      return resolve(result);
    });
  });
}

export async function POST(req: Request, res: Response) {
  await runMiddleware(req, res, cors);
  try {
    const bodyRaw = (await req.json()) as z.infer<typeof loginSchema>;
    const body = loginSchema.parse(bodyRaw);
    const { studentId, password } = body;
    const URL = `https://ta.yrdsb.ca/live/index.php?username=${studentId}&password=${password}&submit=Login&subject_id=0`;

    const cookieJar = new CookieJar();

    const loginResponse = await tryCatch(
      cookieFetch(cookieJar, URL, {
        method: "POST",
        body: "credentials",
      }),
    );

    if (loginResponse.error)
      return NextResponse.json<LoginResponse>(
        { error: "Teachassist is currently unavailable" },
        { status: 503 },
      );

    const html = await tryCatch((loginResponse.data as Awaited<ReturnType<typeof fetch>>).text());
    if (
      html.error ||
      [
        "Invalid Login",
        "Access Denied",
        "Session Expired",
        "YRDSB teachassist login",
      ].some((err) => html.data.includes(err))
    ) {
      return NextResponse.json<LoginResponse>(
        { error: "Invalid student number or password" },
        { status: 401 },
      );
    }

    return NextResponse.json<LoginResponse>({ error: null }, { status: 200 });
  } catch {
    return NextResponse.json<LoginResponse>(
      { error: "Invalid student number or password" },
      { status: 401 },
    );
  }
}
