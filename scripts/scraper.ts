import fs from "node:fs";
import path from "node:path";
import * as cheerio from "cheerio";
import type {
  RawStock,
  RawShareHolding,
  RawOverviewItem,
  ShariaStockItem,
  ScrapeOptions,
} from "./types";

// Allow self-signed certificates if DSE server certificate chain has issues
if (typeof process !== "undefined" && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

let cachedShariaData: ShariaStockItem[] = [];
let cachedAllCodes: string[] = [];

/**
 * Strips extraneous whitespaces and newlines from scraped text.
 */
export function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Parses 2-column or 4-column key-value tables from DSE page.
 */
export function parseKeyValueTable(
  $: cheerio.CheerioAPI,
  table: any,
): Record<string, string> {
  const result: Record<string, string> = {};
  $(table)
    .find("tr")
    .each((_, tr) => {
      const cells = $(tr)
        .find("td, th")
        .map((_, td) => cleanText($(td).text()))
        .get();

      for (let i = 0; i < cells.length; i += 2) {
        let key = cells[i];
        const val = cells[i + 1];
        if (key && val !== undefined) {
          key = key.replace(/:$/, "").trim();
          if (key && !key.includes("Graph:") && key !== "-") {
            result[key] = val;
          }
        }
      }
    });
  return result;
}

/**
 * Parses matrix data tables into 2D string array.
 */
export function parseMatrixTable(
  $: cheerio.CheerioAPI,
  table: any,
): string[][] {
  const matrix: string[][] = [];
  $(table)
    .find("tr")
    .each((_, tr) => {
      const row = $(tr)
        .find("td, th")
        .map((_, td) => cleanText($(td).text()))
        .get();
      if (row.length > 0 && row.some((cell) => cell.length > 0)) {
        matrix.push(row);
      }
    });
  return matrix;
}

/**
 * Parses shareholding percentage table and captures breakdown.
 */
export function parseShareHoldings(
  $: cheerio.CheerioAPI,
  table: any,
): RawShareHolding[] {
  const holdings: RawShareHolding[] = [];
  $(table)
    .find("tr")
    .each((_, tr) => {
      const text = cleanText($(tr).text());
      if (text.includes("Share Holding Percentage")) {
        const labelMatch = text.match(/Share Holding Percentage\s*(\[.*?\])?/i);
        const label = labelMatch ? labelMatch[0] : "Share Holding Percentage";
        const breakdown: Record<string, string> = {};

        const parts = text.split(
          /(Sponsor\/Director:|Govt:|Institute:|Foreign:|Public:)/i,
        );
        for (let i = 1; i < parts.length; i += 2) {
          const key = parts[i].replace(":", "").trim();
          const valStr = parts[i + 1] ? parts[i + 1].trim().split(" ")[0] : "";
          if (key && valStr) {
            breakdown[key] = valStr;
          }
        }
        holdings.push({
          period: label,
          breakdown,
          rawText: text,
        });
      }
    });
  return holdings;
}

/**
 * Loads Sharia stock compliance dataset.
 */
export function loadShariaData(customData?: ShariaStockItem[] | string): ShariaStockItem[] {
  if (Array.isArray(customData) && customData.length > 0) {
    return customData;
  }
  return [
    "ZAHEENSPIN",
    "YPL",
    "WALTONHIL",
    "VFSTDLVF",
    "UNIONBANK",
    "TITASGAS",
    "TAKAFULINS",
    "SUMITPOWER",
    "STANCERAM",
    "SSSTEEL",
    "SQURPHARMA",
    "SPCL",
    "SPCERAMICS",
    "SONALIPAPR",
    "SKTRIMSS",
    "SINOBANGLA",
    "SINGERBD",
    "SIMTEX",
    "SILVAPHL",
    "SILCOPHL",
    "SIBL",
    "SHURWID",
    "SHAHJABANK",
    "SAPORTL",
    "SAMORITA",
    "SAMATALETH",
    "SAIHAMCOT",
    "RSRMSTEEL",
    "REGENTTEX",
    "RECKITTBEN",
    "RDFOOD",
    "RANFOUNDRY",
    "RAKCERAMICRA",
    "QUASEMIND",
    "PRIMETEX",
    "PRIMELIFE",
    "PREMIERCEM",
    "PDL",
    "PADMALIFE",
    "OLYMPIC",
    "OAL",
    "NFML",
    "NAVANACNG",
    "NAHEEACP",
    "MONNOCERA",
    "MLDYEING",
    "MJLBDMJ",
    "MIRACLEIND",
    "MHSML",
    "MARICO",
    "MALEKSPIN",
    "LRBDL",
    "LINDEBD",
    "LIBRAINFU",
    "LHB",
    "KPCL",
    "KOHINOOR",
    "KDSALTDKD",
    "KBPPWBIL",
    "KA",
    "JMISMDLJM",
    "JHRMLJM",
    "ITCI",
    "ISLAMIINS",
    "ISLAMICFIN",
    "ISLAMIBANK",
    "INTRACO",
    "INTECH",
    "INDEXAGRO",
    "IBP",
    "IBNSINAB",
    "HWAWELLTEX",
    "HFL",
    "HEIDELBCEM",
    "HAMI",
    "HAKKANIPUL",
    "GQBALLPEN",
    "GP",
    "GIB",
    "GHCL",
    "FUWANGFOOD",
    "FORTUNE",
    "FIRSTSBANK",
    "FINEFOODS",
    "FEKDIL",
    "FAREASTLIF",
    "FAMILYTEX",
    "EXIMBANK",
    "ESQUIRENIT",
    "EGE",
    "ECABLES",
    "DSSL",
    "DOREENPWR",
    "DOMINAGE",
    "DAFODILCOM",
    "DACCADYE",
    "COPPERTECH",
    "CLICL",
    "CENTRALPHL",
    "BEXIMCO",
    "BERGERPBL",
    "BENGALWTL",
    "BEACONPHAR",
    "BDTHAI",
    "BBSCABLESBB",
    "BBS",
    "BATASHOE",
    "BARKAPOWER",
    "BANGAS",
    "APEXSPINN",
    "APEXFOODS",
    "AOL",
    "ANWARGALV",
    "AMBEEPHA",
    "ALIF",
    "ALARABANK",
    "AGNISYSL",
    "AFCAGROAF",
    "ADVENT",
    "ADNTELAD",
    "ACMEPLACM",
    "ACIFORMULAAC",
    "ACFL",
    "AAMRATECH",
    "AAMRANE",
  ];
}

/**
 * Loads market overview records (e.g. data/data.json).
 */
export function loadOverviewData(customPath?: string): RawOverviewItem[] {
  const candidatePaths = [
    customPath,
    path.resolve(process.cwd(), "data", "data.json"),
    path.resolve(process.cwd(), "data.json"),
  ].filter(Boolean) as string[];

  for (const p of candidatePaths) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          cachedAllCodes = parsed
            .map((s) => s["TRADING CODE"] || s.tradingCode)
            .filter((c): c is string => typeof c === "string" && c.length > 0);
          return parsed;
        }
      } catch (err) {
        console.warn(`[scraper] Failed to parse overview data at ${p}:`, err);
      }
    }
  }

  return [];
}

/**
 * Checks whether a given trading code is Sharia compliant.
 * Handles exact trading codes (string array) as well as legacy object lists.
 */
export function isShariaCompliant(
  tradingCode: string,
  shariaData?: ShariaStockItem[],
  allTradingCodes?: string[],
): boolean {
  if (!tradingCode) return false;
  const list = shariaData || loadShariaData();
  if (!list || list.length === 0) return false;

  const code = tradingCode.trim().toUpperCase();
  const codes = allTradingCodes || cachedAllCodes;

  for (const item of list) {
    const rawSym =
      typeof item === "string" ? item : item.Symbol || item.tradingCode || "";
    const sym = (rawSym || "").trim().toUpperCase();
    if (!sym) continue;

    // 1. Exact match
    if (sym === code) {
      return true;
    }

    // 2. Prefix / Truncated match support
    if (sym.startsWith(code)) {
      const hasLongerMatch = codes.some(
        (c) =>
          c.length > code.length && c.startsWith(code) && sym.startsWith(c),
      );
      if (!hasLongerMatch) return true;
    }

    if (code.startsWith(sym) && sym.length >= 3) {
      return true;
    }
  }

  return false;
}

/**
 * Scrapes latest quotes & list of active mainboard companies from DSE live share price board.
 * URL: https://www.dsebd.org/latest_share_price_scroll_l.php
 */
export async function fetchLiveDseOverview(): Promise<RawOverviewItem[]> {
  const url = "https://www.dsebd.org/latest_share_price_scroll_l.php";

  const headers = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  };

  console.log(`[scraper] Fetching live DSE stock price board from ${url}...`);
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`Failed to fetch live share price list: HTTP ${res.status} ${res.statusText}`);
  }

  const html = await res.text();
  const $ = cheerio.load(html);

  const items: RawOverviewItem[] = [];
  const seenCodes = new Set<string>();

  $("table.shares-table tr, table.table-bordered tr").each((_, tr) => {
    const tds = $(tr).find("td");
    if (tds.length >= 10) {
      const row = tds.map((_, td) => cleanText($(td).text())).get();
      const codeLink = cleanText($(tr).find("a[href*='displayCompany.php']").text());
      const rawCode = (codeLink || row[1] || "").trim().toUpperCase();

      if (rawCode && !seenCodes.has(rawCode)) {
        seenCodes.add(rawCode);
        const item: RawOverviewItem = {
          "#": parseInt(row[0], 10) || items.length + 1,
          "TRADING CODE": rawCode,
          tradingCode: rawCode,
          "LTP*": row[2] || "",
          "HIGH": row[3] || "",
          "LOW": row[4] || "",
          "CLOSEP*": row[5] || "",
          "YCP*": row[6] || "",
          "CHANGE": row[7] || "",
          "TRADE": row[8] || "",
          "VALUE (mn)": row[9] || "",
          "VOLUME": row[10] || "",
        };
        items.push(item);
      }
    }
  });

  if (items.length === 0) {
    throw new Error("Failed to parse stock entries from DSE live share price board.");
  }

  cachedAllCodes = items
    .map((s) => s["TRADING CODE"] || s.tradingCode)
    .filter((c): c is string => typeof c === "string" && c.length > 0);

  console.log(
    `[scraper] Successfully parsed ${items.length} active stocks with live market quotes.`,
  );
  return items;
}

/**
 * Scrapes an individual company page from DSE and parses all sections.
 */
export async function scrapeCompanyData(
  stock: RawOverviewItem | { tradingCode: string; [key: string]: any },
  options: ScrapeOptions = {},
): Promise<RawStock> {
  const code = (stock["TRADING CODE"] || stock.tradingCode || "").trim();
  const url = `https://www.dsebd.org/displayCompany.php?name=${encodeURIComponent(
    code,
  )}`;
  const userAgent =
    options.userAgent ||
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
  const maxRetries = options.maxRetries ?? 3;
  const timeoutMs = options.timeoutMs ?? 15000;

  let lastError: Error | null = null;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const res = await fetch(url, {
        headers: { "User-Agent": userAgent },
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const html = await res.text();
      const $ = cheerio.load(html);
      const bodyText = $.text();

      // Extract Header Fields
      const companyNameMatch = bodyText.match(
        /Company Name:\s*([^\n\r\t]+?)(?=\s*Trading Code:|\s*Scrip Code:|\n|\r|$)/i,
      );
      const companyName = companyNameMatch
        ? companyNameMatch[1].trim()
        : stock["Symbol"] || code;

      const scripCodeMatch = bodyText.match(/Scrip Code:\s*([0-9]+)/i);
      const scripCode = scripCodeMatch ? scripCodeMatch[1] : null;

      const agmMatch = bodyText.match(
        /Last AGM held on:\s*([^\n\r]+?)(?=\s*For the year ended:|\n|\r|$)/i,
      );
      const yearEndedMatch = bodyText.match(
        /For the year ended:\s*([^\n\r]+?)(?=\s*Interim|\s*Price Earnings|\n|\r|$)/i,
      );

      let marketInfo: Record<string, string> = {};
      let basicInfo: Record<string, string> = {};
      let dividendSurplus: Record<string, string> = {};
      let interimFinancials: string[][] = [];
      let peRatiosUnaudited: string[][] = [];
      let peRatiosAudited: string[][] = [];
      let auditedFinancials: string[][] = [];
      let historicalDividendPE: string[][] = [];
      const financialLinks: Record<string, string> = {};
      let corporateInfo: Record<string, string> = {};
      let shareHoldings: RawShareHolding[] = [];
      let operationalLoanStatus: Record<string, string> = {};
      let addressContact: Record<string, string> = {};

      $("table.table").each((_, table) => {
        const tableText = cleanText($(table).text());

        if (
          tableText.includes("Last Trading Price") ||
          tableText.includes("Market Capitalization")
        ) {
          marketInfo = parseKeyValueTable($, table);
        } else if (
          tableText.includes("Authorized Capital") ||
          tableText.includes("Paid-up Capital")
        ) {
          basicInfo = parseKeyValueTable($, table);
        } else if (
          tableText.includes("Cash Dividend") ||
          tableText.includes("Reserve & Surplus")
        ) {
          dividendSurplus = parseKeyValueTable($, table);
        } else if (
          tableText.includes("Earnings Per Share") &&
          (tableText.includes("Q1") || tableText.includes("Half Yearly"))
        ) {
          interimFinancials = parseMatrixTable($, table);
        } else if (
          tableText.includes("Current P/E Ratio using Basic EPS") ||
          tableText.includes("Trailing P/E Ratio")
        ) {
          if (
            tableText.includes("Un-audited") ||
            peRatiosUnaudited.length === 0
          ) {
            peRatiosUnaudited.push(...parseMatrixTable($, table));
          } else {
            peRatiosAudited.push(...parseMatrixTable($, table));
          }
        } else if (
          tableText.includes("NAV Per Share") ||
          tableText.includes("Profit/(Loss) and OCI")
        ) {
          auditedFinancials = parseMatrixTable($, table);
        } else if (
          tableText.includes("Dividend Yield in %") ||
          tableText.includes("Year end Price")
        ) {
          historicalDividendPE = parseMatrixTable($, table);
        } else if (
          tableText.includes("Details of Financial Statement") ||
          tableText.includes("Price Sensitive Information")
        ) {
          $(table)
            .find("tr")
            .each((_, tr) => {
              const key = cleanText($(tr).find("td").eq(0).text());
              const href = $(tr).find("a").attr("href");
              if (key && href) financialLinks[key] = href;
            });
        } else if (
          tableText.includes("Listing Year") ||
          tableText.includes("Market Category")
        ) {
          corporateInfo = parseKeyValueTable($, table);
          shareHoldings = parseShareHoldings($, table);
        } else if (
          tableText.includes("Present Operational Status") ||
          tableText.includes("Short-term loan")
        ) {
          operationalLoanStatus = parseKeyValueTable($, table);
        } else if (
          tableText.includes("Head Office") ||
          tableText.includes("Company Secretary Name")
        ) {
          addressContact = parseKeyValueTable($, table);
        }
      });

      return {
        tradingCode: code,
        scripCode,
        companyName,
        sourceUrl: url,
        lastAGMHeldOn: agmMatch ? agmMatch[1].trim() : null,
        forYearEnded: yearEndedMatch ? yearEndedMatch[1].trim() : null,
        marketInformation: marketInfo,
        basicInformation: basicInfo,
        dividendAndSurplus: dividendSurplus,
        interimFinancials,
        peRatiosUnaudited,
        peRatiosAudited,
        auditedFinancials,
        historicalDividendPE,
        financialLinks,
        corporateInfo,
        shareHoldings,
        operationalLoanStatus,
        addressContact,
        scrapedAt: new Date().toISOString(),
        shariaStockOverview: stock,
        shariaCompliant: isShariaCompliant(code),
      };
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        const backoff = Math.pow(2, attempt) * 500;
        await new Promise((r) => setTimeout(r, backoff));
      }
    }
  }

  console.error(
    `[scraper] Failed to scrape ${code} after ${maxRetries} attempts:`,
    lastError?.message,
  );
  return {
    tradingCode: code,
    sourceUrl: url,
    shariaStockOverview: stock,
    shariaCompliant: isShariaCompliant(code),
    error: lastError?.message || "Unknown scrape error",
    scrapedAt: new Date().toISOString(),
  };
}

/**
 * Scrapes a batch of companies with controlled concurrency and delay.
 */
export async function scrapeAllCompanies(
  stocks: RawOverviewItem[],
  options: ScrapeOptions = {},
): Promise<RawStock[]> {
  const concurrency = options.concurrency ?? 5;
  const delayMs = options.delayMs ?? 400;
  const results: RawStock[] = [];
  const total = stocks.length;

  console.log(
    `[scraper] Starting scrape for ${total} companies (concurrency: ${concurrency}, delay: ${delayMs}ms)...`,
  );

  for (let i = 0; i < total; i += concurrency) {
    const chunk = stocks.slice(i, i + concurrency);
    const batchIndex = Math.floor(i / concurrency) + 1;
    const totalBatches = Math.ceil(total / concurrency);

    console.log(
      `[scraper] Batch ${batchIndex}/${totalBatches} (items ${i + 1}-${Math.min(
        i + concurrency,
        total,
      )} / ${total})...`,
    );

    const chunkPromises = chunk.map((stock) =>
      scrapeCompanyData(stock, options),
    );
    const chunkResults = await Promise.all(chunkPromises);
    results.push(...chunkResults);

    if (i + concurrency < total && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.log(`[scraper] Completed scraping ${results.length} companies.`);
  return results;
}
