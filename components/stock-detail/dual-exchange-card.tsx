import React from "react";
import { ArrowLeftRight, TrendingUp, TrendingDown, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock } from "@/lib/types";
import {
  getLtp,
  getChange,
  getChangePct,
  getVolume,
  getTurnover,
  getCseLtp,
  getCseChange,
  getCseChangePct,
  getCseVolume,
  getCseTurnover,
  getSpreadBdt,
  getSpreadPct,
  isDualListed,
  isDseListed,
  isCseListed,
} from "@/lib/stocks";
import { formatBDT, formatPct, formatLargeNumber, formatInteger, getChangeColorClass } from "@/lib/utils";

interface DualExchangeCardProps {
  stock: Stock;
}

export function DualExchangeCard({ stock }: DualExchangeCardProps) {
  const isDual = isDualListed(stock);
  const isDse = isDseListed(stock);
  const isCse = isCseListed(stock);

  const dseLtp = isDse ? getLtp(stock) : null;
  const dseChg = isDse ? getChange(stock) : null;
  const dseChgPct = isDse ? getChangePct(stock) : null;
  const dseVol = isDse ? getVolume(stock) : null;
  const dseVal = isDse ? getTurnover(stock) : null;

  const cseLtp = getCseLtp(stock);
  const cseChg = getCseChange(stock);
  const cseChgPct = getCseChangePct(stock);
  const cseVol = getCseVolume(stock);
  const cseVal = getCseTurnover(stock);

  const spreadBdt = getSpreadBdt(stock);
  const spreadPct = getSpreadPct(stock);

  return (
    <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <ArrowLeftRight className="size-4.5 text-primary" />
          <CardTitle className="text-base font-semibold">
            {isDual ? "Dual-Exchange Quotes (DSE vs CSE)" : "Exchange Trading Information"}
          </CardTitle>
        </div>
        {isDual && (
          <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20">
            Dual-Listed
          </span>
        )}
      </CardHeader>
      <CardContent className="p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* DSE Board Quote */}
          <div
            className={`rounded-xl p-4 border transition-colors ${
              isDse
                ? "bg-card border-border/70"
                : "bg-muted/10 border-border/30 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                Dhaka Stock Exchange (DSE)
              </span>
              {isDse ? (
                <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  Primary Market
                </span>
              ) : (
                <span className="text-[11px] font-medium text-muted-foreground">
                  Not Listed
                </span>
              )}
            </div>

            {isDse ? (
              <div className="mt-3 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Last Trade Price</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">
                      {formatBDT(dseLtp)}
                    </span>
                    <span className={`ml-2 text-xs font-semibold ${getChangeColorClass(dseChg)}`}>
                      {dseChg !== null && dseChg > 0 ? "+" : ""}
                      {formatBDT(dseChg)} ({formatPct(dseChgPct)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Day's Volume</span>
                  <span className="font-semibold text-foreground">{formatInteger(dseVol)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Day's Turnover</span>
                  <span className="font-semibold text-foreground">
                    {dseVal ? `${formatLargeNumber(dseVal)} BDT` : "-"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                This security is not traded on DSE.
              </div>
            )}
          </div>

          {/* CSE Board Quote */}
          <div
            className={`rounded-xl p-4 border transition-colors ${
              isCse
                ? "bg-card border-border/70"
                : "bg-muted/10 border-border/30 opacity-60"
            }`}
          >
            <div className="flex items-center justify-between pb-2 border-b border-border/50">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
                <Building2 className="size-3.5" />
                Chittagong Stock Exchange (CSE)
              </span>
              {isCse ? (
                <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                  {isDual ? "Secondary Market" : "Active Market"}
                </span>
              ) : (
                <span className="text-[11px] font-medium text-muted-foreground">
                  Not Listed
                </span>
              )}
            </div>

            {isCse ? (
              <div className="mt-3 space-y-2.5">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-muted-foreground">Last Trade Price</span>
                  <div className="text-right">
                    <span className="text-lg font-bold text-foreground">
                      {formatBDT(cseLtp)}
                    </span>
                    <span className={`ml-2 text-xs font-semibold ${getChangeColorClass(cseChg)}`}>
                      {cseChg !== null && cseChg > 0 ? "+" : ""}
                      {formatBDT(cseChg)} ({formatPct(cseChgPct)})
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-border/40">
                  <span className="text-muted-foreground">Day's Volume</span>
                  <span className="font-semibold text-foreground">{formatInteger(cseVol)}</span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Day's Turnover</span>
                  <span className="font-semibold text-foreground">
                    {cseVal ? `${formatLargeNumber(cseVal)} BDT` : "-"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-muted-foreground">
                This security is not traded on CSE.
              </div>
            )}
          </div>
        </div>

        {/* Spread Banner for Dual-Listed Stocks */}
        {isDual && dseLtp !== null && cseLtp !== null && (
          <div className="rounded-xl bg-muted/30 border border-border/60 p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground">Exchange Spread (DSE vs CSE):</span>
              <span className="text-muted-foreground">
                Difference: <strong className="text-foreground">{spreadBdt !== null ? (spreadBdt > 0 ? `+৳${spreadBdt}` : `৳${spreadBdt}`) : "-"}</strong>
              </span>
            </div>
            <div className="font-medium text-muted-foreground">
              Variance: <span className={spreadPct && Math.abs(spreadPct) > 1 ? "text-amber-600 font-semibold" : "text-foreground"}>
                {spreadPct !== null ? (spreadPct > 0 ? `+${spreadPct}%` : `${spreadPct}%`) : "0.00%"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
