import React from "react";
import { Award, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock } from "@/lib/types";

interface CreditRatingCardProps {
  stock: Stock;
}

export function CreditRatingCard({ stock }: CreditRatingCardProps) {
  const ratings = stock.creditRatings;
  if (!ratings || ratings.length === 0) return null;

  return (
    <Card className="rounded-2xl border border-border/70 overflow-hidden shadow-2xs">
      <CardHeader className="p-4 sm:p-5 border-b border-border/50 bg-muted/20">
        <div className="flex items-center gap-2">
          <Award className="size-4.5 text-primary" />
          <CardTitle className="text-base font-semibold">Credit Rating & Solvency Status</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground uppercase text-[10px] tracking-wider">
                <th className="py-2 pr-3 font-semibold">Rating Date</th>
                <th className="py-2 px-3 font-semibold">Long Term</th>
                <th className="py-2 px-3 font-semibold">Short Term</th>
                <th className="py-2 px-3 font-semibold">Outlook</th>
                <th className="py-2 px-3 font-semibold">Validity Date</th>
                <th className="py-2 pl-3 font-semibold text-right">Rating Agency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {ratings.map((item, idx) => (
                <tr key={idx} className="hover:bg-muted/30 transition-colors">
                  <td className="py-2.5 pr-3 font-medium text-foreground whitespace-nowrap">
                    {item.ratingDate || "-"}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className="inline-flex items-center font-bold text-foreground bg-primary/10 px-2 py-0.5 rounded text-xs">
                      {item.longTerm || "-"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                    {item.shortTerm || "-"}
                  </td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 font-medium ${
                      item.outlook?.toLowerCase().includes("stable")
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-amber-600 dark:text-amber-400"
                    }`}>
                      <CheckCircle2 className="size-3" />
                      {item.outlook || "Stable"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-muted-foreground whitespace-nowrap">
                    {item.validityDate || "-"}
                  </td>
                  <td className="py-2.5 pl-3 font-medium text-foreground text-right">
                    {item.ratingAgency || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
