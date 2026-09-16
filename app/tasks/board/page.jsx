"use client";

import React from 'react';
import TaskBoard from '@/components/tasks/TaskBoard';
import { useTasks } from '@/components/tasks/TasksContext';

export default function BoardPage() {
  const { visibleTasks, tasks, setSelectedTask, viewMode } = useTasks();

  return (
    <div className="flex-1 w-full h-full px-4 md:px-8 lg:px-10 py-6 md:py-8 relative">
      <div className="w-full mx-auto h-full">
        <TaskBoard 
          tasks={visibleTasks} 
          allTasks={tasks} 
          onTaskClick={setSelectedTask} 
          viewMode={viewMode} 
        />
      </div>
    </div>
  );
}
