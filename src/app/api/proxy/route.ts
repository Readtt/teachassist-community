const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*", // or specify allowed headers
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function POST(req: Request) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");

  if (!target) {
    return new Response(
      JSON.stringify({ error: "Missing 'url' query parameter" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json", ...CORS_HEADERS },
      },
    );
  }

  try {
    // Clone and clean headers
    const incomingHeaders = new Headers(req.headers);
    incomingHeaders.delete("host");
    incomingHeaders.delete("cookie"); // Optional: remove cookies for safety
    incomingHeaders.delete("cookie2");

    const body = await req.text(); // raw body
    const proxyRes = await fetch(target, {
      method: "POST",
      headers: incomingHeaders,
      body,
      redirect: "manual",
    });

    const proxyHeaders = new Headers(proxyRes.headers);
    const contentType = proxyHeaders.get("content-type") ?? "text/plain";
    const responseBody = await proxyRes.text();

    const responseHeaders = {
      ...CORS_HEADERS,
      "Content-Type": contentType,
    };

    return new Response(responseBody, {
      status: proxyRes.status,
      headers: responseHeaders,
    });
  } catch {
    return new Response(JSON.stringify({ error: "Proxy failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...CORS_HEADERS },
    });
  }
}
