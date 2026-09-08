"use client";

import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumbs = [], // [{ label, href }]
  actions = null,
  className = "",
}) {
  return (
    <div className={`mb-6 font-sans ${className}`}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-2">
          <Link
            href="/control-audits"
            className="hover:text-[var(--brand)] transition-colors font-medium"
          >
            Controls & Audit
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={12} className="text-slate-300" />
              {crumb.href ? (
                <Link
                  href={crumb.href}
                  className="hover:text-[var(--brand)] transition-colors font-medium"
                >
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-slate-600 font-semibold">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      {/* Main Title + Actions row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              {title}
            </h1>
            {badge && <div>{badge}</div>}
          </div>
          {subtitle && (
            <p className="text-xs md:text-sm text-slate-500 mt-1 font-medium max-w-3xl leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
