"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Shield,
  Lock,
  Bell,
  HardDrive,
  KeyRound,
  FileCheck2,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Server,
  Layers,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useControlsAudit } from "@/components/controls-audit/ControlsAuditContext";
import {
  PageHeader,
  StatusBadge,
} from "@/components/controls-audit/shared";
import ModalPortal from "@/components/ui/ModalPortal";

export default function ControlsAuditSettingsPage() {
  const {
    activeDeal,
    settings,
    updateSettings,
    resetSettingsToDefault,
    showToast,
  } = useControlsAudit();

  // Active section tab: 'audit' | 'permissions' | 'notifications' | 'retention' | 'security'
  const [activeTab, setActiveTab] = useState("audit");

  // Local draft state for each section
  const [auditDraft, setAuditDraft] = useState(settings.auditSettings);
  const [permissionDraft, setPermissionDraft] = useState(settings.permissionSettings);
  const [notificationDraft, setNotificationDraft] = useState(settings.notificationSettings);
  const [retentionDraft, setRetentionDraft] = useState(settings.retentionSettings);
  const [securityDraft, setSecurityDraft] = useState(settings.securitySettings);

  // Reset confirmation modal
  const [showResetModal, setShowResetModal] = useState(false);

  // Save current active tab configuration
  const handleSaveActiveTab = () => {
    switch (activeTab) {
      case "audit":
        updateSettings("auditSettings", auditDraft);
        break;
      case "permissions":
        updateSettings("permissionSettings", permissionDraft);
        break;
      case "notifications":
        updateSettings("notificationSettings", notificationDraft);
        break;
      case "retention":
        updateSettings("retentionSettings", retentionDraft);
        break;
      case "security":
        updateSettings("securitySettings", securityDraft);
        break;
      default:
        break;
    }
  };

  // Confirm Reset
  const handleConfirmReset = () => {
    resetSettingsToDefault();
    setAuditDraft(settings.auditSettings);
    setPermissionDraft(settings.permissionSettings);
    setNotificationDraft(settings.notificationSettings);
    setRetentionDraft(settings.retentionSettings);
    setSecurityDraft(settings.securitySettings);
    setShowResetModal(false);
  };

  const tabs = [
    { id: "audit", label: "Audit Ledger & WORM", icon: Server, desc: "Log verbosity & SHA-256 integrity" },
    { id: "permissions", label: "Permissions & Roles", icon: KeyRound, desc: "Inheritance & isolation rules" },
    { id: "notifications", label: "Notifications & Alerts", icon: Bell, desc: "Webhooks & daily digest" },
    { id: "retention", label: "Retention & Legal Hold", icon: HardDrive, desc: "Compliance archive & legal holds" },
    { id: "security", label: "Security & Watermarks", icon: Lock, desc: "Forensic stamps & IP CIDRs" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans space-y-7">
      {/* ── HEADER ── */}
      <PageHeader
        title="Controls & Audit Configurations"
        subtitle="Manage cryptographic audit log retention, strict role isolation policies, compliance legal holds, and dynamic forensic watermarking standards."
        badge={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-300 shadow-2xs">
              <Shield size={13} className="text-emerald-600" />
              <span>Configuration Active: {activeDeal.name}</span>
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowResetModal(true)}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw size={14} className="text-slate-400" />
              <span>Reset Defaults</span>
            </button>
            <button
              onClick={handleSaveActiveTab}
              className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Save size={14} />
              <span>Save Configuration</span>
            </button>
          </div>
        }
      />

      {/* ── A. HORIZONTAL SECTION SELECTOR ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? "bg-white border-[var(--brand)] shadow-sm ring-2 ring-[var(--brand)]/15"
                  : "bg-white/80 border-slate-200 hover:border-slate-300 hover:bg-white shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    isSelected
                      ? "bg-blue-50 text-[var(--brand)]"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon size={18} />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-[var(--brand)]" />
                )}
              </div>
              <div>
                <h4
                  className={`text-xs font-bold leading-tight ${
                    isSelected ? "text-[var(--brand)]" : "text-slate-800"
                  }`}
                >
                  {tab.label}
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                  {tab.desc}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── B. ACTIVE CONFIGURATION SECTION PANEL ── */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 lg:p-8 shadow-xs">
        {/* 1. AUDIT SETTINGS */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Audit Ledger & Storage Policies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure immutable event preservation standards, Merkle hashing, and logging granularity.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Retention Duration */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Audit Retention Duration (Days)
                </label>
                <select
                  value={auditDraft.retentionDurationDays}
                  onChange={(e) =>
                    setAuditDraft({ ...auditDraft, retentionDurationDays: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value={90}>90 Days (Quarterly Compliance)</option>
                  <option value={180}>180 Days (Semi-Annual Compliance)</option>
                  <option value={365}>365 Days (1 Year M&A Standard)</option>
                  <option value={730}>730 Days (2 Years Statutory)</option>
                  <option value={2555}>2,555 Days (7 Years SEC Statutory Standard)</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  All transaction events are retained in write-once-read-many (WORM) storage.
                </span>
              </div>

              {/* Log Level */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Forensic Log Granularity
                </label>
                <select
                  value={auditDraft.logLevel}
                  onChange={(e) => setAuditDraft({ ...auditDraft, logLevel: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value="Standard (Metadata Only)">Standard (Actor, Action, Resource, Result)</option>
                  <option value="Verbose (Full Payloads)">Verbose (Includes full JSON payload & parameters)</option>
                  <option value="Forensic High Precision">Forensic High Precision (SHA-256 Block Digest)</option>
                </select>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Verbose captures payload parameters for non-repudiation audit trails.
                </span>
              </div>

              {/* Hash Algorithm */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Cryptographic Ledger Algorithm
                </label>
                <select
                  value={auditDraft.hashAlgorithm}
                  onChange={(e) => setAuditDraft({ ...auditDraft, hashAlgorithm: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value="SHA-256 Merkle Verification">SHA-256 Merkle Verification</option>
                  <option value="SHA-512 Enterprise Block">SHA-512 Enterprise Block</option>
                </select>
              </div>

              {/* IP Masking Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">
                    GDPR Anonymized IP Masking
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Mask the last octet of client IP addresses for European GDPR compliance.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditDraft({ ...auditDraft, ipMasking: !auditDraft.ipMasking })}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    auditDraft.ipMasking ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      auditDraft.ipMasking ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Immutable Ledger Verification Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl md:col-span-2">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Enforce Immutable Ledger Verification (WORM)
                  </span>
                  <span className="text-[11px] text-slate-500">
                    When active, prevents database administrator alteration or deletion of past audit entries.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setAuditDraft({
                      ...auditDraft,
                      immutableLedgerVerification: !auditDraft.immutableLedgerVerification,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    auditDraft.immutableLedgerVerification ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      auditDraft.immutableLedgerVerification ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. PERMISSION SETTINGS */}
        {activeTab === "permissions" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Permission & Role Isolation Governance
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Regulate folder-to-child inheritance, cross-counterparty discovery, and session lifetimes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Default Inheritance */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Default Hierarchical Permission Inheritance
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Sub-folders automatically inherit permissions assigned to parent directories.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPermissionDraft({
                      ...permissionDraft,
                      defaultInheritance: !permissionDraft.defaultInheritance,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    permissionDraft.defaultInheritance ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      permissionDraft.defaultInheritance ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Strict Role Isolation */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Strict Counterparty Role Isolation
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Prevents buyer workspaces from viewing seller user directories or advisor groups.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPermissionDraft({
                      ...permissionDraft,
                      strictRoleIsolation: !permissionDraft.strictRoleIsolation,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    permissionDraft.strictRoleIsolation ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      permissionDraft.strictRoleIsolation ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Session Timeout */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Inactivity Session Auto-Timeout (Minutes)
                </label>
                <select
                  value={permissionDraft.sessionTimeoutMinutes}
                  onChange={(e) =>
                    setPermissionDraft({
                      ...permissionDraft,
                      sessionTimeoutMinutes: Number(e.target.value),
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value={15}>15 Minutes (High Security Banking Standard)</option>
                  <option value={30}>30 Minutes (Recommended VDR Standard)</option>
                  <option value={60}>60 Minutes (Standard Diligence)</option>
                  <option value={120}>120 Minutes (Extended Review)</option>
                </select>
              </div>

              {/* MFA for Approvals */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Require MFA for Document Approvals
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Demands one-time password verification prior to executing legal signoffs.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setPermissionDraft({
                      ...permissionDraft,
                      requireMfaForApprovals: !permissionDraft.requireMfaForApprovals,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    permissionDraft.requireMfaForApprovals ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      permissionDraft.requireMfaForApprovals ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. NOTIFICATION SETTINGS */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Governance Notifications & Incident Alert Webhooks
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure immediate security dispatching, deal owner summaries, and compliance alerts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* High Risk Alerts Email */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">
                    High Risk Incident Email Dispatches
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Immediately notifies lead counsel when a high risk or stage blocker is logged.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotificationDraft({
                      ...notificationDraft,
                      highRiskAlertsEmail: !notificationDraft.highRiskAlertsEmail,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    notificationDraft.highRiskAlertsEmail ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      notificationDraft.highRiskAlertsEmail ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Realtime Policy Webhook */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Real-time Policy Breach Webhooks
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Pushes instant security breach payloads to SIEM (Splunk, Datadog, or Slack).
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotificationDraft({
                      ...notificationDraft,
                      realtimePolicyBreachWebhooks: !notificationDraft.realtimePolicyBreachWebhooks,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    notificationDraft.realtimePolicyBreachWebhooks ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      notificationDraft.realtimePolicyBreachWebhooks ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Daily Digest Toggle */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Daily Governance Executive Digest
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Consolidates approvals signed, new permissions granted, and risk updates at 09:00 UTC.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setNotificationDraft({
                      ...notificationDraft,
                      dailyDigestEnabled: !notificationDraft.dailyDigestEnabled,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    notificationDraft.dailyDigestEnabled ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      notificationDraft.dailyDigestEnabled ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Digest Recipient */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Primary Digest Recipient Email
                </label>
                <input
                  type="email"
                  value={notificationDraft.digestRecipient}
                  onChange={(e) =>
                    setNotificationDraft({ ...notificationDraft, digestRecipient: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[var(--brand)]"
                />
              </div>
            </div>
          </div>
        )}

        {/* 4. RETENTION & LEGAL HOLD SETTINGS */}
        {activeTab === "retention" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Retention & Statutory Legal Hold Policies
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage statutory litigation holds, archival file formats, and document purge review requirements.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Legal Hold Active Banner */}
              <div className="p-4 bg-rose-50/60 border border-rose-200 rounded-xl flex items-start gap-3 md:col-span-2">
                <AlertTriangle size={18} className="text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-rose-900 text-xs">
                      Statutory Transaction Legal Hold (Active)
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setRetentionDraft({
                          ...retentionDraft,
                          legalHoldActive: !retentionDraft.legalHoldActive,
                        })
                      }
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                        retentionDraft.legalHoldActive ? "bg-rose-600" : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                          retentionDraft.legalHoldActive ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>
                  <p className="text-[11px] text-rose-700 mt-1 leading-relaxed">
                    When Legal Hold is active, all document deletions, version purges, and log truncations are strictly blocked across the platform under statutory discovery rules.
                  </p>
                </div>
              </div>

              {/* Archive Format */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Permanent Archive Compliance Format
                </label>
                <select
                  value={retentionDraft.permanentArchiveFormat}
                  onChange={(e) =>
                    setRetentionDraft({
                      ...retentionDraft,
                      permanentArchiveFormat: e.target.value,
                    })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value="PDF/A-1b Compliant">PDF/A-1b Compliant (ISO 19005-1 Standard)</option>
                  <option value="Raw Encrypted Archive">Raw Encrypted AES-256 Package</option>
                  <option value="WORM Immutable Storage">Cloud WORM Immutable Storage (S3 Object Lock)</option>
                </select>
              </div>

              {/* Purge Policy */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Document Purge Approval Requirement
                </label>
                <select
                  value={retentionDraft.purgePolicy}
                  onChange={(e) =>
                    setRetentionDraft({ ...retentionDraft, purgePolicy: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:bg-white focus:outline-none focus:border-[var(--brand)]"
                >
                  <option value="Manual Review Required Before Deletion">Manual Counsel Review Required</option>
                  <option value="Automated Purge After Retention">Automated Purge After Expiration</option>
                  <option value="Indefinite Archive">Indefinite Retention (No Purging Permitted)</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* 5. SECURITY & WATERMARK SETTINGS */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="text-base font-bold text-slate-900">
                Security & Dynamic Forensic Watermarking
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Configure real-time watermarks stamped with user email, IP address, and network CIDR constraints.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              {/* Enforce Dynamic Watermarks */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl md:col-span-2">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Enforce Dynamic Forensic Watermarks
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Stamps viewer full name, authenticated email, user IP, and timestamp diagonally across every rendered PDF and Excel sheet.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSecurityDraft({
                      ...securityDraft,
                      enforceDynamicWatermarks: !securityDraft.enforceDynamicWatermarks,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    securityDraft.enforceDynamicWatermarks ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      securityDraft.enforceDynamicWatermarks ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Prevent Simultaneous Logins */}
              <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200/80 rounded-xl">
                <div>
                  <span className="font-bold text-slate-800 block">
                    Prevent Concurrent Multi-Device Sessions
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Terminates prior active sessions when a user signs in from a secondary IP or browser.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSecurityDraft({
                      ...securityDraft,
                      preventSimultaneousLogins: !securityDraft.preventSimultaneousLogins,
                    })
                  }
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                    securityDraft.preventSimultaneousLogins ? "bg-[var(--brand)]" : "bg-slate-300"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition duration-200 ${
                      securityDraft.preventSimultaneousLogins ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {/* Allowed IP CIDR Ranges */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Whitelisted IP CIDR Ranges (Comma Separated)
                </label>
                <input
                  type="text"
                  value={securityDraft.allowedIpCidrRanges}
                  onChange={(e) =>
                    setSecurityDraft({ ...securityDraft, allowedIpCidrRanges: e.target.value })
                  }
                  placeholder="192.0.2.0/24, 198.51.100.0/24"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:bg-white focus:outline-none focus:border-[var(--brand)]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Leave empty to allow global corporate counterparty access.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── C. RESET DEFAULTS MODAL ── */}
      {showResetModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200 font-sans p-6 text-xs">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <RotateCcw size={22} />
              </div>
              <h3 className="text-base font-bold text-slate-900 mb-1">
                Restore Default Governance Settings?
              </h3>
              <p className="text-slate-500 leading-relaxed mb-6">
                This action will reset all 5 configuration sections (Audit, Permissions, Notifications, Retention, and Security) to system baseline defaults.
              </p>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setShowResetModal(false)}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmReset}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Restore Baseline Defaults
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
