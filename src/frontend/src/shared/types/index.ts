// === ENUMS ===
export type UserRole = "guest" | "worker" | "lead" | "manager";
export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "high" | "medium" | "low";

// === ENTITIES ===
export interface User {
  id: number;
  email: string;
  is_active: boolean;
  role: UserRole;
  is_working: boolean;
}

export interface Task {
  id: number;
  title: string;
  content: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id: number | null;
  created_at: string;
  updated_at: string;
}

// === API REQUEST BODIES ===
export interface LoginRequest {
  username: string;
  password: string;
}

export interface TaskCreateRequest {
  title: string;
  content?: string | null;
  priority: TaskPriority;
}

export interface TaskUpdateRequest {
  title?: string;
  content?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface TaskAssignRequest {
  assignee_id: number | null;
}

export interface ChatRequest {
  message: string;
  context?: {
    url: string;
    errors?: string;
  };
}

// === API RESPONSE BODIES ===
export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
}

export interface ChatResponse {
  answer: string;
}

export interface ApiError {
  detail: string;
}
