"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Building2, TrendingUp, TrendingDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import searchIndex from "@/data/search_index.json";
import { getLtp, getChange, getChangePct, getCategory, getSector, getShariaCompliant } from "@/lib/stocks";
import { formatBDT, formatPct, getCategoryBadgeVariant, getChangeColorClass } from "@/lib/utils";

export function QuickSearch() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const allStocks = searchIndex;

  // Keyboard shortcut Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = React.useMemo(() => {
    if (!query.trim()) {
      return allStocks.slice(0, 8);
    }
    const q = query.trim().toLowerCase();
    return allStocks
      .filter((s) => {
        const code = (s.tradingCode || "").toLowerCase();
        const name = (s.companyName || "").toLowerCase();
        const sector = getSector(s).toLowerCase();
        return code.includes(q) || name.includes(q) || sector.includes(q);
      })
      .slice(0, 15);
  }, [allStocks, query]);

  // Reset selected index when filtered list changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = (code: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/stock/${encodeURIComponent(code)}`);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const current = filtered[selectedIndex];
      if (current) {
        handleSelect(current.tradingCode);
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className="relative h-8 w-full max-w-[200px] justify-start rounded-lg bg-muted/40 px-2.5 text-xs text-muted-foreground sm:w-56 sm:pr-12 md:w-64"
          >
            <Search className="mr-2 size-3.5" />
            <span className="inline-flex">Search DSE stocks...</span>
            <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 sm:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>
        }
      />
      <DialogContent className="overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="p-3 pb-0 border-b border-border/50">
          <div className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground shrink-0" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Search ticker (GP, SQURPHARMA), company, or sector..."
              className="h-10 border-0 bg-transparent text-sm shadow-none focus-visible:ring-0 placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
        </DialogHeader>

        <div className="max-h-[340px] overflow-y-auto p-2">
          <div className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {query.trim() ? "Search Results" : "Featured Companies"}
          </div>

          {filtered.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No DSE companies found matching &ldquo;{query}&rdquo;
            </div>
          ) : (
            <div className="space-y-1">
              {filtered.map((stock, idx) => {
                const code = stock.tradingCode;
                const ltp = getLtp(stock);
                const chg = getChange(stock);
                const chgPct = getChangePct(stock);
                const cat = getCategory(stock);
                const isSharia = getShariaCompliant(stock);
                const sector = getSector(stock);
                const isSelected = idx === selectedIndex;

                return (
                  <button
                    key={code}
                    onClick={() => handleSelect(code)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors focus:outline-none ${
                      isSelected ? "bg-muted text-foreground" : "hover:bg-muted/70"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-xs font-bold text-foreground">
                        {code.slice(0, 3)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-semibold text-foreground text-sm leading-none">
                            {code}
                          </span>
                          <Badge variant={getCategoryBadgeVariant(cat)} className="text-[10px] h-4 px-1">
                            {cat}
                          </Badge>
                          {isSharia && (
                            <Badge variant="outline" className="text-[10px] h-4 px-1 text-emerald-600 border-emerald-500/30 bg-emerald-500/10 dark:text-emerald-400">
                              DSES
                            </Badge>
                          )}
                        </div>
                        <div className="truncate text-xs text-muted-foreground mt-0.5 max-w-[220px] sm:max-w-[280px]">
                          {stock.companyName} • {sector}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="font-medium text-sm text-foreground">
                        {formatBDT(ltp)}
                      </div>
                      <div className={`text-xs font-medium flex items-center justify-end gap-0.5 ${getChangeColorClass(chg)}`}>
                        {chg !== null && chg > 0 ? (
                          <TrendingUp className="size-3" />
                        ) : chg !== null && chg < 0 ? (
                          <TrendingDown className="size-3" />
                        ) : null}
                        <span>{formatPct(chgPct)}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
