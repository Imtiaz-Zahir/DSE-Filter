"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, Columns } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { AnyStock, SortConfig, SortField } from "@/lib/types";
import {
  get52WeekRange,
  getAuditedPe,
  getAuthorizedCap,
  getCategory,
  getChange,
  getChangePct,
  getCompanyName,
  getDayHigh,
  getDayLow,
  getDebt,
  getDivYieldPct,
  getEps,
  getForeignPct,
  getFreeFloatCap,
  getGovtPct,
  getInstitutePct,
  getInstrumentType,
  getListingYear,
  getLtp,
  getMarketCap,
  getNav,
  getNetProfitMn,
  getOperationalStatus,
  getPaidUpCap,
  getPbRatio,
  getPe,
  getPublicPct,
  getScripCode,
  getSector,
  getShariaCompliant,
  getSponsorPct,
  getTrades,
  getTradingCode,
  getTurnover,
  getUnauditedPe,
  getVolume,
  getYcp,
} from "@/lib/stocks";
import {
  formatBDT,
  formatInteger,
  formatLargeNumber,
  formatNumber,
  formatPct,
  getCategoryBadgeVariant,
  getChangeColorClass,
  cn,
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
  | "scripCode"
  | "listingYear"
  | "instrumentType"
  | "operationalStatus"
  | "ltp"
  | "changePct"
  | "change"
  | "ycp"
  | "high"
  | "low"
  | "range52WeekLow"
  | "range52WeekHigh"
  | "pe"
  | "auditedPe"
  | "unauditedPe"
  | "divYield"
  | "pb"
  | "nav"
  | "eps"
  | "netProfit"
  | "marketCap"
  | "freeFloatCap"
  | "paidUpCap"
  | "authorizedCap"
  | "turnover"
  | "volume"
  | "trades"
  | "debt"
  | "sponsorPct"
  | "institutePct"
  | "foreignPct"
  | "publicPct"
  | "govtPct";

type ColumnGroup =
  | "Company"
  | "Price"
  | "Valuation"
  | "Financials"
  | "Trading"
  | "Ownership";

interface ColumnDefinition {
  key: ColumnKey;
  label: string;
  header: string;
  group: ColumnGroup;
  sortField: SortField;
  defaultVisible: boolean;
  align: "left" | "center" | "right";
  widthClass: string;
  cellClassName?: string | ((stock: AnyStock) => string);
  render: (stock: AnyStock) => React.ReactNode;
}

function formatRatio(value: number | null): string {
  return value !== null ? `${formatNumber(value)}x` : "-";
}

function formatHolding(value: number | null): string {
  return value !== null ? `${formatNumber(value)}%` : "-";
}

const columnDefinitions: readonly ColumnDefinition[] = [
  {
    key: "sector",
    label: "Sector",
    header: "Sector",
    group: "Company",
    sortField: "sector",
    defaultVisible: true,
    align: "left",
    widthClass: "min-w-[120px]",
    cellClassName: "text-muted-foreground truncate max-w-[130px]",
    render: getSector,
  },
  {
    key: "category",
    label: "Category",
    header: "Cat",
    group: "Company",
    sortField: "category",
    defaultVisible: true,
    align: "center",
    widthClass: "w-16 min-w-16",
    render: (stock) => {
      const category = getCategory(stock);
      return (
        <Badge
          variant={getCategoryBadgeVariant(category)}
          className="text-[10px] px-1.5 py-0 h-4.5 font-bold"
        >
          {category}
        </Badge>
      );
    },
  },
  {
    key: "scripCode",
    label: "Scrip Code",
    header: "Scrip Code",
    group: "Company",
    sortField: "scripCode",
    defaultVisible: false,
    align: "left",
    widthClass: "min-w-[95px]",
    cellClassName: "font-mono text-muted-foreground",
    render: (stock) => getScripCode(stock) || "-",
  },
  {
    key: "listingYear",
    label: "Listing Year",
    header: "Listed",
    group: "Company",
    sortField: "listingYear",
    defaultVisible: false,
    align: "center",
    widthClass: "min-w-[80px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => getListingYear(stock) ?? "-",
  },
  {
    key: "instrumentType",
    label: "Instrument Type",
    header: "Instrument",
    group: "Company",
    sortField: "instrumentType",
    defaultVisible: false,
    align: "left",
    widthClass: "min-w-[115px]",
    cellClassName: "text-muted-foreground",
    render: getInstrumentType,
  },
  {
    key: "operationalStatus",
    label: "Operational Status",
    header: "Status",
    group: "Company",
    sortField: "operationalStatus",
    defaultVisible: false,
    align: "left",
    widthClass: "min-w-[130px]",
    cellClassName: "text-muted-foreground",
    render: getOperationalStatus,
  },
  {
    key: "ltp",
    label: "LTP (৳)",
    header: "LTP (৳)",
    group: "Price",
    sortField: "ltp",
    defaultVisible: true,
    align: "right",
    widthClass: "min-w-[90px]",
    cellClassName: "font-semibold sm:text-sm text-foreground",
    render: (stock) => formatBDT(getLtp(stock)),
  },
  {
    key: "changePct",
    label: "Change %",
    header: "Change %",
    group: "Price",
    sortField: "changePct",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[90px]",
    cellClassName: (stock) =>
      cn("font-semibold", getChangeColorClass(getChange(stock))),
    render: (stock) => formatPct(getChangePct(stock)),
  },
  {
    key: "change",
    label: "Change (৳)",
    header: "Change (৳)",
    group: "Price",
    sortField: "change",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[95px]",
    cellClassName: (stock) =>
      cn("font-semibold", getChangeColorClass(getChange(stock))),
    render: (stock) => formatBDT(getChange(stock)),
  },
  {
    key: "ycp",
    label: "Previous Close",
    header: "Prev Close",
    group: "Price",
    sortField: "ycp",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[100px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatBDT(getYcp(stock)),
  },
  {
    key: "high",
    label: "Day High",
    header: "Day High",
    group: "Price",
    sortField: "high",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[90px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatBDT(getDayHigh(stock)),
  },
  {
    key: "low",
    label: "Day Low",
    header: "Day Low",
    group: "Price",
    sortField: "low",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[90px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatBDT(getDayLow(stock)),
  },
  {
    key: "range52WeekLow",
    label: "52W Low",
    header: "52W Low",
    group: "Price",
    sortField: "range52WeekLow",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[90px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatBDT(get52WeekRange(stock)?.[0]),
  },
  {
    key: "range52WeekHigh",
    label: "52W High",
    header: "52W High",
    group: "Price",
    sortField: "range52WeekHigh",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[90px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatBDT(get52WeekRange(stock)?.[1]),
  },
  {
    key: "pe",
    label: "P/E",
    header: "P/E",
    group: "Valuation",
    sortField: "pe",
    defaultVisible: true,
    align: "right",
    widthClass: "min-w-20",
    cellClassName: "font-medium",
    render: (stock) => formatRatio(getPe(stock)),
  },
  {
    key: "auditedPe",
    label: "Audited P/E",
    header: "Audited P/E",
    group: "Valuation",
    sortField: "auditedPe",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[105px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatRatio(getAuditedPe(stock)),
  },
  {
    key: "unauditedPe",
    label: "Unaudited P/E",
    header: "Unaudited P/E",
    group: "Valuation",
    sortField: "unauditedPe",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[115px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatRatio(getUnauditedPe(stock)),
  },
  {
    key: "divYield",
    label: "Dividend Yield %",
    header: "Yield %",
    group: "Valuation",
    sortField: "divYield",
    defaultVisible: true,
    align: "right",
    widthClass: "min-w-20",
    cellClassName: "font-medium",
    render: (stock) => {
      const value = getDivYieldPct(stock);
      return value !== null ? `${formatNumber(value)}%` : "-";
    },
  },
  {
    key: "pb",
    label: "P/B",
    header: "P/B",
    group: "Valuation",
    sortField: "pb",
    defaultVisible: true,
    align: "right",
    widthClass: "min-w-16",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatRatio(getPbRatio(stock)),
  },
  {
    key: "nav",
    label: "NAV (৳)",
    header: "NAV (৳)",
    group: "Financials",
    sortField: "nav",
    defaultVisible: true,
    align: "right",
    widthClass: "min-w-[85px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatBDT(getNav(stock)),
  },
  {
    key: "eps",
    label: "EPS (৳)",
    header: "EPS (৳)",
    group: "Financials",
    sortField: "eps",
    defaultVisible: true,
    align: "right",
    widthClass: "min-w-[85px]",
    cellClassName: (stock) =>
      cn(
        "font-medium",
        getEps(stock) !== null && getEps(stock)! < 0
          ? "text-rose-600 dark:text-rose-400"
          : "text-foreground",
      ),
    render: (stock) => formatBDT(getEps(stock)),
  },
  {
    key: "netProfit",
    label: "Net Profit",
    header: "Net Profit",
    group: "Financials",
    sortField: "netProfit",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[110px]",
    cellClassName: (stock) =>
      getChangeColorClass(getNetProfitMn(stock)),
    render: (stock) => formatLargeNumber(getNetProfitMn(stock)),
  },
  {
    key: "marketCap",
    label: "Market Cap",
    header: "Mkt Cap",
    group: "Financials",
    sortField: "marketCap",
    defaultVisible: true,
    align: "right",
    widthClass: "min-w-[110px]",
    cellClassName: "font-medium text-foreground",
    render: (stock) => formatLargeNumber(getMarketCap(stock)),
  },
  {
    key: "freeFloatCap",
    label: "Free-Float Market Cap",
    header: "Free Float Cap",
    group: "Financials",
    sortField: "freeFloatCap",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[125px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatLargeNumber(getFreeFloatCap(stock)),
  },
  {
    key: "paidUpCap",
    label: "Paid-Up Capital",
    header: "Paid-Up Cap",
    group: "Financials",
    sortField: "paidUpCap",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[115px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatLargeNumber(getPaidUpCap(stock)),
  },
  {
    key: "authorizedCap",
    label: "Authorized Capital",
    header: "Authorized Cap",
    group: "Financials",
    sortField: "authorizedCap",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[130px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatLargeNumber(getAuthorizedCap(stock)),
  },
  {
    key: "turnover",
    label: "Turnover",
    header: "Turnover",
    group: "Trading",
    sortField: "turnover",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[100px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatLargeNumber(getTurnover(stock)),
  },
  {
    key: "volume",
    label: "Volume",
    header: "Volume",
    group: "Trading",
    sortField: "volume",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[100px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatInteger(getVolume(stock)),
  },
  {
    key: "trades",
    label: "Trades",
    header: "Trades",
    group: "Trading",
    sortField: "trades",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[80px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatInteger(getTrades(stock)),
  },
  {
    key: "debt",
    label: "Debt (Mn)",
    header: "Debt (Mn)",
    group: "Financials",
    sortField: "debt",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[90px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => {
      const debt = getDebt(stock);
      return debt > 0 ? `৳${formatNumber(debt)}M` : "Nil";
    },
  },
  {
    key: "sponsorPct",
    label: "Sponsor %",
    header: "Sponsor %",
    group: "Ownership",
    sortField: "sponsorPct",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[90px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatHolding(getSponsorPct(stock)),
  },
  {
    key: "institutePct",
    label: "Institution %",
    header: "Institution %",
    group: "Ownership",
    sortField: "institutePct",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[105px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatHolding(getInstitutePct(stock)),
  },
  {
    key: "foreignPct",
    label: "Foreign %",
    header: "Foreign %",
    group: "Ownership",
    sortField: "foreignPct",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[90px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatHolding(getForeignPct(stock)),
  },
  {
    key: "publicPct",
    label: "Public %",
    header: "Public %",
    group: "Ownership",
    sortField: "publicPct",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[85px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatHolding(getPublicPct(stock)),
  },
  {
    key: "govtPct",
    label: "Government %",
    header: "Government %",
    group: "Ownership",
    sortField: "govtPct",
    defaultVisible: false,
    align: "right",
    widthClass: "min-w-[110px]",
    cellClassName: "text-muted-foreground",
    render: (stock) => formatHolding(getGovtPct(stock)),
  },
];

const COLUMNS_STORAGE_KEY = "dsefilter_table_columns";

const columnGroups: readonly ColumnGroup[] = [
  "Company",
  "Price",
  "Valuation",
  "Financials",
  "Trading",
  "Ownership",
];

const defaultVisibleColumns = Object.fromEntries(
  columnDefinitions.map((column) => [column.key, column.defaultVisible]),
) as Record<ColumnKey, boolean>;

const allVisibleColumns = Object.fromEntries(
  columnDefinitions.map((column) => [column.key, true]),
) as Record<ColumnKey, boolean>;

const alignmentClasses = {
  left: { header: "text-left", content: "justify-start", cell: "text-left" },
  center: {
    header: "text-center",
    content: "justify-center",
    cell: "text-center",
  },
  right: {
    header: "text-right",
    content: "justify-end",
    cell: "text-right",
  },
} as const;

export function StockTable({
  stocks,
  sortConfig,
  setSortConfig,
  selectedCodes,
  onToggleSelect,
}: StockTableProps) {
  const [visibleColumns, setVisibleColumns] =
    useState<Record<ColumnKey, boolean>>(defaultVisibleColumns);

  const [isScrolled, setIsScrolled] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(COLUMNS_STORAGE_KEY);
      if (!saved) return;

      const parsed: unknown = JSON.parse(saved);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return;

      const restored = { ...defaultVisibleColumns };
      const savedColumns = parsed as Record<string, unknown>;
      columnDefinitions.forEach((column) => {
        const savedValue = savedColumns[column.key];
        if (typeof savedValue === "boolean") {
          restored[column.key] = savedValue;
        }
      });
      setVisibleColumns(restored);

      setSortConfig((currentSort) => {
        const sortedColumn = columnDefinitions.find(
          (column) => column.sortField === currentSort.field,
        );
        return sortedColumn && !restored[sortedColumn.key]
          ? { field: "tradingCode", direction: "asc" }
          : currentSort;
      });
    } catch {}
  }, [setSortConfig]);

  const applyVisibleColumns = (next: Record<ColumnKey, boolean>) => {
    setVisibleColumns(next);
    try {
      localStorage.setItem(COLUMNS_STORAGE_KEY, JSON.stringify(next));
    } catch {}

    const sortedColumn = columnDefinitions.find(
      (column) => column.sortField === sortConfig.field,
    );
    if (sortedColumn && !next[sortedColumn.key]) {
      setSortConfig({ field: "tradingCode", direction: "asc" });
    }
  };

  const setColumnVisibility = (key: ColumnKey, isVisible: boolean) => {
    if (visibleColumns[key] === isVisible) return;
    applyVisibleColumns({ ...visibleColumns, [key]: isVisible });
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
        direction: "desc",
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

  const getAriaSort = (field: SortField): "ascending" | "descending" | "none" => {
    if (sortConfig.field !== field) return "none";
    return sortConfig.direction === "asc" ? "ascending" : "descending";
  };

  const handleHeaderKeyDown = (e: React.KeyboardEvent, field: SortField) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleSort(field);
    }
  };

  const visibleColumnDefinitions = columnDefinitions.filter(
    (column) => visibleColumns[column.key],
  );
  const allColumnsShown = visibleColumnDefinitions.length === columnDefinitions.length;
  const usingDefaultColumns = columnDefinitions.every(
    (column) => visibleColumns[column.key] === column.defaultVisible,
  );

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
            <DropdownMenuContent align="end" className="w-64 text-xs">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[11px] text-muted-foreground uppercase">
                  Visible Columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  disabled={allColumnsShown}
                  onClick={() => applyVisibleColumns({ ...allVisibleColumns })}
                  className="cursor-pointer py-1.5"
                >
                  Show all columns
                </DropdownMenuItem>
                <DropdownMenuItem
                  disabled={usingDefaultColumns}
                  onClick={() => applyVisibleColumns({ ...defaultVisibleColumns })}
                  className="cursor-pointer py-1.5"
                >
                  Reset to defaults
                </DropdownMenuItem>
              </DropdownMenuGroup>
              {columnGroups.map((group) => (
                <DropdownMenuGroup key={group}>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-wide">
                    {group}
                  </DropdownMenuLabel>
                  {columnDefinitions
                    .filter((column) => column.group === group)
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.key}
                        checked={visibleColumns[column.key]}
                        onCheckedChange={(checked) =>
                          setColumnVisibility(column.key, checked === true)
                        }
                        className="cursor-pointer py-1.5 text-xs"
                      >
                        {column.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              ))}
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
                <th
                  scope="col"
                  className="sticky top-0 left-0 z-30 w-10 min-w-10 max-w-10 bg-muted/95 dark:bg-card/95 backdrop-blur-md px-2.5 text-center border-b border-border/80 h-10 align-middle"
                >
                  <span className="sr-only">Compare</span>
                </th>

                {/* Sticky Trading Code Column Header */}
                <th
                  scope="col"
                  role="columnheader"
                  tabIndex={0}
                  aria-sort={getAriaSort("tradingCode")}
                  onClick={() => handleSort("tradingCode")}
                  onKeyDown={(e) => handleHeaderKeyDown(e, "tradingCode")}
                  className="sticky top-0 left-10 z-30 bg-muted/95 dark:bg-card/95 backdrop-blur-md min-w-[130px] sm:min-w-[160px] cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring font-semibold text-left px-2 border-b border-border/80 h-10 align-middle shadow-[2px_0_4px_-2px_rgba(0,0,0,0.15)] dark:shadow-[2px_0_4px_-2px_rgba(0,0,0,0.4)]"
                >
                  <div className="flex items-center">
                    <span>Trading Code</span>
                    {renderSortIcon("tradingCode")}
                  </div>
                </th>

                {visibleColumnDefinitions.map((column) => {
                  const alignment = alignmentClasses[column.align];
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      role="columnheader"
                      tabIndex={0}
                      aria-sort={getAriaSort(column.sortField)}
                      onClick={() => handleSort(column.sortField)}
                      onKeyDown={(e) => handleHeaderKeyDown(e, column.sortField)}
                      className={cn(
                        "sticky top-0 z-20 bg-muted/95 dark:bg-card/95 backdrop-blur-md cursor-pointer hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring px-2 border-b border-border/80 h-10 align-middle font-medium",
                        alignment.header,
                        column.widthClass,
                      )}
                    >
                      <div className={cn("flex items-center", alignment.content)}>
                        <span>{column.header}</span>
                        {renderSortIcon(column.sortField)}
                      </div>
                    </th>
                  );
                })}

              </tr>
            </thead>

            <tbody>
              {stocks.length === 0 ? (
                <tr>
                  <td
                    colSpan={2 + visibleColumnDefinitions.length}
                    className="h-32 text-center text-sm text-muted-foreground"
                  >
                    No stocks match the current filter criteria.
                  </td>
                </tr>
              ) : (
                stocks.map((stock) => {
                  const code = getTradingCode(stock);
                  const isChecked = selectedCodes.includes(code);
                  const isSharia = getShariaCompliant(stock);

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
                            {getCompanyName(stock)}
                          </span>
                        </Link>
                      </td>

                      {visibleColumnDefinitions.map((column) => {
                        const alignment = alignmentClasses[column.align];
                        const cellClassName =
                          typeof column.cellClassName === "function"
                            ? column.cellClassName(stock)
                            : column.cellClassName;
                        return (
                          <td
                            key={column.key}
                            className={cn(
                              "px-2 py-2 border-b border-border/40 text-xs",
                              alignment.cell,
                              column.widthClass,
                              cellClassName,
                            )}
                          >
                            {column.render(stock)}
                          </td>
                        );
                      })}

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
