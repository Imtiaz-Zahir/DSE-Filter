import { ScreenerStock } from "./types";
import rawScreenerData from "@/data/screener_stocks.json";

const screenerStocks: ScreenerStock[] = rawScreenerData as unknown as ScreenerStock[];

let screenerMap: Map<string, ScreenerStock> | null = null;

function getScreenerMap(): Map<string, ScreenerStock> {
  if (!screenerMap) {
    screenerMap = new Map<string, ScreenerStock>();
    for (const s of screenerStocks) {
      if (s.tradingCode) {
        screenerMap.set(s.tradingCode.toUpperCase().trim(), s);
      }
      if (s.scripCode) {
        screenerMap.set(s.scripCode.toUpperCase().trim(), s);
      }
    }
  }
  return screenerMap;
}

export function getClientScreenerStocks(): ScreenerStock[] {
  return screenerStocks;
}

export function getClientScreenerStockByCode(code: string): ScreenerStock | undefined {
  if (!code) return undefined;
  return getScreenerMap().get(code.trim().toUpperCase());
}
