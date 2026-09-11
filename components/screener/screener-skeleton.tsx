import React from "react";
import Link from "next/link";
import { AnyStock } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import {
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getShariaCompliant,
  getLtp,
  getPe,
  getDivYieldPct,
  getPbRatio,
  getNav,
  getEps,
  getMarketCap,
} from "@/lib/stocks";
import {
  formatBDT,
  formatNumber,
  formatLargeNumber,
  getCategoryBadgeVariant,
} from "@/lib/utils";

interface ScreenerStockListProps {
  stocks?: AnyStock[];
}

export function ScreenerStockList({ stocks = [] }: ScreenerStockListProps) {
  return (
    <div className="w-full space-y-4">
      {/* Workspace Table Container */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-2">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-muted-foreground">
            Showing <span className="font-semibold text-foreground">{stocks.length}</span> records
          </span>
        </div>

        <div className="relative rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
          <div className="overflow-auto max-h-[calc(100vh-13.5rem)] sm:max-h-[calc(100vh-14rem)] min-h-[480px] scrollbar-thin">
            <table className="w-full caption-bottom text-sm border-separate border-spacing-0">
              <thead className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md shadow-xs">
                <tr className="hover:bg-transparent">
                  <th className="sticky top-0 left-0 z-30 w-10 min-w-10 max-w-10 bg-muted/95 dark:bg-card/95 backdrop-blur-md px-2.5 text-center border-b border-border/80 h-10 align-middle">
                    <span className="sr-only">Compare</span>
                  </th>

                  <th className="sticky top-0 left-10 z-30 bg-muted/95 dark:bg-card/95 backdrop-blur-md min-w-[130px] sm:min-w-[160px] font-semibold text-left px-2 border-b border-border/80 h-10 align-middle shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.4)]">
                    <span>Trading Code</span>
                  </th>

                  <th className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md hidden md:table-cell min-w-[120px] text-left px-2 border-b border-border/80 h-10 align-middle font-medium">
                    <span>Sector</span>
                  </th>

                  <th className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md text-center w-16 px-2 border-b border-border/80 h-10 align-middle font-medium">
                    <span>Cat</span>
                  </th>

                  <th className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md text-right min-w-[90px] px-2 border-b border-border/80 h-10 align-middle font-medium">
                    <span>LTP (৳)</span>
                  </th>

                  <th className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md text-right min-w-20 px-2 border-b border-border/80 h-10 align-middle font-medium">
                    <span>P/E</span>
                  </th>

                  <th className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md text-right min-w-20 px-2 border-b border-border/80 h-10 align-middle font-medium">
                    <span>Yield %</span>
                  </th>

                  <th className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md text-right min-w-16 px-2 border-b border-border/80 h-10 align-middle font-medium">
                    <span>P/B</span>
                  </th>

                  <th className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md text-right min-w-[85px] hidden sm:table-cell px-2 border-b border-border/80 h-10 align-middle font-medium">
                    <span>NAV (৳)</span>
                  </th>

                  <th className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md text-right min-w-[85px] hidden sm:table-cell px-2 border-b border-border/80 h-10 align-middle font-medium">
                    <span>EPS (৳)</span>
                  </th>

                  <th className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md text-right min-w-[110px] px-2 border-b border-border/80 h-10 align-middle font-medium">
                    <span>Mkt Cap</span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {stocks.map((stock) => {
                  const code = getTradingCode(stock);
                  const ltp = getLtp(stock);
                  const pe = getPe(stock);
                  const yieldPct = getDivYieldPct(stock);
                  const pb = getPbRatio(stock);
                  const nav = getNav(stock);
                  const eps = getEps(stock);
                  const mktCap = getMarketCap(stock);
                  const cat = getCategory(stock);
                  const isSharia = getShariaCompliant(stock);
                  const sector = getSector(stock);

                  return (
                    <tr
                      key={code}
                      className="group transition-colors hover:bg-muted/40"
                    >
                      {/* Compare Checkbox */}
                      <td className="sticky left-0 z-10 w-10 min-w-10 max-w-10 px-2.5 text-center transition-colors border-b border-border/40 bg-card group-hover:bg-muted/70">
                        <input
                          type="checkbox"
                          disabled
                          aria-label={`Compare ${code}`}
                          className="size-3.5 rounded border-border text-primary opacity-40 cursor-default"
                        />
                      </td>

                      {/* Sticky Trading Code Column */}
                      <td className="sticky left-10 z-10 transition-colors font-medium px-2 py-2 border-b border-border/40 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.4)] bg-card group-hover:bg-muted/70">
                        <Link
                          href={`/stock/${encodeURIComponent(code)}`}
                          className="flex flex-col group-hover:text-primary"
                        >
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-foreground group-hover:text-primary text-xs sm:text-sm">
                              {code}
                            </span>
                            {isSharia && (
                              <span
                                title="DSES Sharia Compliant"
                                className="inline-flex items-center rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                              >
                                DSES
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate max-w-[120px] sm:max-w-[150px]">
                            {getCompanyName(stock)}
                          </span>
                        </Link>
                      </td>

                      {/* Sector */}
                      <td className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[130px] px-2 py-2 border-b border-border/40">
                        {sector}
                      </td>

                      {/* Category */}
                      <td className="text-center px-2 py-2 border-b border-border/40">
                        <Badge
                          variant={getCategoryBadgeVariant(cat)}
                          className="text-[10px] px-1.5 py-0 h-4.5 font-bold"
                        >
                          {cat}
                        </Badge>
                      </td>

                      {/* LTP */}
                      <td className="text-right font-semibold text-xs sm:text-sm text-foreground px-2 py-2 border-b border-border/40">
                        {formatBDT(ltp)}
                      </td>

                      {/* P/E */}
                      <td className="text-right text-xs font-medium px-2 py-2 border-b border-border/40">
                        {pe !== null ? `${formatNumber(pe)}x` : "-"}
                      </td>

                      {/* Yield % */}
                      <td className="text-right text-xs font-medium px-2 py-2 border-b border-border/40">
                        {yieldPct !== null ? `${formatNumber(yieldPct)}%` : "-"}
                      </td>

                      {/* P/B */}
                      <td className="text-right text-xs text-muted-foreground px-2 py-2 border-b border-border/40">
                        {pb !== null ? `${formatNumber(pb)}x` : "-"}
                      </td>

                      {/* NAV */}
                      <td className="hidden sm:table-cell text-right text-xs text-muted-foreground px-2 py-2 border-b border-border/40">
                        {formatBDT(nav)}
                      </td>

                      {/* EPS */}
                      <td className="hidden sm:table-cell text-right text-xs text-muted-foreground px-2 py-2 border-b border-border/40">
                        {formatBDT(eps)}
                      </td>

                      {/* Market Cap */}
                      <td className="text-right text-xs font-medium text-muted-foreground px-2 py-2 border-b border-border/40">
                        {formatLargeNumber(mktCap)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// Alias for backward compatibility
export const ScreenerSkeleton = ScreenerStockList;
