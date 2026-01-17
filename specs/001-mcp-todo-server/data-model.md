# Data Model: MCP Todo AI Chatbot Server

**Feature**: 001-mcp-todo-server
**Date**: 2026-01-17
**Status**: Completed

## Overview

This document defines the data entities used by the MCP Todo AI Chatbot Server. The MCP server reuses existing SQLModel entities from the FastAPI backend to ensure consistency and avoid duplication. All entities are defined in `backend/src/models/`.

## Entities

### Task

**Purpose**: Represents a todo item that belongs to a user. Tasks can be created, listed, updated, completed, and deleted through MCP tools.

**Source**: `backend/src/models/task.py` (existing model, reused)

**Fields**:

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary key, auto-generated | Unique identifier for the task |
| `user_id` | UUID | Foreign key to User, required, indexed | Owner of the task (enforces user isolation) |
| `title` | str | Required, min_length=1 | Task title/summary |
| `description` | str | Optional, nullable | Detailed task description |
| `completed` | bool | Default: False | Completion status (False=pending, True=completed) |
| `start_date` | datetime | Optional, nullable | When the task should start (ISO 8601 format) |
| `due_date` | datetime | Optional, nullable | When the task is due (ISO 8601 format) |
| `created_at` | datetime | Auto-generated, UTC | Timestamp when task was created |
| `updated_at` | datetime | Auto-updated, UTC | Timestamp when task was last modified |

**Relationships**:
- Belongs to one User (via `user_id` foreign key)
- User can have many Tasks (one-to-many)

**Indexes**:
- Primary key on `id`
- Index on `user_id` (for efficient user-scoped queries)

**Validation Rules**:
1. `title` must not be empty (min_length=1)
2. `due_date` must be >= `start_date` when both are provided
3. `user_id` must reference an existing User
4. All datetime fields stored in UTC timezone

**State Transitions**:
```
[Created] → completed=False (pending)
    ↓
[Completed] → completed=True
    ↓
[Deleted] → Removed from database
```

**SQLModel Definition** (reference):
```python
class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, nullable=False)
    title: str = Field(min_length=1)
    description: Optional[str] = Field(default=None)
    start_date: Optional[datetime] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    category_id: Optional[int] = Field(default=None, foreign_key="category.id", index=True)
    completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
```

### User

**Purpose**: Represents an authenticated user who owns tasks. Users are managed by the Better Auth system; the MCP server only reads user information for validation.

**Source**: `backend/src/models/user.py` (existing model, reused)

**Fields** (relevant to MCP server):

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | Primary key | Unique identifier for the user |
| `email` | str | Unique, required | User's email address |
| `username` | str | Unique, required | User's username |

**Note**: The MCP server does NOT create or modify users. User authentication is handled by Better Auth JWT tokens. The MCP server only extracts `user_id` from JWT payload and validates it exists in the database.

## Data Access Patterns

### User Isolation

**Critical Security Requirement**: All database queries MUST filter by `user_id` to enforce user isolation.

**Pattern**:
```python
# CORRECT: Filter by authenticated user_id
statement = select(Task).where(
    Task.user_id == authenticated_user_id,
    Task.id == task_id
)

# WRONG: No user_id filter (security vulnerability)
statement = select(Task).where(Task.id == task_id)
```

### Query Patterns by Tool

#### add_task
```python
# Create new task with user_id from JWT
new_task = Task(
    user_id=authenticated_user_id,
    title=arguments["title"],
    description=arguments.get("description"),
    start_date=parse_datetime(arguments.get("start_date")),
    due_date=parse_datetime(arguments.get("due_date")),
    completed=False
)
session.add(new_task)
await session.commit()
```

#### list_tasks
```python
# Query tasks filtered by user_id and status
statement = select(Task).where(Task.user_id == authenticated_user_id)

if status_filter == "pending":
    statement = statement.where(Task.completed == False)
elif status_filter == "completed":
    statement = statement.where(Task.completed == True)
# "all" filter: no additional where clause

result = await session.exec(statement)
tasks = result.all()
```

#### complete_task
```python
# Update task completion status (with user_id filter)
statement = select(Task).where(
    Task.user_id == authenticated_user_id,
    Task.id == task_id
)
result = await session.exec(statement)
task = result.first()

if not task:
    raise TaskNotFoundError()

task.completed = True
task.updated_at = datetime.now(timezone.utc)
await session.commit()
```

#### delete_task
```python
# Delete task (with user_id filter)
statement = select(Task).where(
    Task.user_id == authenticated_user_id,
    Task.id == task_id
)
result = await session.exec(statement)
task = result.first()

if not task:
    raise TaskNotFoundError()

await session.delete(task)
await session.commit()
```

#### update_task
```python
# Update task fields (with user_id filter)
statement = select(Task).where(
    Task.user_id == authenticated_user_id,
    Task.id == task_id
)
result = await session.exec(statement)
task = result.first()

if not task:
    raise TaskNotFoundError()

if "title" in arguments:
    task.title = arguments["title"]
if "description" in arguments:
    task.description = arguments["description"]

task.updated_at = datetime.now(timezone.utc)
await session.commit()
```

## Database Schema

**Table**: `tasks`

```sql
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES user(id),
    title VARCHAR NOT NULL CHECK (length(title) > 0),
    description TEXT,
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    start_date TIMESTAMP,
    due_date TIMESTAMP,
    category_id INTEGER REFERENCES category(id),
    created_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc'),
    updated_at TIMESTAMP NOT NULL DEFAULT (NOW() AT TIME ZONE 'utc')
);

CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_category_id ON tasks(category_id);
```

**Note**: Schema already exists in the database. No migrations required for MCP server implementation.

## Data Validation

### Input Validation

Performed by MCP SDK using JSON Schema (see contracts/ directory):
- `title`: Required, non-empty string
- `description`: Optional string
- `start_date`: Optional ISO 8601 datetime string
- `due_date`: Optional ISO 8601 datetime string
- `task_id`: Required UUID string
- `user_id`: Required UUID string (from JWT)
- `status_filter`: Required enum ("all", "pending", "completed")

### Business Logic Validation

Performed by tool handlers:
1. **Date Validation**: If both `start_date` and `due_date` provided, ensure `due_date >= start_date`
2. **User Validation**: Ensure `user_id` from JWT exists in database
3. **Task Ownership**: Ensure task belongs to authenticated user (via user_id filter)

### Error Cases

| Error | Condition | HTTP Equivalent | MCP Response |
|-------|-----------|-----------------|--------------|
| Authentication Required | No JWT or invalid JWT | 401 Unauthorized | `isError=True`, "Authentication required" |
| Task Not Found | Task doesn't exist or belongs to different user | 404 Not Found | `isError=True`, "Task not found" |
| Validation Error | Invalid input (e.g., empty title, invalid date) | 400 Bad Request | `isError=True`, "Validation error: ..." |
| Database Error | Database connection or query failure | 500 Internal Server Error | `isError=True`, "Database error" |

## Performance Considerations

### Indexing Strategy

- **user_id index**: Enables fast filtering of tasks by user (critical for all queries)
- **Primary key index**: Enables fast lookup by task_id

### Query Optimization

1. **Filter in SQL**: Apply user_id and status filters in WHERE clause, not in Python
2. **Limit Result Sets**: For large task lists, consider pagination (future enhancement)
3. **Connection Pooling**: Reuse database engine across tool calls
4. **Async Operations**: Use async/await for non-blocking database I/O

### Expected Query Performance

- **list_tasks**: O(n) where n = number of user's tasks, < 500ms for 1000 tasks
- **add_task**: O(1), single INSERT, < 200ms
- **complete_task**: O(1), single UPDATE, < 200ms
- **delete_task**: O(1), single DELETE, < 200ms
- **update_task**: O(1), single UPDATE, < 200ms

## Concurrency Considerations

### Read Operations (list_tasks)

- Naturally concurrent-safe
- Multiple clients can read simultaneously
- No locking required

### Write Operations (add, update, complete, delete)

- Protected by database transactions
- ACID guarantees prevent corruption
- Last-write-wins for concurrent updates to same task
- No application-level locking required

### Connection Pool Management

- SQLAlchemy connection pool handles concurrent requests
- Default pool size: 5 connections
- Max overflow: 10 connections
- Pool timeout: 30 seconds

## Testing Data

### Test Fixtures

```python
# Test user
test_user = User(
    id=uuid.UUID("12345678-1234-1234-1234-123456789012"),
    email="test@example.com",
    username="testuser"
)

# Test tasks
test_task_pending = Task(
    id=uuid.UUID("aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"),
    user_id=test_user.id,
    title="Test Task 1",
    description="This is a test task",
    completed=False,
    start_date=datetime(2026, 1, 18, 10, 0, 0, tzinfo=timezone.utc),
    due_date=datetime(2026, 1, 20, 17, 0, 0, tzinfo=timezone.utc)
)

test_task_completed = Task(
    id=uuid.UUID("bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"),
    user_id=test_user.id,
    title="Test Task 2",
    description="This task is completed",
    completed=True
)
```

## Migration Notes

**No migrations required**. The MCP server reuses the existing Task model and database schema. The `tasks` table already exists with all required fields and indexes.

## Future Enhancements (Out of Scope)

1. **Soft Deletes**: Add `deleted_at` field instead of hard deletes
2. **Task History**: Track changes to tasks over time
3. **Task Categories**: Already exists in schema, could be exposed via MCP tools
4. **Task Priority**: Add priority field for sorting
5. **Task Tags**: Many-to-many relationship for flexible organization
6. **Recurring Tasks**: Support for repeating tasks

## References

- Existing Task model: `backend/src/models/task.py`
- Existing User model: `backend/src/models/user.py`
- Database connection: `backend/src/db.py`
- SQLModel documentation: https://sqlmodel.tiangolo.com/
