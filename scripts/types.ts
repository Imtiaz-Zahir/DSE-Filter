import type {
  Stock,
  StockOverview,
  MarketInformation,
  BasicInformation,
  DividendAndSurplus,
  ShareHolding,
  InterimFinancial,
  PERatios,
  PERatioAuditedItem,
  PERatioUnauditedItem,
  AuditedFinancial,
  HistoricalDividendPE,
  OperationalLoanStatus,
  AddressContact,
  ScreenerStock,
  DseMeta,
} from "../lib/types";

// Re-export core types from the project library
export type {
  Stock,
  StockOverview,
  MarketInformation,
  BasicInformation,
  DividendAndSurplus,
  ShareHolding,
  InterimFinancial,
  PERatios,
  PERatioAuditedItem,
  PERatioUnauditedItem,
  AuditedFinancial,
  HistoricalDividendPE,
  OperationalLoanStatus,
  AddressContact,
  ScreenerStock,
  DseMeta,
};

/**
 * Minimal search index item for fast navbar search.
 */
export interface SearchIndexStock {
  tradingCode: string;
  companyName: string;
  sector: string;
  category: string;
  shariaCompliant: boolean;
  ltp: number | null;
  change: number | null;
  changePct: number | null;
}

/**
 * Raw shareholding data scraped from DSE tables.
 */
export interface RawShareHolding {
  period: string;
  breakdown: Record<string, string>;
  rawText?: string;
}

/**
 * Raw stock item scraped directly from DSE company display page before cleaning.
 */
export interface RawStock {
  tradingCode: string;
  scripCode?: string | null;
  companyName?: string;
  sourceUrl: string;
  lastAGMHeldOn?: string | null;
  forYearEnded?: string | null;
  marketInformation?: Record<string, string>;
  basicInformation?: Record<string, string>;
  dividendAndSurplus?: Record<string, string>;
  interimFinancials?: string[][];
  peRatiosUnaudited?: string[][];
  peRatiosAudited?: string[][];
  auditedFinancials?: string[][];
  historicalDividendPE?: string[][];
  financialLinks?: Record<string, string>;
  corporateInfo?: Record<string, string>;
  shareHoldings?: RawShareHolding[];
  operationalLoanStatus?: Record<string, string>;
  addressContact?: Record<string, string>;
  scrapedAt: string;
  shariaStockOverview?: Record<string, any>;
  shariaCompliant?: boolean;
  error?: string;
}

/**
 * Raw item from DSE live overview table or TradingView quote list.
 */
export interface RawOverviewItem {
  "#"?: number;
  "TRADING CODE"?: string;
  "LTP*"?: number | string;
  "HIGH"?: number | string;
  "LOW"?: number | string;
  "CLOSEP*"?: number | string;
  "YCP*"?: number | string;
  "CHANGE"?: number | string;
  "TRADE"?: number | string;
  "VALUE (mn)"?: number | string;
  "VOLUME"?: number | string;
  [key: string]: any;
}

/**
 * Sharia compliance record from shria_stock_data.json (either string code or legacy object).
 */
export type ShariaStockItem =
  | string
  | {
      Symbol?: string;
      tradingCode?: string;
      [key: string]: any;
    };

/**
 * Parsed dividend breakdown information.
 */
export interface DividendParsedInfo {
  dividend: string | null;
  cashDividendPct: number | null;
  bonusDividendPct: string | null;
}

/**
 * Options for scraping company pages.
 */
export interface ScrapeOptions {
  concurrency?: number;
  delayMs?: number;
  timeoutMs?: number;
  maxRetries?: number;
  userAgent?: string;
  shariaDataPath?: string;
  stocksDataPath?: string;
}

/**
 * Options for generating output data files.
 */
export interface GenerateOptions {
  dataDir?: string;
  sourceFile?: string;
  saveMasterFile?: boolean;
  saveKvManifest?: boolean;
  saveAllStocksFile?: boolean;
  indentJson?: boolean;
}

/**
 * Wrangler KV bulk manifest entry.
 */
export interface KvManifestEntry {
  key: string;
  value: string;
}
