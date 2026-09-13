import { MetadataRoute } from "next";
import { getScreenerStocksSync } from "@/lib/data-provider";
import metaData from "@/data/meta.json";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://dse-filter.1mt2.workers.dev";
  const stocks = getScreenerStocksSync();
  const lastUpdated = metaData.lastUpdated ? new Date(metaData.lastUpdated) : new Date();

  const stockUrls: MetadataRoute.Sitemap = stocks
    .filter((s) => Boolean(s.tradingCode))
    .map((stock) => {
      const isCatA = stock.category === "A";
      const isSharia = Boolean(stock.shariaCompliant);
      const isLargeCap = (stock.marketCap || 0) > 10000;

      // Assign strategic SEO crawl priority to major stocks
      let priority = 0.75;
      if (isCatA && (isSharia || isLargeCap)) {
        priority = 0.9;
      } else if (isCatA || isSharia) {
        priority = 0.85;
      }

      return {
        url: `${baseUrl}/stock/${encodeURIComponent(stock.tradingCode)}`,
        lastModified: lastUpdated,
        changeFrequency: "daily" as const,
        priority,
      };
    });

  return [
    {
      url: baseUrl,
      lastModified: lastUpdated,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/compare`,
      lastModified: lastUpdated,
      changeFrequency: "daily",
      priority: 0.85,
    },
    ...stockUrls,
  ];
}
