"use client";

import React from "react";
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Building,
  DollarSign,
  PieChart,
  Percent,
  Activity,
} from "lucide-react";
import { SummaryStats } from "@/lib/types";
import { formatLargeNumber} from "@/lib/utils";

interface SummaryStatsBarProps {
  stats: SummaryStats;
  filteredCount: number;
}

export function SummaryStatsBar({ stats, filteredCount }: SummaryStatsBarProps) {
  const isFiltered = filteredCount !== stats.totalStocks;

  return (
    <div className="w-full bg-card/60 border-y border-border/60 backdrop-blur-xs">
      <div className="mx-auto max-w-7xl py-3 px-3 sm:px-6">
        {/* Mobile Horizontal Scrollable / Desktop Grid */}
        <div className="flex sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-3 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {/* Item 1: Listed Stocks */}
          <div className="min-w-[135px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                {isFiltered ? "Filtered" : "Listed Stocks"}
              </span>
              <Building className="size-3.5" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold text-foreground">
                {filteredCount}
              </span>
              {isFiltered && (
                <span className="text-[10px] text-muted-foreground">
                  of {stats.totalStocks}
                </span>
              )}
            </div>
          </div>

          {/* Item 2: DSES Sharia Compliant */}
          <div className="min-w-[135px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                DSES Sharia
              </span>
              <ShieldCheck className="size-3.5" />
            </div>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="font-heading text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {stats.shariaCount}
              </span>
              <span className="text-[10px] text-muted-foreground">
                ({((stats.shariaCount / stats.totalStocks) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>

          {/* Item 3: Market Cap */}
          <div className="min-w-[135px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Total Mkt Cap
              </span>
              <DollarSign className="size-3.5" />
            </div>
            <div className="mt-1">
              <span className="font-heading text-base sm:text-lg font-bold text-foreground truncate block">
                {formatLargeNumber(stats.totalMarketCapMn)}
              </span>
            </div>
          </div>

          {/* Item 4: Market Breadth (Adv / Dec) */}
          <div className="min-w-[155px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Market Breadth
              </span>
              <Activity className="size-3.5" />
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs font-semibold">
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="size-3" /> {stats.gainersCount}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
                <TrendingDown className="size-3" /> {stats.losersCount}
              </span>
              <span className="text-muted-foreground/60">•</span>
              <span className="text-muted-foreground">{stats.unchangedCount}</span>
            </div>
          </div>

          {/* Item 5: Avg P/E */}
          <div className="min-w-[125px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Avg P/E
              </span>
              <PieChart className="size-3.5" />
            </div>
            <div className="mt-1">
              <span className="font-heading text-lg font-bold text-foreground">
                {stats.averagePe !== null ? `${stats.averagePe}x` : "-"}
              </span>
            </div>
          </div>

          {/* Item 6: Avg Dividend Yield */}
          <div className="min-w-[135px] shrink-0 rounded-lg bg-background/80 p-2.5 border border-border/50 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-[11px] font-medium uppercase tracking-wider">
                Avg Div Yield
              </span>
              <Percent className="size-3.5" />
            </div>
            <div className="mt-1">
              <span className="font-heading text-lg font-bold text-foreground">
                {stats.averageDivYield !== null ? `${stats.averageDivYield}%` : "-"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
