import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Stock,
  ScreenerStock,
  SearchIndexStock,
  DseMeta,
  GenerateOptions,
  KvManifestEntry,
} from "./types";
import { deriveScreenerStock, deriveSearchIndexItem } from "./parser";
import { loadShariaData, isShariaCompliant } from "./scraper";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Default directory paths
 */
export const DEFAULT_ROOT_DIR = path.resolve(__dirname, "..");
export const DEFAULT_DATA_DIR = path.resolve(DEFAULT_ROOT_DIR, "data");
export const DEFAULT_STOCKS_DIR = path.resolve(DEFAULT_DATA_DIR, "stocks");
export const DEFAULT_SOURCE_FILE = path.resolve(DEFAULT_DATA_DIR, "dse_stocks.json");

/**
 * Generates all derived production datasets for DSE Filter:
 * - meta.json
 * - screener_stocks.json
 * - search_index.json
 * - stocks/*.json (individual stock files)
 */
export function generateDataFiles(
  stocks: Stock[],
  options: GenerateOptions = {}
): {
  metaPath: string;
  screenerStocksPath: string;
  searchIndexPath: string;
  stocksCount: number;
  allStocksPath?: string;
  manifestPath?: string;
  masterPath?: string;
} {
  const dataDir = options.dataDir ? path.resolve(options.dataDir) : DEFAULT_DATA_DIR;
  const stocksDir = path.resolve(dataDir, "stocks");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(stocksDir)) {
    fs.mkdirSync(stocksDir, { recursive: true });
  }

  console.log(`[generator] Processing ${stocks.length} stocks for directory: ${dataDir}`);

  const shariaList = loadShariaData();
  const allCodes = stocks.map((s) => (s.tradingCode || "").trim().toUpperCase()).filter(Boolean);

  const sectorsSet = new Set<string>();
  const categoriesSet = new Set<string>();
  const instrumentsSet = new Set<string>();
  const statusesSet = new Set<string>();

  // 1. Transform into Screener Stocks & synchronize Sharia status
  const screenerStocks: ScreenerStock[] = stocks.map((stock) => {
    const code = (stock.tradingCode || "").trim().toUpperCase();
    if (shariaList.length > 0) {
      stock.shariaCompliant = isShariaCompliant(code, shariaList, allCodes);
    }
    const derived = deriveScreenerStock(stock);

    if (derived.sector) sectorsSet.add(derived.sector);
    if (derived.category && derived.category !== "Unknown" && derived.category !== "-") {
      categoriesSet.add(derived.category.toUpperCase());
    }
    if (derived.instrumentType) instrumentsSet.add(derived.instrumentType);
    if (derived.operationalStatus) statusesSet.add(derived.operationalStatus);

    return derived;
  });

  // 2. Build Dataset Metadata
  const meta: DseMeta = {
    lastUpdated: new Date().toISOString(),
    totalStocks: stocks.length,
    version: "1.0.0",
    sectors: Array.from(sectorsSet).sort(),
    categories: Array.from(categoriesSet).sort(),
    instruments: Array.from(instrumentsSet).sort(),
    operationalStatuses: Array.from(statusesSet).sort(),
  };
  const metaPath = path.resolve(dataDir, "meta.json");
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf-8");
  console.log(`✓ Generated ${metaPath}`);

  // 3. Compact Screener Stocks File (for fast client screener & filtering)
  const screenerStocksPath = path.resolve(dataDir, "screener_stocks.json");
  const screenerJson = JSON.stringify(screenerStocks);
  fs.writeFileSync(screenerStocksPath, screenerJson, "utf-8");
  const screenerSizeKb = (fs.statSync(screenerStocksPath).size / 1024).toFixed(1);
  console.log(`✓ Generated ${screenerStocksPath} (${screenerSizeKb} KB)`);

  // 4. Search Index File (ultra-compact for navbar instant autocomplete search)
  const searchIndex: SearchIndexStock[] = screenerStocks.map(deriveSearchIndexItem);
  const searchIndexPath = path.resolve(dataDir, "search_index.json");
  const searchIndexJson = JSON.stringify(searchIndex);
  fs.writeFileSync(searchIndexPath, searchIndexJson, "utf-8");
  const searchIndexSizeKb = (fs.statSync(searchIndexPath).size / 1024).toFixed(1);
  console.log(`✓ Generated ${searchIndexPath} (${searchIndexSizeKb} KB)`);

  // 5. Individual Stock JSON files
  let writtenStockCount = 0;
  for (const stock of stocks) {
    const code = (stock.tradingCode || "").trim().toUpperCase();
    if (!code) continue;

    const safeFileName = `${encodeURIComponent(code)}.json`;
    const stockFilePath = path.resolve(stocksDir, safeFileName);
    const stockJson = JSON.stringify(stock, null, 2);

    fs.writeFileSync(stockFilePath, stockJson, "utf-8");
    writtenStockCount++;
  }
  console.log(`✓ Generated ${writtenStockCount} individual stock JSON files in ${stocksDir}`);

  // 6. Optional All Stocks File
  let allStocksPath: string | undefined;
  if (options.saveAllStocksFile) {
    allStocksPath = path.resolve(dataDir, "all_stocks.json");
    fs.writeFileSync(allStocksPath, JSON.stringify(stocks), "utf-8");
    console.log(`✓ Generated all_stocks.json backup at ${allStocksPath}`);
  }

  // 7. Optional Master File
  let masterPath: string | undefined;
  if (options.saveMasterFile) {
    masterPath = path.resolve(dataDir, "dse_stocks.json");
    fs.writeFileSync(masterPath, JSON.stringify(stocks, null, 2), "utf-8");
    console.log(`✓ Saved master dataset to ${masterPath}`);
  }

  // 8. Optional Wrangler KV Manifest file
  let manifestPath: string | undefined;
  if (options.saveKvManifest) {
    const manifest: KvManifestEntry[] = [
      { key: "dse:meta", value: JSON.stringify(meta) },
      { key: "dse:screener_stocks", value: screenerJson },
      { key: "dse:search_index", value: searchIndexJson },
      { key: "dse:all_stocks", value: JSON.stringify(stocks) },
    ];
    for (const stock of stocks) {
      const code = (stock.tradingCode || "").trim().toUpperCase();
      if (code) {
        manifest.push({ key: `stock:${code}`, value: JSON.stringify(stock) });
      }
    }
    manifestPath = path.resolve(dataDir, "kv_manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
    console.log(`✓ Generated Wrangler KV bulk manifest at ${manifestPath} (${manifest.length} total keys)`);
  }

  return {
    metaPath,
    screenerStocksPath,
    searchIndexPath,
    stocksCount: writtenStockCount,
    allStocksPath,
    manifestPath,
    masterPath,
  };
}

/**
 * Loads stock data directly from individual stock files in data/stocks/*.json
 */
export function generateFromStocksDir(
  stocksDir: string = DEFAULT_STOCKS_DIR,
  options: GenerateOptions = {}
) {
  const resolvedDir = path.resolve(stocksDir);
  if (!fs.existsSync(resolvedDir)) {
    throw new Error(`Stocks directory not found at: ${resolvedDir}`);
  }

  const files = fs.readdirSync(resolvedDir).filter((f) => f.endsWith(".json"));
  console.log(`[generator] Loading ${files.length} stocks from ${resolvedDir}...`);

  const stocks: Stock[] = [];
  for (const file of files) {
    const raw = fs.readFileSync(path.join(resolvedDir, file), "utf-8");
    stocks.push(JSON.parse(raw));
  }

  return generateDataFiles(stocks, options);
}

/**
 * Loads master dataset from disk or falls back to data/stocks/*.json and triggers generation.
 */
export function generateFromMasterFile(
  sourcePath: string = DEFAULT_SOURCE_FILE,
  options: GenerateOptions = {}
) {
  const resolvedSource = path.resolve(sourcePath);
  if (fs.existsSync(resolvedSource)) {
    console.log(`[generator] Reading master dataset from ${resolvedSource}...`);
    const rawData = fs.readFileSync(resolvedSource, "utf-8");
    const stocks: Stock[] = JSON.parse(rawData);
    if (!Array.isArray(stocks)) {
      throw new Error("Master dataset must be a JSON array of stocks");
    }
    return generateDataFiles(stocks, options);
  }

  // Fallback to data/stocks directory if source file not found
  console.log(`[generator] Source file not found, reading from stocks directory...`);
  return generateFromStocksDir(options.dataDir ? path.resolve(options.dataDir, "stocks") : DEFAULT_STOCKS_DIR, options);
}

// CLI direct execution
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("generate-data.ts") ||
    process.argv[1].endsWith("generate-data.js") ||
    process.argv[1].endsWith("generate-data.mjs"));

if (isDirectRun) {
  try {
    const customSource = process.argv[2];
    if (customSource && fs.existsSync(customSource) && fs.statSync(customSource).isDirectory()) {
      generateFromStocksDir(customSource);
    } else {
      generateFromMasterFile(customSource || DEFAULT_SOURCE_FILE);
    }
    console.log("\n✓ All data files generated successfully!");
  } catch (err: any) {
    console.error("\n❌ Data generation failed:", err.message);
    process.exit(1);
  }
}
