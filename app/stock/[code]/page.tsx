import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchServerStockByCode, fetchServerScreenerStocks } from "@/lib/data-provider";
import {
  getPeerStocks,
  getCompanyName,
  getSector,
  getCategory,
  getLtp,
  getChangePct,
  getPe,
  getDivYieldPct,
} from "@/lib/stocks";
import { formatBDT, formatPct, safeDecodeURIComponent } from "@/lib/utils";
import { StockJsonLd } from "@/components/stock-detail/stock-jsonld";
import { StockHeader } from "@/components/stock-detail/stock-header";
import { PriceRangeGauge } from "@/components/stock-detail/price-range-gauge";
import { ValuationGrid } from "@/components/stock-detail/valuation-grid";
import { ShareholdingCard } from "@/components/stock-detail/shareholding-card";
import { AuditedHistoryTable } from "@/components/stock-detail/audited-history-table";
import { QuarterlyTable } from "@/components/stock-detail/quarterly-table";
import { StockSeoSummary } from "@/components/stock-detail/stock-seo-summary";
import { StockFaq } from "@/components/stock-detail/stock-faq";
import { CorporateInfoCard } from "@/components/stock-detail/corporate-info-card";
import { PeerStocks } from "@/components/stock-detail/peer-stocks";

interface StockPageProps {
  params: Promise<{ code: string }> | { code: string };
}

export async function generateStaticParams() {
  const stocks = await fetchServerScreenerStocks();
  return stocks.map((s) => ({
    code: s.tradingCode,
  }));
}

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const code = safeDecodeURIComponent(resolvedParams.code);
  const stock = await fetchServerStockByCode(code);

  if (!stock) {
    return {
      title: "Stock Not Found",
      description: "The requested Dhaka Stock Exchange (DSE) stock could not be found.",
    };
  }

  const name = getCompanyName(stock);
  const sector = getSector(stock);
  const category = getCategory(stock);
  const ltp = getLtp(stock);
  const chgPct = getChangePct(stock);
  const pe = getPe(stock);
  const divYield = getDivYieldPct(stock);
  const sharia = stock.shariaCompliant ? "DSES Sharia Compliant" : "";

  const title = `${code} Share Price, Financials, P/E & Dividend Yield — ${name} (DSE)`;
  const description = `${name} (${code}) latest LTP: ${formatBDT(ltp)} (${formatPct(chgPct)}). P/E: ${
    pe ? `${pe}x` : "-"
  }, Div Yield: ${
    divYield ? `${divYield}%` : "-"
  }. Sector: ${sector}. Category: ${category}. ${sharia}. View 5-year audited financials, NAVPS, EPS, and shareholding records on DSE Filter.`;

  return {
    title,
    description,
    keywords: [
      code,
      name,
      `${code} share price`,
      `${code} share price today`,
      `${code} DSE`,
      `${code} stock analysis`,
      `${code} dividend yield`,
      `${code} PE ratio`,
      `${code} quarterly EPS`,
      `${code} NAV per share`,
      `${code} shareholding`,
      `${sector} stocks DSE`,
      "Dhaka Stock Exchange",
      "Bangladesh Stock Market",
    ],
    openGraph: {
      title,
      description,
      url: `https://dse-filter.1mt2.workers.dev/stock/${encodeURIComponent(code)}`,
      siteName: "DSE Filter",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://dse-filter.1mt2.workers.dev/stock/${encodeURIComponent(code)}`,
    },
  };
}

export default async function StockDetailPage({ params }: StockPageProps) {
  const resolvedParams = await params;
  const code = safeDecodeURIComponent(resolvedParams.code);
  const stock = await fetchServerStockByCode(code);

  if (!stock) {
    notFound();
  }

  const screenerStocks = await fetchServerScreenerStocks();
  const peers = getPeerStocks(stock, screenerStocks, 4);

  return (
    <main className="min-h-screen bg-background text-foreground pb-16">
      <StockJsonLd stock={stock} />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Company Header */}
        <StockHeader stock={stock} />

        {/* Real-Time Price & 52-Week Range Gauge */}
        <PriceRangeGauge stock={stock} />

        {/* Valuation & Capital Structure Metrics */}
        <ValuationGrid stock={stock} />

        {/* Shareholding Breakdown */}
        <ShareholdingCard stock={stock} />

        {/* Multi-Year Audited Financial History */}
        <AuditedHistoryTable stock={stock} />

        {/* Interim Quarterly EPS */}
        <QuarterlyTable stock={stock} />

        {/* SEO Editorial Summary & In-Depth Fundamental Breakdown */}
        <StockSeoSummary stock={stock} />

        {/* Stock Specific Frequently Asked Questions (FAQ) */}
        <StockFaq stock={stock} />

        {/* Corporate Information, Address & Debt Status */}
        <CorporateInfoCard stock={stock} />

        {/* Sector Peer Companies */}
        <PeerStocks stock={stock} peers={peers} />
      </div>
    </main>
  );
}
