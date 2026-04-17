import { apiClient } from './client';
import { Task, TaskCreateRequest, TaskUpdateRequest, TaskAssignRequest, TaskStatus } from '@/shared/types';

export const tasksApi = {
  getAll: async (status?: TaskStatus): Promise<Task[]> => {
    const params = status ? { status } : {};
    const { data } = await apiClient.get<Task[]>('/tasks', { params });
    return data;
  },

  getMy: async (): Promise<Task[]> => {
    const { data } = await apiClient.get<Task[]>('/tasks/my');
    return data;
  },

  getById: async (id: number): Promise<Task> => {
    const { data } = await apiClient.get<Task>(`/tasks/${id}`);
    return data;
  },

  create: async (taskData: TaskCreateRequest): Promise<Task> => {
    const { data } = await apiClient.post<Task>('/tasks/', taskData);
    return data;
  },

  update: async (id: number, taskData: TaskUpdateRequest): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}`, taskData);
    return data;
  },

  take: async (id: number): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}/take`);
    return data;
  },

  release: async (id: number): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}/release`);
    return data;
  },

  assign: async (id: number, assignData: TaskAssignRequest): Promise<Task> => {
    const { data } = await apiClient.patch<Task>(`/tasks/${id}/assign`, assignData);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/tasks/${id}`);
  },
};
