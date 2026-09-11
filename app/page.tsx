import { fetchServerScreenerStocks } from "@/lib/data-provider";
import { ScreenerWorkspace } from "@/components/screener/screener-workspace";
import { Suspense } from "react";
import { ScreenerStockList } from "@/components/screener/screener-skeleton";

export const revalidate = 3600; // Automatic ISR fallback every 1 hour

export default async function HomePage() {
  const allStocks = await fetchServerScreenerStocks();

  const tableStocks = allStocks.map((stock) => ({
    tradingCode: stock.tradingCode,
    companyName: stock.companyName,
    sector: stock.sector,
    category: stock.category,
    shariaCompliant: stock.shariaCompliant,
    ltp: stock.ltp,
    pe: stock.pe,
    divYield: stock.divYield,
    pb: stock.pb,
    nav: stock.nav,
    eps: stock.eps,
    marketCap: stock.marketCap,
  }));

  return (
    <main className="min-h-screen bg-background text-foreground pb-24">
      <Suspense fallback={<ScreenerStockList stocks={tableStocks} />}>
        <ScreenerWorkspace initialStocks={allStocks} />
      </Suspense>
    </main>
  );
}
