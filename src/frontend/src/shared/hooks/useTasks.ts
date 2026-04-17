'use client';

import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/shared/types';
import { tasksApi } from '@/shared/api';
import { useToast } from '@/shared/providers';
import { extractApiError } from '@/shared/lib/api-error';

/**
 * Custom hook for task data fetching and mutations.
 * Follows SRP: one place for all task-related state management.
 * Components become pure presentation layers.
 */
export function useTasks(mode: 'all' | 'my') {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const fetchTasks = useCallback(async () => {
    try {
      const data = mode === 'my' ? await tasksApi.getMy() : await tasksApi.getAll();
      setTasks(data);
    } catch (err) {
      showToast(extractApiError(err, 'Failed to load tasks'), 'error');
    } finally {
      setLoading(false);
    }
  }, [mode, showToast]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  /** Performs an async task mutation with unified error handling, then refetches. */
  const mutate = useCallback(
    async (
      operation: () => Promise<unknown>,
      successMessage: string,
      errorFallback: string,
    ): Promise<boolean> => {
      try {
        await operation();
        showToast(successMessage, 'success');
        await fetchTasks();
        return true;
      } catch (err) {
        showToast(extractApiError(err, errorFallback), 'error');
        return false;
      }
    },
    [fetchTasks, showToast],
  );

  const takeTask = useCallback(
    (taskId: number) => mutate(() => tasksApi.take(taskId), 'Task taken!', 'Failed to take task'),
    [mutate],
  );

  const releaseTask = useCallback(
    (taskId: number) => mutate(() => tasksApi.release(taskId), 'Task released', 'Failed to release task'),
    [mutate],
  );

  const deleteTask = useCallback(
    async (taskId: number) => {
      if (!confirm('Are you sure you want to delete this task?')) return false;
      return mutate(() => tasksApi.remove(taskId), 'Task deleted', 'Failed to delete task')
    },
    [mutate],
  );

  return {
    tasks,
    loading,
    fetchTasks,
    takeTask,
    releaseTask,
    deleteTask,
  };
}
