"use client";

import React from "react";
import { PageHeader, StatusBadge } from "@/components/controls-audit/shared";
import { AlertTriangle } from "lucide-react";

export default function RisksAlertsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Risks & Alerts Governance"
        subtitle="Monitor high-impact deal risks, active policy violations, overdue diligence tasks, and mitigation signoff plans."
        breadcrumbs={[{ label: "Risks & Alerts" }]}
        badge={<StatusBadge status="blocked" label="3 High Risks Blocking" size="sm" />}
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 mb-4">
          <AlertTriangle size={26} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Risks & Alerts Management
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
          Phase 1 layout and navigation initialized. Categorized risk cards (High, Medium, Low, Policy Violations, Overdue Tasks), severity filters, and mitigation detail drawer are staged for Phase 3 (P1) implementation.
        </p>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Target: P1 Implementation
        </span>
      </div>
    </div>
  );
}
