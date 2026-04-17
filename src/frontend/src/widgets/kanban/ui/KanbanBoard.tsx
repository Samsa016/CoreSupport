'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Edit3, UserPlus, Hand, ArrowDownRight, LayoutGrid, User } from 'lucide-react';
import { Task, TaskStatus } from '@/shared/types';
import { tasksApi } from '@/shared/api';
import { useAuthStore } from '@/shared/store';
import { useToast } from '@/shared/providers';
import {
  canCreateTask,
  canUpdateTask,
  canDeleteTask,
  canAssignTask,
  canTakeTask,
  canReleaseTask,
  isTaskFree,
} from '@/shared/lib/permissions';
import { TaskCard } from '@/entities/task';
import { CreateTaskModal } from '@/features/create-task';
import { EditTaskModal } from '@/features/edit-task';
import { AssignTaskModal } from '@/features/assign-task';
import { Button } from '@/shared/ui';
import styles from './KanbanBoard.module.scss';

interface KanbanBoardProps {
  mode: 'all' | 'my';
}

const columns: { status: TaskStatus; label: string; icon: React.ReactNode }[] = [
  { status: 'todo', label: 'To Do', icon: <LayoutGrid size={16} /> },
  { status: 'in_progress', label: 'In Progress', icon: <ArrowDownRight size={16} /> },
  { status: 'done', label: 'Done', icon: <div className="done-check">✓</div> },
];

export const KanbanBoard = ({ mode }: KanbanBoardProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [assignTask, setAssignTask] = useState<Task | null>(null);
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      const data = mode === 'my' ? await tasksApi.getMy() : await tasksApi.getAll();
      setTasks(data);
    } catch {
      showToast('Failed to load tasks', 'error');
    } finally {
      setLoading(false);
    }
  }, [mode, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTake = async (taskId: number) => {
    try {
      await tasksApi.take(taskId);
      showToast('Task taken!', 'success');
      fetchTasks();
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to take task';
      showToast(detail, 'error');
    }
  };

  const handleRelease = async (taskId: number) => {
    try {
      await tasksApi.release(taskId);
      showToast('Task released', 'success');
      fetchTasks();
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to release task';
      showToast(detail, 'error');
    }
  };

  const handleDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await tasksApi.delete(taskId);
      showToast('Task deleted', 'success');
      fetchTasks();
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Failed to delete task';
      showToast(detail, 'error');
    }
  };

  const renderActions = (task: Task) => {
    if (!user) return null;

    return (
      <>
        {mode !== 'my' && isTaskFree(task) && canTakeTask(user.role) && (
          <Button variant="secondary" size="sm" onClick={() => handleTake(task.id)}>
            <Hand size={14} /> Take
          </Button>
        )}

        {canReleaseTask(task, user) && (
          <Button variant="secondary" size="sm" onClick={() => handleRelease(task.id)}>
            <ArrowDownRight size={14} /> Release
          </Button>
        )}

        {canAssignTask(user.role) && (
          <Button variant="secondary" size="sm" onClick={() => setAssignTask(task)}>
            <UserPlus size={14} /> Assign
          </Button>
        )}

        {canUpdateTask(user.role) && (
          <Button variant="secondary" size="sm" onClick={() => setEditTask(task)}>
            <Edit3 size={14} /> Edit
          </Button>
        )}

        {canDeleteTask(user.role) && (
          <Button variant="ghost" size="sm" onClick={() => handleDelete(task.id)}>
            <Trash2 size={14} />
          </Button>
        )}
      </>
    );
  };

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status);

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
      <div className={styles.toolbar}>
        <div className={styles.tabGroup}>
          <a
            href="/dashboard"
            className={`${styles.tab} ${mode === 'all' ? styles.activeTab : ''}`}
          >
            <LayoutGrid size={16} />
            All Tasks
          </a>
          <a
            href="/dashboard/my"
            className={`${styles.tab} ${mode === 'my' ? styles.activeTab : ''}`}
          >
            <User size={16} />
            My Tasks
          </a>
        </div>

        {user && canCreateTask(user.role) && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCreateModalOpen(true)}
            id="create-task-btn"
          >
            <Plus size={16} /> Create Task
          </Button>
        )}
      </div>

      <div className={styles.board}>
        {columns.map((col) => {
          const colTasks = getColumnTasks(col.status);
          return (
            <div key={col.status} className={styles.column}>
              <div className={styles.columnHeader}>
                <div className={styles.columnTitle}>
                  <span className={`${styles.columnDot} ${styles[col.status]}`} />
                  {col.label}
                </div>
                <span className={styles.columnCount}>{colTasks.length}</span>
              </div>
              <div className={styles.columnContent}>
                {colTasks.length === 0 ? (
                  <div className={styles.emptyColumn}>
                    No tasks
                  </div>
                ) : (
                  colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      actions={renderActions(task)}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

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
