"use client";

import React from "react";
import { FaShieldAlt, FaPlus, FaSearch, FaTimes } from "react-icons/fa";

export default function WorkspaceHeader({
  totalCount,
  searchQuery,
  onSearchChange,
  onAddWorkspace,
}) {
  return (
    <div className="mb-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-200">
        {/* Left Title Area */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--brand)]/10 border border-[var(--brand)]/20 flex items-center justify-center text-[var(--brand)] shrink-0">
            <FaShieldAlt className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                Workspaces
              </h1>
              <span className="text-[11px] font-bold px-2 py-0.5 bg-[var(--brand)]/10 text-[var(--brand)] rounded-md border border-[var(--brand)]/20 uppercase tracking-wider">
                {totalCount} {totalCount === 1 ? "Workspace" : "Workspaces"}
              </span>
            </div>
            <p className="text-gray-500 text-sm">
              Manage secure Virtual Data Rooms and transaction portals.
            </p>
          </div>
        </div>

        {/* Right Search Box and Add Workspace Button */}
        <div className="flex items-center gap-2.5">
          {/* Search Box - Visible when workspaces exist */}
          {totalCount > 0 && (
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
              <input
                type="text"
                placeholder="Search workspaces..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-48 sm:w-60 h-10 pl-8 pr-8 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <FaTimes className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Add Workspace Button - Single + Icon */}
          <button
            onClick={onAddWorkspace}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[var(--brand)] hover:bg-[var(--brand-dark)] text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all duration-200 shrink-0"
          >
            <FaPlus className="w-3 h-3" />
            <span>Add Workspace</span>
          </button>
        </div>
      </div>
    </div>
  );
}
