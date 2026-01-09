# Data Model: Phase II Task Updates

## Entities

### Category
- **Table**: `category`
- **Description**: Groups tasks into projects or contexts.
- **Fields**:
  - `id`: Int, Primary Key, Auto-increment
  - `name`: String, Unique, Required
  - `user_id`: Int, Required Foreign Key to `user.id`

### Task (Updated)
- **Table**: `tasks`
- **Fields**:
  - `id`: UUID, Primary Key (Existing)
  - `user_id`: UUID, Foreign Key to `user.id` (Existing)
  - `title`: String, Required (New)
  - `description`: String, Optional (New)
  - `due_date`: Datetime, Optional (New)
  - `category_id`: Int, Foreign Key to `category.id` (New)
  - `content`: String (Existing - Keep as legacy or map to simple note)
  - `completed`: Boolean (Existing)
  - `created_at`: Datetime (Existing)
  - `updated_at`: Datetime (Existing)

## Relationships
- **Task** `Many-to-One` **Category**
- **User** `One-to-Many` **Task**

## Pydantic Models (Backend)

### TaskRead
- Extends `TaskBase`
- Adds: `category_name: Optional[str]`

### TaskCreate
- `title`: str
- `category_id`: int
- `description`: Optional[str]
- `due_date`: Optional[datetime]

### TaskUpdate
- `title`: Optional[str]
- `category_id`: Optional[int]
- `description`: Optional[str]
- `due_date`: Optional[datetime]
