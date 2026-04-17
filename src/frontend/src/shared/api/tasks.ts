import { http, endpoints } from './client'
import {
  Task,
  TaskCreateRequest,
  TaskUpdateRequest,
  TaskAssignRequest,
  TaskStatus,
} from '@/shared/types'

/** Fetch all tasks, optionally filtered by status */
export function getAll(status?: TaskStatus) {
  return http.get<Task[]>(
    endpoints.tasks.list,
    status ? { params: { status } } : undefined,
  )
}

/** Fetch tasks assigned to the current user */
export function getMy() {
  return http.get<Task[]>(endpoints.tasks.my)
}

/** Fetch a single task by ID */
export function getById(id: number) {
  return http.get<Task>(endpoints.tasks.byId(id))
}

/** Create a new task (lead/manager only) */
export function create(body: TaskCreateRequest) {
  return http.post<Task>(endpoints.tasks.list + '/', body)
}

/** Partial update of a task (lead/manager only) */
export function update(id: number, body: TaskUpdateRequest) {
  return http.patch<Task>(endpoints.tasks.byId(id), body)
}

/** Current user takes a free task */
export function take(id: number) {
  return http.patch<Task>(endpoints.tasks.take(id))
}

/** Current user releases their assigned task */
export function release(id: number) {
  return http.patch<Task>(endpoints.tasks.release(id))
}

/** Assign a task to a user, or unassign with null (lead/manager only) */
export function assign(id: number, body: TaskAssignRequest) {
  return http.patch<Task>(endpoints.tasks.assign(id), body)
}

/** Delete a task permanently (manager only) */
export function remove(id: number) {
  return http.del(endpoints.tasks.byId(id))
}
