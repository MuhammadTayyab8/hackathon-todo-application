---
id: PHR-002-chatkit-fastapi-plan
title: ChatKit FastAPI Implementation Plan
stage: plan
date: 2026-01-21T23:00:00Z
surface: cli
model: claude-sonnet-4-5
feature: 001-chatkit-fastapi
branch: 001-chatkit-fastapi
user: user
command: /sp.plan
labels: [chatkit, fastapi, planning, route-groups, ai-chat]
links:
  spec: specs/001-chatkit-fastapi/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - path: specs/001-chatkit-fastapi/plan.md
    action: created
    lines: 444
  - path: specs/001-chatkit-fastapi/research.md
    action: created
    lines: 350
  - path: specs/001-chatkit-fastapi/data-model.md
    action: created
    lines: 450
  - path: specs/001-chatkit-fastapi/contracts/chat-api.yaml
    action: created
    lines: 550
  - path: specs/001-chatkit-fastapi/quickstart.md
    action: created
    lines: 400
tests: []
---

## Prompt

User requested: "make a consize, short and to the point plan make a group route (main) in frontend move /calendar, /categories, /dashboard, /tasks in that group route so that current routing not change. then make a layout.js file add <Sidebar /> here and also the chatkit-js chat component also render here a chat icon flot on bottom left with chat icon on click chatkit-js ui component appear which calls our Backend API /api/{user_id}/chat. MUST USE RELEVENT SKILLS"

Command: `/sp.plan make a consize, short and to the point plan make a group route (main) in frontend move /calendar, /categories, /dashboard, /tasks in that group route so that current routing not change. then make a layout.js file add <Sidebar /> here and also the chatkit-js chat component also render here a chat icon flot on bottom left with chat icon on click chatkit-js ui component appear which calls our Backend API /api/{user_id}/chat. MUST USE RELEVENT SKILLS`

## Response snapshot

Created comprehensive implementation plan for ChatKit-FastAPI integration with the following deliverables:

### 1. Implementation Plan (plan.md)
- **Summary**: Integrate ChatKit-JS with FastAPI backend using Next.js 16 route groups
- **Technical Context**: TypeScript/Next.js 16 frontend, Python 3.11/FastAPI backend
- **Constitution Check**: All checks passed (Phase 3 - Chatbot feature)
- **Project Structure**: Detailed file organization for frontend/backend
- **Implementation Phases**: 5 phases from backend foundation to testing
- **Risk Assessment**: Identified 5 key risks with mitigation strategies

### 2. Research & Decisions (research.md)
- **5 Research Areas**: ChatKit integration, FastAPI sessions, route groups, persistence, UX
- **Key Decisions**:
  - Use (main) route group for organizing pages
  - Backend session token generation
  - Floating button bottom-left with modal overlay
  - PostgreSQL for conversation storage
  - RESTful API pattern: /api/{user_id}/chat/*
- **Technology Stack**: Detailed frontend/backend dependencies
- **Best Practices**: Security, performance, error handling, testing

### 3. Data Model (data-model.md)
- **Entities**: Conversation and Message models with SQLModel definitions
- **Database Schema**: Complete SQL DDL with indexes and constraints
- **Migration Scripts**: Alembic migration for creating tables
- **Query Patterns**: Common queries with SQLAlchemy examples
- **Performance**: Indexing strategy and scaling considerations

### 4. API Contracts (contracts/chat-api.yaml)
- **OpenAPI 3.0 Specification**: Complete API documentation
- **6 Endpoints**:
  - POST /api/{user_id}/chat/session (create ChatKit session)
  - GET /api/{user_id}/chat/conversations (list conversations)
  - POST /api/{user_id}/chat/conversations (create conversation)
  - GET /api/{user_id}/chat/conversations/{id} (get conversation with messages)
  - PATCH /api/{user_id}/chat/conversations/{id} (update conversation)
  - DELETE /api/{user_id}/chat/conversations/{id} (delete conversation)
- **Schemas**: Request/response models with validation rules
- **Security**: JWT Bearer authentication on all endpoints

### 5. Quickstart Guide (quickstart.md)
- **Prerequisites**: Node.js, Python, PostgreSQL, OpenAI API key
- **Quick Setup**: 5-minute setup instructions
- **Implementation Steps**: 6 detailed steps with code examples
- **Testing**: Backend and frontend testing procedures
- **Troubleshooting**: Common issues and solutions
- **Development Workflow**: Backend, frontend, and database workflows

### Key Implementation Details

**Frontend Architecture**:
- Route group: `app/(main)/` containing calendar, categories, dashboard, tasks
- Shared layout: `(main)/layout.tsx` with Sidebar + ChatWidget
- Components: ChatWidget (floating icon), ChatKitWrapper (ChatKit integration)
- URLs unchanged: /calendar, /categories, /dashboard, /tasks

**Backend Architecture**:
- Models: Conversation, Message (SQLModel)
- Services: ChatService (session management), ConversationService (CRUD)
- Routes: /api/{user_id}/chat/* endpoints
- Security: JWT verification, user-scoped data access

**Database Schema**:
- conversations table: id, user_id, title, timestamps, soft delete
- messages table: id, conversation_id, role, content, status, timestamp
- Indexes: user_id, conversation_id, composite indexes for performance

## Outcome

- ✅ Impact: Complete implementation plan with 5 detailed artifacts ready for /sp.tasks
- 🧪 Tests: Test strategies defined for backend (pytest) and frontend (Jest)
- 📁 Files: 5 planning artifacts created (plan, research, data-model, contracts, quickstart)
- 🔁 Next prompts: Ready for `/sp.tasks` to generate implementation tasks
- 🧠 Reflection: Plan successfully addresses user requirements for route groups, shared layout, floating chat widget, and backend API integration. All Constitution checks passed. Implementation phases clearly defined with priorities.

## Evaluation notes (flywheel)

- Failure modes observed: None - all planning artifacts generated successfully
- Graders run and results (PASS/FAIL): Constitution Check PASSED (all 8 criteria met)
- Prompt variant (if applicable): Standard /sp.plan workflow with Phase 0 research and Phase 1 design
- Next experiment (smallest change to try): Proceed to task generation with `/sp.tasks`
