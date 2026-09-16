"use client";

import React from 'react';
import { useTasks } from './TasksContext';

export default function TasksHeader() {
  const { currentDealStage, viewMode, setViewMode, setIsCreating } = useTasks();

  return (
    <div className="bg-gradient-to-r from-[var(--brand-50,theme(colors.blue.50))] to-white border-b border-[var(--brand-100,theme(colors.blue.100))] shrink-0 relative z-10">
      {/* Premium brand accent line */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[var(--brand,theme(colors.blue.600))] to-[var(--brand-secondary,theme(colors.teal.500))]"></div>

      <div className="w-full px-8 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:justify-between items-start lg:items-center py-4 lg:py-6 gap-4 lg:gap-0">
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2 lg:gap-4">
              <h1 className="text-xl lg:text-2xl font-bold tracking-tight text-[var(--brand-dark,theme(colors.slate.900))]">
                Task & Workflow
              </h1>
              <span className="text-[10px] lg:text-[11px] font-bold tracking-wider uppercase px-2 lg:px-2.5 py-1 rounded-md bg-white text-[var(--brand,theme(colors.blue.600))] border border-[var(--brand-200,theme(colors.blue.200))] flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--brand,theme(colors.blue.500))] animate-pulse"></span>
                STAGE: {currentDealStage}
              </span>
            </div>
            <p className="text-xs lg:text-sm text-slate-500 mt-1">Streamline deal execution and track milestones.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 lg:gap-5 w-full lg:w-auto">

            {/* Premium Segmented Control */}
            <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 shadow-inner">
              <button
                onClick={() => setViewMode('Seller')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${viewMode === 'Seller' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                Seller View
              </button>
              <button
                onClick={() => setViewMode('Buyer')}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${viewMode === 'Buyer' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
              >
                Buyer View
              </button>
            </div>

            {viewMode === 'Seller' && (
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[var(--brand,theme(colors.blue.600))] hover:bg-[var(--brand,theme(colors.blue.700))] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand)]"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                New Task
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
