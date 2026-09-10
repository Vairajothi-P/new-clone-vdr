"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CheckSquare,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  MessageSquare,
  ArrowRight,
  Send,
  Calendar,
  AlertOctagon,
  ShieldCheck,
  ChevronRight,
  Filter,
  Search,
  X,
  Sparkles,
} from "lucide-react";
import { useControlsAudit } from "@/components/controls-audit/ControlsAuditContext";
import {
  PageHeader,
  StatusBadge,
} from "@/components/controls-audit/shared";
import ModalPortal from "@/components/ui/ModalPortal";

export default function ApprovalsPage() {
  const {
    approvals,
    approveApprovalStep,
    rejectApprovalStep,
    escalateApprovalStep,
    showToast,
  } = useControlsAudit();

  // Filters & Search
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'pending' | 'approved' | 'rejected' | 'overdue'
  const [searchQuery, setSearchQuery] = useState("");

  // Action Modal State (for Approve / Reject)
  const [activeActionModal, setActiveActionModal] = useState(null); // { type: 'approve' | 'reject', item, step }
  const [commentText, setCommentText] = useState("");
  const [rejectReason, setRejectReason] = useState("");
  const [rejectError, setRejectError] = useState("");

  // Counts for top summary cards
  const totalApprovals = approvals.length;
  const pendingCount = approvals.filter((a) => a.overallStatus === "pending").length;
  const approvedCount = approvals.filter((a) => a.overallStatus === "approved").length;
  const rejectedCount = approvals.filter((a) => a.overallStatus === "rejected").length;
  const overdueCount = approvals.filter(
    (a) =>
      a.overallStatus === "pending" &&
      a.chain.some((s) => s.status === "overdue" || (s.dueDate && new Date(s.dueDate) < new Date()))
  ).length;

  // Filtered approval items
  const filteredApprovals = approvals.filter((item) => {
    // Status filter
    if (filterStatus === "pending" && item.overallStatus !== "pending") return false;
    if (filterStatus === "approved" && item.overallStatus !== "approved") return false;
    if (filterStatus === "rejected" && item.overallStatus !== "rejected") return false;
    if (filterStatus === "overdue") {
      const isOverdue = item.chain.some((s) => s.status === "overdue");
      if (!isOverdue) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchDoc = item.document.toLowerCase().includes(q);
      const matchFolder = item.folder?.toLowerCase().includes(q);
      const matchReq = item.requestedBy?.toLowerCase().includes(q);
      const matchApprover = item.chain.some((s) => s.approver.toLowerCase().includes(q));
      if (!matchDoc && !matchFolder && !matchReq && !matchApprover) return false;
    }

    return true;
  });

  const handleOpenActionModal = (type, item, step) => {
    setActiveActionModal({ type, item, step });
    setCommentText("");
    setRejectReason("");
    setRejectError("");
  };

  const handleConfirmAction = () => {
    if (!activeActionModal) return;
    const { type, item, step } = activeActionModal;

    if (type === "approve") {
      approveApprovalStep(item.id, step.step, commentText);
      setActiveActionModal(null);
    } else if (type === "reject") {
      if (!rejectReason.trim()) {
        setRejectError("A mandatory rejection reason is required under compliance policy.");
        return;
      }
      rejectApprovalStep(item.id, step.step, rejectReason.trim());
      setActiveActionModal(null);
    }
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans space-y-7">
      {/* ── HEADER ── */}
      <PageHeader
        title="Approvals Workflow Chains"
        subtitle="Track multi-stage approval processes across Legal, Finance, and Deal Owners with verifiable signoffs and overdue escalation states."
        badge={
          <StatusBadge
            status={pendingCount > 0 ? "pending" : "completed"}
            label={`${pendingCount} Pending Signoff`}
            size="sm"
          />
        }
      />

      {/* ── A. APPROVAL SUMMARY STATS CARDS ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pending */}
        <div
          onClick={() => setFilterStatus(filterStatus === "pending" ? "all" : "pending")}
          className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex items-center justify-between ${
            filterStatus === "pending"
              ? "border-amber-400 bg-amber-50/30 ring-2 ring-amber-300/50"
              : "border-slate-200/80 hover:border-amber-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Pending Approvals
            </span>
            <div className="text-2xl font-extrabold text-amber-700 tracking-tight">
              {pendingCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Awaiting reviewer signoff</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock size={18} />
          </div>
        </div>

        {/* Overdue */}
        <div
          onClick={() => setFilterStatus(filterStatus === "overdue" ? "all" : "overdue")}
          className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex items-center justify-between ${
            filterStatus === "overdue"
              ? "border-rose-400 bg-rose-50/30 ring-2 ring-rose-300/50"
              : "border-slate-200/80 hover:border-rose-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Overdue Review
            </span>
            <div className="text-2xl font-extrabold text-rose-700 tracking-tight">
              {overdueCount}
            </div>
            <p className="text-[11px] text-rose-600 font-semibold mt-1">Requires escalation</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle size={18} />
          </div>
        </div>

        {/* Approved */}
        <div
          onClick={() => setFilterStatus(filterStatus === "approved" ? "all" : "approved")}
          className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex items-center justify-between ${
            filterStatus === "approved"
              ? "border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-300/50"
              : "border-slate-200/80 hover:border-emerald-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Approved
            </span>
            <div className="text-2xl font-extrabold text-emerald-700 tracking-tight">
              {approvedCount}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Chains 100% verified</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Total Documents */}
        <div
          onClick={() => setFilterStatus("all")}
          className={`bg-white border rounded-2xl p-5 shadow-xs transition-all cursor-pointer flex items-center justify-between ${
            filterStatus === "all"
              ? "border-[var(--brand)] bg-[var(--brand-50)]/30 ring-2 ring-[var(--brand)]/30"
              : "border-slate-200/80 hover:border-slate-300"
          }`}
        >
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Total Chains
            </span>
            <div className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {totalApprovals}
            </div>
            <p className="text-[11px] text-slate-400 mt-1">Governed artifacts</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <CheckSquare size={18} />
          </div>
        </div>
      </div>

      {/* ── TOOLBAR & SEARCH ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search document title, version, or approver..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[var(--brand)] font-medium text-slate-800 placeholder:text-slate-400"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={12} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {["all", "pending", "overdue", "approved"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  filterStatus === st
                    ? "bg-[var(--brand)] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <span className="text-xs font-mono text-slate-400">
          Showing {filteredApprovals.length} of {totalApprovals} workflow chains
        </span>
      </div>

      {/* ── B & C. APPROVAL WORKFLOW CARDS ── */}
      <div className="space-y-6">
        {filteredApprovals.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 rounded-2xl shadow-xs">
            <CheckSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-slate-800 mb-1">No approval chains match filters</h4>
            <p className="text-xs text-slate-500 mb-4">Try clearing your search query or reset status filter.</p>
            <button
              onClick={() => {
                setFilterStatus("all");
                setSearchQuery("");
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredApprovals.map((item) => {
            const isItemApproved = item.overallStatus === "approved";
            const isItemRejected = item.overallStatus === "rejected";
            const hasOverdueStep = item.chain.some((s) => s.status === "overdue");

            return (
              <div
                key={item.id}
                className={`bg-white border rounded-2xl p-6 shadow-xs transition-all space-y-5 ${
                  hasOverdueStep
                    ? "border-rose-300 ring-1 ring-rose-200"
                    : isItemApproved
                    ? "border-emerald-200"
                    : "border-slate-200/80 hover:border-slate-300"
                }`}
              >
                {/* Card Header: Document Name & Version Awareness */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs ${
                        isItemApproved
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : hasOverdueStep
                          ? "bg-rose-50 text-rose-700 border border-rose-200"
                          : "bg-blue-50 text-[var(--brand)] border border-blue-200"
                      }`}
                    >
                      <FileText size={20} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-slate-900 tracking-tight">
                          {item.document}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                          Version: v2.4 (Latest)
                        </span>
                        {item.urgency === "High" && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            High Priority
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Folder: <span className="font-semibold text-slate-700">{item.folder}</span> • Initiated by: {item.requestedBy} on {item.submittedAt.slice(0, 10)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-center">
                    <StatusBadge
                      status={item.overallStatus}
                      label={
                        isItemApproved
                          ? "Chain Approved"
                          : isItemRejected
                          ? "Chain Rejected"
                          : hasOverdueStep
                          ? "Overdue Step"
                          : "Review In Progress"
                      }
                      size="md"
                    />
                  </div>
                </div>

                {/* ── C. MULTI-STEP APPROVAL CHAIN TIMELINE ── */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Sequential Approval Chain ({item.chain.length} steps):
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {item.chain.map((step, idx) => {
                      const isStepApproved = step.status === "approved";
                      const isStepPending = step.status === "pending";
                      const isStepOverdue = step.status === "overdue";
                      const isStepQueued = step.status === "queued";
                      const isStepRejected = step.status === "rejected";

                      return (
                        <div
                          key={step.step}
                          className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
                            isStepApproved
                              ? "bg-emerald-50/40 border-emerald-200"
                              : isStepOverdue
                              ? "bg-rose-50/50 border-rose-300 ring-1 ring-rose-200 shadow-2xs"
                              : isStepPending
                              ? "bg-amber-50/40 border-amber-200 shadow-2xs"
                              : isStepRejected
                              ? "bg-rose-50 border-rose-300"
                              : "bg-slate-50/60 border-slate-200/80 opacity-75"
                          }`}
                        >
                          <div>
                            {/* Step Header */}
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span
                                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                    isStepApproved
                                      ? "bg-emerald-600 text-white"
                                      : isStepOverdue
                                      ? "bg-rose-600 text-white"
                                      : isStepPending
                                      ? "bg-amber-500 text-white"
                                      : "bg-slate-300 text-slate-600"
                                  }`}
                                >
                                  {isStepApproved ? "✓" : step.step}
                                </span>
                                <h4 className="text-xs font-bold text-slate-900">
                                  {step.stepName}
                                </h4>
                              </div>
                              <StatusBadge
                                status={step.status}
                                size="sm"
                                label={
                                  isStepApproved
                                    ? "Approved"
                                    : isStepOverdue
                                    ? "Overdue"
                                    : isStepPending
                                    ? "Pending Action"
                                    : isStepQueued
                                    ? "Queued"
                                    : "Rejected"
                                }
                              />
                            </div>

                            {/* Approver Details */}
                            <div className="flex items-center gap-2.5 my-2">
                              <div className="w-7 h-7 rounded-lg bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center shrink-0">
                                {step.approverAvatar}
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-900 truncate">
                                  {step.approver}
                                </p>
                                <p className="text-[10px] text-slate-400 truncate">{step.role}</p>
                              </div>
                            </div>

                            {/* Comment or Due Date */}
                            <div className="text-[11px] text-slate-600 bg-white/80 p-2.5 rounded-lg border border-slate-200/60 leading-relaxed mt-2">
                              {step.comment ? (
                                <p className="italic">"{step.comment}"</p>
                              ) : step.dueDate ? (
                                <p className={isStepOverdue ? "text-rose-700 font-bold" : "text-slate-500"}>
                                  Due: {step.dueDate.slice(0, 10)} {isStepOverdue && "(3 days overdue)"}
                                </p>
                              ) : (
                                <p className="text-slate-400">Awaiting prior step signoff</p>
                              )}
                            </div>
                          </div>

                          {/* Action Bar for Pending / Overdue Step */}
                          {(isStepPending || isStepOverdue) && (
                            <div className="mt-4 pt-3 border-t border-slate-200/70 flex items-center justify-between gap-2">
                              {isStepOverdue && (
                                <button
                                  onClick={() => escalateApprovalStep(item.id, step.step)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  Escalate
                                </button>
                              )}
                              <div className="flex items-center gap-2 ml-auto">
                                <button
                                  onClick={() => handleOpenActionModal("reject", item, step)}
                                  className="px-2.5 py-1 text-[11px] font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-lg transition-colors cursor-pointer"
                                >
                                  Reject
                                </button>
                                <button
                                  onClick={() => handleOpenActionModal("approve", item, step)}
                                  className="px-3 py-1 text-[11px] font-bold text-white bg-[var(--brand)] hover:bg-[var(--brand-dark)] rounded-lg shadow-2xs transition-colors cursor-pointer"
                                >
                                  Approve
                                </button>
                              </div>
                            </div>
                          )}

                          {isStepApproved && step.signedAt && (
                            <div className="mt-3 pt-2 text-[10px] text-emerald-700 font-mono flex items-center justify-between border-t border-emerald-200/60">
                              <span>Signed digitally</span>
                              <span>{step.signedAt.slice(0, 10)}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── ACTION MODAL: APPROVE / REJECT CONFIRMATION ── */}
      {activeActionModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 font-sans">
            <div
              onClick={() => setActiveActionModal(null)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            />
            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
                    activeActionModal.type === "approve"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : "bg-rose-50 text-rose-600 border border-rose-200"
                  }`}
                >
                  {activeActionModal.type === "approve" ? (
                    <CheckCircle2 size={22} />
                  ) : (
                    <XCircle size={22} />
                  )}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {activeActionModal.type === "approve" ? "Authorize Document Approval" : "Reject Document Approval"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {activeActionModal.item.document} • Step {activeActionModal.step.step}: {activeActionModal.step.stepName}
                  </p>
                </div>
              </div>

              {activeActionModal.type === "approve" ? (
                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    By confirming, you record an authorized digital signature on this version under compliance policy. This action will log an immutable audit record.
                  </p>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Approval Commentary (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add compliance notes or conditions..."
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:border-[var(--brand)]"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <p className="text-rose-700 leading-relaxed font-semibold">
                    Policy Pol-003 requires a detailed explanation when rejecting an approval step.
                  </p>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Mandatory Rejection Reason *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={rejectReason}
                      onChange={(e) => {
                        setRejectReason(e.target.value);
                        if (rejectError) setRejectError("");
                      }}
                      placeholder="Specify deficiency, missing schedule, or contract clause issue..."
                      className="w-full px-3 py-2 bg-rose-50/40 border border-rose-200 rounded-xl font-medium text-slate-800 focus:bg-white focus:border-rose-500"
                    />
                    {rejectError && (
                      <p className="text-rose-600 font-bold text-[11px] mt-1">{rejectError}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 text-xs">
                <button
                  type="button"
                  onClick={() => setActiveActionModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmAction}
                  className={`px-4 py-2 font-bold rounded-xl shadow-xs transition-colors cursor-pointer ${
                    activeActionModal.type === "approve"
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-rose-600 hover:bg-rose-700 text-white"
                  }`}
                >
                  {activeActionModal.type === "approve" ? "Confirm Approval" : "Confirm Rejection"}
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
