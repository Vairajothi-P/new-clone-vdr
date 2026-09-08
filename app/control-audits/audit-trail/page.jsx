"use client";

import React from "react";
import { PageHeader, StatusBadge } from "@/components/controls-audit/shared";
import { ScrollText } from "lucide-react";

export default function AuditTrailPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Enterprise Audit Trail"
        subtitle="Forensic, read-only ledger capturing historical user interactions, document access, security authorizations, and administrative actions."
        breadcrumbs={[{ label: "Audit Trail" }]}
        badge={<StatusBadge status="completed" label="Immutable Ledger" size="sm" />}
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 mb-4">
          <ScrollText size={26} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Audit Trail Forensic Ledger
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
          Phase 1 layout and navigation initialized. The read-only 10-column table, multi-field filters (date, action, result, module), CSV export, and complete audit detail drawer with JSON payloads are staged for Phase 2 implementation.
        </p>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Target: P0 Implementation (Highest Priority)
        </span>
      </div>
    </div>
  );
}
