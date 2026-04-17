import { http, endpoints } from './client'
import { User } from '@/shared/types'

/** Fetch all users (needed for the Assign modal) */
export function getAll() {
  return http.get<User[]>(endpoints.users.list)
}
