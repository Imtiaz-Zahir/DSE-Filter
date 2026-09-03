"use client";

import React from "react";
import Link from "next/link";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CompareTrayProps {
  selectedCodes: string[];
  onRemove: (code: string) => void;
  onClear: () => void;
}

export function CompareTray({
  selectedCodes,
  onRemove,
  onClear,
}: CompareTrayProps) {
  if (selectedCodes.length === 0) return null;

  const compareUrl = `/compare?codes=${selectedCodes.map((c) => encodeURIComponent(c)).join(",")}`;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="flex items-center justify-between gap-2 rounded-2xl bg-foreground text-background p-2.5 sm:px-4 shadow-2xl border border-border/20 backdrop-blur-md">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none py-0.5">
          <div className="flex items-center gap-1 shrink-0 text-xs font-semibold mr-1">
            <Scale className="size-4 text-emerald-400" />
            <span className="hidden sm:inline">Compare</span>
            <span>({selectedCodes.length}/4):</span>
          </div>

          <div className="flex items-center gap-1.5 flex-nowrap">
            {selectedCodes.map((code) => (
              <Badge
                key={code}
                variant="secondary"
                className="bg-background/20 text-background hover:bg-background/30 border-0 text-xs py-0.5 pl-2 pr-1 gap-1 shrink-0"
              >
                <span>{code}</span>
                <button
                  onClick={() => onRemove(code)}
                  className="rounded-full p-0.5 hover:bg-background/40"
                  aria-label={`Remove ${code}`}
                >
                  <X className="size-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            variant="ghost"
            size="xs"
            onClick={onClear}
            className="h-7 text-xs text-background/70 hover:text-background hover:bg-background/20 px-2"
          >
            Clear
          </Button>

          <Link href={compareUrl}>
            <Button
              size="sm"
              disabled={selectedCodes.length < 2}
              className="h-7.5 text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 text-white gap-1 px-3"
            >
              <span>Compare</span>
              <ArrowRight className="size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
