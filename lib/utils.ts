import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBDT(amount: number | null | undefined, decimals = 2): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "-"
  }
  return `৳${amount.toLocaleString("en-BD", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`
}

export function formatCurrency(amount: number | null | undefined, decimals = 2): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "-"
  }
  return amount.toLocaleString("en-BD", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-"
  }
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatInteger(value: number | null | undefined): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-"
  }
  return value.toLocaleString("en-US")
}

export function formatLargeNumber(valueMn: number | null | undefined): string {
  if (valueMn === null || valueMn === undefined || isNaN(valueMn)) {
    return "-"
  }
  
  // Value is in Million BDT
  const absMn = Math.abs(valueMn)
  if (absMn >= 1000) {
    // 1000 Mn = 100 Crore or 1 Billion
    const cr = valueMn / 10 // 1 Crore = 10 Million
    if (Math.abs(cr) >= 100) {
      return `৳${(cr / 100).toFixed(2)}k Cr`
    }
    return `৳${cr.toFixed(2)} Cr`
  }
  return `৳${valueMn.toFixed(2)} Mn`
}

export function formatPct(value: number | null | undefined, showSign = true, decimals = 2): string {
  if (value === null || value === undefined || isNaN(value)) {
    return "-"
  }
  const prefix = showSign && value > 0 ? "+" : ""
  return `${prefix}${value.toFixed(decimals)}%`
}

export function getChangeColorClass(change: number | null | undefined): string {
  if (change === null || change === undefined || change === 0) {
    return "text-muted-foreground"
  }
  return change > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
}

export function getCategoryBadgeVariant(category: string | null | undefined): "default" | "secondary" | "outline" | "destructive" {
  switch (category?.toUpperCase()) {
    case "A":
      return "default"
    case "B":
      return "secondary"
    case "N":
      return "outline"
    case "Z":
      return "destructive"
    default:
      return "outline"
  }
}

