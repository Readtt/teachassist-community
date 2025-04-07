import makeFetchCookie from "fetch-cookie";
import { NextResponse } from "next/server";
import fetch from "node-fetch";
import type { z } from "zod";
import { type LoginResponse, loginSchema } from "~/common/types/login";
import { env } from "~/env";
import { tryCatch } from "~/server/helpers";

const fetchCookie = makeFetchCookie(
  fetch,
  new makeFetchCookie.toughCookie.CookieJar(),
  false,
);

export async function POST(req: Request) {
  try {
    const bodyRaw = (await req.json()) as z.infer<typeof loginSchema>;
    const body = loginSchema.parse(bodyRaw);
    const { studentId, password } = body;

    const URL = `https://ta.yrdsb.ca/live/index.php?username=${studentId}&password=${password}&submit=Login&subject_id=0`;
    const loginResponse = await tryCatch(
      fetchCookie("https://api.brightdata.com/request", {
        method: "POST",
        body: JSON.stringify({
          zone: env.BRIGHT_DATA_ZONE,
          url: URL,
          format: "raw",
          method: "POST",
        }),
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${env.BRIGHT_DATA_TOKEN}`,
        },
      }),
    );

    if (loginResponse.error) {
      console.log(loginResponse.error);
      return NextResponse.json<LoginResponse>(
        { error: "Teachassist is currently unavailable" },
        { status: 503 },
      );
    }

    const html = await tryCatch(loginResponse.data.text());
    if (html.error || !html.data.includes("Student Reports")) {
      return NextResponse.json<LoginResponse>(
        { error: "Invalid student number or password" },
        { status: 401 },
      );
    }

    return NextResponse.json<LoginResponse>({ error: null }, { status: 200 });
  } catch (e) {
    console.log(e);
    return NextResponse.json<LoginResponse>(
      { error: "Invalid student number or password" },
      { status: 401 },
    );
  }
}
