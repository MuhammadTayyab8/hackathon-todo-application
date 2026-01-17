---
id: 20260117-002
title: Generate MCP Todo Server Implementation Plan
stage: plan
date: 2026-01-17T11:52:00Z
surface: claude-code-cli
model: claude-sonnet-4.5
feature: 001-mcp-todo-server
branch: 001-mcp-todo-server
user: system
command: /sp.plan
labels: [planning, mcp-server, phase-3, implementation-design]
links:
  spec: specs/001-mcp-todo-server/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - path: specs/001-mcp-todo-server/plan.md
    status: created
    lines: 318
  - path: specs/001-mcp-todo-server/research.md
    status: created
    lines: 450
  - path: specs/001-mcp-todo-server/data-model.md
    status: created
    lines: 380
  - path: specs/001-mcp-todo-server/quickstart.md
    status: created
    lines: 420
  - path: specs/001-mcp-todo-server/contracts/add_task.json
    status: created
    lines: 85
  - path: specs/001-mcp-todo-server/contracts/list_tasks.json
    status: created
    lines: 120
  - path: specs/001-mcp-todo-server/contracts/complete_task.json
    status: created
    lines: 65
  - path: specs/001-mcp-todo-server/contracts/delete_task.json
    status: created
    lines: 60
  - path: specs/001-mcp-todo-server/contracts/update_task.json
    status: created
    lines: 110
tests:
  - type: constitution-check
    status: passed
    description: All constitution checks passed with justified exceptions
---

## Prompt

Generate a technical plan for Phase III Todo AI Chatbot. Outline MCP server setup with Official MCP SDK, implement each tool: add_task (DB insert), list_tasks (DB query with filters/joins if needed), complete_task (DB update completed), delete_task (DB delete), update_task (DB update fields)—all stateless, use SQLModel sessions, Neon connection. Integrate Better Auth for user_id verification. Plan error handling (e.g., 404 for invalid task_id). Delegate to backend-agent. MUST Use Relevant SKILLS and MCP SERVER CONTEXT7 with library /modelcontextprotocol/python-sdk. Output plan in markdown with sections for MCP setup, tool implementations, DB operations and security.

## Response snapshot

Created comprehensive implementation plan with complete Phase 0 (Research) and Phase 1 (Design & Contracts) artifacts:

**Phase 0: Research & Technology Decisions (research.md)**
- Researched MCP Python SDK architecture options (low-level vs FastMCP)
- Decision: Use low-level Server API for database and authentication integration
- Researched database connection strategies
- Decision: Use MCP lifespan context manager for connection pooling
- Researched JWT authentication integration patterns
- Decision: Extract JWT from request metadata, reuse existing auth_service.py
- Researched tool schema design approaches
- Decision: Use JSON Schema format (MCP SDK standard)
- Researched error handling strategies
- Decision: Use CallToolResult with isError flag for explicit error handling

**Phase 1: Design & Contracts**

1. **plan.md** (318 lines):
   - Complete technical context (Python 3.11+, MCP SDK, SQLModel, Neon PostgreSQL)
   - Constitution check with justified exceptions (MCP uses stdio, not HTTP)
   - Project structure with new mcp_server/ module in backend
   - Complexity tracking for direct DB access (justified by performance requirements)
   - Implementation notes covering security, performance, testing, and deployment
   - Risk analysis with mitigations
   - Success criteria validation against all 8 spec requirements

2. **data-model.md** (380 lines):
   - Reuses existing Task model from backend/src/models/task.py
   - Detailed field definitions with constraints and validation rules
   - Data access patterns for all 5 tools with code examples
   - User isolation enforcement patterns (critical security requirement)
   - Database schema documentation
   - Performance considerations and query optimization strategies
   - Concurrency handling approach
   - Test fixtures for automated testing

3. **contracts/** (5 JSON Schema files, 440 total lines):
   - add_task.json: Create task with title, description, dates
   - list_tasks.json: Retrieve tasks with status filter (all/pending/completed)
   - complete_task.json: Mark task as completed
   - delete_task.json: Permanently remove task
   - update_task.json: Modify task title and/or description
   - Each contract includes: inputSchema, outputSchema, error types, examples, notes

4. **quickstart.md** (420 lines):
   - Installation instructions (MCP SDK + existing dependencies)
   - Environment configuration (DATABASE_URL, BETTER_AUTH_SECRET)
   - Project structure overview
   - Running instructions (development and production modes)
   - Claude Desktop configuration with example JSON
   - Manual testing scenarios for all 5 tools
   - Automated testing instructions
   - Authentication setup guide
   - Troubleshooting section with common issues and solutions
   - Performance benchmarks
   - Security considerations

**Key Architectural Decisions**:
1. Low-level MCP Server API for explicit control over lifecycle and database connections
2. Lifespan context manager for database engine initialization and cleanup
3. Stateless tool design with JWT authentication on every call
4. User isolation enforced via database query filters (user_id from JWT)
5. JSON Schema validation for all tool inputs/outputs
6. Explicit error handling with CallToolResult and descriptive messages

**Technology Stack**:
- MCP Python SDK (official implementation)
- SQLModel 0.0.14+ (reuse existing models)
- asyncpg 0.29.0+ (async PostgreSQL driver)
- python-jose 3.3.0+ (JWT verification)
- pytest + pytest-asyncio (testing)
- stdio transport (standard MCP communication)

**Constitution Compliance**:
- ✅ Follows SDD workflow (Constitution → Spec → Plan → Tasks)
- ✅ Phase 3 feature (chatbot integration)
- ✅ Uses approved stack (Python, SQLModel, Neon DB)
- ✅ JWT authentication required for all operations
- ✅ User-scoped data access enforced
- ⚠️ MCP uses stdio (not HTTP /api/ endpoints) - justified by protocol requirements
- ⚠️ Direct DB access (not via FastAPI) - justified by performance requirements

## Outcome

- ✅ Impact: Complete implementation plan ready for task breakdown. All Phase 0 research completed with clear technology decisions. All Phase 1 design artifacts created (data model, contracts, quickstart guide). Constitution check passed with justified exceptions.
- 🧪 Tests: Constitution check passed. All 8 success criteria from spec validated against plan.
- 📁 Files: Created 9 files - plan.md, research.md, data-model.md, quickstart.md, and 5 JSON contract files (1,688 total lines)
- 🔁 Next prompts: Ready for `/sp.tasks` to generate dependency-ordered implementation tasks
- 🧠 Reflection: Successfully leveraged Context7 MCP SDK documentation to make informed architectural decisions. Low-level Server API chosen over FastMCP for better database and authentication integration. Lifespan context manager pattern ensures proper resource management. All 5 tools designed with clear contracts, error handling, and user isolation. Plan addresses all performance and security requirements from specification.

## Evaluation notes (flywheel)

- Failure modes observed: None. All phases completed successfully with comprehensive documentation.
- Graders run and results (PASS/FAIL): Constitution Check - PASS (with justified exceptions for MCP protocol requirements)
- Prompt variant (if applicable): Standard /sp.plan workflow with Context7 integration for MCP SDK research
- Next experiment (smallest change to try): Consider adding MCP authentication middleware pattern to automatically extract JWT from client metadata instead of passing in tool arguments (future enhancement)
