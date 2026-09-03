"use client";

import React, { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Scale,
  Plus,
  X,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Stock } from "@/lib/types";
import {
  getAllStocks,
  getStockByCode,
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
  getNetProfitMn,
  getMarketCap,
  getFreeFloatCap,
  getPaidUpCap,
  getDebt,
  getListingYear,
  getSponsorPct,
  getInstitutePct,
  getForeignPct,
  getPublicPct,
  getGovtPct,
  getOperationalStatus,
  get52WeekRange,
} from "@/lib/stocks";
import {
  formatBDT,
  formatPct,
  formatNumber,
  formatLargeNumber,
  getCategoryBadgeVariant,
  getChangeColorClass,
} from "@/lib/utils";

function CompareContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const allStocks = React.useMemo(() => getAllStocks(), []);

  const [selectedCodes, setSelectedCodes] = useState<string[]>(() => {
    const raw = searchParams.get("codes");
    if (raw) {
      const parsed = raw.split(",").map((c) => c.trim().toUpperCase()).filter(Boolean);
      return Array.from(new Set(parsed)).slice(0, 4);
    }
    return ["GP", "SQURPHARMA", "BATBC"].filter((c) => getStockByCode(c));
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // Sync URL query params
  useEffect(() => {
    const newUrl = `/compare?codes=${selectedCodes.join(",")}`;
    router.replace(newUrl, { scroll: false });
  }, [selectedCodes, router]);

  const addStock = (code: string) => {
    if (selectedCodes.length >= 4 || selectedCodes.includes(code)) return;
    setSelectedCodes([...selectedCodes, code]);
    setSearchQuery("");
    setSearchOpen(false);
  };

  const removeStock = (code: string) => {
    setSelectedCodes(selectedCodes.filter((c) => c !== code));
  };

  const stocks: Stock[] = selectedCodes
    .map((code) => getStockByCode(code))
    .filter(Boolean) as Stock[];

  const searchResults = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return allStocks
      .filter(
        (s) =>
          !selectedCodes.includes(s.tradingCode) &&
          (s.tradingCode.toLowerCase().includes(q) || (s.companyName || "").toLowerCase().includes(q))
      )
      .slice(0, 6);
  }, [allStocks, searchQuery, selectedCodes]);

  // Comparison matrix definitions
  const matrixSections = [
    {
      title: "Market Valuation & Price",
      rows: [
        {
          label: "Last Traded Price (LTP)",
          getValue: (s: Stock) => formatBDT(getLtp(s)),
        },
        {
          label: "Day Change %",
          getValue: (s: Stock) => {
            const chg = getChange(s);
            const chgPct = getChangePct(s);
            return (
              <span className={`font-semibold ${getChangeColorClass(chg)}`}>
                {formatPct(chgPct)}
              </span>
            );
          },
        },
        {
          label: "P/E Ratio",
          getValue: (s: Stock) => {
            const pe = getPe(s);
            return pe !== null ? `${formatNumber(pe)}x` : "-";
          },
        },
        {
          label: "Dividend Yield %",
          getValue: (s: Stock) => {
            const yld = getDivYieldPct(s);
            return yld !== null ? `${formatNumber(yld)}%` : "-";
          },
        },
        {
          label: "Price to Book (P/B)",
          getValue: (s: Stock) => {
            const pb = getPbRatio(s);
            return pb !== null ? `${formatNumber(pb)}x` : "-";
          },
        },
        {
          label: "52-Week Range",
          getValue: (s: Stock) => {
            const range = get52WeekRange(s);
            return range ? `৳${range[0]} - ৳${range[1]}` : "-";
          },
        },
      ],
    },
    {
      title: "Financial Health & Scale",
      rows: [
        {
          label: "Market Cap",
          getValue: (s: Stock) => formatLargeNumber(getMarketCap(s)),
        },
        {
          label: "Free Float Market Cap",
          getValue: (s: Stock) => formatLargeNumber(getFreeFloatCap(s)),
        },
        {
          label: "Paid-Up Capital",
          getValue: (s: Stock) => formatLargeNumber(getPaidUpCap(s)),
        },
        {
          label: "Audited NAV per Share",
          getValue: (s: Stock) => formatBDT(getNav(s)),
        },
        {
          label: "Audited EPS per Share",
          getValue: (s: Stock) => {
            const eps = getEps(s);
            return (
              <span className={eps !== null && eps < 0 ? "text-rose-600 font-semibold" : ""}>
                {formatBDT(eps)}
              </span>
            );
          },
        },
        {
          label: "Net Profit (Annual)",
          getValue: (s: Stock) => {
            const np = getNetProfitMn(s);
            return np !== null ? `৳${formatNumber(np)} Mn` : "-";
          },
        },
        {
          label: "Long-Term Debt / Loan",
          getValue: (s: Stock) => {
            const debt = getDebt(s);
            return debt > 0 ? `৳${formatNumber(debt)} Mn` : "0.00 Mn (Zero Debt)";
          },
        },
      ],
    },
    {
      title: "Shareholding Breakdown",
      rows: [
        {
          label: "Sponsor / Director %",
          getValue: (s: Stock) => {
            const val = getSponsorPct(s);
            return val !== null ? `${val}%` : "-";
          },
        },
        {
          label: "Institutional Holding %",
          getValue: (s: Stock) => {
            const val = getInstitutePct(s);
            return val !== null ? `${val}%` : "-";
          },
        },
        {
          label: "Foreign Holding %",
          getValue: (s: Stock) => {
            const val = getForeignPct(s);
            return val !== null ? `${val}%` : "-";
          },
        },
        {
          label: "General Public %",
          getValue: (s: Stock) => {
            const val = getPublicPct(s);
            return val !== null ? `${val}%` : "-";
          },
        },
        {
          label: "Government %",
          getValue: (s: Stock) => {
            const val = getGovtPct(s);
            return val !== null ? `${val}%` : "-";
          },
        },
      ],
    },
    {
      title: "Corporate & Listing Profile",
      rows: [
        {
          label: "Market Category",
          getValue: (s: Stock) => `Category ${getCategory(s)}`,
        },
        {
          label: "DSES Sharia Status",
          getValue: (s: Stock) => (getShariaCompliant(s) ? "Compliant" : "Non-Compliant"),
        },
        {
          label: "Listing Year",
          getValue: (s: Stock) => getListingYear(s) || "-",
        },
        {
          label: "Fiscal Year End",
          getValue: (s: Stock) => s.dividendAndSurplus?.yearEnd || s.forYearEnded || "-",
        },
        {
          label: "Operational Status",
          getValue: (s: Stock) => getOperationalStatus(s),
        },
      ],
    },
  ];

  return (
    <main className="min-h-screen bg-background text-foreground pb-20">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/60 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                <ChevronLeft className="size-3.5" />
                <span>Back to Screener</span>
              </Link>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Scale className="size-6 text-primary" />
              <h1 className="font-heading text-xl sm:text-2xl font-bold text-foreground">
                DSE Stock Comparison Matrix
              </h1>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Compare valuation, profitability, debt, and shareholding across up to 4 DSE listed companies.
            </p>
          </div>

          {/* Add Stock button & Search Popover */}
          <div className="relative">
            {selectedCodes.length < 4 && (
              <div className="relative">
                <Button
                  size="sm"
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="gap-1.5 text-xs h-8.5 font-semibold"
                >
                  <Plus className="size-3.5" />
                  <span>Add Stock to Compare</span>
                </Button>

                {searchOpen && (
                  <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-border bg-popover p-2 shadow-xl animate-in fade-in zoom-in-95">
                    <Input
                      type="text"
                      placeholder="Search ticker (e.g. OLYMPIC)..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-8 text-xs"
                      autoFocus
                    />
                    <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                      {searchResults.length === 0 ? (
                        <div className="p-2 text-center text-xs text-muted-foreground">
                          {searchQuery ? "No stocks found" : "Type ticker to search"}
                        </div>
                      ) : (
                        searchResults.map((s) => (
                          <button
                            key={s.tradingCode}
                            onClick={() => addStock(s.tradingCode)}
                            className="flex w-full items-center justify-between p-1.5 rounded-lg text-xs hover:bg-muted text-left"
                          >
                            <span className="font-bold text-foreground">{s.tradingCode}</span>
                            <span className="text-[11px] text-muted-foreground truncate max-w-[140px]">
                              {s.companyName}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* If no stocks selected */}
        {stocks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/80 p-12 text-center space-y-3">
            <Scale className="size-10 text-muted-foreground mx-auto" />
            <h3 className="font-heading text-lg font-semibold text-foreground">
              No Stocks Selected for Comparison
            </h3>
            <p className="text-xs text-muted-foreground max-w-md mx-auto">
              Add at least 2 stocks using the &ldquo;Add Stock to Compare&rdquo; button above or from the main stock screener table.
            </p>
            <Button
              size="sm"
              onClick={() => setSelectedCodes(["GP", "SQURPHARMA", "BATBC"])}
              className="text-xs"
            >
              Load Example Comparison (GP vs SQURPHARMA vs BATBC)
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-border/70 bg-card shadow-2xs">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40">
                  <th className="p-3 sm:p-4 min-w-[160px] sm:min-w-[200px] font-semibold text-muted-foreground uppercase text-[11px]">
                    Metrics / Fundamental Data
                  </th>
                  {stocks.map((stock) => {
                    const code = getTradingCode(stock);
                    const cat = getCategory(stock);
                    const isSharia = getShariaCompliant(stock);
                    const sector = getSector(stock);

                    return (
                      <th
                        key={code}
                        className="p-3 sm:p-4 min-w-[180px] sm:min-w-[220px] align-top relative border-l border-border/60"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Link
                                href={`/stock/${encodeURIComponent(code)}`}
                                className="font-heading font-bold text-base text-foreground hover:text-primary transition-colors"
                              >
                                {code}
                              </Link>
                              <Badge variant={getCategoryBadgeVariant(cat)} className="text-[10px] px-1 py-0 h-4 font-bold">
                                {cat}
                              </Badge>
                              {isSharia && (
                                <span className="inline-flex items-center rounded bg-emerald-500/10 px-1 py-0.2 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                  DSES
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-muted-foreground truncate max-w-[150px] sm:max-w-[180px] mt-0.5" title={stock.companyName || ""}>
                              {stock.companyName}
                            </div>
                            <div className="text-[10px] text-muted-foreground/80 mt-0.5">
                              {sector}
                            </div>
                          </div>

                          <button
                            onClick={() => removeStock(code)}
                            className="size-6 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors"
                            aria-label={`Remove ${code}`}
                          >
                            <X className="size-3.5" />
                          </button>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {matrixSections.map((section, sIdx) => (
                  <React.Fragment key={sIdx}>
                    <tr className="bg-muted/30 border-y border-border/60">
                      <td
                        colSpan={stocks.length + 1}
                        className="p-2.5 sm:px-4 text-[11px] font-bold uppercase tracking-wider text-foreground"
                      >
                        {section.title}
                      </td>
                    </tr>

                    {section.rows.map((row, rIdx) => (
                      <tr
                        key={rIdx}
                        className="border-b border-border/30 hover:bg-muted/20 transition-colors"
                      >
                        <td className="p-3 sm:px-4 font-medium text-muted-foreground">
                          {row.label}
                        </td>
                        {stocks.map((stock) => (
                          <td
                            key={stock.tradingCode}
                            className="p-3 sm:px-4 font-semibold text-foreground border-l border-border/40"
                          >
                            {row.getValue(stock)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
          Loading comparison matrix...
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
