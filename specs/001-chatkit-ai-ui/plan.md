# Implementation Plan: ChatKit AI Chatbot UI

**Branch**: `001-chatkit-ai-ui` | **Date**: 2026-01-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-chatkit-ai-ui/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a responsive AI chatbot interface using OpenAI ChatKit in the Next.js frontend that connects to the backend `/api/{user_id}/chat` endpoint. The interface enables users to send messages, view conversation history, and approve/reject tool actions proposed by the AI assistant. Authentication is handled via Better Auth with JWT tokens, and domain access is validated using the NEXT_PUBLIC_OPENAI_DOMAIN_KEY environment variable. The UI follows the ui-ux-designer design system for consistent, responsive design across desktop, tablet, and mobile devices.

## Technical Context

**Language/Version**: TypeScript/JavaScript with Next.js 16 (App Router)
**Primary Dependencies**: OpenAI ChatKit, Better Auth, React 19, Tailwind CSS, Next.js 16
**Storage**: Backend API persistence (conversations/messages stored in Neon PostgreSQL via backend)
**Testing**: Jest + React Testing Library for component testing, Playwright for E2E testing
**Target Platform**: Web browsers (desktop, tablet, mobile) - responsive design 320px-2560px
**Project Type**: Web application (frontend focus with backend API integration)
**Performance Goals**: <5s response time for 95% of chat requests, <2s interface load time, support 100-message conversations without degradation
**Constraints**: JWT authentication required for all API calls, domain validation via NEXT_PUBLIC_OPENAI_DOMAIN_KEY, responsive design mandatory, stateless UI (backend manages conversation state)
**Scale/Scope**: Single-user chat interface, multiple concurrent conversations per user, support for tool action confirmations, conversation history management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)? ✅ Yes - spec created first, now planning
- [x] **Phase**: Change allowed in active phase (Phase 3)? ✅ Yes - chatbot UI is Phase 3 feature
- [x] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB? ✅ Yes - Next.js 16 frontend, backend already uses FastAPI/SQLModel/Neon
- [x] **Security**: JWT verification required for all new endpoints? ✅ Yes - frontend sends JWT in Authorization header to `/api/{user_id}/chat`
- [x] **Scoping**: Data access scoped to user via `user_id` from JWT? ✅ Yes - endpoint is `/api/{user_id}/chat` and backend verifies JWT user_id matches URL
- [x] **API**: URL follows `/api/{user_id}/tasks` pattern? ✅ Yes - follows pattern with `/api/{user_id}/chat`
- [x] **Persistence**: Database access ONLY via backend API? ✅ Yes - frontend only calls backend API, no direct DB access
- [x] **Secrets**: No secrets stored on frontend? ✅ Yes - only NEXT_PUBLIC_OPENAI_DOMAIN_KEY (public env var for domain validation), JWT managed by Better Auth

**Constitution Compliance**: ✅ PASSED - All gates satisfied

## Project Structure

### Documentation (this feature)

```text
specs/001-chatkit-ai-ui/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
│   └── chat-api.md      # API contract for /api/{user_id}/chat endpoint
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
frontend/
├── app/
│   ├── chat/
│   │   ├── page.tsx                    # Main chat page (server component)
│   │   ├── [conversationId]/
│   │   │   └── page.tsx                # Specific conversation view
│   │   └── layout.tsx                  # Chat layout with auth protection
│   └── api/
│       └── chat/
│           └── route.ts                # Optional: proxy to backend if needed
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx           # Main chat container (client component)
│   │   ├── ChatInput.tsx               # Message input component
│   │   ├── ChatMessages.tsx            # Message list display
│   │   ├── ChatMessage.tsx             # Individual message component
│   │   ├── ConversationList.tsx        # Conversation history sidebar
│   │   ├── ConversationItem.tsx        # Single conversation item
│   │   ├── ToolConfirmation.tsx        # Tool action approval UI
│   │   ├── ToolCallDisplay.tsx         # Display tool call results
│   │   ├── LoadingIndicator.tsx        # Chat loading state
│   │   └── ErrorDisplay.tsx            # Error message display
│   └── ui/
│       └── [shared UI components from design system]
├── lib/
│   ├── api/
│   │   └── chat.ts                     # Chat API client functions
│   ├── hooks/
│   │   ├── useChat.ts                  # Chat state management hook
│   │   ├── useConversations.ts         # Conversation list management
│   │   └── useAuth.ts                  # Better Auth integration hook
│   ├── types/
│   │   └── chat.ts                     # TypeScript types for chat entities
│   └── utils/
│       ├── chatkit-config.ts           # ChatKit configuration
│       └── domain-validator.ts         # Domain validation logic
├── styles/
│   └── chat.css                        # Chat-specific styles (if needed beyond Tailwind)
└── tests/
    ├── components/
    │   └── chat/
    │       ├── ChatInterface.test.tsx
    │       ├── ChatInput.test.tsx
    │       └── ToolConfirmation.test.tsx
    └── e2e/
        └── chat-flow.spec.ts           # E2E tests for chat functionality

backend/
├── routes/
│   └── chat.py                         # Chat endpoint (already implemented per spec assumptions)
└── models.py                           # Conversation/Message models (already implemented)
```

**Structure Decision**: Web application structure with frontend focus. The frontend uses Next.js 16 App Router with a dedicated `/app/chat` route for the chat interface. Components are organized by feature (chat) with reusable UI components in `/components/ui`. The backend chat endpoint is assumed to already exist per spec assumptions, so backend changes are minimal or none.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations - Constitution Check passed all gates.

---

## Phase 0: Research & Unknowns

### Research Tasks

The following areas require research to resolve implementation details:

1. **ChatKit Installation & Setup**
   - How to install OpenAI ChatKit in Next.js 16 App Router
   - ChatKit configuration requirements
   - ChatKit component API and usage patterns
   - ChatKit compatibility with React 19 and Next.js 16

2. **ChatKit Integration Patterns**
   - How to integrate ChatKit with custom backend API
   - How to customize ChatKit components for tool confirmations
   - How to handle conversation history with ChatKit
   - How to style ChatKit components with Tailwind CSS and custom design system

3. **Better Auth Session Integration**
   - How to access Better Auth session in client components
   - How to attach JWT token to API requests
   - How to handle session expiration and re-authentication
   - How to protect chat routes with Better Auth

4. **Domain Validation Implementation**
   - How to implement domain allowlist validation using NEXT_PUBLIC_OPENAI_DOMAIN_KEY
   - Where to perform domain validation (client-side, server-side, or both)
   - How to handle domain validation failures

5. **UI/UX Design System Integration**
   - How to access ui-ux-designer design tokens
   - How to apply design system to ChatKit components
   - Responsive design patterns for chat interfaces
   - Mobile-specific considerations for chat UI

6. **State Management Approach**
   - Whether to use React Context, Zustand, or other state management
   - How to manage chat state (messages, conversations, loading states)
   - How to handle optimistic updates for better UX
   - How to sync state with backend

7. **Error Handling Patterns**
   - Best practices for error handling in chat interfaces
   - How to implement retry logic for failed messages
   - How to preserve unsent messages on error
   - How to display user-friendly error messages

### Research Output

See [research.md](./research.md) for detailed findings and decisions.

---

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for complete entity definitions.

**Frontend Data Model Summary**:

```typescript
// Conversation entity (frontend representation)
interface Conversation {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  messageCount: number;
}

// Message entity (frontend representation)
interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

// Tool Call entity (frontend representation)
interface ToolCall {
  id: string;
  messageId: string;
  description: string;
  parameters: Record<string, any>;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  result?: string;
  error?: string;
}

// Chat API request/response types
interface SendMessageRequest {
  message: string;
  conversationId?: string;
}

interface SendMessageResponse {
  conversationId: string;
  message: Message;
  toolCalls?: ToolCall[];
}
```

### API Contracts

See [contracts/](./contracts/) directory for complete API specifications.

**Chat API Contract Summary**:

```
POST /api/{user_id}/chat
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "message": "string",
  "conversation_id": "string | null"  // null for new conversation
}

Response (200 OK):
{
  "conversation_id": "string",
  "response": "string",
  "tool_calls": [
    {
      "id": "string",
      "description": "string",
      "parameters": {},
      "status": "pending"
    }
  ]
}

Response (401 Unauthorized):
{
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token"
}

Response (500 Internal Server Error):
{
  "error": "Internal Server Error",
  "message": "Failed to process chat message"
}
```

**Conversation History API** (if separate endpoint exists):

```
GET /api/{user_id}/conversations
Authorization: Bearer <jwt_token>

Response (200 OK):
{
  "conversations": [
    {
      "id": "string",
      "created_at": "ISO8601 timestamp",
      "updated_at": "ISO8601 timestamp",
      "last_message": "string",
      "message_count": number
    }
  ]
}
```

**Tool Action Approval API** (if separate endpoint exists):

```
POST /api/{user_id}/chat/tool-action
Authorization: Bearer <jwt_token>
Content-Type: application/json

Request:
{
  "conversation_id": "string",
  "tool_call_id": "string",
  "action": "approve" | "reject"
}

Response (200 OK):
{
  "tool_call_id": "string",
  "status": "executed" | "rejected",
  "result": "string"  // only if executed
}
```

### Implementation Phases

#### Phase 1: Core Chat Interface (P1 - User Story 1)

**Goal**: Enable basic message send/receive functionality

**Components**:
- `ChatInterface.tsx` - Main container with state management
- `ChatInput.tsx` - Message input with send button
- `ChatMessages.tsx` - Message list display
- `ChatMessage.tsx` - Individual message rendering
- `LoadingIndicator.tsx` - Loading state during AI processing

**API Integration**:
- Implement `lib/api/chat.ts` with `sendMessage()` function
- Handle JWT token attachment via Better Auth
- Parse response and update UI state

**Success Criteria**:
- User can type and send messages
- Messages appear in chat history
- AI responses display within 5 seconds
- Loading indicator shows during processing

#### Phase 2: Tool Action Confirmations (P1 - User Story 3)

**Goal**: Enable user approval/rejection of AI-proposed actions

**Components**:
- `ToolConfirmation.tsx` - Tool action approval UI
- `ToolCallDisplay.tsx` - Display tool execution results

**API Integration**:
- Implement tool action approval API calls
- Handle approve/reject actions
- Display execution results

**Success Criteria**:
- Tool actions display with clear descriptions
- User can approve or reject each action
- Results display after execution
- Rejected actions don't execute

#### Phase 3: Conversation History (P2 - User Story 2)

**Goal**: Enable viewing and switching between conversations

**Components**:
- `ConversationList.tsx` - Sidebar with conversation history
- `ConversationItem.tsx` - Individual conversation item

**API Integration**:
- Implement conversation list fetching
- Implement conversation loading by ID

**Success Criteria**:
- User sees list of previous conversations
- User can select and load conversations
- Messages load in chronological order
- New messages add to existing conversation

#### Phase 4: New Conversation (P2 - User Story 4)

**Goal**: Enable starting fresh conversations

**Components**:
- Add "New Conversation" button to UI
- Handle conversation creation flow

**API Integration**:
- Handle null conversation_id for new conversations
- Store returned conversation_id

**Success Criteria**:
- User can start new conversation
- New conversation starts empty
- First message creates conversation
- Conversations remain independent

#### Phase 5: Error Handling (P3 - User Story 5)

**Goal**: Graceful error handling and recovery

**Components**:
- `ErrorDisplay.tsx` - Error message display
- Retry logic in API client

**API Integration**:
- Implement retry logic for failed requests
- Handle network timeouts
- Handle authentication errors

**Success Criteria**:
- Errors display user-friendly messages
- Retry option available
- Unsent messages preserved
- Auth errors prompt re-authentication

#### Phase 6: Responsive Design & Polish

**Goal**: Ensure responsive design and apply design system

**Tasks**:
- Apply ui-ux-designer design tokens
- Implement responsive layouts for mobile/tablet
- Test across different screen sizes
- Optimize for touch interactions
- Add animations and transitions

**Success Criteria**:
- Works on 320px-2560px screens
- Touch-friendly on mobile
- Orientation changes handled
- Design system applied consistently

### Quickstart Guide

See [quickstart.md](./quickstart.md) for developer setup instructions.

---

## Phase 2: Task Breakdown

**Note**: Task breakdown is generated by the `/sp.tasks` command, not `/sp.plan`.

The task breakdown will be created in `tasks.md` after this planning phase is complete.

---

## Testing Strategy

### Unit Tests

**Components to Test**:
- `ChatInput.tsx` - Input validation, send button behavior
- `ChatMessage.tsx` - Message rendering, formatting
- `ToolConfirmation.tsx` - Approve/reject actions
- `ConversationList.tsx` - Conversation selection
- `ErrorDisplay.tsx` - Error message display

**API Client Tests**:
- `lib/api/chat.ts` - Request formatting, response parsing, error handling
- `lib/hooks/useChat.ts` - State management, optimistic updates
- `lib/utils/domain-validator.ts` - Domain validation logic

### Integration Tests

**Flows to Test**:
- Send message → receive response → display in chat
- Tool confirmation → approve → execute → display result
- Tool confirmation → reject → cancel action
- Load conversation history → select conversation → display messages
- Start new conversation → send message → create conversation
- Network error → display error → retry → success

### E2E Tests

**User Journeys**:
1. User logs in → opens chat → sends message → receives response
2. User sends message → AI proposes tool action → user approves → action executes
3. User views conversation history → selects conversation → continues conversation
4. User starts new conversation → sends multiple messages → switches conversations
5. User sends message → network fails → error displays → user retries → success

### Performance Tests

**Metrics to Validate**:
- Message send/receive < 5 seconds (95th percentile)
- Interface load time < 2 seconds
- 100-message conversation renders without lag
- Responsive on 320px-2560px screens

---

## Deployment Considerations

### Environment Variables

**Required**:
- `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` - Domain validation key (public)
- `BETTER_AUTH_SECRET` - Better Auth secret (private, backend only)
- `NEXT_PUBLIC_API_URL` - Backend API URL (public)

**Optional**:
- `NEXT_PUBLIC_CHATKIT_CONFIG` - ChatKit configuration overrides

### Build Configuration

**Next.js Config**:
- Ensure App Router is enabled
- Configure environment variables
- Optimize for production build

### Domain Validation

**Implementation**:
- Validate domain on app initialization
- Check NEXT_PUBLIC_OPENAI_DOMAIN_KEY matches expected value
- Prevent app from loading on unauthorized domains

---

## Risk Assessment

### High Risk

1. **ChatKit Compatibility**: ChatKit may not be compatible with Next.js 16 App Router or React 19
   - **Mitigation**: Research ChatKit compatibility early in Phase 0, have fallback plan to build custom chat UI

2. **Backend API Assumptions**: Spec assumes backend `/api/{user_id}/chat` endpoint exists and works as expected
   - **Mitigation**: Verify backend API contract early, coordinate with backend team if changes needed

### Medium Risk

1. **Performance with Large Conversations**: 100-message conversations may cause performance issues
   - **Mitigation**: Implement virtualization for message list, lazy load older messages

2. **Mobile UX Complexity**: Chat interfaces can be challenging on mobile devices
   - **Mitigation**: Prioritize mobile testing, use responsive design patterns from ui-ux-designer

### Low Risk

1. **Domain Validation Implementation**: Domain validation logic is straightforward
   - **Mitigation**: Implement early and test thoroughly

2. **Better Auth Integration**: Better Auth is already configured in the project
   - **Mitigation**: Follow existing patterns from other authenticated pages

---

## Dependencies & Blockers

### External Dependencies

- **OpenAI ChatKit**: Must be installed and configured
- **Better Auth**: Already configured, need to integrate with chat routes
- **Backend Chat API**: Must be implemented and functional
- **UI/UX Design System**: Design tokens must be available

### Potential Blockers

1. **Backend API Not Ready**: If `/api/{user_id}/chat` endpoint doesn't exist or doesn't match contract
   - **Resolution**: Coordinate with backend team, may need to implement backend first

2. **ChatKit Incompatibility**: If ChatKit doesn't work with Next.js 16/React 19
   - **Resolution**: Build custom chat UI components instead of using ChatKit

3. **Design System Not Available**: If ui-ux-designer design tokens aren't ready
   - **Resolution**: Use Tailwind defaults initially, apply design system later

---

## Success Metrics

### Functional Metrics

- ✅ All 5 user stories implemented and tested
- ✅ All 36 functional requirements satisfied
- ✅ All acceptance scenarios pass

### Performance Metrics

- ✅ 95% of messages receive response in < 5 seconds
- ✅ Interface loads in < 2 seconds
- ✅ 100-message conversations render without lag
- ✅ Responsive on 320px-2560px screens

### Quality Metrics

- ✅ 80%+ unit test coverage
- ✅ All E2E user journeys pass
- ✅ Zero critical bugs in production
- ✅ 90%+ user success rate with tool confirmations

---

## Next Steps

1. **Run `/sp.tasks`** to generate task breakdown in `tasks.md`
2. **Phase 0 Research**: Complete research.md with ChatKit, Better Auth, and design system findings
3. **Phase 1 Design**: Complete data-model.md and contracts/ with detailed specifications
4. **Implementation**: Follow phased implementation plan (P1 → P2 → P3)
5. **Testing**: Implement tests alongside features
6. **Review**: Validate against success criteria before deployment
