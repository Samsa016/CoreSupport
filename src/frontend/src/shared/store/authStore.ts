'use client';

import { create } from 'zustand';
import { User } from '@/shared/types';
import { STORAGE_KEYS } from '@/shared/lib/constants';

interface AuthStore {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  token: null,
  user: null,
  isLoading: true,

  setAuth: (token, user) => {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    set({ token, user, isLoading: false });
  },

  clearAuth: () => {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    set({ token: null, user: null, isLoading: false });
  },

  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
}));
