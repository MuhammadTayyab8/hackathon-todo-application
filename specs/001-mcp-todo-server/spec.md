# Feature Specification: MCP Todo AI Chatbot Server

**Feature Branch**: `001-mcp-todo-server`
**Created**: 2026-01-17
**Status**: Draft
**Input**: User description: "Build MCP server with Official MCP SDK to expose 5 stateless tools for task management with DB persistence via SQLModel/Neon and Better Auth JWT user isolation"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - AI Assistant Task Creation (Priority: P1)

A user interacts with an AI assistant (like Claude) that has access to the MCP server. The user asks "Add a task to buy groceries tomorrow at 3pm" and the AI assistant uses the MCP tool to create the task in the user's todo list, returning confirmation with the task details.

**Why this priority**: This is the core value proposition - enabling AI assistants to create tasks on behalf of users through natural language interaction. Without this, the MCP server has no purpose.

**Independent Test**: Can be fully tested by connecting an MCP client to the server, authenticating with a valid JWT token, calling the add_task tool with task parameters, and verifying the task is persisted in the database with correct user isolation.

**Acceptance Scenarios**:

1. **Given** a user is authenticated with a valid JWT token, **When** the AI assistant calls add_task with title "Buy groceries", description "Milk, eggs, bread", and start_date "2026-01-18T15:00:00", **Then** the system creates a new task, persists it to the database with the authenticated user's ID, and returns task_id, status "pending", and title "Buy groceries"

2. **Given** a user is authenticated, **When** the AI assistant calls add_task with only a title "Quick task" (minimal required fields), **Then** the system creates the task with default values for optional fields and returns the task details

3. **Given** an unauthenticated request, **When** add_task is called, **Then** the system returns an authentication error and does not create any task

---

### User Story 2 - AI Assistant Task Retrieval (Priority: P1)

A user asks their AI assistant "What tasks do I have pending?" and the assistant uses the MCP tool to retrieve and display the user's incomplete tasks, showing only tasks that belong to that specific user.

**Why this priority**: Task retrieval is equally critical as creation - users need to see their tasks through the AI interface. This enables the AI to provide context-aware assistance based on the user's actual task list.

**Independent Test**: Can be fully tested by creating multiple tasks for different users, then calling list_tasks with various status filters and verifying that only the authenticated user's tasks are returned with proper filtering.

**Acceptance Scenarios**:

1. **Given** a user has 3 pending tasks and 2 completed tasks, **When** the AI assistant calls list_tasks with filter "pending", **Then** the system returns an array of 3 tasks with status "pending" belonging only to that user

2. **Given** a user has multiple tasks, **When** list_tasks is called with filter "all", **Then** the system returns all tasks (both pending and completed) for that user only

3. **Given** a user has no tasks, **When** list_tasks is called, **Then** the system returns an empty array without errors

4. **Given** user A has 5 tasks and user B has 3 tasks, **When** user A calls list_tasks, **Then** the system returns only user A's 5 tasks, never exposing user B's tasks

---

### User Story 3 - AI Assistant Task Completion (Priority: P2)

A user tells their AI assistant "Mark the grocery shopping task as done" and the assistant identifies the task and uses the MCP tool to mark it complete, providing confirmation to the user.

**Why this priority**: Completing tasks is a frequent user action but slightly less critical than creating and viewing tasks. Users can still get value from the system even if completion requires manual action initially.

**Independent Test**: Can be fully tested by creating a pending task, calling complete_task with the task_id and user_id, and verifying the task's completed status is updated in the database and the correct response is returned.

**Acceptance Scenarios**:

1. **Given** a user has a pending task with id "abc-123", **When** the AI assistant calls complete_task with user_id and task_id "abc-123", **Then** the system marks the task as completed, updates the updated_at timestamp, and returns task_id, status "completed", and title

2. **Given** a user tries to complete a task that doesn't exist, **When** complete_task is called with an invalid task_id, **Then** the system returns a "task not found" error without modifying any data

3. **Given** user A tries to complete a task belonging to user B, **When** complete_task is called with user B's task_id, **Then** the system returns an authorization error and does not modify the task

---

### User Story 4 - AI Assistant Task Deletion (Priority: P3)

A user asks their AI assistant "Delete the old meeting notes task" and the assistant uses the MCP tool to permanently remove the task from the user's list.

**Why this priority**: Task deletion is useful for cleanup but less frequently needed than other operations. Users can work effectively even if deletion requires manual action through the web interface.

**Independent Test**: Can be fully tested by creating a task, calling delete_task with the task_id and user_id, and verifying the task is removed from the database and cannot be retrieved afterward.

**Acceptance Scenarios**:

1. **Given** a user has a task with id "xyz-789", **When** the AI assistant calls delete_task with user_id and task_id "xyz-789", **Then** the system permanently removes the task from the database and returns task_id, status "deleted", and title

2. **Given** a user tries to delete a non-existent task, **When** delete_task is called with an invalid task_id, **Then** the system returns a "task not found" error

3. **Given** user A tries to delete a task belonging to user B, **When** delete_task is called with user B's task_id, **Then** the system returns an authorization error and does not delete the task

---

### User Story 5 - AI Assistant Task Modification (Priority: P2)

A user tells their AI assistant "Change the grocery task description to include apples and move it to tomorrow" and the assistant uses the MCP tool to update the task's details.

**Why this priority**: Task updates are common but users can work around missing update functionality by deleting and recreating tasks. It's important for user experience but not blocking for MVP.

**Independent Test**: Can be fully tested by creating a task, calling update_task with modified title and/or description, and verifying the changes are persisted while other fields remain unchanged.

**Acceptance Scenarios**:

1. **Given** a user has a task with title "Buy groceries", **When** the AI assistant calls update_task with task_id and new title "Buy groceries and apples", **Then** the system updates only the title field, updates the updated_at timestamp, and returns task_id, status, and new title

2. **Given** a user has a task, **When** update_task is called with only a description change, **Then** the system updates only the description field while preserving all other fields

3. **Given** a user tries to update a task that doesn't exist, **When** update_task is called with an invalid task_id, **Then** the system returns a "task not found" error

4. **Given** user A tries to update a task belonging to user B, **When** update_task is called with user B's task_id, **Then** the system returns an authorization error and does not modify the task

---

### Edge Cases

- What happens when a user provides an invalid date format for start_date or end_date in add_task or update_task?
- How does the system handle concurrent updates to the same task from multiple AI assistant sessions?
- What happens when the JWT token expires during a tool call?
- How does the system handle extremely long titles or descriptions (e.g., 10,000 characters)?
- What happens when list_tasks is called with an invalid status filter value (not "all", "pending", or "completed")?
- How does the system handle database connection failures during tool execution?
- What happens when a user tries to complete an already completed task?
- How does the system handle special characters or emojis in task titles and descriptions?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST expose an MCP server that implements the Model Context Protocol specification for AI assistant integration
- **FR-002**: System MUST provide an add_task tool that accepts user_id, title (required), description (optional), start_date (optional), and end_date (optional) parameters
- **FR-003**: System MUST return task_id, status, and title from the add_task tool upon successful task creation
- **FR-004**: System MUST provide a list_tasks tool that accepts user_id and status filter parameters ("all", "pending", or "completed")
- **FR-005**: System MUST return an array of task objects from list_tasks, where each object contains task_id, title, description, status, start_date, end_date, created_at, and updated_at
- **FR-006**: System MUST provide a complete_task tool that accepts user_id and task_id parameters
- **FR-007**: System MUST mark the specified task as completed and return task_id, status "completed", and title from complete_task
- **FR-008**: System MUST provide a delete_task tool that accepts user_id and task_id parameters
- **FR-009**: System MUST permanently remove the specified task and return task_id, status "deleted", and title from delete_task
- **FR-010**: System MUST provide an update_task tool that accepts user_id, task_id, and optional title and description parameters
- **FR-011**: System MUST update only the provided fields and return task_id, status, and updated title from update_task
- **FR-012**: All tools MUST be stateless, meaning each tool call is independent and does not rely on server-side session state
- **FR-013**: System MUST persist all task data to a database with fields: user_id, id, title, description, completed, start_date, end_date, created_at, updated_at
- **FR-014**: System MUST enforce user isolation by validating that the authenticated user can only access, modify, or delete their own tasks
- **FR-015**: System MUST authenticate requests using JWT tokens and extract user_id from the token payload
- **FR-016**: System MUST return a "task not found" error when a tool is called with a non-existent task_id
- **FR-017**: System MUST return an "unauthorized" error when a user attempts to access another user's task
- **FR-018**: System MUST return an "authentication required" error when a tool is called without a valid JWT token
- **FR-019**: System MUST validate that required parameters are provided for each tool call
- **FR-020**: System MUST return descriptive error messages that help AI assistants understand what went wrong
- **FR-021**: System MUST automatically set created_at timestamp when a task is created
- **FR-022**: System MUST automatically update updated_at timestamp when a task is modified or completed
- **FR-023**: System MUST handle date/time values in ISO 8601 format for start_date and end_date
- **FR-024**: System MUST validate that end_date is not before start_date when both are provided
- **FR-025**: System MUST support concurrent tool calls from multiple AI assistant sessions without data corruption

### Key Entities

- **Task**: Represents a todo item with attributes including unique identifier, owning user identifier, title (required text), description (optional text), completion status (boolean), start date (optional timestamp), end date (optional timestamp), creation timestamp, and last update timestamp. Tasks are owned by exactly one user and can only be accessed by that user.

- **User**: Represents an authenticated user who owns tasks. Users are identified by a unique user_id extracted from JWT authentication tokens. The MCP server does not manage user accounts directly but relies on existing authentication infrastructure.

- **MCP Tool**: Represents a callable function exposed by the MCP server that AI assistants can invoke. Each tool has a defined input schema (parameters), output schema (return values), and error handling behavior. Tools are stateless and operate independently.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: AI assistants can successfully create tasks through the MCP server with 100% of required fields persisted correctly
- **SC-002**: Task retrieval returns results in under 500 milliseconds for users with up to 1000 tasks
- **SC-003**: User isolation is enforced with 100% accuracy - zero instances of users accessing other users' tasks
- **SC-004**: All tool calls return appropriate error messages within 2 seconds when errors occur
- **SC-005**: The MCP server handles at least 100 concurrent tool calls without data corruption or race conditions
- **SC-006**: 95% of tool calls complete successfully when provided with valid parameters and authentication
- **SC-007**: AI assistants can complete the full task lifecycle (create, list, update, complete, delete) through natural language interaction without requiring users to access the web interface
- **SC-008**: Error messages are clear enough that AI assistants can explain the issue to users in natural language 90% of the time without additional clarification

## Assumptions

- The existing Better Auth JWT authentication system is already implemented and provides valid JWT tokens with user_id in the payload
- The database schema for tasks already exists or can be created/migrated to match the required fields
- The MCP server will run as a separate process or service that can access the same database as the main FastAPI application
- AI assistant clients (like Claude Desktop) are already configured to connect to MCP servers and can provide JWT tokens in requests
- The Python MCP SDK (/modelcontextprotocol/python-sdk) is the official and recommended implementation for building MCP servers
- Network latency between the AI assistant client and MCP server is reasonable (under 100ms)
- The database supports concurrent transactions and provides ACID guarantees
- Date/time values will be stored and transmitted in UTC timezone
- Task titles have a reasonable maximum length (e.g., 500 characters) enforced at the database level
- Task descriptions have a reasonable maximum length (e.g., 5000 characters) enforced at the database level

## Dependencies

- Existing Better Auth JWT authentication system must be operational
- Database (Neon PostgreSQL) must be accessible from the MCP server
- SQLModel ORM must be available for database operations
- Python MCP SDK must be installed and compatible with the Python version used
- JWT secret key must be shared between the main application and MCP server for token validation

## Out of Scope

- User account creation, management, or authentication (handled by existing Better Auth system)
- Web interface or REST API endpoints for task management (already exists in main application)
- Task sharing or collaboration features between multiple users
- Task categories, tags, or advanced organization features beyond the basic fields specified
- Task reminders, notifications, or scheduling features
- Bulk operations (e.g., delete all completed tasks, mark multiple tasks complete)
- Task search or filtering beyond the basic status filter
- Task sorting or pagination in list_tasks results
- Task history or audit logging of changes
- Integration with external calendar systems or task management platforms
- Real-time synchronization or websocket connections
- Rate limiting or quota management for tool calls
- Analytics or usage tracking of MCP tool calls
