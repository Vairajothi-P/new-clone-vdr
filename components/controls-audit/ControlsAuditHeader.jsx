"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  ChevronDown,
  Building2,
  CheckCircle2,
  RefreshCw,
  FolderLock,
  Layers,
} from "lucide-react";
import { MOCK_DEALS } from "@/lib/mock-controls-audit-data";

export default function ControlsAuditHeader({
  selectedDealId = "deal-acme-001",
  onSelectDeal,
  selectedWorkspaceId = "ws-buyer-abc",
  onSelectWorkspace,
}) {
  const [dealDropOpen, setDealDropOpen] = useState(false);
  const [wsDropOpen, setWsDropOpen] = useState(false);

  const activeDeal = MOCK_DEALS.find((d) => d.id === selectedDealId) || MOCK_DEALS[0];
  const activeWorkspace =
    activeDeal.workspaces.find((w) => w.id === selectedWorkspaceId) || activeDeal.workspaces[0];

  return (
    <header className="bg-white border-b border-slate-200/80 px-6 lg:px-8 py-4 shrink-0 font-sans shadow-[0_1px_3px_rgba(0,0,0,0.02)] z-30">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Brand / Module Identifier + Deal Context */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-secondary)] flex items-center justify-center text-white shadow-md shadow-[var(--brand)]/20 shrink-0">
              <ShieldCheck className="w-5 h-5" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-extrabold text-slate-900 tracking-tight">
                  Controls & Audit
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[var(--brand-50)] text-[var(--brand)] border border-[var(--brand)]/20">
                  DMS Governance
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Enterprise compliance, stage progression & immutable audit ledger
              </p>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-200 hidden md:block" />

          {/* Deal Context Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setDealDropOpen(!dealDropOpen);
                setWsDropOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs group"
            >
              <Building2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--brand)] transition-colors" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-tight">Deal</span>
                <span className="text-slate-800 font-bold leading-tight truncate max-w-[160px] inline-block">
                  {activeDeal.name}
                </span>
              </div>
              <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 ml-1">
                {activeDeal.status}
              </span>
              <ChevronDown size={13} className="text-slate-400 ml-1" />
            </button>

            {dealDropOpen && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-64 p-1.5 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  Active Transactions
                </div>
                {MOCK_DEALS.map((deal) => (
                  <button
                    key={deal.id}
                    onClick={() => {
                      onSelectDeal && onSelectDeal(deal.id);
                      setDealDropOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      deal.id === activeDeal.id
                        ? "bg-[var(--brand-50)] text-[var(--brand)] font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <div>
                      <p className="truncate">{deal.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        {deal.code} • {deal.targetValue}
                      </p>
                    </div>
                    {deal.id === activeDeal.id && (
                      <CheckCircle2 size={14} className="text-[var(--brand)] shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Workspace Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setWsDropOpen(!wsDropOpen);
                setDealDropOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 transition-all cursor-pointer shadow-2xs group"
            >
              <FolderLock className="w-3.5 h-3.5 text-slate-400 group-hover:text-[var(--brand)] transition-colors" />
              <div className="text-left">
                <span className="text-[10px] text-slate-400 block leading-tight">Workspace</span>
                <span className="text-slate-800 font-bold leading-tight truncate max-w-[150px] inline-block">
                  {activeWorkspace.name}
                </span>
              </div>
              <ChevronDown size={13} className="text-slate-400 ml-1" />
            </button>

            {wsDropOpen && (
              <div className="absolute top-full mt-1 left-0 z-50 bg-white border border-slate-200 rounded-xl shadow-xl w-64 p-1.5 overflow-hidden animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                  Data Rooms & Workspaces
                </div>
                {activeDeal.workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      onSelectWorkspace && onSelectWorkspace(ws.id);
                      setWsDropOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      ws.id === activeWorkspace.id
                        ? "bg-[var(--brand-50)] text-[var(--brand)] font-bold"
                        : "text-slate-700 hover:bg-slate-50 font-medium"
                    }`}
                  >
                    <div>
                      <p className="truncate">{ws.name}</p>
                      <p className="text-[10px] text-slate-400 font-normal">
                        {ws.type} • {ws.usersCount} users
                      </p>
                    </div>
                    {ws.id === activeWorkspace.id && (
                      <CheckCircle2 size={14} className="text-[var(--brand)] shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Quick Governance Indicators */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50/80 border border-emerald-200/80 rounded-xl text-xs font-semibold text-emerald-800 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Audit Ledger Active</span>
          </div>

          <div className="text-xs text-slate-400 hidden lg:block font-mono">
            Stage 3 / 6 (Negotiation)
          </div>
        </div>
      </div>
    </header>
  );
}
