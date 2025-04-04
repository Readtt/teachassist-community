import got from "got";
import { type NextRequest } from "next/server";
import { CookieJar } from "tough-cookie";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url parameter." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const cookieJar = new CookieJar();
    const response = await got(url, { cookieJar });

    return new Response(response.body, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Access-Control-Allow-Origin": "*", // optional: CORS support
      },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
