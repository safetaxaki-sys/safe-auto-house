import type { MetadataRoute } from "next";

const baseUrl = "https://safeautohouse.com";
const seoRoutes = [
  "enoikiasi-taxi",
  "odigos-taxi",
  "theseis-odigon-taxi",
  "synergasia-odigoi-taxi",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...seoRoutes.map((route) => ({
      url: baseUrl + "/" + route,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    {
      url: baseUrl + "/privacy",
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: baseUrl + "/terms",
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
