import { http, endpoints } from './client'
import { User, LoginResponse } from '@/shared/types'

const FORM_CONFIG = {
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
}

export function login(username: string, password: string) {
  return http.post<LoginResponse>(
    endpoints.auth.login,
    new URLSearchParams({ username, password }),
    FORM_CONFIG,
  )
}

export function getMe() {
  return http.get<User>(endpoints.auth.me)
}
