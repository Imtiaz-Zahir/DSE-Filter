"use client";

import * as React from "react";
import {
  Search,
  X,
  LayoutGrid,
  Table as TableIcon,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Percent,
  PieChart,
  Gem,
  Building2,
  SlidersHorizontal,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FilterState } from "@/lib/types";
import { FilterDrawer } from "./filter-drawer";
import { ExportMenu } from "./export-menu";
import { Stock } from "@/lib/types";
import { getAllSectors, getAllCategories } from "@/lib/stocks";

interface FilterToolbarProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  viewMode: "table" | "grid";
  setViewMode: (mode: "table" | "grid") => void;
  filteredStocks: Stock[];
  activeFilterCount: number;
  onReset: () => void;
  drawerOpen: boolean;
  setDrawerOpen: (open: boolean) => void;
}

export function FilterToolbar({
  filters,
  setFilters,
  viewMode,
  setViewMode,
  filteredStocks,
  activeFilterCount,
  onReset,
  drawerOpen,
  setDrawerOpen,
}: FilterToolbarProps) {
  const allSectors = React.useMemo(() => getAllSectors(), []);
  const allCategories = React.useMemo(() => ["A", "B", "N", "Z"], []);

  const presets = [
    { id: "all", label: "All Stocks", icon: null },
    { id: "sharia", label: "DSES Sharia", icon: ShieldCheck, color: "text-emerald-600 dark:text-emerald-400" },
    { id: "gainers", label: "Gainers", icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400" },
    { id: "losers", label: "Losers", icon: TrendingDown, color: "text-rose-600 dark:text-rose-400" },
    { id: "high_yield", label: "Yield ≥ 5%", icon: Percent, color: "text-amber-600 dark:text-amber-400" },
    { id: "low_pe", label: "P/E ≤ 15", icon: PieChart, color: "text-blue-600 dark:text-blue-400" },
    { id: "undervalued_pb", label: "P/B < 1", icon: Gem, color: "text-purple-600 dark:text-purple-400" },
    { id: "zero_debt", label: "Zero Debt", icon: null },
    { id: "high_sponsor", label: "Sponsor ≥ 50%", icon: null },
  ];

  const handleSearchChange = (val: string) => {
    setFilters((prev) => ({ ...prev, searchQuery: val }));
  };

  const handlePresetSelect = (presetId: string) => {
    setFilters((prev) => ({ ...prev, preset: presetId }));
  };

  const handleSectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilters((prev) => ({
      ...prev,
      sectors: val ? [val] : [],
    }));
  };

  const handleCategoryToggle = (cat: string) => {
    setFilters((prev) => {
      const isSelected = prev.categories.includes(cat);
      return {
        ...prev,
        categories: isSelected ? prev.categories.filter((c) => c !== cat) : [...prev.categories, cat],
      };
    });
  };

  return (
    <div className="space-y-3">
      {/* Top Row: Search + Sector Select + Filters Drawer + Export + View Toggle */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter by ticker (GP, LHBL), company name..."
            value={filters.searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="h-8.5 pl-8 pr-7 text-xs bg-background"
          />
          {filters.searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
          {/* Quick Sector Selector */}
          <select
            value={filters.sectors[0] || ""}
            onChange={handleSectorChange}
            aria-label="Filter by sector"
            className="h-8.5 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring max-w-[140px] sm:max-w-[170px] truncate"
          >
            <option value="">All Sectors</option>
            {allSectors.map((sec) => (
              <option key={sec} value={sec}>
                {sec}
              </option>
            ))}
          </select>

          {/* Granular Filter Drawer Trigger */}
          <FilterDrawer
            filters={filters}
            setFilters={setFilters}
            onReset={onReset}
            totalResults={filteredStocks.length}
            open={drawerOpen}
            setOpen={setDrawerOpen}
            activeFilterCount={activeFilterCount}
          />

          {/* Export Menu */}
          <ExportMenu stocks={filteredStocks} />

          {/* View Mode Toggle (Table / Grid) */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "table"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <TableIcon className="size-3.5" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-2xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Grid card view"
              aria-label="Grid card view"
            >
              <LayoutGrid className="size-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Second Row: 1-Click Preset Chips & Category Quick Pills */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        {/* Preset Chips */}
        <div className="flex items-center gap-1.5 shrink-0">
          {presets.map((preset) => {
            const Icon = preset.icon;
            const isActive = filters.preset === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handlePresetSelect(preset.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
                  isActive
                    ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                    : "bg-secondary/70 text-secondary-foreground border-border/80 hover:bg-secondary hover:text-foreground"
                }`}
              >
                {Icon && <Icon className={`size-3 ${!isActive && preset.color ? preset.color : ""}`} />}
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>

        {/* Category quick selectors */}
        <div className="hidden lg:flex items-center gap-1 shrink-0 pl-3 border-l border-border/60">
          <span className="text-[11px] text-muted-foreground font-medium mr-1">Cat:</span>
          {allCategories.map((cat) => {
            const isSelected = filters.categories.includes(cat);
            return (
              <button
                key={cat}
                onClick={() => handleCategoryToggle(cat)}
                className={`size-6 rounded-md text-[11px] font-bold transition-all border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary/50 text-muted-foreground border-border hover:text-foreground hover:bg-secondary"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
