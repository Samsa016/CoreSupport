import { apiClient } from './client';
import { ChatRequest, ChatResponse } from '@/shared/types';

export const agentApi = {
  chat: async (request: ChatRequest): Promise<ChatResponse> => {
    const { data } = await apiClient.post<ChatResponse>('/agent/chat', request);
    return data;
  },
};
