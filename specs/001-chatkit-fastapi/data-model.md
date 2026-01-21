# Data Model: ChatKit AI Chat Interface

**Feature**: ChatKit AI Chat Interface
**Date**: 2026-01-21
**Phase**: Phase 1 - Design

## Overview

This document defines the database schema and data models for the ChatKit chat interface feature. The data model supports conversation management, message persistence, and user-scoped data access.

## Entity Relationship Diagram

```
User (existing)
  |
  | 1:N
  |
Conversation
  |
  | 1:N
  |
Message
```

## Entities

### 1. Conversation

**Purpose**: Represents a chat thread between a user and the AI assistant.

**SQLModel Definition**:
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
    deleted_at: Optional[datetime] = Field(default=None, nullable=True)

    # Relationships
    messages: List["Message"] = Relationship(back_populates="conversation")
```

**Fields**:
- `id`: Unique identifier (UUID v4)
- `user_id`: Foreign key to User table (indexed for performance)
- `title`: Conversation title (max 200 characters)
- `created_at`: Timestamp when conversation was created
- `updated_at`: Timestamp when conversation was last modified
- `deleted_at`: Soft delete timestamp (NULL if not deleted)

**Indexes**:
- Primary key on `id`
- Index on `user_id` for efficient user-scoped queries
- Composite index on `(user_id, created_at)` for sorting

**Constraints**:
- `user_id` must reference existing user
- `title` cannot be empty
- `deleted_at` must be NULL or >= `created_at`

**Business Rules**:
1. Conversations are scoped to a single user
2. Soft delete preserves data for potential recovery
3. `updated_at` is updated whenever conversation or messages change
4. Default title is "New Conversation" if not provided

---

### 2. Message

**Purpose**: Represents an individual message within a conversation (user or AI).

**SQLModel Definition**:
```python
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
    role: MessageRole = Field(sa_column=Column(Enum(MessageRole)))
    content: str = Field(max_length=4000)
    status: MessageStatus = Field(default=MessageStatus.SENT, sa_column=Column(Enum(MessageStatus)))
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")
```

**Fields**:
- `id`: Unique identifier (UUID v4)
- `conversation_id`: Foreign key to Conversation table (indexed)
- `role`: Message sender ('user' or 'assistant')
- `content`: Message text content (max 4000 characters)
- `status`: Message delivery status ('sending', 'sent', 'failed')
- `created_at`: Timestamp when message was created

**Indexes**:
- Primary key on `id`
- Index on `conversation_id` for efficient conversation queries
- Composite index on `(conversation_id, created_at)` for ordering

**Constraints**:
- `conversation_id` must reference existing conversation
- `content` cannot be empty
- `role` must be 'user' or 'assistant'
- `status` must be 'sending', 'sent', or 'failed'

**Business Rules**:
1. Messages are immutable once created (no updates)
2. Messages are ordered by `created_at` within a conversation
3. User messages start with status 'sending', AI messages start with 'sent'
4. Failed messages are retained for debugging

---

## Database Schema (SQL)

### Conversations Table

```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMP NULL,

    CONSTRAINT conversations_title_not_empty CHECK (LENGTH(title) > 0),
    CONSTRAINT conversations_deleted_after_created CHECK (deleted_at IS NULL OR deleted_at >= created_at)
);

-- Indexes
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_user_created ON conversations(user_id, created_at DESC);
CREATE INDEX idx_conversations_deleted_at ON conversations(deleted_at) WHERE deleted_at IS NULL;
```

### Messages Table

```sql
CREATE TYPE message_role AS ENUM ('user', 'assistant');
CREATE TYPE message_status AS ENUM ('sending', 'sent', 'failed');

CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    role message_role NOT NULL,
    content TEXT NOT NULL,
    status message_status NOT NULL DEFAULT 'sent',
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),

    CONSTRAINT messages_content_not_empty CHECK (LENGTH(content) > 0),
    CONSTRAINT messages_content_max_length CHECK (LENGTH(content) <= 4000)
);

-- Indexes
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_conversation_created ON messages(conversation_id, created_at ASC);
```

---

## Migration Scripts

### Migration: Create Conversations and Messages Tables

**File**: `backend/src/migrations/versions/001_create_chat_tables.py`

```python
"""Create conversations and messages tables

Revision ID: 001_chat_tables
Revises: <previous_migration>
Create Date: 2026-01-21
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID

# revision identifiers
revision = '001_chat_tables'
down_revision = '<previous_migration>'
branch_labels = None
depends_on = None

def upgrade():
    # Create enum types
    op.execute("CREATE TYPE message_role AS ENUM ('user', 'assistant')")
    op.execute("CREATE TYPE message_status AS ENUM ('sending', 'sent', 'failed')")

    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('user_id', UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(200), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
        sa.Column('deleted_at', sa.DateTime(), nullable=True),
    )

    # Create indexes for conversations
    op.create_index('idx_conversations_user_id', 'conversations', ['user_id'])
    op.create_index('idx_conversations_user_created', 'conversations', ['user_id', sa.text('created_at DESC')])

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', UUID(as_uuid=True), primary_key=True, server_default=sa.text('gen_random_uuid()')),
        sa.Column('conversation_id', UUID(as_uuid=True), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', sa.Enum('user', 'assistant', name='message_role'), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('status', sa.Enum('sending', 'sent', 'failed', name='message_status'), nullable=False, server_default='sent'),
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.text('NOW()')),
    )

    # Create indexes for messages
    op.create_index('idx_messages_conversation_id', 'messages', ['conversation_id'])
    op.create_index('idx_messages_conversation_created', 'messages', ['conversation_id', 'created_at'])

def downgrade():
    op.drop_index('idx_messages_conversation_created', 'messages')
    op.drop_index('idx_messages_conversation_id', 'messages')
    op.drop_table('messages')

    op.drop_index('idx_conversations_user_created', 'conversations')
    op.drop_index('idx_conversations_user_id', 'conversations')
    op.drop_table('conversations')

    op.execute('DROP TYPE message_status')
    op.execute('DROP TYPE message_role')
```

---

## Query Patterns

### Common Queries

**1. Get User's Conversations (with message count)**
```python
from sqlalchemy import func, select

query = (
    select(
        Conversation,
        func.count(Message.id).label('message_count')
    )
    .outerjoin(Message)
    .where(
        Conversation.user_id == user_id,
        Conversation.deleted_at.is_(None)
    )
    .group_by(Conversation.id)
    .order_by(Conversation.updated_at.desc())
)
```

**2. Get Conversation with Messages**
```python
query = (
    select(Conversation)
    .where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id,
        Conversation.deleted_at.is_(None)
    )
    .options(selectinload(Conversation.messages))
)
```

**3. Create New Conversation**
```python
conversation = Conversation(
    user_id=user_id,
    title=title or "New Conversation"
)
session.add(conversation)
await session.commit()
await session.refresh(conversation)
```

**4. Add Message to Conversation**
```python
message = Message(
    conversation_id=conversation_id,
    role=MessageRole.USER,
    content=content,
    status=MessageStatus.SENDING
)
session.add(message)

# Update conversation timestamp
conversation.updated_at = datetime.utcnow()
await session.commit()
```

**5. Soft Delete Conversation**
```python
conversation.deleted_at = datetime.utcnow()
await session.commit()
```

---

## Data Validation

### Conversation Validation
- Title: 1-200 characters, non-empty
- User ID: Must exist in users table
- Timestamps: created_at <= updated_at

### Message Validation
- Content: 1-4000 characters, non-empty
- Role: Must be 'user' or 'assistant'
- Status: Must be 'sending', 'sent', or 'failed'
- Conversation ID: Must exist and belong to user

---

## Performance Considerations

### Indexing Strategy
1. **user_id index**: Fast user-scoped queries
2. **conversation_id index**: Fast message retrieval
3. **Composite indexes**: Efficient sorting and filtering
4. **Partial index on deleted_at**: Optimize active conversation queries

### Query Optimization
1. Use `selectinload` for eager loading messages
2. Implement pagination for large conversation lists
3. Limit message history to recent N messages initially
4. Use database-level sorting instead of application-level

### Scaling Considerations
1. Partition messages table by created_at if volume grows
2. Archive old conversations to separate table
3. Implement read replicas for heavy read workloads
4. Consider caching frequently accessed conversations

---

## Data Retention

### Retention Policy
- Active conversations: Retained indefinitely
- Deleted conversations: Soft delete, retained for 30 days
- Messages: Retained with conversation
- Orphaned messages: Cascade delete with conversation

### Cleanup Strategy
```python
# Hard delete conversations older than 30 days
DELETE FROM conversations
WHERE deleted_at IS NOT NULL
  AND deleted_at < NOW() - INTERVAL '30 days';
```

---

## Security

### Access Control
1. All queries MUST filter by user_id from JWT
2. Verify conversation ownership before operations
3. No cross-user data access allowed
4. Validate user_id matches JWT claims

### Data Protection
1. Content is stored as plain text (no PII expected)
2. User IDs are UUIDs (not sequential)
3. Soft deletes prevent accidental data loss
4. Cascade deletes maintain referential integrity

---

## Testing Data

### Seed Data for Development

```python
# Create test conversations
test_conversations = [
    Conversation(
        user_id=test_user_id,
        title="Getting Started with Tasks",
        created_at=datetime(2026, 1, 20, 10, 0, 0)
    ),
    Conversation(
        user_id=test_user_id,
        title="Calendar Questions",
        created_at=datetime(2026, 1, 21, 14, 30, 0)
    )
]

# Create test messages
test_messages = [
    Message(
        conversation_id=test_conversations[0].id,
        role=MessageRole.USER,
        content="How do I create a new task?",
        status=MessageStatus.SENT
    ),
    Message(
        conversation_id=test_conversations[0].id,
        role=MessageRole.ASSISTANT,
        content="To create a new task, click the 'New Task' button...",
        status=MessageStatus.SENT
    )
]
```

---

## Next Steps

1. ✅ Data model defined
2. → Create API contracts (OpenAPI spec)
3. → Implement SQLModel models in backend
4. → Create and run migrations
5. → Implement service layer for data access
