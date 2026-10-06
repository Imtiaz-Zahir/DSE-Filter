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
import { fetchCseIndexData, fetchCseLivePrices } from "./cse-scraper";
import { calculateShariahAudit } from "../lib/shariah-screener";

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
 * Generates all derived production datasets for DSE & CSE Unified Platform:
 * - meta.json
 * - screener_stocks.json
 * - search_index.json
 * - stocks/*.json (individual stock files)
 */
export async function generateDataFiles(
  stocks: Stock[],
  options: GenerateOptions = {}
): Promise<{
  metaPath: string;
  screenerStocksPath: string;
  searchIndexPath: string;
  stocksCount: number;
  allStocksPath?: string;
  manifestPath?: string;
  masterPath?: string;
}> {
  const dataDir = options.dataDir ? path.resolve(options.dataDir) : DEFAULT_DATA_DIR;
  const stocksDir = path.resolve(dataDir, "stocks");

  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(stocksDir)) {
    fs.mkdirSync(stocksDir, { recursive: true });
  }

  console.log(`[generator] Processing ${stocks.length} DSE stocks for directory: ${dataDir}`);

  // 1. Fetch live CSE index components (CSE 30, CSE 50, CASPI, CSCX) & CSE live quotes
  let cse30Symbols = new Set<string>();
  let cse50Symbols = new Set<string>();
  let caspiSymbols = new Set<string>();
  let cscxSymbols = new Set<string>();
  let cseQuotes = new Map<string, any>();

  try {
    const [indexData, priceMap] = await Promise.all([
      fetchCseIndexData(15000),
      fetchCseLivePrices(15000),
    ]);
    cse30Symbols = indexData.cse30Symbols;
    cse50Symbols = indexData.cse50Symbols;
    caspiSymbols = indexData.caspiSymbols;
    cscxSymbols = indexData.cscxSymbols;
    cseQuotes = priceMap;
    console.log(
      `[generator] Successfully fetched CSE feeds: ${cseQuotes.size} CSE price quotes.`
    );
  } catch (err: any) {
    console.warn(`[generator] Warning: CSE live fetch failed (${err.message}).`);
  }

  // 2. Build a Map of all DSE stocks
  const stockMap = new Map<string, Stock>();
  for (const s of stocks) {
    const code = (s.tradingCode || "").trim().toUpperCase();
    if (code) {
      stockMap.set(code, s);
    }
  }

  // 3. Reconcile dual-listed vs DSE-only vs CSE-only stocks
  const allMergedStocks: Stock[] = [];

  // A. Process DSE stocks & merge CSE quotes
  for (const [code, stock] of stockMap.entries()) {
    const cseQuote = cseQuotes.get(code) || null;
    const isCse = cseQuote !== null || caspiSymbols.has(code);

    stock.isDseListed = true;
    stock.isCseListed = isCse;
    stock.exchanges = isCse ? ["DSE", "CSE"] : ["DSE"];
    stock.cseSourceUrl = `https://cse.com.bd/company/companydetails/${encodeURIComponent(code)}`;

    if (cseQuote) {
      stock.cseQuote = cseQuote;
    }

    // Algorithmic Shariah Screening (S&P DSES Rules)
    const audit = calculateShariahAudit(stock);
    stock.shariahAudit = audit;
    stock.shariaCompliant = audit.isCompliant;

    // Assign Index Memberships
    const indices: string[] = ["DSEX"];
    if (stock.shariaCompliant) {
      indices.push("DSES");
      if (isCse) indices.push("CSI");
    }
    if (cse30Symbols.has(code)) indices.push("CSE30");
    if (cse50Symbols.has(code)) indices.push("CSE50");
    if (caspiSymbols.has(code)) indices.push("CASPI");
    if (cscxSymbols.has(code)) indices.push("CSCX");
    stock.indices = indices;

    allMergedStocks.push(stock);
  }

  // B. Process CSE-only stocks (listed on CSE but not on DSE)
  let cseOnlyCount = 0;
  for (const [code, cseQuote] of cseQuotes.entries()) {
    if (!stockMap.has(code)) {
      cseOnlyCount++;

      const cseStock: Stock = {
        tradingCode: code,
        companyName: code,
        sourceUrl: `https://cse.com.bd/company/companydetails/${encodeURIComponent(code)}`,
        cseSourceUrl: `https://cse.com.bd/company/companydetails/${encodeURIComponent(code)}`,
        exchanges: ["CSE"],
        isDseListed: false,
        isCseListed: true,
        indices: [],
        cseQuote,
        basicInformation: {
          sector: "Miscellaneous",
          typeOfInstrument: code.includes("BOND") || code.includes("SUKUK") ? "Corporate Bond" : "Equity",
        },
        dividendAndSurplus: {
          marketCategory: "A",
        },
        operationalLoanStatus: {
          presentOperationalStatus: "Active",
        },
        scrapedAt: new Date().toISOString(),
      };

      // Algorithmic Shariah Screening
      const audit = calculateShariahAudit(cseStock);
      cseStock.shariahAudit = audit;
      cseStock.shariaCompliant = audit.isCompliant;

      const indices: string[] = [];
      if (cseStock.shariaCompliant) indices.push("CSI", "DSES");
      if (cse30Symbols.has(code)) indices.push("CSE30");
      if (cse50Symbols.has(code)) indices.push("CSE50");
      if (caspiSymbols.has(code)) indices.push("CASPI");
      if (cscxSymbols.has(code)) indices.push("CSCX");
      cseStock.indices = indices;

      allMergedStocks.push(cseStock);
    }
  }

  console.log(
    `[generator] Reconciled total ${allMergedStocks.length} stocks (${stockMap.size} DSE, ${cseOnlyCount} CSE-only).`
  );

  const sectorsSet = new Set<string>();
  const categoriesSet = new Set<string>();
  const instrumentsSet = new Set<string>();
  const statusesSet = new Set<string>();
  const indicesSet = new Set<string>(["DSEX", "DSES", "CSI", "CSE30", "CSE50", "CASPI", "CSCX"]);

  let totalDual = 0;
  let totalDse = 0;
  let totalCse = 0;
  let shariaCount = 0;

  // 4. Transform into Screener Stocks
  const screenerStocks: ScreenerStock[] = allMergedStocks.map((stock) => {
    const derived = deriveScreenerStock(stock);

    if (derived.isDseListed && derived.isCseListed) totalDual++;
    if (derived.isDseListed) totalDse++;
    if (derived.isCseListed) totalCse++;
    if (derived.shariaCompliant) shariaCount++;

    if (derived.sector) sectorsSet.add(derived.sector);
    if (derived.category && derived.category !== "Unknown" && derived.category !== "-") {
      categoriesSet.add(derived.category.toUpperCase());
    }
    if (derived.instrumentType) instrumentsSet.add(derived.instrumentType);
    if (derived.operationalStatus) statusesSet.add(derived.operationalStatus);

    return derived;
  });

  // 5. Build Dataset Metadata
  const meta: DseMeta = {
    lastUpdated: new Date().toISOString(),
    totalStocks: screenerStocks.length,
    totalDseStocks: totalDse,
    totalCseStocks: totalCse,
    totalDualStocks: totalDual,
    shariaStocksCount: shariaCount,
    version: "2.0.0",
    indices: Array.from(indicesSet).sort(),
    sectors: Array.from(sectorsSet).sort(),
    categories: Array.from(categoriesSet).sort(),
    instruments: Array.from(instrumentsSet).sort(),
    operationalStatuses: Array.from(statusesSet).sort(),
  };
  const metaPath = path.resolve(dataDir, "meta.json");
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf-8");
  console.log(`✓ Generated ${metaPath}`);

  // 6. Compact Screener Stocks File (for fast client screener & filtering)
  const screenerStocksPath = path.resolve(dataDir, "screener_stocks.json");
  const screenerJson = JSON.stringify(screenerStocks);
  fs.writeFileSync(screenerStocksPath, screenerJson, "utf-8");
  const screenerSizeKb = (fs.statSync(screenerStocksPath).size / 1024).toFixed(1);
  console.log(`✓ Generated ${screenerStocksPath} (${screenerSizeKb} KB, ${screenerStocks.length} stocks)`);

  // 7. Search Index File (ultra-compact for navbar instant autocomplete search)
  const searchIndex: SearchIndexStock[] = screenerStocks.map(deriveSearchIndexItem);
  const searchIndexPath = path.resolve(dataDir, "search_index.json");
  const searchIndexJson = JSON.stringify(searchIndex);
  fs.writeFileSync(searchIndexPath, searchIndexJson, "utf-8");
  const searchIndexSizeKb = (fs.statSync(searchIndexPath).size / 1024).toFixed(1);
  console.log(`✓ Generated ${searchIndexPath} (${searchIndexSizeKb} KB)`);

  // 8. Individual Stock JSON files
  let writtenStockCount = 0;
  for (const stock of allMergedStocks) {
    const code = (stock.tradingCode || "").trim().toUpperCase();
    if (!code) continue;

    const safeFileName = `${encodeURIComponent(code)}.json`;
    const stockFilePath = path.resolve(stocksDir, safeFileName);
    const stockJson = JSON.stringify(stock, null, 2);

    fs.writeFileSync(stockFilePath, stockJson, "utf-8");
    writtenStockCount++;
  }
  console.log(`✓ Generated ${writtenStockCount} individual stock JSON files in ${stocksDir}`);

  // 9. Optional All Stocks File
  let allStocksPath: string | undefined;
  if (options.saveAllStocksFile) {
    allStocksPath = path.resolve(dataDir, "all_stocks.json");
    fs.writeFileSync(allStocksPath, JSON.stringify(allMergedStocks), "utf-8");
    console.log(`✓ Generated all_stocks.json backup at ${allStocksPath}`);
  }

  // 10. Optional Master File
  let masterPath: string | undefined;
  if (options.saveMasterFile) {
    masterPath = path.resolve(dataDir, "dse_stocks.json");
    fs.writeFileSync(masterPath, JSON.stringify(allMergedStocks, null, 2), "utf-8");
    console.log(`✓ Saved master dataset to ${masterPath}`);
  }

  // 11. Optional Wrangler KV Manifest file
  let manifestPath: string | undefined;
  if (options.saveKvManifest) {
    const manifest: KvManifestEntry[] = [
      { key: "dse:meta", value: JSON.stringify(meta) },
      { key: "dse:screener_stocks", value: screenerJson },
      { key: "dse:search_index", value: searchIndexJson },
      { key: "dse:all_stocks", value: JSON.stringify(allMergedStocks) },
    ];
    for (const stock of allMergedStocks) {
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
export async function generateFromStocksDir(
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
export async function generateFromMasterFile(
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
  (async () => {
    try {
      const customSource = process.argv[2];
      if (customSource && fs.existsSync(customSource) && fs.statSync(customSource).isDirectory()) {
        await generateFromStocksDir(customSource);
      } else {
        await generateFromMasterFile(customSource || DEFAULT_SOURCE_FILE);
      }
      console.log("\n✓ All data files generated successfully!");
    } catch (err: any) {
      console.error("\n❌ Data generation failed:", err.message);
      process.exit(1);
    }
  })();
}
