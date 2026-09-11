import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function safeDecodeURIComponent(str: string | null | undefined): string {
  if (!str) return ""
  try {
    return decodeURIComponent(str)
  } catch {
    return str
  }
}

export function formatBDT(amount: number | null | undefined, decimals = 2): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "-"
  }
  const isNeg = amount < 0
  const abs = Math.abs(amount).toLocaleString("en-BD", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${isNeg ? "-" : ""}৳${abs}`
}

export function formatCurrency(amount: number | null | undefined, decimals = 2): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "-"
  }
  const isNeg = amount < 0
  const abs = Math.abs(amount).toLocaleString("en-BD", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
  return `${isNeg ? "-" : ""}${abs}`
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
  
  const isNeg = valueMn < 0
  const prefix = isNeg ? "-৳" : "৳"
  const absMn = Math.abs(valueMn)
  if (absMn >= 1000) {
    // 1000 Mn = 100 Crore or 1 Billion
    const cr = absMn / 10 // 1 Crore = 10 Million
    if (cr >= 100) {
      return `${prefix}${(cr / 100).toFixed(2)}k Cr`
    }
    return `${prefix}${cr.toFixed(2)} Cr`
  }
  return `${prefix}${absMn.toFixed(2)} Mn`
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

