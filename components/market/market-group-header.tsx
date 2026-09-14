import React from "react";
import Link from "next/link";
import {
  ChevronRight,
  Home,
  ShieldCheck,
  Building2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Percent,
  PieChart,
  Gem,
  Shield,
  Users,
  Landmark,
  Crown,
  Boxes,
  Flame,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  HeartPulse,
  Laptop,
  Wrench,
  Zap,
  Shirt,
  Utensils,
  Building,
  Layers,
  Radio,
  Sparkle,
  Footprints,
  FileText,
  Plane,
  Trees,
  Scale,
  SlidersHorizontal,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketGroupDef } from "@/lib/market-groups";

interface MarketGroupHeaderProps {
  group: MarketGroupDef;
  stockCount: number;
  totalMarketStocks: number;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  ShieldCheck,
  Building2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Activity,
  CheckCircle2,
  AlertOctagon,
  Percent,
  PieChart,
  Gem,
  Shield,
  Users,
  Landmark,
  Crown,
  Boxes,
  Flame,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  HeartPulse,
  Laptop,
  Wrench,
  Zap,
  Shirt,
  Utensils,
  Building,
  Layers,
  Radio,
  Sparkle,
  Footprints,
  FileText,
  Plane,
  Trees,
};

export function MarketGroupHeader({
  group,
  stockCount,
  totalMarketStocks,
}: MarketGroupHeaderProps) {
  const IconComponent = ICON_MAP[group.icon] || BarChart3;

  return (
    <div className="w-full bg-gradient-to-b from-muted/40 via-background to-background border-b border-border/60">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 pt-4 pb-6 sm:pt-6 sm:pb-8 space-y-4">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="size-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <Link
            href="/market"
            className="hover:text-foreground transition-colors"
          >
            Market Groups
          </Link>
          <ChevronRight className="size-3 text-muted-foreground/60" />
          <span className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-none">
            {group.shortTitle}
          </span>
        </nav>

        {/* Hero Title & Description */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="space-y-2.5 max-w-3xl">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-xs px-2.5 py-0.5 border-primary/30 text-primary font-semibold">
                {group.categoryLabel}
              </Badge>
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {stockCount} {stockCount === 1 ? "Company" : "Companies"}
              </span>
              <span className="text-xs text-muted-foreground">
                ({((stockCount / (totalMarketStocks || 1)) * 100).toFixed(0)}% of DSE)
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex size-10 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-2xs">
                <IconComponent className="size-5 sm:size-6" />
              </div>
              <h1 className="font-heading text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-foreground">
                {group.title}
              </h1>
            </div>

            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {group.description}
            </p>
          </div>

          {/* Action Links */}
          <div className="flex items-center gap-2 shrink-0 pt-1 lg:pt-0">
            <Button
              variant="outline"
              size="sm"
              className="h-8.5 text-xs gap-1.5 shadow-2xs"
              render={<Link href="/market" />}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>All Market Groups</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              className="h-8.5 text-xs gap-1.5 shadow-2xs"
              render={<Link href="/compare" />}
            >
              <Scale className="size-3.5" />
              <span>Compare</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
