"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShieldCheck,
  Columns,
  Check,
  ExternalLink,
} from "lucide-react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
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
import { Stock, SortConfig, SortField } from "@/lib/types";
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
  stocks: Stock[];
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

export function StockTable({
  stocks,
  sortConfig,
  setSortConfig,
  selectedCodes,
  onToggleSelect,
}: StockTableProps) {
  const [visibleColumns, setVisibleColumns] = useState<Record<ColumnKey, boolean>>({
    sector: true,
    category: true,
    ltp: true,
    changePct: true,
    pe: true,
    divYield: true,
    pb: true,
    nav: true,
    eps: true,
    marketCap: true,
    turnover: true,
    debt: false,
    sponsorPct: false,
  });

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => ({ ...prev, [key]: !prev[key] }));
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
      {/* Table Top Controls (Column Customizer) */}
      <div className="flex items-center justify-between px-1">
        <span className="text-xs text-muted-foreground">
          Showing {stocks.length} records • Click header to sort
        </span>
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

      {/* Table Container */}
      <div className="relative rounded-xl border border-border/70 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow className="hover:bg-transparent border-b border-border/80">
                {/* Compare Checkbox */}
                <TableHead className="w-10 px-2.5 text-center">
                  <span className="sr-only">Compare</span>
                </TableHead>

                {/* Sticky Trading Code Column */}
                <TableHead
                  onClick={() => handleSort("tradingCode")}
                  className="sticky left-0 z-20 bg-muted/90 backdrop-blur-xs min-w-[130px] sm:min-w-[160px] cursor-pointer hover:text-foreground font-semibold"
                >
                  <div className="flex items-center">
                    <span>Trading Code</span>
                    {renderSortIcon("tradingCode")}
                  </div>
                </TableHead>

                {/* Sector */}
                {visibleColumns.sector && (
                  <TableHead
                    onClick={() => handleSort("sector")}
                    className="cursor-pointer hover:text-foreground hidden md:table-cell min-w-[120px]"
                  >
                    <div className="flex items-center">
                      <span>Sector</span>
                      {renderSortIcon("sector")}
                    </div>
                  </TableHead>
                )}

                {/* Category */}
                {visibleColumns.category && (
                  <TableHead
                    onClick={() => handleSort("category")}
                    className="cursor-pointer hover:text-foreground text-center w-16"
                  >
                    <div className="flex items-center justify-center">
                      <span>Cat</span>
                      {renderSortIcon("category")}
                    </div>
                  </TableHead>
                )}

                {/* LTP */}
                {visibleColumns.ltp && (
                  <TableHead
                    onClick={() => handleSort("ltp")}
                    className="cursor-pointer hover:text-foreground text-right min-w-[90px]"
                  >
                    <div className="flex items-center justify-end">
                      <span>LTP (৳)</span>
                      {renderSortIcon("ltp")}
                    </div>
                  </TableHead>
                )}

                {/* Change % */}
                {visibleColumns.changePct && (
                  <TableHead
                    onClick={() => handleSort("changePct")}
                    className="cursor-pointer hover:text-foreground text-right min-w-[90px]"
                  >
                    <div className="flex items-center justify-end">
                      <span>Change %</span>
                      {renderSortIcon("changePct")}
                    </div>
                  </TableHead>
                )}

                {/* P/E */}
                {visibleColumns.pe && (
                  <TableHead
                    onClick={() => handleSort("pe")}
                    className="cursor-pointer hover:text-foreground text-right min-w-20"
                  >
                    <div className="flex items-center justify-end">
                      <span>P/E</span>
                      {renderSortIcon("pe")}
                    </div>
                  </TableHead>
                )}

                {/* Div Yield */}
                {visibleColumns.divYield && (
                  <TableHead
                    onClick={() => handleSort("divYield")}
                    className="cursor-pointer hover:text-foreground text-right min-w-20"
                  >
                    <div className="flex items-center justify-end">
                      <span>Yield %</span>
                      {renderSortIcon("divYield")}
                    </div>
                  </TableHead>
                )}

                {/* P/B */}
                {visibleColumns.pb && (
                  <TableHead
                    onClick={() => handleSort("pb")}
                    className="cursor-pointer hover:text-foreground text-right min-w-16"
                  >
                    <div className="flex items-center justify-end">
                      <span>P/B</span>
                      {renderSortIcon("pb")}
                    </div>
                  </TableHead>
                )}

                {/* NAV */}
                {visibleColumns.nav && (
                  <TableHead
                    onClick={() => handleSort("nav")}
                    className="cursor-pointer hover:text-foreground text-right min-w-[85px] hidden sm:table-cell"
                  >
                    <div className="flex items-center justify-end">
                      <span>NAV (৳)</span>
                      {renderSortIcon("nav")}
                    </div>
                  </TableHead>
                )}

                {/* EPS */}
                {visibleColumns.eps && (
                  <TableHead
                    onClick={() => handleSort("eps")}
                    className="cursor-pointer hover:text-foreground text-right min-w-[85px] hidden sm:table-cell"
                  >
                    <div className="flex items-center justify-end">
                      <span>EPS (৳)</span>
                      {renderSortIcon("eps")}
                    </div>
                  </TableHead>
                )}

                {/* Market Cap */}
                {visibleColumns.marketCap && (
                  <TableHead
                    onClick={() => handleSort("marketCap")}
                    className="cursor-pointer hover:text-foreground text-right min-w-[110px]"
                  >
                    <div className="flex items-center justify-end">
                      <span>Mkt Cap</span>
                      {renderSortIcon("marketCap")}
                    </div>
                  </TableHead>
                )}

                {/* Turnover */}
                {visibleColumns.turnover && (
                  <TableHead
                    onClick={() => handleSort("turnover")}
                    className="cursor-pointer hover:text-foreground text-right min-w-[100px] hidden md:table-cell"
                  >
                    <div className="flex items-center justify-end">
                      <span>Turnover</span>
                      {renderSortIcon("turnover")}
                    </div>
                  </TableHead>
                )}

                {/* Long Term Debt */}
                {visibleColumns.debt && (
                  <TableHead
                    onClick={() => handleSort("debt")}
                    className="cursor-pointer hover:text-foreground text-right min-w-[90px]"
                  >
                    <div className="flex items-center justify-end">
                      <span>Debt (Mn)</span>
                      {renderSortIcon("debt")}
                    </div>
                  </TableHead>
                )}

                {/* Sponsor % */}
                {visibleColumns.sponsorPct && (
                  <TableHead
                    onClick={() => handleSort("sponsorPct")}
                    className="cursor-pointer hover:text-foreground text-right min-w-[90px]"
                  >
                    <div className="flex items-center justify-end">
                      <span>Sponsor %</span>
                      {renderSortIcon("sponsorPct")}
                    </div>
                  </TableHead>
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {stocks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={14}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No stocks match the current filter criteria.
                  </TableCell>
                </TableRow>
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
                    <TableRow
                      key={code}
                      className={`group transition-colors hover:bg-muted/40 ${
                        isChecked ? "bg-primary/5 dark:bg-primary/10" : ""
                      }`}
                    >
                      {/* Compare Checkbox */}
                      <TableCell className="px-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => onToggleSelect(code)}
                          aria-label={`Compare ${code}`}
                          className="size-3.5 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        />
                      </TableCell>

                      {/* Sticky Trading Code Column */}
                      <TableCell className="sticky left-0 z-10 bg-card group-hover:bg-muted/60 transition-colors font-medium">
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
                      </TableCell>

                      {/* Sector */}
                      {visibleColumns.sector && (
                        <TableCell className="hidden md:table-cell text-xs text-muted-foreground truncate max-w-[130px]">
                          {sector}
                        </TableCell>
                      )}

                      {/* Category */}
                      {visibleColumns.category && (
                        <TableCell className="text-center">
                          <Badge
                            variant={getCategoryBadgeVariant(cat)}
                            className="text-[10px] px-1.5 py-0 h-4.5 font-bold"
                          >
                            {cat}
                          </Badge>
                        </TableCell>
                      )}

                      {/* LTP */}
                      {visibleColumns.ltp && (
                        <TableCell className="text-right font-semibold text-xs sm:text-sm text-foreground">
                          {formatBDT(ltp)}
                        </TableCell>
                      )}

                      {/* Change % */}
                      {visibleColumns.changePct && (
                        <TableCell
                          className={`text-right font-semibold text-xs ${getChangeColorClass(
                            chg
                          )}`}
                        >
                          {formatPct(chgPct)}
                        </TableCell>
                      )}

                      {/* P/E */}
                      {visibleColumns.pe && (
                        <TableCell className="text-right text-xs font-medium">
                          {pe !== null ? `${formatNumber(pe)}x` : "-"}
                        </TableCell>
                      )}

                      {/* Yield % */}
                      {visibleColumns.divYield && (
                        <TableCell className="text-right text-xs font-medium">
                          {yieldPct !== null ? `${formatNumber(yieldPct)}%` : "-"}
                        </TableCell>
                      )}

                      {/* P/B */}
                      {visibleColumns.pb && (
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {pb !== null ? `${formatNumber(pb)}x` : "-"}
                        </TableCell>
                      )}

                      {/* NAV */}
                      {visibleColumns.nav && (
                        <TableCell className="text-right text-xs text-muted-foreground hidden sm:table-cell">
                          {formatBDT(nav)}
                        </TableCell>
                      )}

                      {/* EPS */}
                      {visibleColumns.eps && (
                        <TableCell
                          className={`text-right text-xs font-medium hidden sm:table-cell ${
                            eps !== null && eps < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          }`}
                        >
                          {formatBDT(eps)}
                        </TableCell>
                      )}

                      {/* Market Cap */}
                      {visibleColumns.marketCap && (
                        <TableCell className="text-right text-xs font-medium text-foreground">
                          {formatLargeNumber(mktCap)}
                        </TableCell>
                      )}

                      {/* Turnover */}
                      {visibleColumns.turnover && (
                        <TableCell className="text-right text-xs text-muted-foreground hidden md:table-cell">
                          {formatLargeNumber(turnover)}
                        </TableCell>
                      )}

                      {/* Debt */}
                      {visibleColumns.debt && (
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {debt > 0 ? `৳${formatNumber(debt)}M` : "Nil"}
                        </TableCell>
                      )}

                      {/* Sponsor % */}
                      {visibleColumns.sponsorPct && (
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {sponsorPct !== null ? `${formatNumber(sponsorPct)}%` : "-"}
                        </TableCell>
                      )}
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
