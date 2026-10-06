export interface StockOverview {
  "#"?: number;
  "TRADING CODE"?: string;
  LTP?: number | null;
  HIGH?: number | null;
  LOW?: number | null;
  CLOSEP?: number | null;
  YCP?: number | null;
  CHANGE?: number | null;
  TRADE?: number | null;
  "VALUE (mn)"?: number | null;
  VOLUME?: number | null;
}

export interface CreditRatingItem {
  ratingDate?: string | null;
  longTerm?: string | null;
  shortTerm?: string | null;
  outlook?: string | null;
  validityDate?: string | null;
  ratingAgency?: string | null;
}

export interface ExecutiveContact {
  designation: string;
  name: string;
  mobile?: string | null;
  email?: string | null;
}

export interface CseMarketQuote {
  ltp?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  ycp?: number | null;
  change?: number | null;
  changePct?: number | null;
  trades?: number | null;
  valueMn?: number | null;
  volume?: number | null;
  updatedDate?: string | null;
}

export interface MarketInformation {
  lastTradingPrice?: number | null;
  daysRange?: [number | null, number | null] | null;
  lastUpdate?: string | null;
  movingRange52Weeks?: [number | null, number | null] | null;
  change?: number | null;
  daysTradeNos?: number | null;
  yesterdaysClose?: number | null;
  daysVolumeNos?: number | null;
  adjustedOpeningPrice?: number | null;
  daysValueMn?: number | null;
  openingPrice?: number | null;
  marketCapMn?: number | null;
  closingPrice?: number | null;
  freeFloatMarketCapMn?: number | null;
}

export interface BasicInformation {
  authorizedCapitalMn?: number | null;
  debutTradingDate?: string | null;
  paidUpCapitalMn?: number | null;
  typeOfInstrument?: string | null;
  faceParValue?: number | null;
  marketLot?: number | null;
  totalOutstandingSecurities?: number | null;
  sector?: string | null;
}

export interface DividendAndSurplus {
  listingYear?: number | null;
  marketCategory?: string | null;
  electronicShare?: boolean | null;
  cashDividend?: string | null;
  bonusIssue?: string | null;
  rightIssue?: string | null;
  yearEnd?: string | null;
  reserveSurplusWithoutOciMn?: number | null;
  otherComprehensiveIncomeMn?: number | null;
  remarks?: string | null;
}

export interface ShareHolding {
  period?: string | null;
  asOfDate?: string | null;
  sponsorDirectorPct?: number | null;
  govtPct?: number | null;
  institutePct?: number | null;
  foreignPct?: number | null;
  publicPct?: number | null;
}

export interface InterimFinancial {
  period?: string | null;
  endDate?: string | null;
  epsBasic?: number | null;
  epsDiluted?: number | null;
  epsContinuingBasic?: number | null;
  epsContinuingDiluted?: number | null;
  marketPriceEnd?: number | null;
}

export interface PERatioAuditedItem {
  date?: string | null;
  peBasic?: number | null;
  peDiluted?: number | null;
}

export interface PERatioUnauditedItem {
  date?: string | null;
  peBasic?: number | null;
  peDiluted?: number | null;
  peTrailing?: number | null;
}

export interface PERatios {
  unaudited?: PERatioUnauditedItem[] | null;
  audited?: PERatioAuditedItem[] | null;
}

export interface AuditedFinancial {
  year?: number | null;
  epsBasicOriginal?: number | null;
  epsBasicRestated?: number | null;
  epsDilutedOriginal?: number | null;
  epsDilutedRestated?: number | null;
  epsContinuingBasicOriginal?: number | null;
  epsContinuingBasicRestated?: number | null;
  navPerShareOriginal?: number | null;
  navPerShareRestated?: number | null;
  profitForTheYearMnOriginal?: number | null;
  profitForTheYearMnRestated?: number | null;
  tciOriginal?: number | null;
  tciRestated?: number | null;
}

export interface HistoricalDividendPE {
  year?: number | null;
  peBasicOriginal?: number | null;
  peBasicRestated?: number | null;
  peDiluted?: number | null;
  peContinuing?: number | null;
  dividend?: string | null;
  cashDividendPct?: number | null;
  bonusDividendPct?: number | string | null;
  dividendYieldPct?: number | null;
}

export interface OperationalLoanStatus {
  presentOperationalStatus?: string | null;
  longTermLoanMn?: number | null;
  latestDividendStatus?: string | null;
}

export interface AddressContact {
  headOffice?: string | null;
  factory?: string | null;
  phone?: string | null;
  fax?: string | null;
  email?: string | null;
  webAddress?: string | null;
  companySecretaryName?: string | null;
  cellNo?: string | null;
  telephoneNo?: string | null;
}

export interface ShariahAuditDetail {
  isCompliant: boolean;
  status: "COMPLIANT" | "NON_COMPLIANT" | "EXEMPT_ISLAMIC_FINANCIAL";
  standard: "S&P_DSES" | "AAOIFI" | "DJIM";
  failureReasons: string[];
  passedScreens: string[];
  metrics: {
    debtToMcapPct: number | null; // Threshold: < 33% (S&P DSES)
    cashToMcapPct: number | null; // Threshold: < 33% (S&P DSES)
    receivablesToMcapPct: number | null; // Threshold: < 49% (S&P DSES)
    nonPermissibleRevPct: number | null; // Threshold: < 5% (S&P DSES)
    dividendPurificationPct: number | null; // DP Ratio (%)
    avgMarketCap36m?: number | null;
    totalInterestBearingDebt?: number | null;
    cashAndInterestSecurities?: number | null;
    totalReceivables?: number | null;
  };
  isIslamicFinancialInstitution?: boolean;
  notes?: string[];
}

export interface Stock {
  tradingCode: string;
  scripCode?: string | null;
  companyName?: string | null;
  sourceUrl?: string | null;
  cseSourceUrl?: string | null;
  
  // Exchange listing metadata
  exchanges?: ("DSE" | "CSE")[];
  isDseListed?: boolean;
  isCseListed?: boolean;
  indices?: string[];

  lastAGMHeldOn?: string | null;
  forYearEnded?: string | null;
  overview?: StockOverview | null;
  marketInformation?: MarketInformation | null;
  cseQuote?: CseMarketQuote | null;
  basicInformation?: BasicInformation | null;
  dividendAndSurplus?: DividendAndSurplus | null;
  shareHoldings?: ShareHolding[] | null;
  interimFinancials?: InterimFinancial[] | null;
  peRatios?: PERatios | null;
  auditedFinancials?: AuditedFinancial[] | null;
  historicalDividendPE?: HistoricalDividendPE[] | null;
  financialLinks?: string[] | null;
  operationalLoanStatus?: OperationalLoanStatus | null;
  addressContact?: AddressContact | null;
  creditRatings?: CreditRatingItem[] | null;
  executiveContacts?: ExecutiveContact[] | null;
  scrapedAt?: string | null;
  shariaCompliant?: boolean | null;
  shariahAudit?: ShariahAuditDetail | null;
}

export interface FilterRange {
  min?: number | null;
  max?: number | null;
}

export interface FilterState {
  searchQuery: string;
  preset: string; // "all" | "sharia" | "gainers" | "losers" | "high_yield" | "low_pe" | "undervalued_pb" | "zero_debt" | "high_sponsor" | string
  exchange: "all" | "dual" | "dse" | "cse";
  indices: string[];
  sectors: string[];
  categories: string[];
  instruments: string[];
  operationalStatuses: string[];
  shariaOnly: boolean;
  zeroDebtOnly: boolean;
  excludeLossMaking: boolean;
  excludeNegativePE: boolean;
  excludeZeroDividend: boolean;

  // Shariah Specific Filters
  islamicFinanceOnly: boolean;
  excludeNonShariaSectors: boolean;
  shariahDebtRatioRange: FilterRange; // Debt / MCap (Max 33%)
  shariahCashRatioRange: FilterRange; // Cash / MCap (Max 33%)
  shariahReceivablesRange: FilterRange; // Receivables / MCap (Max 49%)
  shariahPurificationRange: FilterRange; // Dividend Purification %
  
  // Numerical ranges
  ltpRange: FilterRange;
  changePctRange: FilterRange;
  peRange: FilterRange;
  divYieldRange: FilterRange;
  pbRange: FilterRange;
  marketCapRange: FilterRange; // in Mn BDT
  paidUpCapRange: FilterRange; // in Mn BDT
  navRange: FilterRange;
  epsRange: FilterRange;
  netProfitRange: FilterRange; // in Mn BDT
  debtRange: FilterRange; // in Mn BDT
  listingYearRange: FilterRange;
  
  // Shareholding % ranges
  sponsorPctRange: FilterRange;
  institutePctRange: FilterRange;
  foreignPctRange: FilterRange;
  publicPctRange: FilterRange;
  govtPctRange: FilterRange;
  
  // Market Activity
  volumeRange: FilterRange;
  turnoverRange: FilterRange; // in Mn BDT
  tradesRange: FilterRange;
}

export type SortField =
  | "tradingCode"
  | "scripCode"
  | "companyName"
  | "sector"
  | "category"
  | "instrumentType"
  | "operationalStatus"
  | "ltp"
  | "change"
  | "ycp"
  | "changePct"
  | "high"
  | "low"
  | "range52WeekLow"
  | "range52WeekHigh"
  | "cseLtp"
  | "cseVolume"
  | "spreadBdt"
  | "spreadPct"
  | "pe"
  | "auditedPe"
  | "unauditedPe"
  | "divYield"
  | "pb"
  | "nav"
  | "eps"
  | "netProfit"
  | "marketCap"
  | "freeFloatCap"
  | "paidUpCap"
  | "authorizedCap"
  | "turnover"
  | "volume"
  | "trades"
  | "debt"
  | "sponsorPct"
  | "institutePct"
  | "foreignPct"
  | "publicPct"
  | "govtPct"
  | "listingYear";

export type SortDirection = "asc" | "desc";

export interface SortConfig {
  field: SortField;
  direction: SortDirection;
}

export interface SummaryStats {
  totalStocks: number;
  shariaCount: number;
  dualListedCount: number;
  dseOnlyCount: number;
  cseOnlyCount: number;
  totalMarketCapMn: number;
  averagePe: number | null;
  averageDivYield: number | null;
  gainersCount: number;
  losersCount: number;
  unchangedCount: number;
  totalTurnoverMn: number;
  cseTurnoverMn: number;
  totalVolume: number;
  cseVolume: number;
  totalTrades: number;
}

export interface CustomPreset {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  filters: FilterState;
}

export interface ScreenerStock {
  tradingCode: string;
  scripCode?: string | null;
  companyName?: string | null;
  sector?: string | null;
  category?: string | null;
  
  // Exchanges & Shariah
  exchanges: ("DSE" | "CSE")[];
  isDseListed: boolean;
  isCseListed: boolean;
  shariaCompliant?: boolean | null;
  indices?: string[];

  // Primary Trading Metrics (DSE primary, CSE fallback)
  ltp?: number | null;
  change?: number | null;
  ycp?: number | null;
  changePct?: number | null;
  high?: number | null;
  low?: number | null;
  range52Week?: [number | null, number | null] | null;
  volume?: number | null;
  turnover?: number | null;
  trades?: number | null;

  // Secondary CSE Live Metrics
  cseLtp?: number | null;
  cseChange?: number | null;
  cseChangePct?: number | null;
  cseVolume?: number | null;
  cseTurnover?: number | null;
  cseTrades?: number | null;
  cseYcp?: number | null;

  // Dual-Exchange Spread & Ratings
  spreadBdt?: number | null;
  spreadPct?: number | null;
  creditRating?: string | null;
  creditRatings?: CreditRatingItem[];

  // Fundamentals
  pe?: number | null;
  auditedPe?: number | null;
  unauditedPe?: number | null;
  pb?: number | null;
  nav?: number | null;
  eps?: number | null;
  netProfit?: number | null;
  divYield?: number | null;
  cashDividend?: string | null;
  bonusIssue?: string | null;
  marketCap?: number | null;
  freeFloatCap?: number | null;
  paidUpCap?: number | null;
  authorizedCap?: number | null;
  debt?: number;
  listingYear?: number | null;
  instrumentType?: string | null;
  operationalStatus?: string | null;
  sponsorPct?: number | null;
  institutePct?: number | null;
  foreignPct?: number | null;
  publicPct?: number | null;
  govtPct?: number | null;
  shareholdingPeriod?: string | null;
  shariahAudit?: ShariahAuditDetail | null;
  dividendPurificationPct?: number | null;
}

export type AnyStock = Stock | ScreenerStock;

export interface DseMeta {
  lastUpdated: string;
  totalStocks: number;
  totalDseStocks?: number;
  totalCseStocks?: number;
  totalDualStocks?: number;
  shariaStocksCount?: number;
  version: string;
  indices?: string[];
  sectors?: string[];
  categories?: string[];
  instruments?: string[];
  operationalStatuses?: string[];
}
