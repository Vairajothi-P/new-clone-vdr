"use client";

import React from 'react';
import { useTasks } from './TasksContext';

export default function TasksHeader() {
  const { currentDealStage, viewMode, setViewMode, setIsCreating } = useTasks();

  return (
    <div className="bg-white border-b border-slate-200 shrink-0 relative z-10">
      {/* Clean top accent line */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--brand,theme(colors.blue.600))] opacity-90"></div>

      <div className="w-full px-8 lg:px-10">
        <div className="flex justify-between items-center py-6">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Task & Workflow
              </h1>
              <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                STAGE: {currentDealStage}
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-1">Streamline deal execution and track milestones.</p>
          </div>
          <div className="flex items-center gap-5">

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
