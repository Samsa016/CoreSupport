'use client';

import React, { useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/shared/store';
import { authApi } from '@/shared/api';
import { PUBLIC_PATHS, ROUTES, STORAGE_KEYS } from '@/shared/lib/constants';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth provider that validates JWT on mount.
 * Refactored: uses constants, stable callbacks, proper deps.
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const setAuth = useAuthStore((s) => s.setAuth);
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const setLoading = useAuthStore((s) => s.setLoading);
  const token = useAuthStore((s) => s.token);
  const isLoading = useAuthStore((s) => s.isLoading);
  const router = useRouter();
  const pathname = usePathname();

  const isPublicPath = useCallback(
    (path: string) => PUBLIC_PATHS.includes(path),
    [],
  );

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);

      if (!storedToken) {
        setLoading(false);
        if (!isPublicPath(pathname)) {
          router.push(ROUTES.LOGIN);
        }
        return;
      }

      try {
        const user = await authApi.getMe();
        setAuth(storedToken, user);

        if (pathname === ROUTES.LOGIN) {
          router.push(ROUTES.DASHBOARD);
        }
      } catch {
        clearAuth();
        if (!isPublicPath(pathname)) {
          router.push(ROUTES.LOGIN);
        }
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isPublicPath(pathname)) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-base)',
      }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!token) return null;

  return <>{children}</>;
};
