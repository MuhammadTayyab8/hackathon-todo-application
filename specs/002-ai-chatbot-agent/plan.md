# Implementation Plan: AI Chatbot Agent for Task Management

**Branch**: `002-ai-chatbot-agent` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ai-chatbot-agent/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

This feature enables users to manage tasks through natural language conversations with an AI chatbot powered by Gemini 2.5 Flash via OpenRouter. The chatbot invokes MCP tools from Sub-Phase 1 to perform task operations, maintains conversation history in the database, and operates statelessly with automatic history summarization after 600 tokens. The implementation uses OpenAI Agents SDK for agent orchestration, SQLModel for conversation persistence, and integrates with Better Auth for user authentication.

**Technical Approach**: Build a stateless agent runner that processes each chat request independently by: (1) fetching conversation history from database if conversation_id provided, (2) summarizing history if >600 tokens, (3) building message array with system instructions and history, (4) running OpenAI agent with access to 5 MCP tools via function calls, (5) storing user message and assistant response in database, (6) returning response to client. The agent uses Gemini 2.5 Flash via OpenRouter for natural language understanding and tool invocation.

## Technical Context

**Language/Version**: Python 3.11+ (matching existing backend)
**Primary Dependencies**: OpenAI Agents SDK (`openai-agents`), OpenRouter client (`openai` with base_url override), SQLModel, FastAPI, Better Auth JWT verification
**Storage**: Neon PostgreSQL (new tables: `conversation`, `message`)
**Testing**: pytest with async support, FastAPI TestClient, mock MCP server responses
**Target Platform**: Linux server (FastAPI backend deployment)
**Project Type**: Web application (backend API)
**Performance Goals**: <3s response time for simple requests (single tool call), <5s for complex requests (multiple tool calls), support 100 concurrent chat sessions
**Constraints**: 600 token history limit before summarization, stateless agent design (no server-side session state), synchronous processing (no streaming), 10 tool call limit per message
**Scale/Scope**: Multi-user chat system with conversation persistence, expected 100+ concurrent users, 10+ message conversations with context retention

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [X] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)? ✅ Spec generated via `/sp.specify`, now generating plan via `/sp.plan`
- [X] **Phase**: Change allowed in active phase (Phase 3)? ✅ Phase 3 (chatbot) explicitly allowed in constitution
- [X] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB? ✅ FastAPI backend, SQLModel for Conversation/Message models, Neon PostgreSQL
- [X] **Security**: JWT verification required for all new endpoints? ✅ `/api/{user_id}/chat` endpoint will verify JWT via Better Auth
- [X] **Scoping**: Data access scoped to user via `user_id` from JWT? ✅ All conversations/messages filtered by authenticated user_id
- [X] **API**: URL follows `/api/{user_id}/tasks` pattern? ✅ Endpoint is `/api/{user_id}/chat` (consistent pattern)
- [X] **Persistence**: Database access ONLY via backend API? ✅ Frontend calls API, backend handles all DB operations
- [X] **Secrets**: No secrets stored on frontend? ✅ OpenRouter API key stored in backend environment variables only

## Project Structure

### Documentation (this feature)

```text
specs/002-ai-chatbot-agent/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (agent architecture decisions)
├── data-model.md        # Phase 1 output (Conversation/Message models)
├── quickstart.md        # Phase 1 output (setup and testing guide)
├── contracts/           # Phase 1 output (API contracts)
│   └── chat-endpoint.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── task.py              # Existing Task model
│   │   ├── user.py              # Existing User model
│   │   ├── conversation.py      # NEW: Conversation model
│   │   └── message.py           # NEW: Message model
│   ├── services/
│   │   ├── auth_service.py      # Existing Better Auth JWT verification
│   │   ├── task_service.py      # Existing task operations
│   │   └── chat_service.py      # NEW: Chat orchestration service
│   ├── agents/
│   │   ├── __init__.py          # NEW: Agent module
│   │   ├── task_agent.py        # NEW: OpenAI agent with MCP tools
│   │   ├── mcp_tools.py         # NEW: MCP tool wrappers for agent
│   │   └── history_manager.py   # NEW: Conversation history management
│   ├── routes/
│   │   ├── tasks.py             # Existing task routes
│   │   └── chat.py              # NEW: Chat endpoint
│   └── mcp_server/              # Existing MCP server (Sub-Phase 1)
│       ├── server.py
│       ├── tools/
│       └── ...
└── tests/
    ├── test_chat_service.py     # NEW: Chat service tests
    ├── test_task_agent.py       # NEW: Agent tests with mocked tools
    └── test_chat_routes.py      # NEW: Chat endpoint integration tests

frontend/
├── src/
│   ├── components/
│   │   └── chat/                # NEW: Chat UI components (future)
│   └── app/
│       └── api/                 # API client calls
└── tests/
```

**Structure Decision**: Web application structure (Option 2) with backend FastAPI and frontend Next.js. This feature adds new backend modules for agent orchestration (`agents/`), chat service (`services/chat_service.py`), conversation models (`models/conversation.py`, `models/message.py`), and chat API endpoint (`routes/chat.py`). The existing MCP server from Sub-Phase 1 is invoked by the agent via function tools.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations. All constitution checks passed.

---

## Phase 0: Research & Decisions

See [research.md](./research.md) for detailed research decisions on:

1. **Agent Architecture**: OpenAI Agents SDK integration with OpenRouter
2. **Model Configuration**: Gemini 2.5 Flash via OpenRouter base URL override
3. **MCP Tool Invocation**: Wrapping MCP server tools as agent function tools
4. **Conversation Management**: Stateless flow with database history retrieval
5. **History Summarization**: Token counting and summarization strategy (>600 tokens)
6. **Natural Language Parsing**: Agent instructions for intent recognition and tool mapping
7. **Tool Chaining**: Sequential tool calls within single agent run
8. **Action Confirmation**: Detecting destructive operations and confirmation workflow
9. **Error Handling**: MCP tool errors, database errors, agent errors

**Key Research Questions**:
- How to configure OpenAI Agents SDK to use OpenRouter with Gemini 2.5 Flash?
- How to wrap MCP server tools as agent function tools with JWT token passing?
- How to implement stateless conversation flow with history retrieval and summarization?
- How to count tokens and trigger summarization at 600 token threshold?
- How to handle tool chaining and partial failures in agent execution?

---

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](./data-model.md) for complete SQLModel definitions.

**Summary**:

**Conversation Model**:
- `id`: UUID primary key
- `user_id`: String foreign key to User (indexed)
- `title`: Optional string (auto-generated from first message)
- `created_at`: DateTime with timezone
- `updated_at`: DateTime with timezone
- Relationship: `messages` (one-to-many)

**Message Model**:
- `id`: UUID primary key
- `conversation_id`: UUID foreign key to Conversation (indexed)
- `role`: Enum ("user" | "assistant")
- `content`: Text (message content)
- `tool_calls`: Optional JSON (array of tool call metadata)
- `created_at`: DateTime with timezone
- Relationship: `conversation` (many-to-one)

**Database Migrations**:
- Create `conversation` table with user_id index
- Create `message` table with conversation_id index and role index
- Add foreign key constraints

### API Contracts

See [contracts/chat-endpoint.yaml](./contracts/chat-endpoint.yaml) for OpenAPI specification.

**Summary**:

**POST /api/{user_id}/chat**

Request:
```json
{
  "message": "Add a task to buy groceries tomorrow",
  "conversation_id": "uuid-optional"
}
```

Response (200 OK):
```json
{
  "conversation_id": "uuid",
  "message": "I've created a task 'Buy groceries' with due date tomorrow.",
  "created_at": "2026-01-17T10:30:00Z"
}
```

Response (401 Unauthorized):
```json
{
  "detail": "Invalid or expired JWT token"
}
```

Response (400 Bad Request):
```json
{
  "detail": "Message text is required"
}
```

Response (500 Internal Server Error):
```json
{
  "detail": "An error occurred processing your request"
}
```

**Authentication**: Bearer JWT token in `Authorization` header
**Rate Limiting**: 60 requests per minute per user (future enhancement)

### Quickstart Guide

See [quickstart.md](./quickstart.md) for complete setup and testing instructions.

**Summary**:

1. **Prerequisites**: MCP server from Sub-Phase 1 running, OpenRouter API key, database migrations applied
2. **Environment Setup**: Configure `OPENROUTER_API_KEY`, `DATABASE_URL`, `BETTER_AUTH_SECRET`
3. **Install Dependencies**: `pip install openai-agents openai sqlmodel`
4. **Run Backend**: `uvicorn main:app --reload --port 8000`
5. **Test Endpoint**: `curl -X POST http://localhost:8000/api/{user_id}/chat -H "Authorization: Bearer {jwt}" -d '{"message": "Add a task to test the chatbot"}'`
6. **Verify Database**: Check `conversation` and `message` tables for stored records
7. **Test Conversation History**: Send follow-up message with same `conversation_id`
8. **Test Tool Chaining**: Send complex request like "Show my tasks and mark the first one complete"

---

## Phase 2: Task Breakdown

Task breakdown will be generated by `/sp.tasks` command after this plan is approved. Expected task structure:

**Phase 1: Database Models (3-5 tasks)**
- Create Conversation SQLModel with relationships
- Create Message SQLModel with relationships
- Generate and apply database migrations
- Add indexes for user_id and conversation_id

**Phase 2: Agent Setup (5-7 tasks)**
- Install OpenAI Agents SDK and OpenRouter client
- Configure OpenRouter with Gemini 2.5 Flash model
- Create agent initialization with system instructions
- Wrap 5 MCP tools as agent function tools
- Implement JWT token passing to MCP tools

**Phase 3: Conversation Management (4-6 tasks)**
- Implement conversation history retrieval from database
- Implement token counting for history
- Implement history summarization when >600 tokens
- Build message array with system instructions + history

**Phase 4: Agent Execution (3-5 tasks)**
- Implement stateless agent runner
- Handle agent tool calls and responses
- Store user message and assistant response in database
- Handle tool chaining and partial failures

**Phase 5: API Endpoint (3-4 tasks)**
- Create POST /api/{user_id}/chat endpoint
- Integrate Better Auth JWT verification
- Implement request/response validation
- Add error handling and logging

**Phase 6: Testing (5-7 tasks)**
- Unit tests for conversation models
- Unit tests for agent with mocked MCP tools
- Integration tests for chat endpoint
- Test conversation history and summarization
- Test tool chaining scenarios

**Total Estimated Tasks**: 23-34 tasks

---

## Agent Context Update

**For backend-agent**: This feature adds AI chatbot functionality to the Todo app. You will implement:

1. **Database Models**: Create `Conversation` and `Message` SQLModel models in `backend/src/models/` with proper relationships and indexes.

2. **Agent Module**: Create `backend/src/agents/` directory with:
   - `task_agent.py`: OpenAI agent configured with Gemini 2.5 Flash via OpenRouter
   - `mcp_tools.py`: Wrapper functions that convert MCP server tools into agent function tools
   - `history_manager.py`: Conversation history retrieval, token counting, and summarization

3. **Chat Service**: Create `backend/src/services/chat_service.py` with stateless orchestration:
   - Fetch conversation history if conversation_id provided
   - Summarize history if >600 tokens
   - Build message array with system instructions + history + new user message
   - Run agent with MCP tool access
   - Store user message and assistant response in database
   - Return response to client

4. **Chat Endpoint**: Create `backend/src/routes/chat.py` with POST `/api/{user_id}/chat`:
   - Verify JWT token via Better Auth
   - Validate request body (message text, optional conversation_id)
   - Call chat service
   - Return response with conversation_id and assistant message

5. **MCP Tool Integration**: The agent must invoke existing MCP tools from Sub-Phase 1:
   - `add_task`: Create new task
   - `list_tasks`: Retrieve tasks with filtering
   - `complete_task`: Mark task as completed
   - `update_task`: Update task fields
   - `delete_task`: Delete task

   Each tool call must pass the authenticated user's JWT token for user isolation.

6. **Key Implementation Details**:
   - Use OpenAI Agents SDK `Agent` class with `tools` parameter
   - Configure OpenAI client with `base_url="https://openrouter.ai/api/v1"` and `api_key=OPENROUTER_API_KEY`
   - Use model name `"google/gemini-2.0-flash-exp:free"` for Gemini 2.5 Flash
   - Implement token counting using `tiktoken` library
   - Summarization prompt: "Summarize the following conversation history in 200 tokens or less, preserving key context about tasks and user intent: {history}"
   - Agent system instructions: "You are a helpful task management assistant. Parse user requests and invoke the appropriate tools. For ambiguous requests, ask clarifying questions. For destructive operations (delete, bulk actions), request confirmation before proceeding."

7. **Testing Requirements**:
   - Mock MCP server responses in unit tests
   - Test conversation history retrieval and summarization
   - Test tool chaining scenarios
   - Test error handling for MCP tool failures
   - Integration tests with real database and mocked agent

**Dependencies**: Sub-Phase 1 MCP server must be operational, Better Auth JWT verification must be working, database must support new tables.

**Success Criteria**: Users can send natural language messages to `/api/{user_id}/chat` and receive responses that correctly invoke MCP tools, maintain conversation context, and persist history in the database.

---

## Notes

- This plan delegates implementation to `backend-agent` as requested
- All relevant skills (OpenAI Agents SDK, SQLModel, MCP SDK) will be used during implementation
- The 600 token summarization threshold is a hard requirement
- Stateless design ensures scalability and simplifies deployment
- MCP tool integration reuses existing Sub-Phase 1 infrastructure
- Better Auth integration ensures consistent authentication across all endpoints

**Next Steps**:
1. Review and approve this plan
2. Run `/sp.tasks` to generate detailed task breakdown
3. Run `/sp.implement` to execute implementation with backend-agent
