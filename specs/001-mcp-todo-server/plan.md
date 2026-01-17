# Implementation Plan: MCP Todo AI Chatbot Server

**Branch**: `001-mcp-todo-server` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-mcp-todo-server/spec.md`

## Summary

Build an MCP (Model Context Protocol) server that exposes 5 stateless tools for AI assistants to manage user tasks through natural language interaction. The server will integrate with the existing Todo application's database (Neon PostgreSQL) and authentication system (Better Auth JWT) to provide secure, user-isolated task management capabilities. Tools include add_task, list_tasks, complete_task, delete_task, and update_task - all implemented as stateless operations with database persistence via SQLModel ORM.

## Technical Context

**Language/Version**: Python 3.11+
**Primary Dependencies**: MCP Python SDK (`mcp`), SQLModel 0.0.14+, SQLAlchemy 2.0+ with asyncpg, python-jose (JWT), bcrypt
**Storage**: Neon Serverless PostgreSQL (shared with existing FastAPI backend)
**Testing**: pytest 7.4+, pytest-asyncio 0.21+
**Target Platform**: Server-side MCP server with stdio transport (for Claude Desktop and other MCP clients)
**Project Type**: Backend service (MCP server as separate process from FastAPI app)
**Performance Goals**: Sub-500ms response for list_tasks with up to 1000 tasks, support 100 concurrent tool calls
**Constraints**: All tools must be stateless, JWT authentication required for all operations, user isolation enforced
**Scale/Scope**: 5 MCP tools, single database connection pool, support for multiple concurrent AI assistant sessions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)? ✅ Yes - spec.md created first
- [x] **Phase**: Change allowed in active phase (Phase 3)? ✅ Yes - this is Phase 3 chatbot feature
- [x] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB? ✅ Yes - reusing existing stack, adding MCP SDK
- [x] **Security**: JWT verification required for all new endpoints? ✅ Yes - all MCP tools require JWT authentication
- [x] **Scoping**: Data access scoped to user via `user_id` from JWT? ✅ Yes - all tools enforce user isolation
- [x] **API**: URL follows `/api/{user_id}/tasks` pattern? ⚠️ N/A - MCP uses stdio transport, not HTTP endpoints
- [x] **Persistence**: Database access ONLY via backend API? ⚠️ Modified - MCP server accesses DB directly (same as FastAPI backend)
- [x] **Secrets**: No secrets stored on frontend? ✅ Yes - MCP server is backend service

**Constitution Compliance Notes**:
- The MCP server is a backend service that runs separately from the FastAPI application but shares the same database and authentication infrastructure
- MCP protocol uses stdio transport (not HTTP), so the `/api/{user_id}/tasks` URL pattern doesn't apply
- The MCP server will directly access the database using the same SQLModel models and connection string as the FastAPI backend
- This is consistent with the constitution's intent: secure, user-scoped data access with JWT verification

## Project Structure

### Documentation (this feature)

```text
specs/001-mcp-todo-server/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (in progress)
├── research.md          # Phase 0 output (to be created)
├── data-model.md        # Phase 1 output (to be created)
├── quickstart.md        # Phase 1 output (to be created)
├── contracts/           # Phase 1 output (to be created)
│   ├── add_task.json
│   ├── list_tasks.json
│   ├── complete_task.json
│   ├── delete_task.json
│   └── update_task.json
├── checklists/
│   └── requirements.md  # Spec quality checklist (completed)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── task.py          # Existing Task model (reused)
│   │   └── user.py          # Existing User model (reused)
│   ├── services/
│   │   └── auth_service.py  # Existing JWT verification (reused)
│   ├── db.py                # Existing database connection (reused)
│   └── mcp_server/          # NEW: MCP server implementation
│       ├── __init__.py
│       ├── server.py        # Main MCP server setup and lifecycle
│       ├── tools/           # Tool implementations
│       │   ├── __init__.py
│       │   ├── add_task.py
│       │   ├── list_tasks.py
│       │   ├── complete_task.py
│       │   ├── delete_task.py
│       │   └── update_task.py
│       ├── auth.py          # JWT authentication middleware for MCP
│       └── schemas.py       # MCP tool input/output schemas
│
└── tests/
    ├── mcp_server/          # NEW: MCP server tests
    │   ├── test_tools.py
    │   ├── test_auth.py
    │   └── test_integration.py
    └── conftest.py          # Shared test fixtures

# MCP server entry point
backend/mcp_server_main.py   # NEW: Entry point to run MCP server
```

**Structure Decision**: The MCP server is implemented as a new module within the existing `backend/src/` directory to maximize code reuse (models, database connection, auth service). The server runs as a separate process from the FastAPI application but shares the same codebase and database. This approach follows the monorepo structure and allows the MCP server to leverage existing infrastructure while maintaining separation of concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| MCP server accesses DB directly (not via FastAPI API) | MCP protocol requires stdio transport and low-latency responses. Making HTTP calls to FastAPI would add unnecessary network overhead and complexity. | Calling FastAPI endpoints from MCP server would require HTTP client setup, error handling for network issues, and would violate the sub-500ms performance requirement for list_tasks. Direct DB access using the same SQLModel models is simpler and more performant. |

## Phase 0: Research & Technology Decisions

**Status**: ✅ Completed

### Research Topics

1. **MCP Python SDK Architecture**
   - **Decision**: Use low-level `Server` API from `mcp.server.lowlevel` for maximum control
   - **Rationale**: Low-level API provides explicit control over tool registration, lifecycle management, and error handling. Allows integration of database connections via lifespan context manager.
   - **Alternatives Considered**: FastMCP high-level API - rejected because it's designed for simpler use cases and doesn't provide clear patterns for database connection management and JWT authentication integration

2. **Database Connection Strategy**
   - **Decision**: Use MCP server lifespan context manager to initialize database engine and provide sessions to tool handlers
   - **Rationale**: Lifespan API ensures proper connection pool initialization on startup and cleanup on shutdown. Prevents connection leaks and allows tools to access database via `server.request_context.lifespan_context`
   - **Alternatives Considered**: Creating new engine per tool call - rejected due to performance overhead and connection pool exhaustion risk

3. **JWT Authentication Integration**
   - **Decision**: Extract JWT from MCP client metadata/headers and validate using existing `auth_service.py` functions
   - **Rationale**: Reuses existing JWT verification logic (SECRET_KEY, algorithm). MCP clients can pass JWT in request metadata.
   - **Alternatives Considered**: Separate authentication system - rejected to avoid duplication and maintain consistency with FastAPI backend

4. **Tool Input/Output Schema Design**
   - **Decision**: Define JSON Schema for each tool's input and output, validated by MCP SDK
   - **Rationale**: MCP SDK provides automatic validation against schemas. Clear contracts for AI assistants.
   - **Alternatives Considered**: Pydantic models - rejected because MCP SDK expects JSON Schema format, not Pydantic

5. **Error Handling Strategy**
   - **Decision**: Use MCP `CallToolResult` with `isError=True` for all error cases, include descriptive error messages
   - **Rationale**: MCP protocol has built-in error handling. AI assistants can parse error messages and explain to users.
   - **Alternatives Considered**: Raising exceptions - rejected because MCP SDK catches exceptions and returns generic errors, losing context

### Technology Stack Summary

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| MCP SDK | `mcp` (Python) | Latest | MCP protocol implementation |
| ORM | SQLModel | 0.0.14+ | Database models and queries |
| Database Driver | asyncpg | 0.29.0+ | PostgreSQL async driver |
| JWT | python-jose | 3.3.0+ | JWT token verification |
| Testing | pytest + pytest-asyncio | 7.4+ / 0.21+ | Unit and integration tests |
| Transport | stdio | Built-in | MCP client-server communication |

### Key Architectural Decisions

1. **Stateless Tool Design**: Each tool call is independent. No server-side session state. User context extracted from JWT on every call.

2. **User Isolation**: All database queries filtered by `user_id` extracted from JWT. Prevents cross-user data access.

3. **Database Session Management**: Use async context managers for database sessions. Ensure proper cleanup even on errors.

4. **Concurrent Access**: SQLAlchemy connection pool handles concurrent tool calls. No additional locking required for read operations.

5. **Date Handling**: All dates stored and transmitted in ISO 8601 format (UTC timezone). Validation ensures end_date >= start_date.

## Phase 1: Design & Contracts

**Status**: ✅ Completed

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Summary**: Reuses existing `Task` model from `backend/src/models/task.py` with fields:
- `id` (UUID, primary key)
- `user_id` (UUID, foreign key to User)
- `title` (str, required)
- `description` (str, optional)
- `completed` (bool, default False)
- `start_date` (datetime, optional)
- `due_date` (datetime, optional)
- `created_at` (datetime, auto-generated)
- `updated_at` (datetime, auto-updated)

### API Contracts

See [contracts/](./contracts/) directory for complete JSON Schema definitions.

**MCP Tools**:

1. **add_task**
   - Input: `user_id`, `title`, `description?`, `start_date?`, `end_date?`
   - Output: `task_id`, `status`, `title`
   - Errors: `authentication_required`, `validation_error`, `database_error`

2. **list_tasks**
   - Input: `user_id`, `status_filter` (enum: "all", "pending", "completed")
   - Output: Array of task objects with all fields
   - Errors: `authentication_required`, `invalid_filter`, `database_error`

3. **complete_task**
   - Input: `user_id`, `task_id`
   - Output: `task_id`, `status`, `title`
   - Errors: `authentication_required`, `task_not_found`, `unauthorized`, `database_error`

4. **delete_task**
   - Input: `user_id`, `task_id`
   - Output: `task_id`, `status`, `title`
   - Errors: `authentication_required`, `task_not_found`, `unauthorized`, `database_error`

5. **update_task**
   - Input: `user_id`, `task_id`, `title?`, `description?`
   - Output: `task_id`, `status`, `title`
   - Errors: `authentication_required`, `task_not_found`, `unauthorized`, `validation_error`, `database_error`

### Quickstart Guide

See [quickstart.md](./quickstart.md) for setup and testing instructions.

**Quick Start**:
```bash
# Install dependencies
cd backend
pip install mcp

# Run MCP server
python mcp_server_main.py

# Test with MCP client (Claude Desktop)
# Configure in Claude Desktop settings:
# {
#   "mcpServers": {
#     "todo-server": {
#       "command": "python",
#       "args": ["D:/path/to/backend/mcp_server_main.py"],
#       "env": {
#         "DATABASE_URL": "postgresql+asyncpg://...",
#         "BETTER_AUTH_SECRET": "..."
#       }
#     }
#   }
# }
```

## Phase 2: Task Breakdown

**Status**: ⏸️ Pending - Use `/sp.tasks` command to generate tasks.md

Task breakdown will be generated in the next phase using the `/sp.tasks` command, which will create dependency-ordered implementation tasks based on this plan.

## Implementation Notes

### Security Considerations

1. **JWT Validation**: Every tool call must validate JWT before processing. Extract `user_id` from token payload.
2. **User Isolation**: All database queries must filter by `user_id`. Never trust client-supplied user_id without JWT verification.
3. **SQL Injection**: Use SQLModel parameterized queries. Never concatenate user input into SQL.
4. **Error Messages**: Don't leak sensitive information (database structure, user IDs of other users) in error messages.

### Performance Optimization

1. **Database Indexing**: Ensure `user_id` column is indexed on tasks table (already exists).
2. **Connection Pooling**: Reuse database engine across tool calls via lifespan context.
3. **Query Optimization**: Use `select()` with filters instead of loading all tasks and filtering in Python.
4. **Async Operations**: All database operations use async/await for non-blocking I/O.

### Testing Strategy

1. **Unit Tests**: Test each tool handler in isolation with mocked database sessions.
2. **Integration Tests**: Test full MCP server with real database (test database).
3. **Authentication Tests**: Verify JWT validation, user isolation, and error handling.
4. **Performance Tests**: Verify sub-500ms response time for list_tasks with 1000 tasks.
5. **Concurrency Tests**: Verify correct behavior with 100 concurrent tool calls.

### Deployment Considerations

1. **Environment Variables**: `DATABASE_URL`, `BETTER_AUTH_SECRET` must be configured.
2. **Process Management**: MCP server runs as separate process from FastAPI app.
3. **Logging**: Use Python logging to track tool calls, errors, and performance metrics.
4. **Monitoring**: Track tool call success rate, response times, and error rates.

## Dependencies

- Existing Better Auth JWT authentication system (FastAPI backend)
- Existing Task and User SQLModel models (backend/src/models/)
- Existing database connection setup (backend/src/db.py)
- Neon PostgreSQL database (shared with FastAPI backend)
- MCP Python SDK (new dependency to be added to requirements.txt)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|-----------|
| MCP SDK breaking changes | High | Pin specific SDK version in requirements.txt, monitor SDK releases |
| Database connection pool exhaustion | Medium | Configure appropriate pool size, implement connection timeout |
| JWT token expiration during long sessions | Low | MCP clients handle token refresh, server returns clear auth errors |
| Concurrent write conflicts | Low | Database ACID guarantees prevent corruption, last-write-wins for updates |
| Performance degradation with large task lists | Medium | Implement pagination if needed, optimize queries with proper indexes |

## Success Criteria Validation

This plan addresses all success criteria from the specification:

- **SC-001**: Tool implementations ensure 100% field persistence accuracy
- **SC-002**: Database query optimization and indexing support sub-500ms responses
- **SC-003**: JWT validation and user_id filtering enforce 100% user isolation
- **SC-004**: Error handling returns descriptive messages within 2 seconds
- **SC-005**: Connection pooling and async operations support 100 concurrent calls
- **SC-006**: Comprehensive error handling and validation target 95% success rate
- **SC-007**: All 5 tools implement complete task lifecycle operations
- **SC-008**: Error messages designed for AI assistant interpretation and user explanation

## Next Steps

1. Run `/sp.tasks` to generate dependency-ordered implementation tasks
2. Implement Phase 0: Set up MCP server project structure
3. Implement Phase 1: Core tool handlers (add_task, list_tasks)
4. Implement Phase 2: Additional tools (complete_task, delete_task, update_task)
5. Implement Phase 3: Authentication and error handling
6. Implement Phase 4: Testing and validation
7. Implement Phase 5: Documentation and deployment
