import React from "react";
import { FileText, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock, AuditedFinancial, HistoricalDividendPE } from "@/lib/types";
import { formatBDT, formatNumber, formatLargeNumber } from "@/lib/utils";

interface AuditedHistoryTableProps {
  stock: Stock;
}

export function AuditedHistoryTable({ stock }: AuditedHistoryTableProps) {
  const audited = stock.auditedFinancials || [];
  const dividends = stock.historicalDividendPE || [];

  if (audited.length === 0 && dividends.length === 0) {
    return (
      <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
        <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
          <CardTitle className="text-base font-semibold">Audited Financial History</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No multi-year audited financial records found.
        </CardContent>
      </Card>
    );
  }

  // Combine by year
  const yearsMap = new Map<
    number,
    {
      year: number;
      financial?: AuditedFinancial;
      dividend?: HistoricalDividendPE;
    }
  >();

  audited.forEach((f) => {
    if (f.year) {
      yearsMap.set(f.year, { ...yearsMap.get(f.year), year: f.year, financial: f });
    }
  });

  dividends.forEach((d) => {
    if (d.year) {
      yearsMap.set(d.year, {
        ...yearsMap.get(d.year),
        year: d.year,
        dividend: d,
      });
    }
  });

  const combined = Array.from(yearsMap.values()).sort((a, b) => b.year - a.year);

  return (
    <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <FileText className="size-4.5 text-primary" />
          <CardTitle className="text-base font-semibold">Audited Financial Performance & Dividend History</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/30 border-b border-border/60">
              <tr className="text-muted-foreground">
                <th className="py-3 px-4 font-semibold">Year</th>
                <th className="py-3 px-3 text-right font-semibold">EPS (BDT)</th>
                <th className="py-3 px-3 text-right font-semibold">NAV / Share (BDT)</th>
                <th className="py-3 px-3 text-right font-semibold">Net Profit (Mn)</th>
                <th className="py-3 px-3 text-right font-semibold">Cash Div %</th>
                <th className="py-3 px-3 text-right font-semibold">Bonus Div %</th>
                <th className="py-3 px-3 text-right font-semibold">Div Yield %</th>
                <th className="py-3 px-4 text-right font-semibold">Historical P/E</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {combined.map((item) => {
                const f = item.financial;
                const d = item.dividend;
                const eps =
                  f?.epsDilutedRestated ??
                  f?.epsBasicRestated ??
                  f?.epsDilutedOriginal ??
                  f?.epsBasicOriginal;
                const nav = f?.navPerShareRestated ?? f?.navPerShareOriginal;
                const netProfit =
                  f?.profitForTheYearMnRestated ?? f?.profitForTheYearMnOriginal ?? f?.tciRestated;
                const cashDiv = d?.cashDividendPct;
                const bonusDiv = d?.bonusDividendPct;
                const yieldPct = d?.dividendYieldPct;
                const histPe = d?.peContinuing ?? d?.peBasicRestated ?? d?.peBasicOriginal;

                return (
                  <tr key={item.year} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-bold text-foreground">
                      {item.year}
                    </td>
                    <td className={`py-3 px-3 text-right font-semibold ${eps !== undefined && eps !== null && eps < 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                      {formatBDT(eps)}
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground font-medium">
                      {formatBDT(nav)}
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground font-medium">
                      {netProfit !== undefined && netProfit !== null ? `৳${formatNumber(netProfit)}M` : "-"}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {cashDiv !== undefined && cashDiv !== null ? `${cashDiv}%` : "-"}
                    </td>
                    <td className="py-3 px-3 text-right text-muted-foreground">
                      {bonusDiv !== undefined && bonusDiv !== null ? `${bonusDiv}%` : "-"}
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                      {yieldPct !== undefined && yieldPct !== null ? `${formatNumber(yieldPct)}%` : "-"}
                    </td>
                    <td className="py-3 px-4 text-right text-muted-foreground font-medium">
                      {histPe !== undefined && histPe !== null ? `${formatNumber(histPe)}x` : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
