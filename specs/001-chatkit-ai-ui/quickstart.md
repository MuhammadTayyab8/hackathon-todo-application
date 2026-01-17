# Quickstart Guide: ChatKit AI Chatbot UI

**Feature**: ChatKit AI Chatbot UI
**Branch**: `001-chatkit-ai-ui`
**Date**: 2026-01-17

## Overview

This guide provides step-by-step instructions for setting up and developing the ChatKit AI Chatbot UI feature. Follow these instructions to get the development environment ready and start implementing the chat interface.

---

## Prerequisites

Before starting, ensure you have:

- **Node.js**: Version 18+ installed
- **npm or yarn**: Package manager
- **Git**: For version control
- **Better Auth**: Already configured in the project
- **Backend API**: `/api/{user_id}/chat` endpoint available (or ready to implement)
- **Code Editor**: VS Code recommended with TypeScript support

---

## Initial Setup

### 1. Checkout Feature Branch

```bash
# Ensure you're on the correct branch
git checkout 001-chatkit-ai-ui

# Pull latest changes
git pull origin 001-chatkit-ai-ui
```

### 2. Install Dependencies

```bash
# Navigate to frontend directory
cd frontend

# Install OpenAI ChatKit
npm install @openai/chatkit

# Install additional dependencies (if needed)
npm install

# Verify installation
npm list @openai/chatkit
```

### 3. Configure Environment Variables

Create or update `.env.local` in the frontend directory:

```bash
# Frontend environment variables
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_OPENAI_DOMAIN_KEY=your-domain-key-here

# Better Auth (should already be configured)
BETTER_AUTH_SECRET=your-secret-here
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000
```

**Important**:
- `NEXT_PUBLIC_OPENAI_DOMAIN_KEY` is used for domain validation
- Replace `your-domain-key-here` with actual key from project configuration
- Never commit `.env.local` to version control

### 4. Verify Backend API

Ensure the backend chat endpoint is available:

```bash
# Start backend server (in separate terminal)
cd backend
uvicorn main:app --reload --port 8000

# Test endpoint (requires authentication)
curl -X POST http://localhost:8000/api/{user_id}/chat \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello", "conversation_id": null}'
```

If the endpoint doesn't exist, coordinate with backend team or implement it first.

---

## Project Structure Setup

### 1. Create Directory Structure

```bash
# From frontend directory
mkdir -p app/chat/[conversationId]
mkdir -p components/chat
mkdir -p lib/api
mkdir -p lib/hooks
mkdir -p lib/types
mkdir -p lib/utils
mkdir -p lib/contexts
mkdir -p tests/components/chat
mkdir -p tests/e2e
```

### 2. Create Type Definitions

Create `frontend/lib/types/chat.ts`:

```typescript
// Copy type definitions from data-model.md
export interface Conversation {
  id: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  lastMessage?: string;
  messageCount: number;
}

export interface Message {
  id: string;
  conversationId: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: ToolCall[];
}

export type ToolCallStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'failed';

export interface ToolCall {
  id: string;
  messageId: string;
  description: string;
  parameters: Record<string, any>;
  status: ToolCallStatus;
  result?: string;
  error?: string;
}

// API types
export interface SendMessageRequest {
  message: string;
  conversation_id?: string | null;
}

export interface SendMessageResponse {
  conversation_id: string;
  response: string;
  tool_calls?: ToolCall[];
}

export interface ChatState {
  currentConversationId: string | null;
  messages: Message[];
  conversations: Conversation[];
  isLoading: boolean;
  isSending: boolean;
  isLoadingHistory: boolean;
  error: string | null;
  unsentMessage: string | null;
}
```

---

## Development Workflow

### Phase 1: Core Chat Interface (P1)

**Goal**: Implement basic message send/receive functionality

#### Step 1: Create API Client

Create `frontend/lib/api/chat.ts`:

```typescript
import { SendMessageRequest, SendMessageResponse } from '@/lib/types/chat';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function sendMessage(
  userId: string,
  token: string,
  request: SendMessageRequest
): Promise<SendMessageResponse> {
  const response = await fetch(`${API_URL}/api/${userId}/chat`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new Error(`Failed to send message: ${response.statusText}`);
  }

  return response.json();
}

// Add more API functions as needed
```

#### Step 2: Create Chat Context

Create `frontend/lib/contexts/ChatContext.tsx`:

```typescript
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { ChatState, Message, Conversation } from '@/lib/types/chat';

const ChatContext = createContext<ChatState | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ChatState>({
    currentConversationId: null,
    messages: [],
    conversations: [],
    isLoading: false,
    isSending: false,
    isLoadingHistory: false,
    error: null,
    unsentMessage: null,
  });

  // Add state management logic here

  return (
    <ChatContext.Provider value={state}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
}
```

#### Step 3: Create Chat Components

Create `frontend/components/chat/ChatInterface.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useSession } from '@/lib/auth-client';
import { useChat } from '@/lib/contexts/ChatContext';
import ChatInput from './ChatInput';
import ChatMessages from './ChatMessages';
import LoadingIndicator from './LoadingIndicator';
import ErrorDisplay from './ErrorDisplay';

export default function ChatInterface() {
  const { data: session } = useSession();
  const { messages, isLoading, error } = useChat();

  if (!session) {
    return <div>Please log in to use chat</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto">
        <ChatMessages messages={messages} />
      </div>

      {error && <ErrorDisplay message={error} />}

      <div className="border-t p-4">
        <ChatInput disabled={isLoading} />
      </div>

      {isLoading && <LoadingIndicator />}
    </div>
  );
}
```

#### Step 4: Create Chat Page

Create `frontend/app/chat/page.tsx`:

```typescript
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ChatInterface from '@/components/chat/ChatInterface';

export default async function ChatPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <main className="container mx-auto">
      <h1 className="text-2xl font-bold p-4">AI Assistant</h1>
      <ChatInterface />
    </main>
  );
}
```

#### Step 5: Test Basic Functionality

```bash
# Start development server
npm run dev

# Open browser
open http://localhost:3000/chat

# Test:
# 1. Login with Better Auth
# 2. Navigate to /chat
# 3. Send a message
# 4. Verify response appears
```

---

### Phase 2: Tool Action Confirmations (P1)

**Goal**: Implement tool approval/rejection UI

#### Step 1: Create ToolConfirmation Component

Create `frontend/components/chat/ToolConfirmation.tsx`:

```typescript
'use client';

import { ToolCall } from '@/lib/types/chat';

interface ToolConfirmationProps {
  toolCall: ToolCall;
  onApprove: (toolCallId: string) => void;
  onReject: (toolCallId: string) => void;
}

export default function ToolConfirmation({
  toolCall,
  onApprove,
  onReject,
}: ToolConfirmationProps) {
  return (
    <div className="border rounded-lg p-4 my-2 bg-blue-50">
      <p className="font-semibold">Proposed Action:</p>
      <p className="my-2">{toolCall.description}</p>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => onApprove(toolCall.id)}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Approve
        </button>
        <button
          onClick={() => onReject(toolCall.id)}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reject
        </button>
      </div>
    </div>
  );
}
```

#### Step 2: Integrate Tool Confirmations

Update `ChatMessages.tsx` to display tool confirmations when present.

---

### Phase 3: Conversation History (P2)

**Goal**: Implement conversation list and switching

#### Step 1: Create ConversationList Component

Create `frontend/components/chat/ConversationList.tsx`:

```typescript
'use client';

import { Conversation } from '@/lib/types/chat';
import ConversationItem from './ConversationItem';

interface ConversationListProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
}

export default function ConversationList({
  conversations,
  currentConversationId,
  onSelectConversation,
}: ConversationListProps) {
  return (
    <div className="w-64 border-r h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Conversations</h2>
        {conversations.map((conversation) => (
          <ConversationItem
            key={conversation.id}
            conversation={conversation}
            isActive={conversation.id === currentConversationId}
            onClick={() => onSelectConversation(conversation.id)}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## Testing

### Unit Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

### E2E Tests

```bash
# Install Playwright (if not already installed)
npx playwright install

# Run E2E tests
npm run test:e2e

# Run E2E tests in UI mode
npm run test:e2e -- --ui
```

---

## Common Issues & Solutions

### Issue: ChatKit Not Found

**Error**: `Cannot find module '@openai/chatkit'`

**Solution**:
```bash
npm install @openai/chatkit
# or
yarn add @openai/chatkit
```

### Issue: Authentication Errors

**Error**: `401 Unauthorized`

**Solution**:
- Verify Better Auth is configured correctly
- Check JWT token is being sent in Authorization header
- Verify user_id in URL matches JWT user_id

### Issue: CORS Errors

**Error**: `CORS policy: No 'Access-Control-Allow-Origin' header`

**Solution**:
- Configure CORS in backend FastAPI app
- Add frontend URL to allowed origins

### Issue: Environment Variables Not Loading

**Error**: `process.env.NEXT_PUBLIC_API_URL is undefined`

**Solution**:
- Ensure `.env.local` exists in frontend directory
- Restart development server after changing env vars
- Verify variable names start with `NEXT_PUBLIC_` for client-side access

---

## Development Tips

### 1. Use TypeScript Strictly

Enable strict mode in `tsconfig.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

### 2. Use React DevTools

Install React DevTools browser extension for debugging component state.

### 3. Use Network Tab

Monitor API requests in browser DevTools Network tab to debug API issues.

### 4. Use Console Logging Strategically

Add logging for debugging but remove before committing:
```typescript
console.log('[ChatInterface] Sending message:', message);
```

### 5. Follow Component Patterns

- Server components by default
- Client components only when needed (`'use client'`)
- Keep components small and focused
- Extract reusable logic into hooks

---

## Code Style Guidelines

### Component Structure

```typescript
// 1. Imports
import { useState } from 'react';
import { useSession } from '@/lib/auth-client';

// 2. Types/Interfaces
interface ComponentProps {
  // ...
}

// 3. Component
export default function Component({ prop }: ComponentProps) {
  // 4. Hooks
  const [state, setState] = useState();

  // 5. Event handlers
  const handleClick = () => {
    // ...
  };

  // 6. Render
  return (
    <div>
      {/* ... */}
    </div>
  );
}
```

### Naming Conventions

- Components: PascalCase (`ChatInterface.tsx`)
- Hooks: camelCase with `use` prefix (`useChat.ts`)
- Utilities: camelCase (`formatDate.ts`)
- Types: PascalCase (`Message`, `ToolCall`)
- Constants: UPPER_SNAKE_CASE (`API_URL`)

---

## Next Steps

1. ✅ Setup complete
2. ⏭️ Implement Phase 1: Core Chat Interface
3. ⏭️ Implement Phase 2: Tool Confirmations
4. ⏭️ Implement Phase 3: Conversation History
5. ⏭️ Implement Phase 4: New Conversation
6. ⏭️ Implement Phase 5: Error Handling
7. ⏭️ Implement Phase 6: Responsive Design
8. ⏭️ Write tests
9. ⏭️ Review and polish

---

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [OpenAI ChatKit Documentation](https://platform.openai.com/docs/chatkit)
- [Better Auth Documentation](https://better-auth.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)

---

## Getting Help

If you encounter issues:

1. Check this quickstart guide
2. Review the [research.md](./research.md) for technical decisions
3. Review the [data-model.md](./data-model.md) for entity definitions
4. Review the [contracts/chat-api.md](./contracts/chat-api.md) for API details
5. Ask the team in project chat
6. Create an issue in the repository

---

**Last Updated**: 2026-01-17
**Maintainer**: Development Team
