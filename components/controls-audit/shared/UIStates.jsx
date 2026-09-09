"use client";

import React from "react";
import { Loader2, Inbox, AlertTriangle, Lock, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";

export function LoadingState({ message = "Loading data...", minHeight = "min-h-[280px]" }) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${minHeight} text-center`}>
      <div className="w-10 h-10 border-3 border-[var(--brand)]/20 border-t-[var(--brand)] rounded-full animate-spin mb-3"></div>
      <p className="text-xs font-semibold text-slate-500">{message}</p>
    </div>
  );
}

export function EmptyState({
  icon: Icon = Inbox,
  title = "No records found",
  description = "No items match your active filters or query. Try resetting filters.",
  actionLabel = null,
  onAction = null,
  minHeight = "min-h-[300px]",
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${minHeight} text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white`}>
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Icon size={22} />
      </div>
      <h4 className="text-sm font-bold text-slate-800 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" onClick={onAction} className="text-xs py-2 px-4">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Unable to load data",
  message = "An error occurred while fetching governance records. Please try again.",
  onRetry = null,
  minHeight = "min-h-[280px]",
}) {
  return (
    <div className={`flex flex-col items-center justify-center p-8 ${minHeight} text-center border border-rose-200 rounded-2xl bg-rose-50/50`}>
      <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
        <AlertTriangle size={22} />
      </div>
      <h4 className="text-sm font-bold text-rose-900 mb-1">{title}</h4>
      <p className="text-xs text-rose-600 max-w-sm mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
        >
          <RefreshCw size={13} />
          <span>Retry</span>
        </button>
      )}
    </div>
  );
}

export function NoAccessState({
  title = "Access Restricted",
  message = "Your current role does not have security clearance for this governance section.",
  onBack = null,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 min-h-[400px] text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
        <Lock size={26} />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1.5">{title}</h3>
      <p className="text-xs text-slate-500 max-w-md mb-6 leading-relaxed">{message}</p>
      {onBack && (
        <button
          onClick={onBack}
          className="px-5 py-2.5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
        >
          Return to Overview
        </button>
      )}
    </div>
  );
}
