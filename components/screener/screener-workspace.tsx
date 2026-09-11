"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { AnyStock, FilterState, SortConfig } from "@/lib/types";
import {
  calculateSummaryStats,
  filterAndSortStocks,
  initialFilterState,
} from "@/lib/stocks";
import { SummaryStatsBar } from "@/components/screener/summary-stats-bar";
import { FilterToolbar } from "@/components/screener/filter-toolbar";
import { ActiveFilters } from "@/components/screener/active-filters";
import { StockTable } from "@/components/screener/stock-table";
import { StockGrid } from "@/components/screener/stock-grid";
import { CompareTray } from "@/components/screener/compare-tray";

interface ScreenerWorkspaceProps {
  initialStocks: AnyStock[];
}

export function ScreenerWorkspace({ initialStocks }: ScreenerWorkspaceProps) {
  const searchParams = useSearchParams();

  // Initial filter state from URL search params
  const [filters, setFilters] = useState<FilterState>(() => {
    const preset = searchParams?.get("preset") || "all";
    const sector = searchParams?.get("sector");
    const cat = searchParams?.get("category");
    const q = searchParams?.get("q") || "";
    const sharia = searchParams?.get("sharia") === "true";

    return {
      ...initialFilterState,
      preset,
      searchQuery: q,
      sectors: sector ? [sector] : [],
      categories: cat ? [cat] : [],
      shariaOnly: sharia,
    };
  });

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: "marketCap",
    direction: "desc",
  });

  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sync URL params when preset / sector changes
  useEffect(() => {
    if (!searchParams) return;
    const urlPreset = searchParams.get("preset");
    const urlSector = searchParams.get("sector");
    const urlCat = searchParams.get("category");
    const urlQ = searchParams.get("q");

    if (urlPreset || urlSector || urlCat || urlQ) {
      setFilters((prev) => ({
        ...prev,
        preset: urlPreset || prev.preset,
        sectors: urlSector ? [urlSector] : prev.sectors,
        categories: urlCat ? [urlCat] : prev.categories,
        searchQuery: urlQ !== null ? urlQ : prev.searchQuery,
      }));
    }
  }, [searchParams]);

  // Sync state to URL search params
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.preset && filters.preset !== "all") params.set("preset", filters.preset);
    if (filters.searchQuery.trim()) params.set("q", filters.searchQuery.trim());
    if (filters.sectors.length === 1) params.set("sector", filters.sectors[0]);
    if (filters.categories.length === 1) params.set("category", filters.categories[0]);
    if (filters.shariaOnly) params.set("sharia", "true");

    const queryString = params.toString();
    const newUrl = queryString ? `/?${queryString}` : "/";
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      window.history.replaceState(null, "", newUrl);
    }
  }, [filters.preset, filters.searchQuery, filters.sectors, filters.categories, filters.shariaOnly]);

  // Reset filters callback
  const handleResetFilters = useCallback(() => {
    setFilters(initialFilterState);
    if (typeof window !== "undefined" && window.location.pathname === "/") {
      window.history.replaceState(null, "", "/");
    }
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
        alert("You can compare up to 4 stocks at a time.");
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
      <SummaryStatsBar
        stats={summaryStats}
        filteredCount={filteredStocks.length}
      />

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
