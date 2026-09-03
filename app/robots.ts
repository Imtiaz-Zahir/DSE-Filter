import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: "https://dsefilter.imtiazzahir211.workers.dev/sitemap.xml",
  };
}
