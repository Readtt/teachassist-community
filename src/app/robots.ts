// app/robots.ts
import { type MetadataRoute } from "next";
import { getBaseURL } from "~/lib/utils";

export default function robots(): MetadataRoute.Robots {
  const baseURL = getBaseURL();

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/login"],
      disallow: ["/leaderboard", "/updates", "/api"],
    },
    sitemap: `${baseURL}/sitemap.xml`,
  };
}
