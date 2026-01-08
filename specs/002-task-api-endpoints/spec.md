# Feature Specification: Task API Endpoints

**Feature Branch**: `002-task-api-endpoints`
**Created**: 2026-01-07
**Status**: Draft
**Input**: User description: "generate a detailed specification focused on RESTful API endpoints for Todo Full-Stack Web Application. Build on existing auth: Implement endpoints - GET /api/{user_id}/tasks (list all user tasks), POST /api/{user_id}/tasks (create new task), GET /api/{user_id}/tasks/{id} (get task details), PUT /api/{user_id}/tasks/{id} (update task), DELETE /api/{user_id}/tasks/{id} (delete task), PATCH /api/{user_id}/tasks/{id}/complete (toggle completion). Use SQLModel for Task model (id, user_id, content, completed, etc.) with Neon PostgreSQL persistence. Secure with existing JWT middleware: Verify token, extract user_id, enforce ownership (filter/modify only own tasks), return 401 for unauthorized/missing token. Ensure user isolation, stateless auth. Integrate with frontend: Next.js API calls with Bearer token headers. Technology stack subset: Backend - Python FastAPI; ORM - SQLModel; Database - Neon Serverless PostgreSQL; Authentication - Better Auth (JWT). Output the spec in a structured format with sections for overview, Task model, endpoint details, security enforcement, ownership checks, error handling, and frontend integration."

## User Scenarios & Testing

### User Story 1 - Manage Personal Tasks (Priority: P1)

As a logged-in user, I want to create, view, update, and delete my own tasks so that I can manage my workload effectively.

**Why this priority**: Core functionality of the application. Without this, the app serves no purpose.

**Independent Test**: verifiable via API client (like Postman / curl) or Frontend implementation.

**Acceptance Scenarios**:

1. **Given** an authenticated user, **When** they request to list all tasks, **Then** the system returns only tasks belonging to that user.
2. **Given** an authenticated user, **When** they create a new task with content, **Then** the task is persisted and returned with a unique ID and ownership assigned to the user.
3. **Given** an authenticated user, **When** they update their own task, **Then** the changes are saved.
4. **Given** an authenticated user, **When** they delete their own task, **Then** the task is removed from persistence.
5. **Given** an authenticated user, **When** they try to access/modify a task belonging to another user, **Then** they receive a 403 Forbidden or 404 Not Found error.
6. **Given** an unauthenticated request, **When** accessing any task endpoint, **Then** the system returns 401 Unauthorized.

### User Story 2 - Toggle Task Completion (Priority: P2)

As a user, I want to quickly mark tasks as complete or incomplete so I can track my progress.

**Why this priority**: Essential workflow for a Todo app, separate from full updates for efficiency.

**Independent Test**: Can be tested via the specific toggle endpoint.

**Acceptance Scenarios**:

1. **Given** an incomplete task owned by the user, **When** sending a completion request, **Then** the task status updates to completed.
2. **Given** a completed task owned by the user, **When** sending a completion request, **Then** the task status updates to incomplete.

## Requirements

### Functional Requirements

- **FR-001**: System MUST provide a RESTful API endpoint `GET /api/{user_id}/tasks` to list all tasks owned by the specified user.
- **FR-002**: System MUST provide a RESTful API endpoint `POST /api/{user_id}/tasks` to create a new task for the specified user.
- **FR-003**: System MUST provide a RESTful API endpoint `GET /api/{user_id}/tasks/{id}` to retrieve details of a specific task.
- **FR-004**: System MUST provide a RESTful API endpoint `PUT /api/{user_id}/tasks/{id}` to update task content.
- **FR-005**: System MUST provide a RESTful API endpoint `DELETE /api/{user_id}/tasks/{id}` to permanently delete a task.
- **FR-006**: System MUST provide a RESTful API endpoint `PATCH /api/{user_id}/tasks/{id}/complete` to toggle the completion status of a task.
- **FR-007**: System MUST validate that the `user_id` in the path matches the authenticated user's ID from the JWT token.
- **FR-008**: System MUST enforce authorization policies ensuring users can only access and modify their own tasks.
- **FR-009**: System MUST return 401 Unauthorized for requests without a valid JWT token.
- **FR-010**: System MUST return 403 Forbidden or 404 Not Found if an authenticated user attempts to access another user's resources.
- **FR-011**: Task creation input MUST be validated (e.g., content cannot be empty).
- **FR-012**: Tasks MUST be persisted using SQLModel to the Neon PostgreSQL database.
- **FR-013**: System MUST NOT allow cross-user data leakage (User A seeing User B's tasks).

### Key Entities

- **Task**:
  - `id`: Unique identifier (Integer or UUID, handled by DB).
  - `user_id`: Foreign key linking to the User.
  - `content`: Text description of the task (Required).
  - `completed`: Boolean status (Default: false).
  - `created_at`: Timestamp.
  - `updated_at`: Timestamp.

### Assumptions

- Authentication is handled via Bearer JWT tokens.
- The `user_id` is available in the decoded JWT payload.
- Database connection to Neon PostgreSQL is already configured.
- Existing User model and Auth middleware are available or compatible.

## Success Criteria

### Measurable Outcomes

- **SC-001**: API endpoints respond with correct HTTP status codes (200, 201, 204, 400, 401, 403, 404) for all defined scenarios.
- **SC-002**: Task operations (Create, Read, Update, Delete) are reflected in the database immediately.
- **SC-003**: 100% of requests attempting to access another user's tasks are blocked.
- **SC-004**: Frontend can successfully sync task state with backend without errors.
