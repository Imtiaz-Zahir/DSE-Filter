import React, { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { fetchServerScreenerStocks } from "@/lib/data-provider";
import {
  getAllMarketGroups,
  getMarketGroup,
} from "@/lib/market-groups";
import { calculateSummaryStats } from "@/lib/stocks";
import { safeDecodeURIComponent } from "@/lib/utils";
import { MarketGroupHeader } from "@/components/market/market-group-header";
import { MarketGroupStatsBar } from "@/components/market/market-group-stats-bar";
import { MarketGroupSeoContent } from "@/components/market/market-group-seo-content";
import { MarketGroupJsonLd } from "@/components/market/market-group-jsonld";
import { RelatedGroups } from "@/components/market/related-groups";
import { ScreenerWorkspace } from "@/components/screener/screener-workspace";
import { ScreenerStockList } from "@/components/screener/screener-skeleton";
import { Button } from "@/components/ui/button";
import { AlertCircle, SlidersHorizontal } from "lucide-react";

interface MarketGroupPageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateStaticParams() {
  const groups = getAllMarketGroups();
  return groups.map((g) => ({
    slug: g.slug,
  }));
}

export async function generateMetadata({ params }: MarketGroupPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const slug = safeDecodeURIComponent(resolvedParams.slug);
  const group = getMarketGroup(slug);

  if (!group) {
    return {
      title: "Market Group Not Found",
      description: "The requested Dhaka Stock Exchange (DSE) stock group could not be found.",
    };
  }

  const baseUrl = "https://dse-filter.1mt2.workers.dev";
  const url = `${baseUrl}/market/${group.slug}`;

  return {
    title: group.metaTitle,
    description: group.metaDescription,
    keywords: group.keywords,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: group.metaTitle,
      description: group.metaDescription,
      url,
      siteName: "DSE Filter",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: group.metaTitle,
      description: group.metaDescription,
    },
  };
}

export default async function MarketGroupDetailPage({ params }: MarketGroupPageProps) {
  const resolvedParams = await params;
  const slug = safeDecodeURIComponent(resolvedParams.slug);
  const group = getMarketGroup(slug);

  if (!group) {
    notFound();
  }

  const allStocks = await fetchServerScreenerStocks();
  const groupStocks = allStocks.filter(group.filterFn);
  const groupStats = calculateSummaryStats(groupStocks);
  const totalMarketStats = calculateSummaryStats(allStocks);

  const tableStocks = groupStocks.map((stock) => ({
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
      {/* Schema.org Structured Data */}
      <MarketGroupJsonLd group={group} stocks={groupStocks} />

      {/* Hero Header */}
      <MarketGroupHeader
        group={group}
        stockCount={groupStocks.length}
        totalMarketStocks={allStocks.length}
      />

      {/* KPI Stats Bar */}
      <MarketGroupStatsBar
        stats={groupStats}
        totalMarketCap={totalMarketStats.totalMarketCapMn}
      />

      {/* Interactive Screener Table & Grid */}
      <div className="mt-4">
        {groupStocks.length > 0 ? (
          <Suspense fallback={<ScreenerStockList stocks={tableStocks} />}>
            <ScreenerWorkspace initialStocks={groupStocks} showStatsBar={false} />
          </Suspense>
        ) : (
          <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-12">
            <div className="rounded-2xl border border-border/70 bg-card p-8 text-center space-y-4 max-w-md mx-auto shadow-2xs">
              <div className="flex size-12 items-center justify-center rounded-full bg-muted mx-auto text-muted-foreground">
                <AlertCircle className="size-6" />
              </div>
              <div className="space-y-1.5">
                <h2 className="font-heading text-base font-bold text-foreground">
                  No Active Securities in {group.shortTitle}
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  There are currently no listed securities active in this specific category during the latest trading session.
                </p>
              </div>
              <div className="pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs gap-1.5"
                  render={<Link href="/market" />}
                >
                  <SlidersHorizontal className="size-3.5" />
                  <span>Browse Other Market Groups</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Editorial Content & Criteria Checklist & FAQs */}
      <MarketGroupSeoContent group={group} />

      {/* Related Market Groups */}
      <RelatedGroups currentGroup={group} />
    </main>
  );
}
