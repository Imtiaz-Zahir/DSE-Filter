import React from "react";
import { Users, PieChart, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock, ShareHolding } from "@/lib/types";
import { getLatestShareholding } from "@/lib/stocks";
import { formatNumber } from "@/lib/utils";

interface ShareholdingCardProps {
  stock: Stock;
}

export function ShareholdingCard({ stock }: ShareholdingCardProps) {
  const latestHolding = getLatestShareholding(stock);
  const allHoldings = stock.shareHoldings || [];

  if (!latestHolding && allHoldings.length === 0) {
    return (
      <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
        <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
          <CardTitle className="text-base font-semibold">Shareholding Pattern</CardTitle>
        </CardHeader>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          No shareholding data disclosed for this company.
        </CardContent>
      </Card>
    );
  }

  const sponsor = latestHolding?.sponsorDirectorPct ?? 0;
  const institute = latestHolding?.institutePct ?? 0;
  const foreign = latestHolding?.foreignPct ?? 0;
  const publicPct = latestHolding?.publicPct ?? 0;
  const govt = latestHolding?.govtPct ?? 0;

  const categories = [
    { label: "Sponsor / Director", pct: sponsor, color: "bg-blue-600 dark:bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
    { label: "Institutions", pct: institute, color: "bg-emerald-600 dark:bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    { label: "Foreign", pct: foreign, color: "bg-purple-600 dark:bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
    { label: "General Public", pct: publicPct, color: "bg-amber-500 dark:bg-amber-400", text: "text-amber-600 dark:text-amber-400" },
    { label: "Government", pct: govt, color: "bg-rose-600 dark:bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  ];

  return (
    <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
          <div className="flex items-center gap-2">
            <Users className="size-4.5 text-primary" />
            <CardTitle className="text-base font-semibold">Shareholding Distribution</CardTitle>
          </div>
          {latestHolding?.asOfDate && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3" /> As of {latestHolding.asOfDate}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Stacked Progress Bar */}
        <div className="space-y-2">
          <div className="h-4 w-full rounded-lg overflow-hidden flex bg-muted/50 p-0.5 border border-border/40">
            {categories.map((cat, idx) => {
              if (cat.pct <= 0) return null;
              return (
                <div
                  key={idx}
                  className={`${cat.color} h-full transition-all duration-300 first:rounded-l-md last:rounded-r-md`}
                  style={{ width: `${cat.pct}%` }}
                  title={`${cat.label}: ${cat.pct}%`}
                />
              );
            })}
          </div>

          {/* Legend and Percentage Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 pt-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="rounded-xl bg-card border border-border/60 p-2.5">
                <div className="flex items-center gap-1.5">
                  <span className={`size-2.5 rounded-full shrink-0 ${cat.color}`} />
                  <span className="text-[11px] font-medium text-muted-foreground truncate">
                    {cat.label}
                  </span>
                </div>
                <div className="mt-1 font-heading text-base font-bold text-foreground">
                  {cat.pct > 0 ? `${cat.pct}%` : "0.00%"}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Timeline Table (if multiple disclosure records available) */}
        {allHoldings.length > 1 && (
          <div className="space-y-2 pt-2 border-t border-border/50">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Shareholding Trend & Historical Disclosures
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground">
                    <th className="py-2 pr-3 font-medium">Reporting Period / Date</th>
                    <th className="py-2 px-2 text-right font-medium">Sponsor %</th>
                    <th className="py-2 px-2 text-right font-medium">Govt %</th>
                    <th className="py-2 px-2 text-right font-medium">Institute %</th>
                    <th className="py-2 px-2 text-right font-medium">Foreign %</th>
                    <th className="py-2 pl-2 text-right font-medium">Public %</th>
                  </tr>
                </thead>
                <tbody>
                  {allHoldings.map((h, i) => (
                    <tr key={i} className="border-b border-border/30 hover:bg-muted/30">
                      <td className="py-2 pr-3 font-medium text-foreground">
                        {h.asOfDate || h.period || `Period ${i + 1}`}
                      </td>
                      <td className="py-2 px-2 text-right font-semibold text-foreground">
                        {h.sponsorDirectorPct !== null ? `${h.sponsorDirectorPct}%` : "-"}
                      </td>
                      <td className="py-2 px-2 text-right text-muted-foreground">
                        {h.govtPct !== null ? `${h.govtPct}%` : "-"}
                      </td>
                      <td className="py-2 px-2 text-right text-muted-foreground">
                        {h.institutePct !== null ? `${h.institutePct}%` : "-"}
                      </td>
                      <td className="py-2 px-2 text-right text-muted-foreground">
                        {h.foreignPct !== null ? `${h.foreignPct}%` : "-"}
                      </td>
                      <td className="py-2 pl-2 text-right font-medium text-foreground">
                        {h.publicPct !== null ? `${h.publicPct}%` : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
