'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { Plus, LayoutGrid, User } from 'lucide-react';
import { Task, TaskStatus } from '@/shared/types';
import { useTasks, usePermissions } from '@/shared/hooks';
import { STATUS_OPTIONS } from '@/shared/lib/constants';
import { CreateTaskModal } from '@/features/create-task';
import { EditTaskModal } from '@/features/edit-task';
import { AssignTaskModal } from '@/features/assign-task';
import { Button } from '@/shared/ui';
import { KanbanColumn } from './KanbanColumn';
import { TaskActions } from './TaskActions';
import styles from './KanbanBoard.module.scss';

interface KanbanBoardProps {
  mode: 'all' | 'my';
}

/**
 * Kanban Board with drag-and-drop support.
 * Orchestrates useTasks (data + mutations), usePermissions (role checks),
 * KanbanColumn (column rendering + drop zones), TaskActions (action buttons),
 * and feature modals (create/edit/assign).
 */
export const KanbanBoard = ({ mode }: KanbanBoardProps) => {
  const { tasks, loading, fetchTasks, takeTask, releaseTask, deleteTask, updateTaskStatus } = useTasks(mode);
  const { canCreate } = usePermissions();

  // Drag-and-drop state
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);

  // Modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [assignTask, setAssignTask] = useState<Task | null>(null);

  // Group tasks by status — memoized to avoid recalculation on re-renders
  const tasksByStatus = useMemo(() => {
    const grouped: Record<TaskStatus, Task[]> = { todo: [], in_progress: [], done: [] };
    tasks.forEach((t) => grouped[t.status].push(t));
    return grouped;
  }, [tasks]);

  // Drag-and-drop handlers
  const handleDragStart = useCallback((taskId: number) => {
    setDraggedTaskId(taskId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedTaskId(null);
  }, []);

  const handleDrop = useCallback(
    (taskId: number, newStatus: TaskStatus) => {
      setDraggedTaskId(null);
      // Find the task to check if the status actually changed
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return;
      updateTaskStatus(taskId, newStatus);
    },
    [tasks, updateTaskStatus],
  );

  const renderActions = useCallback(
    (task: Task) => (
      <TaskActions
        task={task}
        mode={mode}
        onTake={takeTask}
        onRelease={releaseTask}
        onAssign={setAssignTask}
        onEdit={setEditTask}
        onDelete={deleteTask}
      />
    ),
    [mode, takeTask, releaseTask, deleteTask],
  );

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Loading tasks...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.tabGroup}>
          <a href="/dashboard" className={`${styles.tab} ${mode === 'all' ? styles.activeTab : ''}`}>
            <LayoutGrid size={16} /> All Tasks
          </a>
          <a href="/dashboard/my" className={`${styles.tab} ${mode === 'my' ? styles.activeTab : ''}`}>
            <User size={16} /> My Tasks
          </a>
        </div>

        {canCreate && (
          <Button variant="primary" size="sm" onClick={() => setCreateModalOpen(true)} id="create-task-btn">
            <Plus size={16} /> Create Task
          </Button>
        )}
      </div>

      {/* Board */}
      <div className={styles.board}>
        {STATUS_OPTIONS.map(({ value, label }) => (
          <KanbanColumn
            key={value}
            status={value}
            label={label}
            tasks={tasksByStatus[value]}
            renderActions={renderActions}
            draggedTaskId={draggedTaskId}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={handleDrop}
          />
        ))}
      </div>

      {/* Modals */}
      <CreateTaskModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchTasks}
      />
      <EditTaskModal
        isOpen={!!editTask}
        onClose={() => setEditTask(null)}
        onSuccess={fetchTasks}
        task={editTask}
      />
      <AssignTaskModal
        isOpen={!!assignTask}
        onClose={() => setAssignTask(null)}
        onSuccess={fetchTasks}
        task={assignTask}
      />
    </div>
  );
};
