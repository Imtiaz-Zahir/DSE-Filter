import React from "react";
import Link from "next/link";
import {
  Building2,
  TrendingUp,
  ShieldCheck,
  Scale,
  Coins,
  Landmark,
  FileSpreadsheet,
  PieChart,
} from "lucide-react";
import { Stock } from "@/lib/types";
import {
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getLtp,
  getChange,
  getChangePct,
  getPe,
  getDivYieldPct,
  getPbRatio,
  getNav,
  getEps,
  getMarketCap,
  getPaidUpCap,
  getDebt,
  getShariaCompliant,
  getSponsorPct,
  getInstitutePct,
  getForeignPct,
  getPublicPct,
  getListingYear,
  getOperationalStatus,
  get52WeekRange,
} from "@/lib/stocks";
import {
  formatBDT,
  formatPct,
  formatLargeNumber,
  formatNumber,
} from "@/lib/utils";

interface StockSeoSummaryProps {
  stock: Stock;
}

export function StockSeoSummary({ stock }: StockSeoSummaryProps) {
  const code = getTradingCode(stock);
  const name = getCompanyName(stock);
  const sector = getSector(stock);
  const category = getCategory(stock);
  const ltp = getLtp(stock);
  const chgPct = getChangePct(stock);
  const pe = getPe(stock);
  const divYield = getDivYieldPct(stock);
  const pb = getPbRatio(stock);
  const nav = getNav(stock);
  const eps = getEps(stock);
  const mcap = getMarketCap(stock);
  const paidUp = getPaidUpCap(stock);
  const debt = getDebt(stock);
  const isSharia = getShariaCompliant(stock);
  const listingYear = getListingYear(stock);
  const status = getOperationalStatus(stock);
  const range52 = get52WeekRange(stock);
  const sponsor = getSponsorPct(stock);
  const institute = getInstitutePct(stock);
  const foreign = getForeignPct(stock);
  const pub = getPublicPct(stock);

  return (
    <article
      aria-label={`${name} (${code}) Comprehensive Fundamental Analysis`}
      className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-2xs"
    >
      <div className="space-y-2 border-b border-border/60 pb-4">
        <div className="flex items-center gap-2 text-primary">
          <Building2 className="size-5" />
          <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
            About {name} ({code}) — Fundamental Analysis & Market Overview
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {name} (Trading Code: <strong>{code}</strong>) is a public company listed on the{" "}
          <strong>Dhaka Stock Exchange (DSE)</strong> under the <strong>{sector}</strong> industry sector.
          The company currently trades in <strong>Category {category}</strong> with an operational status of{" "}
          <strong className={status === "Active" ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600"}>
            {status}
          </strong>.
          {listingYear ? ` It has been listed on the exchange since ${listingYear}.` : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs text-muted-foreground">
        {/* Pillar 1: Valuation & Price */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <Coins className="size-4 text-primary" />
            <span>Valuation Multiples</span>
          </div>
          <p className="leading-relaxed">
            {code} trades at a Last Traded Price (LTP) of <strong>{formatBDT(ltp)}</strong>.
            {pe !== null ? (
              <>
                {" "}The company carries a Price-to-Earnings (P/E) ratio of <strong>{formatNumber(pe)}x</strong>.
              </>
            ) : (
              " P/E ratio is not available due to loss or non-reporting."
            )}
            {pb !== null && (
              <>
                {" "}Its Price-to-Book (P/B) ratio stands at <strong>{formatNumber(pb)}x</strong> relative to an audited NAVPS of{" "}
                <strong>{formatBDT(nav)}</strong>.
              </>
            )}
            {range52 && (
              <>
                {" "}Over the past 52 weeks, the share price has ranged between <strong>৳{range52[0]}</strong> and{" "}
                <strong>৳{range52[1]}</strong>.
              </>
            )}
          </p>
        </div>

        {/* Pillar 2: Profitability & Yield */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Profitability & Dividend</span>
          </div>
          <p className="leading-relaxed">
            The company recorded an audited Earnings Per Share (EPS) of <strong>{formatBDT(eps)}</strong>.
            {divYield !== null && divYield > 0 ? (
              <>
                {" "}It offers an indicated dividend yield of <strong>{formatNumber(divYield)}%</strong>, making it a potential candidate for income-focused portfolios.
              </>
            ) : (
              " Current dividend yield is zero or not declared for the latest period."
            )}
            {isSharia ? (
              <span className="block mt-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                ✓ Certified DSES Sharia Compliant equity.
              </span>
            ) : (
              <span className="block mt-1.5 text-muted-foreground">
                • Non-Sharia index component.
              </span>
            )}
          </p>
        </div>

        {/* Pillar 3: Capital Structure & Solvency */}
        <div className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-foreground text-sm">
            <Landmark className="size-4 text-blue-600 dark:text-blue-400" />
            <span>Scale & Capital Profile</span>
          </div>
          <p className="leading-relaxed">
            {code} possesses a market capitalization of <strong>{formatLargeNumber(mcap)}</strong> and a paid-up capital of{" "}
            <strong>{formatLargeNumber(paidUp)}</strong>.
            {debt > 0 ? (
              <> Long-term debt is reported at <strong>৳{formatNumber(debt)} Mn</strong>.</>
            ) : (
              <> The company reports <strong>Zero Long-Term Debt</strong>.</>
            )}
            {sponsor !== null && (
              <>
                {" "}Sponsors and Directors control <strong>{sponsor}%</strong> of outstanding equity, while institutional investors hold{" "}
                <strong>{institute}%</strong> and general public holds <strong>{pub}%</strong>.
              </>
            )}
          </p>
        </div>
      </div>

      {/* Quick Action Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs border-t border-border/50">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-muted-foreground">Explore more in sector:</span>
          <Link
            href={`/?sector=${encodeURIComponent(sector)}`}
            className="font-semibold text-primary hover:underline"
          >
            All {sector} Stocks ({code} Peers)
          </Link>
        </div>
        <Link
          href={`/compare?codes=${encodeURIComponent(code)}`}
          className="font-medium text-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          <Scale className="size-3.5" />
          <span>Compare {code} with sector competitors</span>
        </Link>
      </div>
    </article>
  );
}
