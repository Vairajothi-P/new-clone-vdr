"use client";

import React from 'react';

export default function ControlCenter({ tasks, currentDealStage }) {
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
    const milestonesCompleted = phaseTasks.filter(t => t.isStageGate && t.status === 'completed').length;
    const totalMilestones = phaseTasks.filter(t => t.isStageGate).length;
    return { 
      id: phase,
      name: phase === 'dd' ? 'Due Diligence' : phase.charAt(0).toUpperCase() + phase.slice(1), 
      progress, 
      total: phaseTasks.length, 
      completed: phaseCompleted,
      totalMilestones,
      milestonesCompleted
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

      {/* Execution Phases - Premium Card */}
      <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 rounded-3xl p-8 shadow-sm">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 tracking-tight">Execution Phases</h2>
        </div>
        <div className="space-y-6">
          {phaseStats.map((p, idx) => {
            const isActive = p.id === currentDealStage;
            return (
              <div key={p.name} className={`p-4 rounded-lg border transition-colors ${isActive ? 'bg-[var(--brand-50,theme(colors.blue.50))] border-[var(--brand-200,theme(colors.blue.200))]' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                    <span className={`w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold ${isActive ? 'bg-[var(--brand,theme(colors.blue.600))] text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {idx + 1}
                    </span>
                    {p.name}
                    {isActive && (
                      <span className="ml-2 text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-white text-[var(--brand,theme(colors.blue.600))] border border-[var(--brand-200,theme(colors.blue.200))]">
                        ACTIVE STAGE
                      </span>
                    )}
                  </span>
                  <div className="flex items-center gap-4 text-xs font-semibold">
                    {p.totalMilestones > 0 && (
                      <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${isActive ? 'bg-purple-50 text-purple-700 border-purple-200/50' : 'bg-white text-slate-500 border-slate-200 shadow-sm'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
                        {p.milestonesCompleted} / {p.totalMilestones} Milestones
                      </span>
                    )}
                    <span className={isActive ? 'text-[var(--brand,theme(colors.blue.600))]' : 'text-slate-500'}>
                      {p.completed} / {p.total} Tasks ({p.progress}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200/50 rounded-full h-2.5 overflow-hidden shadow-inner">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${isActive ? 'bg-gradient-to-r from-[var(--brand,theme(colors.blue.500))] to-[var(--brand,theme(colors.blue.700))]' : 'bg-slate-400'}`} 
                    style={{ width: `${p.progress}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, alert, textColor = "text-slate-900" }) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 hover:shadow-[0_8px_20px_-4px_rgba(0,0,0,0.1)] hover:-translate-y-1 ${alert ? 'border-red-200/60 bg-red-50/10' : 'border-slate-200/60'}`}>
      <h3 className="text-[13px] font-bold text-slate-500/80 uppercase tracking-widest">{title}</h3>
      <div className="mt-3">
        <p className={`text-4xl font-black tracking-tight drop-shadow-sm ${alert ? 'text-red-500' : textColor}`}>
          {value}
        </p>
      </div>
      {subtitle && <p className="mt-3 text-xs font-semibold text-slate-400">{subtitle}</p>}
    </div>
  );
}
