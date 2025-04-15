// app/sitemap.ts
import { type MetadataRoute } from "next";
import { getBaseURL } from "~/lib/utils"; // Ensure this returns a full URL like https://yourdomain.com

export default function sitemap(): MetadataRoute.Sitemap {
  const baseURL = getBaseURL();

  return [
    {
      url: `${baseURL}/`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseURL}/login`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}