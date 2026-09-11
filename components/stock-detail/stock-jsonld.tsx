import React from "react";
import { Stock } from "@/lib/types";
import { getTradingCode, getCompanyName, getSector, getLtp, getChangePct } from "@/lib/stocks";

interface StockJsonLdProps {
  stock: Stock;
}

export function StockJsonLd({ stock }: StockJsonLdProps) {
  const code = getTradingCode(stock);
  const name = getCompanyName(stock);
  const sector = getSector(stock);
  const ltp = getLtp(stock);

  const corporationJson = {
    "@context": "https://schema.org",
    "@type": "Corporation",
    name: name,
    tickerSymbol: `DSE:${code}`,
    url: `https://dse-filter.1mt2.workers.dev/stock/${encodeURIComponent(code)}`,
    description: `${name} (${code}) listed on Dhaka Stock Exchange in the ${sector} sector.`,
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

  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://dse-filter.1mt2.workers.dev",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Screener",
        item: "https://dse-filter.1mt2.workers.dev",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${code} - ${name}`,
        item: `https://dse-filter.1mt2.workers.dev/stock/${encodeURIComponent(code)}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(corporationJson) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }}
      />
    </>
  );
}
