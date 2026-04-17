'use client';

import { useMemo } from 'react';
import { Task, User, UserRole } from '@/shared/types';
import { useAuthStore } from '@/shared/store';

/**
 * Permission hook bound to the current user.
 * Replaces scattered permission function calls with a clean,
 * memoized interface. Components no longer need to import
 * individual permission functions or access user.role directly.
 *
 * Follows ISP: exposes only what components need.
 */
export function usePermissions() {
  const user = useAuthStore((s) => s.user);

  return useMemo(() => {
    const role = user?.role;

    const hasRole = (...roles: UserRole[]) =>
      role !== undefined && roles.includes(role);

    return {
      user,

      canCreate:  hasRole('lead', 'manager'),
      canUpdate:  hasRole('lead', 'manager'),
      canDelete:  hasRole('manager'),
      canAssign:  hasRole('lead', 'manager'),
      canTake:    hasRole('worker', 'lead', 'manager'),

      /** A task can be released only by its current assignee */
      canRelease: (task: Task) =>
        user !== null && task.assignee_id === user.id,

      /** A task is free if no one is assigned */
      isTaskFree: (task: Task) =>
        task.assignee_id === null,
    };
  }, [user]);
}
