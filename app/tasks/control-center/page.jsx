"use client";

import React from 'react';
import ControlCenter from '@/components/tasks/ControlCenter';
import { useTasks } from '@/components/tasks/TasksContext';

export default function ControlCenterPage() {
  const { visibleTasks, currentDealStage } = useTasks();

  return (
    <div className="flex-1 w-full h-full px-8 lg:px-10 py-8 relative">
      <div className="max-w-[1400px] mx-auto h-full">
        <ControlCenter 
          tasks={visibleTasks} 
          currentDealStage={currentDealStage} 
        />
      </div>
    </div>
  );
}
