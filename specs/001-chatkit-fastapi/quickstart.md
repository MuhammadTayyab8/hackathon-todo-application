# Quickstart Guide: ChatKit AI Chat Interface

**Feature**: ChatKit AI Chat Interface
**Date**: 2026-01-21
**Audience**: Developers implementing the feature

## Overview

This guide helps developers quickly set up and implement the ChatKit AI chat interface feature. Follow these steps to get the chat functionality working in your local development environment.

## Prerequisites

- Node.js 18+ and npm/pnpm installed
- Python 3.11+ installed
- PostgreSQL database running (Neon or local)
- OpenAI API key
- Existing Todo app authentication working

## Quick Setup (5 minutes)

### 1. Backend Setup

**Install Dependencies**
```bash
cd backend
pip install openai>=1.0.0
# or with poetry
poetry add openai
```

**Environment Variables**
Add to `backend/.env`:
```bash
OPENAI_API_KEY=sk-...  # Your OpenAI API key
DATABASE_URL=postgresql://...  # Your database URL
BETTER_AUTH_SECRET=...  # Existing auth secret
```

**Run Database Migration**
```bash
cd backend
alembic upgrade head
```

**Verify Backend**
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

Visit http://localhost:8000/docs to see the API documentation.

---

### 2. Frontend Setup

**Install Dependencies**
```bash
cd frontend
npm install @openai/chatkit-react lucide-react
# or with pnpm
pnpm add @openai/chatkit-react lucide-react
```

**Environment Variables**
Add to `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

**Verify Frontend**
```bash
cd frontend
npm run dev
```

Visit http://localhost:3000 to see the application.

---

## Implementation Steps

### Step 1: Create Database Models (Backend)

**File**: `backend/src/models/conversation.py`
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, List

class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="users.id", index=True)
    title: str = Field(max_length=200)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    deleted_at: Optional[datetime] = Field(default=None)

    messages: List["Message"] = Relationship(back_populates="conversation")
```

**File**: `backend/src/models/message.py`
```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"

class MessageStatus(str, Enum):
    SENDING = "sending"
    SENT = "sent"
    FAILED = "failed"

class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="conversations.id", index=True)
    role: MessageRole
    content: str = Field(max_length=4000)
    status: MessageStatus = Field(default=MessageStatus.SENT)
    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: Conversation = Relationship(back_populates="messages")
```

---

### Step 2: Implement Chat Service (Backend)

**File**: `backend/src/services/chat_service.py`
```python
from openai import OpenAI
import os

class ChatService:
    def __init__(self):
        self.client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    async def create_session(self, user_id: str) -> str:
        """Create ChatKit session and return client secret"""
        try:
            session = self.client.chatkit.sessions.create({
                "model": "gpt-4o-realtime-preview",
                "voice": "alloy"
            })
            return session.client_secret
        except Exception as e:
            raise Exception(f"Failed to create ChatKit session: {str(e)}")

chat_service = ChatService()
```

---

### Step 3: Add Chat Endpoints (Backend)

**File**: `backend/src/api/routes/chat.py` (modify existing)
```python
from fastapi import APIRouter, Depends, HTTPException
from src.services.chat_service import chat_service
from src.api.middleware.jwt_middleware import get_current_user

router = APIRouter()

@router.post("/{user_id}/chat/session")
async def create_chat_session(
    user_id: str,
    current_user = Depends(get_current_user)
):
    """Create ChatKit session"""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    try:
        client_secret = await chat_service.create_session(user_id)
        return {"client_secret": client_secret}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

### Step 4: Create Route Group (Frontend)

**Create Directory Structure**
```bash
cd frontend/src/app
mkdir -p "(main)/calendar"
mkdir -p "(main)/categories"
mkdir -p "(main)/dashboard"
mkdir -p "(main)/tasks"
```

**Move Existing Routes**
```bash
# Move page.tsx files into route group
mv calendar/page.tsx "(main)/calendar/"
mv categories/page.tsx "(main)/categories/"
mv dashboard/page.tsx "(main)/dashboard/"
mv tasks/page.tsx "(main)/tasks/"

# Remove old directories
rmdir calendar categories dashboard tasks
```

---

### Step 5: Create Shared Layout (Frontend)

**File**: `frontend/src/app/(main)/layout.tsx`
```tsx
import { Sidebar } from '@/components/Sidebar';
import { ChatWidget } from '@/components/chat/ChatWidget';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
      <ChatWidget />
    </div>
  );
}
```

---

### Step 6: Create ChatKit Components (Frontend)

**File**: `frontend/src/components/chat/ChatKitWrapper.tsx`
```tsx
'use client';

import { ChatKit, useChatKit } from '@openai/chatkit-react';
import { useEffect } from 'react';

interface ChatKitWrapperProps {
  userId: string;
}

export function ChatKitWrapper({ userId }: ChatKitWrapperProps) {
  const { control } = useChatKit({
    api: {
      getClientSecret: async () => {
        const res = await fetch(`/api/${userId}/chat/session`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!res.ok) {
          throw new Error('Failed to create chat session');
        }

        const data = await res.json();
        return data.client_secret;
      },
    },
  });

  return (
    <ChatKit
      control={control}
      className="h-full w-full"
    />
  );
}
```

**File**: `frontend/src/components/chat/ChatWidget.tsx`
```tsx
'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { ChatKitWrapper } from './ChatKitWrapper';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  // Get user ID from auth context or session
  const userId = 'user-id-from-auth'; // TODO: Get from auth context

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 left-4 z-50 rounded-full bg-blue-600 p-4 shadow-lg hover:bg-blue-700 transition-colors"
        aria-label="Toggle chat"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>

      {/* Chat modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setIsOpen(false)}>
          <div
            className="fixed bottom-20 left-4 h-[600px] w-[400px] rounded-lg bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-lg font-semibold">AI Assistant</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* ChatKit component */}
            <div className="h-[calc(100%-64px)]">
              <ChatKitWrapper userId={userId} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
```

---

## Testing

### Test Backend Endpoints

**Create Session**
```bash
curl -X POST http://localhost:8000/api/{user_id}/chat/session \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Expected response:
```json
{
  "client_secret": "sk_live_..."
}
```

### Test Frontend

1. Start both backend and frontend servers
2. Log in to the application
3. Navigate to any main page (calendar, dashboard, tasks)
4. Click the floating chat icon (bottom-left)
5. Chat modal should open with ChatKit interface
6. Type a message and verify AI response

---

## Troubleshooting

### Issue: "OpenAI API key not found"
**Solution**: Ensure `OPENAI_API_KEY` is set in `backend/.env`

### Issue: "Failed to create chat session"
**Solution**: Check OpenAI API key is valid and has ChatKit access

### Issue: "Routes not found after migration"
**Solution**: Verify route group syntax `(main)` with parentheses, not brackets

### Issue: "ChatKit component not rendering"
**Solution**: Ensure component has `'use client'` directive at the top

### Issue: "JWT token not sent with request"
**Solution**: Verify token is stored in localStorage and included in Authorization header

### Issue: "Database migration failed"
**Solution**: Check database connection and ensure previous migrations are applied

---

## Development Workflow

### 1. Backend Development
```bash
# Terminal 1: Run backend
cd backend
uvicorn src.main:app --reload --port 8000

# Terminal 2: Run tests
cd backend
pytest tests/
```

### 2. Frontend Development
```bash
# Terminal 1: Run frontend
cd frontend
npm run dev

# Terminal 2: Run tests
cd frontend
npm test
```

### 3. Database Changes
```bash
# Create migration
cd backend
alembic revision --autogenerate -m "Add chat tables"

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

---

## Next Steps

1. ✅ Complete quickstart setup
2. → Implement conversation management endpoints
3. → Add conversation list UI
4. → Implement conversation switching
5. → Add tests for all components
6. → Deploy to staging environment

---

## Resources

- [ChatKit Documentation](https://github.com/openai/chatkit-js)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Next.js Route Groups](https://nextjs.org/docs/app/building-your-application/routing/route-groups)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [OpenAPI Spec](./contracts/chat-api.yaml)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the API contracts in `contracts/chat-api.yaml`
3. Consult the data model in `data-model.md`
4. Review research decisions in `research.md`
