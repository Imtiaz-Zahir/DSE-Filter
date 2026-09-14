"use client";

import * as React from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Check,
  Percent,
  DollarSign,
  TrendingUp,
  PieChart,
  Activity,
  ShieldCheck,
  Building,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FilterState, FilterRange } from "@/lib/types";
import { getAllSectors, getAllCategories, getAllInstruments, getAllOperationalStatuses } from "@/lib/stocks";

interface FilterDrawerProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  totalResults: number;
  open: boolean;
  setOpen: (open: boolean) => void;
  activeFilterCount: number;
}

export function FilterDrawer({
  filters,
  setFilters,
  onReset,
  totalResults,
  open,
  setOpen,
  activeFilterCount,
}: FilterDrawerProps) {
  const allSectors = React.useMemo(() => getAllSectors(), []);
  const allCategories = React.useMemo(() => getAllCategories(), []);
  const allInstruments = React.useMemo(() => getAllInstruments(), []);
  const allStatuses = React.useMemo(() => getAllOperationalStatuses(), []);

  const handleRangeChange = (
    key: keyof FilterState,
    field: "min" | "max",
    value: string
  ) => {
    const num = value === "" ? null : parseFloat(value);
    setFilters((prev) => ({
      ...prev,
      [key]: {
        ...((prev[key] as FilterRange) || {}),
        [field]: num !== null && !isNaN(num) ? num : null,
      },
    }));
  };

  const toggleSector = (sector: string) => {
    setFilters((prev) => {
      const exists = prev.sectors.includes(sector);
      return {
        ...prev,
        sectors: exists ? prev.sectors.filter((s) => s !== sector) : [...prev.sectors, sector],
      };
    });
  };

  const toggleCategory = (cat: string) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(cat);
      return {
        ...prev,
        categories: exists ? prev.categories.filter((c) => c !== cat) : [...prev.categories, cat],
      };
    });
  };

  const toggleInstrument = (inst: string) => {
    setFilters((prev) => {
      const exists = prev.instruments.includes(inst);
      return {
        ...prev,
        instruments: exists ? prev.instruments.filter((i) => i !== inst) : [...prev.instruments, inst],
      };
    });
  };

  const toggleStatus = (st: string) => {
    setFilters((prev) => {
      const exists = prev.operationalStatuses.includes(st);
      return {
        ...prev,
        operationalStatuses: exists ? prev.operationalStatuses.filter((s) => s !== st) : [...prev.operationalStatuses, st],
      };
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs font-medium relative">
            <SlidersHorizontal className="size-3.5" />
            <span>Filters</span>
            {activeFilterCount > 0 && (
              <Badge className="ml-1 size-4.5 rounded-full p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        }
      />
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col h-full">
        {/* Header */}
        <SheetHeader className="p-4 border-b border-border/60 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-primary" />
              <SheetTitle className="text-base font-semibold">Stock Screener Filters</SheetTitle>
            </div>
            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={onReset}
                className="h-7 text-xs text-muted-foreground hover:text-foreground gap-1"
              >
                <RotateCcw className="size-3" />
                Reset
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Refine stocks across valuation, financial health, shareholding & activity
          </p>
        </SheetHeader>

        {/* Scrollable Filter Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Quick Boolean Exclusions */}
          <div className="space-y-3 rounded-xl bg-card border border-border/60 p-3.5 shadow-2xs">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Key Exclusions & Criteria
            </span>
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center justify-between">
                <label htmlFor="sharia-only" className="text-xs font-medium text-foreground cursor-pointer flex items-center gap-1.5">
                  <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>DSES Sharia Compliant Only</span>
                </label>
                <Switch
                  id="sharia-only"
                  checked={filters.shariaOnly}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, shariaOnly: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="zero-debt" className="text-xs font-medium text-foreground cursor-pointer">
                  Zero Long-Term Debt Only
                </label>
                <Switch
                  id="zero-debt"
                  checked={filters.zeroDebtOnly}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, zeroDebtOnly: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="exclude-loss" className="text-xs font-medium text-foreground cursor-pointer">
                  Exclude Loss-Making (EPS &le; 0)
                </label>
                <Switch
                  id="exclude-loss"
                  checked={filters.excludeLossMaking}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, excludeLossMaking: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="exclude-neg-pe" className="text-xs font-medium text-foreground cursor-pointer">
                  Exclude Negative / Nil P/E
                </label>
                <Switch
                  id="exclude-neg-pe"
                  checked={filters.excludeNegativePE}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, excludeNegativePE: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <label htmlFor="exclude-zero-div" className="text-xs font-medium text-foreground cursor-pointer">
                  Exclude Zero Dividend Stocks
                </label>
                <Switch
                  id="exclude-zero-div"
                  checked={filters.excludeZeroDividend}
                  onCheckedChange={(checked) =>
                    setFilters((prev) => ({ ...prev, excludeZeroDividend: checked }))
                  }
                />
              </div>
            </div>
          </div>

          {/* Market Category Filter */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Market Category
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allCategories.map((cat) => {
                const selected = filters.categories.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleCategory(cat)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all border ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/60 text-secondary-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    Category {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Tab Range Filters */}
          <Tabs defaultValue="valuation" className="w-full">
            <TabsList className="w-full grid grid-cols-4 h-9">
              <TabsTrigger value="valuation" className="text-[11px] px-1">Valuation</TabsTrigger>
              <TabsTrigger value="financials" className="text-[11px] px-1">Financials</TabsTrigger>
              <TabsTrigger value="holding" className="text-[11px] px-1">Shareholding</TabsTrigger>
              <TabsTrigger value="activity" className="text-[11px] px-1">Activity</TabsTrigger>
            </TabsList>

            {/* TAB 1: VALUATION */}
            <TabsContent value="valuation" className="space-y-3 pt-2">
              <RangeInputPair
                label="LTP (Last Traded Price ৳)"
                minVal={filters.ltpRange.min}
                maxVal={filters.ltpRange.max}
                onMinChange={(v) => handleRangeChange("ltpRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("ltpRange", "max", v)}
                placeholderMin="Min ৳"
                placeholderMax="Max ৳"
              />
              <RangeInputPair
                label="P/E Ratio"
                minVal={filters.peRange.min}
                maxVal={filters.peRange.max}
                onMinChange={(v) => handleRangeChange("peRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("peRange", "max", v)}
                placeholderMin="e.g. 5"
                placeholderMax="e.g. 20"
              />
              <RangeInputPair
                label="Dividend Yield %"
                minVal={filters.divYieldRange.min}
                maxVal={filters.divYieldRange.max}
                onMinChange={(v) => handleRangeChange("divYieldRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("divYieldRange", "max", v)}
                placeholderMin="e.g. 3%"
                placeholderMax="e.g. 15%"
              />
              <RangeInputPair
                label="P/B Ratio (Price to Book)"
                minVal={filters.pbRange.min}
                maxVal={filters.pbRange.max}
                onMinChange={(v) => handleRangeChange("pbRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("pbRange", "max", v)}
                placeholderMin="e.g. 0.5"
                placeholderMax="e.g. 2.0"
              />
              <RangeInputPair
                label="Day Price Change %"
                minVal={filters.changePctRange.min}
                maxVal={filters.changePctRange.max}
                onMinChange={(v) => handleRangeChange("changePctRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("changePctRange", "max", v)}
                placeholderMin="e.g. -5%"
                placeholderMax="e.g. +10%"
              />
            </TabsContent>

            {/* TAB 2: FINANCIALS */}
            <TabsContent value="financials" className="space-y-3 pt-2">
              <RangeInputPair
                label="Market Cap (Mn BDT)"
                minVal={filters.marketCapRange.min}
                maxVal={filters.marketCapRange.max}
                onMinChange={(v) => handleRangeChange("marketCapRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("marketCapRange", "max", v)}
                placeholderMin="Min Mn"
                placeholderMax="Max Mn"
              />
              <RangeInputPair
                label="NAV per Share (BDT)"
                minVal={filters.navRange.min}
                maxVal={filters.navRange.max}
                onMinChange={(v) => handleRangeChange("navRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("navRange", "max", v)}
                placeholderMin="Min NAV"
                placeholderMax="Max NAV"
              />
              <RangeInputPair
                label="EPS per Share (BDT)"
                minVal={filters.epsRange.min}
                maxVal={filters.epsRange.max}
                onMinChange={(v) => handleRangeChange("epsRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("epsRange", "max", v)}
                placeholderMin="Min EPS"
                placeholderMax="Max EPS"
              />
              <RangeInputPair
                label="Paid-Up Capital (Mn BDT)"
                minVal={filters.paidUpCapRange.min}
                maxVal={filters.paidUpCapRange.max}
                onMinChange={(v) => handleRangeChange("paidUpCapRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("paidUpCapRange", "max", v)}
                placeholderMin="Min Mn"
                placeholderMax="Max Mn"
              />
              <RangeInputPair
                label="Net Profit (Mn BDT)"
                minVal={filters.netProfitRange.min}
                maxVal={filters.netProfitRange.max}
                onMinChange={(v) => handleRangeChange("netProfitRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("netProfitRange", "max", v)}
                placeholderMin="Min Mn"
                placeholderMax="Max Mn"
              />
              <RangeInputPair
                label="Long Term Debt (Mn BDT)"
                minVal={filters.debtRange.min}
                maxVal={filters.debtRange.max}
                onMinChange={(v) => handleRangeChange("debtRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("debtRange", "max", v)}
                placeholderMin="Min Mn"
                placeholderMax="Max Mn"
              />
              <RangeInputPair
                label="Listing Year"
                minVal={filters.listingYearRange.min}
                maxVal={filters.listingYearRange.max}
                onMinChange={(v) => handleRangeChange("listingYearRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("listingYearRange", "max", v)}
                placeholderMin="e.g. 1990"
                placeholderMax="e.g. 2026"
              />
            </TabsContent>

            {/* TAB 3: SHAREHOLDING */}
            <TabsContent value="holding" className="space-y-3 pt-2">
              <RangeInputPair
                label="Sponsor / Director Holding %"
                minVal={filters.sponsorPctRange.min}
                maxVal={filters.sponsorPctRange.max}
                onMinChange={(v) => handleRangeChange("sponsorPctRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("sponsorPctRange", "max", v)}
                placeholderMin="Min %"
                placeholderMax="Max %"
              />
              <RangeInputPair
                label="Institutional Holding %"
                minVal={filters.institutePctRange.min}
                maxVal={filters.institutePctRange.max}
                onMinChange={(v) => handleRangeChange("institutePctRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("institutePctRange", "max", v)}
                placeholderMin="Min %"
                placeholderMax="Max %"
              />
              <RangeInputPair
                label="Foreign Holding %"
                minVal={filters.foreignPctRange.min}
                maxVal={filters.foreignPctRange.max}
                onMinChange={(v) => handleRangeChange("foreignPctRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("foreignPctRange", "max", v)}
                placeholderMin="Min %"
                placeholderMax="Max %"
              />
              <RangeInputPair
                label="Public Holding %"
                minVal={filters.publicPctRange.min}
                maxVal={filters.publicPctRange.max}
                onMinChange={(v) => handleRangeChange("publicPctRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("publicPctRange", "max", v)}
                placeholderMin="Min %"
                placeholderMax="Max %"
              />
              <RangeInputPair
                label="Govt Holding %"
                minVal={filters.govtPctRange.min}
                maxVal={filters.govtPctRange.max}
                onMinChange={(v) => handleRangeChange("govtPctRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("govtPctRange", "max", v)}
                placeholderMin="Min %"
                placeholderMax="Max %"
              />
            </TabsContent>

            {/* TAB 4: ACTIVITY */}
            <TabsContent value="activity" className="space-y-3 pt-2">
              <RangeInputPair
                label="Day Turnover (Mn BDT)"
                minVal={filters.turnoverRange.min}
                maxVal={filters.turnoverRange.max}
                onMinChange={(v) => handleRangeChange("turnoverRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("turnoverRange", "max", v)}
                placeholderMin="Min Mn"
                placeholderMax="Max Mn"
              />
              <RangeInputPair
                label="Day Volume (Shares)"
                minVal={filters.volumeRange.min}
                maxVal={filters.volumeRange.max}
                onMinChange={(v) => handleRangeChange("volumeRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("volumeRange", "max", v)}
                placeholderMin="Min Shares"
                placeholderMax="Max Shares"
              />
              <RangeInputPair
                label="Day Trades Count"
                minVal={filters.tradesRange.min}
                maxVal={filters.tradesRange.max}
                onMinChange={(v) => handleRangeChange("tradesRange", "min", v)}
                onMaxChange={(v) => handleRangeChange("tradesRange", "max", v)}
                placeholderMin="Min Trades"
                placeholderMax="Max Trades"
              />
            </TabsContent>
          </Tabs>

          {/* Sector Checkboxes */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Sectors ({filters.sectors.length > 0 ? `${filters.sectors.length} selected` : "All"})
            </span>
            <div className="grid grid-cols-1 gap-1 max-h-48 overflow-y-auto pr-1">
              {allSectors.map((sector) => {
                const selected = filters.sectors.includes(sector);
                return (
                  <button
                    key={sector}
                    type="button"
                    onClick={() => toggleSector(sector)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs text-left transition-colors ${
                      selected
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="truncate">{sector}</span>
                    {selected && <Check className="size-3 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Operational Status */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Operational Status
            </span>
            <div className="flex flex-wrap gap-1.5">
              {allStatuses.map((st) => {
                const selected = filters.operationalStatuses.includes(st);
                return (
                  <button
                    key={st}
                    onClick={() => toggleStatus(st)}
                    className={`px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                      selected
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-secondary/60 text-secondary-foreground border-border hover:bg-secondary"
                    }`}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <SheetFooter className="p-4 border-t border-border/60 bg-muted/20">
          <div className="flex items-center gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="flex-1 text-xs"
            >
              Reset All
            </Button>
            <SheetClose
              render={
                <Button size="sm" className="flex-2 text-xs font-semibold">
                  View {totalResults} Results
                </Button>
              }
            />
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function RangeInputPair({
  label,
  minVal,
  maxVal,
  onMinChange,
  onMaxChange,
  placeholderMin,
  placeholderMax,
}: {
  label: string;
  minVal?: number | null;
  maxVal?: number | null;
  onMinChange: (val: string) => void;
  onMaxChange: (val: string) => void;
  placeholderMin: string;
  placeholderMax: string;
}) {
  const sanitizedLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return (
    <div className="space-y-1">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="grid grid-cols-2 gap-2">
        <Input
          id={`filter-${sanitizedLabel}-min`}
          name={`filter-${sanitizedLabel}-min`}
          type="number"
          placeholder={placeholderMin}
          aria-label={`${label} minimum`}
          value={minVal ?? ""}
          onChange={(e) => onMinChange(e.target.value)}
          className="h-8 text-xs"
        />
        <Input
          id={`filter-${sanitizedLabel}-max`}
          name={`filter-${sanitizedLabel}-max`}
          type="number"
          placeholder={placeholderMax}
          aria-label={`${label} maximum`}
          value={maxVal ?? ""}
          onChange={(e) => onMaxChange(e.target.value)}
          className="h-8 text-xs"
        />
      </div>
    </div>
  );
}
