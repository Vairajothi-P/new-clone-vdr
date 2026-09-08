"use client";

import React from "react";
import { PageHeader, StatusBadge } from "@/components/controls-audit/shared";
import { CheckSquare } from "lucide-react";

export default function ApprovalsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Approvals Workflow Chains"
        subtitle="Track multi-stage approval processes across Legal, Finance, and Deal Owners with verifiable signoffs and overdue escalation states."
        breadcrumbs={[{ label: "Approvals" }]}
        badge={<StatusBadge status="pending" label="5 Pending Action" size="sm" />}
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600 mb-4">
          <CheckSquare size={26} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Approvals Workflow Module
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
          Phase 1 layout and navigation initialized. The multi-step approval timeline (Legal Review → Finance Review → Deal Owner Signoff), overdue tracking, and interactive Approve/Reject modal are staged for Phase 2 implementation.
        </p>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Target: P0 Implementation
        </span>
      </div>
    </div>
  );
}
