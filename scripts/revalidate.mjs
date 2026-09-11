import { fileURLToPath } from "node:url";

const args = process.argv.slice(2);

const urlIdx = args.indexOf("--url");
const targetUrl =
  urlIdx !== -1 && args[urlIdx + 1]
    ? args[urlIdx + 1]
    : process.env.REVALIDATION_URL || "https://dse-filter.1mt2.workers.dev/api/revalidate";

const secretIdx = args.indexOf("--secret");
const secret =
  secretIdx !== -1 && args[secretIdx + 1]
    ? args[secretIdx + 1]
    : process.env.REVALIDATION_SECRET || "";

const tagIdx = args.indexOf("--tag");
const tag = tagIdx !== -1 && args[tagIdx + 1] ? args[tagIdx + 1] : "";

const codeIdx = args.indexOf("--code");
const code = codeIdx !== -1 && args[codeIdx + 1] ? args[codeIdx + 1] : "";

const pathIdx = args.indexOf("--path");
const pathVal = pathIdx !== -1 && args[pathIdx + 1] ? args[pathIdx + 1] : "";

async function main() {
  console.log("=== DSE Filter Cache Revalidation CLI ===");
  console.log(`Endpoint: ${targetUrl}`);

  const payload = {};
  if (code) {
    payload.code = code.toUpperCase().trim();
    console.log(`Target Stock Code: ${payload.code}`);
  } else if (tag) {
    payload.tag = tag;
    console.log(`Target Tag: ${tag}`);
  } else if (pathVal) {
    payload.path = pathVal;
    console.log(`Target Path: ${pathVal}`);
  } else {
    payload.tags = ["stocks", "screener", "dse-meta"];
    console.log(`Target: All market datasets & pages`);
  }

  const headers = { "Content-Type": "application/json" };
  if (secret) {
    headers["x-revalidate-secret"] = secret;
  }

  try {
    const res = await fetch(targetUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    const body = await res.json().catch(() => null);

    if (res.ok) {
      console.log("\n✓ Cache revalidation completed successfully:");
      console.log(JSON.stringify(body, null, 2));
    } else {
      console.error(`\n❌ Revalidation failed with status ${res.status}:`, body);
      process.exit(1);
    }
  } catch (err) {
    console.error("\n❌ Network error during revalidation:", err.message);
    process.exit(1);
  }
}

main();
