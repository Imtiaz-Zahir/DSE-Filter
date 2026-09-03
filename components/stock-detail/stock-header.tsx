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
  getInstrumentType,
  getOperationalStatus,
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
  const sourceUrl = stock.sourceUrl || `https://www.dsebd.org/displayCompany.php?name=${code}`;

  return (
    <div className="space-y-4">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-x-auto whitespace-nowrap">
        <Link href="/" className="flex items-center gap-1 hover:text-foreground transition-colors">
          <Home className="size-3.5" />
          <span>Home</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <Link href={`/?sector=${encodeURIComponent(sector)}`} className="hover:text-foreground transition-colors">
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

            <Badge variant={getCategoryBadgeVariant(cat)} className="text-xs px-2 py-0.5 font-bold">
              Category {cat}
            </Badge>

            {isSharia && (
              <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="size-3 mr-1" /> DSES Sharia Compliant
              </span>
            )}

            <Badge variant="outline" className="text-xs px-2 py-0.5 text-muted-foreground">
              {instrument}
            </Badge>

            {status === "Active" ? (
              <span className="inline-flex items-center text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3 mr-1" /> Operational
              </span>
            ) : (
              <span className="inline-flex items-center text-[11px] font-medium text-rose-600 dark:text-rose-400">
                <AlertCircle className="size-3 mr-1" /> {status}
              </span>
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
              <span>Sector: <Link href={`/?sector=${encodeURIComponent(sector)}`} className="text-primary hover:underline">{sector}</Link></span>
              {stock.dividendAndSurplus?.listingYear && (
                <>
                  <span>•</span>
                  <span>Listed: <strong className="text-foreground">{stock.dividendAndSurplus.listingYear}</strong></span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons: DSE Official link & Compare button */}
        <div className="flex items-center gap-2 pt-2 md:pt-0 shrink-0">
          <Link href={`/compare?codes=${encodeURIComponent(code)}`}>
            <Button variant="outline" size="sm" className="h-8.5 text-xs">
              Compare Stock
            </Button>
          </Link>
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            <Button size="sm" className="h-8.5 text-xs gap-1.5">
              <span>Official DSE Page</span>
              <ExternalLink className="size-3.5" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
