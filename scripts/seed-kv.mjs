import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const dataDir = path.resolve(rootDir, "data");
const stocksDir = path.resolve(dataDir, "stocks");

const metaFile = path.resolve(dataDir, "meta.json");
const screenerFile = path.resolve(dataDir, "screener_stocks.json");
const searchIndexFile = path.resolve(dataDir, "search_index.json");

// CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes("--dry-run");
const isPreview = args.includes("--preview");
const isForce = args.includes("--force");
const isIfEmpty = args.includes("--if-empty") || args.includes("--check-first");
const isOptional = args.includes("--allow-fail") || args.includes("--optional");
const isRemote = args.includes("--remote") || (!isPreview && !isDryRun);
const targetFlag = isPreview ? "--preview" : "--remote";

const bindingIdx = args.indexOf("--binding");
const bindingName = bindingIdx !== -1 && args[bindingIdx + 1] ? args[bindingIdx + 1] : "DSE_DATA";

const checkKeyIdx = args.indexOf("--check-key");
const checkKey = checkKeyIdx !== -1 && args[checkKeyIdx + 1] ? args[checkKeyIdx + 1] : "dse:meta";

console.log("=== DSE Filter Cloudflare KV Seeder ===");
console.log(`Mode: ${isDryRun ? "DRY RUN (no upload)" : targetFlag}`);
console.log(`KV Binding: ${bindingName}`);
if (isIfEmpty && !isForce) {
  console.log(`Condition: Only seed if '${checkKey}' is missing in KV (--if-empty)`);
}

// Function to check if data already exists in KV
function checkKvHasData(key, binding, target) {
  try {
    const cmd = `npx wrangler kv key get "${key}" --binding ${binding} --text ${target}`;
    const res = execSync(cmd, {
      cwd: rootDir,
      stdio: ["pipe", "pipe", "pipe"],
      encoding: "utf-8",
    });
    if (res && res.trim().length > 0) {
      return { exists: true, data: res.trim() };
    }
    return { exists: false };
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : "";
    const stdout = err.stdout ? err.stdout.toString() : "";
    const combined = `${stdout}\n${stderr}`;

    if (
      combined.includes("404") ||
      combined.includes("Not Found") ||
      combined.includes("key not found")
    ) {
      return { exists: false };
    }
    return { exists: false, error: combined.trim() || err.message };
  }
}

// If --if-empty is set and not forced, check KV first
if (isIfEmpty && !isForce && !isDryRun) {
  console.log(`Checking if key '${checkKey}' exists in KV binding '${bindingName}'...`);
  const checkResult = checkKvHasData(checkKey, bindingName, targetFlag);

  if (checkResult.exists) {
    console.log(`\n✓ Data already exists in KV ('${checkKey}' found). Skipping seed.`);
    process.exit(0);
  }

  if (checkResult.error) {
    console.warn(`\n⚠️ Note: KV check returned: ${checkResult.error}`);
    if (isOptional) {
      console.warn("⚠️ Skipping KV seed due to --allow-fail flag.");
      process.exit(0);
    }
  } else {
    console.log(`ℹ️ Key '${checkKey}' not found in KV. Proceeding with seed upload...`);
  }
}

// Validate prerequisite files
if (!fs.existsSync(metaFile)) {
  console.error(`Error: Missing ${metaFile}`);
  process.exit(1);
}
if (!fs.existsSync(screenerFile)) {
  console.error(`Error: Missing ${screenerFile}`);
  process.exit(1);
}
if (!fs.existsSync(stocksDir)) {
  console.error(`Error: Missing ${stocksDir}`);
  process.exit(1);
}

const manifest = [];

// 1. Meta Entry
const metaRaw = fs.readFileSync(metaFile, "utf-8");
manifest.push({
  key: "dse:meta",
  value: metaRaw.trim(),
});

// 2. Screener Stocks Entry
const screenerRaw = fs.readFileSync(screenerFile, "utf-8");
manifest.push({
  key: "dse:screener_stocks",
  value: screenerRaw.trim(),
});

// 3. Search Index Entry (if exists or fallback generated)
if (fs.existsSync(searchIndexFile)) {
  const searchRaw = fs.readFileSync(searchIndexFile, "utf-8");
  manifest.push({
    key: "dse:search_index",
    value: searchRaw.trim(),
  });
}

// 4. Individual Stocks & Combined Array
const stockFiles = fs.readdirSync(stocksDir).filter((f) => f.endsWith(".json"));
const allStocks = [];

let stockCount = 0;
for (const file of stockFiles) {
  const filePath = path.resolve(stocksDir, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  const stock = JSON.parse(raw);
  const code = (stock.tradingCode || path.basename(file, ".json")).trim().toUpperCase();

  allStocks.push(stock);
  manifest.push({
    key: `stock:${code}`,
    value: JSON.stringify(stock),
  });
  stockCount++;
}

// 5. Aggregate All Stocks Entry
manifest.push({
  key: "dse:all_stocks",
  value: JSON.stringify(allStocks),
});

console.log(`\nPrepared ${manifest.length} KV entries:`);
console.log(`  - dse:meta`);
console.log(`  - dse:screener_stocks`);
console.log(`  - dse:search_index`);
console.log(`  - dse:all_stocks (${allStocks.length} stocks)`);
console.log(`  - Individual stock keys (${stockCount} stocks)\n`);

if (isDryRun) {
  console.log("✓ Dry run completed successfully. No data was uploaded to KV.");
  process.exit(0);
}

// Generate temp manifest file in OS temporary directory
const tempFile = path.join(os.tmpdir(), `dse_kv_manifest_${Date.now()}.json`);

try {
  console.log(`Writing payload to temporary file: ${tempFile}`);
  fs.writeFileSync(tempFile, JSON.stringify(manifest), "utf-8");

  const manifestSizeMb = (fs.statSync(tempFile).size / (1024 * 1024)).toFixed(2);
  console.log(`Payload size: ${manifestSizeMb} MB`);
  console.log(`Executing: wrangler kv bulk put <tempFile> --binding ${bindingName} ${targetFlag}...`);

  execSync(`npx wrangler kv bulk put "${tempFile}" --binding ${bindingName} ${targetFlag}`, {
    cwd: rootDir,
    stdio: "inherit",
  });

  console.log("\n✓ KV upload completed successfully!");
} catch (err) {
  console.error("\n❌ KV upload failed:", err.message);
  if (isOptional) {
    console.warn("⚠️ Continuing without failing due to --allow-fail flag.");
    process.exit(0);
  }
  process.exit(1);
} finally {
  // Always remove temp file
  if (fs.existsSync(tempFile)) {
    try {
      fs.unlinkSync(tempFile);
      console.log("✓ Cleaned up temporary manifest file.");
    } catch {
      // Ignore cleanup error
    }
  }
}
