import React from "react";

export function HomeJsonLd() {
  const baseUrl = "https://dse-filter.1mt2.workers.dev";

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DSE Filter",
    url: baseUrl,
    description:
      "Dhaka Stock Exchange (DSE) stock screener and fundamental stock analytics tool for Bangladesh capital markets.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DSE Filter",
    url: baseUrl,
    logo: `${baseUrl}/favicon.ico`,
    description:
      "Free fundamental stock screening and analytics platform for Dhaka Stock Exchange (DSE) listed companies.",
    sameAs: ["https://www.dsebd.org"],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "DSE Filter Stock Screener",
    applicationCategory: "FinanceApplication",
    operatingSystem: "Web, iOS, Android, Desktop",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "BDT",
    },
    description:
      "Interactive Dhaka Stock Exchange (DSE) stock screener with valuation multiples, DSES Sharia filters, audited financial history, and peer comparison.",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is DSE Filter?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DSE Filter is a fast, mobile-first Dhaka Stock Exchange (DSE) stock screener and fundamental research platform. It enables investors to screen 395+ listed Bangladesh companies across P/E ratios, Dividend Yields, NAV per share, EPS, Market Capitalization, DSES Sharia compliance, and multi-year audited financial records.",
        },
      },
      {
        "@type": "Question",
        name: "How can I filter Dhaka Stock Exchange (DSE) stocks by P/E ratio and Dividend Yield?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "On DSE Filter, you can use one-click presets like 'Low P/E (<15)' or 'High Dividend (>5%)', or use the advanced filter drawer to set custom numeric ranges for P/E ratio, Dividend Yield, Price-to-Book (P/B), Market Cap, and Net Asset Value (NAV).",
        },
      },
      {
        "@type": "Question",
        name: "What do DSE Market Categories (A, B, N, Z) mean?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Category A includes companies holding regular Annual General Meetings (AGMs) and declaring 10%+ dividends. Category B includes companies holding regular AGMs with dividends under 10%. Category N represents newly listed companies in their first year. Category Z includes companies with irregular AGMs, operational shutdowns, or accumulated losses.",
        },
      },
      {
        "@type": "Question",
        name: "How do I find DSES Sharia-compliant stocks on Dhaka Stock Exchange?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Click the 'DSES Sharia' quick preset on DSE Filter to view all 125+ Sharia-compliant stocks vetted under Islamic financial screening guidelines on the Dhaka Stock Exchange.",
        },
      },
      {
        "@type": "Question",
        name: "How can I compare multiple DSE stocks side by side?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Select any stocks using the comparison checkboxes or visit the DSE Stock Comparison Matrix (/compare) to analyze up to 4 companies simultaneously across valuation, profitability, debt, and shareholding metrics.",
        },
      },
      {
        "@type": "Question",
        name: "How often is the DSE market data updated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "DSE Filter synchronizes fundamental disclosures, audited financial metrics, quarterly EPS, and trading indicators daily from public Dhaka Stock Exchange filings.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
