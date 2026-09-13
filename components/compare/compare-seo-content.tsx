import React from "react";
import Link from "next/link";
import { Scale, ArrowRight, ShieldCheck, TrendingUp, BarChart, BookOpen } from "lucide-react";

export function CompareSeoContent() {
  const popularComparisons = [
    {
      title: "Telecom & Tech Leaders",
      codes: "GP,BSCCL,AOL",
      description: "Grameenphone vs BSCCL vs AOL — compare revenue scale, margins, and dividend distributions in Bangladesh telecom.",
    },
    {
      title: "Top Pharmaceuticals Blue-Chips",
      codes: "SQURPHARMA,RENATA,BXPHARMA",
      description: "Square Pharma vs Renata vs Beximco Pharma — evaluate pharmaceutical market share, P/E ratios, and export revenues.",
    },
    {
      title: "FMCG & Consumer Giants",
      codes: "BATBC,OLYMPIC,UNILEVERCL",
      description: "British American Tobacco vs Olympic Industries vs Unilever — dividend yields, brand moats, and cash generation.",
    },
    {
      title: "Banking Sector Heavyweights",
      codes: "BRACBANK,EBL,ISLAMIBANK",
      description: "BRAC Bank vs Eastern Bank vs Islami Bank — loan book health, NAVPS, and NPL resistance.",
    },
    {
      title: "Power & Energy Sector",
      codes: "POWERGRID,TITASGAS,MJLBD",
      description: "Power Grid vs Titas Gas vs MJL Bangladesh — cash flow predictability, state involvement, and dividend yields.",
    },
    {
      title: "Engineering & Heavy Industry",
      codes: "WALTONHIL,BSRMSTEEL,BSRMLTD",
      description: "Walton Hi-Tech vs BSRM Steels vs BSRM Ltd — manufacturing capacity, debt loads, and industrial valuation.",
    },
  ];

  return (
    <section aria-label="Fundamental Stock Comparison Insights" className="mt-12 space-y-10">
      {/* 1. Pre-built Popular Comparisons */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary">
            <Scale className="size-5" />
            <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
              Popular DSE Sector Comparisons
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Explore curated peer-group comparisons across leading sectors on the Dhaka Stock Exchange.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularComparisons.map((item, idx) => (
            <Link
              key={idx}
              href={`/compare?codes=${item.codes}`}
              className="rounded-xl border border-border/60 bg-muted/20 p-4 space-y-2 hover:border-primary/50 hover:bg-muted/40 transition-all group block"
            >
              <div className="flex items-center justify-between">
                <span className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                  {item.title}
                </span>
                <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.codes.split(",").map((c) => (
                  <span
                    key={c}
                    className="rounded bg-secondary/80 px-1.5 py-0.5 text-[10px] font-bold text-foreground"
                  >
                    {c}
                  </span>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </Link>
          ))}
        </div>
      </div>

      {/* 2. Educational Guide on Fundamental Comparison */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            How to Compare Stocks on Dhaka Stock Exchange (DSE)
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-muted-foreground leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <TrendingUp className="size-4 text-primary" />
              <span>Valuation & Multiples</span>
            </h3>
            <p>
              Compare Price-to-Earnings (P/E) and Price-to-Book (P/B) ratios across companies in the same sector.
              A company trading at a 10x P/E with high return on equity is generally more attractive than a peer trading at 25x P/E with stagnant EPS.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <BarChart className="size-4 text-emerald-600 dark:text-emerald-400" />
              <span>Solvency & Balance Sheet</span>
            </h3>
            <p>
              Examine Long-Term Debt and Net Asset Value (NAVPS). Zero-debt or low-leverage companies withstand high interest rate environments much better than debt-laden peers on DSE.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-sm text-foreground flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-blue-600 dark:text-blue-400" />
              <span>Shareholding & Governance</span>
            </h3>
            <p>
              Check Sponsor/Director holding (minimum 30% aggregate requirement by BSEC) and Institutional holding percentages. Substantial institutional participation indicates higher analytical scrutiny and governance quality.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
