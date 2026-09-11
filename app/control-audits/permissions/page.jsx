"use client";

import React, { useState } from "react";
import {
  KeyRound,
  Shield,
  ShieldAlert,
  UserPlus,
  Edit3,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Info,
  ChevronRight,
  Filter,
  User,
  Users,
  Search,
  Lock,
  Layers,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { useControlsAudit } from "@/components/controls-audit/ControlsAuditContext";
import {
  PageHeader,
  StatusBadge,
  DetailDrawer,
} from "@/components/controls-audit/shared";
import ModalPortal from "@/components/ui/ModalPortal";

export default function PermissionsPage() {
  const {
    activeDeal,
    roles,
    users,
    permissionsMatrix,
    accessGrants,
    updatePermissionCell,
    createAccessGrant,
    showToast,
  } = useControlsAudit();

  // View toggle: 'role' | 'user'
  const [viewMode, setViewMode] = useState("role");

  // Selected cell detail for inspection drawer
  const [inspectedCell, setInspectedCell] = useState(null);

  // Edit mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [stagedEdits, setStagedEdits] = useState({}); // { `${action}_${role}`: newStatus }
  const [showConfirmSaveModal, setShowConfirmSaveModal] = useState(false);

  // By User view selection & search
  const [selectedUserId, setSelectedUserId] = useState("usr-4"); // default Alexander Vance
  const [userSearch, setUserSearch] = useState("");

  // Grant Access modal state
  const [isGrantModalOpen, setIsGrantModalOpen] = useState(false);
  const [grantFormData, setGrantFormData] = useState({
    user: "Dr. Julian Hayes",
    role: "External Advisor",
    workspace: "Legal Advisory - Gibson & Dunn",
    resource: "Due Diligence / Tax Disclosures",
    permission: "Clean Room View",
    scope: "Folder Scope",
    expiration: "2026-11-30",
    reason: "Specialized foreign tax treaty liability review",
  });

  const selectedUser = users.find((u) => u.id === selectedUserId) || users[0];

  // Actions list in standard order
  const actionList = [
    "View Documents",
    "Upload Documents",
    "Edit Documents",
    "Delete Documents",
    "Download",
    "Ask Questions",
    "Approve",
    "Manage Users",
  ];

  // Toggle cell in edit mode
  const handleCellClick = (actionName, roleName, currentCellData) => {
    if (!isEditMode) {
      // Open inspection drawer
      setInspectedCell({
        action: actionName,
        role: roleName,
        deal: activeDeal.name,
        workspace: "Buyer ABC Corp / Acme Room",
        ...currentCellData,
      });
      return;
    }

    // In edit mode: cycle allowed <-> denied
    const key = `${actionName}__${roleName}`;
    const effectiveStatus = stagedEdits[key] || currentCellData.status;

    let nextStatus = "allowed";
    if (effectiveStatus === "allowed") nextStatus = "denied";
    else if (effectiveStatus === "denied") nextStatus = "allowed";

    setStagedEdits((prev) => ({
      ...prev,
      [key]: nextStatus,
    }));
  };

  // Save all staged edits
  const handleSaveEdits = () => {
    const editKeys = Object.keys(stagedEdits);
    if (editKeys.length === 0) {
      setIsEditMode(false);
      return;
    }

    editKeys.forEach((key) => {
      const [actionName, roleName] = key.split("__");
      const newStatus = stagedEdits[key];
      updatePermissionCell(
        actionName,
        roleName,
        newStatus,
        `Bulk permission matrix modification by Administrator.`
      );
    });

    setStagedEdits({});
    setIsEditMode(false);
    setShowConfirmSaveModal(false);
    showToast(`Successfully saved ${editKeys.length} permission modifications.`, "success");
  };

  // Cancel edit mode
  const handleCancelEdits = () => {
    setStagedEdits({});
    setIsEditMode(false);
  };

  // Submit Grant Access
  const handleGrantSubmit = (e) => {
    e.preventDefault();
    createAccessGrant({
      user: grantFormData.user,
      role: grantFormData.role,
      deal: activeDeal.name,
      workspace: grantFormData.workspace,
      resource: grantFormData.resource,
      permission: grantFormData.permission,
      scope: grantFormData.scope,
      expiresAt: grantFormData.expiration,
      reason: grantFormData.reason,
    });

    setIsGrantModalOpen(false);
    setGrantFormData({
      user: "Dr. Julian Hayes",
      role: "External Advisor",
      workspace: "Legal Advisory - Gibson & Dunn",
      resource: "Due Diligence / Tax Disclosures",
      permission: "Clean Room View",
      scope: "Folder Scope",
      expiration: "2026-11-30",
      reason: "Specialized foreign tax treaty liability review",
    });
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full font-sans space-y-6">
      {/* ── HEADER ── */}
      <PageHeader
        title="Permissions Matrix & Access Grants"
        subtitle="Inspect and manage role-based and user-level resource permissions, inheritance chains, and specific access grants."
        badge={<StatusBadge status="active" label="Inheritance Active" size="sm" />}
        actions={
          <div className="flex items-center gap-2.5">
            {/* View Toggle */}
            <div className="inline-flex p-1 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <button
                onClick={() => setViewMode("role")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "role"
                    ? "bg-[var(--brand)] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users size={13} />
                <span>By Role</span>
              </button>
              <button
                onClick={() => setViewMode("user")}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "user"
                    ? "bg-[var(--brand)] text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <User size={13} />
                <span>By User</span>
              </button>
            </div>

            {/* Edit / Save Actions */}
            {viewMode === "role" && (
              <>
                {!isEditMode ? (
                  <button
                    onClick={() => setIsEditMode(true)}
                    className="px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit3 size={13} className="text-slate-400" />
                    <span>Edit Permissions</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelEdits}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        if (Object.keys(stagedEdits).length > 0) {
                          setShowConfirmSaveModal(true);
                        } else {
                          setIsEditMode(false);
                        }
                      }}
                      className="px-3.5 py-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Save size={13} />
                      <span>Save Changes {Object.keys(stagedEdits).length > 0 && `(${Object.keys(stagedEdits).length})`}</span>
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Grant Access Button */}
            <button
              onClick={() => setIsGrantModalOpen(true)}
              className="px-3.5 py-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-semibold rounded-xl transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus size={14} />
              <span>Grant Access</span>
            </button>
          </div>
        }
      />

      {/* Edit Mode Notice Banner */}
      {isEditMode && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between text-xs text-amber-900 shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">Edit Mode Active:</span> Click any permission cell to toggle between <span className="font-semibold text-emerald-700">Allowed (✓)</span> and <span className="font-semibold text-rose-700">Denied (×)</span>. Changes will generate immutable audit logs upon saving.
            </div>
          </div>
          <span className="font-bold font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-800">
            {Object.keys(stagedEdits).length} modifications pending
          </span>
        </div>
      )}

      {/* ── B. BY ROLE VIEW: MATRIX TABLE ── */}
      {viewMode === "role" && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--brand)]" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Role vs. Resource Action Matrix
                </h3>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <span className="text-emerald-600 font-bold">✓</span> Allowed
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-rose-500 font-bold">×</span> Denied
                </span>
                <span className="inline-flex items-center gap-1">
                  <span className="text-slate-400 font-bold">—</span> Not Applicable
                </span>
                <span className="text-slate-300">|</span>
                <span className="text-[11px] text-slate-400">Click any cell to inspect reason</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-200/80">
                  <tr>
                    <th className="px-5 py-3.5 min-w-[200px]">Permission / Resource</th>
                    {roles.map((r) => (
                      <th
                        key={r.id}
                        className="px-3 py-3.5 text-center min-w-[120px]"
                        title={r.description}
                      >
                        <div className="font-bold text-slate-800 truncate">{r.name}</div>
                        <div className="text-[10px] text-slate-400 font-normal font-mono">
                          {r.usersCount} users
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {actionList.map((actionName) => {
                    const rowData = permissionsMatrix.find(
                      (m) => m.action === actionName || m.action.startsWith(actionName.split(" ")[0])
                    ) || permissionsMatrix[0];

                    return (
                      <tr key={actionName} className="hover:bg-slate-50/60 transition-colors">
                        {/* Action Column */}
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-800 text-xs">{actionName}</div>
                          <div className="text-[10px] text-slate-400">
                            {rowData.category || "Governance"}
                          </div>
                        </td>

                        {/* Role Cells */}
                        {roles.map((r) => {
                          const cellData = rowData.roles[r.name] || {
                            status: "na",
                            source: "Role Default",
                            reason: "Standard configuration.",
                          };

                          const stagedKey = `${actionName}__${r.name}`;
                          const currentStatus = stagedEdits[stagedKey] || cellData.status;
                          const isEdited = !!stagedEdits[stagedKey];

                          return (
                            <td
                              key={r.id}
                              onClick={() => handleCellClick(actionName, r.name, cellData)}
                              className={`px-3 py-3 text-center transition-all cursor-pointer select-none ${
                                isEditMode
                                  ? "hover:bg-[var(--brand-50)] hover:scale-105"
                                  : "hover:bg-slate-100/60"
                              } ${isEdited ? "bg-amber-50/80 ring-2 ring-amber-400/60 inset-0" : ""}`}
                            >
                              <div className="flex flex-col items-center justify-center">
                                {currentStatus === "allowed" && (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200/80 shadow-2xs">
                                    ✓
                                  </span>
                                )}
                                {currentStatus === "denied" && (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200/80 shadow-2xs">
                                    ×
                                  </span>
                                )}
                                {currentStatus === "na" && (
                                  <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-slate-50 text-slate-400 font-bold border border-slate-200/60">
                                    —
                                  </span>
                                )}

                                {isEdited && (
                                  <span className="text-[9px] font-bold text-amber-700 mt-1 uppercase">
                                    Edited
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Active Grants List */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Explicit Deal Access Grants ({accessGrants.length})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Specific resource allowances granted outside baseline role inheritance
                </p>
              </div>
              <button
                onClick={() => setIsGrantModalOpen(true)}
                className="text-xs font-semibold text-[var(--brand)] hover:underline inline-flex items-center gap-1"
              >
                <span>+ Grant New Access</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accessGrants.map((grant) => (
                <div
                  key={grant.id}
                  className="p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-all bg-slate-50/40 flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{grant.user}</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-200 text-slate-700 rounded-md">
                          {grant.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">{grant.userEmail}</p>
                    </div>
                    <StatusBadge status="allowed" label={grant.permission} size="sm" />
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="text-slate-700 font-medium">
                      Resource: <span className="font-bold">{grant.resource}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">
                      Scope: {grant.scope} • Expires: {grant.expiresAt}
                    </div>
                    <div className="text-slate-600 text-[11px] bg-white p-2 rounded-lg border border-slate-200/60 italic">
                      "{grant.reason}"
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono flex justify-between items-center border-t border-slate-200/60 pt-2">
                    <span>Granted by: {grant.grantedBy}</span>
                    <span>{grant.grantedAt.slice(0, 10)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── E. BY USER VIEW: USER PERMISSION INSPECTOR ── */}
      {viewMode === "user" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* User selector list (4 cols) */}
          <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-xs flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Workspace Users</h3>
              <span className="text-xs font-bold text-slate-400">{users.length} members</span>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search user or role..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[var(--brand)] font-medium text-slate-800 placeholder:text-slate-400"
              />
            </div>

            {/* List */}
            <div className="space-y-2 overflow-y-auto max-h-[500px]">
              {users
                .filter(
                  (u) =>
                    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                    u.role.toLowerCase().includes(userSearch.toLowerCase())
                )
                .map((u) => {
                  const isSelected = u.id === selectedUserId;

                  return (
                    <div
                      key={u.id}
                      onClick={() => setSelectedUserId(u.id)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSelected
                          ? "border-[var(--brand)] bg-[var(--brand-50)]/50 shadow-xs"
                          : "border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? "bg-[var(--brand)] text-white"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {u.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">{u.name}</p>
                          <p className="text-[11px] text-slate-400 truncate">{u.role}</p>
                        </div>
                      </div>
                      <ChevronRight
                        size={14}
                        className={isSelected ? "text-[var(--brand)]" : "text-slate-300"}
                      />
                    </div>
                  );
                })}
            </div>
          </div>

          {/* User Effective Permissions Matrix (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs flex flex-col space-y-6">
            {/* Header info for selected user */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[var(--brand)] to-[var(--brand-secondary)] text-white font-extrabold text-sm flex items-center justify-center shadow-md">
                  {selectedUser.avatar}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-slate-900">{selectedUser.name}</h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedUser.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedUser.email}</p>
                  <p className="text-[11px] text-slate-600 font-semibold mt-0.5">
                    Assigned Role: <span className="text-[var(--brand)]">{selectedUser.role}</span> ({selectedUser.group})
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-200 sm:pl-4 text-xs space-y-1">
                <div className="text-slate-400">Effective Clearance:</div>
                <div className="font-bold text-slate-800">
                  {selectedUser.role.includes("Admin") ? "Tier-1 Full Access" : "Tier-2 Restricted Diligence"}
                </div>
                <div className="text-[11px] text-slate-400">Last active: {selectedUser.lastActive}</div>
              </div>
            </div>

            {/* Effective Permissions Breakdown Table */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Effective Permissions Breakdown
                </h4>
                <span className="text-[11px] text-slate-400">
                  Inherited from <span className="font-semibold text-slate-700">{selectedUser.role}</span> + Active Grants
                </span>
              </div>

              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">Resource / Action</th>
                      <th className="px-3 py-3">Status</th>
                      <th className="px-3 py-3">Permission Source</th>
                      <th className="px-4 py-3">Reason / Scope</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {actionList.map((actionName) => {
                      const rowData = permissionsMatrix.find(
                        (m) => m.action === actionName || m.action.startsWith(actionName.split(" ")[0])
                      ) || permissionsMatrix[0];

                      const userRoleData = rowData.roles[selectedUser.role] || {
                        status: "na",
                        source: "Role Default",
                        reason: "Default configuration.",
                      };

                      return (
                        <tr
                          key={actionName}
                          onClick={() =>
                            setInspectedCell({
                              action: actionName,
                              role: selectedUser.role,
                              user: selectedUser.name,
                              deal: activeDeal.name,
                              workspace: "Buyer ABC Corp",
                              ...userRoleData,
                            })
                          }
                          className="hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {actionName}
                          </td>
                          <td className="px-3 py-3">
                            <StatusBadge status={userRoleData.status} size="sm" />
                          </td>
                          <td className="px-3 py-3">
                            <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/60">
                              {userRoleData.source}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500 text-[11px] leading-relaxed">
                            {userRoleData.reason}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── C. PERMISSION INSPECTION DRAWER ── */}
      <DetailDrawer
        isOpen={!!inspectedCell}
        onClose={() => setInspectedCell(null)}
        title="Permission Policy Inspection"
        subtitle="Verification of authorization source, inheritance, and governance reasons"
        badge={
          inspectedCell && (
            <StatusBadge status={inspectedCell.status} size="sm" />
          )
        }
      >
        {inspectedCell && (
          <div className="space-y-5 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl space-y-2.5">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Target Role / User:</span>
                <span className="font-bold text-slate-900">{inspectedCell.user || inspectedCell.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Resource Action:</span>
                <span className="font-bold text-[var(--brand)]">{inspectedCell.action}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Deal Context:</span>
                <span className="font-semibold text-slate-800">{inspectedCell.deal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Current Status:</span>
                <StatusBadge status={inspectedCell.status} size="sm" />
              </div>
            </div>

            {/* Inheritance Tree */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers size={14} className="text-[var(--brand)]" />
                <span>Permission Inheritance Model</span>
              </h4>
              <div className="p-3.5 bg-white border border-slate-200 rounded-xl space-y-3 font-sans">
                <div className="flex items-center gap-2 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-[var(--brand-50)] text-[var(--brand)] flex items-center justify-center font-bold text-[10px]">1</span>
                  <span>Role Definition: <span className="font-bold">{inspectedCell.role}</span></span>
                </div>
                <div className="ml-2.5 pl-3.5 border-l border-slate-200 flex items-center gap-2 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-[var(--brand-50)] text-[var(--brand)] flex items-center justify-center font-bold text-[10px]">2</span>
                  <span>Permission Source: <span className="font-bold text-slate-900">{inspectedCell.source}</span></span>
                </div>
                <div className="ml-2.5 pl-3.5 border-l border-slate-200 flex items-center gap-2 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-[var(--brand-50)] text-[var(--brand)] flex items-center justify-center font-bold text-[10px]">3</span>
                  <span>Resource: <span className="font-semibold">{inspectedCell.action}</span></span>
                </div>
                <div className="ml-2.5 pl-3.5 border-l border-slate-200 flex items-center gap-2 text-slate-700">
                  <span className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px]">4</span>
                  <span>Effective Result: <span className="font-bold uppercase text-emerald-800">{inspectedCell.status}</span></span>
                </div>
              </div>
            </div>

            {/* Reason */}
            <div>
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Policy Reason & Justification
              </h4>
              <div className="p-3.5 border border-slate-200 rounded-xl bg-slate-50/50 leading-relaxed text-slate-700">
                "{inspectedCell.reason}"
              </div>
            </div>
          </div>
        )}
      </DetailDrawer>

      {/* ── F. GRANT ACCESS MODAL ── */}
      {isGrantModalOpen && (
        <ModalPortal>
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 font-sans">
            <div
              onClick={() => setIsGrantModalOpen(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            />
            <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
                <div className="flex items-center gap-2.5">
                  <UserPlus className="w-5 h-5 text-[var(--brand)]" />
                  <h3 className="text-base font-bold text-slate-900">
                    Grant Resource Access
                  </h3>
                </div>
                <button
                  onClick={() => setIsGrantModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleGrantSubmit} className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target User</label>
                  <select
                    value={grantFormData.user}
                    onChange={(e) => {
                      const u = users.find((x) => x.name === e.target.value);
                      setGrantFormData({
                        ...grantFormData,
                        user: e.target.value,
                        role: u?.role || grantFormData.role,
                      });
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.name}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assigned Role</label>
                    <input
                      type="text"
                      disabled
                      value={grantFormData.role}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Workspace</label>
                    <input
                      type="text"
                      disabled
                      value={grantFormData.workspace}
                      className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Target Resource / Folder</label>
                  <input
                    type="text"
                    required
                    value={grantFormData.resource}
                    onChange={(e) => setGrantFormData({ ...grantFormData, resource: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:border-[var(--brand)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Permission Type</label>
                    <select
                      value={grantFormData.permission}
                      onChange={(e) => setGrantFormData({ ...grantFormData, permission: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                    >
                      <option value="Clean Room View">Clean Room View</option>
                      <option value="Download with Watermark">Download with Watermark</option>
                      <option value="Full Read-Write Access">Full Read-Write Access</option>
                      <option value="Q&A Inquiry Submission">Q&A Inquiry Submission</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expiration Date</label>
                    <input
                      type="date"
                      required
                      value={grantFormData.expiration}
                      onChange={(e) => setGrantFormData({ ...grantFormData, expiration: e.target.value })}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Business Reason & Scope</label>
                  <textarea
                    rows={2}
                    required
                    value={grantFormData.reason}
                    onChange={(e) => setGrantFormData({ ...grantFormData, reason: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 font-medium focus:border-[var(--brand)]"
                    placeholder="Provide justification for compliance audit recording..."
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setIsGrantModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    Confirm & Grant Access
                  </button>
                </div>
              </form>
            </div>
          </div>
        </ModalPortal>
      )}

      {/* ── G. CONFIRM SAVE PERMISSIONS MODAL ── */}
      {showConfirmSaveModal && (
        <ModalPortal>
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 font-sans">
            <div
              onClick={() => setShowConfirmSaveModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            />
            <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Confirm Permission Updates
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applying {Object.keys(stagedEdits).length} modifications to active matrix
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                Saving these changes will immediately alter counterparty security access and automatically record verifiable audit events in the forensic ledger.
              </p>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  onClick={() => setShowConfirmSaveModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Keep Editing
                </button>
                <button
                  onClick={handleSaveEdits}
                  className="px-4 py-2 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  Save & Log to Audit
                </button>
              </div>
            </div>
          </div>
        </ModalPortal>
      )}
    </div>
  );
}
