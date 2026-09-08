"use client";

import React from "react";
import {
  Download,
  Upload,
  Eye,
  CheckCircle2,
  XCircle,
  KeyRound,
  HelpCircle,
  MessageSquare,
  Milestone,
  AlertOctagon,
  Activity,
  ChevronRight,
} from "lucide-react";
import StatusBadge from "./StatusBadge";

export function getActionIcon(action = "") {
  const norm = action.toLowerCase();
  if (norm.includes("download")) return <Download className="w-3.5 h-3.5 text-emerald-600" />;
  if (norm.includes("upload")) return <Upload className="w-3.5 h-3.5 text-blue-600" />;
  if (norm.includes("view")) return <Eye className="w-3.5 h-3.5 text-sky-600" />;
  if (norm.includes("approv")) return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />;
  if (norm.includes("denied")) return <XCircle className="w-3.5 h-3.5 text-rose-600" />;
  if (norm.includes("permission")) return <KeyRound className="w-3.5 h-3.5 text-amber-600" />;
  if (norm.includes("asked")) return <HelpCircle className="w-3.5 h-3.5 text-purple-600" />;
  if (norm.includes("answered")) return <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />;
  if (norm.includes("stage") || norm.includes("gate")) return <Milestone className="w-3.5 h-3.5 text-[var(--brand)]" />;
  if (norm.includes("policy") || norm.includes("violation")) return <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />;
  return <Activity className="w-3.5 h-3.5 text-slate-600" />;
}

export function formatAuditDate(dateString) {
  if (!dateString) return "—";
  try {
    const d = new Date(dateString);
    return {
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
      full: d.toLocaleString(),
    };
  } catch {
    return { date: dateString, time: "", full: dateString };
  }
}

export default function AuditEventRow({
  event,
  onClick,
  layout = "table", // 'table' | 'feed'
  isCompact = false,
}) {
  const { date, time, full } = formatAuditDate(event.timestamp);

  if (layout === "feed") {
    return (
      <div
        onClick={() => onClick && onClick(event)}
        className="group p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50/80 hover:border-slate-300 transition-all cursor-pointer flex items-start gap-3"
      >
        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:scale-105 transition-transform">
          {getActionIcon(event.action)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-slate-900 truncate">
              {event.user}
            </span>
            <StatusBadge status={event.result} size="sm" showIcon={false} />
          </div>
          <p className="text-xs text-slate-600 font-medium truncate mb-1">
            {event.action} — <span className="text-slate-800 font-semibold">{event.resource}</span>
          </p>
          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
            <span>{date} {time}</span>
            <span>•</span>
            <span>{event.ip}</span>
          </div>
        </div>
      </div>
    );
  }

  // Full table row
  return (
    <tr
      onClick={() => onClick && onClick(event)}
      className="border-b border-slate-100 hover:bg-[var(--brand-50)]/40 transition-colors cursor-pointer text-xs font-sans group"
    >
      {/* User */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center shrink-0 uppercase border border-slate-200">
            {event.user ? event.user.split(" ").map((n) => n[0]).join("") : "?"}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-slate-900 truncate group-hover:text-[var(--brand)] transition-colors">
              {event.user}
            </p>
            <p className="text-[11px] text-slate-400 truncate">{event.userRole}</p>
          </div>
        </div>
      </td>

      {/* Action */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
            {getActionIcon(event.action)}
          </span>
          <span className="font-semibold text-slate-800 whitespace-nowrap">
            {event.action}
          </span>
        </div>
      </td>

      {/* Resource */}
      <td className="px-4 py-3.5 max-w-[220px]">
        <span className="font-medium text-slate-700 truncate block" title={event.resource}>
          {event.resource}
        </span>
      </td>

      {/* Deal */}
      <td className="px-4 py-3.5 whitespace-nowrap text-slate-600">
        <span className="text-[11px] font-medium px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200/60">
          {event.deal || "Acme Acquisition"}
        </span>
      </td>

      {/* Result */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <StatusBadge status={event.result} size="sm" />
      </td>

      {/* Date & Time */}
      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-600" title={full}>
        <div>{date}</div>
        <div className="text-slate-400 text-[10px]">{time} UTC</div>
      </td>

      {/* IP Address */}
      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-[11px] text-slate-500">
        {event.ip}
      </td>

      {/* Device */}
      <td className="px-4 py-3.5 max-w-[150px] truncate text-slate-500" title={event.device}>
        {event.device}
      </td>

      {/* Duration */}
      <td className="px-4 py-3.5 whitespace-nowrap font-mono text-slate-400 text-[11px]">
        {event.duration || "—"}
      </td>

      {/* Action button */}
      <td className="px-3 py-3.5 text-right whitespace-nowrap">
        <button
          className="p-1 rounded-lg text-slate-400 group-hover:text-[var(--brand)] group-hover:bg-white transition-all shadow-xs"
          title="View Immutable Audit Record"
        >
          <ChevronRight size={14} />
        </button>
      </td>
    </tr>
  );
}
