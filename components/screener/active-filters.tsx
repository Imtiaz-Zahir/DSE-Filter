"use client";

import React, { useState, useEffect } from "react";
import { X, BookmarkPlus, Bookmark, Trash2, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { FilterState, CustomPreset } from "@/lib/types";
import { initialFilterState } from "@/lib/stocks";

interface ActiveFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
  onReset: () => void;
  filteredCount: number;
  totalCount: number;
}

const STORAGE_KEY = "dsefilter_saved_presets";

const PRESET_LABELS: Record<string, string> = {
  sharia: "DSES Sharia",
  gainers: "Top Gainers",
  losers: "Top Losers",
  high_yield: "Yield ≥ 5%",
  low_pe: "P/E ≤ 15",
  undervalued_pb: "P/B < 1",
  zero_debt: "Zero Debt",
  high_sponsor: "Sponsor ≥ 50%",
};

export function ActiveFilters({
  filters,
  setFilters,
  onReset,
  filteredCount,
  totalCount,
}: ActiveFiltersProps) {
  const [savedPresets, setSavedPresets] = useState<CustomPreset[]>([]);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [newPresetName, setNewPresetName] = useState("");

  // Load custom presets from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedPresets(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load saved presets", e);
    }
  }, []);

  const saveCurrentPreset = () => {
    if (!newPresetName.trim()) return;
    const newPreset: CustomPreset = {
      id: Date.now().toString(),
      name: newPresetName.trim(),
      createdAt: Date.now(),
      filters: { ...filters, preset: "custom" },
    };

    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to save preset", e);
    }
    setNewPresetName("");
    setSaveDialogOpen(false);
  };

  const deletePreset = (id: string) => {
    const updated = savedPresets.filter((p) => p.id !== id);
    setSavedPresets(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error("Failed to delete preset", e);
    }
  };

  const applyPreset = (preset: CustomPreset) => {
    setFilters(preset.filters);
  };

  // Generate active filter items
  const filterPills: { label: string; onRemove: () => void }[] = [];

  if (filters.searchQuery) {
    filterPills.push({
      label: `Search: "${filters.searchQuery}"`,
      onRemove: () => setFilters((p) => ({ ...p, searchQuery: "" })),
    });
  }

  if (filters.preset !== "all") {
    const presetLabel = PRESET_LABELS[filters.preset] || filters.preset;
    filterPills.push({
      label: `Preset: ${presetLabel}`,
      onRemove: () => setFilters((p) => ({ ...p, preset: "all" })),
    });
  }

  filters.sectors.forEach((sec) => {
    filterPills.push({
      label: `Sector: ${sec}`,
      onRemove: () =>
        setFilters((p) => ({ ...p, sectors: p.sectors.filter((s) => s !== sec) })),
    });
  });

  filters.categories.forEach((cat) => {
    filterPills.push({
      label: `Cat: ${cat}`,
      onRemove: () =>
        setFilters((p) => ({ ...p, categories: p.categories.filter((c) => c !== cat) })),
    });
  });

  filters.instruments.forEach((inst) => {
    filterPills.push({
      label: `Type: ${inst}`,
      onRemove: () =>
        setFilters((p) => ({ ...p, instruments: p.instruments.filter((i) => i !== inst) })),
    });
  });

  filters.operationalStatuses.forEach((st) => {
    filterPills.push({
      label: `Status: ${st}`,
      onRemove: () =>
        setFilters((p) => ({
          ...p,
          operationalStatuses: p.operationalStatuses.filter((s) => s !== st),
        })),
    });
  });

  if (filters.shariaOnly) {
    filterPills.push({
      label: "DSES Sharia",
      onRemove: () => setFilters((p) => ({ ...p, shariaOnly: false })),
    });
  }

  if (filters.zeroDebtOnly) {
    filterPills.push({
      label: "Zero Debt",
      onRemove: () => setFilters((p) => ({ ...p, zeroDebtOnly: false })),
    });
  }

  if (filters.excludeLossMaking) {
    filterPills.push({
      label: "EPS > 0",
      onRemove: () => setFilters((p) => ({ ...p, excludeLossMaking: false })),
    });
  }

  if (filters.excludeNegativePE) {
    filterPills.push({
      label: "Positive P/E",
      onRemove: () => setFilters((p) => ({ ...p, excludeNegativePE: false })),
    });
  }

  if (filters.excludeZeroDividend) {
    filterPills.push({
      label: "Dividend > 0",
      onRemove: () => setFilters((p) => ({ ...p, excludeZeroDividend: false })),
    });
  }

  // Ranges
  const addRangePill = (name: string, range: { min?: number | null; max?: number | null }, key: keyof FilterState) => {
    if (range.min !== undefined && range.min !== null && range.max !== undefined && range.max !== null) {
      filterPills.push({
        label: `${name}: ${range.min} - ${range.max}`,
        onRemove: () => setFilters((p) => ({ ...p, [key]: {} })),
      });
    } else if (range.min !== undefined && range.min !== null) {
      filterPills.push({
        label: `${name} ≥ ${range.min}`,
        onRemove: () => setFilters((p) => ({ ...p, [key]: {} })),
      });
    } else if (range.max !== undefined && range.max !== null) {
      filterPills.push({
        label: `${name} ≤ ${range.max}`,
        onRemove: () => setFilters((p) => ({ ...p, [key]: {} })),
      });
    }
  };

  addRangePill("LTP", filters.ltpRange, "ltpRange");
  addRangePill("Change %", filters.changePctRange, "changePctRange");
  addRangePill("P/E", filters.peRange, "peRange");
  addRangePill("Yield %", filters.divYieldRange, "divYieldRange");
  addRangePill("P/B", filters.pbRange, "pbRange");
  addRangePill("Mkt Cap Mn", filters.marketCapRange, "marketCapRange");
  addRangePill("Paid-Up Cap Mn", filters.paidUpCapRange, "paidUpCapRange");
  addRangePill("NAV", filters.navRange, "navRange");
  addRangePill("EPS", filters.epsRange, "epsRange");
  addRangePill("Net Profit Mn", filters.netProfitRange, "netProfitRange");
  addRangePill("Debt Mn", filters.debtRange, "debtRange");
  addRangePill("Listing Year", filters.listingYearRange, "listingYearRange");
  addRangePill("Sponsor %", filters.sponsorPctRange, "sponsorPctRange");
  addRangePill("Institute %", filters.institutePctRange, "institutePctRange");
  addRangePill("Foreign %", filters.foreignPctRange, "foreignPctRange");
  addRangePill("Public %", filters.publicPctRange, "publicPctRange");
  addRangePill("Govt %", filters.govtPctRange, "govtPctRange");
  addRangePill("Volume", filters.volumeRange, "volumeRange");
  addRangePill("Turnover Mn", filters.turnoverRange, "turnoverRange");
  addRangePill("Trades", filters.tradesRange, "tradesRange");

  return (
    <div className="flex flex-col gap-2">
      {/* Active Filter Pills Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground font-medium">
            {filteredCount === totalCount ? (
              <>Showing <strong className="text-foreground">{totalCount}</strong> stocks</>
            ) : (
              <>
                Showing <strong className="text-foreground">{filteredCount}</strong> of{" "}
                {totalCount} stocks
              </>
            )}
          </span>

          {filterPills.map((pill, idx) => (
            <Badge
              key={idx}
              variant="secondary"
              className="gap-1 px-2 py-0.5 text-[11px] font-normal rounded-md border border-border/60 hover:bg-secondary/80"
            >
              <span>{pill.label}</span>
              <button
                onClick={pill.onRemove}
                className="text-muted-foreground hover:text-foreground ml-0.5"
                aria-label={`Remove filter ${pill.label}`}
              >
                <X className="size-3" />
              </button>
            </Badge>
          ))}

          {filterPills.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onReset}
              className="h-6 text-[11px] text-muted-foreground hover:text-destructive gap-1 px-1.5"
            >
              <RotateCcw className="size-2.5" />
              Reset All
            </Button>
          )}
        </div>

        {/* Custom Preset Actions */}
        <div className="flex items-center gap-1.5">
          {filterPills.length > 0 && (
            <Dialog open={saveDialogOpen} onOpenChange={setSaveDialogOpen}>
              <DialogTrigger
                render={
                  <Button variant="ghost" size="xs" className="h-6 text-[11px] gap-1 px-1.5 text-muted-foreground hover:text-foreground">
                    <BookmarkPlus className="size-3" />
                    <span>Save View</span>
                  </Button>
                }
              />
              <DialogContent className="sm:max-w-xs">
                <DialogHeader>
                  <DialogTitle className="text-sm font-semibold">Save Custom Preset</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                  <Input
                    id="custom-preset-name"
                    name="custom-preset-name"
                    aria-label="Preset name"
                    placeholder="e.g. High Yield + Low Debt"
                    value={newPresetName}
                    onChange={(e) => setNewPresetName(e.target.value)}
                    className="text-xs h-8"
                    autoFocus
                  />
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    size="sm"
                    onClick={saveCurrentPreset}
                    disabled={!newPresetName.trim()}
                    className="text-xs w-full"
                  >
                    Save Preset
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {/* Saved Presets Dropdown/Chips */}
          {savedPresets.length > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Saved:</span>
              {savedPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="inline-flex items-center rounded-md bg-secondary/80 border border-border/80 text-[11px] pl-2 pr-1 py-0.5 gap-1"
                >
                  <button
                    onClick={() => applyPreset(preset)}
                    className="font-medium text-foreground hover:underline cursor-pointer"
                  >
                    {preset.name}
                  </button>
                  <button
                    onClick={() => deletePreset(preset.id)}
                    className="text-muted-foreground hover:text-destructive"
                    title="Delete preset"
                  >
                    <X className="size-2.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
