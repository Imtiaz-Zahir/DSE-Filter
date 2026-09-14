"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Columns,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AnyStock, SortConfig, SortField } from "@/lib/types";
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
  getTurnover,
  getDebt,
  getSponsorPct,
} from "@/lib/stocks";
import {
  formatBDT,
  formatPct,
  formatNumber,
  formatLargeNumber,
  getCategoryBadgeVariant,
  getChangeColorClass,
} from "@/lib/utils";

interface StockTableProps {
  stocks: AnyStock[];
  sortConfig: SortConfig;
  setSortConfig: React.Dispatch<React.SetStateAction<SortConfig>>;
  selectedCodes: string[];
  onToggleSelect: (code: string) => void;
}

type ColumnKey =
  | "sector"
  | "category"
  | "ltp"
  | "changePct"
  | "pe"
  | "divYield"
  | "pb"
  | "nav"
  | "eps"
  | "marketCap"
  | "turnover"
  | "debt"
  | "sponsorPct";

const COLUMNS_STORAGE_KEY = "dsefilter_table_columns";

const defaultVisibleColumns: Record<ColumnKey, boolean> = {
  sector: true,
  category: true,
  ltp: true,
  changePct: false,
  pe: true,
  divYield: true,
  pb: true,
  nav: true,
  eps: true,
  marketCap: true,
  turnover: false,
  debt: false,
  sponsorPct: false,
};

export function StockTable({
  stocks,
  sortConfig,
  setSortConfig,
  selectedCodes,
  onToggleSelect,
}: StockTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
        if (saved) {
          return { ...defaultVisibleColumns, ...JSON.parse(saved) };
        }
      } catch {}
    }
    return defaultVisibleColumns;
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  const handleScroll = () => {
    if (containerRef.current) {
      setIsScrolled(containerRef.current.scrollTop > 80);
    }
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSort = (field: SortField) => {
    setSortConfig((prev) => {
      if (prev.field === field) {
        return {
          field,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return {
        field,
        direction: "desc", // Default to descending for numbers
      };
    });
  };

  const renderSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ArrowUpDown className="size-3 text-muted-foreground/50 ml-1 inline" />;
    }
    return sortConfig.direction === "asc" ? (
      <ArrowUp className="size-3 text-primary ml-1 inline" />
    ) : (
      <ArrowDown className="size-3 text-primary ml-1 inline" />
    );
  };

  const columnsList: { key: ColumnKey; label: string }[] = [
    { key: "sector", label: "Sector" },
    { key: "category", label: "Category" },
    { key: "ltp", label: "LTP (৳)" },
    { key: "changePct", label: "Change %" },
    { key: "pe", label: "P/E" },
    { key: "divYield", label: "Div Yield %" },
    { key: "pb", label: "P/B" },
    { key: "nav", label: "NAV (৳)" },
    { key: "eps", label: "EPS (৳)" },
    { key: "marketCap", label: "Market Cap" },
    { key: "turnover", label: "Turnover" },
    { key: "debt", label: "Debt (Mn)" },
    { key: "sponsorPct", label: "Sponsor %" },
  ];

  return (
    <div className="space-y-2">
      {/* Table Top Controls (Column Customizer & Scroll to Top Action) */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          Click column headers to sort
        </span>
        <div className="flex items-center gap-1.5">
          {isScrolled && (
            <Button
              variant="ghost"
              size="xs"
              onClick={scrollToTop}
              className="h-7 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
              title="Scroll to top of table"
            >
              <ArrowUp className="size-3" />
              <span>To Top</span>
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button variant="outline" size="xs" className="h-7 gap-1 text-[11px]">
                  <Columns className="size-3" />
                  <span>Columns</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-48 text-xs">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase">
                  Toggle Columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columnsList.map((col) => (
                  <DropdownMenuItem
                    key={col.key}
                    onClick={() => toggleColumn(col.key)}
                    className="flex items-center justify-between cursor-pointer py-1.5"
                  >
                    <span>{col.label}</span>
                    {visibleColumns[col.key] && <Check className="size-3.5 text-primary" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Table Container with Sticky Scroll Container */}
      <div className="relative rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div
          ref={containerRef}
          onScroll={handleScroll}
          className="overflow-auto max-h-[calc(100vh-13.5rem)] sm:max-h-[calc(100vh-14rem)] min-h-[480px] scrollbar-thin"
        >
          <table className="w-full caption-bottom text-sm border-separate border-spacing-0">
            <thead className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md shadow-xs">
              <tr className="hover:bg-transparent">
                {/* Compare Checkbox Header */}
                <th className="sticky top-0 left-0 z-30 w-10 min-w-10 max-w-10 bg-muted/95 dark:bg-card/95 backdrop-blur-md px-2.5 text-center border-b border-border/80 h-10 align-middle">
                  <span className="sr-only">Compare</span>
                </th>

                {/* Sticky Trading Code Column Header */}
                <th
                  onClick={() => handleSort("tradingCode")}
                  className="sticky top-0 left-10 z-30 bg-muted/95 dark:bg-card/95 backdrop-blur-md min-w-[130px] sm:min-w-[160px] cursor-pointer hover:text-foreground font-semibold text-left px-2 border-b border-border/80 h-10 align-middle shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex items-center">
                    <span>Trading Code</span>
                    {renderSortIcon("tradingCode")}
                  </div>
                </th>

                {/* Sector */}
                {visibleColumns.sector && (
                  <th
                    onClick={() => handleSort("sector")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground hidden md:table-cell min-w-[120px] text-left px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center">
                      <span>Sector</span>
                      {renderSortIcon("sector")}
                    </div>
                  </th>
                )}

                {/* Category */}
                {visibleColumns.category && (
                  <th
                    onClick={() => handleSort("category")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-center w-16 px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-center">
                      <span>Cat</span>
                      {renderSortIcon("category")}
                    </div>
                  </th>
                )}

                {/* LTP */}
                {visibleColumns.ltp && (
                  <th
                    onClick={() => handleSort("ltp")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-[90px] px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>LTP (৳)</span>
                      {renderSortIcon("ltp")}
                    </div>
                  </th>
                )}

                {/* Change % */}
                {visibleColumns.changePct && (
                  <th
                    onClick={() => handleSort("changePct")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-[90px] px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>Change %</span>
                      {renderSortIcon("changePct")}
                    </div>
                  </th>
                )}

                {/* P/E */}
                {visibleColumns.pe && (
                  <th
                    onClick={() => handleSort("pe")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-20 px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>P/E</span>
                      {renderSortIcon("pe")}
                    </div>
                  </th>
                )}

                {/* Div Yield */}
                {visibleColumns.divYield && (
                  <th
                    onClick={() => handleSort("divYield")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-20 px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>Yield %</span>
                      {renderSortIcon("divYield")}
                    </div>
                  </th>
                )}

                {/* P/B */}
                {visibleColumns.pb && (
                  <th
                    onClick={() => handleSort("pb")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-16 px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>P/B</span>
                      {renderSortIcon("pb")}
                    </div>
                  </th>
                )}

                {/* NAV */}
                {visibleColumns.nav && (
                  <th
                    onClick={() => handleSort("nav")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-[85px] hidden sm:table-cell px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>NAV (৳)</span>
                      {renderSortIcon("nav")}
                    </div>
                  </th>
                )}

                {/* EPS */}
                {visibleColumns.eps && (
                  <th
                    onClick={() => handleSort("eps")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-[85px] hidden sm:table-cell px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>EPS (৳)</span>
                      {renderSortIcon("eps")}
                    </div>
                  </th>
                )}

                {/* Market Cap */}
                {visibleColumns.marketCap && (
                  <th
                    onClick={() => handleSort("marketCap")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-[110px] px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>Mkt Cap</span>
                      {renderSortIcon("marketCap")}
                    </div>
                  </th>
                )}

                {/* Turnover */}
                {visibleColumns.turnover && (
                  <th
                    onClick={() => handleSort("turnover")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-[100px] hidden md:table-cell px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>Turnover</span>
                      {renderSortIcon("turnover")}
                    </div>
                  </th>
                )}

                {/* Long Term Debt */}
                {visibleColumns.debt && (
                  <th
                    onClick={() => handleSort("debt")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-[90px] px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>Debt (Mn)</span>
                      {renderSortIcon("debt")}
                    </div>
                  </th>
                )}

                {/* Sponsor % */}
                {visibleColumns.sponsorPct && (
                  <th
                    onClick={() => handleSort("sponsorPct")}
                    className="sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground text-right min-w-[90px] px-2 border-b border-border/80 h-10 align-middle font-medium"
                  >
                    <div className="flex items-center justify-end">
                      <span>Sponsor %</span>
                      {renderSortIcon("sponsorPct")}
                    </div>
                  </th>
                )}
              </tr>
            </thead>

            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td
                    colSpan={14}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No stocks match the current filter criteria.
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => {
                  const code = getTradingCode(stock);
                  const isChecked = selectedCodes.includes(code);
                  const ltp = getLtp(stock);
                  const chg = getChange(stock);
                  const chgPct = getChangePct(stock);
                  const pe = getPe(stock);
                  const yieldPct = getDivYieldPct(stock);
                  const pb = getPbRatio(stock);
                  const nav = getNav(stock);
                  const eps = getEps(stock);
                  const mktCap = getMarketCap(stock);
                  const turnover = getTurnover(stock);
                  const debt = getDebt(stock);
                  const sponsorPct = getSponsorPct(stock);
                  const cat = getCategory(stock);
                  const isSharia = getShariaCompliant(stock);
                  const sector = getSector(stock);

                  return (
                    <tr
                      key={code}
                      className={`group transition-colors hover:bg-muted/40 ${
                        isChecked ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                    >
                      {/* Compare Checkbox */}
                      <td
                        className={`sticky left-0 z-10 w-10 min-w-10 max-w-10 px-2.5 text-center transition-colors border-b border-border/40 ${
                          isChecked
                            ? "bg-primary/10 group-hover:bg-primary/15"
                            : "bg-card group-hover:bg-muted/70"
                        }`}
                      >
                        <input
                          id={`compare-${code}`}
                          name={`compare-${code}`}
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSelect(code)}
                          aria-label={`Compare ${code}`}
                          className="size-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>

                      {/* Sticky Trading Code Column */}
                      <td
                        className={`sticky left-10 z-10 transition-colors font-medium px-2 py-2 border-b border-border/40 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.4)] ${
                          isChecked
                            ? "bg-primary/10 group-hover:bg-primary/15"
                            : "bg-card group-hover:bg-muted/70"
                        }`}
                      >
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
                            {stock.companyName}
                          </span>
                        </Link>
                      </td>

                      {/* Sector */}
                      {visibleColumns.sector && (
                        <td className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[130px] px-2 py-2 border-b border-border/40">
                          {sector}
                        </td>
                      )}

                      {/* Category */}
                      {visibleColumns.category && (
                        <td className="text-center px-2 py-2 border-b border-border/40">
                          <Badge
                            variant={getCategoryBadgeVariant(cat)}
                            className="text-[10px] px-1.5 py-0 h-4.5 font-bold"
                          >
                            {cat}
                          </Badge>
                        </td>
                      )}

                      {/* LTP */}
                      {visibleColumns.ltp && (
                        <td className="text-right font-semibold text-xs sm:text-sm text-foreground px-2 py-2 border-b border-border/40">
                          {formatBDT(ltp)}
                        </td>
                      )}

                      {/* Change % */}
                      {visibleColumns.changePct && (
                        <td
                          className={`text-right font-semibold text-xs px-2 py-2 border-b border-border/40 ${getChangeColorClass(
                            chg
                          )}`}
                        >
                          {formatPct(chgPct)}
                        </td>
                      )}

                      {/* P/E */}
                      {visibleColumns.pe && (
                        <td className="text-right text-xs font-medium px-2 py-2 border-b border-border/40">
                          {pe !== null ? `${formatNumber(pe)}x` : "-"}
                        </td>
                      )}

                      {/* Yield % */}
                      {visibleColumns.divYield && (
                        <td className="text-right text-xs font-medium px-2 py-2 border-b border-border/40">
                          {yieldPct !== null ? `${formatNumber(yieldPct)}%` : "-"}
                        </td>
                      )}

                      {/* P/B */}
                      {visibleColumns.pb && (
                        <td className="text-right text-xs text-muted-foreground px-2 py-2 border-b border-border/40">
                          {pb !== null ? `${formatNumber(pb)}x` : "-"}
                        </td>
                      )}

                      {/* NAV */}
                      {visibleColumns.nav && (
                        <td className="text-right text-xs text-muted-foreground hidden sm:table-cell px-2 py-2 border-b border-border/40">
                          {formatBDT(nav)}
                        </td>
                      )}

                      {/* EPS */}
                      {visibleColumns.eps && (
                        <td
                          className={`text-right text-xs font-medium hidden sm:table-cell px-2 py-2 border-b border-border/40 ${
                            eps !== null && eps < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          }`}
                        >
                          {formatBDT(eps)}
                        </td>
                      )}

                      {/* Market Cap */}
                      {visibleColumns.marketCap && (
                        <td className="text-right text-xs font-medium text-foreground px-2 py-2 border-b border-border/40">
                          {formatLargeNumber(mktCap)}
                        </td>
                      )}

                      {/* Turnover */}
                      {visibleColumns.turnover && (
                        <td className="text-right text-xs text-muted-foreground hidden md:table-cell px-2 py-2 border-b border-border/40">
                          {formatLargeNumber(turnover)}
                        </td>
                      )}

                      {/* Debt */}
                      {visibleColumns.debt && (
                        <td className="text-right text-xs text-muted-foreground px-2 py-2 border-b border-border/40">
                          {debt > 0 ? `৳${formatNumber(debt)}M` : "Nil"}
                        </td>
                      )}

                      {/* Sponsor % */}
                      {visibleColumns.sponsorPct && (
                        <td className="text-right text-xs text-muted-foreground px-2 py-2 border-b border-border/40">
                          {sponsorPct !== null ? `${formatNumber(sponsorPct)}%` : "-"}
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
