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
const MOCK_GROUPS = [
  { id: 'g1', name: 'Buyer Legal Team', role: 'Legal', openTasks: 3, workload: 45 },
  { id: 'g2', name: 'Buyer Finance Group', role: 'Financial', openTasks: 5, workload: 85 },
  { id: 'g3', name: 'Seller Execs', role: 'Executive', openTasks: 1, workload: 20 },
];

const MOCK_TASKS = [
  {
    id: 't1', title: 'Draft NDA', description: 'Draft the initial Non-Disclosure Agreement for the buyer.',
    status: 'completed', priority: 'High', stage: 'preparation', taskType: 'Document',
    assignee: 'Buyer Legal Team', role: 'Legal', dueDate: '2023-11-01',
    dependencies: [], linkedDocumentId: 'doc_1', riskImpact: 'low', visibility: 'external', isStageGate: true
  },
  {
    id: 't2', title: 'Upload Financial Statements', description: 'Upload Q1-Q3 financial statements.',
    status: 'in_progress', priority: 'High', stage: 'dd', taskType: 'Data Request',
    assignee: 'Buyer Finance Group', role: 'Financial', dueDate: '2023-11-10',
    dependencies: ['t1'], linkedDocumentId: null, riskImpact: 'high', visibility: 'external', isStageGate: true
  },
  {
    id: 't3', title: 'Review IP Portfolio', description: 'Review the provided IP portfolio documents.',
    status: 'audit', priority: 'Medium', stage: 'dd', taskType: 'Review',
    assignee: 'Buyer Legal Team', role: 'Legal', dueDate: '2023-11-15',
    dependencies: ['t1'], linkedDocumentId: 'doc_3', riskImpact: 'medium', visibility: 'external', isStageGate: false
  },
  {
    id: 't4', title: 'Initial Offer Review', description: 'Review the initial offer from the buyer.',
    status: 'todo', priority: 'High', stage: 'negotiation', taskType: 'Review',
    assignee: 'Seller Execs', role: 'Executive', dueDate: '2023-11-20',
    dependencies: ['t2', 't3'], linkedDocumentId: 'doc_4', riskImpact: 'high', visibility: 'internal', isStageGate: true
  },
  {
    id: 't5', title: 'Prepare Disclosure Schedules', description: 'Prepare initial disclosure schedules.',
    status: 'in_progress', priority: 'Medium', stage: 'dd', taskType: 'Document',
    assignee: 'Buyer Legal Team', role: 'Legal', dueDate: '2023-10-25', // Overdue
    dependencies: [], linkedDocumentId: null, riskImpact: 'medium', visibility: 'external', isStageGate: false
  },
  {
    id: 't6', title: 'Finalize SPA', description: 'Finalize the Share Purchase Agreement.',
    status: 'todo', priority: 'High', stage: 'closing', taskType: 'Document',
    assignee: 'Buyer Legal Team', role: 'Legal', dueDate: '2023-12-01',
    dependencies: ['t4'], linkedDocumentId: null, riskImpact: 'high', visibility: 'external', isStageGate: true
  }
];

const MOCK_LOGS = [
  { id: 'l1', taskTitle: 'Upload Final Term Sheet', action: 'Completed', user: 'Alice Smith', timestamp: '2026-09-01T10:00:00Z', details: 'Task marked as completed.' },
  { id: 'l2', taskTitle: 'Review Q3 Financials', action: 'Escalated Risk', user: 'Bob Jones', timestamp: '2026-09-03T14:30:00Z', details: 'Waiting on source document from target company.' }
];

const STAGES = ['preparation', 'dd', 'negotiation', 'closing'];

export default function TasksWorkflowPage() {
  const [activeTab, setActiveTab] = useState('board');
  const [tasks, setTasks] = useState(MOCK_TASKS);
  const [logs, setLogs] = useState(MOCK_LOGS);

  const [viewMode, setViewMode] = useState('Seller'); // 'Seller' or 'Buyer'
  const [currentDealStage, setCurrentDealStage] = useState('preparation');

  const [selectedTask, setSelectedTask] = useState(null);
  const [isCreating, setIsCreating] = useState(false);

  // Auto-progression logic: Check if all milestones for current stage are completed
  React.useEffect(() => {
    const stageTasks = tasks.filter(t => t.stage === currentDealStage);
    const milestones = stageTasks.filter(t => t.isStageGate);

    if (milestones.length > 0) {
      const allMilestonesCompleted = milestones.every(t => t.status === 'completed');
      if (allMilestonesCompleted) {
        const currentIdx = STAGES.indexOf(currentDealStage);
        if (currentIdx < STAGES.length - 1) {
          const nextStage = STAGES[currentIdx + 1];
          setCurrentDealStage(nextStage);
          setLogs(prev => [{
            id: `log-${Date.now()}`,
            taskTitle: 'System',
            action: 'Stage Auto-Progression',
            user: 'System',
            timestamp: new Date().toISOString(),
            details: `All milestones completed. Deal automatically advanced from ${currentDealStage} to ${nextStage}.`
          }, ...prev]);
        }
      }
    }
  }, [tasks, currentDealStage]);

  // If Buyer, hide internal tasks and tabs that are internal-only
  const visibleTasks = viewMode === 'Buyer'
    ? tasks.filter(t => t.visibility === 'external')
    : tasks;

  let tabs = [
    { id: 'board', label: 'Task Board' },
    { id: 'control', label: 'Control Center' },
    { id: 'stakeholders', label: 'Stakeholders' },
    { id: 'logs', label: 'Workflow Log' },
    { id: 'report', label: 'Status Report' }
  ];

  if (viewMode === 'Buyer') {
    tabs = [
      { id: 'board', label: 'My Tasks' },
      { id: 'report', label: 'Status Report' }
    ];
    if (!tabs.find(t => t.id === activeTab)) setActiveTab('board');
  }

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
    <div className="flex-1 w-full h-full flex flex-col bg-[#F8FAFC] font-sans text-slate-800 overflow-hidden">

      {/* Premium Header */}
      <div className="bg-white border-b border-slate-200/60 shrink-0 shadow-sm relative z-10">
        {/* Subtle top gradient line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[var(--brand,theme(colors.blue.500))] to-purple-500 opacity-80"></div>

        <div className="w-full px-8 lg:px-10">
          <div className="flex justify-between items-center py-6">
            <div className="flex flex-col">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 drop-shadow-sm">
                  Task & Workflow
                </h1>
                <span className="text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full bg-gradient-to-r from-purple-50 to-blue-50 text-purple-700 border border-purple-200/60 shadow-sm flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                  STAGE: {currentDealStage}
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mt-1.5">Streamline deal execution and track milestones.</p>
            </div>
            <div className="flex items-center gap-5">

              {/* Premium Segmented Control */}
              <div className="flex items-center bg-slate-100/80 p-1 rounded-xl border border-slate-200 shadow-inner">
                <button
                  onClick={() => setViewMode('Seller')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${viewMode === 'Seller' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  Seller View
                </button>
                <button
                  onClick={() => setViewMode('Buyer')}
                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-300 ${viewMode === 'Buyer' ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50 scale-[1.02]' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  Buyer View
                </button>
              </div>

              {viewMode === 'Seller' && (
                <button
                  onClick={() => setIsCreating(true)}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-b from-[var(--brand,theme(colors.blue.500))] to-[var(--brand,theme(colors.blue.600))] hover:from-[var(--brand,theme(colors.blue.600))] hover:to-[var(--brand,theme(colors.blue.700))] rounded-xl transition-all shadow-[0_4px_10px_-2px_rgba(59,130,246,0.3)] hover:shadow-[0_6px_14px_-2px_rgba(59,130,246,0.4)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path></svg>
                  New Task
                </button>
              )}
            </div>
          </div>

          {/* Floating Pill Tabs */}
          <div className="flex space-x-2 mt-2 mb-4 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full font-bold text-[13px] transition-all duration-300 ${isActive
                    ? 'bg-[var(--brand,theme(colors.blue.600))] text-white shadow-md scale-105'
                    : 'bg-transparent text-slate-500 hover:text-[var(--brand,theme(colors.blue.700))] hover:bg-blue-50'
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
      <div className="flex-1 overflow-y-auto w-full px-8 lg:px-10 py-8 relative [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {/* Subtle background glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--brand,theme(colors.blue.500))] opacity-[0.03] blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-purple-500 opacity-[0.03] blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-[1400px] mx-auto h-full relative z-10">
          {activeTab === 'control' && <ControlCenter tasks={visibleTasks} currentDealStage={currentDealStage} />}
          {activeTab === 'board' && <TaskBoard tasks={visibleTasks} allTasks={tasks} onTaskClick={setSelectedTask} viewMode={viewMode} />}
          {activeTab === 'stakeholders' && <Stakeholders users={MOCK_GROUPS} />}
          {activeTab === 'logs' && <WorkflowLog logs={logs} />}
          {activeTab === 'report' && <StatusReport tasks={visibleTasks} />}
        </div>
      </div>

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          allTasks={tasks}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          viewMode={viewMode}
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

