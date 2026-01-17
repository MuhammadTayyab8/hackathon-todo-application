# Tasks: MCP Todo AI Chatbot Server

**Input**: Design documents from `/specs/001-mcp-todo-server/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Tests are NOT included as they were not explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `backend/tests/`
- MCP server module: `backend/src/mcp_server/`
- Entry point: `backend/mcp_server_main.py`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and MCP server structure

- [X] T001 Add MCP Python SDK dependency to backend/requirements.txt
- [X] T002 Create MCP server directory structure: backend/src/mcp_server/ with __init__.py
- [X] T003 [P] Create MCP server tools directory: backend/src/mcp_server/tools/ with __init__.py
- [X] T004 [P] Create MCP server entry point file: backend/mcp_server_main.py
- [X] T005 [P] Create MCP server schemas file: backend/src/mcp_server/schemas.py for tool input/output schemas
- [X] T006 [P] Create MCP server auth module: backend/src/mcp_server/auth.py for JWT authentication

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core MCP server infrastructure that MUST be complete before ANY user story tool can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T007 Implement MCP server initialization with lifespan context manager in backend/src/mcp_server/server.py
- [X] T008 Implement database engine initialization in server lifespan (reuse backend/src/db.py connection)
- [X] T009 Implement JWT authentication helper function in backend/src/mcp_server/auth.py (extract user_id from token)
- [X] T010 Implement JWT verification using existing auth_service.py in backend/src/mcp_server/auth.py
- [X] T011 Implement error handling utilities for MCP CallToolResult in backend/src/mcp_server/auth.py
- [X] T012 Register MCP server capabilities and notification options in backend/src/mcp_server/server.py
- [X] T013 Implement main() function with stdio transport in backend/mcp_server_main.py

**Checkpoint**: Foundation ready - user story tool implementation can now begin in parallel

---

## Phase 3: User Story 1 - AI Assistant Task Creation (Priority: P1) 🎯 MVP

**Goal**: Enable AI assistants to create tasks through natural language by implementing the add_task MCP tool with database persistence and JWT authentication

**Independent Test**: Connect MCP client to server, authenticate with valid JWT token, call add_task with title "Buy groceries", description "Milk, eggs, bread", and start_date, verify task is persisted in database with correct user_id and returns task_id, status "pending", and title

### Implementation for User Story 1

- [X] T014 [P] [US1] Define add_task tool JSON Schema in backend/src/mcp_server/schemas.py (inputSchema with user_id, title, description, start_date, end_date; outputSchema with task_id, status, title)
- [X] T015 [US1] Implement add_task tool handler in backend/src/mcp_server/tools/add_task.py (extract JWT, validate user_id, parse dates, create Task model instance)
- [X] T016 [US1] Implement database insert operation in add_task handler using SQLModel AsyncSession
- [X] T017 [US1] Implement date validation in add_task handler (ensure end_date >= start_date when both provided)
- [X] T018 [US1] Implement error handling in add_task handler (authentication_required, validation_error, database_error)
- [X] T019 [US1] Register add_task tool in MCP server list_tools() handler in backend/src/mcp_server/server.py
- [X] T020 [US1] Register add_task tool call handler in MCP server call_tool() in backend/src/mcp_server/server.py

**Checkpoint**: At this point, User Story 1 should be fully functional - AI assistants can create tasks through MCP

---

## Phase 4: User Story 2 - AI Assistant Task Retrieval (Priority: P1)

**Goal**: Enable AI assistants to retrieve and filter user tasks by implementing the list_tasks MCP tool with status filtering and user isolation

**Independent Test**: Create multiple tasks for different users with different statuses, call list_tasks with filter "pending", verify only authenticated user's pending tasks are returned in array format with all fields

### Implementation for User Story 2

- [X] T021 [P] [US2] Define list_tasks tool JSON Schema in backend/src/mcp_server/schemas.py (inputSchema with user_id, status_filter enum; outputSchema with tasks array and count)
- [X] T022 [US2] Implement list_tasks tool handler in backend/src/mcp_server/tools/list_tasks.py (extract JWT, validate user_id, parse status_filter)
- [X] T023 [US2] Implement database query with user_id filter in list_tasks handler using SQLModel select()
- [X] T024 [US2] Implement status filter logic in list_tasks handler (all/pending/completed)
- [X] T025 [US2] Implement task serialization to output format in list_tasks handler (convert Task models to dict with all fields)
- [X] T026 [US2] Implement error handling in list_tasks handler (authentication_required, invalid_filter, database_error)
- [X] T027 [US2] Register list_tasks tool in MCP server list_tools() handler in backend/src/mcp_server/server.py
- [X] T028 [US2] Register list_tasks tool call handler in MCP server call_tool() in backend/src/mcp_server/server.py

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently - AI assistants can create and retrieve tasks

---

## Phase 5: User Story 3 - AI Assistant Task Completion (Priority: P2)

**Goal**: Enable AI assistants to mark tasks as completed by implementing the complete_task MCP tool with user isolation enforcement

**Independent Test**: Create a pending task, call complete_task with task_id, verify task's completed field is set to True, updated_at is updated, and returns task_id, status "completed", and title

### Implementation for User Story 3

- [X] T029 [P] [US3] Define complete_task tool JSON Schema in backend/src/mcp_server/schemas.py (inputSchema with user_id, task_id; outputSchema with task_id, status, title)
- [X] T030 [US3] Implement complete_task tool handler in backend/src/mcp_server/tools/complete_task.py (extract JWT, validate user_id, validate task_id UUID)
- [X] T031 [US3] Implement database query with user_id and task_id filters in complete_task handler
- [X] T032 [US3] Implement task completion logic in complete_task handler (set completed=True, update updated_at timestamp)
- [X] T033 [US3] Implement database commit operation in complete_task handler
- [X] T034 [US3] Implement error handling in complete_task handler (authentication_required, task_not_found, unauthorized, database_error)
- [X] T035 [US3] Register complete_task tool in MCP server list_tools() handler in backend/src/mcp_server/server.py
- [X] T036 [US3] Register complete_task tool call handler in MCP server call_tool() in backend/src/mcp_server/server.py

**Checkpoint**: User Stories 1, 2, AND 3 are now functional - AI assistants can create, retrieve, and complete tasks

---

## Phase 6: User Story 5 - AI Assistant Task Modification (Priority: P2)

**Goal**: Enable AI assistants to update task details by implementing the update_task MCP tool with partial field updates

**Independent Test**: Create a task with title "Buy groceries", call update_task with new title "Buy groceries and apples", verify only title field is updated, other fields unchanged, updated_at is updated

### Implementation for User Story 5

- [X] T037 [P] [US5] Define update_task tool JSON Schema in backend/src/mcp_server/schemas.py (inputSchema with user_id, task_id, optional title, optional description; outputSchema with task_id, status, title)
- [X] T038 [US5] Implement update_task tool handler in backend/src/mcp_server/tools/update_task.py (extract JWT, validate user_id, validate task_id UUID)
- [X] T039 [US5] Implement database query with user_id and task_id filters in update_task handler
- [X] T040 [US5] Implement partial field update logic in update_task handler (update only provided fields: title and/or description)
- [X] T041 [US5] Implement updated_at timestamp update in update_task handler
- [X] T042 [US5] Implement database commit operation in update_task handler
- [X] T043 [US5] Implement error handling in update_task handler (authentication_required, task_not_found, unauthorized, validation_error, database_error)
- [X] T044 [US5] Register update_task tool in MCP server list_tools() handler in backend/src/mcp_server/server.py
- [X] T045 [US5] Register update_task tool call handler in MCP server call_tool() in backend/src/mcp_server/server.py

**Checkpoint**: User Stories 1, 2, 3, AND 5 are functional - AI assistants can create, retrieve, complete, and update tasks

---

## Phase 7: User Story 4 - AI Assistant Task Deletion (Priority: P3)

**Goal**: Enable AI assistants to permanently delete tasks by implementing the delete_task MCP tool with user isolation enforcement

**Independent Test**: Create a task, call delete_task with task_id, verify task is removed from database, subsequent queries return task_not_found error

### Implementation for User Story 4

- [X] T046 [P] [US4] Define delete_task tool JSON Schema in backend/src/mcp_server/schemas.py (inputSchema with user_id, task_id; outputSchema with task_id, status "deleted", title)
- [X] T047 [US4] Implement delete_task tool handler in backend/src/mcp_server/tools/delete_task.py (extract JWT, validate user_id, validate task_id UUID)
- [X] T048 [US4] Implement database query with user_id and task_id filters in delete_task handler
- [X] T049 [US4] Capture task title before deletion in delete_task handler (for return value)
- [X] T050 [US4] Implement database delete operation in delete_task handler using session.delete()
- [X] T051 [US4] Implement database commit operation in delete_task handler
- [X] T052 [US4] Implement error handling in delete_task handler (authentication_required, task_not_found, unauthorized, database_error)
- [X] T053 [US4] Register delete_task tool in MCP server list_tools() handler in backend/src/mcp_server/server.py
- [X] T054 [US4] Register delete_task tool call handler in MCP server call_tool() in backend/src/mcp_server/server.py

**Checkpoint**: All user stories (1-5) are now functional - AI assistants have complete task lifecycle management

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and production readiness

- [ ] T055 [P] Add comprehensive logging to all tool handlers in backend/src/mcp_server/tools/ (log tool calls, user_id, success/failure)
- [ ] T056 [P] Add performance monitoring for database queries in all tool handlers (track query execution time)
- [X] T057 [P] Implement connection pool configuration in backend/src/mcp_server/server.py lifespan (set pool size, timeout)
- [ ] T058 [P] Add input sanitization for all string fields in tool handlers (prevent injection attacks)
- [X] T059 [P] Update backend/requirements.txt with pinned MCP SDK version
- [X] T060 [P] Create Claude Desktop configuration example in specs/001-mcp-todo-server/quickstart.md
- [X] T061 Validate all tool schemas match contracts/ JSON files in backend/src/mcp_server/schemas.py
- [ ] T062 Add error message clarity improvements across all tool handlers (ensure AI assistants can parse and explain errors)
- [ ] T063 Run manual testing following quickstart.md validation scenarios
- [ ] T064 Verify user isolation enforcement across all tools (test with multiple user accounts)
- [ ] T065 Performance benchmark: Verify list_tasks returns in <500ms with 1000 tasks
- [ ] T066 Concurrency test: Verify 100 concurrent tool calls complete successfully

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)
- **User Story 5 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories (independent)

### Within Each User Story

- Schema definition before tool handler implementation
- Tool handler implementation before registration
- All tool logic before error handling
- Registration in list_tools() and call_tool() can be done in parallel

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002-T006)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Schema definitions for all tools marked [P] can run in parallel (T014, T021, T029, T037, T046)
- Tool handler implementations can proceed in parallel across different user stories
- Polish tasks marked [P] can run in parallel (T055-T060)

---

## Parallel Example: After Foundational Phase

```bash
# All user stories can start in parallel after Phase 2:

# Developer A: User Story 1 (add_task)
Task: "Define add_task tool JSON Schema in backend/src/mcp_server/schemas.py"
Task: "Implement add_task tool handler in backend/src/mcp_server/tools/add_task.py"

# Developer B: User Story 2 (list_tasks)
Task: "Define list_tasks tool JSON Schema in backend/src/mcp_server/schemas.py"
Task: "Implement list_tasks tool handler in backend/src/mcp_server/tools/list_tasks.py"

# Developer C: User Story 3 (complete_task)
Task: "Define complete_task tool JSON Schema in backend/src/mcp_server/schemas.py"
Task: "Implement complete_task tool handler in backend/src/mcp_server/tools/complete_task.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T013) - CRITICAL
3. Complete Phase 3: User Story 1 - add_task (T014-T020)
4. Complete Phase 4: User Story 2 - list_tasks (T021-T028)
5. **STOP and VALIDATE**: Test creating and retrieving tasks independently
6. Deploy/demo if ready - this is a functional MVP!

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 (add_task) → Test independently → Deploy/Demo
3. Add User Story 2 (list_tasks) → Test independently → Deploy/Demo (MVP!)
4. Add User Story 3 (complete_task) → Test independently → Deploy/Demo
5. Add User Story 5 (update_task) → Test independently → Deploy/Demo
6. Add User Story 4 (delete_task) → Test independently → Deploy/Demo
7. Add Polish tasks → Production ready
8. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T013)
2. Once Foundational is done:
   - Developer A: User Story 1 (add_task) - T014-T020
   - Developer B: User Story 2 (list_tasks) - T021-T028
   - Developer C: User Story 3 (complete_task) - T029-T036
3. Stories complete and integrate independently
4. Continue with remaining stories (US5, US4) and polish

---

## Task Summary

**Total Tasks**: 66 tasks
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 7 tasks (BLOCKING)
- Phase 3 (US1 - add_task): 7 tasks
- Phase 4 (US2 - list_tasks): 8 tasks
- Phase 5 (US3 - complete_task): 8 tasks
- Phase 6 (US5 - update_task): 9 tasks
- Phase 7 (US4 - delete_task): 9 tasks
- Phase 8 (Polish): 12 tasks

**Parallel Opportunities**: 15 tasks marked [P] can run in parallel within their phases

**Independent Test Criteria**:
- US1: Create task via MCP, verify database persistence and response format
- US2: Retrieve tasks via MCP, verify filtering and user isolation
- US3: Complete task via MCP, verify status update and timestamp
- US5: Update task via MCP, verify partial field updates
- US4: Delete task via MCP, verify removal from database

**Suggested MVP Scope**: Phase 1 + Phase 2 + Phase 3 + Phase 4 (User Stories 1 & 2)
- Enables AI assistants to create and retrieve tasks
- Demonstrates core MCP server functionality
- Validates authentication and user isolation
- 21 tasks total for MVP

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All tools enforce user isolation via JWT authentication
- All tools are stateless (no server-side session state)
- Database sessions created and disposed per tool call
- Error messages designed for AI assistant interpretation
