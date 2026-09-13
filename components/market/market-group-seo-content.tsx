import React from "react";
import Link from "next/link";
import {
  HelpCircle,
  CheckCircle2,
  ListChecks,
  BookOpen,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { MarketGroupDef } from "@/lib/market-groups";
import { Badge } from "@/components/ui/badge";

interface MarketGroupSeoContentProps {
  group: MarketGroupDef;
}

export function MarketGroupSeoContent({ group }: MarketGroupSeoContentProps) {
  return (
    <section aria-label={`${group.title} Overview & Research Guide`} className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-12 space-y-8">
      {/* 1. In-Depth Editorial Guide */}
      <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
        <div className="flex items-center gap-2">
          <BookOpen className="size-5 text-primary" />
          <h2 className="font-heading text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-foreground">
            About {group.title} — Dhaka Stock Exchange Analysis
          </h2>
        </div>

        <p className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
          {group.overviewText}
        </p>

        {/* Criteria Checklist */}
        {group.criteriaList && group.criteriaList.length > 0 && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4 sm:p-5 space-y-3">
            <div className="flex items-center gap-2 text-foreground font-semibold text-xs sm:text-sm">
              <ListChecks className="size-4 text-primary" />
              <span>Key DSE Regulatory & Screening Criteria</span>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
              {group.criteriaList.map((criterion, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed">
                  <CheckCircle2 className="size-3.5 text-primary shrink-0 mt-0.5" />
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 2. Group Specific FAQs */}
      {group.faqs && group.faqs.length > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-6 sm:p-8 space-y-6 shadow-2xs">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-primary" />
            <h2 className="font-heading text-lg sm:text-xl font-bold text-foreground">
              Frequently Asked Questions: {group.shortTitle}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {group.faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-border/50 bg-muted/20 p-4 space-y-2"
              >
                <h3 className="font-semibold text-xs sm:text-sm text-foreground flex items-start gap-2">
                  <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                  <span>{faq.q}</span>
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
