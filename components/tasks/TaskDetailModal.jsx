"use client";

import React, { useState } from 'react';

export default function TaskDetailModal({ task, allTasks = [], onClose, onUpdate, viewMode = 'Seller' }) {
  const [activeTab, setActiveTab] = useState('details');
  const [status, setStatus] = useState(task.status || 'in_progress');

  if (!task) return null;

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onUpdate({ ...task, status: newStatus });
  };

  const hasDependencies = task.dependencies && task.dependencies.length > 0;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && status !== 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-6xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/40 flex overflow-hidden max-h-[90vh]">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-r border-slate-200 bg-white">
          
          {/* Header */}
          <div className="p-6 border-b border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">{task.title || 'Review draft NDA'}</h2>
                  <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-purple-50 text-purple-600 border border-purple-200">
                    {task.role || 'Legal'}
                  </span>
                  {isOverdue && (
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                      OVERDUE
                    </span>
                  )}
                  {(task.priority === 'High' || task.riskImpact === 'high') && !isOverdue && (
                    <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-200">
                      High
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500 font-medium">Assigned To:</span>
                  <div className="flex items-center gap-1.5 bg-slate-100 rounded-full pr-3 pl-1 py-1">
                    <div className="w-5 h-5 rounded-full bg-[var(--brand,theme(colors.blue.600))] text-white flex items-center justify-center text-[10px] font-bold">
                      {task.assignee ? task.assignee.charAt(0).toUpperCase() : 'P'}
                    </div>
                    <span className="text-xs font-bold text-slate-700">{task.assignee || 'Priya Menon'}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
                  Edit Task
                </button>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-200 -mx-6 px-6 pt-2">
              {['Details', 'Activity', 'Comments', 'Files (1)'].map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase().split(' ')[0])}
                  className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors ${
                    activeTab === tab.toLowerCase().split(' ')[0] 
                      ? 'border-[var(--brand,theme(colors.blue.600))] text-[var(--brand,theme(colors.blue.600))]' 
                      : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {activeTab === 'details' && (
              <div className="flex gap-8">
                {/* Left Mini Column */}
                <div className="w-48 shrink-0 space-y-6">
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Role</p>
                    <p className="text-sm font-bold text-slate-900">{task.role || 'Legal'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Status</p>
                    <span className="inline-flex text-[11px] font-bold uppercase px-2 py-1 rounded bg-[var(--brand-50,theme(colors.blue.50))] text-[var(--brand,theme(colors.blue.600))] border border-[var(--brand-200,theme(colors.blue.200))]">
                      {status.replace('_', ' ')}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Due Date</p>
                    <p className="text-sm font-bold text-slate-900">{task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '15 May 2025'}</p>
                    <p className="text-xs text-red-600 font-medium mt-0.5">(in 3 days)</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Deal Stage</p>
                    <span className="inline-flex text-[11px] font-bold uppercase px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                      {task.stage || 'Preparation'}
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Created By</p>
                    <p className="text-sm font-medium text-slate-900">{task.createdBy || 'Ananya Mehta'}</p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">Created On</p>
                    <p className="text-sm font-medium text-slate-900">10 May 2025, 10:30 AM</p>
                  </div>
                </div>

                {/* Right Wide Column */}
                <div className="flex-1 space-y-8 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                  
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">What needs to be completed?</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {task.description || "Review the draft NDA and provide comments. Ensure all commercial terms are accurate."}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Linked Document</h3>
                    <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200 rounded-lg max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[var(--brand-100,theme(colors.blue.100))] text-[var(--brand,theme(colors.blue.600))] rounded flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">NDA_Draft_v2.docx</p>
                          <p className="text-[11px] text-slate-500 font-medium">Version 2 • Uploaded on May 13, 2025</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-[var(--brand,theme(colors.blue.600))] hover:underline">View</button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-2">Dependencies</h3>
                    {!hasDependencies ? (
                      <div className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg max-w-md">
                        <span className="text-sm font-semibold text-slate-900">NDA Executed</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-200 ml-auto">Completed</span>
                      </div>
                    ) : (
                      <ul className="space-y-2 max-w-md">
                        {task.dependencies.map(depId => {
                          const depTask = allTasks?.find(t => t.id === depId) || { title: 'Unknown Task', status: 'not_started' };
                          const isCompleted = depTask.status === 'completed';
                          return (
                            <li key={depId} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                              <span className={`text-sm font-semibold ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                                {depTask.title}
                              </span>
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${isCompleted ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                {isCompleted ? 'Completed' : 'Blocking'}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">Reminder</h3>
                    <p className="text-sm text-slate-600">{task.reminderSchedule || '3 days before, 1 day before, On due date'}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-800 mb-1">Risk impact</h3>
                    <p className={`text-sm font-medium ${(task.riskImpact === 'high' || !task.riskImpact) ? 'text-red-600' : 'text-slate-600'}`}>
                      {(task.riskImpact === 'high' || !task.riskImpact) ? 'High - Delay may impact signing timeline' : 'Low - Normal priority'}
                    </p>
                  </div>

                </div>
              </div>
            )}
            {activeTab === 'comments' && (
              <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
                  <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Task Discussion</h3>
                    <p className="text-[11px] text-slate-500">Isolated thread for this task only.</p>
                  </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {/* Mock Comment 1 */}
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--brand,theme(colors.blue.500))] to-purple-500 text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm mt-1">
                      AM
                    </div>
                    <div className="max-w-[80%]">
                      <div className="flex items-baseline gap-2 mb-1.5 px-1">
                        <span className="text-sm font-bold text-slate-900">Ananya Mehta</span>
                        <span className="text-[10px] font-semibold text-slate-500">Yesterday, 2:30 PM</span>
                      </div>
                      <div className="bg-white p-4 rounded-2xl rounded-tl-sm border border-slate-200/80 shadow-sm text-[15px] leading-relaxed text-slate-700">
                        Please review the latest draft attached. Pay special attention to the indemnity clauses.
                      </div>
                    </div>
                  </div>

                  {/* Mock Comment 2 */}
                  <div className="flex gap-4 flex-row-reverse">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 flex items-center justify-center text-sm font-bold shrink-0 shadow-sm mt-1 border border-slate-300">
                      {task.assignee ? task.assignee.charAt(0) : 'P'}
                    </div>
                    <div className="flex flex-col items-end max-w-[80%]">
                      <div className="flex items-baseline gap-2 mb-1.5 px-1 flex-row-reverse">
                        <span className="text-sm font-bold text-slate-900">{task.assignee || 'Priya Menon'}</span>
                        <span className="text-[10px] font-semibold text-slate-500">Today, 10:15 AM</span>
                      </div>
                      <div className="bg-gradient-to-br from-[var(--brand,theme(colors.blue.500))] to-[var(--brand,theme(colors.blue.600))] p-4 rounded-2xl rounded-tr-sm shadow-sm text-[15px] leading-relaxed text-white text-right">
                        I've reviewed the draft. Left a few comments directly in the document. Ready for your sign-off.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 border-t border-slate-200/80 bg-white flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold shrink-0 border border-slate-200">
                    ME
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="w-full pl-5 pr-12 py-3 bg-slate-100/50 border border-slate-200 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all shadow-inner"
                    />
                    <button className="absolute right-2.5 top-1.5 p-2 bg-[var(--brand,theme(colors.blue.500))] hover:bg-[var(--brand,theme(colors.blue.600))] text-white rounded-full transition-colors shadow-sm">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            {activeTab !== 'details' && activeTab !== 'comments' && (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tracking coming soon.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Actions */}
        <div className="w-72 shrink-0 bg-slate-50 border-l border-slate-200 p-6 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-4">Actions</h3>
          
          <div className="space-y-3">
            {/* Buyer Actions */}
            {viewMode === 'Buyer' && (
              <>
                {status === 'not_started' && (
                  <button 
                    onClick={() => handleStatusChange('in_progress')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[var(--brand,theme(colors.blue.600))] hover:bg-[var(--brand,theme(colors.blue.700))] text-white rounded-lg shadow-sm text-sm font-bold transition-colors focus:outline-none"
                  >
                    Start Task
                  </button>
                )}
                {status === 'in_progress' && (
                  <button 
                    onClick={() => handleStatusChange('audit')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-sm text-sm font-bold transition-colors focus:outline-none"
                  >
                    Submit for Audit
                  </button>
                )}
              </>
            )}

            {/* Seller Actions */}
            {viewMode === 'Seller' && (
              <>
                {status === 'audit' && (
                  <>
                    <button 
                      onClick={() => handleStatusChange('completed')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm text-sm font-bold transition-colors focus:outline-none"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                      Pass Audit & Complete
                    </button>
                    <button 
                      onClick={() => handleStatusChange('in_progress')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-lg shadow-sm text-sm font-bold transition-colors"
                    >
                      Fail Audit (Return to Group)
                    </button>
                  </>
                )}

                {status !== 'completed' && status !== 'audit' && (
                  <button 
                    onClick={() => handleStatusChange('completed')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm text-sm font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    Force Complete
                  </button>
                )}
                
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[var(--brand,theme(colors.blue.600))] text-[var(--brand,theme(colors.blue.600))] hover:bg-[var(--brand-50,theme(colors.blue.50))] rounded-lg shadow-sm text-sm font-bold transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                  Send Reminder
                </button>
                
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-lg shadow-sm text-sm font-bold transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Escalate
                </button>
                
                <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-lg shadow-sm text-sm font-bold transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                  Reassign
                </button>
              </>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
}
