import * as cheerio from "cheerio";
import type {
  CseMarketQuote,
  CseIndexDataResult,
  CseRawCompanyDetails,
  CreditRatingItem,
  ExecutiveContact,
} from "./types";
import { parseNum, parsePct, parseDate } from "./parser";

// Allow self-signed certificates if CSE server certificate chain has issues
if (typeof process !== "undefined" && process.env) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
  "Accept-Language": "en-US,en;q=0.5",
};

/**
 * Strips extraneous whitespaces and newlines from scraped text.
 */
function cleanText(text: string | null | undefined): string {
  if (!text) return "";
  return text.trim().replace(/\s+/g, " ");
}

/**
 * Scrapes CSE Sector & Benchmark Index data including the official CSI Shariah index.
 * URL: https://www.cse.com.bd/market/sectorindexdata
 */
export async function fetchCseIndexData(timeoutMs = 15000): Promise<CseIndexDataResult> {
  const url = "https://www.cse.com.bd/market/sectorindexdata";
  console.log(`[cse-scraper] Fetching CSE Index Data from ${url}...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const csiSymbols = new Set<string>();
    const cse30Symbols = new Set<string>();
    const cse50Symbols = new Set<string>();
    const caspiSymbols = new Set<string>();
    const cscxSymbols = new Set<string>();
    const sectorIndices: CseIndexDataResult["sectorIndices"] = {};

    // Helper to extract symbols from index table
    const extractSymbolsFromTable = (tableEl: any, targetSet: Set<string>) => {
      $(tableEl)
        .find("tr")
        .each((_, tr) => {
          const cells = $(tr)
            .find("td")
            .map((_, td) => cleanText($(td).text()))
            .get();
          if (cells.length >= 2) {
            const sym = cells[1].trim().toUpperCase();
            if (sym && sym !== "STOCK CODE" && !sym.includes("SHARE BY COMPANY")) {
              targetSet.add(sym);
            }
          }
        });
    };

    $("table").each((_, table) => {
      const tableText = cleanText($(table).text());

      if (tableText.includes("CSI Share by Company Name")) {
        extractSymbolsFromTable(table, csiSymbols);
      } else if (tableText.includes("CSE 30 Share by Company Name")) {
        extractSymbolsFromTable(table, cse30Symbols);
      } else if (tableText.includes("CSE 50 Share by Company Name")) {
        extractSymbolsFromTable(table, cse50Symbols);
      } else if (tableText.includes("CASPI Share by Company Name")) {
        extractSymbolsFromTable(table, caspiSymbols);
      } else if (tableText.includes("CSCX Share by Company Name")) {
        extractSymbolsFromTable(table, cscxSymbols);
      } else if (
        tableText.includes("Sector Name") &&
        tableText.includes("Index value") &&
        tableText.includes("Pre: day index")
      ) {
        $(table)
          .find("tr")
          .each((_, tr) => {
            const cells = $(tr)
              .find("td")
              .map((_, td) => cleanText($(td).text()))
              .get();
            if (cells.length >= 6) {
              const secName = cells[1];
              if (secName && secName !== "Sector Name") {
                sectorIndices[secName] = {
                  indexValue: parseNum(cells[2]),
                  prevIndex: parseNum(cells[3]),
                  change: parseNum(cells[4]),
                  changePct: parsePct(cells[5]),
                };
              }
            }
          });
      }
    });

    console.log(
      `[cse-scraper] Parsed ${csiSymbols.size} CSI Shariah stocks, ${cse30Symbols.size} CSE 30, ${cse50Symbols.size} CSE 50, ${caspiSymbols.size} CASPI.`
    );

    return {
      csiSymbols,
      cse30Symbols,
      cse50Symbols,
      caspiSymbols,
      cscxSymbols,
      sectorIndices,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`[cse-scraper] Failed to fetch CSE Index Data:`, err.message);
    return {
      csiSymbols: new Set(),
      cse30Symbols: new Set(),
      cse50Symbols: new Set(),
      caspiSymbols: new Set(),
      cscxSymbols: new Set(),
      sectorIndices: {},
    };
  }
}

/**
 * Scrapes live share price board from Chittagong Stock Exchange (CSE).
 * URL: https://www.cse.com.bd/market/current_price
 */
export async function fetchCseLivePrices(
  timeoutMs = 15000
): Promise<Map<string, CseMarketQuote>> {
  const url = "https://www.cse.com.bd/market/current_price";
  console.log(`[cse-scraper] Fetching live CSE quotes board from ${url}...`);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const quoteMap = new Map<string, CseMarketQuote>();

  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Look for data table
    $("table#dataTable tr, table.dataTable tr, table tr").each((_, tr) => {
      const tds = $(tr).find("td");
      if (tds.length >= 9) {
        const cells = tds.map((_, td) => cleanText($(td).text())).get();
        const rawCode = (cells[1] || "").trim().toUpperCase();

        if (rawCode && rawCode !== "STOCK CODE" && rawCode !== "SL.") {
          const ltp = parseNum(cells[2]);
          const open = parseNum(cells[3]);
          const high = parseNum(cells[4]);
          const low = parseNum(cells[5]);
          const ycp = parseNum(cells[6]);
          const trades = parseNum(cells[7]);
          const valueMn = parseNum(cells[8]);
          const volume = parseNum(cells[9]);

          let change: number | null = null;
          let changePct: number | null = null;
          if (ltp !== null && ycp !== null && ycp > 0) {
            change = +(ltp - ycp).toFixed(2);
            changePct = +(((ltp - ycp) / ycp) * 100).toFixed(2);
          }

          quoteMap.set(rawCode, {
            ltp,
            open,
            high,
            low,
            ycp,
            change,
            changePct,
            trades,
            valueMn,
            volume,
            updatedDate: new Date().toISOString(),
          });
        }
      }
    });

    console.log(`[cse-scraper] Successfully parsed ${quoteMap.size} live CSE stock quotes.`);
    return quoteMap;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.error(`[cse-scraper] Failed to fetch live CSE quotes:`, err.message);
    return quoteMap;
  }
}

/**
 * Scrapes an individual company detail page on CSE.
 * Extracts Credit Rating Status, Executive Contacts, and Basic Company Details.
 * URL: https://www.cse.com.bd/company/companydetails/[symbol]
 */
export async function scrapeCseCompanyDetails(
  symbol: string,
  timeoutMs = 15000
): Promise<CseRawCompanyDetails | null> {
  const code = symbol.trim().toUpperCase();
  const url = `https://www.cse.com.bd/company/companydetails/${encodeURIComponent(code)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return null;
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    const details: CseRawCompanyDetails = {
      tradingCode: code,
      creditRatings: [],
      executiveContacts: [],
    };

    // 1. Credit Rating Status Table
    $("table").each((_, table) => {
      const tableText = cleanText($(table).text());

      if (tableText.includes("Credit Rating Status") || tableText.includes("Credit Rating Year")) {
        $(table)
          .find("tr")
          .each((_, tr) => {
            const cells = $(tr)
              .find("td")
              .map((_, td) => cleanText($(td).text()))
              .get();
            if (cells.length >= 6) {
              const ratingDate = cells[0];
              const longTerm = cells[1];
              const shortTerm = cells[2];
              const outlook = cells[3];
              const validityDate = cells[4];
              const ratingAgency = cells[5];

              if (
                ratingDate &&
                ratingDate !== "Credit Rating Year" &&
                ratingDate !== "Rating Date"
              ) {
                details.creditRatings?.push({
                  ratingDate: parseDate(ratingDate) || ratingDate,
                  longTerm: longTerm !== "-" ? longTerm : null,
                  shortTerm: shortTerm !== "-" ? shortTerm : null,
                  outlook: outlook !== "-" ? outlook : null,
                  validityDate: parseDate(validityDate) || validityDate,
                  ratingAgency: ratingAgency !== "-" ? ratingAgency : null,
                });
              }
            }
          });
      }

      // 2. Executive Contacts
      if (
        tableText.includes("Designation") &&
        tableText.includes("Mobile Number") &&
        (tableText.includes("Chairman") || tableText.includes("MD") || tableText.includes("CFO"))
      ) {
        $(table)
          .find("tr")
          .each((_, tr) => {
            const cells = $(tr)
              .find("td")
              .map((_, td) => cleanText($(td).text()))
              .get();
            if (cells.length >= 4) {
              const desig = cells[0];
              const name = cells[1];
              const mobile = cells[2];
              const email = cells[3];

              if (desig && desig !== "Designation" && name) {
                details.executiveContacts?.push({
                  designation: desig,
                  name,
                  mobile: mobile !== "N/A" && mobile !== "-" ? mobile : null,
                  email: email !== "N/A" && email !== "-" ? email : null,
                });
              }
            }
          });
      }

      // 3. Basic Information
      if (tableText.includes("Authorized Capital in BDT") || tableText.includes("Market Category")) {
        const fullText = tableText;
        const authMatch = fullText.match(/Authorized Capital in BDT\*?\s*\(mn\)\s*([\d,.]+)/i);
        const paidMatch = fullText.match(/Paid-up Capital in BDT\*?\s*\(mn\)\s*([\d,.]+)/i);
        const faceMatch = fullText.match(/Face Value\s*([\d.]+)/i);
        const lotMatch = fullText.match(/Market Lot\s*([\d]+)/i);
        const sectorMatch = fullText.match(/Sector\s*([A-Za-z &]+?)(?=\s*Market Category|\s*Paid)/i);
        const catMatch = fullText.match(/Market Category\s*([A-Z])/i);

        if (authMatch) details.authorizedCapitalMn = parseNum(authMatch[1]);
        if (paidMatch) details.paidUpCapitalMn = parseNum(paidMatch[1]);
        if (faceMatch) details.faceValue = parseNum(faceMatch[1]);
        if (lotMatch) details.marketLot = parseNum(lotMatch[1]);
        if (sectorMatch) details.sector = sectorMatch[1].trim();
        if (catMatch) details.category = catMatch[1].trim();
      }

      // 4. Other Information
      if (tableText.includes("Listing Year") || tableText.includes("Reserve / Surplus")) {
        const listMatch = tableText.match(/Listing Year\s*(\d{4})/i);
        const reserveMatch = tableText.match(/Reserve\s*\/\s*Surplus\(mn\)\s*([\d,.-]+)/i);
        if (listMatch) details.listingYear = parseNum(listMatch[1]);
        if (reserveMatch) details.reserveSurplusMn = parseNum(reserveMatch[1]);
      }

      // 5. Financial Performance (5-Year summary on CSE)
      if (tableText.includes("Financial Performance") && tableText.includes("Basic EPS")) {
        const rows = $(table).find("tr");
        if (rows.length >= 3) {
          const firstDataRow = rows.eq(2).find("td").map((_, td) => cleanText($(td).text())).get();
          if (firstDataRow.length >= 7) {
            details.eps = parseNum(firstDataRow[1]);
            details.navPerShare = parseNum(firstDataRow[3]) || parseNum(firstDataRow[4]);
            details.netProfitMn = parseNum(firstDataRow[5]);
            details.dividendYieldPct = parsePct(firstDataRow[7]);
          }
        }
      }
    });

    return details;
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[cse-scraper] Failed to scrape details for ${code}:`, err.message);
    return null;
  }
}

/**
 * Scrapes a batch of CSE company details pages with concurrency and backoff.
 */
export async function scrapeCseBatch(
  symbols: string[],
  options: { concurrency?: number; delayMs?: number } = {}
): Promise<Map<string, CseRawCompanyDetails>> {
  const concurrency = options.concurrency ?? 4;
  const delayMs = options.delayMs ?? 300;
  const results = new Map<string, CseRawCompanyDetails>();
  const total = symbols.length;

  console.log(
    `[cse-scraper] Starting CSE company details scrape for ${total} symbols (concurrency: ${concurrency})...`
  );

  for (let i = 0; i < total; i += concurrency) {
    const chunk = symbols.slice(i, i + concurrency);
    const chunkPromises = chunk.map((sym) => scrapeCseCompanyDetails(sym));
    const chunkResults = await Promise.all(chunkPromises);

    chunkResults.forEach((res, idx) => {
      if (res && res.tradingCode) {
        results.set(res.tradingCode, res);
      }
    });

    if (i + concurrency < total && delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  console.log(`[cse-scraper] Completed CSE details scrape for ${results.size} companies.`);
  return results;
}
