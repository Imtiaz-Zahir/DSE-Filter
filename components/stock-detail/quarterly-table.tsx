import React from "react";
import { Calendar, BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock, InterimFinancial } from "@/lib/types";
import { formatBDT } from "@/lib/utils";

interface QuarterlyTableProps {
  stock: Stock;
}

export function QuarterlyTable({ stock }: QuarterlyTableProps) {
  const interims = stock.interimFinancials || [];

  if (interims.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <Calendar className="size-4.5 text-primary" />
          <CardTitle className="text-base font-semibold">Interim Quarterly EPS Performance</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-muted/30 border-b border-border/60">
              <tr className="text-muted-foreground">
                <th className="py-2.5 px-4 font-semibold">Period</th>
                <th className="py-2.5 px-3 font-semibold">End Date</th>
                <th className="py-2.5 px-3 text-right font-semibold">EPS Basic (BDT)</th>
                <th className="py-2.5 px-3 text-right font-semibold">EPS Continuing</th>
                <th className="py-2.5 px-4 text-right font-semibold">Market Price at End</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {interims.map((item, idx) => {
                const eps = item.epsBasic;
                const epsCont = item.epsContinuingBasic;
                const price = item.marketPriceEnd;

                return (
                  <tr key={idx} className="hover:bg-muted/30 transition-colors">
                    <td className="py-2.5 px-4 font-bold text-foreground">
                      {item.period || "-"}
                    </td>
                    <td className="py-2.5 px-3 text-muted-foreground">
                      {item.endDate || "-"}
                    </td>
                    <td className={`py-2.5 px-3 text-right font-semibold ${eps !== null && eps !== undefined && eps < 0 ? "text-rose-600 dark:text-rose-400" : "text-foreground"}`}>
                      {formatBDT(eps)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-muted-foreground">
                      {formatBDT(epsCont)}
                    </td>
                    <td className="py-2.5 px-4 text-right font-medium text-foreground">
                      {formatBDT(price)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
