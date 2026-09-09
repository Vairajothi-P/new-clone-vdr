"use client";

import React from "react";
import { PageHeader, StatusBadge } from "@/components/controls-audit/shared";
import { BarChart3 } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Compliance & Governance Reports"
        subtitle="Generate, preview, and export formal diligence intelligence packages, access logs, engagement heatmaps, and approval trails."
        breadcrumbs={[{ label: "Reports" }]}
        badge={<StatusBadge status="completed" label="4 Standard Reports" size="sm" />}
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-[var(--brand)] mb-4">
          <BarChart3 size={26} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Governance & Compliance Reports
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
          Phase 1 layout and navigation initialized. The 4 core reports (Document Access, Buyer Engagement Heatmap, Approval Trail, Denied Access), filter toolbar, interactive previews, and CSV/PDF export actions are staged for Phase 4 (P2) implementation.
        </p>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Target: P2 Implementation
        </span>
      </div>
    </div>
  );
}
