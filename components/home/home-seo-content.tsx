import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  ShieldCheck,
  Scale,
  BarChart3,
  Coins,
  Building,
  HelpCircle,
  CheckCircle2,
  Layers,
  ArrowRight,
} from "lucide-react";
import { AnyStock } from "@/lib/types";
import {
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getLtp,
  getChangePct,
  getPe,
  getDivYieldPct,
  getMarketCap,
  getAllSectors,
} from "@/lib/stocks";
import { formatBDT, formatPct, formatLargeNumber, getCategoryBadgeVariant } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface HomeSeoContentProps {
  stocks: AnyStock[];
}

export function HomeSeoContent({ stocks }: HomeSeoContentProps) {
  const sectors = getAllSectors();

  // Highlight Top Market Cap stocks
  const topMarketCapStocks = [...stocks]
    .filter((s) => (getMarketCap(s) || 0) > 0)
    .sort((a, b) => (getMarketCap(b) || 0) - (getMarketCap(a) || 0))
    .slice(0, 8);

  // Highlight High Dividend Yield stocks (Category A with valid dividend)
  const topDividendStocks = [...stocks]
    .filter((s) => getCategory(s) === "A" && (getDivYieldPct(s) || 0) > 4)
    .sort((a, b) => (getDivYieldPct(b) || 0) - (getDivYieldPct(a) || 0))
    .slice(0, 8);

  // Highlight Top DSES Sharia stocks
  const topShariaStocks = [...stocks]
    .filter((s) => s.shariaCompliant && (getMarketCap(s) || 0) > 0)
    .sort((a, b) => (getMarketCap(b) || 0) - (getMarketCap(a) || 0))
    .slice(0, 8);

  // Highlight Low P/E Value stocks (Category A, positive P/E between 3 and 15)
  const lowPeStocks = [...stocks]
    .filter((s) => {
      const pe = getPe(s);
      return getCategory(s) === "A" && pe !== null && pe > 3 && pe < 15;
    })
    .sort((a, b) => (getPe(a) || 999) - (getPe(b) || 999))
    .slice(0, 8);

  const faqs = [
    {
      q: "What is DSE Filter and how does it help Bangladesh stock investors?",
      a: "DSE Filter is an advanced, mobile-first stock screening and fundamental analytics platform for all 395+ companies listed on the Dhaka Stock Exchange (DSE). It allows investors to filter stocks by real-time valuation metrics, multi-year audited balance sheets, quarterly EPS trends, DSES Sharia index compliance, and institutional shareholding.",
    },
    {
      q: "What are the Dhaka Stock Exchange (DSE) Market Categories (A, B, N, Z)?",
      a: "DSE categorizes listed equity instruments based on corporate governance and dividend declarations: Category A represents fundamentally strong companies holding regular AGMs and declaring 10% or higher dividends. Category B represents companies declaring less than 10% dividend. Category N represents newly listed IPO companies. Category Z comprises high-risk companies with irregular AGMs, operational shutdowns, or consecutive loss-making years.",
    },
    {
      q: "How to screen for high dividend yield stocks on DSE?",
      a: "You can use DSE Filter's 'High Dividend' one-click preset or set the Dividend Yield filter slider to 5%+ or 8%+. This filters companies that consistently distribute attractive cash dividends relative to their current market price (LTP).",
    },
    {
      q: "What is DSES Sharia Index on Dhaka Stock Exchange?",
      a: "The DSES (DSE Sharia Index) is a benchmark index comprising Sharia-compliant companies on the Dhaka Stock Exchange. These companies meet strict Islamic financial screening criteria, including low conventional interest-bearing debt, non-interest revenue models, and ethical business operations.",
    },
    {
      q: "How do P/E Ratio and Price-to-Book (P/B) help evaluate Bangladesh stocks?",
      a: "The Price-to-Earnings (P/E) ratio indicates how much investors are paying per taka of annual net profit. A lower P/E (e.g. below 15 in Category A) often indicates an undervalued stock. Price-to-Book (P/B) compares share price to Net Asset Value (NAVPS); a P/B below 1.0 means the stock is trading below its underlying book value.",
    },
    {
      q: "Can I compare multiple DSE stocks side by side?",
      a: "Yes! Use the 'Compare' tray at the bottom of the table or visit our Stock Comparison Matrix (/compare) to inspect up to 4 DSE companies side-by-side across valuation, debt, revenue scale, quarterly performance, and sponsor holdings.",
    },
  ];

  return (
    <section aria-label="Dhaka Stock Exchange Analysis and Guides" className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-12 space-y-12">
      {/* 1. SEO Editorial Heading & Quick Insights */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="max-w-3xl space-y-3">
          <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-primary/30 text-primary">
            Fundamental Research Guide
          </Badge>
          <h2 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
            Dhaka Stock Exchange (DSE) Live Stock Screener & Fundamental Analytics
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            DSE Filter provides institutional-grade fundamental stock screening for the Bangladesh capital market.
            Analyze <strong>395+ listed companies</strong> across <strong>20+ sectors</strong> with multi-year audited financial records,
            quarterly EPS progression, DSES Sharia compliance checks, and comprehensive valuation ratios including
            P/E, P/B, NAVPS, and Dividend Yield.
          </p>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Coins className="size-5" />
              <h3 className="font-semibold text-sm text-foreground">Valuation Multiples</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Screen by trailing P/E, forward multiples, Price-to-Book (P/B), and audited Net Asset Value (NAVPS).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="size-5" />
              <h3 className="font-semibold text-sm text-foreground">125+ DSES Sharia Stocks</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              One-click filter for all Sharia-compliant securities approved under Islamic investment guidelines.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <BarChart3 className="size-5" />
              <h3 className="font-semibold text-sm text-foreground">Multi-Year Audited Data</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              5-year audited financial statements, historical cash/stock dividends, and interim quarterly EPS.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-muted/40 border border-border/50 space-y-2">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
              <Scale className="size-5" />
              <h3 className="font-semibold text-sm text-foreground">Side-by-Side Matrix</h3>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Compare balance sheet strength, debt load, and shareholding patterns across up to 4 peer companies.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Curated Stock Lists (Blue-Chips, Dividends, Sharia, Low P/E) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3">
          <div>
            <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
              Market Leaders & Curated DSE Stock Lists
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Instant access to top performing stocks categorized by valuation, yield, and market scale.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* List 1: Top Market Cap */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Building className="size-4 text-primary" />
                <span>Top Market Cap</span>
              </h3>
              <Link href="/?preset=blue-chip" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {topMarketCapStocks.map((stock) => {
                const code = getTradingCode(stock);
                const ltp = getLtp(stock);
                const mcap = getMarketCap(stock);
                return (
                  <Link
                    key={code}
                    href={`/stock/${encodeURIComponent(code)}`}
                    className="flex items-center justify-between py-2 text-xs hover:bg-muted/40 px-1 rounded transition-colors group"
                  >
                    <div>
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {code}
                      </span>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                        {getCompanyName(stock)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">{formatBDT(ltp)}</div>
                      <div className="text-[10px] text-muted-foreground">{formatLargeNumber(mcap)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* List 2: Highest Dividend Yield */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <Coins className="size-4 text-emerald-600 dark:text-emerald-400" />
                <span>Top Dividend Yield</span>
              </h3>
              <Link href="/?preset=high-dividend" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {topDividendStocks.map((stock) => {
                const code = getTradingCode(stock);
                const ltp = getLtp(stock);
                const yld = getDivYieldPct(stock);
                return (
                  <Link
                    key={code}
                    href={`/stock/${encodeURIComponent(code)}`}
                    className="flex items-center justify-between py-2 text-xs hover:bg-muted/40 px-1 rounded transition-colors group"
                  >
                    <div>
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {code}
                      </span>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                        {getCompanyName(stock)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-emerald-600 dark:text-emerald-400">
                        {yld ? `${yld}% Yield` : "-"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{formatBDT(ltp)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* List 3: DSES Sharia Compliant */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <ShieldCheck className="size-4 text-emerald-500" />
                <span>DSES Sharia Stocks</span>
              </h3>
              <Link href="/?preset=sharia" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {topShariaStocks.map((stock) => {
                const code = getTradingCode(stock);
                const ltp = getLtp(stock);
                const sector = getSector(stock);
                return (
                  <Link
                    key={code}
                    href={`/stock/${encodeURIComponent(code)}`}
                    className="flex items-center justify-between py-2 text-xs hover:bg-muted/40 px-1 rounded transition-colors group"
                  >
                    <div>
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {code}
                      </span>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                        {sector}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-foreground">{formatBDT(ltp)}</div>
                      <span className="inline-block text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1 rounded">
                        DSES
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* List 4: Low P/E Value */}
          <div className="rounded-xl border border-border/70 bg-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-xs uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <TrendingUp className="size-4 text-blue-500" />
                <span>Low P/E Value</span>
              </h3>
              <Link href="/?preset=low-pe" className="text-[11px] text-primary hover:underline flex items-center gap-0.5">
                <span>View all</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>
            <div className="divide-y divide-border/40">
              {lowPeStocks.map((stock) => {
                const code = getTradingCode(stock);
                const ltp = getLtp(stock);
                const pe = getPe(stock);
                return (
                  <Link
                    key={code}
                    href={`/stock/${encodeURIComponent(code)}`}
                    className="flex items-center justify-between py-2 text-xs hover:bg-muted/40 px-1 rounded transition-colors group"
                  >
                    <div>
                      <span className="font-bold text-foreground group-hover:text-primary transition-colors">
                        {code}
                      </span>
                      <div className="text-[10px] text-muted-foreground truncate max-w-[110px]">
                        {getCompanyName(stock)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600 dark:text-blue-400">
                        {pe ? `${pe}x P/E` : "-"}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{formatBDT(ltp)}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 3. DSE Industry Sectors Directory */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="size-5 text-primary" />
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Explore Dhaka Stock Exchange by Industry Sector
          </h2>
        </div>
        <p className="text-xs text-muted-foreground">
          Browse companies across 20+ specialized industries on the Dhaka Stock Exchange. Click any sector to filter:
        </p>
        <div className="flex flex-wrap gap-2 pt-2">
          {sectors.map((sec) => {
            const count = stocks.filter((s) => getSector(s) === sec).length;
            return (
              <Link
                key={sec}
                href={`/?sector=${encodeURIComponent(sec)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/60 bg-muted/30 px-3 py-1.5 text-xs font-medium text-foreground hover:bg-primary/10 hover:border-primary/40 hover:text-primary transition-all"
              >
                <span>{sec}</span>
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground">
                  {count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 4. Frequently Asked Questions (FAQ) Section */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-primary" />
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            Frequently Asked Questions — Dhaka Stock Exchange Screening & Investing
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2"
            >
              <h3 className="font-semibold text-xs sm:text-sm text-foreground flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 5. Complete DSE Listed Stocks A-Z Index (100% Crawlable Internal Links) */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-sm sm:text-base font-bold text-foreground uppercase tracking-wide">
            Complete DSE Listed Stocks Directory (A — Z)
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">
            {stocks.length} Companies
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Direct links to individual stock pages with price history, audited financials, and valuation multiples:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-1.5 pt-2 max-h-64 overflow-y-auto pr-1">
          {stocks.map((stock) => {
            const code = getTradingCode(stock);
            return (
              <Link
                key={code}
                href={`/stock/${encodeURIComponent(code)}`}
                className="text-[11px] font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 px-2 py-1 rounded transition-colors truncate"
                title={`${code} - ${getCompanyName(stock)}`}
              >
                {code}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
