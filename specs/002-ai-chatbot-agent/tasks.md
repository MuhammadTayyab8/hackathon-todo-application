# Tasks: AI Chatbot Agent for Task Management

**Input**: Design documents from `/specs/002-ai-chatbot-agent/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Assigned Agent**: backend-agent (all implementation tasks)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Web app structure: `backend/src/`, `backend/tests/`
- All tasks target backend implementation (FastAPI + SQLModel)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and dependency installation

- [X] T001 Install OpenAI Agents SDK in backend/requirements.txt (add openai-agents==1.0.0)
- [X] T002 [P] Install OpenAI client library in backend/requirements.txt (add openai>=1.0.0)
- [X] T003 [P] Install tiktoken for token counting in backend/requirements.txt (add tiktoken>=0.5.0)
- [X] T004 [P] Create agents module directory structure at backend/src/agents/__init__.py
- [X] T005 Verify MCP server from Sub-Phase 1 is operational (run backend/mcp_server_main.py and test tools)
- [X] T006 Configure OPENROUTER_API_KEY environment variable in backend/.env

**Expected Output**: All dependencies installed, agents module created, MCP server verified, environment configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Models

- [X] T007 [P] Create Conversation SQLModel in backend/src/models/conversation.py with fields (id, user_id, title, created_at, updated_at) and Message relationship
- [X] T008 [P] Create Message SQLModel in backend/src/models/message.py with fields (id, conversation_id, role, content, tool_calls, created_at) and Conversation relationship
- [X] T009 [P] Create MessageRole enum in backend/src/models/message.py (USER, ASSISTANT, SYSTEM)
- [X] T010 Generate Alembic migration for conversation and message tables in backend/alembic/versions/
- [X] T011 Apply database migration to create conversation and message tables (run alembic upgrade head)

### Agent Configuration

- [X] T012 Configure OpenRouter client with Gemini 2.5 Flash in backend/src/agents/task_agent.py (base_url="https://openrouter.ai/api/v1", model="google/gemini-2.0-flash-exp:free")
- [X] T013 Define agent system instructions in backend/src/agents/task_agent.py (task management assistant with tool guidelines, confirmation rules, NL parsing examples)

### MCP Tool Wrappers

- [X] T014 [P] Create add_task MCP tool wrapper in backend/src/agents/mcp_tools.py using @function_tool decorator with JWT token parameter
- [X] T015 [P] Create list_tasks MCP tool wrapper in backend/src/agents/mcp_tools.py using @function_tool decorator with status filter and JWT token
- [X] T016 [P] Create complete_task MCP tool wrapper in backend/src/agents/mcp_tools.py using @function_tool decorator with task_id and JWT token
- [X] T017 [P] Create update_task MCP tool wrapper in backend/src/agents/mcp_tools.py using @function_tool decorator with task_id, fields, and JWT token
- [X] T018 [P] Create delete_task MCP tool wrapper in backend/src/agents/mcp_tools.py using @function_tool decorator with task_id and JWT token
- [X] T019 Configure MCP client connection parameters in backend/src/agents/mcp_tools.py (StdioServerParameters with command="python", args=["backend/mcp_server_main.py"])

### Database Operations

- [X] T020 [P] Implement create_conversation function in backend/src/services/chat_service.py (async, returns Conversation with user_id)
- [X] T021 [P] Implement get_conversation function in backend/src/services/chat_service.py (async, with user isolation check)
- [X] T022 [P] Implement create_message function in backend/src/services/chat_service.py (async, stores Message with conversation_id, role, content, tool_calls)
- [X] T023 [P] Implement get_conversation_messages function in backend/src/services/chat_service.py (async, retrieves messages ordered by created_at)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

**Expected Output**: Database tables created, agent configured with OpenRouter, 5 MCP tool wrappers functional, database CRUD operations implemented

---

## Phase 3: User Story 1 - Basic Task Management via Chat (Priority: P1) 🎯 MVP

**Goal**: Users can create, view, update, complete, and delete tasks by chatting with the AI assistant in natural language

**Independent Test**: Send "Add a task to buy groceries" via POST /api/{user_id}/chat and verify task is created in database and response confirms creation

### Implementation for User Story 1

- [X] T024 [US1] Create agent initialization function in backend/src/agents/task_agent.py (create_task_agent with jwt_token parameter, returns Agent with 5 MCP tools)
- [X] T025 [US1] Implement basic agent runner in backend/src/agents/task_agent.py (run_agent function that takes message and returns response)
- [X] T026 [US1] Implement process_chat_message function in backend/src/services/chat_service.py (stateless flow: create/get conversation, store user message, run agent, store assistant response, return result)
- [X] T027 [US1] Create ChatRequest Pydantic model in backend/src/routes/chat.py (message: str, conversation_id: Optional[UUID])
- [X] T028 [US1] Create ChatResponse Pydantic model in backend/src/routes/chat.py (conversation_id: UUID, message: str, created_at: datetime)
- [X] T029 [US1] Implement POST /api/{user_id}/chat endpoint in backend/src/routes/chat.py (verify JWT, validate request, call chat service, return response)
- [X] T030 [US1] Add JWT verification dependency in backend/src/routes/chat.py (verify user_id matches JWT token)
- [X] T031 [US1] Implement error handling in backend/src/routes/chat.py (401 for invalid JWT, 400 for bad request, 500 for server errors)
- [X] T032 [US1] Register chat router in backend/main.py (app.include_router for /api/{user_id}/chat)

**Checkpoint**: At this point, User Story 1 should be fully functional - users can perform all basic task operations via chat

**Expected Output**: Chat endpoint operational, agent invokes MCP tools correctly, messages stored in database, natural language requests work (create, list, complete, update, delete tasks)

**Independent Test Scenarios**:
1. POST /api/{user_id}/chat with "Add a task to buy groceries tomorrow" → Task created with due date
2. POST /api/{user_id}/chat with "Show me my pending tasks" → Returns list of pending tasks
3. POST /api/{user_id}/chat with "Mark the grocery task as done" → Task marked complete
4. POST /api/{user_id}/chat with "Change the grocery task to 'Buy groceries and milk'" → Task title updated
5. POST /api/{user_id}/chat with "Delete the old meeting notes task" → Task deleted

---

## Phase 4: User Story 2 - Conversation Context and History (Priority: P2)

**Goal**: System maintains conversation history across multiple messages, allowing natural multi-turn conversations

**Independent Test**: Send "Show my tasks" then "Mark the first one as done" with same conversation_id - AI should remember which tasks were shown

### Implementation for User Story 2

- [X] T033 [US2] Implement token counting function in backend/src/agents/history_manager.py (count_tokens using tiktoken with gpt-4 encoding)
- [X] T034 [US2] Implement history summarization function in backend/src/agents/history_manager.py (summarize_history that keeps last 3 messages, summarizes older messages using Gemini, returns condensed history)
- [X] T035 [US2] Implement fetch_conversation_history function in backend/src/agents/history_manager.py (retrieves messages from DB, converts to message array format)
- [X] T036 [US2] Update process_chat_message in backend/src/services/chat_service.py to fetch history if conversation_id provided
- [X] T037 [US2] Update process_chat_message in backend/src/services/chat_service.py to count tokens and trigger summarization if >600 tokens
- [X] T038 [US2] Update agent runner in backend/src/agents/task_agent.py to accept history context and build message array with system instructions + history + new message
- [X] T039 [US2] Update Conversation model in backend/src/models/conversation.py to auto-generate title from first user message (add title generation logic)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work - basic operations plus conversation context

**Expected Output**: Conversation history retrieved from database, token counting functional, summarization triggers at 600 tokens, agent maintains context across messages

**Independent Test Scenarios**:
1. Send "Show my tasks" → Get list → Send "Mark the first one as done" with same conversation_id → Correct task marked complete
2. Send "Add a task to buy groceries" → Send "Actually, change it to include milk" → Task updated correctly
3. Send 15+ messages in same conversation → Verify summarization triggers and context preserved
4. Return after 1 hour with same conversation_id → History retrieved and context maintained

---

## Phase 5: User Story 3 - Action Confirmation for Destructive Operations (Priority: P2)

**Goal**: AI asks for user confirmation before executing destructive operations

**Independent Test**: Send "Delete all my tasks" → AI asks for confirmation → Send "Yes, delete them" → Tasks deleted

### Implementation for User Story 3

- [X] T040 [US3] Add confirmation guidelines to agent system instructions in backend/src/agents/task_agent.py (detect destructive operations, ask for confirmation, wait for response, execute or cancel)
- [X] T041 [US3] Update agent instructions in backend/src/agents/task_agent.py with confirmation examples (delete all tasks, bulk complete, etc.)
- [X] T042 [US3] Test confirmation workflow with destructive operations (verify agent asks before deleting, respects user response)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work - basic operations, context, and confirmations

**Expected Output**: Agent detects destructive operations, asks for confirmation, waits for user response, executes or cancels based on response

**Independent Test Scenarios**:
1. Send "Delete all my tasks" → AI asks "Are you sure?" → Send "Yes" → Tasks deleted
2. Send "Delete all my tasks" → AI asks "Are you sure?" → Send "No" → No tasks deleted
3. Send "Mark all pending tasks as done" with 10+ tasks → AI asks for confirmation → Confirm → All marked complete

---

## Phase 6: User Story 4 - Tool Chaining for Complex Requests (Priority: P3)

**Goal**: AI can chain multiple tool calls to fulfill complex requests in single interaction

**Independent Test**: Send "List my tasks and delete the completed ones" → AI lists tasks, then deletes completed ones, shows both results

### Implementation for User Story 4

- [X] T043 [US4] Add tool chaining guidelines to agent system instructions in backend/src/agents/task_agent.py (chain tools in logical order, handle partial failures, show all results)
- [X] T044 [US4] Update agent runner in backend/src/agents/task_agent.py to support multiple tool calls per message (enforce 10 tool call limit)
- [X] T045 [US4] Implement partial failure handling in backend/src/agents/task_agent.py (if tool chain fails midway, communicate what succeeded and what failed)
- [X] T046 [US4] Test tool chaining scenarios (list then delete, create then list, find then update, etc.)

**Checkpoint**: All user stories should now be independently functional - full feature complete

**Expected Output**: Agent chains multiple tool calls correctly, handles partial failures gracefully, provides comprehensive results for complex requests

**Independent Test Scenarios**:
1. Send "Show my tasks and delete the completed ones" → Lists all tasks, deletes completed ones, shows both results
2. Send "Create a task to buy milk and show me all my tasks" → Creates task, lists all tasks including new one
3. Send "Find the grocery task and mark it done" → Searches for task, marks it complete, confirms both steps
4. Send "Update my meeting task to tomorrow and show me my schedule" → Updates task, lists all tasks with dates

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [X] T047 [P] Add comprehensive error logging in backend/src/services/chat_service.py (log all errors with context)
- [X] T048 [P] Add request/response logging in backend/src/routes/chat.py (log user_id, message length, response time)
- [X] T049 [P] Implement rate limiting for chat endpoint in backend/src/routes/chat.py (60 requests per minute per user)
- [X] T050 [P] Add input validation in backend/src/routes/chat.py (message max length 2000 chars, conversation_id format validation)
- [X] T051 [P] Sanitize error messages in backend/src/routes/chat.py (never expose stack traces or internal details to users)
- [X] T052 [P] Add performance monitoring in backend/src/services/chat_service.py (track agent response time, token count, tool call count)
- [X] T053 Update API documentation in backend/src/routes/chat.py (add OpenAPI docstrings for chat endpoint)
- [X] T054 Run quickstart.md validation (follow all test scenarios in specs/002-ai-chatbot-agent/quickstart.md)
- [X] T055 Verify all constitution checks pass (JWT verification, user scoping, no secrets on frontend)

**Expected Output**: Production-ready chat endpoint with logging, rate limiting, validation, error handling, and monitoring

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Builds on US1 but independently testable
  - User Story 3 (P2): Can start after Foundational - Enhances US1 but independently testable
  - User Story 4 (P3): Can start after Foundational - Enhances US1 but independently testable
- **Polish (Phase 7)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Independent - Core functionality
- **User Story 2 (P2)**: Independent - Adds history management
- **User Story 3 (P2)**: Independent - Adds confirmation workflow
- **User Story 4 (P3)**: Independent - Adds tool chaining

**Note**: All user stories are independently testable. US2, US3, US4 enhance US1 but don't break it.

### Within Each User Story

- Models before services (T007-T009 before T020-T023)
- Services before endpoints (T020-T023 before T029)
- Core implementation before enhancements (US1 before US2-US4)

### Parallel Opportunities

**Phase 1 (Setup)**: All tasks can run in parallel
- T001-T003: Dependency installation (parallel)
- T004-T006: Configuration (parallel)

**Phase 2 (Foundational)**: Many tasks can run in parallel
- T007-T009: Database models (parallel)
- T014-T018: MCP tool wrappers (parallel)
- T020-T023: Database operations (parallel)

**Phase 3-6 (User Stories)**: Once Foundational completes, all user stories can start in parallel if team capacity allows

**Phase 7 (Polish)**: All tasks marked [P] can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch all database models together:
Task T007: "Create Conversation SQLModel in backend/src/models/conversation.py"
Task T008: "Create Message SQLModel in backend/src/models/message.py"
Task T009: "Create MessageRole enum in backend/src/models/message.py"

# Launch all MCP tool wrappers together:
Task T014: "Create add_task MCP tool wrapper in backend/src/agents/mcp_tools.py"
Task T015: "Create list_tasks MCP tool wrapper in backend/src/agents/mcp_tools.py"
Task T016: "Create complete_task MCP tool wrapper in backend/src/agents/mcp_tools.py"
Task T017: "Create update_task MCP tool wrapper in backend/src/agents/mcp_tools.py"
Task T018: "Create delete_task MCP tool wrapper in backend/src/agents/mcp_tools.py"

# Launch all database operations together:
Task T020: "Implement create_conversation function in backend/src/services/chat_service.py"
Task T021: "Implement get_conversation function in backend/src/services/chat_service.py"
Task T022: "Implement create_message function in backend/src/services/chat_service.py"
Task T023: "Implement get_conversation_messages function in backend/src/services/chat_service.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T023) - CRITICAL
3. Complete Phase 3: User Story 1 (T024-T032)
4. **STOP and VALIDATE**: Test User Story 1 independently using quickstart.md scenarios
5. Deploy/demo if ready

**MVP Deliverable**: Users can manage tasks via natural language chat (create, list, complete, update, delete)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo (adds conversation history)
4. Add User Story 3 → Test independently → Deploy/Demo (adds confirmations)
5. Add User Story 4 → Test independently → Deploy/Demo (adds tool chaining)
6. Add Polish → Production-ready

Each story adds value without breaking previous stories.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T023)
2. Once Foundational is done:
   - Developer A: User Story 1 (T024-T032)
   - Developer B: User Story 2 (T033-T039) - can start in parallel
   - Developer C: User Story 3 (T040-T042) - can start in parallel
   - Developer D: User Story 4 (T043-T046) - can start in parallel
3. Stories complete and integrate independently

---

## Skills and Context7 Usage

**MUST Use Relevant Skills**:
- **openai-agents skill**: For agent setup, tool wrappers, agent runner implementation (T012-T019, T024-T025)
- **sqlmodel skill**: For database models and CRUD operations (T007-T009, T020-T023)
- **mcp-sdk skill**: For MCP tool wrapper implementation (T014-T019)

**MUST Use Context7**:
- Library: `/openai/openai-agents-python` for agent architecture patterns, tool decorators, agent.run() usage
- Library: `/modelcontextprotocol/python-sdk` for MCP client setup, tool invocation patterns

**When to Use**:
- If agent setup is unclear → Use openai-agents skill + Context7 /openai/openai-agents-python
- If MCP tool wrapper pattern is unclear → Use mcp-sdk skill + Context7 /modelcontextprotocol/python-sdk
- If SQLModel relationships are unclear → Use sqlmodel skill

---

## Task Summary

**Total Tasks**: 55 tasks
- Phase 1 (Setup): 6 tasks
- Phase 2 (Foundational): 17 tasks (BLOCKING)
- Phase 3 (User Story 1 - P1): 9 tasks (MVP)
- Phase 4 (User Story 2 - P2): 7 tasks
- Phase 5 (User Story 3 - P2): 3 tasks
- Phase 6 (User Story 4 - P3): 4 tasks
- Phase 7 (Polish): 9 tasks

**Parallel Opportunities**: 28 tasks marked [P] can run in parallel within their phases

**MVP Scope**: Phases 1-3 (32 tasks) deliver fully functional basic chat for task management

**Independent Test Criteria**:
- US1: Send chat messages, verify task operations work
- US2: Multi-turn conversation, verify context maintained
- US3: Request destructive operation, verify confirmation asked
- US4: Complex request, verify multiple tools chained

**Assigned Agent**: backend-agent (all implementation tasks)

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Use Context7 and skills when implementation patterns are unclear
- All tasks target backend implementation (no frontend tasks in this phase)
