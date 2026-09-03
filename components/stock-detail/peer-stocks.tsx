import React from "react";
import Link from "next/link";
import { ArrowRight, TrendingUp, TrendingDown, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Stock } from "@/lib/types";
import {
  getPeerStocks,
  getTradingCode,
  getCompanyName,
  getSector,
  getCategory,
  getShariaCompliant,
  getLtp,
  getChange,
  getChangePct,
  getPe,
  getDivYieldPct,
  getMarketCap,
} from "@/lib/stocks";
import {
  formatBDT,
  formatPct,
  formatNumber,
  formatLargeNumber,
  getCategoryBadgeVariant,
  getChangeColorClass,
} from "@/lib/utils";

interface PeerStocksProps {
  stock: Stock;
}

export function PeerStocks({ stock }: PeerStocksProps) {
  const peers = getPeerStocks(stock, undefined, 4);
  const sector = getSector(stock);

  if (peers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-lg font-bold text-foreground">
            Peer Companies in {sector}
          </h2>
          <p className="text-xs text-muted-foreground">
            Compare key valuation and fundamental metrics with industry competitors
          </p>
        </div>
        <Link
          href={`/?sector=${encodeURIComponent(sector)}`}
          className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
        >
          <span>All {sector} stocks</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {peers.map((peer) => {
          const code = getTradingCode(peer);
          const ltp = getLtp(peer);
          const chg = getChange(peer);
          const chgPct = getChangePct(peer);
          const pe = getPe(peer);
          const yld = getDivYieldPct(peer);
          const mktCap = getMarketCap(peer);
          const cat = getCategory(peer);
          const isSharia = getShariaCompliant(peer);

          return (
            <Link key={code} href={`/stock/${encodeURIComponent(code)}`} className="group block">
              <Card className="h-full rounded-xl border border-border/70 p-3.5 transition-all hover:border-primary/40 hover:shadow-md bg-card">
                <CardContent className="p-0 space-y-2.5">
                  <div className="flex items-start justify-between gap-1">
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-heading font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                          {code}
                        </span>
                        <Badge variant={getCategoryBadgeVariant(cat)} className="text-[9px] h-3.5 px-1 font-bold">
                          {cat}
                        </Badge>
                        {isSharia && (
                          <span className="inline-flex items-center rounded bg-emerald-500/10 px-1 py-0 text-[8px] font-bold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            DSES
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate mt-0.5 max-w-[160px]">
                        {peer.companyName}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-semibold text-xs text-foreground">
                        {formatBDT(ltp)}
                      </div>
                      <div className={`text-[10px] font-bold flex items-center justify-end ${getChangeColorClass(chg)}`}>
                        {formatPct(chgPct)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-1 pt-1 border-t border-border/40 text-center text-[10px]">
                    <div>
                      <span className="text-muted-foreground block">P/E</span>
                      <span className="font-semibold text-foreground">
                        {pe !== null ? `${formatNumber(pe)}x` : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Yield</span>
                      <span className="font-semibold text-foreground">
                        {yld !== null ? `${formatNumber(yld)}%` : "-"}
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block">Cap</span>
                      <span className="font-semibold text-foreground truncate block">
                        {formatLargeNumber(mktCap)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
