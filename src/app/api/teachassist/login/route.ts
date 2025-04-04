import makeFetchCookie from "fetch-cookie";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { type LoginResponse, loginSchema } from "~/common/types/login";
import { tryCatch } from "~/server/helpers";

const fetchCookie = makeFetchCookie(fetch);

export async function POST(req: Request) {
  try {
    const bodyRaw = (await req.json()) as z.infer<typeof loginSchema>;
    const body = loginSchema.parse(bodyRaw);
    const { studentId, password } = body;

    const URL = `https://cors-anywhere.herokuapp.com/https://ta.yrdsb.ca/live/index.php?username=${studentId}&password=${password}&submit=Login&subject_id=0`;

    const loginResponse = await tryCatch(
      fetchCookie(URL, {
        method: "POST",
        body: "credentials",
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
  } catch {
    return NextResponse.json<LoginResponse>(
      { error: "Invalid student number or password" },
      { status: 401 },
    );
  }
}