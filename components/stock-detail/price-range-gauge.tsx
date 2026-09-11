import React from "react";
import { TrendingUp, TrendingDown, Clock, Activity, BarChart2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Stock } from "@/lib/types";
import {
  getLtp,
  getChange,
  getChangePct,
  getDayHigh,
  getDayLow,
  getYcp,
  get52WeekRange,
  getVolume,
  getTurnover,
  getTrades,
} from "@/lib/stocks";
import {
  formatBDT,
  formatPct,
  formatNumber,
  formatInteger,
  formatLargeNumber,
  getChangeColorClass,
} from "@/lib/utils";

interface PriceRangeGaugeProps {
  stock: Stock;
}

export function PriceRangeGauge({ stock }: PriceRangeGaugeProps) {
  const ltp = getLtp(stock);
  const chg = getChange(stock);
  const chgPct = getChangePct(stock);
  const ycp = getYcp(stock);
  const dayHigh = getDayHigh(stock);
  const dayLow = getDayLow(stock);
  const range52W = get52WeekRange(stock);
  const volume = getVolume(stock);
  const turnover = getTurnover(stock);
  const trades = getTrades(stock);
  const lastUpdate = stock.marketInformation?.lastUpdate;

  // Calculate 52-week position %
  let range52Pct = 50;
  if (
    range52W &&
    typeof range52W[0] === "number" &&
    typeof range52W[1] === "number" &&
    range52W[1] > range52W[0] &&
    ltp !== null &&
    !isNaN(ltp)
  ) {
    const calc = ((ltp - range52W[0]) / (range52W[1] - range52W[0])) * 100;
    range52Pct = !isNaN(calc) ? Math.max(0, Math.min(100, calc)) : 50;
  }

  // Calculate Day Range position %
  let dayRangePct = 50;
  if (
    dayLow !== null &&
    dayHigh !== null &&
    dayHigh > dayLow &&
    ltp !== null &&
    !isNaN(ltp)
  ) {
    const calc = ((ltp - dayLow) / (dayHigh - dayLow)) * 100;
    dayRangePct = !isNaN(calc) ? Math.max(0, Math.min(100, calc)) : 50;
  }

  return (
    <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
      <CardContent className="p-4 sm:p-6 space-y-6">
        {/* Main Price & Day Summary Bar */}
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 border-b border-border/50 pb-5">
          <div>
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5">
              <span>Last Traded Price</span>
              {lastUpdate && (
                <span className="text-[10px] text-muted-foreground/70 normal-case flex items-center gap-0.5">
                  <Clock className="size-3" /> as of {lastUpdate}
                </span>
              )}
            </div>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="font-heading text-3xl sm:text-4xl font-black text-foreground">
                {formatBDT(ltp)}
              </span>
              <div
                className={`flex items-center gap-1 text-sm sm:text-base font-bold ${getChangeColorClass(
                  chg
                )}`}
              >
                {chg !== null && chg > 0 ? (
                  <TrendingUp className="size-4.5" />
                ) : chg !== null && chg < 0 ? (
                  <TrendingDown className="size-4.5" />
                ) : null}
                <span>{chg !== null && chg > 0 ? `+৳${chg.toFixed(2)}` : chg !== null && chg < 0 ? `-৳${Math.abs(chg).toFixed(2)}` : "৳0.00"}</span>
                <span>({formatPct(chgPct)})</span>
              </div>
            </div>
          </div>

          {/* Quick stats: Volume, Turnover, Trades */}
          <div className="grid grid-cols-3 gap-3 sm:gap-6 text-right sm:text-right">
            <div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">
                Day Volume
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground">
                {formatInteger(volume)}
              </div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">
                Turnover (Mn)
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground">
                {formatLargeNumber(turnover)}
              </div>
            </div>
            <div>
              <div className="text-[10px] sm:text-xs text-muted-foreground uppercase font-medium">
                Day Trades
              </div>
              <div className="text-xs sm:text-sm font-semibold text-foreground">
                {formatInteger(trades)}
              </div>
            </div>
          </div>
        </div>

        {/* Visual Ranges: Day Range & 52-Week Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Day Price Range Gauge */}
          <div className="space-y-2 rounded-xl bg-muted/20 p-3.5 border border-border/50">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">Day&apos;s Range</span>
              <span className="text-muted-foreground font-normal">
                YCP: <strong className="text-foreground">{formatBDT(ycp)}</strong>
              </span>
            </div>

            {/* Range Track */}
            <div className="relative pt-2 pb-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
                <div
                  className="h-full bg-linear-to-r from-emerald-500/70 via-blue-500 to-indigo-500 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
              {/* Pin Indicator */}
              <div
                className="absolute top-1 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${dayRangePct}%` }}
              >
                <div className="size-3.5 rounded-full bg-primary border-2 border-background shadow-md" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>Low: <strong className="text-foreground">{formatBDT(dayLow)}</strong></span>
              <span className="text-primary font-bold text-[11px]">Current: {formatBDT(ltp)}</span>
              <span>High: <strong className="text-foreground">{formatBDT(dayHigh)}</strong></span>
            </div>
          </div>

          {/* 52-Week Price Range Gauge */}
          <div className="space-y-2 rounded-xl bg-muted/20 p-3.5 border border-border/50">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-foreground">52-Week Moving Range</span>
              <span className="text-muted-foreground font-normal">
                Position: <strong className="text-foreground">{range52Pct.toFixed(0)}%</strong> of range
              </span>
            </div>

            {/* Range Track */}
            <div className="relative pt-2 pb-1">
              <div className="h-2 w-full rounded-full bg-muted overflow-hidden relative">
                <div
                  className="h-full bg-linear-to-r from-emerald-500 via-primary to-amber-500 rounded-full"
                  style={{ width: "100%" }}
                />
              </div>
              {/* Pin Indicator */}
              <div
                className="absolute top-1 -translate-x-1/2 flex flex-col items-center"
                style={{ left: `${range52Pct}%` }}
              >
                <div className="size-3.5 rounded-full bg-primary border-2 border-background shadow-md" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
              <span>52W Low: <strong className="text-foreground">{range52W ? formatBDT(range52W[0]) : "-"}</strong></span>
              <span className="text-primary font-bold text-[11px]">LTP: {formatBDT(ltp)}</span>
              <span>52W High: <strong className="text-foreground">{range52W ? formatBDT(range52W[1]) : "-"}</strong></span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
