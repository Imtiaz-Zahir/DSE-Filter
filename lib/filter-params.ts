import type { FilterState } from "@/lib/types";
import { initialFilterState } from "@/lib/stocks";

interface SearchParamsReader {
  get(name: string): string | null;
  getAll(name: string): string[];
}

type ArrayFilterKey =
  | "sectors"
  | "categories"
  | "instruments"
  | "operationalStatuses";

type BooleanFilterKey =
  | "shariaOnly"
  | "zeroDebtOnly"
  | "excludeLossMaking"
  | "excludeNegativePE"
  | "excludeZeroDividend";

type RangeFilterKey =
  | "ltpRange"
  | "changePctRange"
  | "peRange"
  | "divYieldRange"
  | "pbRange"
  | "marketCapRange"
  | "paidUpCapRange"
  | "navRange"
  | "epsRange"
  | "netProfitRange"
  | "debtRange"
  | "listingYearRange"
  | "sponsorPctRange"
  | "institutePctRange"
  | "foreignPctRange"
  | "publicPctRange"
  | "govtPctRange"
  | "volumeRange"
  | "turnoverRange"
  | "tradesRange";

const ARRAY_PARAMS: ReadonlyArray<readonly [ArrayFilterKey, string]> = [
  ["sectors", "sector"],
  ["categories", "category"],
  ["instruments", "instrument"],
  ["operationalStatuses", "status"],
];

const BOOLEAN_PARAMS: ReadonlyArray<readonly [BooleanFilterKey, string]> = [
  ["shariaOnly", "sharia"],
  ["zeroDebtOnly", "zeroDebt"],
  ["excludeLossMaking", "excludeLossMaking"],
  ["excludeNegativePE", "excludeNegativePE"],
  ["excludeZeroDividend", "excludeZeroDividend"],
];

const RANGE_PARAMS: ReadonlyArray<readonly [RangeFilterKey, string]> = [
  ["ltpRange", "ltp"],
  ["changePctRange", "changePct"],
  ["peRange", "pe"],
  ["divYieldRange", "divYield"],
  ["pbRange", "pb"],
  ["marketCapRange", "marketCap"],
  ["paidUpCapRange", "paidUpCap"],
  ["navRange", "nav"],
  ["epsRange", "eps"],
  ["netProfitRange", "netProfit"],
  ["debtRange", "debt"],
  ["listingYearRange", "listingYear"],
  ["sponsorPctRange", "sponsorPct"],
  ["institutePctRange", "institutePct"],
  ["foreignPctRange", "foreignPct"],
  ["publicPctRange", "publicPct"],
  ["govtPctRange", "govtPct"],
  ["volumeRange", "volume"],
  ["turnoverRange", "turnover"],
  ["tradesRange", "trades"],
];

function readNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;

  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

export function filtersFromSearchParams(
  searchParams: SearchParamsReader | null,
): FilterState {
  const filters: FilterState = {
    ...initialFilterState,
    searchQuery: searchParams?.get("q") ?? "",
    preset: searchParams?.get("preset") || "all",
  };

  for (const [filterKey, paramKey] of ARRAY_PARAMS) {
    filters[filterKey] = searchParams?.getAll(paramKey).filter(Boolean) ?? [];
  }

  for (const [filterKey, paramKey] of BOOLEAN_PARAMS) {
    filters[filterKey] = searchParams?.get(paramKey) === "true";
  }

  for (const [filterKey, paramPrefix] of RANGE_PARAMS) {
    const min = readNumber(searchParams?.get(`${paramPrefix}Min`) ?? null);
    const max = readNumber(searchParams?.get(`${paramPrefix}Max`) ?? null);
    filters[filterKey] = { min, max };
  }

  return filters;
}

export function filtersToSearchParams(filters: FilterState): URLSearchParams {
  const searchParams = new URLSearchParams();

  if (filters.preset && filters.preset !== "all") {
    searchParams.set("preset", filters.preset);
  }
  if (filters.searchQuery.trim()) {
    searchParams.set("q", filters.searchQuery.trim());
  }

  for (const [filterKey, paramKey] of ARRAY_PARAMS) {
    for (const value of filters[filterKey]) {
      searchParams.append(paramKey, value);
    }
  }

  for (const [filterKey, paramKey] of BOOLEAN_PARAMS) {
    if (filters[filterKey]) searchParams.set(paramKey, "true");
  }

  for (const [filterKey, paramPrefix] of RANGE_PARAMS) {
    const range = filters[filterKey];
    if (range.min !== undefined && range.min !== null && Number.isFinite(range.min)) {
      searchParams.set(`${paramPrefix}Min`, String(range.min));
    }
    if (range.max !== undefined && range.max !== null && Number.isFinite(range.max)) {
      searchParams.set(`${paramPrefix}Max`, String(range.max));
    }
  }

  return searchParams;
}
