"use client";

import React from "react";
import Link from "next/link";
import {
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  ChevronRight,
  Plus,
  Check,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AnyStock } from "@/lib/types";
import {
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getShariaCompliant,
  getLtp,
  getChange,
  getChangePct,
  getPe,
  getDivYieldPct,
  getPbRatio,
  getNav,
  getEps,
  getMarketCap,
  getDayHigh,
  getDayLow,
} from "@/lib/stocks";
import {
  formatBDT,
  formatPct,
  formatNumber,
  formatLargeNumber,
  getCategoryBadgeVariant,
  getChangeColorClass,
} from "@/lib/utils";

interface StockGridProps {
  stocks: AnyStock[];
  selectedCodes: string[];
  onToggleSelect: (code: string) => void;
}

export function StockGrid({
  stocks,
  selectedCodes,
  onToggleSelect,
}: StockGridProps) {
  if (stocks.length === 0) {
    return (
      <div className="py-16 text-center text-sm text-muted-foreground rounded-xl border border-dashed border-border/80">
        No stocks match the selected filters.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
      {stocks.map((stock) => {
        const code = getTradingCode(stock);
        const isChecked = selectedCodes.includes(code);
        const ltp = getLtp(stock);
        const chg = getChange(stock);
        const chgPct = getChangePct(stock);
        const pe = getPe(stock);
        const yld = getDivYieldPct(stock);
        const pb = getPbRatio(stock);
        const nav = getNav(stock);
        const eps = getEps(stock);
        const mktCap = getMarketCap(stock);
        const high = getDayHigh(stock);
        const low = getDayLow(stock);
        const cat = getCategory(stock);
        const isSharia = getShariaCompliant(stock);
        const sector = getSector(stock);

        return (
          <Card
            key={code}
            className={`group relative overflow-hidden transition-all duration-150 hover:shadow-md hover:border-primary/40 ${
              isChecked ? "ring-2 ring-primary/60 border-primary/60 bg-primary/5" : ""
            }`}
          >
            <CardContent className="p-3.5 flex flex-col justify-between h-full space-y-3">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <Link
                        href={`/stock/${encodeURIComponent(code)}`}
                        className="font-heading font-bold text-base text-foreground group-hover:text-primary transition-colors"
                      >
                        {code}
                      </Link>
                      <Badge
                        variant={getCategoryBadgeVariant(cat)}
                        className="text-[10px] px-1 py-0 h-4 font-bold"
                      >
                        {cat}
                      </Badge>
                      {isSharia && (
                        <span className="inline-flex items-center rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          DSES
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate mt-0.5" title={stock.companyName || ""}>
                      {stock.companyName}
                    </div>
                    <div className="text-[10px] text-muted-foreground/80 truncate">
                      {sector}
                    </div>
                  </div>

                  {/* Compare Toggle Button */}
                  <button
                    onClick={() => onToggleSelect(code)}
                    title={isChecked ? "Remove from comparison" : "Add to comparison"}
                    className={`size-6 rounded-md border flex items-center justify-center transition-colors ${
                      isChecked
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border/80 text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {isChecked ? <Check className="size-3" /> : <Plus className="size-3" />}
                  </button>
                </div>

                {/* Price & Change Banner */}
                <div className="mt-3 flex items-baseline justify-between rounded-lg bg-muted/40 p-2 border border-border/50">
                  <div>
                    <div className="text-[10px] uppercase font-medium text-muted-foreground">LTP</div>
                    <div className="font-heading font-bold text-base text-foreground">
                      {formatBDT(ltp)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-xs font-bold flex items-center justify-end gap-0.5 ${getChangeColorClass(chg)}`}>
                      {chg !== null && chg > 0 ? (
                        <TrendingUp className="size-3.5" />
                      ) : chg !== null && chg < 0 ? (
                        <TrendingDown className="size-3.5" />
                      ) : null}
                      <span>{formatPct(chgPct)}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {low !== null && high !== null ? `Range: ৳${low} - ৳${high}` : "Range: -"}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Fundamentals Grid */}
              <div className="grid grid-cols-3 gap-1.5 py-1 text-center bg-background rounded-lg border border-border/40 p-2">
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">P/E</div>
                  <div className="text-xs font-semibold text-foreground">
                    {pe !== null ? `${formatNumber(pe)}x` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Yield</div>
                  <div className="text-xs font-semibold text-foreground">
                    {yld !== null ? `${formatNumber(yld)}%` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">P/B</div>
                  <div className="text-xs font-semibold text-foreground">
                    {pb !== null ? `${formatNumber(pb)}x` : "-"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">NAV</div>
                  <div className="text-xs font-semibold text-foreground">
                    {formatBDT(nav, 1)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">EPS</div>
                  <div className={`text-xs font-semibold ${eps !== null && eps < 0 ? "text-rose-600" : "text-foreground"}`}>
                    {formatBDT(eps, 1)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground uppercase">Mkt Cap</div>
                  <div className="text-xs font-semibold text-foreground truncate">
                    {formatLargeNumber(mktCap)}
                  </div>
                </div>
              </div>

              {/* View Company Link */}
              <Link
                href={`/stock/${encodeURIComponent(code)}`}
                className="w-full"
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs h-7.5 justify-between group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all"
                >
                  <span>View Details & Financials</span>
                  <ChevronRight className="size-3.5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
