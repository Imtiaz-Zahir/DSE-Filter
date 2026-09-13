import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "DSE Filter — Dhaka Stock Exchange Screener & Stock Analytics",
    short_name: "DSE Filter",
    description:
      "Dhaka Stock Exchange (DSE) stock screener, fundamental analysis, and valuation platform for Bangladesh stocks.",
    start_url: "/",
    display: "standalone",
    background_color: "#09090b",
    theme_color: "#09090b",
    categories: ["finance", "business", "productivity"],
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
