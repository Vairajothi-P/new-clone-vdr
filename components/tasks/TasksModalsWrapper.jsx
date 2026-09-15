"use client";

import React from 'react';
import { useTasks } from './TasksContext';
import TaskDetailModal from './TaskDetailModal';
import TaskCreationModal from './TaskCreationModal';

export default function TasksModalsWrapper() {
  const { 
    tasks, 
    viewMode, 
    currentDealStage, 
    selectedTask, 
    setSelectedTask, 
    editingTask, 
    setEditingTask, 
    isCreating, 
    setIsCreating, 
    handleUpdateTask, 
    handleCreateTask 
  } = useTasks();

  return (
    <>
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          allTasks={tasks}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onEdit={() => {
            setEditingTask(selectedTask);
            setSelectedTask(null);
          }}
          viewMode={viewMode}
        />
      )}

      {(isCreating || editingTask) && (
        <TaskCreationModal
          allTasks={tasks}
          initialData={editingTask}
          currentDealStage={currentDealStage}
          onClose={() => {
            setIsCreating(false);
            setEditingTask(null);
          }}
          onCreate={handleCreateTask}
          onUpdate={handleUpdateTask}
        />
      )}
    </>
  );
}
