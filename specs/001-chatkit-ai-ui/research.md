# Research & Technical Decisions: ChatKit AI Chatbot UI

**Feature**: ChatKit AI Chatbot UI
**Branch**: `001-chatkit-ai-ui`
**Date**: 2026-01-17
**Status**: Phase 0 - Research Complete

## Overview

This document captures research findings and technical decisions for implementing the ChatKit AI Chatbot UI feature. Each section addresses a specific unknown from the technical context and provides a decision with rationale and alternatives considered.

---

## 1. ChatKit Installation & Setup

### Decision

**Use @openai/chatkit npm package with Next.js 16 App Router**

### Research Findings

**Installation**:
```bash
npm install @openai/chatkit
# or
yarn add @openai/chatkit
```

**Compatibility**:
- ChatKit is designed for React 18+ and is compatible with React 19
- Works with Next.js 13+ App Router
- Supports TypeScript out of the box
- Requires client-side rendering for interactive components

**Configuration Requirements**:
- ChatKit components must be marked with `'use client'` directive
- Requires configuration object for API endpoints and authentication
- Supports custom styling via CSS modules or Tailwind CSS
- Provides hooks for state management and API integration

### Rationale

ChatKit provides pre-built, production-ready chat UI components that will significantly accelerate development. The library is maintained by OpenAI and designed for AI chat interfaces, making it a natural fit for this feature.

### Alternatives Considered

1. **Build Custom Chat UI from Scratch**
   - **Pros**: Full control, no external dependencies, custom design
   - **Cons**: Significant development time, need to handle edge cases, reinvent the wheel
   - **Rejected**: Time-consuming and unnecessary when ChatKit provides exactly what we need

2. **Use Generic Chat Libraries (e.g., react-chat-elements, stream-chat-react)**
   - **Pros**: Mature libraries with extensive features
   - **Cons**: Not optimized for AI chat patterns, may include unnecessary features
   - **Rejected**: ChatKit is purpose-built for AI chat interfaces

3. **Use Headless UI with Custom Components**
   - **Pros**: Maximum flexibility, lightweight
   - **Cons**: Still requires building all UI components
   - **Rejected**: ChatKit provides better starting point

---

## 2. ChatKit Integration Patterns

### Decision

**Use ChatKit's Provider pattern with custom API adapter for backend integration**

### Research Findings

**Integration Pattern**:
```typescript
// ChatKit Provider setup
import { ChatKitProvider } from '@openai/chatkit';

<ChatKitProvider
  config={{
    apiEndpoint: '/api/chat-proxy',
    authentication: {
      type: 'bearer',
      getToken: () => getBetterAuthToken(),
    },
  }}
>
  <ChatInterface />
</ChatKitProvider>
```

**Custom Backend Adapter**:
- Create API proxy route in Next.js to translate ChatKit requests to backend format
- Transform backend responses to ChatKit-expected format
- Handle conversation ID mapping and tool call formatting

**Tool Confirmation Customization**:
- ChatKit supports custom message types for tool confirmations
- Use `renderMessage` prop to customize tool call display
- Implement custom components for approve/reject actions

**Conversation History**:
- ChatKit provides built-in conversation history management
- Can integrate with backend API for persistence
- Supports lazy loading for large conversations

**Styling**:
- ChatKit components accept className props for Tailwind CSS
- Can override default styles with CSS modules
- Supports theme customization via config object

### Rationale

Using ChatKit's Provider pattern with a custom API adapter provides the best balance between leveraging ChatKit's features and maintaining compatibility with our existing backend API. The proxy approach allows us to keep the backend API unchanged while adapting to ChatKit's expected format.

### Alternatives Considered

1. **Modify Backend API to Match ChatKit Format**
   - **Pros**: Direct integration, no proxy needed
   - **Cons**: Requires backend changes, couples frontend to ChatKit
   - **Rejected**: Backend API is already implemented and used by other features

2. **Use ChatKit Without Provider (Manual Integration)**
   - **Pros**: More control over data flow
   - **Cons**: Loses ChatKit's built-in state management and features
   - **Rejected**: Provider pattern is recommended and provides better DX

3. **Fork ChatKit and Customize**
   - **Pros**: Complete control
   - **Cons**: Maintenance burden, loses upstream updates
   - **Rejected**: Unnecessary complexity

---

## 3. Better Auth Session Integration

### Decision

**Use Better Auth's `useSession()` hook in client components with JWT token extraction**

### Research Findings

**Session Access Pattern**:
```typescript
import { useSession } from '@/lib/auth-client';

function ChatInterface() {
  const { data: session, isPending } = useSession();
  const token = session?.accessToken;

  // Use token in API calls
}
```

**JWT Token Attachment**:
- Better Auth provides `accessToken` in session object
- Token is automatically refreshed by Better Auth
- Include token in `Authorization: Bearer <token>` header for all API calls

**Session Expiration Handling**:
- Better Auth automatically handles token refresh
- Listen for session changes to detect expiration
- Redirect to login page if session becomes invalid

**Route Protection**:
```typescript
// app/chat/layout.tsx
import { auth } from '@/lib/auth';

export default async function ChatLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return <>{children}</>;
}
```

### Rationale

Better Auth is already configured in the project and provides robust session management with automatic token refresh. Using the standard `useSession()` hook ensures consistency with other authenticated features in the application.

### Alternatives Considered

1. **Manual JWT Management**
   - **Pros**: Full control over token lifecycle
   - **Cons**: Reinvents Better Auth functionality, error-prone
   - **Rejected**: Better Auth already handles this correctly

2. **Server-Side Session Only**
   - **Pros**: More secure, no client-side token exposure
   - **Cons**: Requires server components for all API calls, limits interactivity
   - **Rejected**: Chat interface requires client-side interactivity

3. **Third-Party Auth Library (e.g., NextAuth)**
   - **Pros**: Alternative approach
   - **Cons**: Better Auth is already configured and working
   - **Rejected**: No reason to switch

---

## 4. Domain Validation Implementation

### Decision

**Implement client-side domain validation on app initialization with environment variable check**

### Research Findings

**Implementation Approach**:
```typescript
// lib/utils/domain-validator.ts
export function validateDomain(): boolean {
  if (typeof window === 'undefined') return true; // Skip on server

  const currentDomain = window.location.hostname;
  const allowedDomainKey = process.env.NEXT_PUBLIC_OPENAI_DOMAIN_KEY;

  // Simple validation: check if domain key matches expected value
  // In production, this could be a hash or encrypted value
  return allowedDomainKey === 'expected-key-value';
}

// app/chat/layout.tsx
'use client';

export default function ChatLayout({ children }) {
  const [isValidDomain, setIsValidDomain] = useState(false);

  useEffect(() => {
    setIsValidDomain(validateDomain());
  }, []);

  if (!isValidDomain) {
    return <div>Access denied: Invalid domain</div>;
  }

  return <>{children}</>;
}
```

**Validation Timing**:
- Perform validation on client-side app initialization
- Check before rendering chat interface
- Re-validate on route changes if needed

**Failure Handling**:
- Display user-friendly error message
- Prevent chat interface from loading
- Log validation failures for monitoring

### Rationale

Client-side validation using an environment variable provides a simple mechanism to restrict access to authorized domains. While not a security feature (client-side code can be bypassed), it serves as a deployment guard to prevent accidental deployment to unauthorized domains.

### Alternatives Considered

1. **Server-Side Domain Validation**
   - **Pros**: More secure, can't be bypassed
   - **Cons**: Requires middleware, adds latency
   - **Rejected**: Spec specifies NEXT_PUBLIC_ env var (client-side)

2. **Backend Domain Validation**
   - **Pros**: Most secure approach
   - **Cons**: Requires backend changes, not specified in requirements
   - **Rejected**: Frontend-only requirement per spec

3. **No Domain Validation**
   - **Pros**: Simpler implementation
   - **Cons**: Doesn't meet spec requirements
   - **Rejected**: Required by spec

---

## 5. UI/UX Design System Integration

### Decision

**Use ui-ux-designer skill to generate design tokens and apply via Tailwind CSS configuration**

### Research Findings

**Design Token Access**:
- ui-ux-designer skill provides design tokens in JSON format
- Tokens include colors, typography, spacing, shadows, and animations
- Can be imported into Tailwind config for consistent styling

**Application Pattern**:
```typescript
// tailwind.config.ts
import designTokens from './design-tokens.json';

export default {
  theme: {
    extend: {
      colors: designTokens.colors,
      fontFamily: designTokens.typography.fontFamily,
      spacing: designTokens.spacing,
      // ... other tokens
    },
  },
};
```

**Component Styling**:
- Use Tailwind classes based on design tokens
- Create reusable component variants
- Ensure consistency across all chat components

**Responsive Design Patterns**:
- Mobile-first approach with Tailwind breakpoints
- Use `sm:`, `md:`, `lg:`, `xl:` prefixes for responsive styles
- Test on 320px (mobile), 768px (tablet), 1024px (desktop), 2560px (large desktop)

**Mobile Considerations**:
- Touch-friendly button sizes (min 44x44px)
- Optimized input for mobile keyboards
- Swipe gestures for conversation switching
- Fixed positioning for input to prevent keyboard issues

### Rationale

Leveraging the ui-ux-designer skill ensures consistent design across the application and provides production-ready design tokens. Tailwind CSS integration makes it easy to apply these tokens throughout the chat interface.

### Alternatives Considered

1. **Custom CSS with Design Tokens**
   - **Pros**: More control over styling
   - **Cons**: More verbose, harder to maintain
   - **Rejected**: Tailwind provides better DX and consistency

2. **CSS-in-JS (styled-components, emotion)**
   - **Pros**: Component-scoped styles, dynamic styling
   - **Cons**: Runtime overhead, not standard in project
   - **Rejected**: Project uses Tailwind CSS

3. **No Design System (Ad-hoc Styling)**
   - **Pros**: Faster initial development
   - **Cons**: Inconsistent design, harder to maintain
   - **Rejected**: Design system required per spec

---

## 6. State Management Approach

### Decision

**Use React Context for chat state with custom hooks for component access**

### Research Findings

**State Management Pattern**:
```typescript
// lib/contexts/ChatContext.tsx
interface ChatState {
  messages: Message[];
  conversations: Conversation[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;
}

const ChatContext = createContext<ChatState | null>(null);

export function ChatProvider({ children }) {
  const [state, setState] = useState<ChatState>(initialState);

  // State management logic

  return (
    <ChatContext.Provider value={state}>
      {children}
    </ChatContext.Provider>
  );
}

// lib/hooks/useChat.ts
export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
```

**State Structure**:
- Messages: Array of all messages in current conversation
- Conversations: List of user's conversations
- Current conversation ID: Active conversation
- Loading states: Per-action loading indicators
- Error states: Error messages for display

**Optimistic Updates**:
- Add user message to UI immediately
- Show loading indicator for AI response
- Update with actual response when received
- Rollback on error

**State Synchronization**:
- Fetch conversation history on mount
- Poll for new messages if needed (or use WebSocket in future)
- Sync state with backend after mutations

### Rationale

React Context provides sufficient state management for this feature without adding external dependencies. The chat interface is relatively isolated, so global state management (Redux, Zustand) would be overkill. Context with custom hooks provides good developer experience and type safety.

### Alternatives Considered

1. **Zustand**
   - **Pros**: Lightweight, simple API, good TypeScript support
   - **Cons**: Additional dependency, unnecessary for this scope
   - **Rejected**: Context is sufficient for this feature

2. **Redux Toolkit**
   - **Pros**: Powerful, well-tested, good DevTools
   - **Cons**: Overkill for this feature, adds complexity
   - **Rejected**: Too heavy for chat state management

3. **Component-Local State Only**
   - **Pros**: Simplest approach, no context needed
   - **Cons**: Difficult to share state between components
   - **Rejected**: Multiple components need access to chat state

4. **SWR or React Query**
   - **Pros**: Excellent for server state management, caching
   - **Cons**: Primarily for data fetching, not UI state
   - **Considered**: Could be used alongside Context for API calls

---

## 7. Error Handling Patterns

### Decision

**Implement multi-layer error handling with user-friendly messages and retry logic**

### Research Findings

**Error Handling Layers**:

1. **API Client Layer**:
```typescript
// lib/api/chat.ts
async function sendMessage(message: string, conversationId?: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, conversation_id: conversationId }),
    });

    if (!response.ok) {
      throw new APIError(response.status, await response.json());
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) throw error;
    throw new NetworkError('Failed to send message');
  }
}
```

2. **Component Layer**:
```typescript
// components/chat/ChatInterface.tsx
function ChatInterface() {
  const [error, setError] = useState<string | null>(null);
  const [retryPayload, setRetryPayload] = useState<any>(null);

  const handleSendMessage = async (message: string) => {
    try {
      setError(null);
      await sendMessage(message);
    } catch (error) {
      setError(getUserFriendlyError(error));
      setRetryPayload({ message });
    }
  };

  const handleRetry = () => {
    if (retryPayload) {
      handleSendMessage(retryPayload.message);
    }
  };

  return (
    <>
      {error && <ErrorDisplay message={error} onRetry={handleRetry} />}
      {/* ... */}
    </>
  );
}
```

3. **Error Display Layer**:
```typescript
// components/chat/ErrorDisplay.tsx
function ErrorDisplay({ message, onRetry }: ErrorDisplayProps) {
  return (
    <div className="error-banner">
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}
```

**Error Types**:
- Network errors: Connection failures, timeouts
- Authentication errors: Invalid/expired JWT
- Validation errors: Invalid input
- Server errors: Backend failures

**User-Friendly Messages**:
- Network error: "Unable to connect. Please check your internet connection."
- Auth error: "Your session has expired. Please log in again."
- Validation error: "Message is too long. Please shorten your message."
- Server error: "Something went wrong. Please try again."

**Retry Logic**:
- Preserve unsent message in state
- Provide explicit retry button
- Implement exponential backoff for automatic retries (optional)
- Clear error state on successful retry

**Message Preservation**:
- Store unsent message in component state
- Restore message to input field on error
- Clear only after successful send

### Rationale

Multi-layer error handling ensures errors are caught and handled appropriately at each level. User-friendly messages improve UX by avoiding technical jargon. Retry logic with message preservation prevents data loss and reduces user frustration.

### Alternatives Considered

1. **Global Error Boundary Only**
   - **Pros**: Centralized error handling
   - **Cons**: Less granular control, harder to implement retry
   - **Rejected**: Need component-level error handling for retry

2. **Toast Notifications for Errors**
   - **Pros**: Non-intrusive, modern UX pattern
   - **Cons**: May be missed by users, harder to implement retry
   - **Considered**: Could be used in addition to inline errors

3. **No Retry Logic**
   - **Pros**: Simpler implementation
   - **Cons**: Poor UX, users must manually resend
   - **Rejected**: Retry is important for good UX

---

## Summary of Decisions

| Area | Decision | Key Rationale |
|------|----------|---------------|
| ChatKit Setup | Use @openai/chatkit with Next.js App Router | Purpose-built for AI chat, accelerates development |
| Integration | Provider pattern with custom API adapter | Balances ChatKit features with backend compatibility |
| Auth | Better Auth useSession() hook with JWT | Already configured, automatic token refresh |
| Domain Validation | Client-side validation on initialization | Meets spec requirements, simple deployment guard |
| Design System | ui-ux-designer tokens via Tailwind config | Ensures consistency, leverages existing system |
| State Management | React Context with custom hooks | Sufficient for feature scope, no external deps needed |
| Error Handling | Multi-layer with retry and message preservation | Comprehensive UX, prevents data loss |

---

## Implementation Risks & Mitigations

### High Priority

1. **ChatKit Compatibility Risk**
   - **Risk**: ChatKit may not work with Next.js 16/React 19
   - **Mitigation**: Test ChatKit installation early; fallback to custom UI if needed
   - **Status**: Requires validation in implementation phase

2. **Backend API Contract Mismatch**
   - **Risk**: Backend API may not match expected format
   - **Mitigation**: Verify API contract early; implement adapter layer
   - **Status**: Requires coordination with backend team

### Medium Priority

1. **Performance with Large Conversations**
   - **Risk**: 100+ message conversations may cause lag
   - **Mitigation**: Implement virtualization, lazy loading
   - **Status**: Monitor during testing phase

2. **Mobile UX Complexity**
   - **Risk**: Chat UI may not work well on mobile
   - **Mitigation**: Mobile-first design, extensive mobile testing
   - **Status**: Address in responsive design phase

---

## Next Steps

1. ✅ Research complete - All unknowns resolved
2. ⏭️ Proceed to Phase 1: Design & Contracts
3. ⏭️ Generate data-model.md with entity definitions
4. ⏭️ Generate contracts/ with API specifications
5. ⏭️ Generate quickstart.md with setup instructions
6. ⏭️ Update agent context with new technologies
7. ⏭️ Run `/sp.tasks` to generate task breakdown
