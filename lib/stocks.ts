import {
  Stock,
  FilterState,
  SortConfig,
  SummaryStats,
  ShareHolding,
  AuditedFinancial,
  HistoricalDividendPE,
} from "./types";
import rawStocksData from "@/data/dse_stocks.json";

// Cast JSON data safely to Stock[]
const allStocks: Stock[] = rawStocksData as unknown as Stock[];

// Safe extraction helpers
export function getTradingCode(stock: Stock): string {
  return stock.tradingCode || "";
}

export function getCompanyName(stock: Stock): string {
  return stock.companyName || stock.tradingCode || "";
}

export function getSector(stock: Stock): string {
  return stock.basicInformation?.sector || "Miscellaneous";
}

export function getCategory(stock: Stock): string {
  const cat = stock.dividendAndSurplus?.marketCategory;
  if (!cat || cat === "-") return "Unknown";
  return cat.toUpperCase();
}

export function getShariaCompliant(stock: Stock): boolean {
  return Boolean(stock.shariaCompliant);
}

export function getLtp(stock: Stock): number | null {
  const price = stock.overview?.LTP ?? stock.marketInformation?.lastTradingPrice;
  return typeof price === "number" && !isNaN(price) ? price : null;
}

export function getChange(stock: Stock): number | null {
  const chg = stock.overview?.CHANGE ?? stock.marketInformation?.change;
  return typeof chg === "number" && !isNaN(chg) ? chg : null;
}

export function getYcp(stock: Stock): number | null {
  const ycp = stock.overview?.YCP ?? stock.marketInformation?.yesterdaysClose;
  return typeof ycp === "number" && !isNaN(ycp) ? ycp : null;
}

export function getChangePct(stock: Stock): number | null {
  const chg = getChange(stock);
  const ycp = getYcp(stock);
  if (chg !== null && ycp !== null && ycp > 0) {
    return (chg / ycp) * 100;
  }
  const ltp = getLtp(stock);
  if (ltp !== null && ycp !== null && ycp > 0) {
    return ((ltp - ycp) / ycp) * 100;
  }
  return null;
}

export function getDayHigh(stock: Stock): number | null {
  const val = stock.overview?.HIGH ?? stock.marketInformation?.daysRange?.[1];
  return typeof val === "number" && !isNaN(val) ? val : null;
}

export function getDayLow(stock: Stock): number | null {
  const val = stock.overview?.LOW ?? stock.marketInformation?.daysRange?.[0];
  return typeof val === "number" && !isNaN(val) ? val : null;
}

export function get52WeekRange(stock: Stock): [number, number] | null {
  const range = stock.marketInformation?.movingRange52Weeks;
  if (
    Array.isArray(range) &&
    range.length === 2 &&
    typeof range[0] === "number" &&
    typeof range[1] === "number"
  ) {
    return [range[0], range[1]];
  }
  return null;
}

export function getAuditedPe(stock: Stock): number | null {
  const audited = stock.peRatios?.audited;
  if (Array.isArray(audited) && audited.length > 0) {
    // Traverse backwards to find latest non-null pe
    for (let i = audited.length - 1; i >= 0; i--) {
      const item = audited[i];
      const pe = item.peBasic ?? item.peDiluted;
      if (typeof pe === "number" && !isNaN(pe)) return pe;
    }
  }
  return null;
}

export function getUnauditedPe(stock: Stock): number | null {
  const unaudited = stock.peRatios?.unaudited;
  if (Array.isArray(unaudited) && unaudited.length > 0) {
    for (let i = unaudited.length - 1; i >= 0; i--) {
      const item = unaudited[i];
      const pe = item.peTrailing ?? item.peBasic ?? item.peDiluted;
      if (typeof pe === "number" && !isNaN(pe)) return pe;
    }
  }
  return null;
}

export function getPe(stock: Stock): number | null {
  return getAuditedPe(stock) ?? getUnauditedPe(stock);
}

export function getLatestAuditedFinancial(stock: Stock): AuditedFinancial | null {
  const financials = stock.auditedFinancials;
  if (Array.isArray(financials) && financials.length > 0) {
    // Sort or get highest year
    const sorted = [...financials].sort((a, b) => (b.year || 0) - (a.year || 0));
    return sorted[0] || null;
  }
  return null;
}

export function getNav(stock: Stock): number | null {
  const latest = getLatestAuditedFinancial(stock);
  if (latest) {
    const nav = latest.navPerShareRestated ?? latest.navPerShareOriginal;
    if (typeof nav === "number" && !isNaN(nav)) return nav;
  }
  return null;
}

export function getPbRatio(stock: Stock): number | null {
  const ltp = getLtp(stock);
  const nav = getNav(stock);
  if (ltp !== null && nav !== null && nav > 0) {
    return parseFloat((ltp / nav).toFixed(2));
  }
  return null;
}

export function getEps(stock: Stock): number | null {
  const latest = getLatestAuditedFinancial(stock);
  if (latest) {
    const eps =
      latest.epsDilutedRestated ??
      latest.epsBasicRestated ??
      latest.epsDilutedOriginal ??
      latest.epsBasicOriginal;
    if (typeof eps === "number" && !isNaN(eps)) return eps;
  }
  // Fallback to interim financials if needed
  const interims = stock.interimFinancials;
  if (Array.isArray(interims) && interims.length > 0) {
    const annual = interims.find((i) => i.period === "Annual" || i.period === "9 Months");
    if (annual && typeof annual.epsBasic === "number" && !isNaN(annual.epsBasic)) {
      return annual.epsBasic;
    }
  }
  return null;
}

export function getNetProfitMn(stock: Stock): number | null {
  const latest = getLatestAuditedFinancial(stock);
  if (latest) {
    const np =
      latest.profitForTheYearMnRestated ??
      latest.profitForTheYearMnOriginal ??
      latest.tciRestated ??
      latest.tciOriginal;
    if (typeof np === "number" && !isNaN(np)) return np;
  }
  return null;
}

export function getDivYieldPct(stock: Stock): number | null {
  const hist = stock.historicalDividendPE;
  if (Array.isArray(hist) && hist.length > 0) {
    const sorted = [...hist].sort((a, b) => (b.year || 0) - (a.year || 0));
    for (const item of sorted) {
      if (typeof item.dividendYieldPct === "number" && !isNaN(item.dividendYieldPct)) {
        return item.dividendYieldPct;
      }
    }
  }
  return null;
}

export function getMarketCap(stock: Stock): number | null {
  const cap = stock.marketInformation?.marketCapMn;
  return typeof cap === "number" && !isNaN(cap) ? cap : null;
}

export function getFreeFloatCap(stock: Stock): number | null {
  const cap = stock.marketInformation?.freeFloatMarketCapMn;
  return typeof cap === "number" && !isNaN(cap) ? cap : null;
}

export function getPaidUpCap(stock: Stock): number | null {
  const cap = stock.basicInformation?.paidUpCapitalMn;
  return typeof cap === "number" && !isNaN(cap) ? cap : null;
}

export function getAuthorizedCap(stock: Stock): number | null {
  const cap = stock.basicInformation?.authorizedCapitalMn;
  return typeof cap === "number" && !isNaN(cap) ? cap : null;
}

export function getVolume(stock: Stock): number | null {
  const vol = stock.overview?.VOLUME ?? stock.marketInformation?.daysVolumeNos;
  return typeof vol === "number" && !isNaN(vol) ? vol : null;
}

export function getTurnover(stock: Stock): number | null {
  const val = stock.overview?.["VALUE (mn)"] ?? stock.marketInformation?.daysValueMn;
  return typeof val === "number" && !isNaN(val) ? val : null;
}

export function getTrades(stock: Stock): number | null {
  const trades = stock.overview?.TRADE ?? stock.marketInformation?.daysTradeNos;
  return typeof trades === "number" && !isNaN(trades) ? trades : null;
}

export function getDebt(stock: Stock): number {
  const debt = stock.operationalLoanStatus?.longTermLoanMn;
  return typeof debt === "number" && !isNaN(debt) ? debt : 0;
}

export function getListingYear(stock: Stock): number | null {
  const year = stock.dividendAndSurplus?.listingYear;
  return typeof year === "number" && !isNaN(year) ? year : null;
}

export function getInstrumentType(stock: Stock): string {
  return stock.basicInformation?.typeOfInstrument || "Equity";
}

export function getOperationalStatus(stock: Stock): string {
  return stock.operationalLoanStatus?.presentOperationalStatus || "Active";
}

export function getLatestShareholding(stock: Stock): ShareHolding | null {
  const holdings = stock.shareHoldings;
  if (Array.isArray(holdings) && holdings.length > 0) {
    return holdings[holdings.length - 1] || null;
  }
  return null;
}

export function getSponsorPct(stock: Stock): number | null {
  const holding = getLatestShareholding(stock);
  return typeof holding?.sponsorDirectorPct === "number" ? holding.sponsorDirectorPct : null;
}

export function getInstitutePct(stock: Stock): number | null {
  const holding = getLatestShareholding(stock);
  return typeof holding?.institutePct === "number" ? holding.institutePct : null;
}

export function getForeignPct(stock: Stock): number | null {
  const holding = getLatestShareholding(stock);
  return typeof holding?.foreignPct === "number" ? holding.foreignPct : null;
}

export function getPublicPct(stock: Stock): number | null {
  const holding = getLatestShareholding(stock);
  return typeof holding?.publicPct === "number" ? holding.publicPct : null;
}

export function getGovtPct(stock: Stock): number | null {
  const holding = getLatestShareholding(stock);
  return typeof holding?.govtPct === "number" ? holding.govtPct : null;
}

// Data accessors
export function getAllStocks(): Stock[] {
  return allStocks;
}

export function getStockByCode(code: string): Stock | undefined {
  const normalized = (code || "").trim().toUpperCase();
  return allStocks.find(
    (s) => s.tradingCode?.toUpperCase() === normalized || s.scripCode === normalized
  );
}

export function getAllTradingCodes(): string[] {
  return allStocks.map((s) => s.tradingCode).filter(Boolean);
}

export function getAllSectors(): string[] {
  const sectors = new Set<string>();
  allStocks.forEach((s) => {
    const sec = getSector(s);
    if (sec) sectors.add(sec);
  });
  return Array.from(sectors).sort();
}

export function getAllCategories(): string[] {
  const cats = new Set<string>();
  allStocks.forEach((s) => {
    const cat = getCategory(s);
    if (cat && cat !== "Unknown") cats.add(cat);
  });
  return Array.from(cats).sort();
}

export function getAllInstruments(): string[] {
  const insts = new Set<string>();
  allStocks.forEach((s) => {
    const inst = getInstrumentType(s);
    if (inst) insts.add(inst);
  });
  return Array.from(insts).sort();
}

export function getAllOperationalStatuses(): string[] {
  const statuses = new Set<string>();
  allStocks.forEach((s) => {
    const st = getOperationalStatus(s);
    if (st) statuses.add(st);
  });
  return Array.from(statuses).sort();
}

// Peer stocks
export function getPeerStocks(stock: Stock, stocks: Stock[] = allStocks, limit = 4): Stock[] {
  const sector = getSector(stock);
  const currentCode = getTradingCode(stock);
  
  return stocks
    .filter((s) => getSector(s) === sector && getTradingCode(s) !== currentCode)
    .sort((a, b) => (getMarketCap(b) || 0) - (getMarketCap(a) || 0))
    .slice(0, limit);
}

// Summary stats calculation
export function calculateSummaryStats(stocks: Stock[]): SummaryStats {
  let totalMarketCapMn = 0;
  let peSum = 0;
  let peCount = 0;
  let yieldSum = 0;
  let yieldCount = 0;
  let gainersCount = 0;
  let losersCount = 0;
  let unchangedCount = 0;
  let totalTurnoverMn = 0;
  let totalVolume = 0;
  let totalTrades = 0;
  let shariaCount = 0;

  for (const s of stocks) {
    if (getShariaCompliant(s)) shariaCount++;

    const mktCap = getMarketCap(s);
    if (mktCap) totalMarketCapMn += mktCap;

    const pe = getPe(s);
    if (pe !== null && pe > 0 && pe < 200) {
      peSum += pe;
      peCount++;
    }

    const yld = getDivYieldPct(s);
    if (yld !== null && yld > 0) {
      yieldSum += yld;
      yieldCount++;
    }

    const chg = getChange(s);
    if (chg !== null) {
      if (chg > 0) gainersCount++;
      else if (chg < 0) losersCount++;
      else unchangedCount++;
    } else {
      unchangedCount++;
    }

    const turnover = getTurnover(s);
    if (turnover) totalTurnoverMn += turnover;

    const volume = getVolume(s);
    if (volume) totalVolume += volume;

    const trades = getTrades(s);
    if (trades) totalTrades += trades;
  }

  return {
    totalStocks: stocks.length,
    shariaCount,
    totalMarketCapMn,
    averagePe: peCount > 0 ? parseFloat((peSum / peCount).toFixed(2)) : null,
    averageDivYield: yieldCount > 0 ? parseFloat((yieldSum / yieldCount).toFixed(2)) : null,
    gainersCount,
    losersCount,
    unchangedCount,
    totalTurnoverMn,
    totalVolume,
    totalTrades,
  };
}

// Check if range matches
function matchesRange(val: number | null | undefined, range: { min?: number | null; max?: number | null }): boolean {
  if (range.min !== undefined && range.min !== null) {
    if (val === null || val === undefined || val < range.min) return false;
  }
  if (range.max !== undefined && range.max !== null) {
    if (val === null || val === undefined || val > range.max) return false;
  }
  return true;
}

// Filtering and Sorting
export function filterAndSortStocks(
  stocks: Stock[],
  filters: FilterState,
  sortConfig: SortConfig
): Stock[] {
  let result = stocks.filter((stock) => {
    // 1. Search Query (Trading Code, Company Name, Scrip Code, Sector)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      const code = getTradingCode(stock).toLowerCase();
      const name = getCompanyName(stock).toLowerCase();
      const scrip = (stock.scripCode || "").toLowerCase();
      const sec = getSector(stock).toLowerCase();
      if (!code.includes(q) && !name.includes(q) && !scrip.includes(q) && !sec.includes(q)) {
        return false;
      }
    }

    // 2. Preset Filter Shortcuts
    if (filters.preset === "sharia" && !getShariaCompliant(stock)) return false;
    if (filters.preset === "gainers") {
      const chg = getChange(stock);
      if (chg === null || chg <= 0) return false;
    }
    if (filters.preset === "losers") {
      const chg = getChange(stock);
      if (chg === null || chg >= 0) return false;
    }
    if (filters.preset === "high_yield") {
      const yld = getDivYieldPct(stock);
      if (yld === null || yld < 5) return false;
    }
    if (filters.preset === "low_pe") {
      const pe = getPe(stock);
      if (pe === null || pe <= 0 || pe > 15) return false;
    }
    if (filters.preset === "undervalued_pb") {
      const pb = getPbRatio(stock);
      if (pb === null || pb <= 0 || pb >= 1) return false;
    }
    if (filters.preset === "zero_debt" && getDebt(stock) > 0) return false;
    if (filters.preset === "high_sponsor") {
      const sp = getSponsorPct(stock);
      if (sp === null || sp < 50) return false;
    }

    // 3. Categorical Filters
    if (filters.sectors.length > 0 && !filters.sectors.includes(getSector(stock))) {
      return false;
    }
    if (filters.categories.length > 0 && !filters.categories.includes(getCategory(stock))) {
      return false;
    }
    if (filters.instruments.length > 0 && !filters.instruments.includes(getInstrumentType(stock))) {
      return false;
    }
    if (
      filters.operationalStatuses.length > 0 &&
      !filters.operationalStatuses.includes(getOperationalStatus(stock))
    ) {
      return false;
    }

    // 4. Boolean Flags
    if (filters.shariaOnly && !getShariaCompliant(stock)) return false;
    if (filters.zeroDebtOnly && getDebt(stock) > 0) return false;
    if (filters.excludeLossMaking) {
      const eps = getEps(stock);
      if (eps !== null && eps <= 0) return false;
    }
    if (filters.excludeNegativePE) {
      const pe = getPe(stock);
      if (pe !== null && pe <= 0) return false;
    }
    if (filters.excludeZeroDividend) {
      const yld = getDivYieldPct(stock);
      if (yld === null || yld <= 0) return false;
    }

    // 5. Numerical Range Filters
    if (!matchesRange(getLtp(stock), filters.ltpRange)) return false;
    if (!matchesRange(getChangePct(stock), filters.changePctRange)) return false;
    if (!matchesRange(getPe(stock), filters.peRange)) return false;
    if (!matchesRange(getDivYieldPct(stock), filters.divYieldRange)) return false;
    if (!matchesRange(getPbRatio(stock), filters.pbRange)) return false;
    if (!matchesRange(getMarketCap(stock), filters.marketCapRange)) return false;
    if (!matchesRange(getPaidUpCap(stock), filters.paidUpCapRange)) return false;
    if (!matchesRange(getNav(stock), filters.navRange)) return false;
    if (!matchesRange(getEps(stock), filters.epsRange)) return false;
    if (!matchesRange(getNetProfitMn(stock), filters.netProfitRange)) return false;
    if (!matchesRange(getDebt(stock), filters.debtRange)) return false;
    if (!matchesRange(getListingYear(stock), filters.listingYearRange)) return false;

    // 6. Shareholding Ranges
    if (!matchesRange(getSponsorPct(stock), filters.sponsorPctRange)) return false;
    if (!matchesRange(getInstitutePct(stock), filters.institutePctRange)) return false;
    if (!matchesRange(getForeignPct(stock), filters.foreignPctRange)) return false;
    if (!matchesRange(getPublicPct(stock), filters.publicPctRange)) return false;
    if (!matchesRange(getGovtPct(stock), filters.govtPctRange)) return false;

    // 7. Market Activity Ranges
    if (!matchesRange(getVolume(stock), filters.volumeRange)) return false;
    if (!matchesRange(getTurnover(stock), filters.turnoverRange)) return false;
    if (!matchesRange(getTrades(stock), filters.tradesRange)) return false;

    return true;
  });

  // Sorting
  result.sort((a, b) => {
    let valA: any = null;
    let valB: any = null;

    switch (sortConfig.field) {
      case "tradingCode":
        valA = getTradingCode(a);
        valB = getTradingCode(b);
        break;
      case "companyName":
        valA = getCompanyName(a);
        valB = getCompanyName(b);
        break;
      case "sector":
        valA = getSector(a);
        valB = getSector(b);
        break;
      case "category":
        valA = getCategory(a);
        valB = getCategory(b);
        break;
      case "ltp":
        valA = getLtp(a);
        valB = getLtp(b);
        break;
      case "changePct":
        valA = getChangePct(a);
        valB = getChangePct(b);
        break;
      case "pe":
        valA = getPe(a);
        valB = getPe(b);
        break;
      case "divYield":
        valA = getDivYieldPct(a);
        valB = getDivYieldPct(b);
        break;
      case "pb":
        valA = getPbRatio(a);
        valB = getPbRatio(b);
        break;
      case "nav":
        valA = getNav(a);
        valB = getNav(b);
        break;
      case "eps":
        valA = getEps(a);
        valB = getEps(b);
        break;
      case "marketCap":
        valA = getMarketCap(a);
        valB = getMarketCap(b);
        break;
      case "paidUpCap":
        valA = getPaidUpCap(a);
        valB = getPaidUpCap(b);
        break;
      case "turnover":
        valA = getTurnover(a);
        valB = getTurnover(b);
        break;
      case "volume":
        valA = getVolume(a);
        valB = getVolume(b);
        break;
      case "trades":
        valA = getTrades(a);
        valB = getTrades(b);
        break;
      case "debt":
        valA = getDebt(a);
        valB = getDebt(b);
        break;
      case "sponsorPct":
        valA = getSponsorPct(a);
        valB = getSponsorPct(b);
        break;
      case "listingYear":
        valA = getListingYear(a);
        valB = getListingYear(b);
        break;
      default:
        valA = getTradingCode(a);
        valB = getTradingCode(b);
    }

    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    if (typeof valA === "string" && typeof valB === "string") {
      return sortConfig.direction === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    }

    return sortConfig.direction === "asc" ? valA - valB : valB - valA;
  });

  return result;
}

export const initialFilterState: FilterState = {
  searchQuery: "",
  preset: "all",
  sectors: [],
  categories: [],
  instruments: [],
  operationalStatuses: [],
  shariaOnly: false,
  zeroDebtOnly: false,
  excludeLossMaking: false,
  excludeNegativePE: false,
  excludeZeroDividend: false,
  ltpRange: {},
  changePctRange: {},
  peRange: {},
  divYieldRange: {},
  pbRange: {},
  marketCapRange: {},
  paidUpCapRange: {},
  navRange: {},
  epsRange: {},
  netProfitRange: {},
  debtRange: {},
  listingYearRange: {},
  sponsorPctRange: {},
  institutePctRange: {},
  foreignPctRange: {},
  publicPctRange: {},
  govtPctRange: {},
  volumeRange: {},
  turnoverRange: {},
  tradesRange: {},
};
