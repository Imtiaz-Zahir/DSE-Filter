import React from "react";
import { MarketGroupDef } from "@/lib/market-groups";
import { AnyStock } from "@/lib/types";
import { getTradingCode, getCompanyName, getLtp } from "@/lib/stocks";

interface MarketGroupJsonLdProps {
  group: MarketGroupDef;
  stocks: AnyStock[];
}

export function MarketGroupJsonLd({ group, stocks }: MarketGroupJsonLdProps) {
  const baseUrl = "https://dse-filter.1mt2.workers.dev";
  const url = `${baseUrl}/market/${group.slug}`;

  // CollectionPage / ItemList schema
  const itemListElements = stocks.slice(0, 30).map((stock, idx) => {
    const code = getTradingCode(stock);
    const name = getCompanyName(stock);
    const ltp = getLtp(stock);

    return {
      "@type": "ListItem",
      position: idx + 1,
      item: {
        "@type": "FinancialProduct",
        name: `${name} (${code})`,
        identifier: code,
        url: `${baseUrl}/stock/${encodeURIComponent(code)}`,
        offers: {
          "@type": "Offer",
          price: ltp || 0,
          priceCurrency: "BDT",
        },
      },
    };
  });

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: group.title,
    description: group.metaDescription,
    url,
    mainEntity: {
      "@type": "ItemList",
      name: group.title,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: stocks.length,
      itemListElement: itemListElements,
    },
  };

  // Breadcrumb schema
  const breadcrumbSchema = {
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
        name: "Market Groups",
        item: `${baseUrl}/market`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: group.shortTitle,
        item: url,
      },
    ],
  };

  // FAQPage schema
  const faqSchema =
    group.faqs && group.faqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: group.faqs.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        }
      : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
    </>
  );
}
