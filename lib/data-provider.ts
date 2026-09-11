import { Stock, ScreenerStock, DseMeta } from "./types";
import { safeDecodeURIComponent } from "./utils";
import rawScreenerData from "@/data/screener_stocks.json";
import rawMetaData from "@/data/meta.json";

// In-memory isolate caches to eliminate redundant reads
let cachedScreenerStocks: ScreenerStock[] | null = null;
let cachedScreenerMap: Map<string, ScreenerStock> | null = null;
let cachedFullStocksMap: Map<string, Stock> | null = null;
let cachedMeta: DseMeta | null = null;

const defaultScreenerStocks: ScreenerStock[] = rawScreenerData as unknown as ScreenerStock[];
const defaultMeta: DseMeta = rawMetaData as unknown as DseMeta;

/**
 * Determines whether Cloudflare KV lookups should be performed.
 * KV lookups are strictly restricted to the production environment.
 * In development, test, or any non-production mode (e.g. ENVIRONMENT=development),
 * KV lookups are completely bypassed so the application instantly uses local bundled data.
 */
function isKvEnabled(): boolean {
  // 1. Explicit env variables check in Node / server process
  if (typeof process !== "undefined" && process.env) {
    const env = (process.env.ENVIRONMENT || "").toLowerCase().trim();
    const nodeEnv = (process.env.NODE_ENV || "").toLowerCase().trim();

    // Explicit opt-out flags
    if (
      process.env.DISABLE_KV === "true" ||
      process.env.DISABLE_KV === "1" ||
      process.env.USE_LOCAL_DATA === "true" ||
      process.env.USE_LOCAL_DATA === "1" ||
      process.env.ENABLE_KV === "false" ||
      process.env.ENABLE_KV === "0"
    ) {
      return false;
    }

    // If environment is explicitly not production, do not use KV
    if (env && env !== "production") {
      return false;
    }
    if (nodeEnv && nodeEnv !== "production") {
      return false;
    }

    // If running in production
    if (env === "production" || nodeEnv === "production") {
      return true;
    }
  }

  // 2. Global Cloudflare Worker env bindings check
  try {
    const g = globalThis as any;
    const workerEnv = (g?.env?.ENVIRONMENT || g?.ENVIRONMENT || "").toLowerCase().trim();
    if (workerEnv && workerEnv !== "production") {
      return false;
    }
    if (workerEnv === "production") {
      return true;
    }
  } catch {
    // Ignore global access errors
  }

  // 3. Vite / Cloudflare Worker environment flags
  try {
    const envObj = (import.meta as any)?.env;
    if (envObj) {
      if (envObj.DEV) {
        return false;
      }
      const viteEnv = (envObj.ENVIRONMENT || envObj.VITE_ENVIRONMENT || "").toLowerCase().trim();
      if (viteEnv && viteEnv !== "production") {
        return false;
      }
      if (envObj.VITE_DISABLE_KV === "true" || envObj.DISABLE_KV === "true") {
        return false;
      }
      if (envObj.PROD || viteEnv === "production" || envObj.MODE === "production") {
        return true;
      }
    }
  } catch {
    // Ignore runtime access errors
  }

  // Non-production by default
  return false;
}

/**
 * Safely attempts to retrieve the Cloudflare KV namespace binding 'DSE_DATA'
 * from standard Cloudflare runtime locations.
 */
function getKvNamespace(): any | null {
  if (!isKvEnabled()) {
    return null;
  }

  try {
    const g = globalThis as any;
    if (g?.DSE_DATA && typeof g.DSE_DATA.get === "function") {
      return g.DSE_DATA;
    }
    if (g?.env?.DSE_DATA && typeof g.env.DSE_DATA.get === "function") {
      return g.env.DSE_DATA;
    }
    if (typeof process !== "undefined" && (process as any).env?.DSE_DATA?.get) {
      return (process as any).env.DSE_DATA;
    }
  } catch {
    // Ignore runtime access errors
  }
  return null;
}

// Track keys currently being written to prevent duplicate background KV writes
const inFlightKvWrites = new Set<string>();

/**
 * Non-blocking write-through helper: populates Cloudflare KV in the background
 * whenever local fallback data is served in production.
 */
function writeThroughToKv(key: string, data: any): void {
  const kv = getKvNamespace();
  if (!kv || typeof kv.put !== "function") {
    return;
  }

  if (inFlightKvWrites.has(key)) {
    return;
  }

  inFlightKvWrites.add(key);

  Promise.resolve()
    .then(async () => {
      try {
        const payload = typeof data === "string" ? data : JSON.stringify(data);
        await kv.put(key, payload);
      } catch (err) {
        console.warn(`[data-provider] Background KV write failed for '${key}':`, err);
      } finally {
        inFlightKvWrites.delete(key);
      }
    })
    .catch(() => {
      inFlightKvWrites.delete(key);
    });
}

/**
 * Builds the in-memory fast lookup map for screener stocks.
 */
function buildScreenerMap(stocks: ScreenerStock[]): Map<string, ScreenerStock> {
  const map = new Map<string, ScreenerStock>();
  for (const s of stocks) {
    if (s.tradingCode) {
      map.set(s.tradingCode.toUpperCase().trim(), s);
    }
    if (s.scripCode) {
      map.set(s.scripCode.toUpperCase().trim(), s);
    }
  }
  return map;
}

/**
 * Fetches lightweight screener stocks (332 KB) from Cloudflare KV or local dataset.
 */
export async function fetchServerScreenerStocks(): Promise<ScreenerStock[]> {
  if (cachedScreenerStocks && cachedScreenerStocks.length > 0) {
    return cachedScreenerStocks;
  }

  const kv = getKvNamespace();
  if (kv) {
    try {
      const data = await kv.get("dse:screener_stocks", "json");
      if (Array.isArray(data) && data.length > 0) {
        cachedScreenerStocks = data as ScreenerStock[];
        cachedScreenerMap = buildScreenerMap(cachedScreenerStocks);
        return cachedScreenerStocks;
      }
    } catch (err) {
      console.warn("[data-provider] Failed to read 'dse:screener_stocks' from KV, using fallback:", err);
    }
  }

  // Fallback to bundled dataset & populate KV in background if enabled
  cachedScreenerStocks = defaultScreenerStocks;
  cachedScreenerMap = buildScreenerMap(cachedScreenerStocks);
  if (isKvEnabled()) {
    writeThroughToKv("dse:screener_stocks", defaultScreenerStocks);
  }
  return cachedScreenerStocks;
}

// Lazy modules for individual stock files
const stockModules = import.meta.glob<{ default: Stock }>("../data/stocks/*.json");

// Map normalized stock code to loader function for robust O(1) lookup
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
 * Fetches an individual stock by trading code from Cloudflare KV (`stock:<CODE>`)
 * or from lazy stock JSON module / fallback.
 */
export async function fetchServerStockByCode(code: string): Promise<Stock | null> {
  if (!code) return null;
  const normalized = code.trim().toUpperCase();

  // 1. Check in-memory isolate map first
  if (cachedFullStocksMap?.has(normalized)) {
    return cachedFullStocksMap.get(normalized) || null;
  }

  // 2. Try single-key lookup in Cloudflare KV
  const kv = getKvNamespace();
  if (kv) {
    try {
      const key = `stock:${normalized}`;
      const data = await kv.get(key, "json");
      if (data && typeof data === "object") {
        const stock = data as Stock;
        if (!cachedFullStocksMap) cachedFullStocksMap = new Map();
        cachedFullStocksMap.set(normalized, stock);
        return stock;
      }
    } catch (err) {
      console.warn(`[data-provider] Failed to read '${normalized}' from KV, using fallback:`, err);
    }
  }

  // 3. Fallback: lazy load individual stock JSON chunk on-demand
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
        if (!cachedFullStocksMap) cachedFullStocksMap = new Map();
        cachedFullStocksMap.set(normalized, stock);
        if (isKvEnabled()) {
          writeThroughToKv(`stock:${normalized}`, stock);
        }
        return stock;
      }
    }
  } catch {
    // Ignore lazy load errors
  }

  return null;
}

/**
 * Fetches dataset metadata (last updated timestamp, count, version, sectors).
 */
export async function fetchServerMeta(): Promise<DseMeta> {
  if (cachedMeta) return cachedMeta;

  const kv = getKvNamespace();
  if (kv) {
    try {
      const data = await kv.get("dse:meta", "json");
      if (data && typeof data === "object") {
        cachedMeta = data as DseMeta;
        return cachedMeta;
      }
    } catch (err) {
      console.warn("[data-provider] Failed to read 'dse:meta' from KV, using fallback:", err);
    }
  }

  // Fallback to bundled meta & populate KV in background if enabled
  cachedMeta = defaultMeta;
  if (isKvEnabled()) {
    writeThroughToKv("dse:meta", defaultMeta);
  }
  return cachedMeta;
}

/**
 * Synchronous accessors for client components or static routines
 */
export function getScreenerStocksSync(): ScreenerStock[] {
  return cachedScreenerStocks || defaultScreenerStocks;
}

export function getMetaSync(): DseMeta {
  return cachedMeta || defaultMeta;
}

export function getScreenerStockByCodeSync(code: string): ScreenerStock | undefined {
  if (!code) return undefined;
  const normalized = code.trim().toUpperCase();
  if (!cachedScreenerMap) {
    cachedScreenerMap = buildScreenerMap(defaultScreenerStocks);
  }
  return cachedScreenerMap.get(normalized);
}

// Backward compatibility aliases
export const fetchServerAllStocks = fetchServerScreenerStocks;
export const getAllStocksSync = getScreenerStocksSync;
export const getStockByCodeSync = getScreenerStockByCodeSync;
