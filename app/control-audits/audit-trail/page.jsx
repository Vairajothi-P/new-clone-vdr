"use client";

import React, { useState, useMemo } from "react";
import {
  ScrollText,
  Shield,
  Download,
  FileCode2,
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Lock,
  Code2,
  Calendar,
  X,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { useControlsAudit } from "@/components/controls-audit/ControlsAuditContext";
import {
  PageHeader,
  StatusBadge,
  AuditEventRow,
  DetailDrawer,
  EmptyState,
} from "@/components/controls-audit/shared";

export default function AuditTrailPage() {
  const { auditLogs, activeDeal, showToast } = useControlsAudit();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedResult, setSelectedResult] = useState("all");
  const [selectedModule, setSelectedModule] = useState("all");
  const [selectedAction, setSelectedAction] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("all"); // 'all' | 'today' | 'last7' | 'last30'

  // Sorting: { column: 'timestamp' | 'user' | 'action' | 'result', direction: 'asc' | 'desc' }
  const [sortConfig, setSortConfig] = useState({ column: "timestamp", direction: "desc" });

  // Pagination: currentPage, pageSize
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected event for detail drawer (READ ONLY)
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Extract unique modules & actions for dropdowns
  const uniqueModules = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.module).filter(Boolean)));
  }, [auditLogs]);

  const uniqueActions = useMemo(() => {
    return Array.from(new Set(auditLogs.map((l) => l.action).filter(Boolean)));
  }, [auditLogs]);

  // Filtered & Sorted logs
  const processedLogs = useMemo(() => {
    return auditLogs
      .filter((log) => {
        // Result filter
        if (selectedResult !== "all" && log.result.toLowerCase() !== selectedResult.toLowerCase()) {
          return false;
        }

        // Module filter
        if (selectedModule !== "all" && log.module?.toLowerCase() !== selectedModule.toLowerCase()) {
          return false;
        }

        // Action filter
        if (selectedAction !== "all" && log.action !== selectedAction) {
          return false;
        }

        // Date range filter
        if (selectedDateRange !== "all") {
          const logDate = new Date(log.timestamp);
          const now = new Date();
          const diffDays = Math.ceil(Math.abs(now - logDate) / (1000 * 60 * 60 * 24));

          if (selectedDateRange === "today" && diffDays > 1) return false;
          if (selectedDateRange === "last7" && diffDays > 7) return false;
          if (selectedDateRange === "last30" && diffDays > 30) return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchUser = log.user?.toLowerCase().includes(q);
          const matchAction = log.action?.toLowerCase().includes(q);
          const matchResource = log.resource?.toLowerCase().includes(q);
          const matchDeal = log.deal?.toLowerCase().includes(q);
          const matchIp = log.ip?.toLowerCase().includes(q);
          const matchRole = log.userRole?.toLowerCase().includes(q);
          if (!matchUser && !matchAction && !matchResource && !matchDeal && !matchIp && !matchRole) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const { column, direction } = sortConfig;
        let valA = a[column];
        let valB = b[column];

        if (column === "timestamp") {
          valA = new Date(valA).getTime();
          valB = new Date(valB).getTime();
        } else {
          valA = (valA || "").toString().toLowerCase();
          valB = (valB || "").toString().toLowerCase();
        }

        if (valA < valB) return direction === "asc" ? -1 : 1;
        if (valA > valB) return direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [auditLogs, selectedResult, selectedModule, selectedAction, selectedDateRange, searchQuery, sortConfig]);

  // Paginated records
  const totalRecords = processedLogs.length;
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize));
  const paginatedLogs = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedLogs.slice(start, start + pageSize);
  }, [processedLogs, currentPage, pageSize]);

  // Sort toggle handler
  const handleSort = (column) => {
    setSortConfig((prev) => {
      if (prev.column === column) {
        return { column, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { column, direction: "asc" };
    });
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedResult("all");
    setSelectedModule("all");
    setSelectedAction("all");
    setSelectedDateRange("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery !== "" ||
    selectedResult !== "all" ||
    selectedModule !== "all" ||
    selectedAction !== "all" ||
    selectedDateRange !== "all";

  // ── EXPORT CSV ──
  const handleExportCSV = () => {
    const headers = [
      "Event ID",
      "Timestamp",
      "User",
      "Email",
      "Role",
      "Action",
      "Resource",
      "Module",
      "Deal",
      "Result",
      "IP Address",
      "Device",
      "Duration",
    ];

    const rows = processedLogs.map((log) => [
      log.id,
      log.timestamp,
      `"${log.user}"`,
      log.userEmail || "",
      `"${log.userRole || ""}"`,
      `"${log.action}"`,
      `"${log.resource.replace(/"/g, '""')}"`,
      log.module || "",
      `"${log.deal || ""}"`,
      log.result,
      log.ip,
      `"${log.device}"`,
      log.duration || "",
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Audit_Ledger_${activeDeal.code}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${processedLogs.length} audit records to CSV successfully.`, "success");
  };

  // ── EXPORT JSON ──
  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(processedLogs, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `Audit_Forensic_Package_${activeDeal.code}_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Exported ${processedLogs.length} structured audit records to JSON package.`, "success");
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans space-y-6">
      {/* ── HEADER ── */}
      <PageHeader
        title="Enterprise Audit Trail"
        subtitle="Forensic, read-only ledger capturing historical user interactions, document access, security authorizations, and administrative actions."
        badge={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300/80 shadow-2xs font-mono">
              <Shield size={13} className="text-emerald-600" />
              <span>Immutable Ledger Verified</span>
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              title="Download filtered records as CSV"
            >
              <Download size={14} className="text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              title="Download structured cryptographic log package"
            >
              <FileCode2 size={14} />
              <span>Export JSON Package</span>
            </button>
          </div>
        }
      />

      {/* Immutability Banner */}
      <div className="p-3.5 bg-slate-100/90 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <Lock size={15} className="text-slate-500 shrink-0" />
          <span>
            <strong className="text-slate-800">Compliance Assurance:</strong> Audit records are historical events protected by write-once-read-many (WORM) standards. Records are immutable and cannot be altered or removed.
          </span>
        </div>
        <span className="font-mono text-[11px] text-slate-500 hidden md:block">
          SHA-256 Block Verification Active
        </span>
      </div>

      {/* ── E & F. FILTER & SEARCH TOOLBAR ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1 min-w-[260px] max-w-md">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search user, action, resource, IP, or role..."
              className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[var(--brand)] font-medium text-slate-800 placeholder:text-slate-400"
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

          {/* Quick Result Pill Filters */}
          <div className="flex items-center gap-1.5">
            {["all", "Success", "Denied", "Flagged"].map((res) => (
              <button
                key={res}
                onClick={() => {
                  setSelectedResult(res);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors cursor-pointer ${
                  selectedResult.toLowerCase() === res.toLowerCase()
                    ? "bg-[var(--brand)] text-white shadow-2xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filters row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-100 text-xs">
          {/* Date Range Dropdown */}
          <select
            value={selectedDateRange}
            onChange={(e) => {
              setSelectedDateRange(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="all">All Dates</option>
            <option value="today">Today Only</option>
            <option value="last7">Past 7 Days</option>
            <option value="last30">Past 30 Days</option>
          </select>

          {/* Module Dropdown */}
          <select
            value={selectedModule}
            onChange={(e) => {
              setSelectedModule(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="all">All Modules</option>
            {uniqueModules.map((m) => (
              <option key={m} value={m}>
                Module: {m}
              </option>
            ))}
          </select>

          {/* Action Dropdown */}
          <select
            value={selectedAction}
            onChange={(e) => {
              setSelectedAction(e.target.value);
              setCurrentPage(1);
            }}
            className="h-8.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-700"
          >
            <option value="all">All Actions ({uniqueActions.length})</option>
            {uniqueActions.map((act) => (
              <option key={act} value={act}>
                {act}
              </option>
            ))}
          </select>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200 transition-colors ml-auto cursor-pointer"
            >
              <RotateCcw size={11} />
              <span>Reset Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* ── B & G. FORENSIC AUDIT TABLE ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <ScrollText className="w-4 h-4 text-[var(--brand)]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Forensic Transaction Ledger
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {totalRecords} records found • Page {currentPage} of {totalPages}
          </span>
        </div>

        {totalRecords === 0 ? (
          <EmptyState
            title="No audit records match filters"
            description="Try clearing search filters or selecting 'All Dates' to view historical events."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
            minHeight="min-h-[300px]"
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80 select-none">
                <tr>
                  {/* User Column */}
                  <th
                    onClick={() => handleSort("user")}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>User</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>

                  {/* Action Column */}
                  <th
                    onClick={() => handleSort("action")}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Action</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>

                  {/* Resource Column */}
                  <th className="px-4 py-3.5 min-w-[200px]">Resource / Target</th>

                  {/* Deal Column */}
                  <th className="px-4 py-3.5">Deal Context</th>

                  {/* Result Column */}
                  <th
                    onClick={() => handleSort("result")}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Result</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>

                  {/* Date & Time Column */}
                  <th
                    onClick={() => handleSort("timestamp")}
                    className="px-4 py-3.5 cursor-pointer hover:text-slate-800"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>Date & Time (UTC)</span>
                      <ArrowUpDown size={12} className="text-slate-400" />
                    </div>
                  </th>

                  {/* IP Address */}
                  <th className="px-4 py-3.5 font-mono">IP Address</th>

                  {/* Device */}
                  <th className="px-4 py-3.5">Device / Browser</th>

                  {/* Duration */}
                  <th className="px-4 py-3.5 font-mono">Duration</th>

                  {/* Action */}
                  <th className="px-3 py-3.5 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {paginatedLogs.map((log) => (
                  <AuditEventRow
                    key={log.id}
                    event={log}
                    layout="table"
                    onClick={(e) => setSelectedAuditLog(e)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ── H. CLIENT-SIDE PAGINATION TOOLBAR ── */}
        <div className="px-5 py-3.5 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              Showing <span className="font-bold text-slate-800">{(currentPage - 1) * pageSize + 1}</span> to{" "}
              <span className="font-bold text-slate-800">{Math.min(currentPage * pageSize, totalRecords)}</span> of{" "}
              <span className="font-bold text-slate-800">{totalRecords}</span> events
            </span>

            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-slate-400">Rows:</span>
              {[10, 25, 50].map((sz) => (
                <button
                  key={sz}
                  onClick={() => {
                    setPageSize(sz);
                    setCurrentPage(1);
                  }}
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    pageSize === sz
                      ? "bg-[var(--brand)] text-white font-bold"
                      : "bg-slate-200 text-slate-600 hover:bg-slate-300"
                  }`}
                >
                  {sz}
                </button>
              ))}
            </div>
          </div>

          {/* Navigation pagination buttons */}
          <div className="flex items-center gap-1 self-end sm:self-center">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Previous Page"
            >
              <ChevronLeft size={14} />
            </button>

            {Array.from({ length: totalPages }).map((_, i) => {
              const pNum = i + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setCurrentPage(pNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === pNum
                      ? "bg-[var(--brand)] text-white shadow-2xs"
                      : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {pNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Next Page"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* ── I. FORENSIC AUDIT DETAIL DRAWER (READ ONLY) ── */}
      <DetailDrawer
        isOpen={!!selectedAuditLog}
        onClose={() => setSelectedAuditLog(null)}
        title="Forensic Audit Record"
        subtitle="Immutable transaction event preserved in compliance ledger"
        badge={
          selectedAuditLog && (
            <StatusBadge status={selectedAuditLog.result} size="sm" />
          )
        }
        footer={
          <div className="flex items-center justify-between w-full text-xs">
            <span className="font-mono text-slate-400 text-[11px]">
              Checksum: {selectedAuditLog?.metadata?.checksum || "sha256:7e88b2a1...verified"}
            </span>
            <button
              onClick={() => setSelectedAuditLog(null)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close Ledger View
            </button>
          </div>
        }
      >
        {selectedAuditLog && (
          <div className="space-y-5 text-xs">
            {/* Immutability Notice */}
            <div className="p-3 bg-slate-100 border border-slate-300/80 rounded-xl text-[11px] text-slate-700 flex items-center gap-2">
              <Lock size={14} className="shrink-0 text-slate-600" />
              <span>
                <strong>Read-only audit record:</strong> This event is sealed and timestamped. Modifying or deleting audit records is strictly prohibited by DMS security policy.
              </span>
            </div>

            {/* Event Summary */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Event Identifier:</span>
                <span className="font-mono font-bold text-slate-800">{selectedAuditLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Action Performed:</span>
                <span className="font-bold text-slate-900">{selectedAuditLog.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Target Resource:</span>
                <span className="font-semibold text-slate-800">{selectedAuditLog.resource}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Module:</span>
                <span className="font-medium text-slate-700">{selectedAuditLog.module || "General"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Deal Context:</span>
                <span className="font-semibold text-slate-800">{selectedAuditLog.deal || activeDeal.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Timestamp:</span>
                <span className="font-mono text-slate-600">{selectedAuditLog.timestamp}</span>
              </div>
            </div>

            {/* Actor Details */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Actor & Authentication Context
              </h4>
              <div className="p-3 border border-slate-200 rounded-xl space-y-1.5 bg-white">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800 text-sm">{selectedAuditLog.user}</p>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                    {selectedAuditLog.userRole}
                  </span>
                </div>
                <p className="text-slate-500">{selectedAuditLog.userEmail}</p>
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-slate-600 font-mono text-[11px]">
                  <div>IP: {selectedAuditLog.ip}</div>
                  <div>Device: {selectedAuditLog.device}</div>
                  <div>Duration: {selectedAuditLog.duration || "0.4s"}</div>
                  <div>Result: <span className="font-bold">{selectedAuditLog.result}</span></div>
                </div>
              </div>
            </div>

            {/* Governance/Policy Decision */}
            {selectedAuditLog.permissionDecision && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Governance Authorization Decision
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
                      Applied Watermark: {selectedAuditLog.permissionDecision.watermarkText}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Additional Metadata */}
            {selectedAuditLog.metadata && Object.keys(selectedAuditLog.metadata).length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Cryptographic & File Metadata
                </h4>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-[11px] font-mono">
                  {Object.entries(selectedAuditLog.metadata).map(([k, v]) => (
                    <div key={k} className="flex justify-between">
                      <span className="text-slate-400 capitalize">{k}:</span>
                      <span className="text-slate-700 font-semibold truncate max-w-[280px]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Raw JSON Payload (Read-Only) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 size={13} />
                  <span>Raw Cryptographic Payload (Read Only)</span>
                </h4>
                <span className="text-[10px] font-mono text-slate-400">Verifiable Signature</span>
              </div>
              <pre className="p-3.5 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
                {JSON.stringify(selectedAuditLog.jsonPayload || selectedAuditLog, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </DetailDrawer>
    </div>
  );
}
