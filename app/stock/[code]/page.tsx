import React from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllStocks,
  getStockByCode,
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getLtp,
  getChange,
  getChangePct,
  getPe,
  getDivYieldPct,
} from "@/lib/stocks";
import { formatBDT, formatPct } from "@/lib/utils";
import { StockJsonLd } from "@/components/stock-detail/stock-jsonld";
import { StockHeader } from "@/components/stock-detail/stock-header";
import { PriceRangeGauge } from "@/components/stock-detail/price-range-gauge";
import { ValuationGrid } from "@/components/stock-detail/valuation-grid";
import { ShareholdingCard } from "@/components/stock-detail/shareholding-card";
import { AuditedHistoryTable } from "@/components/stock-detail/audited-history-table";
import { QuarterlyTable } from "@/components/stock-detail/quarterly-table";
import { CorporateInfoCard } from "@/components/stock-detail/corporate-info-card";
import { PeerStocks } from "@/components/stock-detail/peer-stocks";

interface StockPageProps {
  params: Promise<{ code: string }> | { code: string };
}

export async function generateStaticParams() {
  const stocks = getAllStocks();
  return stocks.map((s) => ({
    code: s.tradingCode,
  }));
}

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const code = decodeURIComponent(resolvedParams.code);
  const stock = getStockByCode(code);

  if (!stock) {
    return {
      title: "Stock Not Found",
      description: "The requested Dhaka Stock Exchange (DSE) stock could not be found.",
    };
  }

  const name = getCompanyName(stock);
  const sector = getSector(stock);
  const ltp = getLtp(stock);
  const chgPct = getChangePct(stock);
  const pe = getPe(stock);
  const divYield = getDivYieldPct(stock);
  const sharia = stock.shariaCompliant ? "DSES Sharia Compliant" : "";

  const title = `${code} - ${name} Share Price, Financials & Valuation`;
  const description = `${name} (${code}) latest LTP: ${formatBDT(ltp)} (${formatPct(chgPct)}). P/E: ${pe ? `${pe}x` : "-"}, Div Yield: ${divYield ? `${divYield}%` : "-"}. Sector: ${sector}. ${sharia}. View audited financials, quarterly EPS & shareholding history.`;

  return {
    title,
    description,
    keywords: [
      code,
      name,
      `${code} share price`,
      `${code} DSE`,
      `${code} stock analysis`,
      `${code} dividend yield`,
      `${code} PE ratio`,
      `${sector} stocks DSE`,
      "Dhaka Stock Exchange",
    ],
    openGraph: {
      title,
      description,
      url: `https://dsefilter.imtiazzahir211.workers.dev/stock/${encodeURIComponent(code)}`,
      siteName: "DSE Filter",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `https://dsefilter.imtiazzahir211.workers.dev/stock/${encodeURIComponent(code)}`,
    },
  };
}

export default async function StockDetailPage({ params }: StockPageProps) {
  const resolvedParams = await params;
  const code = decodeURIComponent(resolvedParams.code);
  const stock = getStockByCode(code);

  if (!stock) {
    notFound();
  }

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

        {/* Corporate Information, Address & Debt Status */}
        <CorporateInfoCard stock={stock} />

        {/* Sector Peer Companies */}
        <PeerStocks stock={stock} />
      </div>
    </main>
  );
}
