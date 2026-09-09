"use client";

import React from "react";
import { AlertCircle, AlertTriangle, Info, ShieldAlert } from "lucide-react";

export default function RiskBadge({
  level = "Low",
  size = "md",
  showDot = true,
  className = "",
}) {
  const normalized = (level || "").toLowerCase().trim();

  const styles = {
    critical: {
      bg: "bg-rose-100/80 border-rose-300 text-rose-800",
      dot: "bg-rose-600 animate-pulse",
      icon: ShieldAlert,
      label: "Critical",
    },
    high: {
      bg: "bg-rose-50 border-rose-200 text-rose-700",
      dot: "bg-rose-500",
      icon: AlertCircle,
      label: "High Risk",
    },
    medium: {
      bg: "bg-amber-50 border-amber-200 text-amber-700",
      dot: "bg-amber-500",
      icon: AlertTriangle,
      label: "Medium Risk",
    },
    low: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-700",
      dot: "bg-emerald-500",
      icon: Info,
      label: "Low Risk",
    },
    policy_violation: {
      bg: "bg-purple-50 border-purple-200 text-purple-700",
      dot: "bg-purple-500",
      icon: ShieldAlert,
      label: "Policy Violation",
    },
    overdue_task: {
      bg: "bg-rose-50 border-rose-200 text-rose-700",
      dot: "bg-rose-500",
      icon: AlertCircle,
      label: "Overdue Task",
    },
  };

  const key = normalized.includes("critical")
    ? "critical"
    : normalized.includes("high")
    ? "high"
    : normalized.includes("medium")
    ? "medium"
    : normalized.includes("policy")
    ? "policy_violation"
    : normalized.includes("overdue")
    ? "overdue_task"
    : "low";

  const current = styles[key];
  const sizeClasses = {
    sm: "px-2 py-0.5 text-[11px] gap-1.5",
    md: "px-2.5 py-1 text-xs gap-1.5",
    lg: "px-3 py-1.5 text-sm gap-2 font-semibold",
  }[size] || "px-2.5 py-1 text-xs gap-1.5";

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border shrink-0 ${current.bg} ${sizeClasses} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${current.dot}`} />
      )}
      <span>{level || current.label}</span>
    </span>
  );
}
