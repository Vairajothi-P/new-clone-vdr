"use client";

import React from "react";
import { ShieldCheck } from "lucide-react";

export default function ControlsAuditHeader({
  selectedDealId,
  onSelectDeal,
  selectedWorkspaceId,
  onSelectWorkspace,
}) {
  return (
    <header className="bg-white border-b border-slate-200/80 px-6 lg:px-8 py-3.5 shrink-0 font-sans shadow-[0_1px_3px_rgba(0,0,0,0.02)] z-30">
      <div className="flex items-center justify-between">
        {/* Brand / Module Identifier */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-secondary)] flex items-center justify-center text-white shadow-md shadow-[var(--brand)]/20 shrink-0">
            <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base lg:text-lg font-extrabold text-slate-900 tracking-tight">
                Controls & Audit
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--brand-50)] text-[var(--brand)] border border-[var(--brand)]/20">
                DMS Governance
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Enterprise compliance, stage progression & immutable audit ledger
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
