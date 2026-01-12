---
name: chatkit
description: Build production-ready AI chat interfaces with ChatKit. Drop-in chat solution with customizable themes, widgets, and advanced conversational features.
allowed-tools: Read, Bash(npm:*, node:*), Grep
---

# ChatKit Development Guide

## Overview
ChatKit is a framework-agnostic, drop-in chat solution for building high-quality, AI-powered chat experiences. It delivers a complete, production-ready chat interface out of the box with minimal setup—no need to build custom UIs or manage low-level chat state.

## Key Features
- **Complete UI**: Production-ready chat interface with no custom UI needed
- **Session Management**: Automatic token handling and refresh
- **Theming**: Extensive customization options for colors, typography, and layout
- **Widgets**: Interactive components within chat messages
- **Entity Handling**: Tag search and preview support
- **History Management**: Built-in conversation history with delete/rename
- **Framework Agnostic**: Works with React, Vue, vanilla JS, and more

## Instructions

### 1. Installation

#### React
```bash
npm install @openai/chatkit-react
# or
yarn add @openai/chatkit-react
# or
pnpm add @openai/chatkit-react
```

#### Vanilla JavaScript
```bash
npm install @openai/chatkit
```

### 2. Basic Setup (React)

Create a simple chat component with session management:

```tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function MyChat() {
  const { control } = useChatKit({
    api: {
      async getClientSecret(existing) {
        if (existing) {
          // Implement session refresh if needed
          const res = await fetch('/api/chatkit/refresh', {
            method: 'POST',
            body: JSON.stringify({ token: existing }),
            headers: { 'Content-Type': 'application/json' },
          });
          const { client_secret } = await res.json();
          return client_secret;
        }

        // Create new session
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        const { client_secret } = await res.json();
        return client_secret;
      },
    },
  });

  return <ChatKit control={control} className="h-[600px] w-[320px]" />;
}
```

### 3. Backend Session Endpoint

Create an API endpoint to generate client secrets:

```typescript
// Next.js API route example
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  // Generate client secret from your backend
  // This should call OpenAI's API to create a session
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: 'alloy',
    }),
  });

  const data = await response.json();
  return NextResponse.json({ client_secret: data.client_secret });
}
```

### 4. Using Client Token (Simpler Alternative)

For simpler use cases, use a client token directly:

```tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function SimpleChat({ clientToken }: { clientToken: string }) {
  const { control } = useChatKit({
    api: { clientToken },
  });

  return <ChatKit control={control} className="h-[600px]" />;
}
```

### 5. Theme Customization

Customize the visual appearance extensively:

```tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

function ThemedChat() {
  const { control } = useChatKit({
    api: {
      getClientSecret: async () => {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    theme: {
      colorScheme: 'light', // 'light' | 'dark'
      typography: {
        baseSize: 16,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontFamilyMono: 'JetBrains Mono, monospace',
        fontSources: [
          {
            family: 'Inter',
            src: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700',
            weight: '400 700',
            display: 'swap',
          },
        ],
      },
      radius: 'soft', // 'none' | 'soft' | 'round'
      density: 'normal', // 'compact' | 'normal' | 'spacious'
      color: {
        accent: {
          primary: '#3b82f6',
          level: 2, // 1-5, controls shade variation
        },
        grayscale: {
          hue: 220,
          tint: 5,
          shade: 0,
        },
        surface: {
          background: '#ffffff',
          foreground: '#1f2937',
        },
      },
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```

### 6. Header Configuration

Customize the header with title and action buttons:

```tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useState } from 'react';

function ChatWithHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { control } = useChatKit({
    api: {
      getClientSecret: async () => {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    header: {
      enabled: true,
      title: {
        enabled: true,
        text: 'AI Support Assistant',
      },
      leftAction: {
        icon: isSidebarOpen ? 'sidebar-open-left' : 'sidebar-left',
        onClick: () => setIsSidebarOpen(!isSidebarOpen),
      },
      rightAction: {
        icon: 'settings-cog',
        onClick: () => {
          window.location.href = '/settings';
        },
      },
    },
    history: {
      enabled: true,
      showDelete: true,
      showRename: true,
    },
  });

  return (
    <div className="flex">
      {isSidebarOpen && <div className="sidebar w-64">Sidebar content</div>}
      <ChatKit control={control} className="flex-1 h-screen" />
    </div>
  );
}
```

### 7. Composer Customization

Customize the message input area:

```tsx
const { control } = useChatKit({
  api: { clientToken },
  composer: {
    placeholder: 'Type your message here...',
    tools: [
      { id: 'rate', label: 'Rate', icon: 'star', pinned: true },
      { id: 'feedback', label: 'Feedback', icon: 'message-circle' },
    ],
  },
});
```

### 8. Start Screen Configuration

Customize the initial screen with greeting and prompts:

```tsx
const { control } = useChatKit({
  api: { clientToken },
  startScreen: {
    greeting: 'Welcome to FeedbackBot!',
    prompts: [
      { name: 'Bug Report', prompt: 'Report a bug', icon: 'bolt' },
      { name: 'Feature Request', prompt: 'Request a feature', icon: 'lightbulb' },
      { name: 'General Feedback', prompt: 'Share feedback', icon: 'message-circle' },
    ],
  },
});
```

### 9. Entity Handling (Tags and Previews)

Implement tag search and entity previews:

```tsx
const { control } = useChatKit({
  api: { clientToken },
  entities: {
    onTagSearch: async (query) => {
      // Search for entities (users, documents, etc.)
      const results = await fetch(`/api/search?q=${query}`).then(r => r.json());
      return results.map(item => ({
        id: item.id,
        title: item.name,
      }));
    },
    onRequestPreview: async (entity) => {
      // Fetch and return entity preview
      const details = await fetch(`/api/entity/${entity.id}`).then(r => r.json());
      return {
        preview: {
          type: 'Card',
          children: [
            { type: 'Text', value: `Name: ${details.name}` },
            { type: 'Text', value: `Role: ${details.role}` },
            { type: 'Text', value: `Email: ${details.email}` },
          ],
        },
      };
    },
  },
});
```

### 10. Widgets and Custom Actions

Handle interactive widgets within chat messages:

```tsx
import { ChatKit, useChatKit, type Widgets } from '@openai/chatkit-react';

function ChatWithWidgets() {
  const { control } = useChatKit({
    api: {
      getClientSecret: async () => {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
    widgets: {
      onAction: async (action, widgetItem) => {
        console.log('Widget action triggered:', action);

        switch (action.type) {
          case 'approve_request':
            // Handle locally
            await fetch('/api/requests/approve', {
              method: 'POST',
              body: JSON.stringify({
                requestId: action.payload?.requestId,
              }),
              headers: { 'Content-Type': 'application/json' },
            });

            // Notify server to update widget
            await control.ref.current?.sendCustomAction(
              {
                type: 'request_approved',
                payload: action.payload,
              },
              widgetItem.id,
            );
            break;

          case 'select_option':
            // Send selection back to server
            await control.ref.current?.sendCustomAction(action, widgetItem.id);
            break;

          case 'open_details':
            // Client-only action
            window.open(`/details/${action.payload?.id}`, '_blank');
            break;
        }
      },
    },
  });

  return <ChatKit control={control} className="h-[700px] w-[500px]" />;
}
```

### 11. Imperative Methods

Use imperative methods to control ChatKit programmatically:

```tsx
import { ChatKit, useChatKit } from '@openai/chatkit-react';

export function ControlledChat() {
  const {
    control,
    focusComposer,
    setThreadId,
    sendUserMessage,
    setComposerValue,
    fetchUpdates,
    sendCustomAction,
  } = useChatKit({ api: { clientToken } });

  const handleSendMessage = () => {
    sendUserMessage('Hello from button!');
  };

  const handleSwitchThread = (threadId: string) => {
    setThreadId(threadId);
  };

  const handleFocus = () => {
    focusComposer();
  };

  const handlePrefill = () => {
    setComposerValue('Pre-filled message');
    focusComposer();
  };

  return (
    <div>
      <div className="controls mb-4 space-x-2">
        <button onClick={handleSendMessage}>Send Message</button>
        <button onClick={handleFocus}>Focus Composer</button>
        <button onClick={handlePrefill}>Prefill Message</button>
        <button onClick={() => handleSwitchThread('thread-123')}>
          Switch Thread
        </button>
      </div>
      <ChatKit control={control} className="h-[600px]" />
    </div>
  );
}
```

### 12. Event Handlers

Handle various events from ChatKit:

```tsx
const { control } = useChatKit({
  api: { clientToken },
  onError: ({ error }) => {
    console.error('ChatKit error:', error);
    // Show error notification to user
    toast.error(`Chat error: ${error.message}`);
  },
  onThreadChange: ({ threadId }) => {
    console.log('Thread changed to:', threadId);
    // Save to localStorage or sync with backend
    localStorage.setItem('lastThreadId', threadId || '');
  },
  onMessageSent: ({ message }) => {
    console.log('Message sent:', message);
    // Track analytics
    analytics.track('message_sent', { messageId: message.id });
  },
});
```

### 13. Locale and Internationalization

Set the locale for internationalization:

```tsx
const { control } = useChatKit({
  api: { clientToken },
  locale: 'en', // 'en' | 'es' | 'fr' | 'de' | 'ja' | etc.
});
```

### 14. Vanilla JavaScript Usage

Use ChatKit without React:

```javascript
import { ChatKit } from '@openai/chatkit';

const chatkit = new ChatKit({
  api: {
    getClientSecret: async (existing) => {
      const res = await fetch('/api/chatkit/session', { method: 'POST' });
      const { client_secret } = await res.json();
      return client_secret;
    },
  },
  theme: {
    colorScheme: 'dark',
  },
});

// Mount to DOM element
const container = document.getElementById('chat-container');
chatkit.mount(container);

// Use imperative methods
chatkit.sendUserMessage('Hello!');
chatkit.setThreadId('thread-123');
```

## Best Practices

### 1. Session Management
- Always implement token refresh logic for long-running sessions
- Store session state securely (avoid localStorage for sensitive data)
- Handle session expiration gracefully

```tsx
async getClientSecret(existing) {
  if (existing) {
    try {
      // Try to refresh
      const res = await fetch('/api/chatkit/refresh', {
        method: 'POST',
        body: JSON.stringify({ token: existing }),
      });
      if (res.ok) {
        return (await res.json()).client_secret;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }

  // Create new session
  const res = await fetch('/api/chatkit/session', { method: 'POST' });
  return (await res.json()).client_secret;
}
```

### 2. Error Handling
- Always implement onError handler
- Provide user-friendly error messages
- Log errors for debugging

```tsx
onError: ({ error }) => {
  // Log to monitoring service
  Sentry.captureException(error);

  // Show user-friendly message
  if (error.code === 'NETWORK_ERROR') {
    toast.error('Connection lost. Please check your internet.');
  } else {
    toast.error('Something went wrong. Please try again.');
  }
}
```

### 3. Performance Optimization
- Use appropriate container sizes (avoid full viewport if not needed)
- Implement lazy loading for entity previews
- Debounce tag search queries

```tsx
entities: {
  onTagSearch: debounce(async (query) => {
    if (query.length < 2) return [];
    return await searchEntities(query);
  }, 300),
}
```

### 4. Accessibility
- Ensure proper contrast ratios in custom themes
- Test keyboard navigation
- Provide meaningful aria-labels for custom actions

### 5. Security
- Never expose API keys in client-side code
- Always generate client secrets server-side
- Validate and sanitize user input in custom actions
- Implement rate limiting on session endpoints

## Common Patterns

### Pattern 1: Customer Support Chat
```tsx
function SupportChat() {
  const { control } = useChatKit({
    api: { getClientSecret: fetchClientSecret },
    theme: {
      colorScheme: 'light',
      color: { accent: { primary: '#0066cc' } },
    },
    header: {
      enabled: true,
      title: { text: 'Customer Support' },
      rightAction: {
        icon: 'phone',
        onClick: () => initiateVoiceCall(),
      },
    },
    startScreen: {
      greeting: 'How can we help you today?',
      prompts: [
        { name: 'Order Status', prompt: 'Check my order status', icon: 'package' },
        { name: 'Returns', prompt: 'Start a return', icon: 'arrow-left' },
        { name: 'Technical Issue', prompt: 'Report a technical issue', icon: 'tool' },
      ],
    },
    entities: {
      onTagSearch: async (query) => {
        // Search orders, products, etc.
        return await searchCustomerData(query);
      },
    },
  });

  return <ChatKit control={control} className="h-[700px] w-[400px]" />;
}
```

### Pattern 2: Internal Tool with History
```tsx
function InternalChat() {
  const { control } = useChatKit({
    api: { getClientSecret: fetchClientSecret },
    theme: { colorScheme: 'dark' },
    header: {
      enabled: true,
      title: { text: 'AI Assistant' },
      leftAction: {
        icon: 'sidebar-left',
        onClick: () => toggleSidebar(),
      },
    },
    history: {
      enabled: true,
      showDelete: true,
      showRename: true,
    },
    composer: {
      placeholder: 'Ask anything...',
      tools: [
        { id: 'code', label: 'Code', icon: 'code', pinned: true },
        { id: 'search', label: 'Search', icon: 'search' },
      ],
    },
    onThreadChange: ({ threadId }) => {
      // Sync with backend
      syncThreadState(threadId);
    },
  });

  return <ChatKit control={control} className="h-screen w-full" />;
}
```

### Pattern 3: Embedded Chat Widget
```tsx
function EmbeddedWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const { control } = useChatKit({
    api: { getClientSecret: fetchClientSecret },
    theme: {
      colorScheme: 'light',
      radius: 'round',
      density: 'compact',
    },
    header: {
      enabled: true,
      title: { text: 'Chat with us' },
      rightAction: {
        icon: 'x',
        onClick: () => setIsOpen(false),
      },
    },
  });

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 rounded-full bg-blue-600 p-4"
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </button>
      )}
      {isOpen && (
        <div className="fixed bottom-4 right-4 shadow-2xl rounded-lg overflow-hidden">
          <ChatKit control={control} className="h-[500px] w-[350px]" />
        </div>
      )}
    </>
  );
}
```

### Pattern 4: Multi-Tenant Chat
```tsx
function TenantChat({ tenantId }: { tenantId: string }) {
  const { control } = useChatKit({
    api: {
      getClientSecret: async () => {
        const res = await fetch('/api/chatkit/session', {
          method: 'POST',
          headers: { 'X-Tenant-ID': tenantId },
        });
        return (await res.json()).client_secret;
      },
    },
    theme: {
      // Load tenant-specific theme
      colorScheme: getTenantTheme(tenantId).colorScheme,
      color: { accent: { primary: getTenantTheme(tenantId).primaryColor } },
    },
    header: {
      title: { text: getTenantName(tenantId) },
    },
  });

  return <ChatKit control={control} className="h-[600px]" />;
}
```

## Integration with Next.js

### App Router Example
```tsx
// app/chat/page.tsx
'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';

export default function ChatPage() {
  const { control } = useChatKit({
    api: {
      getClientSecret: async () => {
        const res = await fetch('/api/chatkit/session', { method: 'POST' });
        return (await res.json()).client_secret;
      },
    },
  });

  return (
    <main className="container mx-auto p-4">
      <ChatKit control={control} className="h-[calc(100vh-2rem)]" />
    </main>
  );
}

// app/api/chatkit/session/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = await fetch('https://api.openai.com/v1/realtime/sessions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-realtime-preview',
      voice: 'alloy',
    }),
  });

  const data = await response.json();
  return NextResponse.json({ client_secret: data.client_secret });
}
```

## TypeScript Types

```typescript
import type { ChatKitOptions, ChatKitControl } from '@openai/chatkit-react';

// Custom configuration type
interface MyChatConfig {
  tenantId: string;
  theme: 'light' | 'dark';
  features: string[];
}

// Typed component
function TypedChat({ config }: { config: MyChatConfig }) {
  const options: Partial<ChatKitOptions> = {
    api: {
      getClientSecret: async () => {
        // Implementation
      },
    },
    theme: {
      colorScheme: config.theme,
    },
  };

  const { control } = useChatKit(options);
  return <ChatKit control={control} />;
}
```

## Resources
- GitHub: https://github.com/openai/chatkit-js
- Documentation: https://github.com/openai/chatkit-js/tree/main/packages/docs
- Examples: https://github.com/openai/chatkit-js/tree/main/examples
- NPM (React): https://www.npmjs.com/package/@openai/chatkit-react
- NPM (Vanilla): https://www.npmjs.com/package/@openai/chatkit
