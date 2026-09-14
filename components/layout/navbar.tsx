"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { TrendingUp, BarChart3, Scale, Layers, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./theme-toggle";
import { QuickSearch } from "./quick-search";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Screener", icon: BarChart3 },
    { href: "/market", label: "Market Groups", icon: Layers },
    { href: "/compare", label: "Compare", icon: Scale },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-3 sm:px-6">
        {/* Brand Logo & Badges */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm group-hover:scale-105 transition-transform">
              <TrendingUp className="size-4.5" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="font-heading font-bold tracking-tight text-foreground text-base sm:text-lg">
                  DSE<span className="text-primary font-black">Filter</span>
                </span>
                <span className="inline-flex items-center rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <ShieldCheck className="size-2.5 mr-0.5 inline" /> DSES
                </span>
              </div>
              <span className="hidden sm:inline-block text-[10px] text-muted-foreground font-medium -mt-1">
                Dhaka Stock Exchange Screener
              </span>
            </div>
          </Link>

          {/* Desktop Nav links */}
          <nav className="hidden md:flex items-center gap-0.5 lg:gap-1 ml-2 pl-2 lg:ml-4 lg:pl-4 border-l border-border/60">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-1 lg:gap-1.5 px-2 lg:px-3 py-1.5 text-xs font-medium rounded-md transition-colors",
                    isActive
                      ? "bg-secondary text-foreground font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className="size-3.5" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls: Search + Compare + Theme toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <QuickSearch />

          <Link href="/market" className="md:hidden">
            <Button variant="ghost" size="icon-sm" className="size-8 rounded-md" aria-label="Market Groups">
              <Layers className="size-4" />
            </Button>
          </Link>

          <Link href="/compare" className="md:hidden">
            <Button variant="ghost" size="icon-sm" className="size-8 rounded-md" aria-label="Compare stocks">
              <Scale className="size-4" />
            </Button>
          </Link>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
