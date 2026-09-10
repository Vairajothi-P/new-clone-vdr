"use client";

import React, { useState } from 'react';

export default function TaskBoard({ tasks, allTasks, onTaskClick }) {
  const [filterRole, setFilterRole] = useState('All');
  const [filterPriority, setFilterPriority] = useState('All');
  const [filterStage, setFilterStage] = useState('All');

  const columns = [
    { id: 'not_started', label: 'To Do' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'blocked', label: 'Blocked' },
    { id: 'under_review', label: 'Review' },
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
      
      {/* Clean Filters */}
      <div className="flex gap-4 border-b border-slate-200 pb-4">
        <select 
          value={filterRole} 
          onChange={(e) => setFilterRole(e.target.value)}
          className="text-sm font-medium border border-slate-200 bg-white rounded-md py-1.5 px-3 focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] outline-none shadow-sm"
        >
          <option value="All">All Roles</option>
          <option value="Legal">Legal</option>
          <option value="Financial">Financial</option>
          <option value="Executive">Executive</option>
        </select>

        <select 
          value={filterPriority} 
          onChange={(e) => setFilterPriority(e.target.value)}
          className="text-sm font-medium border border-slate-200 bg-white rounded-md py-1.5 px-3 focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] outline-none shadow-sm"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select 
          value={filterStage} 
          onChange={(e) => setFilterStage(e.target.value)}
          className="text-sm font-medium border border-slate-200 bg-white rounded-md py-1.5 px-3 focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] outline-none shadow-sm"
        >
          <option value="All">All Stages</option>
          <option value="preparation">Preparation</option>
          <option value="dd">Due Diligence</option>
          <option value="negotiation">Negotiation</option>
          <option value="closing">Closing</option>
        </select>
      </div>

      {/* Clean Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-start hide-scrollbar pt-2">
        {columns.map(col => {
          const colTasks = filteredTasks.filter(t => t.status === col.id);
          
          return (
            <div key={col.id} className="min-w-[280px] w-[280px] shrink-0 bg-slate-50 border border-slate-200 rounded-lg p-3 flex flex-col max-h-full">
              
              <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-sm font-bold text-slate-800">{col.label}</h3>
                <span className="text-[11px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200 shadow-sm">
                  {colTasks.length}
                </span>
              </div>
              
              <div className="space-y-3 overflow-y-auto pr-1 pb-1 flex-1">
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
                      className={`bg-white border rounded-md p-3.5 shadow-sm hover:shadow-md cursor-pointer transition-all group relative flex flex-col h-40 ${isOverdue ? 'border-red-300 hover:border-red-400 bg-red-50/30' : 'border-slate-200 hover:border-slate-300'}`}
                    >
                      {/* Brand color left accent on hover */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${isOverdue ? 'bg-red-500' : 'bg-[var(--brand)]'} opacity-0 group-hover:opacity-100 transition-opacity rounded-l-md`}></div>

                      <div className="flex justify-between items-start mb-3 shrink-0">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${getPriorityStyle(task.priority)}`}>
                          {task.priority}
                        </span>
                        <div className="flex gap-1.5">
                          {isOverdue && (
                            <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                              OVERDUE
                            </span>
                          )}
                          {task.riskImpact === 'high' && !isOverdue && (
                            <span className="text-[10px] uppercase font-bold text-red-600 bg-red-50 border border-red-100 px-1.5 py-0.5 rounded">
                              RISK
                            </span>
                          )}
                          <span title={`Task Type: ${task.taskType}`} className="text-xs bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
                            {getTaskTypeIcon(task.taskType)}
                          </span>
                        </div>
                      </div>
                      
                      <h4 className="text-sm font-semibold text-slate-900 mb-2 leading-snug group-hover:text-[var(--brand)] transition-colors line-clamp-2">
                        {task.title}
                      </h4>

                      {isBlockedByDependency && col.id !== 'completed' && (
                        <div className="mb-3 shrink-0">
                          <span className="text-[9px] font-bold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded truncate max-w-full inline-block">
                            Blocked by Dependency
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between mt-auto pt-2 shrink-0 border-t border-slate-100">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] font-bold text-slate-600">
                            {task.assignee.charAt(0)}
                          </div>
                          <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[100px]">
                            {task.assignee}
                          </span>
                        </div>
                        
                        {task.linkedDocumentId && (
                          <div className="text-[9px] font-bold text-[var(--brand)] bg-[var(--brand-50,theme(colors.blue.50))] px-1.5 py-0.5 rounded border border-[var(--brand-200,theme(colors.blue.200))]">
                            DOC
                          </div>
                        )}
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
