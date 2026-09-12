import { unstable_cache } from "next/cache";
import { Stock, ScreenerStock, DseMeta } from "./types";
import { safeDecodeURIComponent } from "./utils";
import rawScreenerData from "@/data/screener_stocks.json";
import rawMetaData from "@/data/meta.json";

export const CACHE_TAGS = {
  STOCKS: "stocks",
  SCREENER: "screener",
  META: "dse-meta",
  stock: (code: string) => `stock:${code.toUpperCase().trim()}`,
} as const;

const defaultScreenerStocks: ScreenerStock[] = rawScreenerData as unknown as ScreenerStock[];
const defaultMeta: DseMeta = rawMetaData as unknown as DseMeta;

// Fast lookup map for bundled screener stocks (used by sync accessors)
let defaultScreenerMap: Map<string, ScreenerStock> | null = null;

function getDefaultScreenerMap(): Map<string, ScreenerStock> {
  if (!defaultScreenerMap) {
    defaultScreenerMap = new Map<string, ScreenerStock>();
    for (const s of defaultScreenerStocks) {
      if (s.tradingCode) {
        defaultScreenerMap.set(s.tradingCode.toUpperCase().trim(), s);
      }
      if (s.scripCode) {
        defaultScreenerMap.set(s.scripCode.toUpperCase().trim(), s);
      }
    }
  }
  return defaultScreenerMap;
}

/**
 * Safely resolves the runtime environment object containing bindings and variables.
 */
async function getRuntimeEnv(): Promise<any | null> {
  if (typeof window !== "undefined") {
    return null;
  }

  // 1. Cloudflare Workers native module in workerd runtime
  try {
    const workers = await import("cloudflare:workers");
    if (workers && (workers.env || workers.default?.env)) {
      return workers.env || workers.default?.env;
    }
  } catch {
    // Not running inside workerd runtime
  }

  // 2. Global / environment fallbacks
  try {
    const g = globalThis as any;
    if (g?.env) return g.env;
    if (typeof process !== "undefined" && process.env) {
      return process.env;
    }
  } catch {
    // Ignore global access errors
  }

  return null;
}

/**
 * Checks if the runtime environment variable ENVIRONMENT is 'production'.
 */
async function isProductionEnvironment(): Promise<boolean> {
  const envObj = await getRuntimeEnv();
  const envVal =
    envObj?.ENVIRONMENT ||
    (typeof process !== "undefined" ? process.env?.ENVIRONMENT : undefined);
  return envVal === "production";
}

/**
 * Safely retrieves the Cloudflare KV namespace binding 'DSE_DATA'
 * only when ENVIRONMENT === 'production'.
 */
async function getKvNamespace(): Promise<any | null> {
  const isProd = await isProductionEnvironment();
  if (!isProd) {
    return null;
  }

  const envObj = await getRuntimeEnv();
  if (envObj?.DSE_DATA && typeof envObj.DSE_DATA.get === "function") {
    return envObj.DSE_DATA;
  }

  const g = globalThis as any;
  if (g?.DSE_DATA && typeof g.DSE_DATA.get === "function") {
    return g.DSE_DATA;
  }

  return null;
}

/**
 * Internal loader for screener stocks.
 * When in production, checks Cloudflare KV first; falls back to bundled dataset if missing.
 * When not in production, uses bundled dataset directly.
 */
async function loadScreenerStocks(): Promise<ScreenerStock[]> {
  const kv = await getKvNamespace();
  if (kv) {
    try {
      const data = await kv.get("dse:screener_stocks", "json");
      if (Array.isArray(data) && data.length > 0) {
        return data as ScreenerStock[];
      }
    } catch (err) {
      console.warn("[data-provider] Failed to read 'dse:screener_stocks' from KV, using fallback:", err);
    }
  }

  return defaultScreenerStocks;
}

/**
 * Fetches lightweight screener stocks with tag-based revalidation.
 */
export const fetchServerScreenerStocks = unstable_cache(
  async () => loadScreenerStocks(),
  ["dse-screener-stocks"],
  {
    tags: [CACHE_TAGS.STOCKS, CACHE_TAGS.SCREENER],
  }
);

// Lazy modules for bundled individual stock files fallback
const stockModules = import.meta.glob<{ default: Stock }>("../data/stocks/*.json");

// Map normalized stock code to loader function for robust fallback lookup
const stockLoaderMap = new Map<string, () => Promise<{ default: Stock }>>();
for (const [pathKey, loader] of Object.entries(stockModules)) {
  const match = pathKey.match(/\/([^/]+)\.json$/);
  if (match && match[1]) {
    const rawName = match[1];
    const decodedName = safeDecodeURIComponent(rawName).toUpperCase();
    stockLoaderMap.set(rawName.toUpperCase(), loader);
    stockLoaderMap.set(decodedName, loader);
  }
}

/**
 * Internal loader for an individual stock by code.
 * Checks Cloudflare KV first, falling back to bundled stock JSON chunks.
 */
async function loadStockByCode(code: string): Promise<Stock | null> {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();

  // 1. Try single-key lookup in Cloudflare KV
  const kv = await getKvNamespace();
  if (kv) {
    try {
      const key = `stock:${normalized}`;
      const data = await kv.get(key, "json");
      if (data && typeof data === "object") {
        return data as Stock;
      }
    } catch (err) {
      console.warn(`[data-provider] Failed to read '${normalized}' from KV, using fallback:`, err);
    }
  }

  // 2. Fallback: lazy load individual stock JSON chunk on-demand
  try {
    const encoded = encodeURIComponent(normalized);
    const loader =
      stockLoaderMap.get(normalized) ||
      stockLoaderMap.get(encoded) ||
      stockModules[`../data/stocks/${normalized}.json`] ||
      stockModules[`../data/stocks/${encoded}.json`];
    if (loader) {
      const mod = await loader();
      const stock = (mod?.default || mod) as Stock;
      if (stock) {
        return stock;
      }
    }
  } catch {
    // Ignore lazy load errors
  }

  return null;
}

/**
 * Fetches an individual stock by trading code with tag-based revalidation.
 */
export async function fetchServerStockByCode(code: string): Promise<Stock | null> {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();
  const cachedFetcher = unstable_cache(
    async () => loadStockByCode(normalized),
    [`dse-stock-${normalized}`],
    {
      tags: [CACHE_TAGS.STOCKS, CACHE_TAGS.stock(normalized)],
    }
  );
  return cachedFetcher();
}

/**
 * Internal loader for metadata.
 * When in production, checks Cloudflare KV first; falls back to bundled metadata if missing.
 * When not in production, uses bundled metadata directly.
 */
async function loadMeta(): Promise<DseMeta> {
  const kv = await getKvNamespace();
  if (kv) {
    try {
      const data = await kv.get("dse:meta", "json");
      if (data && typeof data === "object") {
        return data as DseMeta;
      }
    } catch (err) {
      console.warn("[data-provider] Failed to read 'dse:meta' from KV, using fallback:", err);
    }
  }

  return defaultMeta;
}

/**
 * Fetches dataset metadata with tag-based revalidation.
 */
export const fetchServerMeta = unstable_cache(
  async () => loadMeta(),
  ["dse-meta"],
  {
    tags: [CACHE_TAGS.META, CACHE_TAGS.STOCKS],
  }
);

/**
 * Synchronous accessors for client components or static routines
 */
export function getScreenerStocksSync(): ScreenerStock[] {
  return defaultScreenerStocks;
}

export function getMetaSync(): DseMeta {
  return defaultMeta;
}

export function getScreenerStockByCodeSync(code: string): ScreenerStock | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toUpperCase();
  return getDefaultScreenerMap().get(normalized);
}

// Memory cache reset helper (no-op retained for backward compatibility)
export function resetMemoryCache(_tagOrKey?: string): void {}

// Backward compatibility aliases
export const fetchServerAllStocks = fetchServerScreenerStocks;
export const getAllStocksSync = getScreenerStocksSync;
export const getStockByCodeSync = getScreenerStockByCodeSync;
