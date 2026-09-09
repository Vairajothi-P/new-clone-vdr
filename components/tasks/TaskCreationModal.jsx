"use client";

import React, { useState } from 'react';

export default function TaskCreationModal({ allTasks = [], onClose, onCreate }) {
  const [formData, setFormData] = useState({
    title: '',
    role: 'Legal',
    assignee: '',
    priority: 'High',
    dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    estimatedEffort: '',
    reminderSchedule: '3 days before, 1 day before, On due date',
    description: '',
    linkedDocument: '',
    dependencies: [],
    claimable: false,
    // Maintaining these for compatibility with rest of app
    taskType: 'subtask',
    stage: 'preparation',
    riskImpact: 'low'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate({
      ...formData,
      id: `task-${Date.now()}`,
      status: 'not_started'
    });
    onClose();
  };

  const handleDependencyChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setFormData({ ...formData, dependencies: selectedOptions });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-xl shadow-xl border border-slate-200 flex flex-col overflow-hidden max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-200 bg-slate-50 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Create New Task</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 bg-white border border-slate-200 hover:bg-slate-100 rounded-full p-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Task Title <span className="text-red-500">*</span></label>
              <input 
                required
                type="text" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none" 
                placeholder="Review draft NDA"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Workstream / Role <span className="text-red-500">*</span></label>
              <select 
                value={formData.role}
                onChange={e => setFormData({...formData, role: e.target.value})}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none"
              >
                <option value="Legal">Legal</option>
                <option value="Financial">Financial</option>
                <option value="HR">HR</option>
                <option value="Business">Business</option>
                <option value="Compliance">Compliance</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Assign To (Person)</label>
              <input 
                type="text" 
                value={formData.assignee}
                onChange={e => setFormData({...formData, assignee: e.target.value})}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none" 
                placeholder="Name or Email"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Priority <span className="text-red-500">*</span></label>
              <select 
                value={formData.priority}
                onChange={e => setFormData({...formData, priority: e.target.value})}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none"
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>

          {/* Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Due Date <span className="text-red-500">*</span></label>
              <input 
                type="date"
                required
                value={formData.dueDate}
                onChange={e => setFormData({...formData, dueDate: e.target.value})}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none" 
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Task Type <span className="text-red-500">*</span></label>
              <select 
                value={formData.taskType}
                onChange={e => setFormData({...formData, taskType: e.target.value})}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none"
              >
                <option value="subtask">📝 Sub-task</option>
                <option value="milestone">🏆 Milestone</option>
                <option value="recurring">🔄 Recurring</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Deal Stage <span className="text-red-500">*</span></label>
              <select 
                value={formData.stage}
                onChange={e => setFormData({...formData, stage: e.target.value})}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none"
              >
                <option value="preparation">Preparation</option>
                <option value="dd">Due Diligence</option>
                <option value="negotiation">Negotiation</option>
                <option value="closing">Closing</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Reminder Schedule</label>
              <select 
                value={formData.reminderSchedule}
                onChange={e => setFormData({...formData, reminderSchedule: e.target.value})}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none"
              >
                <option value="3 days before, 1 day before, On due date">3 days before, 1 day before, On due date</option>
                <option value="1 day before, On due date">1 day before, On due date</option>
                <option value="On due date only">On due date only</option>
                <option value="Custom">Custom...</option>
              </select>
            </div>
          </div>

          {/* Row 3 */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">What needs to be completed? <span className="text-red-500">*</span></label>
            <textarea 
              rows={3}
              required
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
              className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none resize-none" 
              placeholder="Review the draft NDA and provide comments. Ensure all commercial terms are accurate."
            />
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Linked Document (Optional)</label>
              <div className="relative">
                <select 
                  value={formData.linkedDocument}
                  onChange={e => setFormData({...formData, linkedDocument: e.target.value})}
                  className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none appearance-none"
                >
                  <option value="">Select a document...</option>
                  <option value="NDA_Draft_v2.docx">NDA_Draft_v2.docx</option>
                  <option value="Q3_Financials_Draft.pdf">Q3_Financials_Draft.pdf</option>
                  <option value="Term_Sheet_v1.pdf">Term_Sheet_v1.pdf</option>
                </select>
                {formData.linkedDocument && (
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, linkedDocument: ''})}
                    className="absolute inset-y-0 right-8 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                )}
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Dependencies (Optional)</label>
              <select 
                multiple
                value={formData.dependencies}
                onChange={handleDependencyChange}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none h-10 overflow-hidden"
              >
                {allTasks.map(t => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
              <p className="text-[10px] text-slate-500 mt-1">Hold Ctrl/Cmd to select multiple dependencies.</p>
            </div>
          </div>

          {/* Row 5 */}
          <div className="flex items-center gap-2 pt-2">
            <input 
              type="checkbox" 
              id="claimable"
              checked={formData.claimable}
              onChange={e => setFormData({...formData, claimable: e.target.checked})}
              className="w-4 h-4 text-[var(--brand)] bg-slate-100 border-slate-300 rounded focus:ring-[var(--brand)]"
            />
            <label htmlFor="claimable" className="text-sm font-medium text-slate-700">
              This task can be claimed by anyone in this role
            </label>
          </div>

          {/* Footer */}
          <div className="pt-5 border-t border-slate-200 flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-lg shadow-sm text-sm font-bold text-slate-700 bg-white hover:bg-slate-50 transition-colors focus:outline-none">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[var(--brand,theme(colors.blue.600))] hover:bg-[var(--brand,theme(colors.blue.700))] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand)]">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
