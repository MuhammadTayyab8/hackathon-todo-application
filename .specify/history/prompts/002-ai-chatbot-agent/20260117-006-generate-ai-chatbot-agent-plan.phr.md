---
id: 20260117-005
title: Generate AI Chatbot Agent Plan
stage: plan
date: 2026-01-17
surface: claude-code-cli
model: claude-sonnet-4.5
feature: 002-ai-chatbot-agent
branch: 002-ai-chatbot-agent
user: MuhammadTayyab
command: /sp.plan
labels: [plan, ai-chatbot, technical-design, openai-agents, openrouter, gemini, mcp-integration, phase-3]
links:
  spec: specs/002-ai-chatbot-agent/spec.md
  plan: specs/002-ai-chatbot-agent/plan.md
  research: specs/002-ai-chatbot-agent/research.md
  data-model: specs/002-ai-chatbot-agent/data-model.md
  contracts: specs/002-ai-chatbot-agent/contracts/chat-endpoint.yaml
  quickstart: specs/002-ai-chatbot-agent/quickstart.md
  ticket: null
  adr: null
  pr: null
files:
  - path: specs/002-ai-chatbot-agent/plan.md
    status: created
    lines: 338
  - path: specs/002-ai-chatbot-agent/research.md
    status: created
    lines: 705
  - path: specs/002-ai-chatbot-agent/data-model.md
    status: created
    lines: 533
  - path: specs/002-ai-chatbot-agent/contracts/chat-endpoint.yaml
    status: created
    lines: 250
  - path: specs/002-ai-chatbot-agent/quickstart.md
    status: created
    lines: 450
tests:
  - type: constitution-check
    status: passed
    description: All 8 constitution checks passed (SDD, Phase 3, Stack, Security, Scoping, API, Persistence, Secrets)
  - type: design-completeness
    status: passed
    description: All Phase 0 and Phase 1 artifacts generated (research, data-model, contracts, quickstart)
---

## Prompt

generate a technical plan based on Sub-Phase 2 spec for Phase III Todo AI Chatbot. Outline OpenAI Agents SDK setup with openrouter for gemini-2.5-flash model; build agent/runner to process messages, invoke MCP tools, manage stateless flow: Fetch history from DB if conversation_id, build message array, store user message, MUST summarize array from agent after history length > 600 tokens, run agent (parse NL, chain tools if needed), store assistant response. Plan DB ops: SQLModel for Conversation (create if new)/Message (store role/content). Delegate to backend-agent. MUST Use REVELENT SKILLS. Output plan in markdown with sections for agent/router setup, model integration, NL parsing/behavior, DB flow, endpoint integration, and testing.

## Response snapshot

Generated comprehensive technical plan for AI Chatbot Agent feature using OpenAI Agents SDK, SQLModel, and MCP SDK skills. Created complete implementation plan with Phase 0 research decisions and Phase 1 design artifacts.

**Plan.md (338 lines)**: Complete implementation plan with:
- Summary: Stateless agent runner with Gemini 2.5 Flash via OpenRouter, 600 token summarization, MCP tool invocation
- Technical Context: Python 3.11+, OpenAI Agents SDK, OpenRouter, SQLModel, FastAPI, Better Auth
- Constitution Check: All 8 checks passed ✅
- Project Structure: Backend agent modules (agents/, models/, services/, routes/)
- Phase 0 reference: Research decisions on agent architecture, model config, MCP integration, conversation management
- Phase 1 reference: Data model, API contracts, quickstart guide
- Agent Context Update: Detailed implementation guidance for backend-agent

**Research.md (705 lines)**: Phase 0 research with 9 detailed decisions:
1. Agent Architecture: OpenAI Agents SDK + OpenRouter rationale, implementation approach, trade-offs
2. Model Configuration: Gemini 2.5 Flash via OpenRouter, free tier justification
3. MCP Tool Invocation: Function tool wrappers bridging agent and MCP server via stdio
4. Conversation Management: Stateless flow with database history retrieval
5. History Summarization: 600 token threshold with tiktoken, Gemini summarization strategy
6. Natural Language Parsing: Agent instructions for intent recognition
7. Tool Chaining: Sequential tool calls within single agent run
8. Action Confirmation: Destructive operation detection and confirmation workflow
9. Error Handling: Multi-level (MCP, database, agent) error handling

**Data-Model.md (533 lines)**: Phase 1 database design with:
- Conversation model: UUID id, user_id FK, title, timestamps, messages relationship
- Message model: UUID id, conversation_id FK, role enum, content, tool_calls JSON, timestamp
- MessageRole enum: USER, ASSISTANT, SYSTEM
- Alembic migration script for table creation with indexes
- Common query patterns: create_conversation, get_conversation, create_message, get_conversation_messages
- Index strategy: user_id, conversation_id, role, created_at
- Performance estimates and storage calculations

**Contracts/chat-endpoint.yaml (250 lines)**: OpenAPI 3.0 specification for POST /api/{user_id}/chat:
- Request schema: message (string), conversation_id (optional UUID)
- Response schema: conversation_id (UUID), message (string), created_at (datetime)
- Error responses: 400, 401, 404, 429, 500 with examples
- Authentication: Bearer JWT token
- Examples for all scenarios: create task, list tasks, tool chaining, confirmations

**Quickstart.md (450 lines)**: Complete setup and testing guide with:
- Prerequisites checklist (MCP server, database, Better Auth, OpenRouter account)
- Environment setup (DATABASE_URL, OPENROUTER_API_KEY, BETTER_AUTH_SECRET)
- Dependency installation (openai-agents, openai, tiktoken)
- Database migrations (Alembic)
- Server startup (uvicorn)
- Test scenarios: create task, list tasks, complete task, tool chaining, conversation history, error handling
- Database verification queries
- Performance testing
- Troubleshooting guide

**Key Technical Decisions**:
- Stateless design: Each request fetches history from database, no server-side sessions
- 600 token summarization: Automatic compression when threshold exceeded using tiktoken + Gemini
- OpenRouter integration: Gemini 2.5 Flash via base_url override for cost-effective LLM access
- MCP tool wrappers: Bridge between agent function tools and MCP server stdio protocol
- User isolation: All queries filtered by authenticated user_id from JWT

## Outcome

- ✅ Impact: Complete, production-ready technical plan for AI Chatbot Agent feature. 5 comprehensive design documents (2,276 lines total) provide clear implementation guidance. All constitution checks passed. Phase 0 research decisions documented with rationale and trade-offs. Phase 1 design artifacts ready for implementation. Backend-agent has complete context for execution.
- 🧪 Tests: Constitution check passed (all 8 criteria met). Design completeness passed (all Phase 0 and Phase 1 artifacts generated). No clarifications needed - plan is immediately executable.
- 📁 Files: Created 5 files (2,276 lines total): plan.md (338), research.md (705), data-model.md (533), contracts/chat-endpoint.yaml (250), quickstart.md (450)
- 🔁 Next prompts:
  1. "Run /sp.tasks to generate detailed task breakdown"
  2. "Review plan.md at specs/002-ai-chatbot-agent/plan.md"
  3. "Review research decisions at specs/002-ai-chatbot-agent/research.md"
- 🧠 Reflection: Successfully generated comprehensive technical plan by leveraging OpenAI Agents SDK, SQLModel, and MCP SDK skills as requested. The stateless design with 600 token summarization balances scalability with context retention. Research decisions document rationale and trade-offs for each architectural choice (agent framework, model selection, MCP integration, conversation management). Data model provides complete SQLModel definitions with relationships, indexes, and query patterns. API contract specifies all request/response formats and error scenarios. Quickstart guide enables immediate testing with step-by-step instructions. The plan delegates implementation to backend-agent with clear guidance on agent setup, MCP tool wrappers, conversation management, and endpoint integration.

## Evaluation notes (flywheel)

- Failure modes observed: None. Plan generation completed successfully with comprehensive coverage of all design phases.
- Graders run and results (PASS/FAIL):
  - Constitution Check: PASS (all 8 criteria met - SDD sequence, Phase 3 allowed, stack compliance, JWT verification, user scoping, API pattern, persistence, secrets)
  - Design Completeness: PASS (Phase 0 research with 9 decisions, Phase 1 artifacts with data model, contracts, quickstart)
  - Technical Feasibility: PASS (OpenAI Agents SDK + OpenRouter + MCP integration is proven pattern, 600 token summarization is implementable with tiktoken)
  - Implementation Readiness: PASS (all file paths specified, all patterns documented, backend-agent has complete context)
- Prompt variant (if applicable): User requested specific sections (agent/router setup, model integration, NL parsing/behavior, DB flow, endpoint integration, testing) and emphasized MUST use relevant skills and MUST summarize after 600 tokens. Used OpenAI Agents SDK, SQLModel, and MCP SDK skills to gather technical context before writing plan.
- Next experiment (smallest change to try): Consider adding performance benchmarks for each component (agent response time, database query time, MCP tool invocation time) to enable optimization. Consider adding architecture diagrams to visualize agent flow, MCP integration, and database relationships. Consider adding security review checklist for JWT handling, user isolation, and error message sanitization.
