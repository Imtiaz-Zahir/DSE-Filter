import React from "react";
import {
  PieChart,
  DollarSign,
  Percent,
  Coins,
  ShieldCheck,
  Layers,
  FileSpreadsheet,
  Building,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock } from "@/lib/types";
import {
  getAuditedPe,
  getUnauditedPe,
  getPbRatio,
  getDivYieldPct,
  getMarketCap,
  getFreeFloatCap,
  getPaidUpCap,
  getAuthorizedCap,
  getNav,
  getEps,
} from "@/lib/stocks";
import {
  formatBDT,
  formatNumber,
  formatLargeNumber,
  formatInteger,
} from "@/lib/utils";

interface ValuationGridProps {
  stock: Stock;
}

export function ValuationGrid({ stock }: ValuationGridProps) {
  const auditedPe = getAuditedPe(stock);
  const unauditedPe = getUnauditedPe(stock);
  const pb = getPbRatio(stock);
  const divYield = getDivYieldPct(stock);
  const marketCap = getMarketCap(stock);
  const freeFloatCap = getFreeFloatCap(stock);
  const paidUpCap = getPaidUpCap(stock);
  const authorizedCap = getAuthorizedCap(stock);
  const nav = getNav(stock);
  const eps = getEps(stock);
  const totalShares = stock.basicInformation?.totalOutstandingSecurities;
  const faceValue = stock.basicInformation?.faceParValue;
  const marketLot = stock.basicInformation?.marketLot;

  const metrics = [
    {
      label: "Audited P/E",
      value: auditedPe !== null ? `${formatNumber(auditedPe)}x` : "-",
      desc: "Based on latest audited earnings",
      highlight: auditedPe !== null && auditedPe > 0 && auditedPe < 15,
    },
    {
      label: "Unaudited / Trailing P/E",
      value: unauditedPe !== null ? `${formatNumber(unauditedPe)}x` : "-",
      desc: "Based on latest quarterly reports",
      highlight: false,
    },
    {
      label: "Dividend Yield",
      value: divYield !== null ? `${formatNumber(divYield)}%` : "-",
      desc: "Latest historical annual yield",
      highlight: divYield !== null && divYield >= 5,
    },
    {
      label: "Price to Book (P/B)",
      value: pb !== null ? `${formatNumber(pb)}x` : "-",
      desc: "LTP divided by Net Asset Value",
      highlight: pb !== null && pb > 0 && pb < 1,
    },
    {
      label: "NAV per Share",
      value: formatBDT(nav),
      desc: "Audited Net Asset Value",
      highlight: false,
    },
    {
      label: "EPS per Share",
      value: formatBDT(eps),
      desc: "Audited Earnings Per Share",
      highlight: eps !== null && eps > 0,
    },
    {
      label: "Market Capitalization",
      value: formatLargeNumber(marketCap),
      desc: marketCap ? `${formatNumber(marketCap)} Mn BDT` : "-",
      highlight: false,
    },
    {
      label: "Free Float Market Cap",
      value: formatLargeNumber(freeFloatCap),
      desc: freeFloatCap ? `${formatNumber(freeFloatCap)} Mn BDT` : "-",
      highlight: false,
    },
    {
      label: "Paid-Up Capital",
      value: formatLargeNumber(paidUpCap),
      desc: paidUpCap ? `${formatNumber(paidUpCap)} Mn BDT` : "-",
      highlight: false,
    },
    {
      label: "Authorized Capital",
      value: formatLargeNumber(authorizedCap),
      desc: authorizedCap ? `${formatNumber(authorizedCap)} Mn BDT` : "-",
      highlight: false,
    },
    {
      label: "Total Outstanding Shares",
      value: formatInteger(totalShares),
      desc: "Total listed securities",
      highlight: false,
    },
    {
      label: "Face Value / Market Lot",
      value: faceValue !== undefined ? `৳${faceValue} / Lot: ${marketLot ?? 1}` : "-",
      desc: "Par value per share",
      highlight: false,
    },
  ];

  return (
    <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <PieChart className="size-4.5 text-primary" />
          <CardTitle className="text-base font-semibold">Valuation & Capital Structure</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {metrics.map((item, idx) => (
            <div
              key={idx}
              className={`rounded-xl p-3 border transition-colors ${
                item.highlight
                  ? "bg-emerald-500/5 border-emerald-500/30 dark:bg-emerald-500/10"
                  : "bg-card border-border/60 hover:bg-muted/30"
              }`}
            >
              <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
                {item.label}
              </div>
              <div
                className={`mt-1 font-heading text-base sm:text-lg font-bold truncate ${
                  item.highlight
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-foreground"
                }`}
              >
                {item.value}
              </div>
              <div className="text-[10px] text-muted-foreground/80 mt-0.5 truncate" title={item.desc}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
