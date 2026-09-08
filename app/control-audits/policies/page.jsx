"use client";

import React from "react";
import { PageHeader, StatusBadge } from "@/components/controls-audit/shared";
import { Shield } from "lucide-react";

export default function PoliciesPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Governance Policies"
        subtitle="Review, enforce, and manage compliance rules governing document access, external sharing, stage gates, and approval standards."
        breadcrumbs={[{ label: "Policies" }]}
        badge={<StatusBadge status="active" label="5 Active Policies" size="sm" />}
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 mb-4">
          <Shield size={26} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Governance Policies Module
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
          Phase 1 layout and navigation initialized. The policy rule catalog, scope tags, toggle enable/disable controls, and Create Policy modal are staged for Phase 3 (P1) implementation.
        </p>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Target: P1 Implementation
        </span>
      </div>
    </div>
  );
}
