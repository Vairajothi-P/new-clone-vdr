"use client";

import React from "react";
import { Search, X, SlidersHorizontal, RotateCcw } from "lucide-react";

export default function FilterBar({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters = [], // Array of { key, label, value, options: [{ label, value }], onChange }
  onResetFilters,
  hasActiveFilters = false,
  rightActions = null,
  className = "",
}) {
  return (
    <div
      className={`bg-white border border-slate-200/80 rounded-2xl p-3 shadow-xs flex flex-wrap items-center justify-between gap-3 font-sans ${className}`}
    >
      {/* Left section: Search + Filter Dropdowns */}
      <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
        {/* Search input */}
        <div className="relative min-w-[220px] max-w-[320px] flex-1">
          <Search
            size={14}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange && onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-8 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 text-slate-800 placeholder:text-slate-400 font-medium transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange && onSearchChange("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        {filters.map((filter) => (
          <div key={filter.key} className="relative">
            <select
              value={filter.value}
              onChange={(e) => filter.onChange && filter.onChange(e.target.value)}
              className="h-8.5 pl-3 pr-8 py-1.5 text-xs bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:border-slate-300 focus:outline-none focus:border-[var(--brand)] focus:ring-2 focus:ring-[var(--brand)]/10 shadow-2xs transition-all cursor-pointer appearance-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 0.6rem center",
                backgroundSize: "0.85em",
              }}
            >
              {filter.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        ))}

        {/* Clear Filters button */}
        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl border border-rose-200/80 transition-colors"
            title="Reset all filters"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Right section: Actions (e.g. Export, Refresh, etc.) */}
      {rightActions && (
        <div className="flex items-center gap-2 shrink-0">
          {rightActions}
        </div>
      )}
    </div>
  );
}
