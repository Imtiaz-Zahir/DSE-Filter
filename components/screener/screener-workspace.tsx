"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AnyStock, FilterState, SortConfig } from "@/lib/types";
import {
  calculateSummaryStats,
  filterAndSortStocks,
  initialFilterState,
} from "@/lib/stocks";
import {
  filtersFromSearchParams,
  filtersToSearchParams,
} from "@/lib/filter-params";
import { SummaryStatsBar } from "@/components/screener/summary-stats-bar";
import { FilterToolbar } from "@/components/screener/filter-toolbar";
import { ActiveFilters } from "@/components/screener/active-filters";
import { StockTable } from "@/components/screener/stock-table";
import { StockGrid } from "@/components/screener/stock-grid";
import { CompareTray } from "@/components/screener/compare-tray";

interface ScreenerWorkspaceProps {
  initialStocks: AnyStock[];
  showStatsBar?: boolean;
}

export function ScreenerWorkspace({
  initialStocks,
  showStatsBar = true,
}: ScreenerWorkspaceProps) {
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<FilterState>(() =>
    filtersFromSearchParams(searchParams),
  );

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "marketCap",
    direction: "desc",
  });

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Apply filters when navigating to a different screener URL.
  useEffect(() => {
    const nextFilters = filtersFromSearchParams(searchParams);
    setFilters((currentFilters) =>
      filtersToSearchParams(currentFilters).toString() ===
      filtersToSearchParams(nextFilters).toString()
        ? currentFilters
        : nextFilters,
    );
  }, [searchParams]);

  // Keep every filter in the URL so browser Back restores the complete screener.
  useEffect(() => {
    const queryString = filtersToSearchParams(filters).toString();
    const newUrl = queryString ? `/?${queryString}` : "/";
    if (
      typeof window !== "undefined" &&
      window.location.pathname === "/" &&
      `${window.location.pathname}${window.location.search}` !== newUrl
    ) {
      window.history.replaceState(window.history.state, "", newUrl);
    }
  }, [filters]);

  // Reset filters callback
  const handleResetFilters = useCallback(() => {
    setFilters(initialFilterState);
  }, []);

  // Market summary stats
  const summaryStats = useMemo(() => {
    return calculateSummaryStats(initialStocks);
  }, [initialStocks]);

  // Filter & sort calculations
  const filteredStocks = useMemo(() => {
    return filterAndSortStocks(initialStocks, filters, sortConfig);
  }, [initialStocks, filters, sortConfig]);

  // Active filter count for badge
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchQuery) count++;
    if (filters.preset !== "all") count++;
    if (filters.sectors.length > 0) count += filters.sectors.length;
    if (filters.categories.length > 0) count += filters.categories.length;
    if (filters.instruments.length > 0) count += filters.instruments.length;
    if (filters.operationalStatuses.length > 0)
      count += filters.operationalStatuses.length;
    if (filters.shariaOnly) count++;
    if (filters.zeroDebtOnly) count++;
    if (filters.excludeLossMaking) count++;
    if (filters.excludeNegativePE) count++;
    if (filters.excludeZeroDividend) count++;

    const rangeKeys: (keyof FilterState)[] = [
      "ltpRange",
      "changePctRange",
      "peRange",
      "divYieldRange",
      "pbRange",
      "marketCapRange",
      "paidUpCapRange",
      "navRange",
      "epsRange",
      "netProfitRange",
      "debtRange",
      "listingYearRange",
      "sponsorPctRange",
      "institutePctRange",
      "foreignPctRange",
      "publicPctRange",
      "govtPctRange",
      "volumeRange",
      "turnoverRange",
      "tradesRange",
    ];

    rangeKeys.forEach((k) => {
      const r = filters[k] as { min?: number | null; max?: number | null };
      if (
        r &&
        ((r.min !== undefined && r.min !== null) ||
          (r.max !== undefined && r.max !== null))
      ) {
        count++;
      }
    });

    return count;
  }, [filters]);

  // Compare handlers
  const handleToggleSelect = useCallback((code: string) => {
    setSelectedCodes((prev) => {
      if (prev.includes(code)) {
        return prev.filter((c) => c !== code);
      }
      if (prev.length >= 4) {
        return prev;
      }
      return [...prev, code];
    });
  }, []);

  const handleRemoveSelect = useCallback((code: string) => {
    setSelectedCodes((prev) => prev.filter((c) => c !== code));
  }, []);

  const handleClearSelect = useCallback(() => {
    setSelectedCodes([]);
  }, []);

  return (
    <>
      {/* 1. Market Summary KPI Bar */}
      {showStatsBar && (
        <SummaryStatsBar
          stats={summaryStats}
          filteredCount={filteredStocks.length}
        />
      )}

      {/* 2. Main Screener Workspace */}
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-4">
        {/* Filter Toolbar (Search, 1-Click Presets, Quick Selects, Export, View Mode) */}
        <FilterToolbar
          filters={filters}
          setFilters={setFilters}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filteredStocks={filteredStocks}
          activeFilterCount={activeFilterCount}
          onReset={handleResetFilters}
          drawerOpen={drawerOpen}
          setDrawerOpen={setDrawerOpen}
        />

        {/* Active Filter Pills & Custom Preset Manager */}
        <ActiveFilters
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
          filteredCount={filteredStocks.length}
          totalCount={initialStocks.length}
        />

        {/* Stock List / Grid Display */}
        {viewMode === "table" ? (
          <StockTable
            stocks={filteredStocks}
            sortConfig={sortConfig}
            setSortConfig={setSortConfig}
            selectedCodes={selectedCodes}
            onToggleSelect={handleToggleSelect}
          />
        ) : (
          <StockGrid
            stocks={filteredStocks}
            selectedCodes={selectedCodes}
            onToggleSelect={handleToggleSelect}
          />
        )}
      </div>

      {/* 3. Floating Bottom Compare Tray */}
      <CompareTray
        selectedCodes={selectedCodes}
        onRemove={handleRemoveSelect}
        onClear={handleClearSelect}
      />
    </>
  );
}
