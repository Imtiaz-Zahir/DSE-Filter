import type {
  RawStock,
  Stock,
  StockOverview,
  MarketInformation,
  BasicInformation,
  DividendAndSurplus,
  ShareHolding,
  InterimFinancial,
  PERatios,
  AuditedFinancial,
  HistoricalDividendPE,
  OperationalLoanStatus,
  AddressContact,
  ScreenerStock,
  SearchIndexStock,
  DividendParsedInfo,
} from "./types";

/**
 * Parses numeric values safely from strings or numbers, stripping commas,
 * unicode minus symbols, 'n/a', and invalid indicators.
 */
export function parseNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return isNaN(val) ? null : val;

  const s = String(val)
    .replace(/,/g, "")
    .replace(/−/g, "-")
    .trim();

  if (
    s === "" ||
    s === "-" ||
    s === "- -" ||
    s === "—" ||
    s.toLowerCase() === "n/a" ||
    s.toLowerCase() === "null"
  ) {
    return null;
  }

  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

/**
 * Parses percentage values safely, stripping %, commas, and unicode minus symbols.
 */
export function parsePct(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  if (typeof val === "number") return isNaN(val) ? null : val;

  const s = String(val)
    .replace(/%/g, "")
    .replace(/,/g, "")
    .replace(/−/g, "-")
    .trim();

  if (
    s === "" ||
    s === "-" ||
    s === "- -" ||
    s === "—" ||
    s.toLowerCase() === "n/a"
  ) {
    return null;
  }

  const num = parseFloat(s);
  return isNaN(num) ? null : num;
}

/**
 * Parses range strings (e.g. "15.8 - 26.6" or "10-20") into a 2-tuple of numbers.
 */
export function parseRange(val: unknown): [number | null, number | null] {
  if (
    !val ||
    typeof val !== "string" ||
    val.trim() === "" ||
    val.trim() === "-" ||
    val.trim() === "- -"
  ) {
    return [null, null];
  }

  const parts = val.split("-").map((p) => p.trim());
  if (parts.length >= 2) {
    const min = parseNum(parts[0]);
    const max = parseNum(parts[1]);
    return [min, max];
  }
  return [null, null];
}

/**
 * Parses diverse date formats into standard ISO YYYY-MM-DD or YYYY-MM string.
 * Supports DD-MM-YYYY, YYYYMM, MMM DD, YYYY, DD MMM, YYYY, and standard Date strings.
 */
export function parseDate(str: unknown): string | null {
  if (
    !str ||
    typeof str !== "string" ||
    str.trim() === "" ||
    str.trim() === "-"
  ) {
    return null;
  }

  let s = str.trim();
  // Strip trailing notes in parentheses e.g. "Jul 31, 2026 (Record Date)"
  s = s.replace(/\s*\([^)]*\)\s*/g, " ").trim();

  const months: Record<string, string> = {
    jan: "01",
    feb: "02",
    mar: "03",
    apr: "04",
    may: "05",
    jun: "06",
    jul: "07",
    aug: "08",
    sep: "09",
    oct: "10",
    nov: "11",
    dec: "12",
  };

  // 1. DD-MM-YYYY format
  const dmyMatch = s.match(/^(\d{1,2})-(\d{1,2})-(\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, "0");
    const month = dmyMatch[2].padStart(2, "0");
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // 2. YYYYMM format
  const yyyymmMatch = s.match(/^(\d{4})(\d{2})$/);
  if (yyyymmMatch) {
    return `${yyyymmMatch[1]}-${yyyymmMatch[2]}`;
  }

  // 3. MMM DD, YYYY format (e.g. "Jul 31, 2026")
  const mdyMatch = s.match(/^([A-Za-z]{3})\s+(\d{1,2}),?\s+(\d{4})$/);
  if (mdyMatch) {
    const mStr = mdyMatch[1].toLowerCase();
    if (months[mStr]) {
      const month = months[mStr];
      const day = mdyMatch[2].padStart(2, "0");
      const year = mdyMatch[3];
      return `${year}-${month}-${day}`;
    }
  }

  // 4. DD MMM, YYYY format (e.g. "31 Jul 2026")
  const dmyTextMatch = s.match(/^(\d{1,2})\s+([A-Za-z]{3}),?\s+(\d{4})$/);
  if (dmyTextMatch) {
    const mStr = dmyTextMatch[2].toLowerCase();
    if (months[mStr]) {
      const day = dmyTextMatch[1].padStart(2, "0");
      const month = months[mStr];
      const year = dmyTextMatch[3];
      return `${year}-${month}-${day}`;
    }
  }

  // 5. Native Date parser fallback
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const d = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  return s;
}

/**
 * Parses dividend string representations into structured components.
 */
export function parseDividendString(
  str: string | null | undefined
): DividendParsedInfo {
  if (!str || str === "-" || str.trim() === "") {
    return { dividend: null, cashDividendPct: null, bonusDividendPct: null };
  }

  const clean = str.trim();

  // Handle comma-separated values (e.g., "10, 5% B")
  if (clean.includes(",")) {
    const parts = clean.split(",").map((p) => p.trim());
    const cash = parseNum(parts[0]);
    const bonus = parts[1] || null;
    return { dividend: clean, cashDividendPct: cash, bonusDividendPct: bonus };
  }

  // Handle bonus dividend string indicators (e.g., "10% B" or "B")
  if (clean.includes("B") || clean.includes("%")) {
    if (/^\d+(\.\d+)?%?\s*B?$/i.test(clean) && !clean.includes("B")) {
      return {
        dividend: clean,
        cashDividendPct: parseNum(clean),
        bonusDividendPct: null,
      };
    }
    if (/B/i.test(clean) && !/^\d+(\.\d+)?$/.test(clean)) {
      return {
        dividend: clean,
        cashDividendPct: null,
        bonusDividendPct: clean,
      };
    }
  }

  return {
    dividend: clean,
    cashDividendPct: parseNum(clean),
    bonusDividendPct: null,
  };
}

/**
 * Cleans and transforms raw scraped stock data into standard typed Stock object.
 */
export function cleanStock(rawStock: RawStock): Stock {
  // 1. Overview
  const overview: StockOverview = {};
  if (rawStock.shariaStockOverview) {
    for (const [k, v] of Object.entries(rawStock.shariaStockOverview)) {
      const cleanKey = k
        .replace(/\*/g, "")
        .replace(/\nTTM/g, "")
        .replace(/\n/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (
        [
          "LTP",
          "HIGH",
          "LOW",
          "CLOSEP",
          "YCP",
          "CHANGE",
          "TRADE",
          "VALUE (mn)",
          "VOLUME",
          "#",
          "Mkt cap",
          "Price",
          "Vol",
          "Rel vol",
          "P/E",
          "EPS dil",
        ].includes(cleanKey)
      ) {
        overview[cleanKey as keyof StockOverview] = parseNum(v) as any;
      } else if (
        [
          "Chg %",
          "EPS dil growth YoY",
          "Div yield %",
        ].includes(cleanKey) ||
        cleanKey.includes("%")
      ) {
        overview[cleanKey as keyof StockOverview] = parsePct(v) as any;
      } else {
        overview[cleanKey as keyof StockOverview] = (
          v === null || v === undefined
            ? null
            : typeof v === "string"
            ? v.trim()
            : v
        ) as any;
      }
    }
  }

  // 2. Market Information
  const mktRaw = rawStock.marketInformation || {};
  const marketInformation: MarketInformation = {
    lastTradingPrice: parseNum(mktRaw["Last Trading Price"]),
    daysRange: parseRange(mktRaw["Day's Range"]),
    lastUpdate: mktRaw["Last Update"] ? String(mktRaw["Last Update"]).trim() : null,
    movingRange52Weeks: parseRange(mktRaw["52 Weeks' Moving Range"]),
    change: parseNum(mktRaw["Change*"]),
    daysTradeNos: parseNum(mktRaw["Day's Trade (Nos.)"]),
    yesterdaysClose: parseNum(mktRaw["Yesterday's Closing Price"]),
    daysVolumeNos: parseNum(mktRaw["Day's Volume (Nos.)"]),
    adjustedOpeningPrice: parseNum(mktRaw["Adjusted Opening Price"]),
    daysValueMn: parseNum(mktRaw["Day's Value (mn)"]),
    openingPrice: parseNum(mktRaw["Opening Price"]),
    marketCapMn: parseNum(mktRaw["Market Capitalization (mn)"]),
    closingPrice: parseNum(mktRaw["Closing Price"]),
    freeFloatMarketCapMn: parseNum(mktRaw["Free Float Market Cap. (mn)"]),
  };

  // 3. Basic Information
  const basicRaw = rawStock.basicInformation || {};
  const basicInformation: BasicInformation = {
    authorizedCapitalMn: parseNum(basicRaw["Authorized Capital (mn)"]),
    debutTradingDate: parseDate(basicRaw["Debut Trading Date"]),
    paidUpCapitalMn: parseNum(basicRaw["Paid-up Capital (mn)"]),
    typeOfInstrument: basicRaw["Type of Instrument"]
      ? String(basicRaw["Type of Instrument"]).trim()
      : null,
    faceParValue: parseNum(basicRaw["Face/par Value"]),
    marketLot: parseNum(basicRaw["Market Lot"]),
    totalOutstandingSecurities: parseNum(
      basicRaw["Total No. of Outstanding Securities"]
    ),
    sector: basicRaw["Sector"] ? String(basicRaw["Sector"]).trim() : null,
  };

  // 4. Dividend & Surplus (merged with corporate info if present)
  const corpRaw = rawStock.corporateInfo || {};
  const divRaw = rawStock.dividendAndSurplus || {};
  const divMerged = { ...corpRaw, ...divRaw };

  const dividendAndSurplus: DividendAndSurplus = {
    listingYear: parseNum(divMerged["Listing Year"]),
    marketCategory: divMerged["Market Category"]
      ? String(divMerged["Market Category"]).trim()
      : null,
    electronicShare:
      divMerged["Electronic Share"] === "Y"
        ? true
        : divMerged["Electronic Share"] === "N"
        ? false
        : null,
    cashDividend: divMerged["Cash Dividend"]
      ? String(divMerged["Cash Dividend"]).trim()
      : null,
    bonusIssue: divMerged["Bonus Issue (Stock Dividend)"]
      ? String(divMerged["Bonus Issue (Stock Dividend)"]).trim()
      : null,
    rightIssue: divMerged["Right Issue"]
      ? String(divMerged["Right Issue"]).trim()
      : null,
    yearEnd: divMerged["Year End"]
      ? String(divMerged["Year End"]).trim()
      : null,
    reserveSurplusWithoutOciMn: parseNum(
      divMerged["Reserve & Surplus without OCI (mn)"]
    ),
    otherComprehensiveIncomeMn: parseNum(
      divMerged["Other Comprehensive Income (OCI) (mn)"]
    ),
    remarks: divMerged["Remarks"]
      ? String(divMerged["Remarks"]).trim()
      : null,
  };

  // 5. Share Holdings
  let shareHoldings: ShareHolding[] = [];
  if (
    Array.isArray(rawStock.shareHoldings) &&
    rawStock.shareHoldings.length > 0
  ) {
    shareHoldings = rawStock.shareHoldings.map((item) => {
      const period = item.period || "";
      const dateMatch = period.match(/\[as on\s+([^\]]+)\]/i);
      const asOfDate = dateMatch ? parseDate(dateMatch[1]) : null;
      const bd = item.breakdown || {};
      return {
        period,
        asOfDate,
        sponsorDirectorPct: parseNum(bd["Sponsor/Director"]),
        govtPct: parseNum(bd["Govt"]),
        institutePct: parseNum(bd["Institute"]),
        foreignPct: parseNum(bd["Foreign"]),
        publicPct: parseNum(bd["Public"]),
      };
    });
  } else {
    // Fallback parser from dividend and surplus keys
    const shKeys = Object.keys(divRaw).filter((k) =>
      k.includes("Share Holding Percentage")
    );
    shareHoldings = shKeys.map((key) => {
      const val = divRaw[key] || "";
      const dateMatch = key.match(/\[as on\s+([^\]]+)\]/i);
      const asOfDate = dateMatch ? parseDate(dateMatch[1]) : null;

      const sponsorMatch = val.match(/Sponsor\/Director:\s*([0-9.]+)/i);
      const govtMatch = val.match(/Govt:\s*([0-9.]+)/i);
      const instMatch = val.match(/Institute:\s*([0-9.]+)/i);
      const foreignMatch = val.match(/Foreign:\s*([0-9.]+)/i);
      const publicMatch = val.match(/Public:\s*([0-9.]+)/i);

      return {
        period: key,
        asOfDate,
        sponsorDirectorPct: sponsorMatch ? parseNum(sponsorMatch[1]) : null,
        govtPct: govtMatch ? parseNum(govtMatch[1]) : null,
        institutePct: instMatch ? parseNum(instMatch[1]) : null,
        foreignPct: foreignMatch ? parseNum(foreignMatch[1]) : null,
        publicPct: publicMatch ? parseNum(publicMatch[1]) : null,
      };
    });
  }

  // 6. Interim Financials
  const interimFinancials: InterimFinancial[] = [];
  const matrixInt = rawStock.interimFinancials || [];
  if (matrixInt.length >= 11) {
    const periods = matrixInt[1] || [];
    const r2 = matrixInt[2] || [];
    const r3 = matrixInt[3] || [];
    const r5 = matrixInt[5] || [];
    const r6 = matrixInt[6] || [];
    const r8 = matrixInt[8] || [];
    const r9 = matrixInt[9] || [];
    const r10 = matrixInt[10] || [];

    for (let i = 0; i < periods.length; i++) {
      const pName = periods[i] ? periods[i].trim() : "";
      let endDate: string | null = null;
      if (i === 0 && r3[0]) endDate = parseDate(r3[0]);
      else if (i === 1 && r3[1]) endDate = parseDate(r3[1]);
      else if (i === 2) {
        const match = (r2[2] || "").match(/\d{6}/);
        endDate = parseDate(match ? match[0] : r3[1]);
      } else if (i === 3 || i === 4) {
        const match1 = pName.match(/\d{6}/);
        endDate = parseDate(match1 ? match1[0] : r3[2]);
      } else if (i === 5 && r3[3]) {
        endDate = parseDate(r3[3]);
      }

      interimFinancials.push({
        period: pName,
        endDate,
        epsBasic: parseNum(r5[i + 1]),
        epsDiluted: parseNum(r6[i + 1]),
        epsContinuingBasic: parseNum(r8[i + 1]),
        epsContinuingDiluted: parseNum(r9[i + 1]),
        marketPriceEnd: parseNum(r10[i + 1]),
      });
    }
  }

  // 7. PE Ratios
  const peRatios: PERatios = { unaudited: [], audited: [] };
  const uMatrix = rawStock.peRatiosUnaudited || [];
  if (uMatrix.length >= 4) {
    const dates = uMatrix[0] || [];
    const r1 = uMatrix[1] || [];
    const r2 = uMatrix[2] || [];
    const r3 = uMatrix[3] || [];
    for (let col = 1; col < dates.length; col++) {
      peRatios.unaudited!.push({
        date: parseDate(dates[col]),
        peBasic: parseNum(r1[col]),
        peDiluted: parseNum(r2[col]),
        peTrailing: parseNum(r3[col]),
      });
    }
  }

  const aMatrix = rawStock.peRatiosAudited || [];
  if (aMatrix.length >= 3) {
    const dates = aMatrix[0] || [];
    const r1 = aMatrix[1] || [];
    const r2 = aMatrix[2] || [];
    for (let col = 1; col < dates.length; col++) {
      peRatios.audited!.push({
        date: parseDate(dates[col]),
        peBasic: parseNum(r1[col]),
        peDiluted: parseNum(r2[col]),
      });
    }
  }

  // 8. Audited Financials
  const auditedFinancials: AuditedFinancial[] = [];
  const audMatrix = rawStock.auditedFinancials || [];
  for (let r = 3; r < audMatrix.length; r++) {
    const row = audMatrix[r];
    const yr = parseNum(row?.[0]);
    if (yr && yr >= 1990 && yr <= 2050 && row.length >= 13) {
      auditedFinancials.push({
        year: yr,
        epsBasicOriginal: parseNum(row[1]),
        epsBasicRestated: parseNum(row[2]),
        epsDilutedOriginal: parseNum(row[3]),
        epsDilutedRestated: parseNum(row[4]),
        epsContinuingBasicOriginal: parseNum(row[5]),
        epsContinuingBasicRestated: parseNum(row[6]),
        navPerShareOriginal: parseNum(row[7]),
        navPerShareRestated: parseNum(row[8]),
        profitForTheYearMnOriginal: parseNum(row[9]),
        profitForTheYearMnRestated: parseNum(row[10]),
        tciOriginal: parseNum(row[11]),
        tciRestated: parseNum(row[12]),
      });
    }
  }

  // 9. Historical Dividend PE
  const historicalDividendPE: HistoricalDividendPE[] = [];
  const histMatrix = rawStock.historicalDividendPE || [];
  for (let r = 4; r < histMatrix.length; r++) {
    const row = histMatrix[r];
    const yr = parseNum(row?.[0]);
    if (yr && yr >= 1990 && yr <= 2050 && row.length >= 9) {
      const divInfo = parseDividendString(row[7]);
      historicalDividendPE.push({
        year: yr,
        peBasicOriginal: parseNum(row[1]),
        peBasicRestated: parseNum(row[2]),
        peDiluted: parseNum(row[3]),
        peContinuing: parseNum(row[4]),
        dividend: divInfo.dividend,
        cashDividendPct: divInfo.cashDividendPct,
        bonusDividendPct: divInfo.bonusDividendPct as any,
        dividendYieldPct: parsePct(row[8]),
      });
    }
  }

  // 10. Financial Links
  const financialLinks = Array.from(
    new Set(
      Object.values(rawStock.financialLinks || {}).filter(
        (url): url is string => typeof url === "string" && url.startsWith("http")
      )
    )
  );

  // 11. Operational Loan Status
  const opRaw = rawStock.operationalLoanStatus || {};
  const operationalLoanStatus: OperationalLoanStatus = {
    presentOperationalStatus: opRaw["Present Operational Status"]
      ? String(opRaw["Present Operational Status"]).trim()
      : null,
    longTermLoanMn: parseNum(opRaw["Long-term loan (mn)"]),
    latestDividendStatus: opRaw["Latest Dividend Status (%)"]
      ? String(opRaw["Latest Dividend Status (%)"]).trim()
      : null,
  };

  // 12. Address Contact
  const addrRaw = rawStock.addressContact || {};
  const addressContact: AddressContact = {
    headOffice: addrRaw["Address"] ? String(addrRaw["Address"]).trim() : null,
    factory: addrRaw["Factory"] ? String(addrRaw["Factory"]).trim() : null,
    phone: addrRaw["Contact Phone"]
      ? String(addrRaw["Contact Phone"]).trim()
      : null,
    fax: addrRaw["Fax"] ? String(addrRaw["Fax"]).trim() : null,
    email: addrRaw["E-mail"] ? String(addrRaw["E-mail"]).trim() : null,
    webAddress: addrRaw["Web Address"]
      ? String(addrRaw["Web Address"]).trim()
      : null,
    companySecretaryName: addrRaw["Company Secretary Name"]
      ? String(addrRaw["Company Secretary Name"]).trim()
      : null,
    cellNo: addrRaw["Cell No."] ? String(addrRaw["Cell No."]).trim() : null,
    telephoneNo: addrRaw["Telephone No."]
      ? String(addrRaw["Telephone No."]).trim()
      : null,
  };

  return {
    tradingCode: rawStock.tradingCode,
    scripCode: rawStock.scripCode || null,
    companyName: rawStock.companyName || rawStock.tradingCode,
    sourceUrl: rawStock.sourceUrl,
    lastAGMHeldOn: parseDate(rawStock.lastAGMHeldOn),
    forYearEnded:
      parseDate(rawStock.forYearEnded) ||
      (rawStock.forYearEnded ? String(rawStock.forYearEnded).trim() : null),
    overview,
    marketInformation,
    basicInformation,
    dividendAndSurplus,
    shareHoldings,
    interimFinancials,
    peRatios,
    auditedFinancials,
    historicalDividendPE,
    financialLinks,
    operationalLoanStatus,
    addressContact,
    scrapedAt: rawStock.scrapedAt,
    shariaCompliant: Boolean(rawStock.shariaCompliant),
  };
}

/**
 * Extracts latest audited P/E ratio.
 */
export function getAuditedPe(stock: Stock): number | null {
  const audited = stock.peRatios?.audited;
  if (Array.isArray(audited)) {
    for (let i = audited.length - 1; i >= 0; i--) {
      const pe = audited[i].peBasic ?? audited[i].peDiluted;
      if (typeof pe === "number" && !isNaN(pe)) return pe;
    }
  }
  return null;
}

/**
 * Extracts latest unaudited P/E ratio.
 */
export function getUnauditedPe(stock: Stock): number | null {
  const unaudited = stock.peRatios?.unaudited;
  if (Array.isArray(unaudited)) {
    for (let i = unaudited.length - 1; i >= 0; i--) {
      const pe =
        unaudited[i].peTrailing ?? unaudited[i].peBasic ?? unaudited[i].peDiluted;
      if (typeof pe === "number" && !isNaN(pe)) return pe;
    }
  }
  return null;
}

/**
 * Extracts the most recent audited financial report item.
 */
export function getLatestAuditedFinancial(stock: Stock): AuditedFinancial | null {
  if (Array.isArray(stock.auditedFinancials) && stock.auditedFinancials.length > 0) {
    return [...stock.auditedFinancials].sort((a, b) => (b.year || 0) - (a.year || 0))[0];
  }
  return null;
}

/**
 * Extracts the most recent historical dividend / yield entry.
 */
export function getLatestHistoricalDividend(
  stock: Stock
): HistoricalDividendPE | null {
  if (
    Array.isArray(stock.historicalDividendPE) &&
    stock.historicalDividendPE.length > 0
  ) {
    return [...stock.historicalDividendPE].sort(
      (a, b) => (b.year || 0) - (a.year || 0)
    )[0];
  }
  return null;
}

/**
 * Extracts latest shareholding breakdown.
 */
export function getLatestShareholding(stock: Stock): ShareHolding | null {
  if (Array.isArray(stock.shareHoldings) && stock.shareHoldings.length > 0) {
    return stock.shareHoldings[stock.shareHoldings.length - 1];
  }
  return null;
}

/**
 * Transforms a full Stock object into an optimized, lightweight ScreenerStock.
 */
export function deriveScreenerStock(stock: Stock): ScreenerStock {
  const code = (stock.tradingCode || "").trim().toUpperCase();
  const sector = stock.basicInformation?.sector || "Miscellaneous";
  const rawCat = stock.dividendAndSurplus?.marketCategory || "Unknown";
  const category = rawCat !== "-" && rawCat ? rawCat.toUpperCase() : "Unknown";
  const instrument = stock.basicInformation?.typeOfInstrument || "Equity";
  const status = stock.operationalLoanStatus?.presentOperationalStatus || "Active";

  const ltp =
    stock.overview?.LTP ?? stock.marketInformation?.lastTradingPrice ?? null;
  const change =
    stock.overview?.CHANGE ?? stock.marketInformation?.change ?? null;
  const ycp =
    stock.overview?.YCP ?? stock.marketInformation?.yesterdaysClose ?? null;

  const changePct =
    change !== null && ycp && ycp > 0
      ? +((change / ycp) * 100).toFixed(2)
      : ltp !== null && ycp && ycp > 0
      ? +(((ltp - ycp) / ycp) * 100).toFixed(2)
      : null;

  const audPe = getAuditedPe(stock);
  const unAudPe = getUnauditedPe(stock);
  const pe = audPe ?? unAudPe;

  const aud = getLatestAuditedFinancial(stock);
  const div = getLatestHistoricalDividend(stock);
  const sh = getLatestShareholding(stock);

  const nav = aud
    ? aud.navPerShareRestated ?? aud.navPerShareOriginal ?? null
    : null;

  const eps = aud
    ? aud.epsDilutedRestated ??
      aud.epsBasicRestated ??
      aud.epsDilutedOriginal ??
      aud.epsBasicOriginal ??
      null
    : null;

  const netProfit = aud
    ? aud.profitForTheYearMnRestated ??
      aud.profitForTheYearMnOriginal ??
      aud.tciRestated ??
      aud.tciOriginal ??
      null
    : null;

  const pb =
    ltp !== null && nav !== null && nav > 0
      ? +(ltp / nav).toFixed(2)
      : null;

  const divYield =
    div && typeof div.dividendYieldPct === "number" && !isNaN(div.dividendYieldPct)
      ? div.dividendYieldPct
      : null;

  return {
    tradingCode: code,
    scripCode: stock.scripCode || null,
    companyName: stock.companyName || code,
    sector,
    category,
    shariaCompliant: Boolean(stock.shariaCompliant),
    ltp,
    change,
    ycp,
    changePct,
    high: stock.overview?.HIGH ?? stock.marketInformation?.daysRange?.[1] ?? null,
    low: stock.overview?.LOW ?? stock.marketInformation?.daysRange?.[0] ?? null,
    range52Week: stock.marketInformation?.movingRange52Weeks || null,
    pe,
    auditedPe: audPe,
    unauditedPe: unAudPe,
    pb,
    nav,
    eps,
    netProfit,
    divYield,
    cashDividend: stock.dividendAndSurplus?.cashDividend || div?.dividend || null,
    bonusIssue: stock.dividendAndSurplus?.bonusIssue || null,
    marketCap: stock.marketInformation?.marketCapMn ?? null,
    freeFloatCap: stock.marketInformation?.freeFloatMarketCapMn ?? null,
    paidUpCap: stock.basicInformation?.paidUpCapitalMn ?? null,
    authorizedCap: stock.basicInformation?.authorizedCapitalMn ?? null,
    volume: stock.overview?.VOLUME ?? stock.marketInformation?.daysVolumeNos ?? null,
    turnover:
      stock.overview?.["VALUE (mn)"] ??
      stock.marketInformation?.daysValueMn ??
      null,
    trades: stock.overview?.TRADE ?? stock.marketInformation?.daysTradeNos ?? null,
    debt: stock.operationalLoanStatus?.longTermLoanMn ?? 0,
    listingYear: stock.dividendAndSurplus?.listingYear ?? null,
    instrumentType: instrument,
    operationalStatus: status,
    sponsorPct:
      typeof sh?.sponsorDirectorPct === "number" ? sh.sponsorDirectorPct : null,
    institutePct:
      typeof sh?.institutePct === "number" ? sh.institutePct : null,
    foreignPct: typeof sh?.foreignPct === "number" ? sh.foreignPct : null,
    publicPct: typeof sh?.publicPct === "number" ? sh.publicPct : null,
    govtPct: typeof sh?.govtPct === "number" ? sh.govtPct : null,
    shareholdingPeriod: sh?.period || sh?.asOfDate || null,
  };
}

/**
 * Creates minimal navbar search index representation from a ScreenerStock.
 */
export function deriveSearchIndexItem(
  stock: ScreenerStock
): SearchIndexStock {
  return {
    tradingCode: stock.tradingCode,
    companyName: stock.companyName || stock.tradingCode,
    sector: stock.sector || "Miscellaneous",
    category: stock.category || "Unknown",
    shariaCompliant: Boolean(stock.shariaCompliant),
    ltp: stock.ltp ?? null,
    change: stock.change ?? null,
    changePct: stock.changePct ?? null,
  };
}
