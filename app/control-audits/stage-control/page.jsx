"use client";

import React from "react";
import { PageHeader, StatusBadge } from "@/components/controls-audit/shared";
import { Milestone } from "lucide-react";

export default function StageControlPage() {
  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full">
      <PageHeader
        title="Stage & Gate Control"
        subtitle="Manage deal stage transitions, enforce gate satisfaction rules across documents, tasks, risks, and approvals, and control advancement."
        breadcrumbs={[{ label: "Stage Control" }]}
        badge={<StatusBadge status="in_progress" label="Stage 3: Negotiation" size="sm" />}
      />

      <div className="bg-white border border-slate-200/80 rounded-2xl p-8 shadow-xs text-center flex flex-col items-center justify-center min-h-[360px]">
        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-[var(--brand)] mb-4">
          <Milestone size={26} />
        </div>
        <h3 className="text-base font-bold text-slate-800 mb-1">
          Stage & Gate Advancement Controller
        </h3>
        <p className="text-xs text-slate-500 max-w-md mb-4 leading-relaxed">
          Phase 1 layout and navigation initialized. The 6-stage stepper with explicit gate satisfaction sources (Documents, Tasks, Risks, Approvals) and conditional "Request to Advance Stage" behavior is staged for Phase 2 implementation.
        </p>
        <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
          Target: P0 Implementation
        </span>
      </div>
    </div>
  );
}
