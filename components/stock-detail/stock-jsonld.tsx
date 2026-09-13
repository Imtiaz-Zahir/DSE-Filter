import React from "react";
import { Stock } from "@/lib/types";
import {
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getLtp,
  getChange,
  getChangePct,
  getPe,
  getDivYieldPct,
  getPbRatio,
  getNav,
  getEps,
  getMarketCap,
  getPaidUpCap,
  getShariaCompliant,
} from "@/lib/stocks";
import { formatBDT, formatPct, formatLargeNumber, formatNumber } from "@/lib/utils";

interface StockJsonLdProps {
  stock: Stock;
}

export function StockJsonLd({ stock }: StockJsonLdProps) {
  const code = getTradingCode(stock);
  const name = getCompanyName(stock);
  const sector = getSector(stock);
  const category = getCategory(stock);
  const ltp = getLtp(stock);
  const chg = getChange(stock);
  const chgPct = getChangePct(stock);
  const pe = getPe(stock);
  const divYield = getDivYieldPct(stock);
  const pb = getPbRatio(stock);
  const nav = getNav(stock);
  const eps = getEps(stock);
  const mcap = getMarketCap(stock);
  const isSharia = getShariaCompliant(stock);
  const baseUrl = "https://dse-filter.1mt2.workers.dev";
  const stockUrl = `${baseUrl}/stock/${encodeURIComponent(code)}`;

  const corporationJson = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    name: name,
    legalName: name,
    alternateName: code,
    tickerSymbol: `DSE:${code}`,
    url: stockUrl,
    description: `${name} (${code}) is a listed company on the Dhaka Stock Exchange (DSE) in Bangladesh, operating within the ${sector} sector under Market Category ${category}.`,
    address: {
      "@type": "PostalAddress",
      streetAddress: stock.addressContact?.headOffice || "Dhaka, Bangladesh",
      addressCountry: "BD",
    },
    contactPoint: {
      "@type": "ContactPoint",
      telephone: stock.addressContact?.phone || stock.addressContact?.telephoneNo || undefined,
      email: stock.addressContact?.email || undefined,
      contactType: "Investor Relations",
    },
  };

  const financialProductJson = {
    "@context": "https://schema.org",
    "@type": "FinancialProduct",
    name: `${code} - ${name} DSE Equity Share`,
    tickerSymbol: `DSE:${code}`,
    url: stockUrl,
    description: `Dhaka Stock Exchange live stock quote for ${name} (${code}). Sector: ${sector}, Category: ${category}.`,
    category: sector,
    offers: ltp !== null ? {
      "@type": "Offer",
      price: ltp.toString(),
      priceCurrency: "BDT",
      availability: "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: "Dhaka Stock Exchange (DSE)",
      },
    } : undefined,
  };

  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: baseUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: `${sector} Stocks`,
        item: `${baseUrl}/?sector=${encodeURIComponent(sector)}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${code} - ${name}`,
        item: stockUrl,
      },
    ],
  };

  const faqQuestions = [
    {
      q: `What is the latest share price of ${name} (${code}) on DSE?`,
      a: `${name} (${code}) latest Last Traded Price (LTP) is ${formatBDT(ltp)} BDT${chgPct !== null ? ` with a day change of ${formatPct(chgPct)}` : ""}. 52-week price range is ৳${stock.marketInformation?.movingRange52Weeks?.[0] ?? "-"} to ৳${stock.marketInformation?.movingRange52Weeks?.[1] ?? "-"}.`,
    },
    {
      q: `What is ${code}'s P/E ratio and Price-to-Book (P/B) ratio?`,
      a: `${name} (${code}) has a Price-to-Earnings (P/E) ratio of ${pe !== null ? `${formatNumber(pe)}x` : "N/A"} and a Price-to-Book (P/B) ratio of ${pb !== null ? `${formatNumber(pb)}x` : "N/A"}.`,
    },
    {
      q: `What is the dividend yield and dividend history for ${code}?`,
      a: `${code} currently offers an indicated dividend yield of ${divYield !== null ? `${formatNumber(divYield)}%` : "0.00%"}. In recent disclosures, cash and stock dividend records can be reviewed in the audited financial history table.`,
    },
    {
      q: `Is ${code} (${name}) DSES Sharia compliant?`,
      a: isSharia
        ? `Yes, ${code} is certified as DSES Sharia Compliant on the Dhaka Stock Exchange based on Islamic financial screening standards.`
        : `No, ${code} is currently not listed in the DSES Sharia Index of the Dhaka Stock Exchange.`,
    },
    {
      q: `What is ${code}'s Net Asset Value (NAV) per share and EPS?`,
      a: `${name} (${code}) has an audited Net Asset Value (NAV) per share of ${formatBDT(nav)} BDT and an audited Earnings Per Share (EPS) of ${formatBDT(eps)} BDT.`,
    },
    {
      q: `What market category and sector does ${code} trade under on Dhaka Stock Exchange?`,
      a: `${name} (${code}) trades under Category ${category} in the ${sector} industry sector of the Dhaka Stock Exchange.`,
    },
  ];

  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqQuestions.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(corporationJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(financialProductJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
    </>
  );
}
