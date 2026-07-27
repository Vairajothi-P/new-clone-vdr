"use client";

import React from "react";
import { formatDealValue, formatExpiryDate, getExpiryStatus } from "@/lib/workspaces/formatters";
import { FaEdit, FaTrash, FaUsers, FaHdd, FaCalendarAlt, FaBriefcase, FaShieldAlt } from "react-icons/fa";

export default function WorkspaceCard({ workspace, onEdit, onDelete }) {
  const {
    id,
    name,
    type = "Virtual Data Room",
    dealType = "",
    dealValue = "",
    currency = "USD",
    expiryDate = "",
    usersCount = 0,
    storageMB = 0,
  } = workspace;

  const expiryStatus = getExpiryStatus(expiryDate);
  const formattedValue = formatDealValue(dealValue, currency);
  const formattedExpiry = formatExpiryDate(expiryDate);

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow transition-all duration-200 flex flex-col justify-between overflow-hidden">
      {/* Top Brand Accent Bar */}
      <div className="h-1 w-full bg-[var(--brand)] opacity-90 group-hover:opacity-100 transition-opacity" />

      {/* Card Header */}
      <div className="p-4 pb-2.5">
        <div className="flex items-center justify-between gap-2 mb-2">
          {/* Workspace Type Tag + Status */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[var(--brand)]/10 text-[var(--brand)] border border-[var(--brand)]/20">
              <FaShieldAlt className="text-[var(--brand)] text-[10px]" />
              {type}
            </span>

            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border ${expiryStatus.bgClass} ${expiryStatus.colorClass}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${expiryStatus.dotClass}`} />
              {expiryStatus.label}
            </span>
          </div>

          {/* Actions Button Group */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={() => onEdit(workspace)}
              title="Edit Workspace"
              aria-label="Edit Workspace"
              className="p-1.5 text-gray-400 hover:text-[var(--brand)] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <FaEdit className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(workspace)}
              title="Delete Workspace"
              aria-label="Delete Workspace"
              className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            >
              <FaTrash className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Workspace Name */}
        <h3 className="text-base font-bold text-gray-900 group-hover:text-[var(--brand)] transition-colors line-clamp-1 mb-0.5">
          {name}
        </h3>

        {/* Deal Type Subtitle */}
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <FaBriefcase className="text-gray-400 text-[11px]" />
          <span>{dealType ? dealType : "General Transaction"}</span>
        </p>
      </div>

      {/* Card Body - Financial & Expiry Information */}
      <div className="px-4 py-2.5 border-t border-b border-gray-100 bg-gray-50/50 flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Deal Value
          </span>
          <span className="text-sm font-bold text-gray-900">
            {formattedValue}
          </span>
        </div>

        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
            Expiry Date
          </span>
          <span className="text-xs font-semibold text-gray-700 flex items-center justify-end gap-1">
            <FaCalendarAlt className="text-gray-400 text-[11px]" />
            {formattedExpiry}
          </span>
        </div>
      </div>

      {/* Card Footer - Users Count & Storage (Defaults 0 & 0 MB) */}
      <div className="px-4 py-2 bg-white flex items-center justify-between text-xs text-gray-600">
        {/* Users Count */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)]">
            <FaUsers className="w-3 h-3" />
          </div>
          <div>
            <span className="text-gray-900 font-bold">{usersCount}</span>
            <span className="text-gray-500 ml-1">users</span>
          </div>
        </div>

        {/* Storage Count */}
        <div className="flex items-center gap-1.5">
          <div className="w-6 h-6 rounded-lg bg-[var(--brand)]/10 flex items-center justify-center text-[var(--brand)]">
            <FaHdd className="w-3 h-3" />
          </div>
          <div>
            <span className="text-gray-900 font-bold">{storageMB}</span>
            <span className="text-gray-500 ml-1">MB storage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
