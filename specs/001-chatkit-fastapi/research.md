# Research & Technology Decisions

**Feature**: ChatKit AI Chat Interface
**Date**: 2026-01-21
**Phase**: Phase 0 - Research

## Overview

This document captures research findings and technology decisions for integrating ChatKit-JS with FastAPI backend in the Todo application.

## Research Areas

### 1. ChatKit-JS Integration with Next.js 16

**Research Question**: How to integrate ChatKit-React with Next.js 16 App Router?

**Findings**:
- ChatKit-React is a client-side library that requires `'use client'` directive
- Uses `useChatKit` hook for state management and control
- Requires fetching `client_secret` from backend API
- Supports session refresh via `getClientSecret` callback
- Works seamlessly with Next.js App Router when properly marked as client component

**Decision**: Use ChatKit-React as client component with backend session management

**Rationale**:
- Official OpenAI library with full feature support
- Clean separation of concerns (frontend UI, backend security)
- Built-in session management and error handling
- Production-ready with minimal configuration

**Alternatives Considered**:
- Build custom chat UI (rejected: reinventing the wheel, time-consuming)
- Use third-party chat libraries (rejected: not optimized for OpenAI)

**Implementation Notes**:
```tsx
// Client component pattern
'use client';
import { ChatKit, useChatKit } from '@openai/chatkit-react';

const { control } = useChatKit({
  api: {
    getClientSecret: async () => {
      const res = await fetch('/api/{user_id}/chat/session');
      return (await res.json()).client_secret;
    }
  }
});
```

---

### 2. FastAPI + OpenAI ChatKit Sessions

**Research Question**: How to create and manage ChatKit sessions using OpenAI Python SDK?

**Findings**:
- OpenAI Python SDK provides `client.chatkit.sessions.create()` method
- Sessions return `client_secret` for frontend initialization
- Sessions expire after 2 hours (configurable)
- Requires `OPENAI_API_KEY` environment variable
- Session creation is synchronous but can be wrapped in async

**Decision**: Backend generates session tokens on-demand via FastAPI endpoint

**Rationale**:
- Keeps API key secure on backend
- Follows OpenAI best practices
- Allows centralized session management
- Enables rate limiting and monitoring

**Alternatives Considered**:
- Frontend direct API calls (rejected: security risk, exposes API key)
- Pre-generated session pool (rejected: complexity, session expiration issues)

**Implementation Notes**:
```python
from openai import OpenAI
import os

openai_client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def create_chatkit_session(user_id: str):
    session = openai_client.chatkit.sessions.create({
        "model": "gpt-4o-realtime-preview",
        "voice": "alloy"
    })
    return session.client_secret
```

---

### 3. Next.js 16 Route Groups

**Research Question**: How do route groups work and how to migrate existing routes?

**Findings**:
- Route groups use parentheses syntax: `(group-name)`
- Do NOT affect URL structure - purely organizational
- Allow shared layouts without changing URLs
- Can nest multiple route groups
- Existing routes can be moved without breaking links

**Decision**: Use `(main)` route group for calendar, categories, dashboard, tasks

**Rationale**:
- Maintains existing URLs (/calendar, /categories, etc.)
- Enables shared layout for Sidebar + ChatWidget
- Clean organization without URL changes
- Follows Next.js 16 best practices

**Alternatives Considered**:
- Separate layout files in each route (rejected: code duplication)
- Root layout only (rejected: can't exclude auth pages from chat widget)
- Named route groups like `(app)` (rejected: `(main)` is more descriptive)

**Implementation Notes**:
```
app/
├── (main)/
│   ├── layout.tsx        # Shared layout with Sidebar + ChatWidget
│   ├── calendar/
│   │   └── page.tsx      # Still accessible at /calendar
│   ├── dashboard/
│   │   └── page.tsx      # Still accessible at /dashboard
│   └── tasks/
│       └── page.tsx      # Still accessible at /tasks
└── (auth)/
    └── login/
        └── page.tsx      # No chat widget on auth pages
```

---

### 4. Conversation Persistence Strategy

**Research Question**: How to efficiently store and query conversation history?

**Findings**:
- PostgreSQL handles JSON and text data efficiently
- SQLModel provides clean ORM abstraction
- Soft deletes preserve data for potential recovery
- Indexing on user_id and created_at improves query performance
- Pagination recommended for conversations with 100+ messages

**Decision**: Store conversations and messages in PostgreSQL with SQLModel

**Rationale**:
- Aligns with existing tech stack (Neon PostgreSQL)
- Enables cross-device access
- Supports search and filtering
- Allows conversation history features
- Scalable for growing user base

**Alternatives Considered**:
- Client-side only (localStorage) (rejected: no cross-device sync)
- Redis for caching (rejected: not primary storage, adds complexity)
- MongoDB (rejected: not in tech stack, SQL sufficient)

**Schema Design**:
```sql
-- Conversations table
CREATE TABLE conversations (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR(200),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Messages table
CREATE TABLE messages (
    id UUID PRIMARY KEY,
    conversation_id UUID REFERENCES conversations(id),
    role VARCHAR(20),  -- 'user' or 'assistant'
    content TEXT,
    status VARCHAR(20),  -- 'sending', 'sent', 'failed'
    created_at TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
```

---

### 5. Floating Chat Widget UX

**Research Question**: What's the best UX pattern for floating chat widgets?

**Findings**:
- Bottom-right is standard for customer support chats
- Bottom-left works well for internal tools (less intrusive)
- Modal overlay provides focus without navigation
- Smooth animations improve perceived performance
- Mobile requires responsive sizing and positioning

**Decision**: Floating button bottom-left with modal overlay

**Rationale**:
- Bottom-left less common, reduces visual clutter
- Modal overlay provides focused chat experience
- Accessible from all pages without navigation
- Familiar pattern for users
- Works on mobile with responsive design

**Alternatives Considered**:
- Bottom-right (rejected: too common, may conflict with other widgets)
- Sidebar panel (rejected: takes permanent screen space)
- Full-page route (rejected: requires navigation, breaks flow)

**Implementation Notes**:
```tsx
// Floating button with icon
<button className="fixed bottom-4 left-4 z-50 rounded-full bg-blue-600 p-4 shadow-lg hover:bg-blue-700">
  <MessageCircle className="h-6 w-6 text-white" />
</button>

// Modal overlay when open
{isOpen && (
  <div className="fixed inset-0 z-50 bg-black/50">
    <div className="fixed bottom-20 left-4 h-[600px] w-[400px] rounded-lg bg-white shadow-2xl">
      <ChatKit control={control} className="h-full w-full" />
    </div>
  </div>
)}
```

---

## Technology Stack Summary

### Frontend
- **Next.js 16**: App Router with route groups
- **React 18+**: Client components for interactivity
- **TypeScript**: Type safety
- **@openai/chatkit-react**: Official ChatKit UI library
- **lucide-react**: Icon library (lightweight, tree-shakeable)
- **Tailwind CSS**: Utility-first styling

### Backend
- **Python 3.11+**: Modern Python features
- **FastAPI**: High-performance async API framework
- **SQLModel**: Type-safe ORM (Pydantic + SQLAlchemy)
- **OpenAI Python SDK**: Official OpenAI client
- **Pydantic**: Data validation
- **PostgreSQL (Neon)**: Serverless database

### Development Tools
- **npm/pnpm**: Frontend package management
- **poetry/pip**: Backend package management
- **pytest**: Backend testing
- **Jest + React Testing Library**: Frontend testing
- **ESLint + Prettier**: Code quality
- **TypeScript**: Static type checking

---

## Best Practices

### Security
1. Never expose OpenAI API key to frontend
2. Always verify JWT tokens on backend
3. Scope all data access to authenticated user
4. Validate user_id from JWT matches URL parameter
5. Implement rate limiting on session creation

### Performance
1. Lazy load ChatKit component (code splitting)
2. Implement pagination for long conversations
3. Cache session tokens with appropriate TTL
4. Use database indexes for common queries
5. Optimize bundle size with tree-shaking

### Error Handling
1. Graceful degradation when OpenAI API unavailable
2. User-friendly error messages
3. Automatic session refresh on expiration
4. Retry logic for transient failures
5. Logging for debugging and monitoring

### Testing
1. Unit tests for services and utilities
2. Integration tests for API endpoints
3. Component tests for UI interactions
4. E2E tests for critical user flows
5. Mock OpenAI API in tests

---

## Dependencies

### Frontend Dependencies
```json
{
  "@openai/chatkit-react": "^1.0.0",
  "lucide-react": "^0.300.0",
  "next": "^16.0.0",
  "react": "^18.0.0",
  "typescript": "^5.0.0"
}
```

### Backend Dependencies
```python
# pyproject.toml or requirements.txt
fastapi>=0.100.0
openai>=1.0.0
sqlmodel>=0.0.14
pydantic>=2.0.0
python-jose[cryptography]>=3.3.0  # JWT handling
```

---

## Configuration

### Environment Variables

**Backend (.env)**
```bash
OPENAI_API_KEY=sk-...
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
```

**Frontend (.env.local)**
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Migration Strategy

### Phase 1: Route Group Migration
1. Create `app/(main)` directory
2. Move calendar, categories, dashboard, tasks into (main)
3. Create `(main)/layout.tsx` with Sidebar
4. Test all routes still work at same URLs
5. Commit and deploy

### Phase 2: Backend Setup
1. Create database models
2. Run migrations
3. Implement services
4. Create API endpoints
5. Test with Postman/curl

### Phase 3: Frontend Integration
1. Install ChatKit dependencies
2. Create ChatWidget component
3. Add to (main)/layout.tsx
4. Connect to backend API
5. Test end-to-end flow

---

## Risk Mitigation

### OpenAI API Rate Limits
- **Risk**: Hitting rate limits with many concurrent users
- **Mitigation**: Implement backend rate limiting, queue requests, show user feedback

### Session Expiration
- **Risk**: Sessions expire during active conversations
- **Mitigation**: Implement automatic refresh, graceful error handling

### Route Migration Issues
- **Risk**: Breaking existing URLs or navigation
- **Mitigation**: Thorough testing, use route groups correctly, verify all links

### Performance with Large Conversations
- **Risk**: Slow loading with 100+ messages
- **Mitigation**: Implement pagination, lazy loading, optimize queries

---

## Next Steps

1. ✅ Research complete
2. → Create data-model.md with detailed schema
3. → Create API contracts (OpenAPI spec)
4. → Create quickstart.md for developers
5. → Update agent context with new technologies
6. → Generate implementation tasks with /sp.tasks
