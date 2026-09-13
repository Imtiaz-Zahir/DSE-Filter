import type { Metadata } from "next";
import { Suspense } from "react";
import { fetchServerScreenerStocks } from "@/lib/data-provider";
import { ScreenerWorkspace } from "@/components/screener/screener-workspace";
import { ScreenerStockList } from "@/components/screener/screener-skeleton";
import { HomeJsonLd } from "@/components/home/home-jsonld";
import { HomeSeoContent } from "@/components/home/home-seo-content";

export const metadata: Metadata = {
  title: "DSE Stock Screener & Fundamental Analytics — Dhaka Stock Exchange",
  description:
    "Free Dhaka Stock Exchange (DSE) stock screener & fundamental analysis tool. Filter 395+ listed Bangladesh stocks by P/E ratio, Dividend Yield, NAVPS, EPS, Market Cap, DSES Sharia index compliance, and multi-year audited financials.",
  keywords: [
    "DSE stock screener",
    "Dhaka Stock Exchange",
    "DSE live share price",
    "DSES Sharia stocks",
    "DSE PE ratio",
    "Bangladesh stock market screener",
    "High dividend yield DSE stocks",
    "DSE category A stocks",
    "DSE stock analysis",
    "Dhaka share price today",
    "best stocks to buy DSE",
    "DSE market capitalisation",
    "DSE fundamental analysis",
  ],
  alternates: {
    canonical: "https://dse-filter.1mt2.workers.dev",
  },
  openGraph: {
    title: "DSE Stock Screener & Fundamental Analytics — Dhaka Stock Exchange",
    description:
      "Real-time Dhaka Stock Exchange stock screener. Filter 395+ Bangladesh listed stocks by valuation multiples, DSES Sharia compliance, audited financials, and shareholding.",
    url: "https://dse-filter.1mt2.workers.dev",
    siteName: "DSE Filter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSE Stock Screener & Fundamental Analytics — Dhaka Stock Exchange",
    description:
      "Real-time Dhaka Stock Exchange screener. Filter Bangladesh stocks by P/E, Dividend Yield, DSES Sharia status, and audited balance sheets.",
  },
};

export default async function HomePage() {
  const allStocks = await fetchServerScreenerStocks();

  const tableStocks = allStocks.map((stock) => ({
    tradingCode: stock.tradingCode,
    companyName: stock.companyName,
    sector: stock.sector,
    category: stock.category,
    shariaCompliant: stock.shariaCompliant,
    ltp: stock.ltp,
    pe: stock.pe,
    divYield: stock.divYield,
    pb: stock.pb,
    nav: stock.nav,
    eps: stock.eps,
    marketCap: stock.marketCap,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <HomeJsonLd />

      <Suspense fallback={<ScreenerStockList stocks={tableStocks} />}>
        <ScreenerWorkspace initialStocks={allStocks} />
      </Suspense>

      <HomeSeoContent stocks={allStocks} />
    </main>
  );
}
