import React from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  ExternalLink,
  ChevronRight,
  Home,
  CheckCircle2,
  AlertCircle,
  Clock,
  Layers,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Stock } from "@/lib/types";
import {
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getShariaCompliant,
  getShariahBadgeStatus,
  getInstrumentType,
  getOperationalStatus,
  getExchanges,
  isDualListed,
  isDseListed,
  isCseListed,
} from "@/lib/stocks";
import { getCategoryBadgeVariant } from "@/lib/utils";

interface StockHeaderProps {
  stock: Stock;
}

export function StockHeader({ stock }: StockHeaderProps) {
  const code = getTradingCode(stock);
  const name = getCompanyName(stock);
  const sector = getSector(stock);
  const cat = getCategory(stock);
  const isSharia = getShariaCompliant(stock);
  const instrument = getInstrumentType(stock);
  const status = getOperationalStatus(stock);
  const scripCode = stock.scripCode;
  const isDse = isDseListed(stock);
  const isCse = isCseListed(stock);
  const isDual = isDualListed(stock);

  const dseSourceUrl = stock.sourceUrl || `https://old.dsebd.org/displayCompany.php?name=${encodeURIComponent(code)}`;
  const cseSourceUrl = stock.cseSourceUrl || `https://cse.com.bd/company/companydetails/${encodeURIComponent(code)}`;

  const sectorSlug = `sector-${sector.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`;
  const catSlug = cat === "A" || cat === "B" || cat === "Z" || cat === "N" ? `category-${cat.toLowerCase()}` : "category-a";

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="size-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <Link href={`/market/${sectorSlug}`} className="hover:text-foreground transition-colors">
          {sector}
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <span className="font-semibold text-foreground">{code}</span>
      </nav>

      {/* Main Header Card */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 rounded-2xl bg-card border border-border/70 p-4 sm:p-6 shadow-2xs">
        <div className="space-y-2">
          {/* Code, Badges & Scrip */}
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              {code}
            </h1>

            <Link href={`/market/${catSlug}`} title={`View all ${cat} category stocks`}>
              <Badge variant={getCategoryBadgeVariant(cat)} className="text-xs px-2 py-0.5 font-bold hover:opacity-80 transition-opacity">
                Category {cat}
              </Badge>
            </Link>

            {getShariahBadgeStatus(stock) === "compliant" && (
              <Link href="/market/shariah" title="View all Sharia compliant stocks">
                <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors">
                  <ShieldCheck className="size-3 mr-1" /> Sharia Compliant
                </span>
              </Link>
            )}

            {getShariahBadgeStatus(stock) === "non-compliant" && (
              <span className="inline-flex items-center rounded-md bg-rose-500/10 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Non-Compliant
              </span>
            )}

            {isDual ? (
              <Link href="/market/dual-listed" title="View dual-listed companies (DSE & CSE)">
                <span className="inline-flex items-center rounded-md bg-blue-500/10 px-2 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">
                  <Layers className="size-3 mr-1" /> Dual Listed (DSE + CSE)
                </span>
              </Link>
            ) : isCse ? (
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-amber-600 border-amber-500/30 bg-amber-500/10">
                CSE Listed Only
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
                DSE Listed
              </Badge>
            )}

            <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
              {instrument}
            </Badge>

            {status === "Active" ? (
              <Link href="/market/operational" title="View all operational active companies">
                <span className="inline-flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:underline">
                  <CheckCircle2 className="size-3 mr-1" /> Operational
                </span>
              </Link>
            ) : (
              <Link href="/market/closed" title="View closed & suspended companies">
                <span className="inline-flex items-center text-[11px] font-medium text-rose-600 dark:text-rose-400 hover:underline">
                  <AlertCircle className="size-3 mr-1" /> {status}
                </span>
              </Link>
            )}
          </div>

          {/* Full Company Name & Scrip Code */}
          <div className="space-y-1">
            <p className="text-base sm:text-lg font-medium text-foreground/90">
              {name}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              {scripCode && <span>Scrip Code: <strong className="text-foreground">{scripCode}</strong></span>}
              <span>•</span>
              <span>Sector: <Link href={`/market/${sectorSlug}`} className="text-primary hover:underline">{sector}</Link></span>
              {stock.dividendAndSurplus?.listingYear && (
                <>
                  <span>•</span>
                  <span>Listed: <strong className="text-foreground">{stock.dividendAndSurplus.listingYear}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons: DSE / CSE Official links & Compare button */}
        <div className="flex items-center gap-2 pt-2 md:pt-0 shrink-0 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            className="h-8.5 text-xs"
            render={<Link href={`/compare?codes=${encodeURIComponent(code)}`} />}
          >
            Compare Stock
          </Button>

          {isDse && (
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 text-xs gap-1.5"
              render={<a href={dseSourceUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <span>DSE Page</span>
              <ExternalLink className="size-3.5" />
            </Button>
          )}

          {isCse && (
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 text-xs gap-1.5 text-blue-600 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/10"
              render={<a href={cseSourceUrl} target="_blank" rel="noopener noreferrer" />}
            >
              <span>CSE Page</span>
              <ExternalLink className="size-3.5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
