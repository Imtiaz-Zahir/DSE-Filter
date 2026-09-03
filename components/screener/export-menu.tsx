"use client";

import React from "react";
import { Download, FileSpreadsheet, FileCode, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Stock } from "@/lib/types";
import {
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getShariaCompliant,
  getLtp,
  getChangePct,
  getPe,
  getDivYieldPct,
  getPbRatio,
  getNav,
  getEps,
  getMarketCap,
  getTurnover,
  getVolume,
  getDebt,
  getSponsorPct,
} from "@/lib/stocks";

interface ExportMenuProps {
  stocks: Stock[];
}

export function ExportMenu({ stocks }: ExportMenuProps) {
  const [downloaded, setDownloaded] = React.useState<string | null>(null);

  const exportCSV = () => {
    const headers = [
      "Trading Code",
      "Company Name",
      "Sector",
      "Category",
      "DSES Sharia",
      "LTP (BDT)",
      "Change %",
      "P/E",
      "Div Yield %",
      "P/B Ratio",
      "NAV (BDT)",
      "EPS (BDT)",
      "Market Cap (Mn BDT)",
      "Turnover (Mn BDT)",
      "Volume",
      "Long Term Debt (Mn BDT)",
      "Sponsor %",
    ];

    const rows = stocks.map((s) => [
      `"${getTradingCode(s)}"`,
      `"${getCompanyName(s).replace(/"/g, '""')}"`,
      `"${getSector(s)}"`,
      `"${getCategory(s)}"`,
      getShariaCompliant(s) ? "Yes" : "No",
      getLtp(s) ?? "",
      getChangePct(s) !== null ? getChangePct(s)?.toFixed(2) : "",
      getPe(s) ?? "",
      getDivYieldPct(s) ?? "",
      getPbRatio(s) ?? "",
      getNav(s) ?? "",
      getEps(s) ?? "",
      getMarketCap(s) ?? "",
      getTurnover(s) ?? "",
      getVolume(s) ?? "",
      getDebt(s) ?? "",
      getSponsorPct(s) ?? "",
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DSE_Stocks_Filtered_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded("csv");
    setTimeout(() => setDownloaded(null), 2500);
  };

  const exportJSON = () => {
    const exportData = stocks.map((s) => ({
      tradingCode: getTradingCode(s),
      companyName: getCompanyName(s),
      sector: getSector(s),
      category: getCategory(s),
      shariaCompliant: getShariaCompliant(s),
      ltp: getLtp(s),
      changePct: getChangePct(s),
      pe: getPe(s),
      dividendYieldPct: getDivYieldPct(s),
      pbRatio: getPbRatio(s),
      nav: getNav(s),
      eps: getEps(s),
      marketCapMn: getMarketCap(s),
      turnoverMn: getTurnover(s),
      volume: getVolume(s),
      debtMn: getDebt(s),
      sponsorPct: getSponsorPct(s),
    }));

    const jsonContent = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `DSE_Stocks_Filtered_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloaded("json");
    setTimeout(() => setDownloaded(null), 2500);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
            {downloaded ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Download className="size-3.5" />
            )}
            <span className="hidden sm:inline">Export</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-44 text-xs">
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={exportCSV} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="size-4 text-emerald-600 dark:text-emerald-400" />
            <span>Export CSV (.csv)</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportJSON} className="gap-2 cursor-pointer">
            <FileCode className="size-4 text-blue-600 dark:text-blue-400" />
            <span>Export JSON (.json)</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
