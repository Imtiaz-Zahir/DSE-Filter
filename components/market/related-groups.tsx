import React from "react";
import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { MarketGroupDef, getRelatedMarketGroups } from "@/lib/market-groups";
import { Badge } from "@/components/ui/badge";

interface RelatedGroupsProps {
  currentGroup: MarketGroupDef;
}

export function RelatedGroups({ currentGroup }: RelatedGroupsProps) {
  const related = getRelatedMarketGroups(currentGroup);

  if (related.length === 0) return null;

  return (
    <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 mt-10 space-y-4">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <Layers className="size-4.5 text-primary" />
          <h2 className="font-heading text-base sm:text-lg font-bold text-foreground">
            Explore Related Market Categories & Screeners
          </h2>
        </div>
        <Link
          href="/market"
          className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
        >
          <span>All Groups</span>
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {related.map((group) => (
          <Link
            key={group.slug}
            href={`/market/${group.slug}`}
            className="group rounded-xl border border-border/70 bg-card p-4 space-y-2 hover:border-primary/50 hover:bg-muted/30 transition-all shadow-2xs"
          >
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/30 text-primary">
                {group.categoryLabel}
              </Badge>
              <ArrowRight className="size-3.5 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
            </div>
            <h3 className="font-heading text-sm font-bold text-foreground group-hover:text-primary transition-colors">
              {group.shortTitle}
            </h3>
            <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
              {group.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
