# Implementation Plan: ChatKit AI Chat Interface

**Branch**: `001-chatkit-fastapi` | **Date**: 2026-01-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-chatkit-fastapi/spec.md`

## Summary

Integrate ChatKit-JS AI chat interface into the Todo application with FastAPI backend. The chat will be accessible via a floating icon on all main application pages (calendar, categories, dashboard, tasks). Users can interact with an AI assistant to get help with their tasks and questions. The implementation uses Next.js 16 route groups to organize pages while maintaining current URLs, and FastAPI endpoints to handle chat session management and message processing.

## Technical Context

**Language/Version**:
- Frontend: TypeScript with Next.js 16+ (App Router)
- Backend: Python 3.11+ with FastAPI

**Primary Dependencies**:
- Frontend: `@openai/chatkit-react`, `react`, `next`, `lucide-react` (for icons)
- Backend: `fastapi`, `openai`, `pydantic`, `sqlmodel`

**Storage**:
- PostgreSQL (Neon Serverless) for conversation and message persistence
- SQLModel ORM for database operations

**Testing**:
- Frontend: Jest + React Testing Library
- Backend: pytest with FastAPI TestClient

**Target Platform**:
- Web application (desktop and mobile browsers)
- Backend: Linux server (production), Windows (development)

**Project Type**: Web application (monorepo with frontend/backend)

**Performance Goals**:
- Chat interface loads in <2 seconds
- AI responses delivered in <5 seconds
- Support 100+ concurrent chat sessions
- Handle conversations with 200+ messages without performance degradation

**Constraints**:
- Must use existing JWT authentication system
- All chat data scoped to authenticated user
- OpenAI API rate limits (tier-dependent)
- Chat sessions expire after 2 hours of inactivity

**Scale/Scope**:
- Expected: 10-50 concurrent users initially
- Conversation history: unlimited retention per user
- Message size limit: 4000 characters

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)? ✅ Yes
- [x] **Phase**: Change allowed in active phase (Phase 3 - Chatbot)? ✅ Yes, chatbot features are Phase 3
- [x] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB? ✅ Yes
- [x] **Security**: JWT verification required for all new endpoints? ✅ Yes, `/api/{user_id}/chat` requires JWT
- [x] **Scoping**: Data access scoped to user via `user_id` from JWT? ✅ Yes, all conversations scoped to user
- [x] **API**: URL follows `/api/{user_id}/...` pattern? ✅ Yes, `/api/{user_id}/chat`
- [x] **Persistence**: Database access ONLY via backend API? ✅ Yes, frontend calls backend API
- [x] **Secrets**: No secrets stored on frontend? ✅ Yes, OpenAI API key only on backend

## Project Structure

### Documentation (this feature)

```text
specs/001-chatkit-fastapi/
├── plan.md              # This file
├── research.md          # Phase 0: Technology decisions and patterns
├── data-model.md        # Phase 1: Database schema for conversations/messages
├── quickstart.md        # Phase 1: Developer setup guide
├── contracts/           # Phase 1: API contracts
│   └── chat-api.yaml    # OpenAPI spec for chat endpoints
└── tasks.md             # Phase 2: Implementation tasks (created by /sp.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   ├── conversation.py      # NEW: Conversation model
│   │   └── message.py           # NEW: Message model
│   ├── services/
│   │   └── chat_service.py      # MODIFIED: Add ChatKit session management
│   ├── api/
│   │   └── routes/
│   │       └── chat.py          # MODIFIED: Add ChatKit endpoints
│   └── main.py                  # MODIFIED: Already includes chat router
└── tests/
    ├── test_chat_service.py     # NEW: Chat service tests
    └── test_chat_routes.py      # NEW: Chat API tests

frontend/
├── src/
│   ├── app/
│   │   ├── (main)/              # NEW: Route group for main app pages
│   │   │   ├── layout.tsx       # NEW: Layout with Sidebar + ChatWidget
│   │   │   ├── calendar/        # MOVED: From app/calendar
│   │   │   │   └── page.tsx
│   │   │   ├── categories/      # MOVED: From app/categories
│   │   │   │   └── page.tsx
│   │   │   ├── dashboard/       # MOVED: From app/dashboard
│   │   │   │   └── page.tsx
│   │   │   └── tasks/           # MOVED: From app/tasks
│   │   │       └── page.tsx
│   │   └── layout.tsx           # EXISTING: Root layout
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWidget.tsx   # NEW: Floating chat icon + ChatKit UI
│   │   │   └── ChatKitWrapper.tsx # NEW: ChatKit integration wrapper
│   │   └── Sidebar.tsx          # EXISTING: Sidebar component
│   └── lib/
│       └── chatkit.ts           # NEW: ChatKit configuration and API client
└── tests/
    └── components/
        └── chat/
            └── ChatWidget.test.tsx # NEW: Chat widget tests
```

**Structure Decision**: Web application structure with monorepo. Using Next.js 16 route groups `(main)` to organize pages without affecting URLs. The route group allows shared layout for Sidebar and ChatWidget across all main application pages while maintaining current routing structure (/calendar, /categories, /dashboard, /tasks).

## Complexity Tracking

No Constitution violations. All requirements align with Phase 3 (Chatbot) and follow established patterns.

## Phase 0: Research & Decisions

### Research Topics

1. **ChatKit-JS Integration Patterns**
   - How to integrate ChatKit-React with Next.js 16 App Router
   - Client-side vs server-side session management
   - Best practices for floating chat widgets

2. **FastAPI + OpenAI ChatKit Sessions**
   - How to create and manage ChatKit sessions using OpenAI Python SDK
   - Session token generation and refresh patterns
   - Error handling for OpenAI API failures

3. **Next.js Route Groups**
   - How route groups work in Next.js 16 App Router
   - Layout composition with route groups
   - Moving existing routes without breaking URLs

4. **Conversation Persistence**
   - Database schema for conversations and messages
   - Efficient querying for conversation history
   - Handling long conversation threads

5. **Real-time Chat UX**
   - Floating widget positioning and animations
   - Loading states and error handling
   - Mobile responsiveness for chat interface

### Key Decisions

**Decision 1: Route Group Structure**
- **Choice**: Use `(main)` route group for calendar, categories, dashboard, tasks
- **Rationale**: Route groups in Next.js don16 don't affect URLs but allow shared layouts
- **Alternative**: Separate layout files in each route (rejected: code duplication)

**Decision 2: ChatKit Session Management**
- **Choice**: Backend generates session tokens, frontend fetches on-demand
- **Rationale**: Keeps OpenAI API key secure, follows ChatKit best practices
- **Alternative**: Direct OpenAI API calls from frontend (rejected: security risk)

**Decision 3: Chat Widget Implementation**
- **Choice**: Floating button + modal overlay with ChatKit component
- **Rationale**: Non-intrusive, accessible from all pages, familiar UX pattern
- **Alternative**: Sidebar panel (rejected: takes up screen space)

**Decision 4: Conversation Storage**
- **Choice**: Store conversations and messages in PostgreSQL
- **Rationale**: Enables history, search, and multi-device access
- **Alternative**: Client-side only storage (rejected: no cross-device sync)

**Decision 5: API Endpoint Pattern**
- **Choice**: `/api/{user_id}/chat/session` and `/api/{user_id}/chat/conversations`
- **Rationale**: Follows existing API patterns, user-scoped, RESTful
- **Alternative**: `/api/chat` with user from JWT only (rejected: less explicit)

## Phase 1: Design & Contracts

### Data Model

**Conversation Entity**
```
Conversation:
  - id: UUID (primary key)
  - user_id: UUID (foreign key to User)
  - title: String (max 200 chars)
  - created_at: DateTime
  - updated_at: DateTime
  - deleted_at: DateTime (nullable, soft delete)
```

**Message Entity**
```
Message:
  - id: UUID (primary key)
  - conversation_id: UUID (foreign key to Conversation)
  - role: Enum('user', 'assistant')
  - content: Text (max 4000 chars)
  - status: Enum('sending', 'sent', 'failed')
  - created_at: DateTime
```

**Relationships**
- User has many Conversations (one-to-many)
- Conversation has many Messages (one-to-many)
- Messages are ordered by created_at within a conversation

### API Contracts

**Endpoint 1: Create ChatKit Session**
```
POST /api/{user_id}/chat/session
Authorization: Bearer <jwt_token>

Response 200:
{
  "client_secret": "string"
}

Response 401: Unauthorized
Response 500: Session creation failed
```

**Endpoint 2: List Conversations**
```
GET /api/{user_id}/chat/conversations
Authorization: Bearer <jwt_token>

Response 200:
{
  "conversations": [
    {
      "id": "uuid",
      "title": "string",
      "created_at": "datetime",
      "updated_at": "datetime",
      "message_count": "integer"
    }
  ]
}
```

**Endpoint 3: Get Conversation Messages**
```
GET /api/{user_id}/chat/conversations/{conversation_id}
Authorization: Bearer <jwt_token>

Response 200:
{
  "conversation": {
    "id": "uuid",
    "title": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  },
  "messages": [
    {
      "id": "uuid",
      "role": "user|assistant",
      "content": "string",
      "created_at": "datetime"
    }
  ]
}

Response 404: Conversation not found
```

**Endpoint 4: Create Conversation**
```
POST /api/{user_id}/chat/conversations
Authorization: Bearer <jwt_token>

Request:
{
  "title": "string"
}

Response 201:
{
  "id": "uuid",
  "title": "string",
  "created_at": "datetime"
}
```

**Endpoint 5: Update Conversation**
```
PATCH /api/{user_id}/chat/conversations/{conversation_id}
Authorization: Bearer <jwt_token>

Request:
{
  "title": "string"
}

Response 200:
{
  "id": "uuid",
  "title": "string",
  "updated_at": "datetime"
}
```

**Endpoint 6: Delete Conversation**
```
DELETE /api/{user_id}/chat/conversations/{conversation_id}
Authorization: Bearer <jwt_token>

Response 204: No Content
Response 404: Conversation not found
```

### Component Architecture

**Frontend Components**

1. **ChatWidget** (Client Component)
   - Floating chat icon button (bottom-left)
   - Toggle chat interface visibility
   - Manages open/closed state
   - Renders ChatKitWrapper when open

2. **ChatKitWrapper** (Client Component)
   - Integrates @openai/chatkit-react
   - Fetches client_secret from backend
   - Handles session refresh
   - Manages conversation state
   - Error handling and loading states

3. **(main)/layout.tsx** (Server Component)
   - Renders Sidebar
   - Renders ChatWidget
   - Provides shared layout for all main routes

**Backend Services**

1. **ChatService**
   - `create_session(user_id)`: Creates OpenAI ChatKit session
   - `refresh_session(user_id)`: Refreshes expired session
   - Handles OpenAI API errors

2. **ConversationService**
   - `list_conversations(user_id)`: Get user's conversations
   - `get_conversation(user_id, conversation_id)`: Get conversation with messages
   - `create_conversation(user_id, title)`: Create new conversation
   - `update_conversation(user_id, conversation_id, title)`: Update conversation
   - `delete_conversation(user_id, conversation_id)`: Soft delete conversation

### Technology Stack

**Frontend**
- Next.js 16 (App Router)
- React 18+
- TypeScript
- @openai/chatkit-react (ChatKit UI library)
- lucide-react (icons)
- Tailwind CSS (styling)

**Backend**
- Python 3.11+
- FastAPI
- SQLModel (ORM)
- OpenAI Python SDK
- Pydantic (validation)
- PostgreSQL (Neon)

**Development Tools**
- npm/pnpm (frontend package management)
- poetry/pip (backend package management)
- pytest (backend testing)
- Jest + React Testing Library (frontend testing)

## Implementation Phases

### Phase 1: Backend Foundation (Priority: P1)
1. Create database models (Conversation, Message)
2. Implement ChatService for session management
3. Implement ConversationService for CRUD operations
4. Create API endpoints for chat functionality
5. Add tests for services and endpoints

### Phase 2: Frontend Structure (Priority: P1)
1. Create (main) route group
2. Move existing routes into (main) group
3. Create (main)/layout.tsx with Sidebar
4. Verify existing routes still work at same URLs

### Phase 3: ChatKit Integration (Priority: P1)
1. Install @openai/chatkit-react
2. Create ChatKitWrapper component
3. Create ChatWidget component (floating icon)
4. Integrate ChatWidget into (main)/layout.tsx
5. Connect to backend API for session management

### Phase 4: Conversation Management (Priority: P2)
1. Implement conversation list UI
2. Implement conversation switching
3. Implement conversation creation
4. Implement conversation renaming
5. Implement conversation deletion

### Phase 5: Testing & Polish (Priority: P3)
1. Add frontend component tests
2. Add backend integration tests
3. Test error scenarios (network failures, API errors)
4. Mobile responsiveness testing
5. Performance optimization

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| OpenAI API rate limits | High | Implement rate limiting, caching, error handling |
| ChatKit session expiration | Medium | Implement automatic session refresh |
| Route migration breaks URLs | High | Test all routes after migration, use route groups correctly |
| Large conversation performance | Medium | Implement pagination, lazy loading |
| Mobile chat UX issues | Medium | Test on mobile devices, responsive design |

## Success Metrics

- All existing routes accessible at same URLs after migration
- Chat widget loads in <2 seconds
- AI responses delivered in <5 seconds
- 95%+ message delivery success rate
- Zero security vulnerabilities (JWT verification working)
- Mobile-responsive chat interface

## Next Steps

1. Run `/sp.tasks` to generate implementation tasks
2. Begin Phase 1: Backend Foundation
3. Test each phase before proceeding to next
4. Deploy to staging for user testing after Phase 3
