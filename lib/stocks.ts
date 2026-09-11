import {
  Stock,
  AnyStock,
  FilterState,
  SortConfig,
  SummaryStats,
  ShareHolding,
  AuditedFinancial,
} from "./types";
import rawMetaData from "@/data/meta.json";

// Safe extraction helpers supporting both full Stock and lightweight ScreenerStock
export function getTradingCode(stock: AnyStock): string {
  return stock.tradingCode || "";
}

export function getCompanyName(stock: AnyStock): string {
  return stock.companyName || stock.tradingCode || "";
}

export function getSector(stock: AnyStock): string {
  if ("sector" in stock && stock.sector) return stock.sector;
  return (stock as Stock).basicInformation?.sector || "Miscellaneous";
}

export function getCategory(stock: AnyStock): string {
  if ("category" in stock && stock.category && stock.category !== "-") {
    return stock.category.toUpperCase();
  }
  const cat = (stock as Stock).dividendAndSurplus?.marketCategory;
  if (!cat || cat === "-") return "Unknown";
  return cat.toUpperCase();
}

export function getShariaCompliant(stock: AnyStock): boolean {
  return Boolean(stock.shariaCompliant);
}

export function getLtp(stock: AnyStock): number | null {
  if ("ltp" in stock && stock.ltp !== undefined) return stock.ltp;
  const s = stock as Stock;
  const price = s.overview?.LTP ?? s.marketInformation?.lastTradingPrice;
  return typeof price === "number" && !isNaN(price) ? price : null;
}

export function getChange(stock: AnyStock): number | null {
  if ("change" in stock && stock.change !== undefined) return stock.change;
  const s = stock as Stock;
  const chg = s.overview?.CHANGE ?? s.marketInformation?.change;
  return typeof chg === "number" && !isNaN(chg) ? chg : null;
}

export function getYcp(stock: AnyStock): number | null {
  if ("ycp" in stock && stock.ycp !== undefined) return stock.ycp;
  const s = stock as Stock;
  const ycp = s.overview?.YCP ?? s.marketInformation?.yesterdaysClose;
  return typeof ycp === "number" && !isNaN(ycp) ? ycp : null;
}

export function getChangePct(stock: AnyStock): number | null {
  if ("changePct" in stock && stock.changePct !== undefined) return stock.changePct;
  const chg = getChange(stock);
  const ycp = getYcp(stock);
  if (chg !== null && ycp !== null && ycp > 0) {
    return parseFloat(((chg / ycp) * 100).toFixed(2));
  }
  const ltp = getLtp(stock);
  if (ltp !== null && ycp !== null && ycp > 0) {
    return parseFloat((((ltp - ycp) / ycp) * 100).toFixed(2));
  }
  return null;
}

export function getDayHigh(stock: AnyStock): number | null {
  if ("high" in stock && stock.high !== undefined) return stock.high;
  const s = stock as Stock;
  const val = s.overview?.HIGH ?? s.marketInformation?.daysRange?.[1];
  return typeof val === "number" && !isNaN(val) ? val : null;
}

export function getDayLow(stock: AnyStock): number | null {
  if ("low" in stock && stock.low !== undefined) return stock.low;
  const s = stock as Stock;
  const val = s.overview?.LOW ?? s.marketInformation?.daysRange?.[0];
  return typeof val === "number" && !isNaN(val) ? val : null;
}

export function get52WeekRange(stock: AnyStock): [number, number] | null {
  if ("range52Week" in stock && stock.range52Week) {
    return stock.range52Week as [number, number];
  }
  const range = (stock as Stock).marketInformation?.movingRange52Weeks;
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

export function getAuditedPe(stock: AnyStock): number | null {
  if ("auditedPe" in stock && stock.auditedPe !== undefined) return stock.auditedPe;
  const audited = (stock as Stock).peRatios?.audited;
  if (Array.isArray(audited) && audited.length > 0) {
    for (let i = audited.length - 1; i >= 0; i--) {
      const item = audited[i];
      const pe = item.peBasic ?? item.peDiluted;
      if (typeof pe === "number" && !isNaN(pe)) return pe;
    }
  }
  return null;
}

export function getUnauditedPe(stock: AnyStock): number | null {
  if ("unauditedPe" in stock && stock.unauditedPe !== undefined) return stock.unauditedPe;
  const unaudited = (stock as Stock).peRatios?.unaudited;
  if (Array.isArray(unaudited) && unaudited.length > 0) {
    for (let i = unaudited.length - 1; i >= 0; i--) {
      const item = unaudited[i];
      const pe = item.peTrailing ?? item.peBasic ?? item.peDiluted;
      if (typeof pe === "number" && !isNaN(pe)) return pe;
    }
  }
  return null;
}

export function getPe(stock: AnyStock): number | null {
  if ("pe" in stock && stock.pe !== undefined) return stock.pe;
  return getAuditedPe(stock) ?? getUnauditedPe(stock);
}

export function getLatestAuditedFinancial(stock: Stock): AuditedFinancial | null {
  const financials = stock.auditedFinancials;
  if (Array.isArray(financials) && financials.length > 0) {
    const sorted = [...financials].sort((a, b) => (b.year || 0) - (a.year || 0));
    return sorted[0] || null;
  }
  return null;
}

export function getNav(stock: AnyStock): number | null {
  if ("nav" in stock && stock.nav !== undefined) return stock.nav;
  const latest = getLatestAuditedFinancial(stock as Stock);
  if (latest) {
    const nav = latest.navPerShareRestated ?? latest.navPerShareOriginal;
    if (typeof nav === "number" && !isNaN(nav)) return nav;
  }
  return null;
}

export function getPbRatio(stock: AnyStock): number | null {
  if ("pb" in stock && stock.pb !== undefined) return stock.pb;
  const ltp = getLtp(stock);
  const nav = getNav(stock);
  if (ltp !== null && nav !== null && nav > 0) {
    return parseFloat((ltp / nav).toFixed(2));
  }
  return null;
}

export function getEps(stock: AnyStock): number | null {
  if ("eps" in stock && stock.eps !== undefined) return stock.eps;
  const latest = getLatestAuditedFinancial(stock as Stock);
  if (latest) {
    const eps =
      latest.epsDilutedRestated ??
      latest.epsBasicRestated ??
      latest.epsDilutedOriginal ??
      latest.epsBasicOriginal;
    if (typeof eps === "number" && !isNaN(eps)) return eps;
  }
  const interims = (stock as Stock).interimFinancials;
  if (Array.isArray(interims) && interims.length > 0) {
    const annual = interims.find((i) => i.period === "Annual" || i.period === "9 Months");
    if (annual && typeof annual.epsBasic === "number" && !isNaN(annual.epsBasic)) {
      return annual.epsBasic;
    }
  }
  return null;
}

export function getNetProfitMn(stock: AnyStock): number | null {
  if ("netProfit" in stock && stock.netProfit !== undefined) return stock.netProfit;
  const latest = getLatestAuditedFinancial(stock as Stock);
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

export function getDivYieldPct(stock: AnyStock): number | null {
  if ("divYield" in stock && stock.divYield !== undefined) return stock.divYield;
  const hist = (stock as Stock).historicalDividendPE;
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

export function getMarketCap(stock: AnyStock): number | null {
  if ("marketCap" in stock && stock.marketCap !== undefined) return stock.marketCap;
  const cap = (stock as Stock).marketInformation?.marketCapMn;
  return typeof cap === "number" && !isNaN(cap) ? cap : null;
}

export function getFreeFloatCap(stock: AnyStock): number | null {
  if ("freeFloatCap" in stock && stock.freeFloatCap !== undefined) return stock.freeFloatCap;
  const cap = (stock as Stock).marketInformation?.freeFloatMarketCapMn;
  return typeof cap === "number" && !isNaN(cap) ? cap : null;
}

export function getPaidUpCap(stock: AnyStock): number | null {
  if ("paidUpCap" in stock && stock.paidUpCap !== undefined) return stock.paidUpCap;
  const cap = (stock as Stock).basicInformation?.paidUpCapitalMn;
  return typeof cap === "number" && !isNaN(cap) ? cap : null;
}

export function getAuthorizedCap(stock: AnyStock): number | null {
  if ("authorizedCap" in stock && stock.authorizedCap !== undefined) return stock.authorizedCap;
  const cap = (stock as Stock).basicInformation?.authorizedCapitalMn;
  return typeof cap === "number" && !isNaN(cap) ? cap : null;
}

export function getVolume(stock: AnyStock): number | null {
  if ("volume" in stock && stock.volume !== undefined) return stock.volume;
  const s = stock as Stock;
  const vol = s.overview?.VOLUME ?? s.marketInformation?.daysVolumeNos;
  return typeof vol === "number" && !isNaN(vol) ? vol : null;
}

export function getTurnover(stock: AnyStock): number | null {
  if ("turnover" in stock && stock.turnover !== undefined) return stock.turnover;
  const s = stock as Stock;
  const val = s.overview?.["VALUE (mn)"] ?? s.marketInformation?.daysValueMn;
  return typeof val === "number" && !isNaN(val) ? val : null;
}

export function getTrades(stock: AnyStock): number | null {
  if ("trades" in stock && stock.trades !== undefined) return stock.trades;
  const s = stock as Stock;
  const trades = s.overview?.TRADE ?? s.marketInformation?.daysTradeNos;
  return typeof trades === "number" && !isNaN(trades) ? trades : null;
}

export function getDebt(stock: AnyStock): number {
  if ("debt" in stock && stock.debt !== undefined) return stock.debt || 0;
  const debt = (stock as Stock).operationalLoanStatus?.longTermLoanMn;
  return typeof debt === "number" && !isNaN(debt) ? debt : 0;
}

export function getListingYear(stock: AnyStock): number | null {
  if ("listingYear" in stock && stock.listingYear !== undefined) return stock.listingYear;
  const year = (stock as Stock).dividendAndSurplus?.listingYear;
  return typeof year === "number" && !isNaN(year) ? year : null;
}

export function getInstrumentType(stock: AnyStock): string {
  if ("instrumentType" in stock && stock.instrumentType) return stock.instrumentType;
  return (stock as Stock).basicInformation?.typeOfInstrument || "Equity";
}

export function getOperationalStatus(stock: AnyStock): string {
  if ("operationalStatus" in stock && stock.operationalStatus) return stock.operationalStatus;
  return (stock as Stock).operationalLoanStatus?.presentOperationalStatus || "Active";
}

export function getLatestShareholding(stock: Stock): ShareHolding | null {
  const holdings = stock.shareHoldings;
  if (Array.isArray(holdings) && holdings.length > 0) {
    return holdings[holdings.length - 1] || null;
  }
  return null;
}

export function getSponsorPct(stock: AnyStock): number | null {
  if ("sponsorPct" in stock && stock.sponsorPct !== undefined) return stock.sponsorPct;
  const holding = getLatestShareholding(stock as Stock);
  return typeof holding?.sponsorDirectorPct === "number" ? holding.sponsorDirectorPct : null;
}

export function getInstitutePct(stock: AnyStock): number | null {
  if ("institutePct" in stock && stock.institutePct !== undefined) return stock.institutePct;
  const holding = getLatestShareholding(stock as Stock);
  return typeof holding?.institutePct === "number" ? holding.institutePct : null;
}

export function getForeignPct(stock: AnyStock): number | null {
  if ("foreignPct" in stock && stock.foreignPct !== undefined) return stock.foreignPct;
  const holding = getLatestShareholding(stock as Stock);
  return typeof holding?.foreignPct === "number" ? holding.foreignPct : null;
}

export function getPublicPct(stock: AnyStock): number | null {
  if ("publicPct" in stock && stock.publicPct !== undefined) return stock.publicPct;
  const holding = getLatestShareholding(stock as Stock);
  return typeof holding?.publicPct === "number" ? holding.publicPct : null;
}

export function getGovtPct(stock: AnyStock): number | null {
  if ("govtPct" in stock && stock.govtPct !== undefined) return stock.govtPct;
  const holding = getLatestShareholding(stock as Stock);
  return typeof holding?.govtPct === "number" ? holding.govtPct : null;
}

// Static metadata accessors (pure, lightweight < 1 KB)
export function getAllSectors(stocks?: AnyStock[]): string[] {
  if (!stocks || stocks.length === 0) {
    return rawMetaData.sectors || [];
  }
  const sectors = new Set<string>();
  stocks.forEach((s) => {
    const sec = getSector(s);
    if (sec) sectors.add(sec);
  });
  return Array.from(sectors).sort();
}

export function getAllCategories(stocks?: AnyStock[]): string[] {
  if (!stocks || stocks.length === 0) {
    return rawMetaData.categories || ["A", "B", "N", "Z"];
  }
  const cats = new Set<string>();
  stocks.forEach((s) => {
    const cat = getCategory(s);
    if (cat && cat !== "Unknown") cats.add(cat);
  });
  return Array.from(cats).sort();
}

export function getAllInstruments(stocks?: AnyStock[]): string[] {
  if (!stocks || stocks.length === 0) {
    return rawMetaData.instruments || ["Equity", "Mutual Funds", "Unknown"];
  }
  const insts = new Set<string>();
  stocks.forEach((s) => {
    const inst = getInstrumentType(s);
    if (inst) insts.add(inst);
  });
  return Array.from(insts).sort();
}

export function getAllOperationalStatuses(stocks?: AnyStock[]): string[] {
  if (!stocks || stocks.length === 0) {
    return rawMetaData.operationalStatuses || ["Active", "Closed", "Operation Shutdown"];
  }
  const statuses = new Set<string>();
  stocks.forEach((s) => {
    const st = getOperationalStatus(s);
    if (st) statuses.add(st);
  });
  return Array.from(statuses).sort();
}

// Peer stocks
export function getPeerStocks(stock: AnyStock, stocks: AnyStock[] = [], limit = 4): AnyStock[] {
  if (!stocks || stocks.length === 0) return [];
  const sector = getSector(stock);
  const currentCode = getTradingCode(stock);

  return stocks
    .filter((s) => getSector(s) === sector && getTradingCode(s) !== currentCode)
    .sort((a, b) => (getMarketCap(b) || 0) - (getMarketCap(a) || 0))
    .slice(0, limit);
}

// Summary stats calculation
export function calculateSummaryStats(stocks: AnyStock[]): SummaryStats {
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
function matchesRange(
  val: number | null | undefined,
  range: { min?: number | null; max?: number | null }
): boolean {
  if (range.min !== undefined && range.min !== null) {
    if (val === null || val === undefined || val < range.min) return false;
  }
  if (range.max !== undefined && range.max !== null) {
    if (val === null || val === undefined || val > range.max) return false;
  }
  return true;
}

// Filtering and Sorting
export function filterAndSortStocks<T extends AnyStock>(
  stocks: T[],
  filters: FilterState,
  sortConfig: SortConfig
): T[] {
  const result = stocks.filter((stock) => {
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

    if ((valA === null || valA === undefined) && (valB === null || valB === undefined)) return 0;
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
