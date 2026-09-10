"use client";

import React from 'react';

export default function StatusReport({ tasks }) {
  const totalTasks = tasks.length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const overdue = tasks.filter(t => t.status === 'overdue');
  const blocked = tasks.filter(t => t.status === 'blocked');
  const completionPercent = totalTasks === 0 ? 0 : Math.round((completed / totalTasks) * 100);

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-10 animate-in fade-in duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-start border-b border-slate-200 pb-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Deal Status Report</h1>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Generated on {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[var(--brand,theme(colors.blue.600))] hover:bg-[var(--brand,theme(colors.blue.700))] rounded-lg shadow-sm transition-colors">
            Email Board
          </button>
          <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            Print PDF
          </button>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mb-10">
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
          Executive Summary
        </h2>
        <div className="bg-slate-50 rounded-lg p-5 border border-slate-100">
          <p className="text-slate-700 leading-relaxed text-sm font-medium">
            Overall deal execution stands at <strong className="text-[var(--brand)]">{completionPercent}%</strong> completion. 
            Currently, there are <strong className="text-red-600">{blocked.length}</strong> items marked as blocked requiring immediate attention. 
            {overdue.length > 0 ? ` Additionally, ${overdue.length} critical path items are overdue.` : ' The timeline is proceeding according to schedule with no overdue items.'}
          </p>
        </div>
      </div>

      {/* Attention Required */}
      {(blocked.length > 0 || overdue.length > 0) && (
        <div className="mb-10">
          <h2 className="text-[11px] font-bold text-red-500 uppercase tracking-widest mb-3">
            Critical Bottlenecks
          </h2>
          <div className="rounded-lg border border-red-200 overflow-hidden bg-white">
            <ul className="divide-y divide-red-100">
              {[...blocked, ...overdue].map(task => (
                <li key={task.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${task.status === 'blocked' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-bold text-slate-900">{task.title}</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-500">Assigned to: {task.assignee}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Risk Impact</span>
                    <p className={`text-xs font-bold mt-1 uppercase ${task.riskImpact === 'high' ? 'text-red-600' : 'text-orange-600'}`}>
                      {task.riskImpact}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Workstream Progress */}
      <div>
        <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-4">
          Workstream Progress
        </h2>
        <div className="space-y-5 bg-white border border-slate-200 rounded-lg p-6">
          {['Legal', 'Financial', 'Executive'].map(role => {
            const roleTasks = tasks.filter(t => t.role === role);
            const rCompleted = roleTasks.filter(t => t.status === 'completed').length;
            const rProgress = roleTasks.length === 0 ? 0 : Math.round((rCompleted / roleTasks.length) * 100);
            return (
              <div key={role} className="flex items-center gap-4">
                <div className="w-1/4 text-sm font-bold text-slate-800">{role}</div>
                <div className="w-1/2">
                  <div className="w-full bg-slate-100 rounded-full h-2 border border-slate-200">
                    <div 
                      className="bg-[var(--brand)] h-full rounded-full transition-all duration-1000" 
                      style={{ width: `${rProgress}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-1/4 text-right text-sm font-bold text-slate-700">
                  {rProgress}%
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
