import React from "react";
import Link from "next/link";
import { TrendingUp, ShieldCheck, Info, Layers, ExternalLink } from "lucide-react";
import { getAllSectors } from "@/lib/stocks";

export function Footer() {
  const sectors = getAllSectors();

  return (
    <footer className="border-t border-border/60 bg-muted/20 mt-16 text-muted-foreground">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Col 1: Brand & Overview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <TrendingUp className="size-4" />
              </div>
              <span className="font-heading text-base font-bold text-foreground">
                DSE<span className="text-primary">Filter</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              A comprehensive, mobile-first analytics screener and fundamental research platform
              for stocks listed on the Dhaka Stock Exchange (DSE), featuring DSES Sharia compliance,
              multi-tier valuation metrics, audited histories, and shareholding insights.
            </p>
            <div className="flex items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="size-3 mr-1" /> 125+ DSES Sharia Stocks
              </span>
            </div>
          </div>

          {/* Col 2: Category Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              DSE Market Categories
            </h4>
            <ul className="space-y-2 text-xs">
              <li className="flex gap-2">
                <span className="font-bold text-foreground">Category A:</span>
                <span>Companies holding regular AGMs and declaring 10%+ dividend.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-foreground">Category B:</span>
                <span>Companies holding regular AGMs but declaring &lt;10% dividend.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-foreground">Category N:</span>
                <span>Newly listed companies in their first operational cycle.</span>
              </li>
              <li className="flex gap-2">
                <span className="font-bold text-rose-600 dark:text-rose-400">Category Z:</span>
                <span>Irregular AGMs, non-operational, or accumulated loss makers.</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Sectors */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Active DSE Sectors
            </h4>
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {sectors.map((sec) => (
                <Link
                  key={sec}
                  href={`/?sector=${encodeURIComponent(sec)}`}
                  className="rounded bg-secondary/80 px-2 py-0.5 text-[11px] text-foreground/80 hover:bg-secondary hover:text-foreground transition-colors"
                >
                  {sec}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 4: Quick Links & Legal */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">
              Resources & Official Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a
                  href="https://www.dsebd.org"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <span>Dhaka Stock Exchange Official</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <a
                  href="https://sec.gov.bd"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-foreground transition-colors"
                >
                  <span>Bangladesh Securities and Exchange Commission (BSEC)</span>
                  <ExternalLink className="size-3" />
                </a>
              </li>
              <li>
                <Link href="/compare" className="hover:text-foreground transition-colors">
                  Stock Comparison Matrix
                </Link>
              </li>
              <li>
                <Link href="/?preset=sharia" className="hover:text-foreground transition-colors">
                  DSES Sharia Compliant Stocks
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="mt-8 border-t border-border/50 pt-6 text-center text-xs text-muted-foreground/80">
          <p className="flex items-center justify-center gap-1 mb-2">
            <Info className="size-3.5 shrink-0 inline text-muted-foreground" />
            <span>
              Disclaimer: Data presented on this platform is for research, analytical, and informational purposes only. It does not constitute financial or investment advice.
            </span>
          </p>
          <p>
            &copy; {new Date().getFullYear()} DSE Filter. Data sourced from public DSE disclosures. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
