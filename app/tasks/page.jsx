"use client";

import React, { useState } from 'react';
import ControlCenter from '@/components/tasks/ControlCenter';
import TaskBoard from '@/components/tasks/TaskBoard';
import Stakeholders from '@/components/tasks/Stakeholders';
import WorkflowLog from '@/components/tasks/WorkflowLog';
import StatusReport from '@/components/tasks/StatusReport';
import TaskDetailModal from '@/components/tasks/TaskDetailModal';
import TaskCreationModal from '@/components/tasks/TaskCreationModal';

// Mock Data
const MOCK_USERS = [
  { id: 'u1', name: 'Alice Smith', email: 'alice@legal.com', role: 'Legal', openTasks: 3, workload: 45 },
  { id: 'u2', name: 'Bob Jones', email: 'bob@finance.com', role: 'Financial', openTasks: 5, workload: 85 },
  { id: 'u3', name: 'Carol King', email: 'carol@exec.com', role: 'Executive', openTasks: 1, workload: 10 }
];

const MOCK_TASKS = [
  {
    id: 't1',
    title: 'Upload Final Term Sheet',
    description: 'Ensure signatures are verified.',
    taskType: 'subtask',
    priority: 'High',
    stage: 'negotiation',
    status: 'completed',
    assignee: 'Alice Smith',
    approver: 'Carol King',
    role: 'Legal',
    dueDate: '2026-09-01',
    riskImpact: 'low',
    linkedDocumentId: 'doc1',
    dependencies: []
  },
  {
    id: 't2',
    title: 'Review Q3 Financials',
    description: 'Cross-check against audit report.',
    taskType: 'subtask',
    priority: 'High',
    stage: 'dd',
    status: 'blocked',
    assignee: 'Bob Jones',
    approver: 'Carol King',
    role: 'Financial',
    dueDate: '2026-09-05',
    riskImpact: 'high',
    linkedDocumentId: 'doc2',
    dependencies: ['t3']
  },
  {
    id: 't3',
    title: 'Draft NDA',
    description: 'Standard template.',
    taskType: 'milestone',
    priority: 'Medium',
    stage: 'preparation',
    status: 'under_review',
    assignee: 'Alice Smith',
    approver: 'Bob Jones',
    role: 'Legal',
    dueDate: '2026-09-10',
    riskImpact: 'low',
    dependencies: []
  },
  {
    id: 't4',
    title: 'Board Approval',
    description: 'Final sign-off.',
    taskType: 'milestone',
    priority: 'High',
    stage: 'closing',
    status: 'not_started',
    assignee: 'Carol King',
    approver: 'System',
    role: 'Executive',
    dueDate: '2026-09-15',
    riskImpact: 'high',
    dependencies: ['t1', 't2']
  },
  {
    id: 't5',
    title: 'Weekly Status Update',
    description: 'Update the deal room dashboard.',
    taskType: 'recurring',
    priority: 'Low',
    stage: 'dd',
    status: 'in_progress',
    assignee: 'Bob Jones',
    approver: 'Carol King',
    role: 'Financial',
    dueDate: '2026-09-07',
    riskImpact: 'low',
    dependencies: []
  }
];

const MOCK_LOGS = [
  { id: 'l1', taskTitle: 'Upload Final Term Sheet', action: 'Completed', user: 'Alice Smith', timestamp: '2026-09-01T10:00:00Z', details: 'Task marked as completed.' },
  { id: 'l2', taskTitle: 'Review Q3 Financials', action: 'Escalated Risk', user: 'Bob Jones', timestamp: '2026-09-03T14:30:00Z', details: 'Waiting on source document from target company.' }
];

export default function TasksWorkflowPage() {
  const [activeTab, setActiveTab] = useState('board');
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [logs, setLogs] = useState(MOCK_LOGS);

  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  const tabs = [
    { id: 'board', label: 'Task Board' },
    { id: 'control', label: 'Control Center' },
    { id: 'stakeholders', label: 'Stakeholders' },
    { id: 'logs', label: 'Workflow Log' },
    { id: 'report', label: 'Status Report' }
  ];

  const handleUpdateTask = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setLogs([{
      id: `log-${Date.now()}`,
      taskTitle: updatedTask.title,
      action: 'Status Updated',
      user: 'Current User',
      timestamp: new Date().toISOString(),
      details: `Status changed to ${updatedTask.status.replace('_', ' ')}`
    }, ...logs]);
  };

  const handleCreateTask = (newTask) => {
    setTasks([...tasks, newTask]);
    setLogs([{
      id: `log-${Date.now()}`,
      taskTitle: newTask.title,
      action: 'Task Created',
      user: 'Current User',
      timestamp: new Date().toISOString(),
      details: 'Manual ad-hoc task created.'
    }, ...logs]);
  };

  return (
    <div className="flex-1 w-full h-full flex flex-col bg-slate-50 font-sans text-slate-800 overflow-hidden">

      {/* Clean White Header */}
      <div className="bg-white border-b border-slate-200 shrink-0">
        <div className="w-full px-6 lg:px-8">
          <div className="flex justify-between items-center py-5">
            <div className="flex flex-col">
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Task & Workflow
              </h1>
              <p className="text-xs font-medium text-slate-500 mt-0.5">Manage and execute deal operations smoothly.</p>
            </div>
            <div>
              <button
                onClick={() => setIsCreating(true)}
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-[var(--brand,theme(colors.blue.600))] hover:bg-[var(--brand,theme(colors.blue.700))] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand)] shadow-sm"
              >
                + New Task
              </button>
            </div>
          </div>

          {/* Brand Colored Underline Tabs */}
          <div className="flex space-x-6 mt-1 overflow-x-auto hide-scrollbar">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap pb-3 px-1 border-b-2 font-semibold text-[13px] transition-all duration-200 ${isActive
                    ? 'border-[var(--brand)] text-[var(--brand)]'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                    }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full px-6 lg:px-8 py-8">
        <div className="max-w-[1400px] mx-auto h-full">
          {activeTab === 'control' && <ControlCenter tasks={tasks} />}
          {activeTab === 'board' && <TaskBoard tasks={tasks} allTasks={tasks} onTaskClick={setSelectedTask} />}
          {activeTab === 'stakeholders' && <Stakeholders users={MOCK_USERS} />}
          {activeTab === 'logs' && <WorkflowLog logs={logs} />}
          {activeTab === 'report' && <StatusReport tasks={tasks} />}
        </div>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          allTasks={tasks}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
        />
      )}

      {isCreating && (
        <TaskCreationModal
          allTasks={tasks}
          onClose={() => setIsCreating(false)}
          onCreate={handleCreateTask}
        />
      )}
    </div>
  );
}

