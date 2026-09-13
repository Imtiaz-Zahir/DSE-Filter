import React from "react";
import {
  Building,
  DollarSign,
  PieChart,
  Percent,
  Activity,
  Flame,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import { SummaryStats } from "@/lib/types";
import { formatLargeNumber } from "@/lib/utils";

interface MarketGroupStatsBarProps {
  stats: SummaryStats;
  totalMarketCap: number;
}

export function MarketGroupStatsBar({
  stats,
  totalMarketCap,
}: MarketGroupStatsBarProps) {
  const mktCapPct =
    totalMarketCap > 0
      ? ((stats.totalMarketCapMn / totalMarketCap) * 100).toFixed(1)
      : null;

  return (
    <div className="w-full bg-card/60 border-y border-border/60 backdrop-blur-xs">
      <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6 lg:px-8">
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* Card 1: Stocks in Group */}
          <div className="min-w-[135px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Group Securities
              </span>
              <Building className="size-3.5" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold text-foreground">
                {stats.totalStocks}
              </span>
              <span className="text-[10px] text-muted-foreground">Stocks</span>
            </div>
          </div>

          {/* Card 2: Group Market Cap */}
          <div className="min-w-[145px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Group Mkt Cap
              </span>
              <DollarSign className="size-3.5" />
            </div>
            <div className="mt-1">
              <span className="font-heading text-base sm:text-lg font-bold text-foreground truncate block">
                {formatLargeNumber(stats.totalMarketCapMn)}
              </span>
              {mktCapPct && (
                <span className="text-[10px] text-muted-foreground">
                  {mktCapPct}% of DSE Cap
                </span>
              )}
            </div>
          </div>

          {/* Card 3: Avg P/E Ratio */}
          <div className="min-w-[130px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Avg P/E Ratio
              </span>
              <PieChart className="size-3.5" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold text-foreground">
                {stats.averagePe ? `${stats.averagePe}x` : "—"}
              </span>
              <span className="text-[10px] text-muted-foreground">Weighted</span>
            </div>
          </div>

          {/* Card 4: Avg Dividend Yield */}
          <div className="min-w-[130px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Avg Div Yield
              </span>
              <Percent className="size-3.5" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {stats.averageDivYield ? `${stats.averageDivYield}%` : "—"}
              </span>
            </div>
          </div>

          {/* Card 5: Group Breadth */}
          <div className="min-w-[155px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Group Breadth
              </span>
              <Activity className="size-3.5" />
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400" title="Gainers">
                <TrendingUp className="size-3" /> {stats.gainersCount}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400" title="Losers">
                <TrendingDown className="size-3" /> {stats.losersCount}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-muted-foreground" title="Unchanged">{stats.unchangedCount}</span>
            </div>
          </div>

          {/* Card 6: Group Turnover */}
          <div className="min-w-[135px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Group Turnover
              </span>
              <Flame className="size-3.5" />
            </div>
            <div className="mt-1">
              <span className="font-heading text-base sm:text-lg font-bold text-foreground truncate block">
                {stats.totalTurnoverMn > 0 ? `${stats.totalTurnoverMn.toFixed(2)} Mn` : "0 Mn"}
              </span>
              <span className="text-[10px] text-muted-foreground">BDT value</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
