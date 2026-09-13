import React from "react";
import { HelpCircle, CheckCircle2 } from "lucide-react";
import { Stock } from "@/lib/types";
import {
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getLtp,
  getChangePct,
  getPe,
  getDivYieldPct,
  getPbRatio,
  getNav,
  getEps,
  getShariaCompliant,
} from "@/lib/stocks";
import { formatBDT, formatPct, formatNumber } from "@/lib/utils";

interface StockFaqProps {
  stock: Stock;
}

export function StockFaq({ stock }: StockFaqProps) {
  const code = getTradingCode(stock);
  const name = getCompanyName(stock);
  const sector = getSector(stock);
  const category = getCategory(stock);
  const ltp = getLtp(stock);
  const chgPct = getChangePct(stock);
  const pe = getPe(stock);
  const divYield = getDivYieldPct(stock);
  const pb = getPbRatio(stock);
  const nav = getNav(stock);
  const eps = getEps(stock);
  const isSharia = getShariaCompliant(stock);
  const range52 = stock.marketInformation?.movingRange52Weeks;

  const faqs = [
    {
      q: `What is the latest share price of ${name} (${code}) on Dhaka Stock Exchange?`,
      a: `${name} (${code}) latest Last Traded Price (LTP) is ${formatBDT(ltp)} BDT${
        chgPct !== null ? ` with a day change of ${formatPct(chgPct)}` : ""
      }. Over the trailing 52 weeks, the share price has ranged from ৳${range52?.[0] ?? "-"} to ৳${
        range52?.[1] ?? "-"
      }.`,
    },
    {
      q: `What is ${code}'s P/E ratio and Price-to-Book (P/B) ratio?`,
      a: `${name} (${code}) currently trades at a Price-to-Earnings (P/E) ratio of ${
        pe !== null ? `${formatNumber(pe)}x` : "N/A"
      } and a Price-to-Book (P/B) multiple of ${pb !== null ? `${formatNumber(pb)}x` : "N/A"}.`,
    },
    {
      q: `What is ${code}'s dividend yield and payout track record?`,
      a: `${code} offers an indicated dividend yield of ${
        divYield !== null ? `${formatNumber(divYield)}%` : "0.00%"
      }. Historical cash and stock dividend declarations over past financial years are detailed in the audited history section above.`,
    },
    {
      q: `Is ${code} (${name}) included in the DSES Sharia Index?`,
      a: isSharia
        ? `Yes, ${code} is recognized as DSES Sharia Compliant by the Dhaka Stock Exchange in accordance with Islamic financial screening guidelines.`
        : `No, ${code} is currently not classified as DSES Sharia Compliant on the Dhaka Stock Exchange.`,
    },
    {
      q: `What is ${code}'s Net Asset Value (NAVPS) and Earnings Per Share (EPS)?`,
      a: `Based on the latest audited financial disclosures, ${code} has an audited Net Asset Value (NAV) per share of ${formatBDT(
        nav
      )} BDT and an Earnings Per Share (EPS) of ${formatBDT(eps)} BDT.`,
    },
    {
      q: `What sector and market category does ${code} trade in on DSE?`,
      a: `${name} (${code}) trades under Market Category ${category} within the ${sector} industry sector of the Dhaka Stock Exchange.`,
    },
  ];

  return (
    <section
      aria-label={`${name} (${code}) Frequently Asked Questions`}
      className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-2xs"
    >
      <div className="flex items-center gap-2">
        <HelpCircle className="size-5 text-primary" />
        <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
          Frequently Asked Questions about {name} ({code})
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2"
          >
            <h3 className="font-semibold text-xs sm:text-sm text-foreground flex items-start gap-2">
              <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
              <span>{faq.q}</span>
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed pl-6">
              {faq.a}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
