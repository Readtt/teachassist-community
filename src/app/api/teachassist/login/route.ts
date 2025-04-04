// import makeFetchCookie from "fetch-cookie";
import got from "got";
import { NextResponse } from "next/server";
import { CookieJar } from "tough-cookie";
import type { z } from "zod";
import { type LoginResponse, loginSchema } from "~/common/types/login";
import { tryCatch } from "~/server/helpers";

// const fetchCookie = makeFetchCookie(fetch);

export async function POST(req: Request) {
  try {
    const bodyRaw = (await req.json()) as z.infer<typeof loginSchema>;
    const body = loginSchema.parse(bodyRaw);
    const { studentId, password } = body;

    const URL = `https://ta.yrdsb.ca/live/index.php?username=${studentId}&password=${password}&submit=Login&subject_id=0`;

    const cookieJar  = new CookieJar();
    const loginResponse = await tryCatch(
      got(URL, { cookieJar })
      // fetchCookie(URL, {
      //   method: "POST",
      //   body: "credentials",
      // }),
    );

    if (loginResponse.error) {
      console.log(loginResponse.error);
      return NextResponse.json<LoginResponse>(
        { error: "Teachassist is currently unavailable" },
        { status: 503 },
      );
    }

    const html = loginResponse.data?.body;
    if (
      [
        "Invalid Login",
        "Access Denied",
        "Session Expired",
        "YRDSB teachassist login",
      ].some((err) => html.includes(err))
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
