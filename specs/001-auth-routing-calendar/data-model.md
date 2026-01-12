# Data Model: Auth-Aware Routing & Calendar

**Feature**: 001-auth-routing-calendar
**Date**: 2026-01-12
**Status**: Design Complete

## Overview

This document defines the data model changes required for the auth-aware routing and calendar feature. The primary change is adding a `start_date` field to the Task entity to support date range definition and calendar visualization.

---

## Entity: Task (Modified)

### Frontend TypeScript Interface

```typescript
interface Task {
  id: string                 // UUID
  user_id: string            // UUID - foreign key to User
  title: string              // Required, min length 1
  description?: string       // Optional text
  start_date?: string        // NEW: ISO 8601 datetime string (nullable)
  due_date?: string          // EXISTING: ISO 8601 datetime string (nullable)
  category_id?: number       // Optional foreign key to Category
  category_name?: string     // Denormalized for display
  completed: boolean         // Task completion status
  created_at: string         // ISO 8601 datetime
  updated_at: string         // ISO 8601 datetime
}

interface TaskCreate {
  title: string              // Required
  category_id: number        // Required
  description?: string       // Optional
  start_date?: string        // NEW: Optional ISO 8601 datetime
  due_date?: string          // Optional ISO 8601 datetime
}

interface TaskUpdate {
  title?: string             // Optional
  category_id?: number       // Optional
  description?: string       // Optional
  start_date?: string        // NEW: Optional ISO 8601 datetime
  due_date?: string          // Optional ISO 8601 datetime
  completed?: boolean        // Optional
}
```

### Backend SQLModel Schema

```python
from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlmodel import SQLModel, Field

class TaskBase(SQLModel):
    content: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    user_id: uuid.UUID = Field(
        foreign_key="user.id",
        index=True,
        nullable=False
    )
    title: str = Field(min_length=1)
    description: Optional[str] = Field(default=None)
    start_date: Optional[datetime] = Field(default=None)  # NEW FIELD
    due_date: Optional[datetime] = Field(default=None)    # EXISTING
    category_id: Optional[int] = Field(
        default=None,
        foreign_key="category.id",
        index=True
    )
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None)
    )

class TaskCreate(SQLModel):
    title: str = Field(min_length=1)
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
    content: Optional[str] = None
    completed: Optional[bool] = None

class TaskRead(TaskBase):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str]
    start_date: Optional[datetime]  # NEW FIELD
    due_date: Optional[datetime]
    category_id: Optional[int]
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
```

### Database Schema (PostgreSQL)

```sql
-- Existing table structure
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES "user"(id),
    title VARCHAR NOT NULL CHECK (length(title) >= 1),
    description TEXT,
    due_date TIMESTAMP,
    category_id INTEGER REFERENCES category(id),
    content TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- Migration: Add start_date column
ALTER TABLE tasks ADD COLUMN start_date TIMESTAMP;

-- Indexes (existing)
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
```

### Validation Rules

1. **Date Range Validation**:
   - If both `start_date` and `due_date` are provided, `start_date` MUST be <= `due_date`
   - Validation enforced at application level (backend API)
   - Error response: HTTP 400 with message "start_date cannot be after due_date"

2. **Nullability**:
   - Both `start_date` and `due_date` are nullable (optional)
   - Tasks can have neither, one, or both dates
   - Calendar view handles null dates gracefully

3. **Timezone Handling**:
   - Dates stored as UTC datetime without timezone info (existing pattern)
   - Frontend sends ISO 8601 strings with timezone
   - Backend strips timezone before storage
   - Frontend displays in user's local timezone

### State Transitions

No state machine required - dates are simple attributes with validation.

---

## Entity: User (Read-Only)

### Frontend TypeScript Interface

```typescript
interface User {
  id: string                 // UUID
  username: string           // Display name
  email: string              // Email address
  created_at: string         // ISO 8601 datetime
}
```

### Usage

- Used for navbar display (show username when authenticated)
- No changes to User model required
- Existing Better Auth integration provides user data

---

## Entity: Route (Conceptual)

### Route Classification

```typescript
type RouteType = 'public' | 'protected'

interface RouteConfig {
  path: string
  type: RouteType
  requiresAuth: boolean
  redirectIfAuth?: string    // Where to redirect if authenticated
  redirectIfNoAuth?: string  // Where to redirect if not authenticated
}

const routes: RouteConfig[] = [
  // Public routes
  { path: '/', type: 'public', requiresAuth: false },
  { path: '/signin', type: 'public', requiresAuth: false, redirectIfAuth: '/dashboard' },
  { path: '/signup', type: 'public', requiresAuth: false, redirectIfAuth: '/dashboard' },

  // Protected routes
  { path: '/dashboard', type: 'protected', requiresAuth: true, redirectIfNoAuth: '/signin' },
  { path: '/tasks', type: 'protected', requiresAuth: true, redirectIfNoAuth: '/signin' },
  { path: '/categories', type: 'protected', requiresAuth: true, redirectIfNoAuth: '/signin' },
  { path: '/calendar', type: 'protected', requiresAuth: true, redirectIfNoAuth: '/signin' },
]
```

---

## Entity: AuthToken (Cookie)

### Cookie Structure

```typescript
interface AuthCookie {
  name: 'auth_token'
  value: string              // JWT token
  options: {
    httpOnly: true           // Prevents JavaScript access
    secure: boolean          // true in production (HTTPS only)
    sameSite: 'lax'          // CSRF protection
    maxAge: 604800           // 7 days in seconds
    path: '/'                // Available to all routes
  }
}
```

### JWT Payload (Read-Only)

```typescript
interface JWTPayload {
  sub: string                // User ID (UUID)
  username: string           // User display name
  email: string              // User email
  iat: number                // Issued at (Unix timestamp)
  exp: number                // Expires at (Unix timestamp)
  iss: 'todo-app'            // Issuer
}
```

---

## Relationships

```
User (1) ----< (N) Task
  |
  └─ id (UUID)
       └─ Task.user_id (FK)

Category (1) ----< (N) Task
  |
  └─ id (int)
       └─ Task.category_id (FK, nullable)

Task
  ├─ start_date (datetime, nullable) [NEW]
  └─ due_date (datetime, nullable)   [EXISTING]
```

---

## Migration Script

### Alembic Migration

```python
"""add_task_start_date

Revision ID: 002_add_task_start_date
Revises: 001_add_category_and_update_task_fields
Create Date: 2026-01-12

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = '002_add_task_start_date'
down_revision = '001_add_category_and_update_task_fields'
branch_labels = None
depends_on = None

def upgrade():
    # Add start_date column as nullable
    op.add_column('tasks', sa.Column('start_date', sa.DateTime(), nullable=True))

def downgrade():
    # Remove start_date column
    op.drop_column('tasks', 'start_date')
```

### Running Migration

```bash
# Create migration file
cd backend
alembic revision -m "add_task_start_date"

# Edit the generated file with the upgrade/downgrade functions above

# Apply migration
alembic upgrade head

# Verify migration
alembic current
```

---

## Data Examples

### Task with Date Range

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Complete project proposal",
  "description": "Draft and finalize Q1 project proposal",
  "start_date": "2026-01-15T09:00:00Z",
  "due_date": "2026-01-20T17:00:00Z",
  "category_id": 1,
  "category_name": "Work",
  "completed": false,
  "created_at": "2026-01-12T10:30:00Z",
  "updated_at": "2026-01-12T10:30:00Z"
}
```

### Task with Only Due Date (Backward Compatible)

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Review pull request",
  "description": null,
  "start_date": null,
  "due_date": "2026-01-13T12:00:00Z",
  "category_id": 2,
  "category_name": "Development",
  "completed": false,
  "created_at": "2026-01-12T11:00:00Z",
  "updated_at": "2026-01-12T11:00:00Z"
}
```

### Task with No Dates

```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "user_id": "123e4567-e89b-12d3-a456-426614174000",
  "title": "Read documentation",
  "description": "Review Next.js 16 docs",
  "start_date": null,
  "due_date": null,
  "category_id": 3,
  "category_name": "Learning",
  "completed": false,
  "created_at": "2026-01-12T11:15:00Z",
  "updated_at": "2026-01-12T11:15:00Z"
}
```

---

## Backward Compatibility

### Existing Tasks

- All existing tasks will have `start_date = null` after migration
- No data migration required (nullable column)
- Existing API consumers continue to work (optional field)
- Calendar view handles null start_date gracefully

### API Compatibility

- GET requests return `start_date: null` for old tasks
- POST/PUT requests accept `start_date` as optional
- Omitting `start_date` in requests maintains existing behavior
- No breaking changes to API contract

---

## Performance Considerations

### Indexing

- No new indexes required for `start_date` (not used in WHERE clauses)
- Existing `user_id` index sufficient for calendar queries
- Calendar queries filter by user_id, then sort/filter in application layer

### Query Patterns

```sql
-- Calendar view query (fetch all user tasks for month)
SELECT * FROM tasks
WHERE user_id = $1
  AND (start_date IS NOT NULL OR due_date IS NOT NULL)
ORDER BY COALESCE(start_date, due_date) ASC;
```

### Caching Strategy

- No server-side caching required (user-specific data)
- Frontend can cache calendar data per month
- Invalidate cache on task create/update/delete

---

## Testing Considerations

### Unit Tests

- Test date validation (start_date <= due_date)
- Test null date handling
- Test timezone conversion
- Test backward compatibility (tasks without start_date)

### Integration Tests

- Test task creation with date range
- Test task update with date range
- Test calendar query with mixed date scenarios
- Test migration rollback

---

## Next Steps

1. Create API contracts in contracts/ directory
2. Implement backend migration and validation
3. Update frontend Task interface
4. Create calendar components
5. Write comprehensive tests
