import { http, endpoints } from './client'
import { ChatRequest, ChatResponse } from '@/shared/types'

/** Send a message to the AI agent and receive a markdown-formatted answer */
export function chat(body: ChatRequest) {
  return http.post<ChatResponse>(endpoints.agent.chat, body)
}
