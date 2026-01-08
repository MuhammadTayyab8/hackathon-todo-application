# Data Model: Task API Endpoints

## Entities

### User (Existing)
- **Source**: `backend/src/models/user.py`
- **Fields**:
  - `id`: UUID (PK)
  - `email`: String (Unique)
  - `username`: String (Unique)
  - ...

### Task (New)
- **Source**: `backend/src/models/task.py` (To be created)
- **Table Name**: `tasks`
- **Fields**:
  - `id`: UUID (PK, default=uuid4)
  - `user_id`: UUID (Foreign Key -> users.id, Required, Index=True)
  - `content`: String (Required, Min Length=1)
  - `completed`: Boolean (Default=False)
  - `created_at`: Datetime (Default=UTC Now)
  - `updated_at`: Datetime (Default=UTC Now, Auto-update)

## Validation Rules (Pydantic Models)

### TaskCreate
- `content`: Non-empty string.

### TaskUpdate
- `content`: Optional[str]
- `completed`: Optional[bool]

### TaskRead (Response)
- `id`: UUID
- `user_id`: UUID
- `content`: str
- `completed`: bool
- `created_at`: datetime
- `updated_at`: datetime

## Relationships
- **User** 1:N **Task**
- Cascade delete: If User is deleted, Tasks should be deleted (handled by DB `ON DELETE CASCADE` if configured, or application logic). For now, we rely on SQLModel defaults or manual cleanup implementation if User deletion is implemented later.
