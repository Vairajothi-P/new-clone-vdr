"use client";

import React from 'react';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function SummaryCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  colorScheme = 'brand',
  progress,
}) {
  const colorMap = {
    brand: {
      bg: 'border-slate-200',
      iconBg: 'bg-[var(--brand)]',
      text: 'text-[var(--brand)]',
    },
    emerald: {
      bg: 'border-slate-200',
      iconBg: 'bg-emerald-600',
      text: 'text-emerald-600',
    },
    amber: {
      bg: 'border-slate-200',
      iconBg: 'bg-amber-600',
      text: 'text-amber-600',
    },
    purple: {
      bg: 'border-slate-200',
      iconBg: 'bg-purple-600',
      text: 'text-purple-600',
    },
  };

  const currentStyle = colorMap[colorScheme] || colorMap.brand;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:border-slate-300 transition-all">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-sm font-semibold text-slate-600 block mb-1">
            {title}
          </span>
          <div className="text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </div>
        </div>

        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${currentStyle.iconBg} flex items-center justify-center text-white shrink-0 shadow-sm`}>
            <Icon className="text-xl" />
          </div>
        )}
      </div>

      {/* Progress bar if provided */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span>Utilization</span>
            <span className="text-slate-700">{progress}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--brand)] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer / Subtitle */}
      <div className="mt-4 flex items-center justify-between text-[13px] pt-3 border-t border-slate-100">
        <span className="text-slate-500">{subtitle}</span>
        {trend && (
          <span
            className={`inline-flex items-center gap-1 font-semibold ${
              trendPositive ? 'text-emerald-600' : 'text-rose-600'
            }`}
          >
            {trendPositive ? <FaArrowUp className="text-[11px]" /> : <FaArrowDown className="text-[11px]" />}
            <span>{trend}</span>
          </span>
        )}
      </div>
    </div>
  );
}
