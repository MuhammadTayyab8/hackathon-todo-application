# Implementation Plan: Auth-Aware Frontend Routing & Task Calendar Enhancements

**Branch**: `001-auth-routing-calendar` | **Date**: 2026-01-12 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-auth-routing-calendar/spec.md`

## Summary

This feature implements authentication-aware routing with middleware-based protection, migrates token storage from localStorage to HTTP cookies, adds start date fields to tasks, and creates a visual calendar view with color-coded task urgency indicators. The implementation enhances security through cookie-based authentication, improves user experience with personalized navigation, and provides better task planning capabilities through date range definition and calendar visualization.

## Technical Context

**Language/Version**: TypeScript 5.x (Frontend), Python 3.11+ (Backend)
**Primary Dependencies**: Next.js 16.1+ (App Router), FastAPI, SQLModel, Better Auth 1.0+, lucide-react
**Storage**: Neon PostgreSQL (via SQLModel ORM)
**Testing**: Jest/React Testing Library (Frontend), pytest (Backend)
**Target Platform**: Web (Chrome, Firefox, Safari, Edge - modern browsers)
**Project Type**: Web application (monorepo with frontend/backend)
**Performance Goals**:
- Route redirects < 100ms
- Calendar load time < 1s for 100 tasks
- Navbar auth state update < 200ms
**Constraints**:
- Must maintain backward compatibility with existing auth system
- Cookie security flags required (HttpOnly, Secure, SameSite)
- No localStorage token storage after migration
**Scale/Scope**:
- Multi-user application
- ~10 new/modified files
- 2 new database fields
- 1 new page route (/calendar)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)? ✅ Yes - spec created first
- [x] **Phase**: Change allowed in active phase (Phase 2)? ✅ Yes - Phase 2 allows web UI enhancements
- [x] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB? ✅ Yes - all stack requirements met
- [x] **Security**: JWT verification required for all new endpoints? ✅ Yes - existing JWT middleware applies
- [x] **Scoping**: Data access scoped to user via `user_id` from JWT? ✅ Yes - tasks already scoped by user_id
- [x] **API**: URL follows `/api/{user_id}/tasks` pattern? ✅ Yes - existing pattern maintained
- [x] **Persistence**: Database access ONLY via backend API? ✅ Yes - no direct DB access from frontend
- [x] **Secrets**: No secrets stored on frontend? ✅ Yes - cookies are HttpOnly, no secrets in localStorage

**Post-Design Re-check**: ✅ All gates pass after Phase 1 design

## Project Structure

### Documentation (this feature)

```text
specs/001-auth-routing-calendar/
├── spec.md                    # Feature specification (completed)
├── plan.md                    # This file (in progress)
├── research.md                # Phase 0 output (to be created)
├── data-model.md              # Phase 1 output (to be created)
├── quickstart.md              # Phase 1 output (to be created)
├── contracts/                 # Phase 1 output (to be created)
│   ├── task-api.yaml         # Updated task endpoints
│   └── middleware-flow.md    # Middleware logic documentation
├── checklists/
│   └── requirements.md       # Spec quality checklist (completed)
└── tasks.md                   # Phase 2 output (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── task.py                    # [MODIFY] Add start_date field
│   │   └── user.py                    # [READ] For user info in responses
│   ├── api/
│   │   ├── routes/
│   │   │   └── tasks.py               # [MODIFY] Update CRUD for start_date
│   │   └── middleware/
│   │       └── jwt_middleware.py      # [READ] Existing JWT validation
│   ├── migrations/
│   │   └── versions/
│   │       └── 002_add_task_start_date.py  # [CREATE] Migration for start_date
│   └── main.py                        # [READ] CORS/cookie config check
└── tests/
    └── api/
        └── test_tasks.py              # [MODIFY] Add start_date tests

frontend/
├── src/
│   ├── middleware.ts                  # [CREATE] Route protection middleware
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── signin/page.tsx       # [READ] Existing auth pages
│   │   │   └── signup/page.tsx       # [READ] Existing auth pages
│   │   ├── dashboard/page.tsx        # [READ] Protected route
│   │   ├── tasks/page.tsx            # [READ] Protected route
│   │   ├── categories/page.tsx       # [READ] Protected route
│   │   ├── calendar/
│   │   │   └── page.tsx              # [CREATE] Calendar view
│   │   └── page.tsx                  # [READ] Public landing page
│   ├── components/
│   │   ├── layout/
│   │   │   └── Navbar.tsx            # [MODIFY] Add auth-aware rendering
│   │   ├── tasks/
│   │   │   └── TaskForm.tsx          # [MODIFY] Add start_date field
│   │   └── calendar/
│   │       ├── CalendarView.tsx      # [CREATE] Main calendar component
│   │       ├── CalendarGrid.tsx      # [CREATE] Month grid layout
│   │       ├── TaskEvent.tsx         # [CREATE] Task display on calendar
│   │       └── CalendarHeader.tsx    # [CREATE] Month navigation
│   ├── lib/
│   │   ├── api.ts                    # [MODIFY] Update Task interface
│   │   ├── auth.ts                   # [MODIFY] Cookie-based auth config
│   │   └── utils/
│   │       ├── auth-helpers.ts       # [CREATE] Auth state utilities
│   │       ├── date-helpers.ts       # [CREATE] Date formatting/calculations
│   │       └── task-colors.ts        # [CREATE] Urgency color logic
│   └── hooks/
│       ├── useAuth.ts                # [CREATE] Auth state hook
│       └── useCalendar.ts            # [CREATE] Calendar data hook
└── tests/
    ├── middleware.test.ts            # [CREATE] Middleware tests
    └── components/
        └── calendar/
            └── CalendarView.test.tsx # [CREATE] Calendar component tests
```

**Structure Decision**: Web application structure (Option 2) selected. The project uses a monorepo with separate `backend/` and `frontend/` directories. Backend uses FastAPI with SQLModel for data persistence, frontend uses Next.js 16 App Router with TypeScript. This structure supports the full-stack nature of the feature with clear separation between API and UI concerns.

## Complexity Tracking

> No Constitution violations - all gates pass. This section intentionally left empty.

---

## Phase 0: Research & Technology Decisions

### Research Tasks

1. **Next.js 16 Middleware for Route Protection**
   - Research: Next.js middleware.ts patterns for authentication
   - Research: Cookie reading in middleware (Next.js limitations)
   - Research: Redirect strategies for protected/public routes

2. **Cookie-Based Authentication with Better Auth**
   - Research: Better Auth cookie configuration options
   - Research: HttpOnly, Secure, SameSite cookie flags
   - Research: Cookie-based JWT storage vs localStorage
   - Research: Better Auth session management with cookies

3. **Calendar Implementation Approach**
   - Research: Calendar libraries compatible with Next.js 16 (react-big-calendar, fullcalendar, custom)
   - Research: Date range rendering strategies
   - Research: Performance optimization for 100+ tasks
   - Research: Color coding patterns for urgency

4. **Database Migration Strategy**
   - Research: SQLModel/Alembic migration for adding start_date field
   - Research: Handling existing tasks without start_date (nullable vs default)
   - Research: Date storage format (timezone handling)

### Technology Decisions

**Decision 1: Middleware Implementation**
- **Chosen**: Next.js 16 middleware.ts with cookie-based auth check
- **Rationale**: Native Next.js middleware provides edge-runtime performance, runs before page render, supports cookie reading via request headers
- **Alternatives Considered**:
  - Client-side route guards: Rejected due to flash of unauthorized content
  - Server Components with redirect: Rejected due to per-page duplication
- **Implementation**: Create `src/middleware.ts` with matcher config for protected routes

**Decision 2: Cookie Storage Strategy**
- **Chosen**: Better Auth with cookie storage plugin, HttpOnly cookies
- **Rationale**: Better Auth 1.0+ supports cookie-based sessions natively, HttpOnly prevents XSS attacks, Secure flag ensures HTTPS-only transmission
- **Alternatives Considered**:
  - Manual cookie management: Rejected due to complexity and security risks
  - Session storage: Rejected due to tab-specific limitations
- **Implementation**: Configure Better Auth `cookieStorage` option with security flags

**Decision 3: Calendar Library**
- **Chosen**: Custom calendar implementation using native Date APIs
- **Rationale**: Lightweight (no heavy dependencies), full control over rendering, better performance for simple month view, easier to customize color coding
- **Alternatives Considered**:
  - react-big-calendar: Rejected due to bundle size (200KB+) and complexity
  - fullcalendar: Rejected due to licensing and overkill for requirements
- **Implementation**: Build CalendarGrid component with CSS Grid, TaskEvent components for date ranges

**Decision 4: Task Date Model**
- **Chosen**: Add `start_date` as nullable datetime field, rename `due_date` to `end_date` in UI only
- **Rationale**: Maintains backward compatibility (existing tasks have null start_date), clear semantics for date ranges, minimal migration risk
- **Alternatives Considered**:
  - Required start_date: Rejected due to breaking existing tasks
  - Separate date range table: Rejected as over-engineering
- **Implementation**: Alembic migration adds nullable `start_date` column, validation ensures start_date <= end_date

**Decision 5: Color Coding Logic**
- **Chosen**: Calculate days until end_date, apply thresholds: ≤1 day = red, 2-3 days = yellow, ≥4 days = green
- **Rationale**: Simple calculation, clear visual hierarchy, aligns with common urgency patterns
- **Alternatives Considered**:
  - Percentage-based (time elapsed): Rejected as less intuitive
  - User-configurable thresholds: Rejected as out of scope
- **Implementation**: Utility function `getTaskUrgencyColor(endDate: Date): string`

---

## Phase 1: Design & Contracts

### Data Model Changes

**File**: `specs/001-auth-routing-calendar/data-model.md`

#### Task Entity (Modified)

```typescript
// Frontend TypeScript Interface
interface Task {
  id: string
  user_id: string
  title: string
  description?: string
  start_date?: string        // NEW: ISO 8601 datetime string
  due_date?: string          // EXISTING: Renamed to end_date in UI
  category_id?: number
  category_name?: string
  completed: boolean
  created_at: string
  updated_at: string
}

interface TaskCreate {
  title: string
  category_id: number
  description?: string
  start_date?: string        // NEW: Optional start date
  due_date?: string          // Maps to end_date in UI
}

interface TaskUpdate {
  title?: string
  category_id?: number
  description?: string
  start_date?: string        // NEW: Optional start date
  due_date?: string          // Maps to end_date in UI
  completed?: boolean
}
```

```python
# Backend SQLModel Schema
class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True)
    title: str = Field(min_length=1)
    description: Optional[str] = None
    start_date: Optional[datetime] = None  # NEW FIELD
    due_date: Optional[datetime] = None    # EXISTING (end date)
    category_id: Optional[int] = Field(foreign_key="category.id")
    completed: bool = False
    created_at: datetime
    updated_at: datetime

class TaskCreate(SQLModel):
    title: str
    category_id: int
    description: Optional[str] = None
    start_date: Optional[datetime] = None  # NEW FIELD
    due_date: Optional[datetime] = None

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None  # NEW FIELD
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
```

**Validation Rules**:
- `start_date` must be <= `due_date` (if both provided)
- Both dates are optional (nullable)
- Dates stored as UTC datetime without timezone info (existing pattern)

#### User Entity (Read-Only)

```typescript
// Frontend - used for navbar display
interface User {
  id: string
  username: string
  email: string
  created_at: string
}
```

**No changes to User model** - existing structure sufficient for navbar display.

### API Contracts

**File**: `specs/001-auth-routing-calendar/contracts/task-api.yaml`

```yaml
openapi: 3.0.0
info:
  title: Task API - Updated for Date Ranges
  version: 2.0.0

paths:
  /api/{user_id}/tasks:
    get:
      summary: List all tasks for authenticated user
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      responses:
        '200':
          description: List of tasks
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/TaskRead'
        '401':
          description: Unauthorized (invalid JWT)

    post:
      summary: Create new task
      parameters:
        - name: user_id
          in: path
          required: true
          schema:
            type: string
            format: uuid
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TaskCreate'
      responses:
        '201':
          description: Task created
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/TaskRead'
        '400':
          description: Validation error (start_date > due_date)
        '401':
          description: Unauthorized

  /api/{user_id}/tasks/{task_id}:
    get:
      summary: Get single task
      responses:
        '200':
          description: Task details
        '404':
          description: Task not found

    put:
      summary: Update task
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/TaskUpdate'
      responses:
        '200':
          description: Task updated
        '400':
          description: Validation error (start_date > due_date)

    delete:
      summary: Delete task
      responses:
        '204':
          description: Task deleted

components:
  schemas:
    TaskRead:
      type: object
      properties:
        id:
          type: string
          format: uuid
        user_id:
          type: string
          format: uuid
        title:
          type: string
        description:
          type: string
          nullable: true
        start_date:
          type: string
          format: date-time
          nullable: true
          description: "NEW: Task start date (ISO 8601)"
        due_date:
          type: string
          format: date-time
          nullable: true
          description: "Task end/due date (ISO 8601)"
        category_id:
          type: integer
          nullable: true
        category_name:
          type: string
          nullable: true
        completed:
          type: boolean
        created_at:
          type: string
          format: date-time
        updated_at:
          type: string
          format: date-time

    TaskCreate:
      type: object
      required:
        - title
        - category_id
      properties:
        title:
          type: string
          minLength: 1
        category_id:
          type: integer
        description:
          type: string
          nullable: true
        start_date:
          type: string
          format: date-time
          nullable: true
        due_date:
          type: string
          format: date-time
          nullable: true

    TaskUpdate:
      type: object
      properties:
        title:
          type: string
        category_id:
          type: integer
        description:
          type: string
        start_date:
          type: string
          format: date-time
          nullable: true
        due_date:
          type: string
          format: date-time
          nullable: true
        completed:
          type: boolean

  securitySchemes:
    BearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - BearerAuth: []
```

### Middleware Flow

**File**: `specs/001-auth-routing-calendar/contracts/middleware-flow.md`

```markdown
# Next.js Middleware Authentication Flow

## Route Classification

**Public Routes** (no auth required):
- `/` - Landing page
- `/signin` - Sign in page
- `/signup` - Sign up page
- `/_next/*` - Next.js internals
- `/api/*` - API routes (handled by backend)

**Protected Routes** (auth required):
- `/dashboard`
- `/tasks`
- `/categories`
- `/calendar`

## Middleware Logic

```typescript
// Pseudocode for middleware.ts
export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname
  const authToken = request.cookies.get('auth_token')?.value

  const isPublicRoute = ['/', '/signin', '/signup'].includes(path)
  const isProtectedRoute = ['/dashboard', '/tasks', '/categories', '/calendar'].some(
    route => path.startsWith(route)
  )

  // Case 1: Protected route without auth → redirect to signin
  if (isProtectedRoute && !authToken) {
    return NextResponse.redirect(new URL('/signin', request.url))
  }

  // Case 2: Auth pages with auth → redirect to dashboard
  if (['/signin', '/signup'].includes(path) && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Case 3: Public route or valid auth → allow
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
}
```

## Cookie Configuration

```typescript
// Better Auth cookie config
{
  cookieStorage: {
    name: 'auth_token',
    options: {
      httpOnly: true,      // Prevents JavaScript access
      secure: true,        // HTTPS only
      sameSite: 'lax',     // CSRF protection
      maxAge: 604800,      // 7 days (matches JWT expiry)
      path: '/'
    }
  }
}
```

## Authentication State Flow

1. **User logs in** → Better Auth creates JWT → Stores in HttpOnly cookie
2. **User navigates** → Middleware reads cookie → Validates presence → Allows/redirects
3. **User logs out** → Better Auth clears cookie → Middleware redirects to signin
4. **Token expires** → Middleware detects missing/invalid cookie → Redirects to signin

## Edge Cases

- **Token expiry during session**: Middleware redirects to signin, user sees login page
- **Manual cookie deletion**: Same as token expiry
- **Concurrent tabs**: Cookie shared across tabs, logout affects all tabs
- **HTTPS requirement**: Secure flag requires HTTPS in production (localhost exempt)
```

### Quickstart Guide

**File**: `specs/001-auth-routing-calendar/quickstart.md`

```markdown
# Quickstart: Auth-Aware Routing & Calendar

## Prerequisites

- Node.js 18+
- Python 3.11+
- PostgreSQL (Neon) connection string
- Existing auth system configured

## Backend Setup

### 1. Add start_date field to Task model

```bash
cd backend
# Create migration
alembic revision -m "add_task_start_date"
# Edit migration file (see data-model.md)
alembic upgrade head
```

### 2. Update Task routes

```python
# backend/src/api/routes/tasks.py
# Add validation for start_date <= due_date
if task_data.start_date and task_data.due_date:
    if task_data.start_date > task_data.due_date:
        raise HTTPException(400, "start_date cannot be after due_date")
```

### 3. Test backend changes

```bash
pytest backend/src/tests/api/test_tasks.py -v
```

## Frontend Setup

### 1. Create middleware for route protection

```bash
cd frontend/src
touch middleware.ts
# Implement middleware logic (see contracts/middleware-flow.md)
```

### 2. Configure Better Auth for cookies

```typescript
// frontend/src/lib/auth.ts
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  plugins: [
    jwtClient({
      issuer: "todo-app",
      expiresIn: "7d",
    })
  ],
  cookieStorage: {
    name: 'auth_token',
    options: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 604800,
      path: '/'
    }
  }
})
```

### 3. Update Navbar for auth-aware rendering

```typescript
// frontend/src/components/layout/Navbar.tsx
import { useAuth } from '@/hooks/useAuth'

export function Navbar() {
  const { user, isAuthenticated } = useAuth()

  return (
    <nav>
      {isAuthenticated ? (
        <span>Welcome, {user?.username}</span>
      ) : (
        <>
          <Link href="/signin">Login</Link>
          <Link href="/signup">Signup</Link>
        </>
      )}
    </nav>
  )
}
```

### 4. Add start_date to TaskForm

```typescript
// frontend/src/components/tasks/TaskForm.tsx
<input
  type="date"
  name="start_date"
  value={formData.start_date}
  onChange={handleChange}
/>
<input
  type="date"
  name="due_date"
  value={formData.due_date}
  onChange={handleChange}
/>
// Add validation: start_date <= due_date
```

### 5. Create calendar page

```bash
mkdir -p frontend/src/app/calendar
touch frontend/src/app/calendar/page.tsx
mkdir -p frontend/src/components/calendar
# Create CalendarView, CalendarGrid, TaskEvent components
```

### 6. Implement color coding utility

```typescript
// frontend/src/lib/utils/task-colors.ts
export function getTaskUrgencyColor(endDate: Date): string {
  const now = new Date()
  const daysUntil = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntil <= 1) return 'red'
  if (daysUntil <= 3) return 'yellow'
  return 'green'
}
```

## Testing

### Middleware Tests

```bash
npm test -- middleware.test.ts
```

### Calendar Component Tests

```bash
npm test -- components/calendar/
```

### Integration Tests

1. Test unauthenticated access to /dashboard → redirects to /signin
2. Test authenticated access to /signin → redirects to /dashboard
3. Test task creation with start_date and due_date
4. Test calendar displays tasks with correct colors
5. Test navbar shows username when authenticated

## Deployment Checklist

- [ ] Database migration applied to production
- [ ] Environment variables set (BETTER_AUTH_SECRET, NEXT_PUBLIC_API_URL)
- [ ] HTTPS enabled (required for Secure cookie flag)
- [ ] Cookie configuration tested in production
- [ ] Middleware redirects tested
- [ ] Calendar performance tested with 100+ tasks
```

---

## Phase 2: Implementation Tasks

**Note**: Detailed task breakdown will be generated by `/sp.tasks` command. This section provides high-level implementation phases.

### Implementation Phases

**Phase 2.1: Backend - Data Model & API** (Priority: P1)
1. Create Alembic migration for `start_date` field
2. Update Task model with `start_date` field
3. Add validation for `start_date <= due_date` in routes
4. Update task CRUD endpoints to handle `start_date`
5. Write backend tests for date validation

**Phase 2.2: Frontend - Middleware & Auth** (Priority: P1)
1. Create `middleware.ts` with route protection logic
2. Configure Better Auth for cookie storage
3. Create `useAuth` hook for auth state management
4. Update Navbar component for auth-aware rendering
5. Test middleware redirects (protected/public routes)

**Phase 2.3: Frontend - Task Form Enhancement** (Priority: P2)
1. Add `start_date` input field to TaskForm
2. Update Task interface in `lib/api.ts`
3. Implement client-side date validation
4. Update task creation/update API calls
5. Test task form with date ranges

**Phase 2.4: Frontend - Calendar View** (Priority: P3)
1. Create calendar page at `/app/calendar/page.tsx`
2. Build CalendarGrid component (month view)
3. Build TaskEvent component (task display)
4. Implement `getTaskUrgencyColor` utility
5. Create `useCalendar` hook for data fetching
6. Add calendar navigation (prev/next month)
7. Handle empty state (no tasks)
8. Test calendar rendering and color coding

**Phase 2.5: Integration & Testing** (Priority: P4)
1. End-to-end testing of auth flows
2. Integration testing of task date ranges
3. Performance testing of calendar with 100+ tasks
4. Cross-browser testing (Chrome, Firefox, Safari)
5. Mobile responsiveness testing

### Critical Path

```
Backend Migration → Backend API Updates → Frontend Middleware → Frontend Auth Config → Task Form → Calendar View
```

**Estimated Complexity**: Medium
- **Backend**: 2-3 hours (migration + validation)
- **Frontend Middleware**: 2-3 hours (middleware + auth config)
- **Frontend Task Form**: 1-2 hours (form updates + validation)
- **Frontend Calendar**: 4-6 hours (calendar components + logic)
- **Testing**: 2-3 hours (unit + integration tests)
- **Total**: 11-17 hours

---

## Risk Assessment

### High Risk

1. **Cookie Configuration Issues**
   - **Risk**: HttpOnly cookies not accessible in middleware, auth state not persisting
   - **Mitigation**: Test cookie reading in middleware early, verify Better Auth cookie plugin compatibility
   - **Fallback**: Use session storage temporarily, investigate Better Auth alternatives

2. **Middleware Performance**
   - **Risk**: Middleware runs on every request, could slow down page loads
   - **Mitigation**: Use efficient cookie reading, minimize logic in middleware, leverage edge runtime
   - **Fallback**: Move auth checks to server components if middleware too slow

### Medium Risk

1. **Date Validation Complexity**
   - **Risk**: Timezone handling causes date comparison issues
   - **Mitigation**: Store dates as UTC, compare dates without time component
   - **Fallback**: Add timezone field to tasks if needed

2. **Calendar Performance**
   - **Risk**: Rendering 100+ tasks on calendar causes lag
   - **Mitigation**: Implement virtualization, lazy load tasks by month
   - **Fallback**: Add pagination or limit visible tasks

### Low Risk

1. **Backward Compatibility**
   - **Risk**: Existing tasks without start_date break calendar view
   - **Mitigation**: Handle null start_date gracefully, use due_date as fallback
   - **Fallback**: Set default start_date = due_date for old tasks

---

## Success Metrics

- **Route Protection**: 100% of protected routes redirect unauthenticated users
- **Token Migration**: 0 tokens in localStorage after login
- **Date Validation**: 100% of invalid date ranges rejected
- **Calendar Performance**: < 1s load time for 100 tasks
- **Navbar Update**: < 200ms to show username after login
- **Test Coverage**: > 80% for new code

---

## Next Steps

1. Run `/sp.tasks` to generate detailed task breakdown
2. Review research.md and data-model.md artifacts
3. Begin Phase 2.1 (Backend implementation)
4. Set up CI/CD for automated testing
5. Schedule code review after Phase 2.2 completion
