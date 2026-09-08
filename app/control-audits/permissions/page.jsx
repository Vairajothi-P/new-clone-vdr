"use client";

import React from "react";
import { PageHeader, StatusBadge } from "@/components/controls-audit/shared";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function PermissionsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Permissions Matrix & Access Grants"
        subtitle="Inspect and manage role-based and user-level resource permissions, inheritance chains, and specific access grants."
        breadcrumbs={[{ label: "Permissions" }]}
        badge={<StatusBadge status="active" label="Role Matrix Active" size="sm" />}
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[var(--brand)] mb-4">
          <KeyRound size={26} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Permissions Matrix Module
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
          Phase 1 layout and navigation initialized. The full dual-view (By Role / By User) matrix with permission source inspection, Allowed/Denied states, and Grant Access drawer is staged for Phase 2 implementation.
        </p>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Target: P0 Implementation
        </span>
      </div>
    </div>
  );
}
