import { apiClient } from './client';
import { User } from '@/shared/types';

export const usersApi = {
  getAll: async (): Promise<User[]> => {
    const { data } = await apiClient.get<User[]>('/users');
    return data;
  },
};
