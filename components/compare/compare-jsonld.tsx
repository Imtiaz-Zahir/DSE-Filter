import React from "react";

export function CompareJsonLd() {
  const baseUrl = "https://dse-filter.1mt2.workers.dev";

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
        name: "Stock Comparison Matrix",
        item: `${baseUrl}/compare`,
      },
    ],
  };

  const itemPageJson = {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    name: "DSE Stock Comparison Matrix",
    url: `${baseUrl}/compare`,
    description:
      "Side-by-side fundamental comparison tool for Dhaka Stock Exchange listed equities. Compare valuation, P/E ratio, dividend yield, debt, and shareholding across Bangladesh companies.",
  };

  const faqJson = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do I compare Dhaka Stock Exchange (DSE) stocks side-by-side?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Use DSE Filter's comparison tool to add up to 4 DSE listed stocks. The matrix automatically aligns their P/E ratios, Price-to-Book (P/B), Dividend Yields, NAV per share, EPS, Annual Net Profit, Long-Term Debt, and institutional shareholding percentages.",
        },
      },
      {
        "@type": "Question",
        name: "What are the most critical metrics to compare between DSE stocks?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Key metrics include Price-to-Earnings (P/E) ratio for valuation, Net Asset Value (NAVPS) versus LTP for book value safety, Dividend Yield for passive cash flow, Annual Net Profit and EPS growth for profitability, and Long-Term Debt to evaluate solvency.",
        },
      },
      {
        "@type": "Question",
        name: "Can I share a custom DSE stock comparison with other investors?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, every comparison automatically updates the URL query parameter (e.g., /compare?codes=GP,SQURPHARMA,BATBC), which you can copy, bookmark, or share directly.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemPageJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJson) }}
      />
    </>
  );
}
