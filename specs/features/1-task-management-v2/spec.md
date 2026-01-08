# Feature Specification: Task Management System v2

**Feature Branch**: `1-task-management-v2`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description provided in prompt.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and Organize Tasks (Priority: P1)

As a user, I want to create tasks with titles, descriptions, due dates, and categories so that I can better organize my work.

**Why this priority**: Core functionality for the Todo app. Without this, the app doesn't serve its primary purpose.

**Independent Test**: Can be tested by creating a task with all new fields via API and verifying it is persisted with correct values.

**Acceptance Scenarios**:

1. **Given** an authenticated user and a valid category ID, **When** they send a POST request to create a task with title, description, and due date, **Then** the task is created, linked to the user and category, and returned with status 201.
2. **Given** an authenticated user, **When** they try to create a task without a title, **Then** the system returns a 422 Validation Error.
3. **Given** an authenticated user, **When** they try to create a task with a non-existent category ID, **Then** the system returns a 400 Bad Request or 404 Not Found (depending on FK constraints handling).

---

### User Story 2 - View Tasks with Context (Priority: P1)

As a user, I want to see my tasks along with their category names so that I understand the context of each task at a glance.

**Why this priority**: Essential for usability; tasks without category context are harder to manage.

**Independent Test**: Can be tested by creating tasks with categories, then fetching the list and verifying the category name is included in the response.

**Acceptance Scenarios**:

1. **Given** a user has tasks in different categories, **When** they fetch their task list, **Then** each task object includes the associated category name.
2. **Given** a user fetches a specific task by ID, **When** the task exists and belongs to them, **Then** the response includes the full task details plus the category name.

---

### User Story 3 - Update Task Details (Priority: P2)

As a user, I want to modify task details like title, due date, or category so that I can keep my list up to date.

**Why this priority**: Tasks change over time; users need to edit them.

**Independent Test**: Can be tested by updating fields of an existing task and verifying the changes are persisted.

**Acceptance Scenarios**:

1. **Given** an existing task, **When** the user sends a PUT request with a new title or category, **Then** the task is updated and the response reflects the changes.
2. **Given** a task belonging to another user, **When** a user tries to update it, **Then** the system returns 403 Forbidden.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow creating a Project Category with just a name (seed data or user-created? Assuming system-wide or user-specific. *Assumption: User-specific or shared simple lookup table. Specifying as simple lookup for now as per prompt "Add a new Category model/table (id, name)"*).
- **FR-002**: System MUST support creating tasks with `title` (required), `description`, `due_date`, and `category_id`.
- **FR-003**: System MUST enforce that `title` is not empty.
- **FR-004**: System MUST validate that `category_id` exists when creating/updating a task.
- **FR-005**: API responses for Task retrieval (GET list, GET single) MUST include the joined `category_name`.
- **FR-006**: System MUST maintain existing fields: `id`, `user_id`, `completed`, `created_at`, `updated_at`.
- **FR-007**: System MUST securely isolate data so users can only access their own tasks.
- **FR-008**: System MUST support updating all mutable task fields (title, description, due_date, status, priority, category_id).
- **FR-009**: System MUST use JWT authentication for all task endpoints.

### Key Entities

- **Task**: Represents a todo item. Fields: id, user_id, title, description, status, priority, due_date, category_id, created_at, updated_at.
- **Category**: Represents a classification for tasks. Fields: id, name.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can successfully create a task with all new fields (title, desc, due date, category) in under 1 second (API response time).
- **SC-002**: 100% of Task API GET responses include the valid Category Name if a category is assigned.
- **SC-003**: System prevents creation of tasks with invalid Category IDs 100% of the time.
- **SC-004**: Users are strictly prevented (100% success rate) from accessing tasks belonging to other users.

## Assumptions

- Categories are pre-populated or managed via a separate simple API (spec focuses on Task integration). For this iteration, we assume Categories exist or can be seeded.
- `priority` field mentioned in prompting previous context but not explicitly in the "Update Task features" list of *new* fields, but "Update Task" endpoint description in prompt says "status, priority". I will include `priority` as a field (likely string/enum).
- The `content` field mentioned in "Keep existing fields like... content (if any)" is likely being replaced or aliased by `title`/`description`. `Task` usually has a description. The prompt says "Update Task features to include: Title, Description... Keep existing fields like... content (if any)". I will assume `content` might be deprecated or mapped to `description`, but strictly following "Keep existing fields" I will keep `content` but make `title` the primary display field, or `content` IS the title. I’ll treat `title` as the new short summary and `description` as details. I'll keep `content` for backward compatibility if needed, or assume the prompt meant "Keep the concept of content". I will add `title` and `description` as new columns and perhaps deprecate `content` or migrate `content` -> `description`. For this spec, I will declare `title` and `description` as explicit fields.

## Integration Impacts

- **Database**:
  - New table `categories`.
  - Modification of `tasks` table to add `title`, `description`, `due_date`, `category_id`.
  - Foreign key constraint on `tasks.category_id` -> `categories.id`.
- **API**:
  - `POST /api/{user_id}/tasks`: Request body schema changes.
  - `GET /api/{user_id}/tasks`: Response schema changes (include category name).
  - `PUT /api/{user_id}/tasks/{task_id}`: Schema changes.
- **Frontend**:
  - Task creation form needs dropdown for Category and inputs for Title/Desc/Date.
  - Task list view needs to display Category name.
