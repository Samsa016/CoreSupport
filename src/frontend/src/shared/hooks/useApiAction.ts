'use client';

import { useState, useCallback } from 'react';
import { useToast } from '@/shared/providers';
import { extractApiError } from '@/shared/lib/api-error';

/**
 * Generic hook for async API actions with loading state, error handling, and toast.
 * Eliminates the duplicated try/catch + setLoading + showToast pattern
 * that was repeated in every single mutation handler.
 *
 * Usage:
 *   const { execute, loading } = useApiAction(
 *     () => tasksApi.take(taskId),
 *     { successMessage: 'Task taken!', onSuccess: refetch }
 *   );
 */
interface UseApiActionOptions<T> {
  successMessage?: string;
  errorFallback?: string;
  onSuccess?: (result: T) => void;
  onError?: (error: string) => void;
}

export function useApiAction<T>(
  action: (...args: any[]) => Promise<T>,
  options: UseApiActionOptions<T> = {},
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const execute = useCallback(
    async (...args: Parameters<typeof action>): Promise<T | null> => {
      setLoading(true);
      setError(null);

      try {
        const result = await action(...args);

        if (options.successMessage) {
          showToast(options.successMessage, 'success');
        }
        options.onSuccess?.(result);

        return result;
      } catch (err) {
        const message = extractApiError(err, options.errorFallback);
        setError(message);
        showToast(message, 'error');
        options.onError?.(message);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [action, options, showToast],
  );

  const clearError = useCallback(() => setError(null), []);

  return { execute, loading, error, clearError };
}
