import { AnyStock, SortField, SortDirection } from "./types";
import {
  getCategory,
  getShariaCompliant,
  getChange,
  getDivYieldPct,
  getPe,
  getPbRatio,
  getDebt,
  getSponsorPct,
  getInstitutePct,
  getForeignPct,
  getMarketCap,
  getTurnover,
  getVolume,
  getOperationalStatus,
  getInstrumentType,
  getSector,
  get52WeekRange,
  getLtp,
} from "./stocks";

export type GroupCategoryType =
  | "category"
  | "shariah"
  | "breadth"
  | "status"
  | "valuation"
  | "ownership"
  | "activity"
  | "sector"
  | "instrument";

export interface MarketGroupDef {
  slug: string;
  title: string;
  shortTitle: string;
  categoryType: GroupCategoryType;
  categoryLabel: string;
  badge: string;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline" | "emerald" | "amber" | "blue" | "purple";
  description: string;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  icon: string; // Icon identifier for rendering
  filterFn: (stock: AnyStock) => boolean;
  defaultSort?: { field: SortField; direction: SortDirection };
  overviewText: string;
  criteriaList: string[];
  faqs: { q: string; a: string }[];
  relatedSlugs: string[];
}

function isNear52WeekHigh(stock: AnyStock): boolean {
  const ltp = getLtp(stock);
  const range = get52WeekRange(stock);
  if (ltp !== null && range && range[1] && range[1] > 0) {
    return ltp >= range[1] * 0.95;
  }
  return false;
}

function isNear52WeekLow(stock: AnyStock): boolean {
  const ltp = getLtp(stock);
  const range = get52WeekRange(stock);
  if (ltp !== null && range && range[0] && range[0] > 0) {
    return ltp <= range[0] * 1.05;
  }
  return false;
}

export const MARKET_GROUPS: MarketGroupDef[] = [
  // ==========================================
  // 1. DSE MARKET CATEGORIES
  // ==========================================
  {
    slug: "category-a",
    title: "DSE Category A Stocks",
    shortTitle: "Category A",
    categoryType: "category",
    categoryLabel: "Market Category",
    badge: "Category A",
    badgeVariant: "emerald",
    icon: "ShieldCheck",
    description:
      "Fundamentally established companies listed on the Dhaka Stock Exchange holding regular Annual General Meetings (AGMs) and declaring 10% or higher dividends.",
    metaTitle: "DSE Category A Stocks List — High Dividend & Blue Chip Companies Dhaka Stock Exchange",
    metaDescription:
      "Explore all DSE Category A listed stocks. Filter Bangladesh companies with 10%+ dividend declarations, regular AGMs, low debt, audited balance sheets, and strong governance.",
    keywords: [
      "DSE Category A stocks",
      "Dhaka stock exchange category A",
      "best stocks to buy DSE",
      "DSE 10 percent dividend stocks",
      "Category A share price",
      "Dhaka stock exchange blue chips",
    ],
    filterFn: (stock: AnyStock) => getCategory(stock) === "A",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Under Dhaka Stock Exchange listing regulations, Category 'A' represents the premium tier of equities. To maintain Category 'A' status, a company must hold its Annual General Meeting (AGM) regularly and declare a minimum 10% cash or stock dividend from its net annual profits. These companies generally offer higher liquidity, standardized settlement cycles (T+2), and lower default risk.",
    criteriaList: [
      "Must hold regular Annual General Meetings (AGM) within the statutory timeframe.",
      "Must declare and distribute a minimum of 10% dividend (cash/stock) in the preceding accounting year.",
      "Settlement cycle of T+2 trading days under Central Depository Bangladesh Limited (CDBL).",
      "Eligible for margin loan facilities as per BSEC credit regulations.",
    ],
    faqs: [
      {
        q: "What qualifies a company as Category A on Dhaka Stock Exchange?",
        a: "A listed company qualifies for Category A if it holds its Annual General Meeting (AGM) within the mandated statutory period and declares at least 10% dividend (cash or bonus) to shareholders based on audited annual financial results.",
      },
      {
        q: "What is the trading settlement cycle for Category A stocks in Bangladesh?",
        a: "Category A stocks settle on a standard T+2 cycle (transaction day plus two trading days), allowing faster liquidation compared to Category Z stocks which settle on T+3.",
      },
      {
        q: "Are Category A stocks eligible for margin trading?",
        a: "Yes, Category A equities with compliant P/E ratios (typically below 40 as per BSEC guidelines) are generally eligible for margin facilities through licensed brokerage houses.",
      },
    ],
    relatedSlugs: ["category-b", "shariah", "high-dividend", "low-pe", "large-cap"],
  },
  {
    slug: "category-b",
    title: "DSE Category B Stocks",
    shortTitle: "Category B",
    categoryType: "category",
    categoryLabel: "Market Category",
    badge: "Category B",
    badgeVariant: "amber",
    icon: "Building2",
    description:
      "Companies listed on the Dhaka Stock Exchange holding regular AGMs but declaring less than 10% dividend in the preceding financial year.",
    metaTitle: "DSE Category B Stocks List — Regular AGM Low Dividend Stocks Dhaka Stock Exchange",
    metaDescription:
      "Complete list of DSE Category B stocks. Browse Bangladesh companies holding regular AGMs with under 10% dividend distributions, audited financials, and valuation multiples.",
    keywords: [
      "DSE Category B stocks",
      "Category B Dhaka stock exchange",
      "DSE dividend below 10 percent",
      "Category B share price today",
      "Bangladesh stock screener Category B",
    ],
    filterFn: (stock: AnyStock) => getCategory(stock) === "B",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Category 'B' comprises companies on the Dhaka Stock Exchange that comply with corporate governance requirements by holding timely Annual General Meetings (AGMs) but declare dividends below 10% (e.g., 2% to 9.99%). While these companies demonstrate operational transparency, their dividend yields may be modest compared to Category 'A' market leaders.",
    criteriaList: [
      "Must hold regular Annual General Meetings (AGMs) on schedule.",
      "Declared dividend is less than 10% in the preceding accounting period.",
      "Settlement cycle follows T+2 trading days.",
      "Subject to standard financial disclosure and quarterly reporting rules.",
    ],
    faqs: [
      {
        q: "How does Category B differ from Category A on DSE?",
        a: "Both Category A and Category B companies hold regular AGMs, but Category A companies declare 10% or higher dividends, whereas Category B companies declare dividends below 10%.",
      },
      {
        q: "Can a Category B company get promoted to Category A?",
        a: "Yes. If a Category B company declares 10% or higher dividend in its upcoming audited financial year while maintaining regular AGMs, the DSE reclassifies it to Category A.",
      },
    ],
    relatedSlugs: ["category-a", "category-z", "below-book-value", "high-dividend"],
  },
  {
    slug: "category-z",
    title: "DSE Category Z Stocks (Junk / Problem Companies)",
    shortTitle: "Category Z",
    categoryType: "category",
    categoryLabel: "Market Category",
    badge: "Category Z",
    badgeVariant: "destructive",
    icon: "AlertTriangle",
    description:
      "High-risk, non-compliant, or loss-making companies on DSE with irregular AGMs, operational shutdowns, or failed dividend distributions.",
    metaTitle: "DSE Category Z Stocks List — High Risk & Distressed Companies Dhaka Stock Exchange",
    metaDescription:
      "Comprehensive list of DSE Category Z stocks. Analyze high-risk Bangladesh companies with irregular AGMs, non-operational factories, consecutive net losses, and T+3 settlement.",
    keywords: [
      "DSE Category Z stocks",
      "Category Z list DSE",
      "DSE junk stocks",
      "distressed companies Dhaka stock exchange",
      "Category Z share price",
      "non operational companies DSE",
    ],
    filterFn: (stock: AnyStock) => getCategory(stock) === "Z",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Category 'Z' comprises distressed, non-operational, or governance-challenged companies listed on the Dhaka Stock Exchange. Reasons for placement in Category Z include failure to hold consecutive AGMs, operational closure for more than 6 months, accumulated negative reserves exceeding paid-up capital, or failure to pay declared dividends. Category Z securities trade with higher restrictions (T+3 settlement, 100% margin requirements, no netting).",
    criteriaList: [
      "Failure to hold Annual General Meeting (AGM) within the statutory calendar year.",
      "Failure to declare or distribute dividends for consecutive accounting cycles.",
      "Factory or core business non-operational for over 6 continuous months.",
      "Accumulated losses exceeding paid-up capital or negative Net Asset Value (NAV).",
      "Strict trading restrictions: T+3 settlement cycle, no intraday netting, zero margin loan support.",
    ],
    faqs: [
      {
        q: "What are the trading risks of Category Z stocks?",
        a: "Category Z stocks carry high default and liquidity risks. They settle on a slower T+3 cycle, require 100% cash funding (no margin loans), and are subject to regulatory investigations or delisting procedures if operational recovery fails.",
      },
      {
        q: "Can Category Z stocks be transferred back to Category A or B?",
        a: "Yes. When a company clears overdue AGMs, resumes continuous commercial operations, and declares regular dividends, DSE and BSEC can approve reclassification back to Category A or B.",
      },
    ],
    relatedSlugs: ["closed", "operational", "category-a", "category-b"],
  },
  {
    slug: "category-n",
    title: "DSE Category N Stocks (Newly Listed IPOs)",
    shortTitle: "Category N",
    categoryType: "category",
    categoryLabel: "Market Category",
    badge: "Category N",
    badgeVariant: "blue",
    icon: "Sparkles",
    description:
      "Newly listed companies and IPO shares making their debut on the Dhaka Stock Exchange before their first Annual General Meeting (AGM) and dividend declaration.",
    metaTitle: "DSE Category N Stocks List — Newly Listed IPOs Dhaka Stock Exchange",
    metaDescription:
      "Track newly listed Initial Public Offering (IPO) equities in DSE Category N. View debut trading performance, issue prices, quarterly earnings, and prospectus financials.",
    keywords: [
      "DSE Category N stocks",
      "DSE new IPO list",
      "Dhaka stock exchange new listings",
      "recent IPO Bangladesh stock market",
      "Category N share price",
    ],
    filterFn: (stock: AnyStock) => getCategory(stock) === "N",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Category 'N' represents newly listed companies on the Dhaka Stock Exchange. Newly debuted Initial Public Offerings (IPOs) remain in Category 'N' until they complete their initial operating cycle and hold their first Annual General Meeting (AGM). Once their first dividend is declared, they transition to Category 'A', 'B', or 'Z' based on dividend percentage and compliance.",
    criteriaList: [
      "Newly listed equity instrument on DSE through Initial Public Offering (IPO) or Direct Listing.",
      "Remains in Category N until the conclusion of its first statutory AGM.",
      "Transition criteria: Promoted to Category A with 10%+ dividend, Category B with <10% dividend, or Category Z if non-compliant.",
    ],
    faqs: [
      {
        q: "How long does a company stay in Category N on DSE?",
        a: "A company stays in Category N until its first Annual General Meeting (AGM) post-listing where it announces its audited annual financial statement and dividend declaration.",
      },
      {
        q: "What happens if there are zero stocks in Category N currently?",
        a: "Category N only has stocks when recent IPOs have debuted but haven't held their first AGM yet. When all previous IPOs complete their first AGM cycle, Category N temporarily empties until the next IPO listing.",
      },
    ],
    relatedSlugs: ["category-a", "large-cap", "small-cap", "shariah"],
  },

  // ==========================================
  // 2. ISLAMIC / SHARIAH COMPLIANCE
  // ==========================================
  {
    slug: "shariah",
    title: "DSES Shariah Compliant Stocks",
    shortTitle: "DSES Shariah",
    categoryType: "shariah",
    categoryLabel: "Islamic Finance",
    badge: "DSES Sharia",
    badgeVariant: "emerald",
    icon: "ShieldCheck",
    description:
      "All 125+ securities approved under the Dhaka Stock Exchange Shariah Index (DSES) adhering to strict Islamic capital market screening principles.",
    metaTitle: "DSES Shariah Compliant Stocks List — Halal Investing Dhaka Stock Exchange",
    metaDescription:
      "Filter 125+ DSES Sharia compliant Bangladesh stocks. Screen Halal DSE securities with debt-to-asset ratios, non-interest revenue models, P/E ratios, and dividend yields.",
    keywords: [
      "DSES Sharia stocks",
      "Shariah compliant stocks DSE",
      "Halal investing Bangladesh",
      "Dhaka stock exchange Islamic index",
      "DSES index list",
      "Halal shares Bangladesh",
    ],
    filterFn: (stock: AnyStock) => getShariaCompliant(stock),
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "The DSE Shariah Index (DSES) features listed securities that fulfill Islamic financial screening standards designed by international Shariah supervisory boards (in collaboration with S&P). Companies must operate ethical, non-prohibited business activities (excluding conventional interest banking, alcohol, gambling, and tobacco) and meet financial ratio screens: conventional debt/total assets under 33%, cash and interest-bearing securities under 33%, and accounts receivable under 49%.",
    criteriaList: [
      "Business Activity Screen: Core operations must not involve conventional interest banking/lending, gambling, alcohol, pork products, or non-permissible media.",
      "Conventional Debt Ratio: Total interest-bearing debt divided by 36-month average market capitalisation must not exceed 33%.",
      "Cash & Interest Securities: Cash and interest-earning deposits divided by market capitalisation must not exceed 33%.",
      "Receivables Ratio: Accounts receivable divided by total assets must not exceed 49%.",
      "Quarterly Shariah Advisory Review: Regular rebalancing and compliance audits by DSE Shariah Supervisory Board.",
    ],
    faqs: [
      {
        q: "What is the DSES Index on Dhaka Stock Exchange?",
        a: "The DSES (DSE Shariah Index) is a benchmark index measuring the performance of Shariah-compliant equities listed on the Dhaka Stock Exchange, screened for Islamic business ethics and financial leverage limits.",
      },
      {
        q: "How frequently is the DSES Sharia stock list updated?",
        a: "The DSE Shariah Index undergoes semi-annual and annual reviews by the DSE Shariah Supervisory Board, adding newly compliant companies and removing securities that breach debt or revenue thresholds.",
      },
    ],
    relatedSlugs: ["category-a", "zero-debt", "high-dividend", "low-pe", "large-cap"],
  },

  // ==========================================
  // 3. MARKET BREADTH & MOMENTUM (LAST SESSION)
  // ==========================================
  {
    slug: "bullish",
    title: "Last Session Bullish Stocks (Top Gainers)",
    shortTitle: "Last Session Bullish",
    categoryType: "breadth",
    categoryLabel: "Market Breadth",
    badge: "Bullish (Gainers)",
    badgeVariant: "emerald",
    icon: "TrendingUp",
    description:
      "Equities that closed the latest trading session with a positive price gain (LTP > Yesterday's Close), indicating bullish upward momentum.",
    metaTitle: "Last Session Bullish Stocks DSE — Daily Top Gainers Dhaka Stock Exchange",
    metaDescription:
      "Track all stocks closing higher in the latest DSE session. Discover daily top price gainers, percentage surges, trading volume, turnover, and valuation metrics.",
    keywords: [
      "DSE top gainers",
      "bullish stocks Dhaka stock exchange",
      "DSE share price up today",
      "daily gainers Bangladesh stock market",
      "DSE market momentum",
    ],
    filterFn: (stock: AnyStock) => (getChange(stock) || 0) > 0,
    defaultSort: { field: "changePct", direction: "desc" },
    overviewText:
      "Bullish stocks represent all companies on the Dhaka Stock Exchange whose Last Trading Price (LTP) advanced above their Yesterday's Closing Price (YCP) during the latest market session. Tracking session gainers highlights short-term sector rotation, institutional accumulation, and market momentum.",
    criteriaList: [
      "Daily net price change (LTP - YCP) > 0.00 BDT.",
      "Positive daily percentage change (+0.01% to daily circuit breaker limit).",
      "Sorted by percentage change or turnover volume.",
    ],
    faqs: [
      {
        q: "What is the maximum daily price increase (circuit breaker) on DSE?",
        a: "DSE applies dynamic circuit breakers depending on the stock's price band (ranging from 10% for high-priced stocks to tiered limits for lower-priced issues) to protect against excessive intraday volatility.",
      },
    ],
    relatedSlugs: ["top-turnover", "top-volume", "52-week-high", "category-a"],
  },
  {
    slug: "bearish",
    title: "Last Session Bearish Stocks (Top Losers)",
    shortTitle: "Last Session Bearish",
    categoryType: "breadth",
    categoryLabel: "Market Breadth",
    badge: "Bearish (Losers)",
    badgeVariant: "destructive",
    icon: "TrendingDown",
    description:
      "Equities that closed the latest trading session with a price decline (LTP < Yesterday's Close), reflecting selling pressure or pullback.",
    metaTitle: "Last Session Bearish Stocks DSE — Daily Top Losers Dhaka Stock Exchange",
    metaDescription:
      "Explore all stocks closing lower in the latest DSE trading session. Analyze daily top losers, percentage declines, volume spikes, and potential oversold dip opportunities.",
    keywords: [
      "DSE top losers",
      "bearish stocks Dhaka stock exchange",
      "DSE share price down today",
      "daily losers Bangladesh stock market",
      "oversold stocks DSE",
    ],
    filterFn: (stock: AnyStock) => (getChange(stock) || 0) < 0,
    defaultSort: { field: "changePct", direction: "asc" },
    overviewText:
      "Bearish stocks closed the latest trading session below their previous day's closing price. While price drops may reflect broader market pullbacks, profit-taking, or negative corporate announcements, value investors often monitor high-quality Category 'A' names among losers for attractive entry valuations.",
    criteriaList: [
      "Daily net price change (LTP - YCP) < 0.00 BDT.",
      "Negative daily percentage change (-0.01% to lower circuit breaker floor limit).",
    ],
    faqs: [
      {
        q: "Can a bearish stock offer good long-term investment value?",
        a: "Yes. When fundamentally strong Category A or Shariah companies experience short-term sector pullbacks, their lower entry prices can offer higher dividend yields and more attractive P/E multiples.",
      },
    ],
    relatedSlugs: ["bullish", "neutral", "below-book-value", "low-pe"],
  },
  {
    slug: "neutral",
    title: "Last Session Neutral Stocks (Unchanged)",
    shortTitle: "Last Session Neutral",
    categoryType: "breadth",
    categoryLabel: "Market Breadth",
    badge: "Neutral (Unchanged)",
    badgeVariant: "secondary",
    icon: "Activity",
    description:
      "Equities that closed the latest trading session flat with zero net price change compared to their previous closing price.",
    metaTitle: "Last Session Neutral Stocks DSE — Unchanged Share Prices Dhaka Stock Exchange",
    metaDescription:
      "List of DSE stocks that closed unchanged in the latest market session. View trading volume, floor price defense, bid-ask spreads, and fundamental ratios.",
    keywords: [
      "DSE unchanged stocks",
      "neutral stocks Dhaka stock exchange",
      "flat share price DSE",
      "DSE market breadth unchanged",
    ],
    filterFn: (stock: AnyStock) => getChange(stock) === 0 || getChange(stock) === null,
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Neutral or unchanged stocks ended the trading session at the exact same price as their previous close (Net Change = 0.00 BDT). In the Bangladesh stock market, neutral stocks often represent price consolidation, balanced buyer/seller equilibrium, or securities resting on floor/ceiling support levels.",
    criteriaList: [
      "Daily net price change = 0.00 BDT or no transactions recorded.",
      "Percentage change = 0.00%.",
    ],
    faqs: [
      {
        q: "Why do some stocks remain unchanged for multiple sessions on DSE?",
        a: "Stocks can remain unchanged due to low liquidity in specific issues, balanced bid-ask orders, or floor price constraints where buyers and sellers are waiting for fresh corporate disclosures.",
      },
    ],
    relatedSlugs: ["bullish", "bearish", "category-a", "zero-debt"],
  },

  // ==========================================
  // 4. OPERATIONAL & COMPANY STATUS
  // ==========================================
  {
    slug: "operational",
    title: "Operational Companies (Active Businesses)",
    shortTitle: "Operational (Active)",
    categoryType: "status",
    categoryLabel: "Operational Status",
    badge: "Active Operational",
    badgeVariant: "emerald",
    icon: "CheckCircle2",
    description:
      "Companies listed on the Dhaka Stock Exchange with confirmed active operations, ongoing factory manufacturing, and commercial business continuity.",
    metaTitle: "Operational Companies List DSE — Active Listed Businesses Dhaka Stock Exchange",
    metaDescription:
      "Discover all actively operating companies listed on the DSE. Filter 350+ running Bangladesh businesses with active factories, regular revenue, and audited balance sheets.",
    keywords: [
      "operational companies DSE",
      "active companies Dhaka stock exchange",
      "running listed companies Bangladesh",
      "commercial operation DSE stocks",
    ],
    filterFn: (stock: AnyStock) => getOperationalStatus(stock).toLowerCase() === "active",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Over 90% of listed companies on the Dhaka Stock Exchange maintain continuous, active commercial operations. These businesses run active factories, retail chains, financial services, and utility plants, generating consistent quarterly revenue streams and audited financial statements.",
    criteriaList: [
      "Operational status confirmed as 'Active' in official DSE registry.",
      "Continuous commercial operations without prolonged shutdown notices.",
      "Regular submission of quarterly un-audited and annual audited financials.",
    ],
    faqs: [
      {
        q: "Why is verifying operational status critical before investing?",
        a: "Ensuring a company is active prevents investing in defunct businesses with suspended factories or severe legal closures, protecting investor capital from total write-downs.",
      },
    ],
    relatedSlugs: ["closed", "category-a", "zero-debt", "large-cap"],
  },
  {
    slug: "closed",
    title: "Closed & Suspended Companies (Non-Operational)",
    shortTitle: "Closed / Shutdown",
    categoryType: "status",
    categoryLabel: "Operational Status",
    badge: "Closed / Shutdown",
    badgeVariant: "destructive",
    icon: "AlertOctagon",
    description:
      "Listed companies reported as non-operational, factory shut down, or under emergency suspension on the Dhaka Stock Exchange.",
    metaTitle: "Closed & Suspended Companies DSE — Non-Operational Stocks Dhaka Stock Exchange",
    metaDescription:
      "List of non-operational and closed companies on DSE. Review listed Bangladesh companies with factory shutdowns, operational closures, and high distress risk.",
    keywords: [
      "closed companies DSE",
      "operation shutdown Dhaka stock exchange",
      "suspended companies DSE",
      "factory closed Bangladesh stocks",
      "DSE distressed securities",
    ],
    filterFn: (stock: AnyStock) => getOperationalStatus(stock).toLowerCase() !== "active",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "This group includes listed companies that have formally notified the DSE or BSEC of commercial operation shutdowns, factory closures, emergency maintenance halts, or severe insolvency. Most of these companies trade in Category 'Z' under significant regulatory supervision.",
    criteriaList: [
      "Operational status recorded as 'Closed', 'Operation Shutdown', or 'Temporary Shutdown'.",
      "Factory or production facility non-operational for extended duration.",
      "High probability of zero revenue generation and consecutive net financial losses.",
    ],
    faqs: [
      {
        q: "What should investors do if they hold shares in a closed company?",
        a: "Investors should follow official DSE corporate disclosures regarding liquidation, restructuring, new management takeover, or potential BSEC revival initiatives.",
      },
    ],
    relatedSlugs: ["operational", "category-z", "below-book-value"],
  },

  // ==========================================
  // 5. FUNDAMENTAL & VALUATION SCREENERS
  // ==========================================
  {
    slug: "high-dividend",
    title: "High Dividend Yield Stocks (Yield ≥ 5%)",
    shortTitle: "High Dividend (≥5%)",
    categoryType: "valuation",
    categoryLabel: "Valuation Screener",
    badge: "Yield ≥ 5%",
    badgeVariant: "amber",
    icon: "Percent",
    description:
      "Dhaka Stock Exchange companies offering cash dividend yields of 5% or higher, ideal for passive income and yield-focused investors.",
    metaTitle: "High Dividend Yield Stocks DSE (5%+) — Best Dividend Shares Dhaka Stock Exchange",
    metaDescription:
      "Screen top dividend paying stocks on DSE with yields of 5% and above. Compare cash dividend history, payout ratios, Category A compliance, and LTP.",
    keywords: [
      "DSE high dividend stocks",
      "dividend yield Dhaka stock exchange",
      "best dividend shares Bangladesh",
      "DSE cash dividend list",
      "passive income stock market Bangladesh",
    ],
    filterFn: (stock: AnyStock) => (getDivYieldPct(stock) || 0) >= 5,
    defaultSort: { field: "divYield", direction: "desc" },
    overviewText:
      "Dividend yield measures the annual cash dividend payout as a percentage of the stock's current Last Trading Price (LTP). In Bangladesh, companies with dividend yields exceeding 5% to 10% can provide strong cash-flow returns, beating typical savings rates while preserving underlying capital in quality businesses.",
    criteriaList: [
      "Dividend Yield ≥ 5.00% based on latest declared cash dividend and market price.",
      "Regular annual dividend track record.",
      "High concentration of Category 'A' dividend aristocrats.",
    ],
    faqs: [
      {
        q: "How is dividend yield calculated on the Dhaka Stock Exchange?",
        a: "Dividend Yield (%) = (Annual Cash Dividend per Share / Last Trading Price) × 100.",
      },
      {
        q: "Are cash dividends taxed in Bangladesh?",
        a: "Yes, cash dividends are subject to Advance Income Tax (AIT) withheld at source (typically 10% for TIN holders, 15% without TIN for individuals).",
      },
    ],
    relatedSlugs: ["category-a", "low-pe", "shariah", "zero-debt", "large-cap"],
  },
  {
    slug: "low-pe",
    title: "Low P/E Undervalued Stocks (P/E ≤ 15)",
    shortTitle: "Low P/E (≤15)",
    categoryType: "valuation",
    categoryLabel: "Valuation Screener",
    badge: "P/E ≤ 15",
    badgeVariant: "blue",
    icon: "PieChart",
    description:
      "Profitable Category A and B companies trading at modest Price-to-Earnings (P/E) multiples below 15x, signaling potential value upside.",
    metaTitle: "Low P/E Stocks DSE (P/E ≤ 15) — Undervalued Value Stocks Dhaka Stock Exchange",
    metaDescription:
      "Discover undervalued low P/E stocks on Dhaka Stock Exchange. Filter profitable Category A/B companies trading below 15x earnings with positive EPS.",
    keywords: [
      "low PE stocks DSE",
      "undervalued shares Dhaka stock exchange",
      "best value stocks Bangladesh",
      "DSE low PE ratio list",
      "cheap stocks DSE",
    ],
    filterFn: (stock: AnyStock) => {
      const pe = getPe(stock);
      const cat = getCategory(stock);
      return pe !== null && pe > 0 && pe <= 15 && (cat === "A" || cat === "B");
    },
    defaultSort: { field: "pe", direction: "asc" },
    overviewText:
      "The Price-to-Earnings (P/E) ratio reveals how much investors are paying per taka of annual net profit. Category A and B companies trading at single-digit or low P/E multiples (below 15x) often represent undervalued bargains with attractive margin of safety.",
    criteriaList: [
      "Trailing or Audited P/E ratio between 0.1x and 15.0x.",
      "Positive Annual Earnings Per Share (EPS > 0).",
      "Restricted to Category 'A' and 'B' compliant companies.",
    ],
    faqs: [
      {
        q: "What is considered a healthy P/E ratio on DSE?",
        a: "Historically, a P/E ratio between 8x and 15x for a profitable Category A manufacturing or financial firm is considered reasonable and attractive for fundamental value investing.",
      },
    ],
    relatedSlugs: ["below-book-value", "high-dividend", "category-a", "zero-debt"],
  },
  {
    slug: "below-book-value",
    title: "Stocks Trading Below Book Value (P/B < 1.0)",
    shortTitle: "Below Book Value (P/B < 1)",
    categoryType: "valuation",
    categoryLabel: "Valuation Screener",
    badge: "P/B < 1.0",
    badgeVariant: "purple",
    icon: "Gem",
    description:
      "Companies whose market share price trades at a discount to their audited Net Asset Value per share (NAVPS), meaning you pay less than the underlying assets.",
    metaTitle: "Stocks Trading Below Book Value DSE (P/B < 1) — Discount to NAVPS Dhaka Stock Exchange",
    metaDescription:
      "Screen DSE stocks trading below Net Asset Value per share (NAVPS). Find Bangladesh companies with Price-to-Book (P/B) ratios under 1.0 trading at asset discounts.",
    keywords: [
      "stocks below book value DSE",
      "low PB ratio Dhaka stock exchange",
      "discount to NAVPS Bangladesh",
      "cheap asset stocks DSE",
      "deep value investing DSE",
    ],
    filterFn: (stock: AnyStock) => {
      const pb = getPbRatio(stock);
      return pb !== null && pb > 0 && pb < 1.0;
    },
    defaultSort: { field: "pb", direction: "asc" },
    overviewText:
      "When a company's Price-to-Book (P/B) ratio is under 1.0, its shares trade on the stock exchange for less than the accounting value of its net tangible assets (Net Asset Value per Share / NAVPS). Deep value investors analyze P/B < 1.0 companies to locate heavily discounted balance sheets.",
    criteriaList: [
      "Price-to-Book (P/B) ratio < 1.00x.",
      "Last Trading Price (LTP) is strictly less than Net Asset Value (NAVPS).",
      "Audited positive NAVPS per latest financial disclosures.",
    ],
    faqs: [
      {
        q: "Does a P/B under 1.0 guarantee a good investment?",
        a: "Not necessarily. Investors must check whether the low P/B is due to temporary market pessimism or persistent asset depreciation and operational losses (value traps). Always verify EPS and operational status alongside P/B.",
      },
    ],
    relatedSlugs: ["low-pe", "high-dividend", "category-a", "zero-debt"],
  },
  {
    slug: "zero-debt",
    title: "Zero Debt & Debt-Free Companies",
    shortTitle: "Zero Debt",
    categoryType: "valuation",
    categoryLabel: "Balance Sheet Screener",
    badge: "Debt Free",
    badgeVariant: "emerald",
    icon: "Shield",
    description:
      "Financially fortified companies on DSE with zero long-term bank loans or financial debt burdens, offering superior resilience in rising interest rate cycles.",
    metaTitle: "Zero Debt Companies List DSE — Debt-Free Stocks Dhaka Stock Exchange",
    metaDescription:
      "Explore debt-free companies on Dhaka Stock Exchange. Filter listed Bangladesh businesses with zero long-term loans, solid balance sheets, and strong solvency.",
    keywords: [
      "zero debt companies DSE",
      "debt free stocks Dhaka stock exchange",
      "clean balance sheet stocks Bangladesh",
      "low leverage companies DSE",
    ],
    filterFn: (stock: AnyStock) => getDebt(stock) === 0,
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Companies with zero long-term debt operate without the burden of heavy interest expenses. In macroeconomic environments with tightening monetary policies and higher lending rates, debt-free companies retain higher net profit margins and face virtually zero solvency risk.",
    criteriaList: [
      "Long-Term Loan / Debt recorded as 0.00 Mn BDT.",
      "Zero interest service pressure on operating income.",
      "High financial stability during high interest rate cycles.",
    ],
    faqs: [
      {
        q: "Why are zero-debt companies preferred by conservative investors?",
        a: "Zero-debt companies do not risk bank default, interest burden margin compression, or forced debt restructurings, making them resilient during economic downturns.",
      },
    ],
    relatedSlugs: ["shariah", "category-a", "high-sponsor-holding", "high-dividend"],
  },
  {
    slug: "high-sponsor-holding",
    title: "High Sponsor Holding Stocks (Sponsors ≥ 50%)",
    shortTitle: "High Sponsor (≥50%)",
    categoryType: "ownership",
    categoryLabel: "Shareholding Screener",
    badge: "Sponsor ≥ 50%",
    badgeVariant: "blue",
    icon: "Users",
    description:
      "Companies where founding sponsors and directors hold a majority controlling stake of 50% or higher, reflecting strong founder commitment.",
    metaTitle: "High Sponsor Holding Stocks DSE (≥50%) — Promoter Backed Dhaka Stock Exchange",
    metaDescription:
      "Filter DSE companies with sponsor/director shareholding above 50%. Compare promoter ownership stakes, governance quality, dividend payouts, and market cap.",
    keywords: [
      "high sponsor holding DSE",
      "promoter holding Dhaka stock exchange",
      "sponsor share percentage DSE",
      "insider ownership Bangladesh stocks",
    ],
    filterFn: (stock: AnyStock) => (getSponsorPct(stock) || 0) >= 50,
    defaultSort: { field: "sponsorPct", direction: "desc" },
    overviewText:
      "High sponsor ownership (50%+ equity held by promoters and board directors) signals high alignment between company management and minority shareholders. Promoters with high 'skin in the game' are strongly incentivized to drive sustainable growth, declare reliable cash dividends, and safeguard company reputation.",
    criteriaList: [
      "Sponsor & Director Shareholding Percentage ≥ 50.00%.",
      "Complies with BSEC 30% aggregate minimum sponsor holding directive.",
      "Demonstrates high promoter commitment and stability.",
    ],
    faqs: [
      {
        q: "What is BSEC's minimum sponsor holding requirement?",
        a: "The Bangladesh Securities and Exchange Commission (BSEC) mandates that sponsors and directors must jointly hold at least 30% of total paid-up shares and individual directors at least 2% to retain their board seats.",
      },
    ],
    relatedSlugs: ["high-institutional-holding", "category-a", "zero-debt", "large-cap"],
  },
  {
    slug: "high-institutional-holding",
    title: "High Institutional Holding Stocks (Institutes ≥ 20%)",
    shortTitle: "High Institute (≥20%)",
    categoryType: "ownership",
    categoryLabel: "Shareholding Screener",
    badge: "Institute ≥ 20%",
    badgeVariant: "purple",
    icon: "Landmark",
    description:
      "Equities backed by significant domestic financial institutions, mutual funds, insurance funds, and asset management firms holding 20%+ of outstanding equity.",
    metaTitle: "High Institutional Holding Stocks DSE (≥20%) — Institutional Backed Dhaka Stock Exchange",
    metaDescription:
      "Track DSE stocks with over 20% institutional investment. Analyze mutual fund backing, pension fund ownership, corporate governance, and quarterly performance.",
    keywords: [
      "institutional holding DSE",
      "mutual fund investment Bangladesh stocks",
      "institutional shareholding Dhaka stock exchange",
      "smart money stocks DSE",
    ],
    filterFn: (stock: AnyStock) => (getInstitutePct(stock) || 0) >= 20,
    defaultSort: { field: "institutePct", direction: "desc" },
    overviewText:
      "High institutional ownership indicates that professional fund managers, investment banks, asset managers, and insurance portfolios have conducted due diligence and allocated capital to these securities. Institutional backing frequently correlates with improved corporate reporting and market stability.",
    criteriaList: [
      "Institutional Shareholding Percentage ≥ 20.00%.",
      "High institutional ownership and research coverage.",
    ],
    faqs: [
      {
        q: "Why do retail investors look at institutional shareholding?",
        a: "Institutional investors have access to research teams and professional analysts. High institutional ownership often acts as a vote of confidence in a company's financial transparency and future earnings.",
      },
    ],
    relatedSlugs: ["high-sponsor-holding", "large-cap", "category-a", "shariah"],
  },
  {
    slug: "large-cap",
    title: "Large Cap Blue-Chip Stocks (Mkt Cap ≥ 1,000 Cr BDT)",
    shortTitle: "Large Cap (≥1k Cr)",
    categoryType: "valuation",
    categoryLabel: "Market Scale",
    badge: "Large Cap",
    badgeVariant: "emerald",
    icon: "Crown",
    description:
      "The largest, most dominant market leaders on the Dhaka Stock Exchange with market capitalization exceeding 10,000 Million BDT (1,000 Crore Taka).",
    metaTitle: "Large Cap Stocks DSE (Market Cap ≥ 1,000 Cr) — Blue Chips Dhaka Stock Exchange",
    metaDescription:
      "Browse the biggest blue-chip companies on the Dhaka Stock Exchange. Filter market capitalization giants with 1,000+ Crore BDT scale, high turnover, and solid dividends.",
    keywords: [
      "large cap stocks DSE",
      "blue chip companies Dhaka stock exchange",
      "biggest companies Bangladesh stock market",
      "top market cap DSE",
      "DSE30 index stocks",
    ],
    filterFn: (stock: AnyStock) => (getMarketCap(stock) || 0) >= 10000,
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Large-cap companies form the backbone of the Bangladesh capital market and represent the largest weights in the DSEX and DS30 benchmark indices. These multi-billion-taka market leaders (e.g. Grameenphone, Square Pharma, BATBC, Walton, Renata, BRAC Bank) boast dominant market shares, institutional liquidity, and seasoned balance sheets.",
    criteriaList: [
      "Market Capitalization ≥ 10,000 Mn BDT (1,000 Crore BDT).",
      "High daily trading liquidity and index weighting.",
      "Established brand equity and national market share.",
    ],
    faqs: [
      {
        q: "What are the benefits of investing in large-cap DSE stocks?",
        a: "Large-cap stocks offer higher liquidity, lower bankruptcy risk, regular dividend declarations, and less extreme price manipulation compared to low-float micro-cap securities.",
      },
    ],
    relatedSlugs: ["category-a", "shariah", "top-turnover", "high-dividend"],
  },
  {
    slug: "small-cap",
    title: "Small Cap Stocks (Mkt Cap < 200 Cr BDT)",
    shortTitle: "Small Cap (<200 Cr)",
    categoryType: "valuation",
    categoryLabel: "Market Scale",
    badge: "Small Cap",
    badgeVariant: "outline",
    icon: "Boxes",
    description:
      "Smaller market capitalization companies on DSE with market value under 2,000 Million BDT (200 Crore Taka), offering high agility and growth potential.",
    metaTitle: "Small Cap Stocks DSE (Market Cap < 200 Cr) — Growth Shares Dhaka Stock Exchange",
    metaDescription:
      "Explore small-cap growth stocks on Dhaka Stock Exchange. Filter companies with under 200 Crore BDT market capitalization, low share float, and turnaround potential.",
    keywords: [
      "small cap stocks DSE",
      "small cap growth Bangladesh",
      "low market cap stocks Dhaka stock exchange",
      "high growth potential DSE shares",
    ],
    filterFn: (stock: AnyStock) => {
      const cap = getMarketCap(stock);
      return cap !== null && cap > 0 && cap < 2000;
    },
    defaultSort: { field: "marketCap", direction: "asc" },
    overviewText:
      "Small-cap stocks represent companies with market capitalizations below 200 Crore BDT. While they often experience higher volatility and lower free-float liquidity, successful small-cap enterprises with expanding business lines can yield substantial multi-bagger growth for diligent fundamental researchers.",
    criteriaList: [
      "Market Capitalization < 2,000 Mn BDT (200 Crore BDT).",
      "Potential for business expansion or operational turnaround.",
    ],
    faqs: [
      {
        q: "What risks are associated with small-cap stocks on DSE?",
        a: "Small-cap stocks can be subject to higher price volatility and lower trading volumes, requiring careful fundamental due diligence on debt, cash flow, and management integrity.",
      },
    ],
    relatedSlugs: ["large-cap", "category-a", "category-b", "low-pe"],
  },

  // ==========================================
  // 6. MARKET ACTIVITY & MOMENTUM
  // ==========================================
  {
    slug: "top-turnover",
    title: "Top Turnover Leaders (Most Traded by Value)",
    shortTitle: "Top Turnover",
    categoryType: "activity",
    categoryLabel: "Market Activity",
    badge: "Top Turnover",
    badgeVariant: "blue",
    icon: "Flame",
    description:
      "The most actively traded stocks by monetary value (Turnover in Mn BDT) in the latest session, reflecting high institutional and retail participation.",
    metaTitle: "Top Turnover Stocks DSE — Most Active Shares Dhaka Stock Exchange",
    metaDescription:
      "View the most actively traded stocks by monetary turnover on the Dhaka Stock Exchange today. Track trading volume, value leaders, and market liquidity.",
    keywords: [
      "top turnover DSE",
      "most active stocks Dhaka stock exchange",
      "highest traded shares Bangladesh",
      "DSE daily turnover leaders",
    ],
    filterFn: (stock: AnyStock) => (getTurnover(stock) || 0) > 0,
    defaultSort: { field: "turnover", direction: "desc" },
    overviewText:
      "Turnover represents the total monetary value of all shares traded in a stock during the market session. Stocks ranking highest in daily turnover capture the largest share of market liquidity and investor attention.",
    criteriaList: [
      "High daily transaction value (Mn BDT).",
      "Ranked in descending order of session turnover.",
    ],
    faqs: [
      {
        q: "Why is turnover an important indicator on DSE?",
        a: "High turnover confirms that price movements are supported by substantial volume and capital flow rather than thin orders, allowing seamless entry and exit for investors.",
      },
    ],
    relatedSlugs: ["top-volume", "bullish", "large-cap", "category-a"],
  },
  {
    slug: "top-volume",
    title: "Top Volume Leaders (Most Traded Shares)",
    shortTitle: "Top Volume",
    categoryType: "activity",
    categoryLabel: "Market Activity",
    badge: "Top Volume",
    badgeVariant: "purple",
    icon: "BarChart3",
    description:
      "Companies with the highest aggregate number of shares exchanged during the latest Dhaka Stock Exchange trading session.",
    metaTitle: "Top Volume Stocks DSE — Highest Traded Share Count Dhaka Stock Exchange",
    metaDescription:
      "Explore the highest volume stocks on the Dhaka Stock Exchange. Filter companies by daily share count traded, price trends, and volume breakouts.",
    keywords: [
      "top volume DSE",
      "highest volume stocks Dhaka stock exchange",
      "most traded share volume Bangladesh",
      "DSE volume leaders today",
    ],
    filterFn: (stock: AnyStock) => (getVolume(stock) || 0) > 0,
    defaultSort: { field: "volume", direction: "desc" },
    overviewText:
      "Volume leaders are companies that saw the largest absolute quantity of shares change hands. High volume surges often precede or confirm major price trends, corporate earnings announcements, or strategic block transactions.",
    criteriaList: [
      "Ranked in descending order of session share trading volume.",
    ],
    faqs: [
      {
        q: "What is the difference between volume and turnover on DSE?",
        a: "Volume measures the physical number of shares traded (e.g. 1,000,000 shares), while Turnover measures the monetary value in BDT (e.g. 50 Million BDT).",
      },
    ],
    relatedSlugs: ["top-turnover", "bullish", "category-a"],
  },
  {
    slug: "52-week-high",
    title: "52-Week High Breakouts & Near Highs",
    shortTitle: "Near 52W High",
    categoryType: "activity",
    categoryLabel: "Price Action",
    badge: "52W High",
    badgeVariant: "emerald",
    icon: "ArrowUpRight",
    description:
      "Stocks trading within 5% of their highest price over the past 52 weeks (1 year), signaling strong multi-month bullish momentum.",
    metaTitle: "52-Week High Stocks DSE — Multi-Month High Breakouts Dhaka Stock Exchange",
    metaDescription:
      "Track DSE stocks trading near or at their 52-week high prices. Screen Bangladesh companies with strong momentum, earnings growth, and technical strength.",
    keywords: [
      "52 week high stocks DSE",
      "DSE year high shares",
      "breakout stocks Dhaka stock exchange",
      "52W high list Bangladesh",
    ],
    filterFn: (stock: AnyStock) => isNear52WeekHigh(stock),
    defaultSort: { field: "changePct", direction: "desc" },
    overviewText:
      "Stocks trading near their 52-week high represent companies with sustained buying interest, superior earnings performance, or favorable industry dynamics over a one-year timeframe. Technical and momentum investors closely watch 52-week high breakouts.",
    criteriaList: [
      "Last Trading Price (LTP) is within 5% of the 52-week high range ceiling.",
      "Reflects leading momentum across 12-month trailing trading history.",
    ],
    faqs: [
      {
        q: "Is it safe to buy a stock near its 52-week high?",
        a: "Stocks near 52-week highs frequently continue upward if backed by strong revenue growth and reasonable P/E multiples. Always examine whether fundamentals justify the elevated price level.",
      },
    ],
    relatedSlugs: ["bullish", "top-turnover", "large-cap", "category-a"],
  },
  {
    slug: "52-week-low",
    title: "52-Week Low Value Bargains & Near Lows",
    shortTitle: "Near 52W Low",
    categoryType: "activity",
    categoryLabel: "Price Action",
    badge: "52W Low",
    badgeVariant: "amber",
    icon: "ArrowDownRight",
    description:
      "Stocks trading within 5% of their lowest price over the past 52 weeks, frequently examined by contrarian value hunters seeking rebound opportunities.",
    metaTitle: "52-Week Low Stocks DSE — 1-Year Low Bargain Screen Dhaka Stock Exchange",
    metaDescription:
      "Discover DSE stocks trading near their 52-week low prices. Find oversold Bangladesh shares with potential rebound upside, low P/B ratios, and high dividend yields.",
    keywords: [
      "52 week low stocks DSE",
      "DSE year low shares",
      "bottom fishing stocks Dhaka stock exchange",
      "52W low list Bangladesh",
    ],
    filterFn: (stock: AnyStock) => isNear52WeekLow(stock),
    defaultSort: { field: "divYield", direction: "desc" },
    overviewText:
      "Equities trading near their 52-week lows are at their lowest valuation levels of the past 12 months. When fundamentally resilient Category 'A' companies with positive earnings and high dividend yields trade near 52-week lows, they can present rewarding contrarian accumulation points.",
    criteriaList: [
      "Last Trading Price (LTP) is within 5% of the 52-week low floor.",
    ],
    faqs: [
      {
        q: "How to avoid 'value traps' when buying near 52-week lows?",
        a: "Check that the company is actively operational, has positive annual EPS, manageable debt, and complies with Category A or B standards rather than sliding into Category Z distress.",
      },
    ],
    relatedSlugs: ["below-book-value", "high-dividend", "low-pe", "bearish"],
  },

  // ==========================================
  // 7. INSTRUMENT TYPES
  // ==========================================
  {
    slug: "mutual-funds",
    title: "DSE Listed Closed-End Mutual Funds",
    shortTitle: "Mutual Funds",
    categoryType: "instrument",
    categoryLabel: "Instrument Type",
    badge: "Mutual Funds",
    badgeVariant: "blue",
    icon: "Briefcase",
    description:
      "All 35+ closed-end mutual funds listed on the Dhaka Stock Exchange managed by licensed Asset Management Companies (AMCs).",
    metaTitle: "DSE Mutual Funds List — Closed-End Funds NAV & Discount Dhaka Stock Exchange",
    metaDescription:
      "Complete list of 35+ closed-end mutual funds on DSE. Compare market price, weekly NAV at cost and market value, discounts to NAV, and cash dividend yields.",
    keywords: [
      "DSE mutual funds list",
      "closed end mutual funds Bangladesh",
      "mutual fund NAV Dhaka stock exchange",
      "discount to NAV mutual funds DSE",
      "best mutual funds Bangladesh",
    ],
    filterFn: (stock: AnyStock) =>
      getInstrumentType(stock) === "Mutual Funds" || getSector(stock) === "Mutual Funds",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Closed-end mutual funds on the Dhaka Stock Exchange offer retail and institutional investors diversified portfolio exposure across equities, fixed income, and government treasury bonds. Listed mutual funds trade at market prices that frequently stand at substantial discounts (often 20% to 50%) relative to their audited Net Asset Value (NAV).",
    criteriaList: [
      "Instrument Type classified as 'Mutual Funds'.",
      "Managed by BSEC-licensed Asset Management Companies (AMCs) like ICB, RACE, VIPB, LR Global, AIMS, Shanta.",
      "Subject to weekly NAV publication at cost and market price.",
    ],
    faqs: [
      {
        q: "Why do listed mutual funds trade at a discount to NAV in Bangladesh?",
        a: "Closed-end funds cannot be redeemed directly at the AMC counter on demand; instead, their units trade on the secondary exchange, where supply-demand dynamics frequently lead to market discounts relative to underlying portfolio NAV.",
      },
      {
        q: "Do listed mutual funds declare cash dividends?",
        a: "Yes, mutual funds distribute cash dividends from realized capital gains, interest income, and cash dividends received from their portfolio holdings.",
      },
    ],
    relatedSlugs: ["below-book-value", "high-dividend", "category-a"],
  },

  // ==========================================
  // 8. INDUSTRY SECTORS (ALL 19 DSE SECTORS)
  // ==========================================
  {
    slug: "sector-bank",
    title: "Banking Sector Stocks",
    shortTitle: "Banking Sector",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Bank",
    badgeVariant: "blue",
    icon: "Landmark",
    description:
      "Commercial banks, Islamic banks, and scheduled banking institutions listed on the Dhaka Stock Exchange.",
    metaTitle: "DSE Banking Sector Stocks List — Commercial & Islamic Banks Dhaka Stock Exchange",
    metaDescription:
      "Explore all 36+ listed commercial banks on the Dhaka Stock Exchange. Compare bank P/E ratios, NPL provisioning, dividend yields, NAVPS, and market capitalisation.",
    keywords: ["DSE bank stocks", "Bangladesh banking sector", "Islamic banks DSE", "commercial banks Dhaka stock exchange"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Bank",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "The Banking sector is one of the largest and most liquid pillars of the Dhaka Stock Exchange, comprising conventional scheduled commercial banks and dedicated Islamic banks (e.g. BRAC Bank, Islami Bank, City Bank, Pubali Bank, EBL). Banks are regulated under Bangladesh Bank guidelines.",
    criteriaList: ["Sector classification: 'Bank'.", "Regulated by Bangladesh Bank & BSEC."],
    faqs: [
      {
        q: "What key metrics should investors check when analyzing DSE banks?",
        a: "Investors evaluate Non-Performing Loan (NPL) ratios, Capital Adequacy Ratio (CAR), Net Asset Value (NAVPS), cost-to-income ratio, and dividend payout history.",
      },
    ],
    relatedSlugs: ["sector-financial-institutions", "sector-insurance", "category-a", "large-cap"],
  },
  {
    slug: "sector-pharmaceuticals-chemicals",
    title: "Pharmaceuticals & Chemicals Sector Stocks",
    shortTitle: "Pharma & Chemicals",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Pharma",
    badgeVariant: "emerald",
    icon: "HeartPulse",
    description:
      "Top generic medicine producers, active pharmaceutical ingredient (API) manufacturers, and chemical producers in Bangladesh.",
    metaTitle: "DSE Pharma & Chemical Stocks List — Top Medicine Manufacturers Dhaka Stock Exchange",
    metaDescription:
      "Browse Bangladesh pharma giants on DSE (Square Pharma, Beximco Pharma, Renata, Acme, etc.). Compare export revenues, profit margins, and dividend yields.",
    keywords: ["DSE pharma stocks", "pharmaceutical sector Bangladesh", "Square Pharma share price", "Beximco pharma DSE"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Pharmaceuticals & Chemicals",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Bangladesh's pharmaceutical industry fulfills over 98% of domestic medicine demand and exports formulations to over 140 countries globally. Listed pharma leaders boast high gross margins, cutting-edge WHO-cGMP facilities, and steady revenue growth.",
    criteriaList: ["Sector classification: 'Pharmaceuticals & Chemicals'."],
    faqs: [
      {
        q: "Why is the Pharma sector considered defensive on DSE?",
        a: "Healthcare and essential medicine demand remains resilient across economic cycles, making pharma companies reliable dividend payers with stable earnings.",
      },
    ],
    relatedSlugs: ["category-a", "shariah", "large-cap", "high-dividend"],
  },
  {
    slug: "sector-it",
    title: "IT & Technology Sector Stocks",
    shortTitle: "IT & Tech",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "IT Sector",
    badgeVariant: "purple",
    icon: "Laptop",
    description:
      "Software development houses, internet service providers (ISPs), system integrators, and digital infrastructure firms on DSE.",
    metaTitle: "DSE IT & Technology Stocks List — Software & Internet Companies Dhaka Stock Exchange",
    metaDescription:
      "Track IT and technology stocks on DSE. Filter software exporters, cloud infrastructure providers, and telecom IT services in Bangladesh.",
    keywords: ["DSE IT stocks", "software companies Bangladesh stock market", "aamra technologies share price", "IT sector DSE"],
    filterFn: (stock: AnyStock) => getSector(stock) === "IT Sector",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "The IT Sector on DSE encompasses software developers, fiber-optic network providers, and data communication specialists benefiting from national digitization and technology export incentives.",
    criteriaList: ["Sector classification: 'IT Sector'."],
    faqs: [
      {
        q: "Do IT companies in Bangladesh enjoy tax incentives?",
        a: "Yes, IT-enabled services (ITES) and software development entities in Bangladesh historically benefit from preferential corporate tax exemptions.",
      },
    ],
    relatedSlugs: ["sector-telecommunication", "category-a", "small-cap"],
  },
  {
    slug: "sector-engineering",
    title: "Engineering & Steel Sector Stocks",
    shortTitle: "Engineering",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Engineering",
    badgeVariant: "amber",
    icon: "Wrench",
    description:
      "Steel re-rolling mills, cable manufacturers, power transformer makers, and consumer electronics producers.",
    metaTitle: "DSE Engineering Sector Stocks List — Steel, Cables & Manufacturing Dhaka Stock Exchange",
    metaDescription:
      "Discover engineering, steel, and electrical appliance companies on DSE (Walton, BSRM, BBS Cables, Singer, etc.). Filter valuation and quarterly earnings.",
    keywords: ["DSE engineering stocks", "BSRM steel share price", "Walton Hi-Tech DSE", "cables stocks Bangladesh"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Engineering",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "The Engineering sector encompasses large-scale steel manufacturers, electrical cables and conductors, electronics (Walton), and industrial equipment suppliers powering national infrastructure projects.",
    criteriaList: ["Sector classification: 'Engineering'."],
    faqs: [
      {
        q: "What drivers influence the Engineering sector on DSE?",
        a: "Global scrap metal prices, national infrastructure spending, real estate construction activity, and foreign exchange (USD/BDT) import costs.",
      },
    ],
    relatedSlugs: ["sector-cement", "sector-fuel-power", "category-a", "large-cap"],
  },
  {
    slug: "sector-fuel-power",
    title: "Fuel & Power Sector Stocks",
    shortTitle: "Fuel & Power",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Fuel & Power",
    badgeVariant: "amber",
    icon: "Zap",
    description:
      "Power generation plants, independent power producers (IPPs), oil marketing firms, and energy distribution utilities.",
    metaTitle: "DSE Fuel & Power Sector Stocks List — Power Plants & Energy Dhaka Stock Exchange",
    metaDescription:
      "Track Fuel & Power companies on DSE (United Power, Meghna Petroleum, Padma Oil, Summit Power, etc.). Analyze capacity tariffs and dividend yields.",
    keywords: ["DSE fuel power stocks", "power generation shares Bangladesh", "oil marketing companies DSE", "United Power share price"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Fuel & Power",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "The Fuel & Power sector consists of state-affiliated fuel distribution companies (MPETROLEUM, PADMAOIL, JAMUNAOIL) and private Independent Power Producers (IPPs) delivering electricity to the national grid.",
    criteriaList: ["Sector classification: 'Fuel & Power'."],
    faqs: [
      {
        q: "Why are oil distribution stocks known for high dividends on DSE?",
        a: "State-regulated oil marketing companies hold large cash reserves and steady distribution commission margins, traditionally distributing strong cash dividends.",
      },
    ],
    relatedSlugs: ["high-dividend", "category-a", "zero-debt", "large-cap"],
  },
  {
    slug: "sector-textile",
    title: "Textile & Garments Sector Stocks",
    shortTitle: "Textile",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Textile",
    badgeVariant: "purple",
    icon: "Shirt",
    description:
      "Spinning mills, composite fabric weaving plants, denim manufacturers, and export-oriented ready-made garment (RMG) firms.",
    metaTitle: "DSE Textile Sector Stocks List — Spinning Mills & RMG Exporters Dhaka Stock Exchange",
    metaDescription:
      "Complete list of 58+ textile and spinning mill stocks on DSE. Compare export volumes, yarn sales, debt load, and valuation multiples.",
    keywords: ["DSE textile stocks", "RMG sector Bangladesh stock market", "spinning mills DSE", "Square textiles share price"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Textile",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "With over 58 listed companies, the Textile sector represents Bangladesh's primary export engine. Operations span backward-linkage spinning mills, dyeing units, and composite apparel exporters.",
    criteriaList: ["Sector classification: 'Textile'."],
    faqs: [
      {
        q: "What factors impact textile stock margins in Bangladesh?",
        a: "International cotton commodity prices, global retail clothing demand in the EU and US, energy tariff costs, and export cash incentives.",
      },
    ],
    relatedSlugs: ["category-a", "category-b", "category-z", "below-book-value"],
  },
  {
    slug: "sector-food-allied",
    title: "Food & Allied Sector Stocks",
    shortTitle: "Food & Allied",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Food & Allied",
    badgeVariant: "emerald",
    icon: "Utensils",
    description:
      "Fast-moving consumer goods (FMCG), dairy processors, agro-food brands, tea estates, and tobacco enterprises.",
    metaTitle: "DSE Food & Allied Stocks List — FMCG & Consumer Food Dhaka Stock Exchange",
    metaDescription:
      "Explore consumer food and FMCG stocks on DSE (BATBC, Unilever Consumer, Olympic, Apex Foods, etc.). Compare gross margins and consumer growth.",
    keywords: ["DSE food stocks", "FMCG shares Bangladesh", "BATBC share price", "Olympic Industries DSE"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Food & Allied",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Food & Allied covers leading consumer packaged goods manufacturers, confectionery makers, edible oil processors, and multinational consumer brands enjoying strong domestic consumer loyalty.",
    criteriaList: ["Sector classification: 'Food & Allied'."],
    faqs: [
      {
        q: "Why are Food & Allied stocks attractive for long-term investors?",
        a: "Rapid urbanization and population growth in Bangladesh ensure constant, expanding consumer consumption of packaged food and FMCG products.",
      },
    ],
    relatedSlugs: ["category-a", "high-dividend", "large-cap"],
  },
  {
    slug: "sector-financial-institutions",
    title: "Financial Institutions Sector (NBFI)",
    shortTitle: "Financial Inst (NBFI)",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "NBFI",
    badgeVariant: "blue",
    icon: "Building",
    description:
      "Non-Bank Financial Institutions (NBFIs), leasing companies, house finance corporations, and merchant banking firms on DSE.",
    metaTitle: "DSE Financial Institutions (NBFI) Stocks List — Leasing & Finance Dhaka Stock Exchange",
    metaDescription:
      "Filter Non-Bank Financial Institutions on DSE (IDLC, LankaBangla, IPDC, Delta Brac, etc.). Compare loan portfolios and recovery rates.",
    keywords: ["DSE NBFI stocks", "financial institutions Bangladesh", "IDLC share price", "leasing companies DSE"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Financial Institutions",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Non-Bank Financial Institutions (NBFIs) provide specialized corporate leasing, SME loan financing, home mortgages, and structured investment banking.",
    criteriaList: ["Sector classification: 'Financial Institutions'."],
    faqs: [
      {
        q: "How do NBFIs differ from commercial banks on DSE?",
        a: "NBFIs cannot offer checking accounts or direct retail cash clearing; they specialize in term deposits, lease financing, SME factoring, and mortgages.",
      },
    ],
    relatedSlugs: ["sector-bank", "sector-insurance", "category-a"],
  },
  {
    slug: "sector-insurance",
    title: "Insurance Sector Stocks (General & Life)",
    shortTitle: "Insurance",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Insurance",
    badgeVariant: "purple",
    icon: "Shield",
    description:
      "General non-life property/marine insurers and life insurance companies listed on the Dhaka Stock Exchange.",
    metaTitle: "DSE Insurance Sector Stocks List — General & Life Insurers Dhaka Stock Exchange",
    metaDescription:
      "Browse 58+ listed insurance companies on DSE. Compare claim settlement ratios, premium revenue growth, Net Asset Value, and dividend yields.",
    keywords: ["DSE insurance stocks", "general insurance Bangladesh", "life insurance shares DSE", "Green Delta Insurance share price"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Insurance",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "The Insurance sector boasts over 58 listed companies spanning marine, fire, auto, and life underwriting. Insurers invest float in sovereign treasury instruments and dividend-paying equities.",
    criteriaList: ["Sector classification: 'Insurance'."],
    faqs: [
      {
        q: "What regulatory authority oversees listed insurers in Bangladesh?",
        a: "The Insurance Development and Regulatory Authority (IDRA) regulates insurance premium rates, solvency margins, and mandatory listing compliance.",
      },
    ],
    relatedSlugs: ["sector-bank", "sector-financial-institutions", "category-a"],
  },
  {
    slug: "sector-cement",
    title: "Cement Industry Sector Stocks",
    shortTitle: "Cement",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Cement",
    badgeVariant: "amber",
    icon: "Layers",
    description:
      "Integrated clinker and cement grinding manufacturers supplying construction projects across Bangladesh.",
    metaTitle: "DSE Cement Sector Stocks List — Cement Manufacturers Dhaka Stock Exchange",
    metaDescription:
      "Track leading cement manufacturers on DSE (LafargeHolcim, Heidelberg, Crown Cement, Premier Cement, etc.). Compare production capacity and EBITDA margins.",
    keywords: ["DSE cement stocks", "LafargeHolcim share price", "Crown cement DSE", "cement industry Bangladesh"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Cement",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "The Cement sector features international and local manufacturing leaders supplying the nation's massive urban infrastructure, flyovers, bridges, and commercial real estate projects.",
    criteriaList: ["Sector classification: 'Cement'."],
    faqs: [
      {
        q: "What raw materials drive cement production costs in Bangladesh?",
        a: "Imported clinker, gypsum, limestone, slag, and ocean freight shipping rates are key cost drivers.",
      },
    ],
    relatedSlugs: ["sector-engineering", "category-a", "large-cap"],
  },
  {
    slug: "sector-telecommunication",
    title: "Telecommunication Sector Stocks",
    shortTitle: "Telecommunication",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Telecom",
    badgeVariant: "blue",
    icon: "Radio",
    description:
      "Mobile network operators, data transmission carriers, and telecom infrastructure providers in Bangladesh.",
    metaTitle: "DSE Telecom Stocks List — Mobile Network Operators Dhaka Stock Exchange",
    metaDescription:
      "Explore telecommunication giants on DSE (Grameenphone, Robi Axiata, etc.). Compare subscriber growth, ARPU, data revenue, and high dividend payouts.",
    keywords: ["DSE telecom stocks", "Grameenphone share price", "Robi share price", "telecom sector Bangladesh"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Telecommunication",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Telecommunications is the single largest market-capitalization sector on the DSE, spearheaded by Grameenphone (GP) and Robi Axiata. Telecom companies generate massive daily cash flows and distribute high regular dividends.",
    criteriaList: ["Sector classification: 'Telecommunication'."],
    faqs: [
      {
        q: "Why is Grameenphone (GP) a cornerstone of the DSEX index?",
        a: "As the largest individual listed company on DSE by market capitalization, GP has a substantial weighting in the benchmark DSEX index.",
      },
    ],
    relatedSlugs: ["large-cap", "high-dividend", "category-a", "sector-it"],
  },
  {
    slug: "sector-ceramics",
    title: "Ceramics Industry Sector Stocks",
    shortTitle: "Ceramics",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Ceramics",
    badgeVariant: "outline",
    icon: "Sparkle",
    description:
      "Porcelain tableware, floor and wall tiles, and luxury sanitaryware manufacturers on DSE.",
    metaTitle: "DSE Ceramics Sector Stocks List — Tiles & Tableware Dhaka Stock Exchange",
    metaDescription:
      "Discover listed ceramics and tiles manufacturers on DSE (RAK Ceramics, Shinepukur, Fu-Wang, etc.). Filter export capacity and domestic retail market share.",
    keywords: ["DSE ceramics stocks", "RAK ceramics share price", "tableware manufacturers Bangladesh"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Ceramics Sector",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Bangladesh ceramics producers manufacture premium porcelain tableware and ceramic tiles for both high-end European export markets and surging domestic building construction.",
    criteriaList: ["Sector classification: 'Ceramics Sector'."],
    faqs: [
      {
        q: "How does natural gas supply affect ceramic manufacturers?",
        a: "Ceramic kilns require steady, high-pressure natural gas for firing porcelain and tiles; fuel availability directly impacts plant capacity utilization.",
      },
    ],
    relatedSlugs: ["category-a", "sector-engineering", "small-cap"],
  },
  {
    slug: "sector-tannery",
    title: "Tannery & Leather Sector Stocks",
    shortTitle: "Tannery & Leather",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Tannery",
    badgeVariant: "amber",
    icon: "Footprints",
    description:
      "Finished leather processors, footwear exporters, and retail shoe retail chains (e.g. Apex Footwear, Bata Shoe).",
    metaTitle: "DSE Tannery & Footwear Stocks List — Leather Exporters Dhaka Stock Exchange",
    metaDescription:
      "Track leather and footwear giants on DSE (Apex Footwear, Bata Shoe, Fortune Shoes, etc.). Compare retail shoe store networks and leather exports.",
    keywords: ["DSE tannery stocks", "Bata shoe share price", "Apex footwear DSE", "leather sector Bangladesh"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Tannery Industries",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "The Tannery & Footwear sector includes legacy multinational and domestic footwear champions like Bata Shoe and Apex Footwear with extensive retail footprints nationwide.",
    criteriaList: ["Sector classification: 'Tannery Industries'."],
    faqs: [
      {
        q: "What seasonal cycles impact the leather and footwear sector in Bangladesh?",
        a: "Eid-ul-Fitr and Eid-ul-Adha festivals generate major seasonal retail footwear sales surges, while raw hide procurement peaks during Qurbani.",
      },
    ],
    relatedSlugs: ["category-a", "high-dividend", "large-cap"],
  },
  {
    slug: "sector-paper-printing",
    title: "Paper & Printing Sector Stocks",
    shortTitle: "Paper & Printing",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Paper",
    badgeVariant: "outline",
    icon: "FileText",
    description:
      "Paper mills, packaging paperboard producers, and printing solution providers on DSE.",
    metaTitle: "DSE Paper & Printing Stocks List — Paper Mills Dhaka Stock Exchange",
    metaDescription:
      "List of listed paper mills and commercial packaging manufacturers on DSE (Bashundhara Paper, Sonali Paper, etc.).",
    keywords: ["DSE paper stocks", "paper mills Bangladesh", "Bashundhara paper share price"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Paper & Printing",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Paper & Printing encompasses manufacturers producing writing paper, packaging paperboard for industrial RMG cartons, and newsprint.",
    criteriaList: ["Sector classification: 'Paper & Printing'."],
    faqs: [
      {
        q: "What raw materials do paper mills in Bangladesh rely on?",
        a: "Imported wood pulp and recycled waste paper are primary raw materials for local paper mills.",
      },
    ],
    relatedSlugs: ["category-a", "small-cap", "sector-textile"],
  },
  {
    slug: "sector-services-real-estate",
    title: "Services & Real Estate Sector Stocks",
    shortTitle: "Services & Real Estate",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Real Estate",
    badgeVariant: "blue",
    icon: "Building2",
    description:
      "Commercial real estate developers, building logistics, and business service enterprises.",
    metaTitle: "DSE Services & Real Estate Stocks List — Property Developers Dhaka Stock Exchange",
    metaDescription:
      "Discover listed real estate developers and commercial services companies on DSE (Eastern Housing, etc.).",
    keywords: ["DSE real estate stocks", "Eastern Housing share price", "property developer Bangladesh stock market"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Services & Real Estate",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Services & Real Estate includes pioneering property developers (e.g. Eastern Housing) with land banks and residential apartment projects across Dhaka.",
    criteriaList: ["Sector classification: 'Services & Real Estate'."],
    faqs: [
      {
        q: "How does urban land value appreciation affect real estate stocks?",
        a: "Land banking in prime metropolitan locations significantly boosts long-term Net Asset Value (NAVPS) per share for developers.",
      },
    ],
    relatedSlugs: ["category-a", "below-book-value", "zero-debt"],
  },
  {
    slug: "sector-travel-leisure",
    title: "Travel & Leisure Sector Stocks",
    shortTitle: "Travel & Leisure",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Travel",
    badgeVariant: "emerald",
    icon: "Plane",
    description:
      "Five-star luxury hotels, resorts, airline catering, and tourism hospitality operators on DSE.",
    metaTitle: "DSE Travel & Leisure Stocks List — Hotels & Hospitality Dhaka Stock Exchange",
    metaDescription:
      "Explore listed hotel and tourism companies on DSE (Unique Hotel, Sea Pearl Beach Resort, Peninsular Chittagong, etc.).",
    keywords: ["DSE travel leisure stocks", "hotel stocks Bangladesh", "Sea Pearl share price", "Unique hotel DSE"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Travel & Leisure",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Travel & Leisure encompasses premier international luxury hotels (The Westin Dhaka, Sheraton, Sea Pearl Cox's Bazar) benefiting from business travelers and coastal tourism.",
    criteriaList: ["Sector classification: 'Travel & Leisure'."],
    faqs: [
      {
        q: "What key metric tracks hotel operational strength?",
        a: "Average Daily Rate (ADR) and Revenue Per Available Room (RevPAR) along with food & beverage conference banquet bookings.",
      },
    ],
    relatedSlugs: ["category-a", "small-cap"],
  },
  {
    slug: "sector-jute",
    title: "Jute Industry Sector Stocks",
    shortTitle: "Jute Sector",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Jute",
    badgeVariant: "amber",
    icon: "Trees",
    description:
      "Traditional and eco-friendly diversified golden fiber jute product processors.",
    metaTitle: "DSE Jute Sector Stocks List — Golden Fiber Manufacturers Dhaka Stock Exchange",
    metaDescription:
      "Track listed jute manufacturing companies on DSE. Filter golden fiber yarn exporters and packaging processors in Bangladesh.",
    keywords: ["DSE jute stocks", "jute mills Bangladesh", "golden fiber DSE"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Jute",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "Jute is Bangladesh's historic 'golden fiber'. Listed jute mills process raw jute into exportable jute twine, sacks, and eco-friendly shopping bags.",
    criteriaList: ["Sector classification: 'Jute'."],
    faqs: [
      {
        q: "What is driving renewed demand for jute products globally?",
        a: "Global anti-plastic packaging mandates and environmental regulations have created rising international demand for biodegradable jute packaging.",
      },
    ],
    relatedSlugs: ["sector-textile", "category-a"],
  },
  {
    slug: "sector-miscellaneous",
    title: "Miscellaneous Sector Stocks",
    shortTitle: "Miscellaneous",
    categoryType: "sector",
    categoryLabel: "Industry Sector",
    badge: "Misc",
    badgeVariant: "secondary",
    icon: "Boxes",
    description:
      "Diversified industrial conglomerates, trading houses, and specialized multi-disciplinary companies on DSE.",
    metaTitle: "DSE Miscellaneous Sector Stocks List — Diversified Conglomerates Dhaka Stock Exchange",
    metaDescription:
      "Browse miscellaneous and diversified companies on DSE (Beximco Limited, Berger Paints, etc.). Compare multi-industry performance.",
    keywords: ["DSE miscellaneous stocks", "Beximco share price", "Berger paints DSE", "conglomerates Bangladesh"],
    filterFn: (stock: AnyStock) => getSector(stock) === "Miscellaneous",
    defaultSort: { field: "marketCap", direction: "desc" },
    overviewText:
      "The Miscellaneous sector houses large diversified holding entities (e.g. Beximco Limited) and specialized leaders like Berger Paints Bangladesh with distinctive business models.",
    criteriaList: ["Sector classification: 'Miscellaneous'."],
    faqs: [
      {
        q: "Which companies belong to the Miscellaneous sector?",
        a: "Companies whose diverse product lines cross multiple traditional industry classifications (such as paints, general trading, or conglomerate holdings).",
      },
    ],
    relatedSlugs: ["category-a", "large-cap", "shariah"],
  },
];

// Helper functions for fast lookup
export function getAllMarketGroups(): MarketGroupDef[] {
  return MARKET_GROUPS;
}

export function getMarketGroup(slug: string): MarketGroupDef | undefined {
  if (!slug) return undefined;
  const normalized = slug.trim().toLowerCase();
  return MARKET_GROUPS.find((g) => g.slug.toLowerCase() === normalized);
}

export function getMarketGroupsByCategory(cat: GroupCategoryType): MarketGroupDef[] {
  return MARKET_GROUPS.filter((g) => g.categoryType === cat);
}

export function getRelatedMarketGroups(group: MarketGroupDef): MarketGroupDef[] {
  if (!group.relatedSlugs || group.relatedSlugs.length === 0) return [];
  return group.relatedSlugs
    .map((slug) => getMarketGroup(slug))
    .filter((g): g is MarketGroupDef => Boolean(g));
}
