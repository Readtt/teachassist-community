import makeFetchCookie from "fetch-cookie";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { type LoginResponse, loginSchema } from "~/common/types/login";
import { tryCatch } from "~/server/helpers";
import fetch from "node-fetch";

export async function POST(req: Request) {
  const fetchCookie = makeFetchCookie(
    fetch,
    new makeFetchCookie.toughCookie.CookieJar(),
    false,
  );

  try {
    const bodyRaw = (await req.json()) as z.infer<typeof loginSchema>;
    const body = loginSchema.parse(bodyRaw);
    const { studentId, password } = body;

    const URL = `https://ta.yrdsb.ca/live/index.php?username=${studentId}&password=${password}&submit=Login&subject_id=0`;
    
    try {
      const res = await fetch("https://www.google.com");
      return new Response(`Google Status: ${res.status}`);
    } catch (error) {
      console.log(error);
    }

    const loginResponse = await tryCatch(
      fetchCookie(URL, {
        method: "POST",
        body: "credentials",
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
          "Content-Type": "application/x-www-form-urlencoded",
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
  } catch (e) {
    console.log(e);
    return NextResponse.json<LoginResponse>(
      { error: "Invalid student number or password" },
      { status: 401 },
    );
  }
}
