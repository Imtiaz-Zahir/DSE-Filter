import React, { Suspense } from "react";
import type { Metadata } from "next";
import { CompareWorkspace } from "@/components/compare/compare-workspace";
import { CompareJsonLd } from "@/components/compare/compare-jsonld";
import { CompareSeoContent } from "@/components/compare/compare-seo-content";

export const metadata: Metadata = {
  title: "DSE Stock Comparison Matrix — Compare Valuation, P/E, EPS, Debt & Yield",
  description:
    "Compare up to 4 Dhaka Stock Exchange (DSE) listed stocks side by side. Analyze P/E ratios, Dividend Yields, NAV per share, EPS, Long-Term Debt, and institutional shareholding across Bangladesh companies.",
  keywords: [
    "DSE stock comparison",
    "compare DSE stocks",
    "Dhaka Stock Exchange peer comparison",
    "DSE stock valuation comparison",
    "Bangladesh stock market comparison",
    "compare P/E ratio DSE",
    "compare dividend yield DSE",
    "DSE shareholding comparison",
  ],
  alternates: {
    canonical: "https://dse-filter.1mt2.workers.dev/compare",
  },
  openGraph: {
    title: "DSE Stock Comparison Matrix — Compare Valuation, P/E, EPS, Debt & Yield",
    description:
      "Compare up to 4 Dhaka Stock Exchange (DSE) listed companies side by side with fundamental financial multiples, balance sheet strength, and shareholding records.",
    url: "https://dse-filter.1mt2.workers.dev/compare",
    siteName: "DSE Filter",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DSE Stock Comparison Matrix — Compare Valuation, P/E, EPS, Debt & Yield",
    description:
      "Compare up to 4 Dhaka Stock Exchange listed companies side by side with fundamental financial multiples.",
  },
};

export default function ComparePage() {
  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <CompareJsonLd />
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        <Suspense
          fallback={
            <div className="min-h-[400px] flex items-center justify-center text-xs text-muted-foreground">
              Loading comparison matrix...
            </div>
          }
        >
          <CompareWorkspace />
        </Suspense>
        <CompareSeoContent />
      </div>
    </main>
  );
}
