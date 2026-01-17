---
id: 20260117-010
title: Generate ChatKit AI UI Implementation Plan
stage: plan
date: 2026-01-17
surface: claude-code-cli
model: claude-sonnet-4.5
feature: 001-chatkit-ai-ui
branch: 001-chatkit-ai-ui
user: MuhammadTayyab
command: /sp.plan
labels: [planning, chatkit, ai-chatbot-ui, openai-chatkit, better-auth, frontend, next.js, technical-design]
links:
  spec: specs/001-chatkit-ai-ui/spec.md
  plan: specs/001-chatkit-ai-ui/plan.md
  ticket: null
  adr: null
  pr: null
files:
  - path: specs/001-chatkit-ai-ui/plan.md
    status: created
    lines: 596
  - path: specs/001-chatkit-ai-ui/research.md
    status: created
    lines: 450
  - path: specs/001-chatkit-ai-ui/data-model.md
    status: created
    lines: 380
  - path: specs/001-chatkit-ai-ui/contracts/chat-api.md
    status: created
    lines: 520
  - path: specs/001-chatkit-ai-ui/quickstart.md
    status: created
    lines: 450
tests:
  - type: constitution-check
    status: passed
    description: All constitution gates satisfied - Phase 3 feature, JWT auth, user scoping, no secrets on frontend
---

## Prompt

generate a technical plan based on Sub-Phase 3 spec for Phase III Todo AI Chatbot. Outline OpenAI ChatKit installation in Next.js frontend (App Router), configure domain allowlist/env vars; build UI components for chat input/display/history/tool calls. Plan API calls to /api/{user_id}/chat with JWT headers, handle responses (update UI statelessly). Integrate Better Auth for sessions. Use ui-ux-designer for design. Delegate to frontend-agent. MUST Use Revelent SKILLS. Output plan in markdown with sections for ChatKit setup, UI components, API integration, auth/config, responsiveness, and testing.

## Response snapshot

Generated comprehensive technical implementation plan for ChatKit AI Chatbot UI feature with complete Phase 0 research and Phase 1 design artifacts. Created detailed planning documentation covering:

**Implementation Plan (plan.md)**:
- Technical context: Next.js 16 App Router, TypeScript, OpenAI ChatKit, Better Auth, React 19, Tailwind CSS
- Constitution check: ✅ All 8 gates passed (SDD sequence, Phase 3 feature, stack compliance, JWT auth, user scoping, API pattern, backend-only persistence, no frontend secrets)
- Project structure: Frontend-focused with 10 chat components, API client, hooks, contexts, types, utils
- 6 implementation phases aligned with user story priorities (P1→P2→P3)
- Testing strategy: Unit, integration, E2E, performance tests
- Risk assessment: High (ChatKit compatibility, backend API assumptions), Medium (performance, mobile UX), Low (domain validation, Better Auth)
- Deployment considerations: Environment variables, build config, domain validation

**Phase 0 Research (research.md)**:
Resolved 7 technical unknowns with decisions and rationale:
1. **ChatKit Installation**: Use @openai/chatkit npm package with Next.js 16 App Router
2. **Integration Pattern**: Provider pattern with custom API adapter for backend compatibility
3. **Better Auth**: useSession() hook with JWT token extraction
4. **Domain Validation**: Client-side validation on initialization using NEXT_PUBLIC_OPENAI_DOMAIN_KEY
5. **Design System**: ui-ux-designer tokens via Tailwind config
6. **State Management**: React Context with custom hooks (sufficient for feature scope)
7. **Error Handling**: Multi-layer with retry logic and message preservation

**Phase 1 Design Artifacts**:

1. **Data Model (data-model.md)**: 4 entities with complete definitions
   - Conversation: id, userId, createdAt, updatedAt, lastMessage, messageCount
   - Message: id, conversationId, sender, content, timestamp, toolCalls
   - ToolCall: id, messageId, description, parameters, status, result, error
   - User: id, email, name (Better Auth managed)
   - State transitions, validation rules, relationships documented
   - Frontend state model (ChatState) defined

2. **API Contracts (contracts/chat-api.md)**: 4 endpoints with complete specifications
   - POST /api/{user_id}/chat - Send message, receive response with tool calls
   - GET /api/{user_id}/conversations - Retrieve conversation list
   - GET /api/{user_id}/conversations/{id}/messages - Retrieve conversation messages
   - POST /api/{user_id}/chat/tool-action - Approve/reject tool actions
   - Request/response formats, error codes, validation rules, security considerations

3. **Quickstart Guide (quickstart.md)**: Complete developer setup instructions
   - Prerequisites, initial setup, environment configuration
   - Directory structure creation, type definitions
   - Phase-by-phase development workflow with code examples
   - Testing instructions, common issues & solutions
   - Development tips, code style guidelines

**Implementation Phases**:
- Phase 1 (P1): Core chat interface - message send/receive, loading states
- Phase 2 (P1): Tool confirmations - approve/reject UI, execution results
- Phase 3 (P2): Conversation history - list, selection, switching
- Phase 4 (P2): New conversation - creation flow
- Phase 5 (P3): Error handling - retry logic, message preservation
- Phase 6: Responsive design - mobile/tablet/desktop, design system application

**Agent Context Update**: Successfully updated CLAUDE.md with new technologies (TypeScript/Next.js 16, OpenAI ChatKit, Better Auth, React 19, Tailwind CSS)

## Outcome

- ✅ Impact: Complete technical implementation plan ready for task breakdown. 6 phased implementation approach enables incremental development. 7 research decisions resolve all technical unknowns. 4 entities with validation rules provide clear data model. 4 API endpoints with complete contracts enable frontend-backend integration. Quickstart guide accelerates developer onboarding.
- 🧪 Tests: Constitution check passed all 8 gates. No violations. Feature complies with project principles (SDD, Phase 3, stack, security, scoping, API pattern, persistence, secrets).
- 📁 Files: Created plan.md (596 lines), research.md (450 lines), data-model.md (380 lines), contracts/chat-api.md (520 lines), quickstart.md (450 lines). Total: 2,396 lines of planning documentation.
- 🔁 Next prompts:
  1. "Run /sp.tasks to generate task breakdown from implementation plan"
  2. "Review the implementation plan at specs/001-chatkit-ai-ui/plan.md"
  3. "Review research decisions at specs/001-chatkit-ai-ui/research.md"
  4. "Start implementation with Phase 1: Core Chat Interface"
- 🧠 Reflection: Successfully created comprehensive technical plan that bridges user requirements (spec) with implementation details. Research phase resolved all technical unknowns with clear decisions and rationale - ChatKit integration pattern (Provider with API adapter) balances library features with backend compatibility. State management decision (React Context) is appropriate for feature scope without over-engineering. Multi-layer error handling ensures good UX. Data model captures all entities from spec with proper validation rules and relationships. API contracts provide complete specifications for frontend-backend integration. Phased implementation aligns with user story priorities (P1→P2→P3) enabling MVP delivery. Risk assessment identifies potential blockers (ChatKit compatibility, backend API) with mitigation strategies. Constitution check validates compliance with all project principles. Quickstart guide provides clear developer onboarding path with code examples.

## Evaluation notes (flywheel)

- Failure modes observed: None. Planning workflow completed successfully with all required artifacts generated.
- Graders run and results (PASS/FAIL):
  - Constitution Check: PASS (all 8 gates satisfied, no violations)
  - Technical Context: PASS (all unknowns identified and resolved in research phase)
  - Phase 0 Research: PASS (7 decisions with rationale and alternatives)
  - Phase 1 Design: PASS (data model, API contracts, quickstart guide complete)
  - Agent Context Update: PASS (CLAUDE.md updated with new technologies)
- Prompt variant (if applicable): User requested specific sections (ChatKit setup, UI components, API integration, auth/config, responsiveness, testing). Plan structure incorporated these while following template format.
- Next experiment (smallest change to try): Consider adding performance benchmarks for specific operations (e.g., "Render 100-message conversation in under 1 second"). Consider adding accessibility requirements (WCAG 2.1 AA compliance, keyboard navigation, screen reader support) as functional requirements. Consider adding monitoring/observability section (error tracking, performance monitoring, user analytics).
