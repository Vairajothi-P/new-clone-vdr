// lib/workspaces/formatters.js
// =====================================================
// Production formatting helpers for workspace cards & stats
// =====================================================

import { CURRENCIES } from "./constants";

/**
 * Formats numeric deal value with currency code/symbol
 * Example: 50000000, USD -> "$50,000,000 USD"
 */
export function formatDealValue(val, currencyCode = "USD") {
  if (val === "" || val === null || val === undefined) {
    return "-";
  }
  const num = Number(val);
  if (isNaN(num)) return "-";

  const curr = CURRENCIES.find((c) => c.code === currencyCode) || { symbol: "$", code: currencyCode };
  const formattedNum = new Intl.NumberFormat("en-US").format(num);
  return `${curr.symbol}${formattedNum} ${curr.code}`;
}

/**
 * Formats date string into readable calendar format
 * Example: "2026-12-31" -> "Dec 31, 2026"
 */
export function formatExpiryDate(dateStr) {
  if (!dateStr) return "No Expiry";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const [year, month, day] = parts;
      const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
      return dateObj.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    }
    const dateObj = new Date(dateStr);
    if (isNaN(dateObj.getTime())) return dateStr;
    return dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch (e) {
    return dateStr;
  }
}

/**
 * Computes badge status based on expiry date
 * Returns { label, colorClass, bgClass }
 */
export function getExpiryStatus(dateStr) {
  if (!dateStr) {
    return {
      label: "Active Vault",
      colorClass: "text-emerald-700",
      bgClass: "bg-emerald-50 border-emerald-200/80",
      dotClass: "bg-emerald-500",
    };
  }

  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);

  if (isNaN(expiry.getTime())) {
    return {
      label: "Active Vault",
      colorClass: "text-emerald-700",
      bgClass: "bg-emerald-50 border-emerald-200/80",
      dotClass: "bg-emerald-500",
    };
  }

  const diffDays = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: "Expired",
      colorClass: "text-rose-700",
      bgClass: "bg-rose-50 border-rose-200/80",
      dotClass: "bg-rose-500",
    };
  } else if (diffDays <= 14) {
    return {
      label: `Expiring in ${diffDays}d`,
      colorClass: "text-amber-700",
      bgClass: "bg-amber-50 border-amber-200/80",
      dotClass: "bg-amber-500",
    };
  }

  return {
    label: "Active Vault",
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-50 border-emerald-200/80",
    dotClass: "bg-emerald-500",
  };
}
