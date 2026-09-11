import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type {
  Stock,
  RawStock,
  RawOverviewItem,
  ScrapeOptions,
  GenerateOptions,
} from "./types";
import { cleanStock } from "./parser";
import {
  scrapeAllCompanies,
  loadOverviewData,
  fetchLiveDseOverview,
  loadShariaData,
} from "./scraper";
import {
  generateDataFiles,
  generateFromMasterFile,
  DEFAULT_DATA_DIR,
  DEFAULT_SOURCE_FILE,
} from "./generate-data";

export * from "./types";
export * from "./parser";
export * from "./scraper";
export * from "./generate-data";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Full end-to-end data pipeline:
 * 1. Fetches/Loads overview quotes & Sharia compliance dataset.
 * 2. Scrapes all company detail pages from DSEbd.
 * 3. Cleans, parses, and normalizes raw table structures into typed Stock objects.
 * 4. Generates all production datasets (meta.json, screener_stocks.json, search_index.json, all_stocks.json, stocks/*.json, kv_manifest.json).
 */
export async function runScrapeAndGeneratePipeline(
  options: ScrapeOptions & GenerateOptions & { useLiveOverview?: boolean } = {}
): Promise<{
  stocks: Stock[];
  screenerStocksPath: string;
  metaPath: string;
  searchIndexPath: string;
}> {
  console.log("=== DSE Filter Data Scrape & Generation Pipeline ===\n");

  // 1. Load or fetch overview items
  let overviewItems: RawOverviewItem[] = [];
  if (options.useLiveOverview) {
    try {
      overviewItems = await fetchLiveDseOverview();
    } catch (err: any) {
      console.warn(
        `[pipeline] Live overview scrape failed (${err.message}), falling back to local dataset...`
      );
      overviewItems = loadOverviewData(options.stocksDataPath);
    }
  } else {
    overviewItems = loadOverviewData(options.stocksDataPath);
    if (overviewItems.length === 0) {
      console.log("[pipeline] Local overview file not found, fetching live DSE quotes...");
      overviewItems = await fetchLiveDseOverview();
    }
  }

  if (overviewItems.length === 0) {
    throw new Error(
      "No stocks found to scrape. Please verify data.json or network connection."
    );
  }

  // Pre-load Sharia compliance records
  const shariaData = loadShariaData(options.shariaDataPath);
  console.log(`[pipeline] Loaded ${shariaData.length} Sharia compliance records.`);

  // 2. Scrape raw details for each company
  const rawStocks: RawStock[] = await scrapeAllCompanies(overviewItems, {
    concurrency: options.concurrency ?? 5,
    delayMs: options.delayMs ?? 400,
    timeoutMs: options.timeoutMs ?? 15000,
    maxRetries: options.maxRetries ?? 3,
    userAgent: options.userAgent,
  });

  // 3. Clean and normalize raw data into typed Stock objects
  console.log(`[pipeline] Cleaning and normalizing ${rawStocks.length} scraped stocks...`);
  const formattedStocks: Stock[] = rawStocks.map(cleanStock);

  // 4. Generate all production data files
  const output = generateDataFiles(formattedStocks, {
    dataDir: options.dataDir || DEFAULT_DATA_DIR,
    saveMasterFile: false,
    saveKvManifest: false,
    saveAllStocksFile: false,
  });

  console.log("\n=== Pipeline Execution Completed Successfully! ===");
  return {
    stocks: formattedStocks,
    screenerStocksPath: output.screenerStocksPath,
    metaPath: output.metaPath,
    searchIndexPath: output.searchIndexPath,
  };
}

/**
 * Parses command line arguments and executes requested task.
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
DSE Filter Data Processing Script

Usage:
  npx tsx scripts/index.ts [command] [options]

Commands:
  --generate (default)   Generates meta, screener_stocks, search_index, all_stocks, and stocks/*.json from dse_stocks.json
  --scrape               Performs full live scraping from DSE, formats data, and generates all files
  --format <rawFile>     Formats an uncleaned raw stock JSON file and generates all files

Options:
  --source <path>        Path to master dse_stocks.json (default: data/dse_stocks.json)
  --output <dir>         Output data directory (default: data/)
  --concurrency <n>      Number of parallel scrape requests (default: 5)
  --delay <ms>           Delay in ms between batches (default: 400)
  --live                 Force fetching live overview table before scraping
  --help, -h             Show this help message

Examples:
  npx tsx scripts/index.ts --generate
  npx tsx scripts/index.ts --scrape --concurrency 8
  npx tsx scripts/index.ts --format ../Downloads/stock/dse_stocks_details.json
`);
    return;
  }

  const isScrape = args.includes("--scrape");
  const isFormat = args.includes("--format");
  const isLive = args.includes("--live");

  const getArgValue = (flag: string): string | undefined => {
    const idx = args.indexOf(flag);
    if (idx !== -1 && idx + 1 < args.length) {
      return args[idx + 1];
    }
    return undefined;
  };

  const customSource = getArgValue("--source");
  const customOutput = getArgValue("--output");
  const concurrencyStr = getArgValue("--concurrency");
  const delayStr = getArgValue("--delay");

  const concurrency = concurrencyStr ? parseInt(concurrencyStr, 10) : 5;
  const delayMs = delayStr ? parseInt(delayStr, 10) : 400;

  if (isScrape) {
    await runScrapeAndGeneratePipeline({
      concurrency,
      delayMs,
      useLiveOverview: isLive,
      dataDir: customOutput,
    });
  } else if (isFormat) {
    const rawFilePath = getArgValue("--format") || args[args.indexOf("--format") + 1];
    if (!rawFilePath || !fs.existsSync(rawFilePath)) {
      console.error(`Error: Raw stock file not found at: ${rawFilePath}`);
      process.exit(1);
    }
    console.log(`Reading raw stocks from ${rawFilePath}...`);
    const rawData = JSON.parse(fs.readFileSync(rawFilePath, "utf-8"));
    const stocks: Stock[] = rawData.map(cleanStock);
    generateDataFiles(stocks, {
      dataDir: customOutput,
      saveMasterFile: false,
      saveKvManifest: false,
      saveAllStocksFile: false,
    });
    console.log("✓ Formatting and data file generation complete!");
  } else {
    // Default mode: Generate derived datasets
    const sourceFile = customSource || DEFAULT_SOURCE_FILE;
    generateFromMasterFile(sourceFile, {
      dataDir: customOutput,
      saveKvManifest: false,
      saveMasterFile: false,
      saveAllStocksFile: false,
    });
    console.log("✓ Data generation completed successfully!");
  }
}

// Run CLI when invoked directly
const isDirectRun =
  process.argv[1] &&
  (process.argv[1].endsWith("index.ts") ||
    process.argv[1].endsWith("index.js") ||
    process.argv[1].endsWith("index.mjs"));

if (isDirectRun) {
  main().catch((err) => {
    console.error("\n❌ Execution failed:", err);
    process.exit(1);
  });
}
