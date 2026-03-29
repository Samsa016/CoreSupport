# FRONTEND SPECIFICATION — CoreSupport Task Management
# VERSION: 1.0 | TARGET: AI Code Generation Agent
# STACK: Next.js 14+ (App Router) | TypeScript | React

---

## CONTEXT

You are implementing a frontend for a task management system.
The backend is built with FastAPI. Auth uses JWT Bearer tokens via fastapi-users.
The project already uses Feature-Sliced Design (FSD). Follow it strictly.

Base API URL: `http://localhost:8000/api/v1`
All authenticated requests MUST include: `Authorization: Bearer {token}`

---

## SECTION 1: TYPESCRIPT TYPES (source of truth)

```typescript
// === ENUMS ===
type UserRole = "guest" | "worker" | "lead" | "manager";
type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "high" | "medium" | "low";

// === ENTITIES ===
interface User {
  id: number;
  email: string;
  is_active: boolean;
  role: UserRole;
  is_working: boolean;
}

interface Task {
  id: number;
  title: string;
  content: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignee_id: number | null; // null = task is FREE and can be taken
  created_at: string;         // ISO 8601
  updated_at: string;         // ISO 8601
}

// === API REQUEST BODIES ===
interface LoginRequest {
  username: string;  // email
  password: string;
  // Content-Type: application/x-www-form-urlencoded
}

interface TaskCreateRequest {
  title: string;           // required, 1-255 chars
  content?: string | null; // optional
  priority: TaskPriority;  // required
  // NOTE: status is NOT sent — backend sets it to "todo" automatically
  // NOTE: assignee_id is NOT sent — task is created FREE
}

interface TaskUpdateRequest {
  title?: string;
  content?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  // NOTE: partial update — send only fields that changed
}

interface TaskAssignRequest {
  assignee_id: number | null; // null = release the task
}

interface ChatRequest {
  message: string;
  context?: {
    url: string;
    errors?: string;
  };
}

// === API RESPONSE BODIES ===
interface LoginResponse {
  access_token: string;
  token_type: "bearer";
}

interface ChatResponse {
  answer: string; // Markdown formatted string
}

// Error shape from FastAPI:
interface ApiError {
  detail: string;
}
```

---

## SECTION 2: API CONTRACT

### AUTH
```
POST   /auth/login                  → LoginResponse        (Content-Type: form-urlencoded, NO auth header)
GET    /users/me                    → User                 (requires auth)
```

### TASKS
```
GET    /tasks                       → Task[]               (requires auth)
GET    /tasks?status={TaskStatus}   → Task[]               (requires auth, filter by status)
GET    /tasks/my                    → Task[]               (requires auth, returns tasks where assignee = current user)
GET    /tasks/{id}                  → Task                 (requires auth)
POST   /tasks/                      → Task  [201]          (requires auth, role: lead | manager)
PATCH  /tasks/{id}                  → Task                 (requires auth, role: lead | manager, body: TaskUpdateRequest)
PATCH  /tasks/{id}/take             → Task                 (requires auth, role: worker | lead | manager, NO body)
PATCH  /tasks/{id}/release          → Task                 (requires auth, role: worker | lead | manager, NO body)
PATCH  /tasks/{id}/assign           → Task                 (requires auth, role: lead | manager, body: TaskAssignRequest)
DELETE /tasks/{id}                  → 204 No Content       (requires auth, role: manager only)
```

### AGENT
```
POST   /agent/chat                  → ChatResponse         (requires auth, body: ChatRequest)
```

---

## SECTION 3: AUTH FLOW

```
USER VISITS ANY PAGE
  └── check localStorage for token
        ├── NO TOKEN → redirect to /login
        └── HAS TOKEN → GET /users/me
              ├── 200 OK → store User in global state → render page
              └── 401    → clear token → redirect to /login

POST /auth/login SUCCESS:
  1. Save token: localStorage.setItem("access_token", response.access_token)
  2. GET /users/me → store in global state
  3. Navigate to /dashboard
```

**Global state shape (use Zustand or React Context):**
```typescript
interface AuthStore {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}
```

---

## SECTION 4: PERMISSION RULES (implement as utility functions)

```typescript
// These rules are ENFORCED by backend. Frontend must MIRROR them for UX only.
// Never trust frontend-only permission checks for security.

const canCreateTask   = (role: UserRole) => ["lead", "manager"].includes(role);
const canUpdateTask   = (role: UserRole) => ["lead", "manager"].includes(role);
const canDeleteTask   = (role: UserRole) => role === "manager";
const canAssignTask   = (role: UserRole) => ["lead", "manager"].includes(role);
const canTakeTask     = (role: UserRole) => ["worker", "lead", "manager"].includes(role);

// A worker can release a task only if they ARE the assignee
const canReleaseTask  = (task: Task, currentUser: User) =>
  task.assignee_id === currentUser.id;

// A task can be taken only if it is FREE
const isTaskFree      = (task: Task) => task.assignee_id === null;
```

---

## SECTION 5: PAGES & ROUTING

### Next.js App Router structure:
```
app/
├── (public)/               # No auth required
│   └── page.tsx            # Route: / — Guest Stats Page
├── (auth)/
│   └── login/page.tsx      # Route: /login
├── dashboard/
│   ├── page.tsx            # Route: /dashboard — Kanban Board
│   └── my/page.tsx         # Route: /dashboard/my — My Tasks
└── middleware.ts            # Protects /dashboard/* routes
```

### middleware.ts logic:
```typescript
// If request path starts with /dashboard AND no token in cookies/headers → redirect to /login
// If request path is /login AND token exists → redirect to /dashboard
```

---

## SECTION 6: PAGE SPECIFICATIONS

### PAGE: `/` (Guest Stats — public, no auth)

**DATA REQUIRED:**
```typescript
// Compute from two API calls (use a service account token or make endpoints public):
const todoTasks       = await GET /tasks?status=todo       // Task[]
const inProgressTasks = await GET /tasks?status=in_progress // Task[]
```

**UI ELEMENTS:**
```
- Display: "Tasks in queue: {todoTasks.length}"
- Display: "Tasks in progress: {inProgressTasks.length}"
- Display: "Team load: {Math.round(inProgressTasks.length / (todoTasks.length + inProgressTasks.length) * 100)}%"
- NO user names, NO task details — aggregate numbers only
- "Log in" button → navigates to /login
```

---

### PAGE: `/login`

**UI ELEMENTS:**
```
- Email input    (type="email", name="username")
- Password input (type="password", name="password")
- Submit button  → calls POST /auth/login
```

**Error handling:**
```
401 → show "Wrong email or password"
422 → show "Please fill in all fields"
```

---

### PAGE: `/dashboard` (Kanban Board)

**DATA REQUIRED:**
```typescript
const allTasks = await GET /tasks  // Task[] — all tasks for the board
```

**UI STRUCTURE:**
```
┌────────────── HEADER ──────────────────────────────────────────────┐
│ CoreSupport   [current_user.email]  [role badge]  [Log out]        │
└────────────────────────────────────────────────────────────────────┘

[My Tasks] tab   [All Tasks] tab

IF canCreateTask(user.role):
  [+ Create Task] button (top right)

┌──── TODO ────┐  ┌── IN PROGRESS ──┐  ┌──── DONE ────┐
│  TaskCard    │  │   TaskCard      │  │  TaskCard    │
│  TaskCard    │  │   TaskCard      │  │  TaskCard    │
└──────────────┘  └─────────────────┘  └──────────────┘

[AI Chat Widget] — floating bottom-right button
```

**TaskCard component — conditional actions:**
```typescript
// Render these buttons ONLY when conditions are met:

IF isTaskFree(task) AND canTakeTask(user.role):
  → Button "Take task" → PATCH /tasks/{id}/take (NO body)

IF canReleaseTask(task, user):
  → Button "Release" → PATCH /tasks/{id}/release (NO body)

IF canAssignTask(user.role):
  → Button "Assign to..." → opens modal with user selector
  → On confirm: PATCH /tasks/{id}/assign { assignee_id: selectedUserId }
  → To unassign: PATCH /tasks/{id}/assign { assignee_id: null }

IF canUpdateTask(user.role):
  → Button "Edit" → opens edit modal

IF canDeleteTask(user.role):
  → Button "Delete" → confirm dialog → DELETE /tasks/{id}
```

**After any mutating action (take/release/assign/update/delete):**
```
→ Refetch GET /tasks to refresh the board (or update local state optimistically)
```

**Priority badge colors:**
```typescript
const priorityColor: Record<TaskPriority, string> = {
  high:   "#EF4444", // red
  medium: "#F59E0B", // amber
  low:    "#22C55E", // green
};
```

---

### PAGE: `/dashboard/my`

```typescript
const myTasks = await GET /tasks/my  // Task[] — only tasks assigned to current user
```

Same TaskCard rendering as `/dashboard` but no "Take task" button (already assigned).

---

## SECTION 7: MODALS

### Create Task Modal (role: lead | manager)
```typescript
// Form fields:
interface CreateTaskForm {
  title: string;        // required
  content: string;      // optional, textarea
  priority: TaskPriority; // select: "high" | "medium" | "low", default: "medium"
}

// On submit:
POST /tasks/ { title, content: content || null, priority }
// On 201 success → close modal → refetch /tasks
// On 422 → show field validation errors
```

### Edit Task Modal (role: lead | manager)
```typescript
// Pre-fill form with current task values
// All fields optional (partial update)
interface EditTaskForm {
  title?: string;
  content?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;   // allow manager to manually move to "done"
}

// On submit:
PATCH /tasks/{id} { ...changedFieldsOnly }
// On success → close modal → refetch /tasks
```

### Assign Modal (role: lead | manager)
```typescript
// Show list of users to select from
// NOTE: GET /users endpoint may need to be confirmed with backend
GET /users  → User[]

// Render each user as: "{email} ({role})"
// On select → PATCH /tasks/{id}/assign { assignee_id: selectedUser.id }
// "Unassign" option → PATCH /tasks/{id}/assign { assignee_id: null }
```

---

## SECTION 8: AI CHAT WIDGET

```typescript
// State (local, component-level):
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

const [messages, setMessages] = useState<ChatMessage[]>([]);
const [input, setInput] = useState("");

// On send:
const sendMessage = async () => {
  const userMsg: ChatMessage = { role: "user", content: input };
  setMessages(prev => [...prev, userMsg]);
  setInput("");

  const response = await POST /agent/chat {
    message: input,
    context: { url: window.location.pathname }
  };

  const assistantMsg: ChatMessage = { role: "assistant", content: response.answer };
  setMessages(prev => [...prev, assistantMsg]);
};

// IMPORTANT: Render assistant messages with a Markdown renderer (e.g. react-markdown)
// Do NOT render as raw HTML — use react-markdown with remarkGfm plugin
```

---

## SECTION 9: ERROR HANDLING (global)

```typescript
// Implement as an Axios/fetch interceptor or wrapper:

const handleApiError = (status: number, detail: string) => {
  switch (status) {
    case 401:
      clearAuth();
      router.push("/login");
      break;
    case 403:
      showToast("Access denied: " + detail, "error");
      break;
    case 404:
      showToast("Not found: " + detail, "error");
      break;
    case 409:
      showToast("Conflict: " + detail, "error");
      // 409 on /take = "Task is already taken by another worker"
      break;
    case 422:
      // Show field-level validation errors in the form
      break;
    default:
      showToast("Something went wrong", "error");
  }
};
```

---

## SECTION 10: SHARED API CLIENT

```typescript
// src/shared/api/client.ts
// Configure once, use everywhere

import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8000/api/v1",
  headers: { "Content-Type": "application/json" },
});

// Request interceptor: attach token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Response interceptor: handle 401 globally
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
```

---

## SECTION 11: OPEN QUESTIONS (must resolve before implementation)

1. **GET /users** — Does an endpoint exist to list all users (needed for Assign modal)?
   - If not, backend must create: `GET /api/v1/users → User[]` (MANAGER only)

2. **PATCH /users/me** — How to update `is_working` for current user?
   - fastapi-users patch endpoint URL format needs confirmation.

3. **Guest stats page** — GET /tasks requires auth. Options:
   - Option A: Backend creates a public `GET /public/stats` endpoint
   - Option B: Frontend skips the guest page (simplest)

4. **Pagination** — Should `GET /tasks` support `?limit=&offset=`?
   - If board can have 100+ tasks, pagination or virtualization is needed.
