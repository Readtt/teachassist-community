import makeFetchCookie from "fetch-cookie";
import { NextResponse } from "next/server";
import type { z } from "zod";
import { type LoginResponse, loginSchema } from "~/common/types/login";
import { tryCatch } from "~/server/helpers";
import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";

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
    const proxy = new HttpsProxyAgent("http://185.226.204.160:5713");

    const loginResponse = await tryCatch(
      fetchCookie(URL, {
        agent: proxy,
        method: "POST",
        body: "credentials",
        headers: {
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "accept-encoding": "gzip, deflate, br, zstd",
          "accept-language": "en-US,en;q=0.9,fr;q=0.8",
          "cache-control": "max-age=0",
          connection: "keep-alive",
          "content-type": "application/x-www-form-urlencoded",
          "sec-ch-ua":
            '"Chromium";v="134", "Not:A-Brand";v="24", "Google Chrome";v="134"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "document",
          "sec-fetch-mode": "navigate",
          "sec-fetch-site": "same-origin",
          "sec-fetch-user": "?1",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36",
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
