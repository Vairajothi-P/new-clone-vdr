"use client";

import React from 'react';

export default function ControlCenter({ tasks }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
  const blockedTasks = tasks.filter(t => t.status === 'blocked').length;
  const overdueTasks = tasks.filter(t => t.status === 'overdue').length;
  const riskTasks = tasks.filter(t => t.riskImpact === 'high').length;

  const completionPercent = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const phases = ['preparation', 'dd', 'negotiation', 'closing'];
  const phaseStats = phases.map(phase => {
    const phaseTasks = tasks.filter(t => t.stage === phase);
    const phaseCompleted = phaseTasks.filter(t => t.status === 'completed').length;
    const progress = phaseTasks.length === 0 ? 0 : Math.round((phaseCompleted / phaseTasks.length) * 100);
    return { 
      name: phase === 'dd' ? 'Due Diligence' : phase.charAt(0).toUpperCase() + phase.slice(1), 
      progress, 
      total: phaseTasks.length, 
      completed: phaseCompleted 
    };
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Clean White Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard 
          title="Overall Progress" 
          value={`${completionPercent}%`} 
          subtitle={`${completedTasks} of ${totalTasks} completed`} 
          textColor="text-[var(--brand)]"
        />
        <MetricCard 
          title="Open Work" 
          value={inProgressTasks} 
        />
        <MetricCard 
          title="Overdue Items" 
          value={overdueTasks} 
          alert={overdueTasks > 0} 
        />
        <MetricCard 
          title="Blocked Work" 
          value={blockedTasks} 
          alert={blockedTasks > 0} 
        />
        <MetricCard 
          title="Deal Risks" 
          value={riskTasks} 
          alert={riskTasks > 0} 
        />
      </div>

      {/* Execution Phases - Clean White Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Execution Phases</h2>
        </div>
        <div className="space-y-6">
          {phaseStats.map((p, idx) => (
            <div key={p.name}>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded bg-slate-100 text-[10px] text-slate-500 font-bold">
                    {idx + 1}
                  </span>
                  {p.name}
                </span>
                <span className="text-xs font-semibold text-slate-500">
                  {p.completed} / {p.total} ({p.progress}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-[var(--brand,theme(colors.blue.600))] h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${p.progress}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, alert, textColor = "text-slate-900" }) {
  return (
    <div className={`bg-white rounded-xl p-5 border shadow-sm transition-shadow hover:shadow-md ${alert ? 'border-red-200' : 'border-slate-200'}`}>
      <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{title}</h3>
      <div className="mt-3">
        <p className={`text-3xl font-bold tracking-tight ${alert ? 'text-red-600' : textColor}`}>
          {value}
        </p>
      </div>
      {subtitle && <p className="mt-2 text-[11px] font-semibold text-slate-400">{subtitle}</p>}
    </div>
  );
}
