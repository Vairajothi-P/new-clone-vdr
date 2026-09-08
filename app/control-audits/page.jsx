"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Milestone,
  CheckSquare,
  AlertTriangle,
  Shield,
  KeyRound,
  ScrollText,
  Clock,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Code2,
} from "lucide-react";
import {
  getControlsAuditOverviewKPIs,
  MOCK_AUDIT_LOGS,
  MOCK_RISKS,
  MOCK_APPROVALS,
} from "@/lib/mock-controls-audit-data";
import {
  PageHeader,
  StatusBadge,
  RiskBadge,
  AuditEventRow,
  FilterBar,
  DetailDrawer,
  LoadingState,
  EmptyState,
  ErrorState,
} from "@/components/controls-audit/shared";

export default function ControlsAuditOverviewPage() {
  const kpis = getControlsAuditOverviewKPIs("deal-acme-001");
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);
  const [activeTab, setActiveTab] = useState("overview"); // 'overview' | 'shared_components'
  const [filterSearch, setFilterSearch] = useState("");
  const [filterResult, setFilterResult] = useState("all");

  const recentLogs = MOCK_AUDIT_LOGS.slice(0, 4);

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans space-y-8">
      {/* Top Banner / Phase 1 Status */}
      <div className="bg-gradient-to-r from-[var(--brand)]/10 via-[var(--brand-secondary)]/10 to-transparent border border-[var(--brand)]/20 rounded-2xl p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-white border border-[var(--brand)]/30 text-[var(--brand)] flex items-center justify-center shrink-0 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">
                Phase 1 Architecture Initialized
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified Ready
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Controls & Audit module layout, horizontal navigation, context header, shared components layer, and centralized mock data ready for page implementation.
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shrink-0">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "overview"
                ? "bg-[var(--brand)] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            KPI Architecture
          </button>
          <button
            onClick={() => setActiveTab("shared_components")}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeTab === "shared_components"
                ? "bg-[var(--brand)] text-white shadow-2xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Shared Components Layer
          </button>
        </div>
      </div>

      {activeTab === "overview" ? (
        <>
          {/* Header & Page Subtitle */}
          <PageHeader
            title="Governance & Stage Overview"
            subtitle="Real-time transaction compliance metrics, gate blocker tracking, and immutable audit telemetry."
            badge={
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry Active
              </span>
            }
          />

          {/* ── 6 OVERVIEW KPI CARDS ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* 1. Stage Progress */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Stage Progress
                </span>
                <span className="w-8 h-8 rounded-lg bg-blue-50 text-[var(--brand)] flex items-center justify-center">
                  <Milestone size={16} />
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.stageProgress.display}
                </div>
                <div className="mt-2.5">
                  <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                    <span>{kpis.stageProgress.currentStageName}</span>
                    <span className="text-[var(--brand)]">{kpis.stageProgress.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[var(--brand)] rounded-full transition-all duration-500"
                      style={{ width: `${kpis.stageProgress.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <StatusBadge status="in_progress" size="sm" />
                <Link
                  href="/control-audits/stage-control"
                  className="text-slate-400 group-hover:text-[var(--brand)] transition-colors inline-flex items-center gap-0.5 font-semibold"
                >
                  <span>Gates</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* 2. Tasks Gated */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Tasks Gated
                </span>
                <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <CheckSquare size={16} />
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.tasksGated.count}
                </div>
                <p className="text-xs text-rose-600 font-semibold mt-1">
                  {kpis.tasksGated.subtitle}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <StatusBadge status="blocked" label="Milestone Gated" size="sm" />
                <Link
                  href="/control-audits/stage-control"
                  className="text-slate-400 group-hover:text-[var(--brand)] transition-colors inline-flex items-center gap-0.5 font-semibold"
                >
                  <span>Review</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* 3. Approvals Pending */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Approvals
                </span>
                <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Clock size={16} />
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.approvalsPending.count}
                </div>
                <p className="text-xs text-amber-600 font-semibold mt-1">
                  {kpis.approvalsPending.subtitle}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <StatusBadge status="pending" label="Chains Active" size="sm" />
                <Link
                  href="/control-audits/approvals"
                  className="text-slate-400 group-hover:text-[var(--brand)] transition-colors inline-flex items-center gap-0.5 font-semibold"
                >
                  <span>Approve</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* 4. Policy Violations */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Violations
                </span>
                <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Shield size={16} />
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.policyViolations.count}
                </div>
                <p className="text-xs text-purple-600 font-semibold mt-1">
                  {kpis.policyViolations.subtitle}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <StatusBadge status="flagged" label="Audit Flag" size="sm" />
                <Link
                  href="/control-audits/policies"
                  className="text-slate-400 group-hover:text-[var(--brand)] transition-colors inline-flex items-center gap-0.5 font-semibold"
                >
                  <span>Policies</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* 5. High Risks */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  High Risks
                </span>
                <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.highRisks.count}
                </div>
                <p className="text-xs text-rose-600 font-semibold mt-1">
                  {kpis.highRisks.subtitle}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <RiskBadge level="High" size="sm" />
                <Link
                  href="/control-audits/risks-alerts"
                  className="text-slate-400 group-hover:text-[var(--brand)] transition-colors inline-flex items-center gap-0.5 font-semibold"
                >
                  <span>Mitigate</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>

            {/* 6. Access Requests */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Access Requests
                </span>
                <span className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <KeyRound size={16} />
                </span>
              </div>
              <div>
                <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  {kpis.accessRequests.count}
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1">
                  {kpis.accessRequests.subtitle}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <StatusBadge status="pending" label="8 In Queue" size="sm" />
                <Link
                  href="/control-audits/permissions"
                  className="text-slate-400 group-hover:text-[var(--brand)] transition-colors inline-flex items-center gap-0.5 font-semibold"
                >
                  <span>Review</span>
                  <ArrowRight size={11} />
                </Link>
              </div>
            </div>
          </div>

          {/* ── CENTRAL DASHBOARD PREVIEW ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* LEFT: Stage & Gate Summary */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Milestone className="w-4 h-4 text-[var(--brand)]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Stage 3: Negotiation Gate Status
                    </h3>
                  </div>
                  <StatusBadge status="blocked" label="Advancement Blocked" size="sm" />
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Movement to Stage 4 (Approvals) requires satisfaction of all 4 source-linked gate conditions:
                </p>

                <div className="space-y-3">
                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-900">✓ All documents requested</p>
                      <p className="text-[11px] text-emerald-700">18 of 18 disclosure files verified</p>
                    </div>
                    <StatusBadge status="completed" size="sm" />
                  </div>

                  <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-emerald-900">✓ Critical tasks completed</p>
                      <p className="text-[11px] text-emerald-700">24 of 24 milestone checklist tasks signed</p>
                    </div>
                    <StatusBadge status="completed" size="sm" />
                  </div>

                  <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-rose-900">⚠ Risks reviewed (2/5)</p>
                      <p className="text-[11px] text-rose-700">3 high risks block advancement</p>
                    </div>
                    <StatusBadge status="blocked" label="Blocked" size="sm" />
                  </div>

                  <div className="p-3 rounded-xl border border-amber-200 bg-amber-50/50 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-amber-900">⚠ Approvals obtained (1/3)</p>
                      <p className="text-[11px] text-amber-700">Finance & Deal Owner pending</p>
                    </div>
                    <StatusBadge status="pending" label="Pending" size="sm" />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Gate Evaluation: 2/4 Passed</span>
                <Link
                  href="/control-audits/stage-control"
                  className="px-3.5 py-1.5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>Open Stage Control</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* CENTER: Permissions Overview Snapshot */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-[var(--brand)]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Permissions & Inheritance Model
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-slate-400">8 Roles Configured</span>
                </div>
                <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                  Hierarchical access flow enforced: Role → Permission Set → Resource → User inheritance.
                </p>

                <div className="space-y-2.5">
                  {[
                    { role: "Seller Admin", users: 2, badge: "allowed", note: "Unrestricted deal management" },
                    { role: "Seller Legal", users: 3, badge: "allowed", note: "Contracts & disclosure editing" },
                    { role: "Buyer Admin", users: 2, badge: "allowed", note: "Diligence team management" },
                    { role: "Buyer Legal", users: 5, badge: "allowed", note: "Q&A, redline inquiries" },
                    { role: "External Advisor", users: 3, badge: "pending", note: "Watermarked view, no downloads" },
                    { role: "Guest User", users: 1, badge: "denied", note: "Strictly limited temporary access" },
                  ].map((r, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 transition-colors border border-slate-100"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-800">{r.role}</span>
                        <span className="text-[11px] text-slate-400 ml-2">({r.users} users)</span>
                        <p className="text-[10px] text-slate-500">{r.note}</p>
                      </div>
                      <StatusBadge status={r.badge} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Inheritance: Active</span>
                <Link
                  href="/control-audits/permissions"
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>Open Permissions Matrix</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            {/* RIGHT: Latest Audit Events */}
            <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <ScrollText className="w-4 h-4 text-[var(--brand)]" />
                    <h3 className="text-sm font-bold text-slate-900">
                      Audit Trail — Latest Activity
                    </h3>
                  </div>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                    Live Feed
                  </span>
                </div>
                <p className="text-xs text-slate-500 mb-3 leading-relaxed">
                  Recent forensic events recorded in immutable ledger. Click any event to inspect:
                </p>

                <div className="space-y-2.5">
                  {recentLogs.map((log) => (
                    <AuditEventRow
                      key={log.id}
                      event={log}
                      layout="feed"
                      onClick={(e) => setSelectedAuditLog(e)}
                    />
                  ))}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400 font-mono">Immutable Ledger</span>
                <Link
                  href="/control-audits/audit-trail"
                  className="px-3.5 py-1.5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5"
                >
                  <span>View Full Audit Table</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* ── SHARED COMPONENTS SHOWCASE ── */
        <div className="space-y-8 animate-in fade-in">
          <PageHeader
            title="Shared Components Layer"
            subtitle="Reusable enterprise design building blocks located in components/controls-audit/shared/"
            breadcrumbs={[{ label: "Shared Layer Showcase" }]}
          />

          {/* 1. StatusBadge States */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              1. StatusBadge States (`StatusBadge.jsx`)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Supports allowed, denied, completed, blocked, pending, in_progress, overdue, locked, na, and more:
            </p>
            <div className="flex flex-wrap gap-2.5 items-center">
              <StatusBadge status="allowed" />
              <StatusBadge status="denied" />
              <StatusBadge status="completed" />
              <StatusBadge status="blocked" />
              <StatusBadge status="pending" />
              <StatusBadge status="in_progress" />
              <StatusBadge status="overdue" />
              <StatusBadge status="locked" />
              <StatusBadge status="na" />
              <StatusBadge status="success" />
              <StatusBadge status="flagged" />
            </div>
          </div>

          {/* 2. RiskBadge States */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              2. RiskBadge Severity Levels (`RiskBadge.jsx`)
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Severity chips with active indicator dots:
            </p>
            <div className="flex flex-wrap gap-2.5 items-center">
              <RiskBadge level="Critical" />
              <RiskBadge level="High" />
              <RiskBadge level="Medium" />
              <RiskBadge level="Low" />
              <RiskBadge level="Policy Violation" />
              <RiskBadge level="Overdue Task" />
            </div>
          </div>

          {/* 3. FilterBar */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900">
              3. FilterBar Component (`FilterBar.jsx`)
            </h3>
            <FilterBar
              searchQuery={filterSearch}
              onSearchChange={setFilterSearch}
              searchPlaceholder="Filter across audit events, risks, or policies..."
              filters={[
                {
                  key: "result",
                  value: filterResult,
                  onChange: setFilterResult,
                  options: [
                    { label: "All Results", value: "all" },
                    { label: "Success Only", value: "success" },
                    { label: "Denied Only", value: "denied" },
                    { label: "Flagged Only", value: "flagged" },
                  ],
                },
              ]}
              hasActiveFilters={filterSearch !== "" || filterResult !== "all"}
              onResetFilters={() => {
                setFilterSearch("");
                setFilterResult("all");
              }}
              rightActions={
                <button className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors">
                  Export Log
                </button>
              }
            />
          </div>

          {/* 4. Audit Table Sample */}
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">
                4. AuditEventRow Sample (`AuditEventRow.jsx`)
              </h3>
              <span className="text-xs text-slate-400">Click any row to open DetailDrawer</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-4 py-3">User</th>
                    <th className="px-4 py-3">Action</th>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Deal</th>
                    <th className="px-4 py-3">Result</th>
                    <th className="px-4 py-3">Date & Time</th>
                    <th className="px-4 py-3">IP Address</th>
                    <th className="px-4 py-3">Device</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_AUDIT_LOGS.slice(0, 3).map((log) => (
                    <AuditEventRow
                      key={log.id}
                      event={log}
                      onClick={(e) => setSelectedAuditLog(e)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. UIStates Showcase */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 mb-2">LoadingState</h4>
              <LoadingState message="Deriving telemetry..." minHeight="min-h-[160px]" />
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 mb-2">EmptyState</h4>
              <EmptyState
                title="No items found"
                description="Your search returned 0 items."
                actionLabel="Clear Filter"
                onAction={() => {}}
                minHeight="min-h-[160px]"
              />
            </div>

            <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs">
              <h4 className="text-xs font-bold text-slate-700 mb-2">ErrorState</h4>
              <ErrorState
                title="Telemetry Offline"
                message="Unable to verify hash ledger."
                onRetry={() => {}}
                minHeight="min-h-[160px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* ── AUDIT LOG DETAIL DRAWER ── */}
      <DetailDrawer
        isOpen={!!selectedAuditLog}
        onClose={() => setSelectedAuditLog(null)}
        title="Audit Record Details"
        subtitle="Immutable transaction event preserved in compliance ledger"
        badge={
          selectedAuditLog && (
            <StatusBadge status={selectedAuditLog.result} size="sm" />
          )
        }
        footer={
          <div className="flex items-center justify-between w-full text-xs">
            <span className="font-mono text-slate-400">
              Verified: {selectedAuditLog?.metadata?.checksum || "sha256:verified"}
            </span>
            <button
              onClick={() => setSelectedAuditLog(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        }
      >
        {selectedAuditLog && (
          <div className="space-y-5 text-xs">
            {/* Header info */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Event ID:</span>
                <span className="font-mono font-bold text-slate-800">{selectedAuditLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Action:</span>
                <span className="font-bold text-slate-900">{selectedAuditLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Resource:</span>
                <span className="font-semibold text-slate-800">{selectedAuditLog.resource}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Timestamp:</span>
                <span className="font-mono text-slate-600">{selectedAuditLog.timestamp}</span>
              </div>
            </div>

            {/* Actor Details */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Actor & Authentication
              </h4>
              <div className="p-3 border border-slate-200 rounded-xl space-y-1.5">
                <p className="font-bold text-slate-800">{selectedAuditLog.user}</p>
                <p className="text-slate-500">{selectedAuditLog.userEmail}</p>
                <p className="text-slate-600 font-medium">
                  Role: <span className="text-[var(--brand)]">{selectedAuditLog.userRole}</span>
                </p>
                <p className="text-slate-400 font-mono text-[11px]">
                  IP: {selectedAuditLog.ip} • Device: {selectedAuditLog.device}
                </p>
              </div>
            </div>

            {/* Policy/Permission Decision */}
            {selectedAuditLog.permissionDecision && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Governance & Policy Decision
                </h4>
                <div className="p-3 border border-slate-200 rounded-xl space-y-1 bg-slate-50/50">
                  <p className="font-semibold text-slate-800">
                    Rule: {selectedAuditLog.permissionDecision.rule}
                  </p>
                  <p className="text-slate-600">
                    Verdict: <span className="font-bold">{selectedAuditLog.permissionDecision.verdict}</span>
                  </p>
                  {selectedAuditLog.permissionDecision.reason && (
                    <p className="text-rose-600 font-medium text-[11px]">
                      Reason: {selectedAuditLog.permissionDecision.reason}
                    </p>
                  )}
                  {selectedAuditLog.permissionDecision.watermarkText && (
                    <p className="text-slate-500 font-mono text-[10px]">
                      Watermark: {selectedAuditLog.permissionDecision.watermarkText}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Raw JSON Payload */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 size={13} />
                  <span>Immutable JSON Payload</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Read Only</span>
              </div>
              <pre className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {JSON.stringify(selectedAuditLog.jsonPayload || selectedAuditLog, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
