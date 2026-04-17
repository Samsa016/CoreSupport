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
 * Kanban Board — refactored from 230-line God-component into a
 * ~90-line orchestrator that composes:
 *   - useTasks hook (data + mutations)
 *   - usePermissions hook (role checks)
 *   - KanbanColumn (column rendering)
 *   - TaskActions (action buttons)
 *   - Feature modals (create/edit/assign)
 */
export const KanbanBoard = ({ mode }: KanbanBoardProps) => {
  const { tasks, loading, fetchTasks, takeTask, releaseTask, deleteTask } = useTasks(mode);
  const { canCreate } = usePermissions();

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
