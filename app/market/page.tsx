import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Percent,
  PieChart,
  Gem,
  Shield,
  Users,
  Landmark,
  Crown,
  Boxes,
  Flame,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  HeartPulse,
  Laptop,
  Wrench,
  Zap,
  Shirt,
  Utensils,
  Building,
  Layers,
  Radio,
  Sparkle,
  Footprints,
  FileText,
  Plane,
  Trees,
  ArrowRight,
  Home,
  ChevronRight,
  Search,
} from "lucide-react";
import { fetchServerScreenerStocks } from "@/lib/data-provider";
import { getAllMarketGroups, MarketGroupDef, GroupCategoryType } from "@/lib/market-groups";
import { Badge } from "@/components/ui/badge";
import { formatLargeNumber } from "@/lib/utils";
import { AnyStock } from "@/lib/types";

export const metadata: Metadata = {
  title: "DSE Market Groups & Stock Collections — Dhaka Stock Exchange Categories & Screeners",
  description:
    "Explore 30+ curated Dhaka Stock Exchange (DSE) stock groups: DSES Sharia compliant, Category A/B/Z/N stocks, last session bullish gainers & bearish losers, active operational vs closed companies, high dividend yield, low P/E, and all 19 industry sectors.",
  keywords: [
    "DSE stock categories",
    "Dhaka Stock Exchange groups",
    "DSES Sharia stocks list",
    "DSE Category A stocks",
    "DSE Category B stocks",
    "DSE Category Z stocks",
    "DSE Category N stocks",
    "DSE bullish stocks today",
    "DSE bearish stocks today",
    "operational companies DSE",
    "closed companies DSE",
    "DSE high dividend stocks",
    "DSE low PE stocks",
    "DSE sectors list",
  ],
  alternates: {
    canonical: "https://dse-filter.1mt2.workers.dev/market",
  },
  openGraph: {
    title: "DSE Market Groups & Stock Collections — Dhaka Stock Exchange Categories & Screeners",
    description:
      "Browse Bangladesh stocks by Category A, B, Z, N, DSES Shariah status, daily market breadth (gainers/losers/neutral), operational status, valuation multiples, and industry sectors.",
    url: "https://dse-filter.1mt2.workers.dev/market",
    siteName: "DSE Filter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSE Market Groups & Stock Collections — Dhaka Stock Exchange",
    description:
      "Browse Bangladesh stocks by Category A, B, Z, N, DSES Shariah, daily market breadth, operational status, valuation, and sectors.",
  },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Building2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Percent,
  PieChart,
  Gem,
  Shield,
  Users,
  Landmark,
  Crown,
  Boxes,
  Flame,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  HeartPulse,
  Laptop,
  Wrench,
  Zap,
  Shirt,
  Utensils,
  Building,
  Layers,
  Radio,
  Sparkle,
  Footprints,
  FileText,
  Plane,
  Trees,
};

const SECTION_CONFIGS: {
  categoryType: GroupCategoryType;
  title: string;
  subtitle: string;
  badge: string;
}[] = [
  {
    categoryType: "category",
    title: "DSE Market Categories (A, B, Z, N)",
    subtitle:
      "Official Dhaka Stock Exchange equity classifications governed by AGM regularity and dividend declaration track records.",
    badge: "Official Governance",
  },
  {
    categoryType: "shariah",
    title: "Islamic / Shariah Compliance",
    subtitle:
      "Securities approved under the DSES Shariah Index meeting strict Islamic financial leverage and business ethics guidelines.",
    badge: "Halal Investing",
  },
  {
    categoryType: "breadth",
    title: "Market Breadth & Momentum (Last Session)",
    subtitle:
      "Real-time breakdown of price movement leaders: advance gainers, decline pullbacks, and neutral unchanged issues.",
    badge: "Session Momentum",
  },
  {
    categoryType: "status",
    title: "Operational & Business Status",
    subtitle:
      "Distinction between actively manufacturing and commercial businesses versus non-operational, closed, or suspended entities.",
    badge: "Business Health",
  },
  {
    categoryType: "valuation",
    title: "Valuation & Balance Sheet Screeners",
    subtitle:
      "Fundamental multi-metric screens for high cash yield, discounted earnings multiples, below book value, and zero debt.",
    badge: "Fundamental Value",
  },
  {
    categoryType: "ownership",
    title: "Shareholding & Ownership Patterns",
    subtitle:
      "Screen companies by sponsor-promoter commitment and institutional portfolio backing.",
    badge: "Ownership Structure",
  },
  {
    categoryType: "activity",
    title: "Trading Liquidity & Price Action",
    subtitle:
      "Track highest turnover liquidity, active share volumes, and 52-week price range breakouts/bargains.",
    badge: "Liquidity & Trends",
  },
  {
    categoryType: "instrument",
    title: "Instrument Types",
    subtitle:
      "Listed investment vehicles including closed-end mutual funds managed by licensed asset managers.",
    badge: "Instruments",
  },
  {
    categoryType: "sector",
    title: "DSE Industry Sectors (19 Sectors)",
    subtitle:
      "Complete directory of all 19 Dhaka Stock Exchange industry sectors and specialized industry verticals.",
    badge: "Industry Sectors",
  },
];

export default async function MarketHubPage() {
  const allStocks = await fetchServerScreenerStocks();
  const allGroups = getAllMarketGroups();

  // Pre-calculate stock counts and total market caps for every group
  const groupStatsMap = new Map<string, { count: number; totalCap: number }>();

  for (const group of allGroups) {
    const matching = allStocks.filter(group.filterFn);
    const totalCap = matching.reduce((acc, s) => acc + (s.marketCap || 0), 0);
    groupStatsMap.set(group.slug, { count: matching.length, totalCap });
  }

  // Hub JSON-LD Schema
  const baseUrl = "https://dse-filter.1mt2.workers.dev";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "DSE Market Groups & Stock Collections — Dhaka Stock Exchange",
    description:
      "Curated directory of Dhaka Stock Exchange market categories, DSES Sharia stocks, session gainers/losers, active vs closed companies, and 19 sectors.",
    url: `${baseUrl}/market`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: allGroups.length,
      itemListElement: allGroups.map((g, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: g.title,
        url: `${baseUrl}/market/${g.slug}`,
      })),
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Hero Banner */}
      <div className="w-full bg-gradient-to-b from-muted/40 via-background to-background border-b border-border/60">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 pb-8 sm:pt-6 sm:pb-10 space-y-4">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
              <Home className="size-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="size-3 text-muted-foreground/60" />
            <span className="font-semibold text-foreground">Market Groups</span>
          </nav>

          <div className="space-y-3 max-w-3xl">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-primary/30 text-primary font-semibold">
                Market Directory
              </Badge>
              <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                {allGroups.length} Curated Screeners
              </span>
            </div>

            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Dhaka Stock Exchange (DSE) Market Groups & Collections
            </h1>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Explore <strong>395+ listed Bangladesh companies</strong> organized into strategic market categories,
              Islamic DSES Shariah compliance, daily session momentum (gainers/losers), business operational health,
              fundamental value screeners, and all 19 industry sectors.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Grid Sections */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-8 space-y-12">
        {SECTION_CONFIGS.map((section) => {
          const sectionGroups = allGroups.filter((g) => g.categoryType === section.categoryType);
          if (sectionGroups.length === 0) return null;

          return (
            <section key={section.categoryType} aria-label={section.title} className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-border/60 pb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/30 text-primary">
                      {section.badge}
                    </Badge>
                    <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
                      {section.title}
                    </h2>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {section.subtitle}
                  </p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0 font-medium">
                  {sectionGroups.length} {sectionGroups.length === 1 ? "group" : "groups"}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {sectionGroups.map((group) => {
                  const Icon = ICON_MAP[group.icon] || BarChart3;
                  const stats = groupStatsMap.get(group.slug) || { count: 0, totalCap: 0 };

                  return (
                    <Link
                      key={group.slug}
                      href={`/market/${group.slug}`}
                      className="group flex flex-col justify-between rounded-xl border border-border/70 bg-card p-4 hover:border-primary/50 hover:bg-muted/20 hover:shadow-xs transition-all space-y-3"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between">
                          <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:scale-105 transition-transform">
                            <Icon className="size-4.5" />
                          </div>
                          <span className="inline-flex items-center rounded-md bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                            {stats.count} {stats.count === 1 ? "Stock" : "Stocks"}
                          </span>
                        </div>

                        <div>
                          <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors flex items-center justify-between">
                            <span>{group.shortTitle}</span>
                            <ArrowRight className="size-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                          </h3>
                          <p className="text-[11px] text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                            {group.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] text-muted-foreground">
                        <span>Total Mkt Cap</span>
                        <span className="font-semibold text-foreground">
                          {stats.totalCap > 0 ? formatLargeNumber(stats.totalCap) : "—"}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
