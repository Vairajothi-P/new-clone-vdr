"use client";

import React, { useEffect } from "react";
import { X, ShieldCheck } from "lucide-react";
import ModalPortal from "@/components/ui/ModalPortal";

export default function DetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  badge = null,
  children,
  footer = null,
  width = "max-w-xl", // max-w-lg | max-w-xl | max-w-2xl
}) {
  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <ModalPortal>
      <div className="fixed inset-0 z-[100] flex justify-end font-sans">
        {/* Backdrop */}
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
        />

        {/* Drawer Panel */}
        <div
          className={`relative z-10 w-full ${width} bg-white h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-out border-l border-slate-200 animate-in slide-in-from-right`}
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-slate-100 flex items-start justify-between gap-4 bg-slate-50/50">
            <div>
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-base font-bold text-slate-900">
                  {title}
                </h3>
                {badge && <div>{badge}</div>}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {subtitle}
                </p>
              )}
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors shrink-0"
              title="Close panel (Esc)"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </ModalPortal>
  );
}
