"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  Calculator,
  CheckCircle2,
  XCircle,
  Building,
  Info,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock } from "@/lib/types";
import { getShariahAudit, getCompanyName, getTradingCode } from "@/lib/stocks";
import { calculatePurificationAmount, SHARIAH_THRESHOLDS } from "@/lib/shariah-screener";
import { formatBDT } from "@/lib/utils";

interface ShariahComplianceCardProps {
  stock: Stock;
}

export function ShariahComplianceCard({ stock }: ShariahComplianceCardProps) {
  const audit = getShariahAudit(stock);
  const tradingCode = getTradingCode(stock);
  const companyName = getCompanyName(stock);

  // Purification calculator state
  const [dividendInput, setDividendInput] = useState<string>("1000");
  const divAmount = parseFloat(dividendInput) || 0;
  const purificationResult = calculatePurificationAmount(
    divAmount,
    audit.metrics.dividendPurificationPct
  );

  const isCompliant = audit.isCompliant;
  const isIslamicBank = audit.isIslamicFinancialInstitution;

  return (
    <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
      {/* Header */}
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-2 rounded-xl flex items-center justify-center ${
              isCompliant
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
            }`}
          >
            {isCompliant ? (
              <ShieldCheck className="size-5" />
            ) : (
              <ShieldAlert className="size-5" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-base font-semibold">
                Shariah Compliance Audit
              </CardTitle>
              <span
                className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${
                  isCompliant
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30"
                }`}
              >
                {isIslamicBank
                  ? "Islamic Financial (Exempt)"
                  : isCompliant
                  ? "Shariah Compliant"
                  : "Non-Compliant"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Audited according to S&P Dow Jones & Ratings Intelligence DSES Index rules
            </p>
          </div>
        </div>

        <a
          href="https://old.dsebd.org/assets/pdf/DSES.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline font-medium self-start sm:self-auto bg-background/80 px-2.5 py-1 rounded-lg border border-border/60"
        >
          <span>S&P DSES Methodology</span>
          <ExternalLink className="size-3" />
        </a>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Compliance Status Highlight Banner */}
        <div
          className={`rounded-xl p-4 border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            isCompliant
              ? "bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
              : "bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-800/40"
          }`}
        >
          <div className="space-y-1">
            <h4
              className={`text-sm font-semibold flex items-center gap-1.5 ${
                isCompliant
                  ? "text-emerald-800 dark:text-emerald-300"
                  : "text-rose-800 dark:text-rose-300"
              }`}
            >
              {isCompliant ? (
                <CheckCircle2 className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <XCircle className="size-4 shrink-0 text-rose-600 dark:text-rose-400" />
              )}
              <span>
                {isIslamicBank
                  ? `${tradingCode} is a Certified Islamic Financial Institution`
                  : isCompliant
                  ? `${tradingCode} passes S&P DSES Shariah Accounting & Sector Screens`
                  : `${tradingCode} fails Shariah Screening Criteria`}
              </span>
            </h4>
            <p className="text-xs text-muted-foreground">
              {isIslamicBank
                ? "Operates under a dedicated Shariah Supervisory Board with 100% Islamic banking/Takaful products. Exempt from conventional leverage ratios per S&P DSES Rule 21."
                : isCompliant
                ? "Core business operations are permissible, and all debt, cash, and receivables ratios remain well within the 33% and 49% S&P Shariah thresholds."
                : audit.failureReasons[0] || "Breaches the S&P DSES financial ratio or business activity limits."}
            </p>
          </div>
        </div>

        {/* 4 Financial Accounting Ratio Meters (S&P DSES) */}
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
            <Building className="size-3.5" />
            Financial Accounting Ratio Screens (S&P DSES)
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 1. Leverage Ratio */}
            <div className="rounded-xl p-3.5 border border-border/60 bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground flex items-center gap-1">
                  Interest-Bearing Debt / MCap
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (Max {SHARIAH_THRESHOLDS.MAX_DEBT_RATIO_PCT}%)
                  </span>
                </span>
                <span
                  className={`text-xs font-bold ${
                    isIslamicBank
                      ? "text-emerald-600 dark:text-emerald-400"
                      : (audit.metrics.debtToMcapPct ?? 0) <= SHARIAH_THRESHOLDS.MAX_DEBT_RATIO_PCT
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isIslamicBank
                    ? "0.0% (Exempt)"
                    : audit.metrics.debtToMcapPct !== null
                    ? `${audit.metrics.debtToMcapPct}%`
                    : "0.0%"}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isIslamicBank
                      ? "bg-emerald-500 w-[5%]"
                      : (audit.metrics.debtToMcapPct ?? 0) <= SHARIAH_THRESHOLDS.MAX_DEBT_RATIO_PCT
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                  }`}
                  style={{
                    width: isIslamicBank
                      ? "5%"
                      : `${Math.min(100, ((audit.metrics.debtToMcapPct ?? 0) / SHARIAH_THRESHOLDS.MAX_DEBT_RATIO_PCT) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Total interest debt / 36-month moving average market cap.
              </p>
            </div>

            {/* 2. Cash & Interest-Bearing Securities */}
            <div className="rounded-xl p-3.5 border border-border/60 bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground flex items-center gap-1">
                  Cash & ST Securities / MCap
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (Max {SHARIAH_THRESHOLDS.MAX_CASH_RATIO_PCT}%)
                  </span>
                </span>
                <span
                  className={`text-xs font-bold ${
                    isIslamicBank
                      ? "text-emerald-600 dark:text-emerald-400"
                      : (audit.metrics.cashToMcapPct ?? 0) <= SHARIAH_THRESHOLDS.MAX_CASH_RATIO_PCT
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isIslamicBank
                    ? "Compliant (Exempt)"
                    : audit.metrics.cashToMcapPct !== null
                    ? `${audit.metrics.cashToMcapPct}%`
                    : "< 15.0%"}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    (audit.metrics.cashToMcapPct ?? 0) <= SHARIAH_THRESHOLDS.MAX_CASH_RATIO_PCT
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.min(100, ((audit.metrics.cashToMcapPct ?? 10) / SHARIAH_THRESHOLDS.MAX_CASH_RATIO_PCT) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Conventional bank deposits, FDRs & marketable short-term assets.
              </p>
            </div>

            {/* 3. Accounts Receivable Screen */}
            <div className="rounded-xl p-3.5 border border-border/60 bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground flex items-center gap-1">
                  Accounts Receivable / MCap
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (Max {SHARIAH_THRESHOLDS.MAX_RECEIVABLES_RATIO_PCT}%)
                  </span>
                </span>
                <span
                  className={`text-xs font-bold ${
                    isIslamicBank
                      ? "text-emerald-600 dark:text-emerald-400"
                      : (audit.metrics.receivablesToMcapPct ?? 0) <= SHARIAH_THRESHOLDS.MAX_RECEIVABLES_RATIO_PCT
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {isIslamicBank
                    ? "Compliant (Exempt)"
                    : audit.metrics.receivablesToMcapPct !== null
                    ? `${audit.metrics.receivablesToMcapPct}%`
                    : "< 25.0%"}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    (audit.metrics.receivablesToMcapPct ?? 0) <= SHARIAH_THRESHOLDS.MAX_RECEIVABLES_RATIO_PCT
                      ? "bg-emerald-500"
                      : "bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.min(100, ((audit.metrics.receivablesToMcapPct ?? 15) / SHARIAH_THRESHOLDS.MAX_RECEIVABLES_RATIO_PCT) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Trade & non-trade receivables / 36-month average market cap.
              </p>
            </div>

            {/* 4. Non-Permissible Revenue */}
            <div className="rounded-xl p-3.5 border border-border/60 bg-muted/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-foreground flex items-center gap-1">
                  Non-Permissible Revenue
                  <span className="text-[10px] text-muted-foreground font-normal">
                    (Max {SHARIAH_THRESHOLDS.MAX_NON_PERMISSIBLE_REVENUE_PCT}%)
                  </span>
                </span>
                <span
                  className={`text-xs font-bold ${
                    (audit.metrics.nonPermissibleRevPct ?? 0) <= SHARIAH_THRESHOLDS.MAX_NON_PERMISSIBLE_REVENUE_PCT
                      ? "text-emerald-600 dark:text-emerald-400"
                      : "text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {audit.metrics.nonPermissibleRevPct !== null
                    ? `${audit.metrics.nonPermissibleRevPct}%`
                    : "0.0%"}
                </span>
              </div>
              <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${Math.max(5, ((audit.metrics.nonPermissibleRevPct ?? 0) / SHARIAH_THRESHOLDS.MAX_NON_PERMISSIBLE_REVENUE_PCT) * 100)}%`,
                  }}
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Revenue from non-halal activities (excluding interest).
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Dividend Purification Calculator */}
        {isCompliant && (
          <div className="rounded-xl p-4 sm:p-5 border border-emerald-500/20 bg-emerald-500/5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calculator className="size-4 text-emerald-600 dark:text-emerald-400" />
                <h4 className="text-sm font-semibold text-foreground">
                  Dividend Purification Calculator
                </h4>
              </div>
              <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Purification Rate: {audit.metrics.dividendPurificationPct ?? 0}%
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Islamic scholars (S&P Shariah Board & AAOIFI) require purifying minor interest earned from operating cash accounts by donating the non-permissible percentage to charity.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                  Dividend Received (BDT ৳)
                </label>
                <input
                  type="number"
                  value={dividendInput}
                  onChange={(e) => setDividendInput(e.target.value)}
                  placeholder="e.g. 1000"
                  className="w-full text-sm font-medium rounded-lg border border-border bg-background px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </div>

              <div className="rounded-lg p-3 bg-background border border-border/70">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Purification to Donate (Charity)
                </span>
                <span className="text-base font-bold text-amber-600 dark:text-amber-400">
                  {formatBDT(purificationResult.purificationAmountBdt)}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  ({purificationResult.purificationPct}% of dividend)
                </span>
              </div>

              <div className="rounded-lg p-3 bg-background border border-border/70">
                <span className="block text-[11px] font-medium text-muted-foreground">
                  Net Halal Dividend (Retained)
                </span>
                <span className="text-base font-bold text-emerald-600 dark:text-emerald-400">
                  {formatBDT(purificationResult.netHalalDividendBdt)}
                </span>
                <span className="block text-[10px] text-muted-foreground">
                  (100% Cleansed Income)
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Audit Details & Reasons Checklist */}
        <div className="space-y-2 pt-1 border-t border-border/50">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Audit Checklist Details
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {audit.passedScreens.map((screen, idx) => (
              <div key={idx} className="flex items-start gap-2 text-foreground">
                <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span>{screen}</span>
              </div>
            ))}
            {audit.failureReasons.map((reason, idx) => (
              <div key={idx} className="flex items-start gap-2 text-rose-600 dark:text-rose-400 font-medium">
                <XCircle className="size-3.5 shrink-0 mt-0.5" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
