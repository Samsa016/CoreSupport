import axios, { AxiosRequestConfig } from 'axios'
import { STORAGE_KEYS } from '@/shared/lib/constants'

// ─── Base Instance ────────────────────────────────────────

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Interceptors ─────────────────────────────────────────

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN)
      window.location.href = '/login'
    }
    return Promise.reject(err)
  },
)

// ─── Generic Request Helpers ──────────────────────────────
//
// Thin wrappers that auto-extract `response.data`.
// Every API module calls these instead of touching axios directly.

export const http = {
  get<T>(url: string, config?: AxiosRequestConfig) {
    return apiClient.get<T>(url, config).then((r) => r.data)
  },

  post<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return apiClient.post<T>(url, body, config).then((r) => r.data)
  },

  patch<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return apiClient.patch<T>(url, body, config).then((r) => r.data)
  },

  put<T>(url: string, body?: unknown, config?: AxiosRequestConfig) {
    return apiClient.put<T>(url, body, config).then((r) => r.data)
  },

  del(url: string, config?: AxiosRequestConfig): Promise<void> {
    return apiClient.delete(url, config).then(() => undefined) as Promise<void>
  },
}

// ─── Endpoint Registry ────────────────────────────────────
//
// Single source of truth for all backend URLs.
// Change a route here — it updates across every API module.

export const endpoints = {
  auth: {
    login: '/auth/login',
    me: '/users/me',
  },
  tasks: {
    list: '/tasks',
    my: '/tasks/my',
    byId: (id: number) => `/tasks/${id}`,
    take: (id: number) => `/tasks/${id}/take`,
    release: (id: number) => `/tasks/${id}/release`,
    assign: (id: number) => `/tasks/${id}/assign`,
  },
  users: {
    list: '/users',
  },
  agent: {
    chat: '/agent/chat',
  },
} as const
