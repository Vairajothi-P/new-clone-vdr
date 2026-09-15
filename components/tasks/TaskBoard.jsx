"use client";

import React, { useState } from 'react';

export default function TaskBoard({ tasks, allTasks, onTaskClick, viewMode }) {
  const [filterRole, setFilterRole] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStage, setFilterStage] = useState('All');

  const columns = [
    { id: 'not_started', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'blocked', label: 'Blocked' },
    { id: 'audit', label: 'Audit' },
    { id: 'completed', label: 'Done' }
  ];

  const filteredTasks = tasks.filter(t => {
    if (filterRole !== 'All' && t.role !== filterRole) return false;
    if (filterPriority !== 'All' && t.priority !== filterPriority) return false;
    if (filterStage !== 'All' && t.stage !== filterStage) return false;
    return true;
  });

  const getPriorityStyle = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-50 text-red-700 border-red-200';
      case 'Medium': return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Low': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch(type) {
      case 'milestone': return '🏆';
      case 'recurring': return '🔄';
      default: return '📝';
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4 animate-in fade-in duration-300">
      
      {/* Sleek Filters */}
      <div className="flex gap-4 border-b border-slate-200/60 pb-4">
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          className="text-sm font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl py-2 px-4 focus:ring-2 focus:ring-[var(--brand,theme(colors.blue.500))] focus:border-transparent outline-none shadow-sm hover:bg-slate-50 transition-colors"
        >
          <option value="All">All Roles</option>
          <option value="Legal">Legal</option>
          <option value="Financial">Financial</option>
          <option value="Executive">Executive</option>
        </select>

        <select 
          value={filterPriority} 
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-sm font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl py-2 px-4 focus:ring-2 focus:ring-[var(--brand,theme(colors.blue.500))] focus:border-transparent outline-none shadow-sm hover:bg-slate-50 transition-colors"
        >
          <option value="All">All Priorities</option>
          <option value="High">High Priority</option>
          <option value="Medium">Medium Priority</option>
          <option value="Low">Low Priority</option>
        </select>

        <select 
          value={filterStage} 
          onChange={(e) => setFilterStage(e.target.value)}
          className="text-sm font-semibold text-slate-700 bg-white border border-slate-200/80 rounded-xl py-2 px-4 focus:ring-2 focus:ring-[var(--brand,theme(colors.blue.500))] focus:border-transparent outline-none shadow-sm hover:bg-slate-50 transition-colors"
        >
          <option value="All">All Stages</option>
          <option value="preparation">Preparation</option>
          <option value="dd">Due Diligence</option>
          <option value="negotiation">Negotiation</option>
          <option value="closing">Closing</option>
        </select>
      </div>

      {/* Premium Kanban Board */}
      <div className="flex gap-5 overflow-x-auto pb-4 flex-1 items-start pt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          
          return (
            <div key={col.id} className="min-w-[300px] w-[300px] shrink-0 bg-slate-100/50 rounded-lg p-3 flex flex-col max-h-full border border-slate-200/50">
              
              <div className="flex justify-between items-center mb-4 px-2 pt-1">
                <h3 className="text-[13px] font-bold text-slate-700 tracking-wide">{col.label}</h3>
                <span className="text-[10px] font-black bg-white text-slate-500 px-2 py-0.5 rounded-full border border-slate-200/80 shadow-sm">
                  {colTasks.length}
                </span>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-1 pb-1 flex-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {colTasks.map(task => {
                  const hasDependencies = task.dependencies && task.dependencies.length > 0;
                  const isBlockedByDependency = hasDependencies && task.dependencies.some(depId => {
                    const dep = allTasks.find(t => t.id === depId);
                    return dep && dep.status !== 'completed';
                  });
                  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'completed';

                  return (
                    <div 
                      key={task.id}
                      onClick={() => onTaskClick(task)}
                      className={`bg-white/90 backdrop-blur-sm border rounded-md p-4 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_20px_-6px_rgba(0,0,0,0.1)] hover:-translate-y-1 cursor-pointer transition-all duration-300 group relative flex flex-col h-[170px] ${isOverdue ? 'border-red-200 bg-red-50/20' : 'border-slate-200/80 hover:border-slate-300'}`}
                    >
                      {/* Hover subtle glow on left */}
                      <div className={`absolute left-0 top-3 bottom-3 w-1 ${isOverdue ? 'bg-red-400' : 'bg-[var(--brand,theme(colors.blue.500))]'} opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-r-md`}></div>

                      <div className="flex justify-between items-start mb-3 shrink-0">
                        <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md border ${getPriorityStyle(task.priority)}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80"></span>
                          <span className="text-[10px] font-bold uppercase tracking-wider">
                            {task.priority}
                          </span>
                        </div>
                        <div className="flex gap-1.5 items-center">
                          {task.isStageGate && (
                            <span className="text-[10px] uppercase font-black tracking-wider text-purple-600 bg-purple-50 border border-purple-100/80 px-2 py-0.5 rounded-md shadow-sm">
                              MILESTONE
                            </span>
                          )}
                          {isOverdue && (
                            <span className="text-[10px] uppercase font-black tracking-wider text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md shadow-sm">
                              OVERDUE
                            </span>
                          )}
                          {task.riskImpact === 'high' && !isOverdue && (
                            <span className="text-[10px] uppercase font-black tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-md shadow-sm">
                              RISK
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <h4 className="text-[15px] font-bold text-slate-800 mb-2 leading-snug group-hover:text-[var(--brand,theme(colors.blue.600))] transition-colors line-clamp-2">
                        {task.title}
                      </h4>

                      {isBlockedByDependency && col.id !== 'completed' && (
                        <div className="mb-3 shrink-0">
                          <span className="text-[10px] font-semibold text-red-600/80 flex items-center gap-1 truncate max-w-full">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                            Blocked by Dependency
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto pt-3 shrink-0 border-t border-slate-100/80">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-300 flex items-center justify-center text-[10px] font-black text-slate-600 shadow-sm">
                            {task.assignee.charAt(0)}
                          </div>
                          <span className="text-xs font-semibold text-slate-500 truncate max-w-[100px]">
                            {task.assignee}
                          </span>
                        </div>
                        
                        <div className="flex gap-2">
                          {task.linkedDocumentId && (
                            <div className="flex items-center justify-center w-6 h-6 text-[var(--brand,theme(colors.blue.600))] bg-blue-50/50 rounded-md border border-blue-100/50" title="Has Linked Document">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                            </div>
                          )}
                          <div className="flex items-center justify-center w-6 h-6 text-slate-400 bg-slate-50/50 rounded-md border border-slate-100/80" title={`Task Type: ${task.taskType}`}>
                            <span className="text-xs">{getTaskTypeIcon(task.taskType)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
