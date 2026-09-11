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
    isStageGate: false,
    visibility: 'external',
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

  const mockPermissionFiltered = formData.linkedDocument !== '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 flex flex-col overflow-hidden max-h-[90vh]">

        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-white shrink-0">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Create New Task</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full p-2 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-50/50 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Task Title <span className="text-red-500">*</span></label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="block w-full border-transparent bg-slate-100/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent sm:text-sm py-2.5 px-4 outline-none transition-all shadow-inner"
                placeholder="e.g. Review draft NDA"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Assign to Group <span className="text-red-500">*</span></label>
              <select
                required
                value={formData.assignee}
                onChange={e => setFormData({ ...formData, assignee: e.target.value })}
                className="block w-full border-transparent bg-slate-100/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent sm:text-sm py-2.5 px-4 outline-none transition-all shadow-inner text-slate-700"
              >
                <option value="">Select Group...</option>
                {mockPermissionFiltered ? (
                  <option value="Buyer Legal Team">Buyer Legal Team (Has Access)</option>
                ) : (
                  <>
                    <option value="Buyer Legal Team">Buyer Legal Team</option>
                    <option value="Buyer Finance Group">Buyer Finance Group</option>
                    <option value="Seller Execs">Seller Execs</option>
                  </>
                )}
              </select>
              {mockPermissionFiltered && (
                <p className="mt-1.5 text-[10px] font-semibold text-amber-600 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  Filtered to groups with document access
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Workstream / Role <span className="text-red-500">*</span></label>
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
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
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Priority <span className="text-red-500">*</span></label>
              <select
                value={formData.priority}
                onChange={e => setFormData({ ...formData, priority: e.target.value })}
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
                onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                className="block w-full border-slate-200 rounded-lg shadow-sm focus:ring-1 focus:ring-[var(--brand)] focus:border-[var(--brand)] sm:text-sm py-2 px-3 outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Task Type <span className="text-red-500">*</span></label>
              <select
                value={formData.taskType}
                onChange={e => setFormData({ ...formData, taskType: e.target.value })}
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
                onChange={e => setFormData({ ...formData, stage: e.target.value })}
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
                onChange={e => setFormData({ ...formData, reminderSchedule: e.target.value })}
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
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">What needs to be completed? <span className="text-red-500">*</span></label>
            <textarea
              rows={3}
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="block w-full border-transparent bg-slate-100/80 rounded-xl focus:bg-white focus:ring-2 focus:ring-[var(--brand)] focus:border-transparent sm:text-sm py-3 px-4 outline-none resize-none transition-all shadow-inner"
              placeholder="Provide a detailed description..."
            />
          </div>

          {/* Row 4 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Linked Document (Optional)</label>
              <div className="relative">
                <select
                  value={formData.linkedDocument}
                  onChange={e => setFormData({ ...formData, linkedDocument: e.target.value })}
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
                    onClick={() => setFormData({ ...formData, linkedDocument: '' })}
                    className="absolute inset-y-0 right-8 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                )}
              </div>
              {formData.linkedDocument && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                  <p className="text-[10px] text-amber-700 leading-tight">
                    <strong>Permission Bound:</strong> Assignee list is now filtered. Only users with <code>can_view</code> access to {formData.linkedDocument} can be assigned this task.
                  </p>
                </div>
              )}
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
          <div className="flex flex-col gap-3 pt-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="claimable"
                checked={formData.claimable}
                onChange={e => setFormData({ ...formData, claimable: e.target.checked })}
                className="w-4 h-4 text-[var(--brand)] bg-slate-100 border-slate-300 rounded focus:ring-[var(--brand)]"
              />
              <label htmlFor="claimable" className="text-sm font-medium text-slate-700">
                This task can be claimed by anyone in this role
              </label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isStageGate"
                checked={formData.isStageGate}
                onChange={e => setFormData({ ...formData, isStageGate: e.target.checked })}
                className="w-4 h-4 text-purple-600 bg-slate-100 border-slate-300 rounded focus:ring-purple-600"
              />
              <label htmlFor="isStageGate" className="text-sm font-medium text-slate-700">
                <span className="font-bold text-purple-700 mr-1">Milestone Task (Stage-Gate):</span>
                This task must be completed before the deal can advance to the next stage.
              </label>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200 mt-2">
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-2">Visibility</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="external"
                  checked={formData.visibility === 'external'}
                  onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                  className="w-4 h-4 text-[var(--brand)] focus:ring-[var(--brand)]"
                />
                <span className="text-sm font-medium text-slate-700">External (Visible to Buyer/Responder)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="visibility"
                  value="internal"
                  checked={formData.visibility === 'internal'}
                  onChange={e => setFormData({ ...formData, visibility: e.target.value })}
                  className="w-4 h-4 text-[var(--brand)] focus:ring-[var(--brand)]"
                />
                <span className="text-sm font-medium text-slate-700">Internal Only (Hidden from Buyer)</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t border-slate-200 bg-white flex justify-end gap-3 shrink-0 p-6">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white hover:bg-slate-50 border border-slate-200 transition-colors focus:outline-none shadow-sm">
              Cancel
            </button>
            <button type="submit" className="px-6 py-2.5 rounded-xl shadow-[0_4px_10px_-2px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_14px_-2px_rgba(59,130,246,0.4)] text-sm font-bold text-white bg-gradient-to-b from-[var(--brand,theme(colors.blue.500))] to-[var(--brand,theme(colors.blue.600))] hover:from-[var(--brand,theme(colors.blue.600))] hover:to-[var(--brand,theme(colors.blue.700))] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand)]">
              Create Task
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
