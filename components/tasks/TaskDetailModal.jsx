"use client";

import React, { useState } from 'react';

export default function TaskDetailModal({ task, allTasks = [], onClose, onUpdate, onEdit, viewMode = 'Seller' }) {
  const [activeTab, setActiveTab] = useState('details');
  const [status, setStatus] = useState(task.status || 'in_progress');
  const [showFailReason, setShowFailReason] = useState(false);
  const [failReasonText, setFailReasonText] = useState('');
  const [mockComments, setMockComments] = useState([
    { id: 1, name: 'Ananya Mehta', initials: 'AM', time: 'Yesterday, 2:30 PM', text: 'Please review the latest draft attached. Pay special attention to the indemnity clauses.', isMe: false },
    { id: 2, name: task.assignee || 'Priya Menon', initials: task.assignee ? task.assignee.charAt(0) : 'P', time: 'Today, 10:15 AM', text: "I've reviewed the draft. Left a few comments directly in the document. Ready for your sign-off.", isMe: true }
  ]);
  const [newComment, setNewComment] = useState('');
  const [mockFiles, setMockFiles] = useState([
    { id: 1, name: 'NDA_Draft_v2.docx', size: '2.4 MB', uploadedAt: '13 May 2025', uploadedBy: 'Ananya Mehta' }
  ]);
  const [activeAction, setActiveAction] = useState(null); // 'reminder', 'escalate', 'reassign', 'escalate_done', 'reassign_done'

  if (!task) return null;

  const handleSendComment = () => {
    if (!newComment.trim()) return;
    setMockComments([...mockComments, {
      id: Date.now(),
      name: 'ME',
      initials: 'M',
      time: 'Just now',
      text: newComment,
      isMe: true
    }]);
    setNewComment('');
  };

  const handleFileUpload = () => {
    setMockFiles([...mockFiles, {
      id: Date.now(),
      name: 'Revised_NDA_Signed.pdf',
      size: '1.1 MB',
      uploadedAt: 'Just now',
      uploadedBy: 'ME'
    }]);
  };

  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    onUpdate({ ...task, status: newStatus });
  };

  const hasDependencies = task.dependencies && task.dependencies.length > 0;
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && status !== 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl w-full max-w-6xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] border border-white/40 flex flex-col md:flex-row overflow-hidden max-h-[90vh]">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden border-b md:border-b-0 md:border-r border-slate-200 bg-white">
          
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
                <button onClick={onEdit} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all">
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
          <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {activeTab === 'details' && (
              <div className="flex flex-col lg:flex-row gap-6 md:gap-8">
                {/* Left Mini Column */}
                <div className="w-full lg:w-48 shrink-0 grid grid-cols-2 lg:flex lg:flex-col gap-4 lg:gap-6">
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
                      <button onClick={() => alert('Document viewer would open here.')} className="text-xs font-bold text-[var(--brand,theme(colors.blue.600))] hover:underline active:scale-95 transition-transform">View</button>
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
                  {mockComments.map(comment => (
                    comment.isSystem ? (
                      <div key={comment.id} className="flex justify-center my-4">
                        <div className="bg-red-50 border border-red-100 px-4 py-2 rounded-full text-xs font-semibold text-red-700 shadow-sm">
                          {comment.text}
                        </div>
                      </div>
                    ) : (
                      <div key={comment.id} className={`flex gap-4 ${comment.isMe ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0 shadow-sm mt-1 ${comment.isMe ? 'bg-gradient-to-br from-slate-200 to-slate-300 text-slate-700 border border-slate-300' : 'bg-gradient-to-br from-[var(--brand,theme(colors.blue.500))] to-purple-500 text-white'}`}>
                          {comment.initials}
                        </div>
                        <div className={`flex flex-col max-w-[80%] ${comment.isMe ? 'items-end' : ''}`}>
                          <div className={`flex items-baseline gap-2 mb-1.5 px-1 ${comment.isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-sm font-bold text-slate-900">{comment.name}</span>
                            <span className="text-[10px] font-semibold text-slate-500">{comment.time}</span>
                          </div>
                          <div className={`p-4 rounded-2xl shadow-sm text-[15px] leading-relaxed ${comment.isMe ? 'bg-gradient-to-br from-[var(--brand,theme(colors.blue.500))] to-[var(--brand,theme(colors.blue.600))] text-white rounded-tr-sm text-right' : 'bg-white border border-slate-200/80 text-slate-700 rounded-tl-sm'}`}>
                            {comment.text}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                <div className="p-4 border-t border-slate-200/80 bg-white flex gap-4 items-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-sm font-bold shrink-0 border border-slate-200">
                    ME
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') handleSendComment(); }}
                      className="w-full pl-5 pr-12 py-3 bg-slate-100/50 border border-slate-200 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent outline-none transition-all shadow-inner"
                    />
                    <button 
                      onClick={handleSendComment}
                      className="absolute right-2.5 top-1.5 p-2 bg-[var(--brand,theme(colors.blue.500))] hover:bg-[var(--brand,theme(colors.blue.600))] text-white rounded-full transition-colors shadow-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'files' && (
              <div className="flex flex-col h-full bg-slate-50/50">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-white">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Task Documents</h3>
                    <p className="text-[11px] text-slate-500">Files uploaded for this specific task.</p>
                  </div>
                  <button onClick={handleFileUpload} className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all shadow-sm">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    Upload File
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                  {mockFiles.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-[var(--brand,theme(colors.blue.300))] transition-colors group">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-[var(--brand-50,theme(colors.blue.50))] text-[var(--brand,theme(colors.blue.600))] rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900 group-hover:text-[var(--brand,theme(colors.blue.700))] transition-colors">{file.name}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[11px] font-medium text-slate-500">{file.size}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[11px] font-medium text-slate-500">Uploaded by {file.uploadedBy}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                            <span className="text-[11px] font-medium text-slate-500">{file.uploadedAt}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-slate-400 hover:text-[var(--brand)] bg-slate-50 hover:bg-[var(--brand-50)] rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                        </button>
                        <button className="p-2 text-slate-400 hover:text-[var(--brand)] bg-slate-50 hover:bg-[var(--brand-50)] rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {activeTab !== 'details' && activeTab !== 'comments' && activeTab !== 'files' && (
              <div className="flex items-center justify-center h-full text-slate-400 font-medium">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} tracking coming soon.
              </div>
            )}
          </div>
        </div>

        {/* Right Sidebar - Actions */}
        <div className="w-full md:w-72 shrink-0 bg-slate-50 md:border-l border-t md:border-t-0 border-slate-200 p-6 flex flex-col md:overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
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
                {status === 'audit' && (
                  <div className="w-full bg-purple-50 border border-purple-200 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm">
                    <svg className="w-6 h-6 text-purple-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-sm font-bold text-purple-700">Submitted for Audit</p>
                    <p className="text-xs text-purple-600 mt-1">Waiting for seller review</p>
                  </div>
                )}
                {status === 'completed' && (
                  <div className="w-full bg-green-50 border border-green-200 rounded-lg p-4 flex flex-col items-center justify-center text-center shadow-sm">
                    <svg className="w-6 h-6 text-green-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                    <p className="text-sm font-bold text-green-700">Task Completed</p>
                    <p className="text-xs text-green-600 mt-1">Approved by seller</p>
                  </div>
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
                    {!showFailReason ? (
                      <button 
                        onClick={() => setShowFailReason(true)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-500 text-red-600 hover:bg-red-50 rounded-lg shadow-sm text-sm font-bold transition-colors"
                      >
                        Fail Audit (Return to Group)
                      </button>
                    ) : (
                      <div className="w-full bg-red-50/50 border border-red-200 rounded-lg p-3 flex flex-col gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                        <label className="text-xs font-bold text-red-700 uppercase tracking-wider">Reason for Failure</label>
                        <textarea 
                          className="w-full text-sm p-2.5 border border-red-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent placeholder-slate-400 resize-none shadow-inner"
                          rows="3"
                          placeholder="Explain what needs to be fixed before they can resubmit..."
                          value={failReasonText}
                          onChange={(e) => setFailReasonText(e.target.value)}
                        />
                        <div className="flex gap-2 mt-1">
                          <button 
                            onClick={() => setShowFailReason(false)}
                            className="flex-1 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-50 transition-colors shadow-sm"
                          >
                            Cancel
                          </button>
                          <button 
                            onClick={() => {
                              if (failReasonText.trim()) {
                                setMockComments(prev => [...prev, {
                                  id: Date.now(),
                                  isSystem: true,
                                  text: `🚨 Task returned to group: ${failReasonText}`
                                }]);
                              }
                              handleStatusChange('in_progress');
                              setShowFailReason(false);
                              setFailReasonText('');
                            }}
                            className="flex-1 py-2 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 transition-colors shadow-sm"
                          >
                            Return to Buyer
                          </button>
                        </div>
                      </div>
                    )}
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
                
                {activeAction === 'reminder' ? (
                  <div className="w-full bg-green-50 border border-green-200 rounded-lg p-3 text-center animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                    <p className="text-xs font-bold text-green-700">✅ Reminder sent successfully!</p>
                  </div>
                ) : (
                  <button onClick={() => { setActiveAction('reminder'); setTimeout(() => setActiveAction(null), 3000); }} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-[var(--brand,theme(colors.blue.600))] text-[var(--brand,theme(colors.blue.600))] hover:bg-[var(--brand-50,theme(colors.blue.50))] active:scale-95 rounded-lg shadow-sm text-sm font-bold transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    Send Reminder
                  </button>
                )}
                
                {activeAction === 'escalate' ? (
                  <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 flex flex-col gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-xs font-bold text-red-700 uppercase tracking-wider">Escalate Task</label>
                    <textarea className="w-full text-sm p-2 border border-red-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-red-400 resize-none" rows="2" placeholder="Reason for escalation..."></textarea>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setActiveAction(null)} className="flex-1 py-1.5 bg-white border border-slate-300 text-slate-600 rounded text-xs font-bold hover:bg-slate-50">Cancel</button>
                      <button onClick={() => { setActiveAction('escalate_done'); setTimeout(() => setActiveAction(null), 3000); }} className="flex-1 py-1.5 bg-red-600 text-white rounded text-xs font-bold hover:bg-red-700">Confirm</button>
                    </div>
                  </div>
                ) : activeAction === 'escalate_done' ? (
                  <div className="w-full bg-red-50 border border-red-200 rounded-lg p-3 text-center animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                    <p className="text-xs font-bold text-red-700">🚨 Escalated to Management</p>
                  </div>
                ) : (
                  <button onClick={() => setActiveAction('escalate')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-red-500 text-red-600 hover:bg-red-50 active:scale-95 rounded-lg shadow-sm text-sm font-bold transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                    Escalate
                  </button>
                )}
                
                {activeAction === 'reassign' ? (
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 flex flex-col gap-2 shadow-sm animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Reassign Task To</label>
                    <select className="w-full text-sm p-2 border border-slate-200 rounded bg-white focus:outline-none focus:ring-1 focus:ring-slate-400">
                      <option>Buyer Finance Group</option>
                      <option>Seller Execs</option>
                    </select>
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => setActiveAction(null)} className="flex-1 py-1.5 bg-white border border-slate-300 text-slate-600 rounded text-xs font-bold hover:bg-slate-50">Cancel</button>
                      <button onClick={() => { setActiveAction('reassign_done'); setTimeout(() => setActiveAction(null), 3000); }} className="flex-1 py-1.5 bg-slate-800 text-white rounded text-xs font-bold hover:bg-slate-900">Reassign</button>
                    </div>
                  </div>
                ) : activeAction === 'reassign_done' ? (
                  <div className="w-full bg-slate-100 border border-slate-200 rounded-lg p-3 text-center animate-in fade-in zoom-in-95 duration-200 shadow-sm">
                    <p className="text-xs font-bold text-slate-700">🔄 Task Reassigned</p>
                  </div>
                ) : (
                  <button onClick={() => setActiveAction('reassign')} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 active:scale-95 rounded-lg shadow-sm text-sm font-bold transition-all">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"></path></svg>
                    Reassign
                  </button>
                )}
              </>
            )}
          </div>
          
        </div>

      </div>
    </div>
  );
}
