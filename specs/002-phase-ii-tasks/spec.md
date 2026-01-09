# Feature Specification: Phase II Task Updates & Category Integration

**Feature Branch**: `002-phase-ii-tasks`
**Created**: 2026-01-08
**Status**: Draft
**Input**: User description: "generate an updated specification for Phase II Todo Full-Stack Web Application, focusing on correcting the Task model and API endpoints. Update Task features to include: Title (string, required), Description (string, optional), Due Date (datetime), CategoryID (int, foreign key to Category table for project/category association). Add a new Category model/table (id, name) in SQLModel with Neon PostgreSQL. In API responses (e.g., GET tasks), join Category to fetch and include category name. Keep existing fields like id, user_id, content (if any), completed, created_at, updated_at. Adjust RESTful endpoints accordingly: POST /api/{user_id}/tasks to accept new fields, GET/GET/{id} to return joined category name, PUT to update new fields. Maintain security with JWT middleware, user isolation, ownership checks. Technology stack: Backend - Python FastAPI; ORM - SQLModel; Database - Neon Serverless PostgreSQL."

## User Scenarios & Testing

### User Story 1 - Create Rich Tasks (Priority: P1)

As a user, I want to create tasks with a title, description, due date, and category so that I can organize my work effectively.

**Why this priority**: Core functionality upgrade required for Phase II.

**Independent Test**: Can be tested by creating a task payload with all new fields and verifying they are persisted in the database.

**Acceptance Scenarios**:

1. **Given** an authenticated user and an existing category "Work", **When** the user sends a POST request with title "Finish Report", description "Q1 Report", due date "2023-12-31", and category_id for "Work", **Then** the task is created with all fields correctly stored.
2. **Given** a user, **When** they try to create a task without a Title or with an invalid CategoryID, **Then** the system returns a validation error (400/422).
3. **Given** a user, **When** they create a task without an optional Description, **Then** the task is created successfully with description as null/empty.

---

### User Story 2 - View Tasks with Category Context (Priority: P1)

As a user, I want to see the category name associated with each task when viewing my list, so I can quicky identify the context of each item.

**Why this priority**: Essential for the foreign key integration to be useful to the frontend/user.

**Independent Test**: Create tasks in different categories, then fetch the list and inspect the JSON response for "category_name".

**Acceptance Scenarios**:

1. **Given** tasks exist in "Work" and "Personal" categories, **When** the user requests GET /api/tasks, **Then** the response includes a list of tasks, each containing its "title", "due_date", and "category_name".
2. **Given** a task with ID 123 mapped to "Urgent", **When** the user requests GET /api/tasks/123, **Then** the response includes "category_name": "Urgent" alongside the task details.

---

### User Story 3 - Update Task Details (Priority: P2)

As a user, I want to update the title, due date, or category of a task so that I can keep my plan current.

**Why this priority**: Required for full CRUD capability on the new fields.

**Independent Test**: Update an existing task's category and check if the change is reflected in subsequent GET requests.

**Acceptance Scenarios**:

1. **Given** an existing task, **When** the user sends a PUT request changing the Title and CategoryID, **Then** the task is updated and the new category name is returned in future fetches.
2. **Given** a task, **When** the user attempts to update it to a non-existent CategoryID, **Then** the API returns an error.

---

### Edge Cases

- **Invalid Category**: Creating or updating a task with a `category_id` that does not exist in the Category table.
- **Timezones**: Handling `due_date` across different timezones (assume UTC storage).
- **Orphaned Categories**: What happens if a category is deleted? (Assumption: Tasks might need constraint management, but out of scope for *this* spec unless clarified. defaulting to standard FK behavior).
- **Missing Optional Fields**: Payload missing description or due_date should be handled gracefully (nullable).

## Requirements

### Functional Requirements

- **FR-001**: The System MUST persist a **Category** entity with `id` (int, PK), `name` (string) and `user_id`.
- **FR-002**: The **Task** entity MUST include `title` (string, required), `description` (string, optional), `due_date` (datetime, optional), and `category_id` (int, FK).
- **FR-003**: The **Task** entity MUST retain existing fields: `id`, `user_id`, `content`, `completed`, `created_at`, `updated_at`.
- **FR-004**: The `POST /api/{user_id}/tasks` endpoint MUST accept `title`, `description`, `due_date`, and `category_id` in the request body.
- **FR-005**: The `GET /api/tasks` and `GET /api/tasks/{id}` endpoints MUST perform a join with the Category table and include the `category_name` in the response.
- **FR-006**: The `PUT /api/tasks/{id}` endpoint MUST allow updating `title`, `description`, `due_date`, and `category_id`.
- **FR-007**: All endpoints MUST enforce authentication (JWT) and ensure users can only access/modify their own tasks.
- **FR-008**: The System MUST validate that `category_id` exists upon Task creation or update.

### Key Entities

- **Category**:
  - `id`: Integer, Primary Key
  - `name`: String, Unique (per project or global? Assumption: Global or seeded for now, as no "create category" requirement for users was explicitly detailed, but simple lookup table is implied).
  - `user_id`: Integer
- **Task**:
  - `id`, `user_id`, `created_at`, `updated_at`, `completed` (Existing)
  - `content` (Existing, kept as legacy or simple text)
  - `title`: String (New main display text)
  - `description`: String (New details)
  - `due_date`: Datetime
  - `category_id`: Foreign Key to Category

## Success Criteria

### Measurable Outcomes

- **SC-001**: API responses for Task retrieval (GET) contain the `category_name` field for 100% of tasks with a valid category.
- **SC-002**: Users can successfully create a task with all new fields (Title, Desc, DueDate, CategoryID) via the API.
- **SC-003**: Unauthorized users receive 401/403 errors when attempting to access tasks they do not own.
