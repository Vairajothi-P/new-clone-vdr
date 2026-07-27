"use client";

import React from "react";
import { FaPlus } from "react-icons/fa";

export default function WorkspaceEmptyState({ onAddWorkspace }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8 bg-white rounded-2xl border border-gray-200 shadow-[0_2px_12px_rgb(0,0,0,0.02)] transition-all duration-300">
      {/* Compact Icon Container */}
      <div className="w-14 h-14 rounded-2xl bg-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center mb-4 text-[var(--brand)] shadow-sm">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          <rect x="8" y="11" width="8" height="6" rx="1" className="fill-[var(--brand)]/10 stroke-[var(--brand)]" />
        </svg>
      </div>

      {/* Required Exact Centered Message */}
      <h2 className="text-xl font-bold text-gray-900 tracking-tight mb-1 text-center">
        No Workspaces Found
      </h2>

      <p className="text-[14px] text-gray-500 max-w-sm text-center mb-6 leading-relaxed">
        Your Virtual Data Room is currently empty. Get started by creating your first secure workspace.
      </p>

      {/* Single + Icon Button */}
      <button
        onClick={onAddWorkspace}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white font-medium text-sm rounded-xl shadow-sm hover:shadow transition-all duration-200"
      >
        <FaPlus className="w-3 h-3" />
        <span>Add Workspace</span>
      </button>
    </div>
  );
}
