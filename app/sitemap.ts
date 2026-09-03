import { MetadataRoute } from "next";
import { getAllTradingCodes } from "@/lib/stocks";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://dsefilter.imtiazzahir211.workers.dev";
  const codes = getAllTradingCodes();

  const stockUrls: MetadataRoute.Sitemap = codes.map((code) => ({
    url: `${baseUrl}/stock/${encodeURIComponent(code)}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...stockUrls,
  ];
}
