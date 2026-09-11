import { MetadataRoute } from "next";
import { getScreenerStocksSync } from "@/lib/data-provider";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://dse-filter.1mt2.workers.dev";
  const stocks = getScreenerStocksSync();
  const codes = stocks.map((s) => s.tradingCode).filter(Boolean);

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
