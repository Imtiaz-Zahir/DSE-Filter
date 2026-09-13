import React from "react";
import Link from "next/link";
import { TrendingUp, ShieldCheck, Info, Layers, ExternalLink } from "lucide-react";
import { getAllSectors } from "@/lib/stocks";

export function Footer() {
  const sectors = getAllSectors();

  return (
    <footer className="border-t border-border/60 bg-muted/20 mt-16 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-5">
          {/* Col 1: Brand & Overview */}
          <div className="space-y-3 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <TrendingUp className="size-4" />
              </div>
              <span className="font-heading text-base font-bold text-foreground">
                DSE<span className="text-primary">Filter</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A comprehensive, mobile-first analytics screener and fundamental research platform
              for stocks listed on the Dhaka Stock Exchange (DSE), featuring DSES Sharia compliance,
              multi-tier valuation metrics, audited histories, and shareholding insights.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <Link
                href="/market/shariah"
                className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
              >
                <ShieldCheck className="size-3 mr-1" /> 125+ DSES Sharia Stocks
              </Link>
            </div>
          </div>

          {/* Col 2: DSE Categories */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              DSE Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/market/category-a" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span className="font-semibold text-foreground">Category A</span>
                  <span className="text-[10px] text-muted-foreground">≥10% Div</span>
                </Link>
              </li>
              <li>
                <Link href="/market/category-b" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span className="font-semibold text-foreground">Category B</span>
                  <span className="text-[10px] text-muted-foreground">&lt;10% Div</span>
                </Link>
              </li>
              <li>
                <Link href="/market/category-n" className="hover:text-primary transition-colors flex items-center justify-between">
                  <span className="font-semibold text-foreground">Category N</span>
                  <span className="text-[10px] text-muted-foreground">New IPOs</span>
                </Link>
              </li>
              <li>
                <Link href="/market/category-z" className="hover:text-destructive transition-colors flex items-center justify-between">
                  <span className="font-semibold text-destructive">Category Z</span>
                  <span className="text-[10px] text-muted-foreground">High Risk</span>
                </Link>
              </li>
              <li className="pt-1 border-t border-border/40">
                <Link href="/market" className="font-medium text-primary hover:underline text-[11px]">
                  All Market Groups &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Market Breadth & Screeners */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Breadth & Screeners
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/market/bullish" className="hover:text-primary transition-colors">
                  Last Session Bullish (Gainers)
                </Link>
              </li>
              <li>
                <Link href="/market/bearish" className="hover:text-primary transition-colors">
                  Last Session Bearish (Losers)
                </Link>
              </li>
              <li>
                <Link href="/market/neutral" className="hover:text-primary transition-colors">
                  Last Session Neutral (Flat)
                </Link>
              </li>
              <li>
                <Link href="/market/operational" className="hover:text-primary transition-colors">
                  Operational Active Companies
                </Link>
              </li>
              <li>
                <Link href="/market/closed" className="hover:text-primary transition-colors">
                  Closed & Suspended Companies
                </Link>
              </li>
              <li>
                <Link href="/market/high-dividend" className="hover:text-primary transition-colors">
                  High Dividend Yield (≥5%)
                </Link>
              </li>
              <li>
                <Link href="/market/low-pe" className="hover:text-primary transition-colors">
                  Low P/E Undervalued (≤15)
                </Link>
              </li>
              <li>
                <Link href="/market/zero-debt" className="hover:text-primary transition-colors">
                  Zero Debt Companies
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Active Sectors */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Active DSE Sectors
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {sectors.map((sec) => {
                const slug = `sector-${sec.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
                return (
                  <Link
                    key={sec}
                    href={`/market/${slug}`}
                    className="rounded bg-secondary/80 px-2 py-0.5 text-[11px] text-foreground/80 hover:bg-primary/10 hover:text-primary transition-colors"
                  >
                    {sec}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Col 5: Resources & Tools */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Resources & Tools
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/compare" className="hover:text-foreground transition-colors font-medium">
                  Stock Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/market/mutual-funds" className="hover:text-foreground transition-colors">
                  Closed-End Mutual Funds
                </Link>
              </li>
              <li>
                <Link href="/market/large-cap" className="hover:text-foreground transition-colors">
                  Large Cap Blue-Chips
                </Link>
              </li>
              <li>
                <Link href="/market/top-turnover" className="hover:text-foreground transition-colors">
                  Top Turnover Leaders
                </Link>
              </li>
              <li>
                <a
                  href="https://www.dsebd.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <span>Dhaka Stock Exchange</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://sec.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <span>BSEC Official</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground/80">
          <p className="flex items-center justify-center gap-1 mb-2">
            <Info className="size-3.5 shrink-0 inline text-muted-foreground" />
            <span>
              Disclaimer: Data presented on this platform is for research, analytical, and informational purposes only. It does not constitute financial or investment advice.
            </span>
          </p>
          <p>
            &copy; {new Date().getFullYear()} DSE Filter. Data sourced from public DSE disclosures. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
