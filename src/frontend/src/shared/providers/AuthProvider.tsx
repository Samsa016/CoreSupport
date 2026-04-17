'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/shared/store';
import { authApi } from '@/shared/api';

interface AuthProviderProps {
  children: ReactNode;
}

const PUBLIC_PATHS = ['/', '/login'];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { setAuth, clearAuth, setLoading, token, isLoading } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('access_token');

      if (!storedToken) {
        setLoading(false);
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.push('/login');
        }
        return;
      }

      try {
        const user = await authApi.getMe();
        setAuth(storedToken, user);

        if (pathname === '/login') {
          router.push('/dashboard');
        }
      } catch {
        clearAuth();
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.push('/login');
        }
      }
    };

    initAuth();
  }, []);

  // For public pages, don't show loading
  if (PUBLIC_PATHS.includes(pathname)) {
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

  if (!token) {
    return null;
  }

  return <>{children}</>;
};
