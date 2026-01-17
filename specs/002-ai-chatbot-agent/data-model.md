# Phase 1: Data Model

**Feature**: AI Chatbot Agent for Task Management
**Date**: 2026-01-17
**Status**: Approved

## Overview

This document defines the SQLModel database models for conversation persistence. The data model consists of two main entities: `Conversation` (chat sessions) and `Message` (individual messages within conversations). Both models integrate with the existing User model and follow the project's SQLModel patterns.

---

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

**Relationships**:
- One User has many Conversations
- One Conversation has many Messages
- Messages belong to one Conversation

---

## Model Definitions

### Conversation Model

**File**: `backend/src/models/conversation.py`

```python
"""
Conversation Model

Represents a chat session between a user and the AI assistant.
Each conversation belongs to a specific user and contains multiple messages.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship


class Conversation(SQLModel, table=True):
    """
    Conversation entity for chat sessions.

    Attributes:
        id: Unique identifier (UUID)
        user_id: Foreign key to User (string)
        title: Optional conversation title (auto-generated from first message)
        created_at: Timestamp when conversation was created
        updated_at: Timestamp when conversation was last updated
        messages: Relationship to Message entities (one-to-many)
    """

    __tablename__ = "conversation"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique conversation identifier"
    )

    # Foreign Key to User
    user_id: str = Field(
        foreign_key="user.id",
        nullable=False,
        index=True,
        description="User who owns this conversation"
    )

    # Conversation Metadata
    title: Optional[str] = Field(
        default=None,
        max_length=255,
        description="Conversation title (auto-generated from first message)"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Conversation creation timestamp"
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last update timestamp"
    )

    # Relationships
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "user_id": "user_123",
                "title": "Task Management Discussion",
                "created_at": "2026-01-17T10:00:00Z",
                "updated_at": "2026-01-17T10:30:00Z"
            }
        }


class ConversationCreate(SQLModel):
    """Schema for creating a new conversation."""
    user_id: str
    title: Optional[str] = None


class ConversationRead(SQLModel):
    """Schema for reading conversation data."""
    id: UUID
    user_id: str
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = None


class ConversationUpdate(SQLModel):
    """Schema for updating conversation data."""
    title: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

---

### Message Model

**File**: `backend/src/models/message.py`

```python
"""
Message Model

Represents a single message in a conversation.
Messages can be from the user or the AI assistant.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship, Column, JSON


class MessageRole(str, Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"  # For system messages (e.g., summarization)


class Message(SQLModel, table=True):
    """
    Message entity for chat messages.

    Attributes:
        id: Unique identifier (UUID)
        conversation_id: Foreign key to Conversation (UUID)
        role: Message role (user, assistant, system)
        content: Message text content
        tool_calls: Optional JSON array of tool call metadata
        created_at: Timestamp when message was created
        conversation: Relationship to Conversation entity (many-to-one)
    """

    __tablename__ = "message"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique message identifier"
    )

    # Foreign Key to Conversation
    conversation_id: UUID = Field(
        foreign_key="conversation.id",
        nullable=False,
        index=True,
        description="Conversation this message belongs to"
    )

    # Message Data
    role: MessageRole = Field(
        nullable=False,
        index=True,
        description="Message role (user, assistant, system)"
    )

    content: str = Field(
        nullable=False,
        description="Message text content"
    )

    # Tool Call Metadata (optional)
    tool_calls: Optional[List[Dict[str, Any]]] = Field(
        default=None,
        sa_column=Column(JSON),
        description="Array of tool call metadata (for assistant messages)"
    )

    # Timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True,
        description="Message creation timestamp"
    )

    # Relationships
    conversation: Optional["Conversation"] = Relationship(
        back_populates="messages"
    )

    class Config:
        """SQLModel configuration."""
        json_schema_extra = {
            "example": {
                "id": "660e8400-e29b-41d4-a716-446655440000",
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                "role": "user",
                "content": "Add a task to buy groceries tomorrow",
                "tool_calls": None,
                "created_at": "2026-01-17T10:00:00Z"
            }
        }


class MessageCreate(SQLModel):
    """Schema for creating a new message."""
    conversation_id: UUID
    role: MessageRole
    content: str
    tool_calls: Optional[List[Dict[str, Any]]] = None


class MessageRead(SQLModel):
    """Schema for reading message data."""
    id: UUID
    conversation_id: UUID
    role: MessageRole
    content: str
    tool_calls: Optional[List[Dict[str, Any]]]
    created_at: datetime


class MessageUpdate(SQLModel):
    """Schema for updating message data (rarely used)."""
    content: Optional[str] = None
    tool_calls: Optional[List[Dict[str, Any]]] = None
```

---

## Database Migrations

### Migration Script

**File**: `backend/alembic/versions/YYYYMMDD_add_conversation_message_tables.py`

```python
"""Add conversation and message tables

Revision ID: YYYYMMDD_001
Revises: <previous_revision>
Create Date: 2026-01-17 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'YYYYMMDD_001'
down_revision = '<previous_revision>'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create conversation and message tables."""

    # Create conversation table
    op.create_table(
        'conversation',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
    )

    # Create indexes for conversation
    op.create_index('ix_conversation_user_id', 'conversation', ['user_id'])
    op.create_index('ix_conversation_created_at', 'conversation', ['created_at'])

    # Create message table
    op.create_table(
        'message',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('role', sa.String(), nullable=False),
        sa.Column('content', sa.Text(), nullable=False),
        sa.Column('tool_calls', postgresql.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['conversation_id'], ['conversation.id'], ondelete='CASCADE'),
    )

    # Create indexes for message
    op.create_index('ix_message_conversation_id', 'message', ['conversation_id'])
    op.create_index('ix_message_role', 'message', ['role'])
    op.create_index('ix_message_created_at', 'message', ['created_at'])


def downgrade() -> None:
    """Drop conversation and message tables."""

    # Drop indexes
    op.drop_index('ix_message_created_at', table_name='message')
    op.drop_index('ix_message_role', table_name='message')
    op.drop_index('ix_message_conversation_id', table_name='message')
    op.drop_index('ix_conversation_created_at', table_name='conversation')
    op.drop_index('ix_conversation_user_id', table_name='conversation')

    # Drop tables
    op.drop_table('message')
    op.drop_table('conversation')
```

---

## Database Queries

### Common Query Patterns

```python
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

# 1. Create new conversation
async def create_conversation(session: AsyncSession, user_id: str, title: Optional[str] = None) -> Conversation:
    """Create a new conversation for a user."""
    conversation = Conversation(user_id=user_id, title=title)
    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)
    return conversation


# 2. Get conversation by ID (with user isolation)
async def get_conversation(session: AsyncSession, conversation_id: UUID, user_id: str) -> Optional[Conversation]:
    """Get conversation by ID, ensuring it belongs to the user."""
    statement = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    )
    result = await session.execute(statement)
    return result.scalar_one_or_none()


# 3. Get conversation history (messages)
async def get_conversation_messages(
    session: AsyncSession,
    conversation_id: UUID,
    user_id: str,
    limit: Optional[int] = None
) -> List[Message]:
    """Get all messages in a conversation, ordered by creation time."""
    # First verify conversation belongs to user
    conversation = await get_conversation(session, conversation_id, user_id)
    if not conversation:
        return []

    # Fetch messages
    statement = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc())

    if limit:
        statement = statement.limit(limit)

    result = await session.execute(statement)
    return result.scalars().all()


# 4. Store new message
async def create_message(
    session: AsyncSession,
    conversation_id: UUID,
    role: MessageRole,
    content: str,
    tool_calls: Optional[List[Dict[str, Any]]] = None
) -> Message:
    """Create a new message in a conversation."""
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        tool_calls=tool_calls
    )
    session.add(message)

    # Update conversation updated_at timestamp
    statement = select(Conversation).where(Conversation.id == conversation_id)
    result = await session.execute(statement)
    conversation = result.scalar_one()
    conversation.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(message)
    return message


# 5. List user's conversations
async def list_user_conversations(
    session: AsyncSession,
    user_id: str,
    limit: int = 50,
    offset: int = 0
) -> List[Conversation]:
    """List all conversations for a user, ordered by most recent."""
    statement = select(Conversation).where(
        Conversation.user_id == user_id
    ).order_by(
        Conversation.updated_at.desc()
    ).limit(limit).offset(offset)

    result = await session.execute(statement)
    return result.scalars().all()


# 6. Delete conversation (cascade deletes messages)
async def delete_conversation(session: AsyncSession, conversation_id: UUID, user_id: str) -> bool:
    """Delete a conversation and all its messages."""
    conversation = await get_conversation(session, conversation_id, user_id)
    if not conversation:
        return False

    await session.delete(conversation)
    await session.commit()
    return True
```

---

## Indexes and Performance

### Index Strategy

1. **conversation.user_id**: Enables fast lookup of user's conversations
2. **conversation.created_at**: Supports sorting by creation time
3. **message.conversation_id**: Enables fast lookup of conversation messages
4. **message.role**: Supports filtering by message role
5. **message.created_at**: Supports sorting messages chronologically

### Expected Query Performance

- **Get conversation by ID**: O(1) with primary key lookup
- **Get conversation messages**: O(log n) with conversation_id index
- **List user conversations**: O(log n) with user_id index
- **Create message**: O(1) insert with index updates

### Storage Estimates

- **Conversation**: ~100 bytes per row
- **Message**: ~500 bytes per row (varies with content length)
- **100 users, 10 conversations each, 20 messages per conversation**: ~10 MB

---

## Data Validation

### Constraints

1. **Conversation**:
   - `user_id` must reference existing User
   - `title` max length: 255 characters
   - `created_at` and `updated_at` must be valid timestamps

2. **Message**:
   - `conversation_id` must reference existing Conversation
   - `role` must be one of: user, assistant, system
   - `content` cannot be empty
   - `tool_calls` must be valid JSON array if provided

### Business Rules

1. **User Isolation**: All queries must filter by authenticated user_id
2. **Cascade Deletion**: Deleting a conversation deletes all its messages
3. **Immutable Messages**: Messages should not be edited after creation (audit trail)
4. **Conversation Title**: Auto-generated from first user message if not provided

---

## Summary

The data model provides:
- ✅ Two main entities: Conversation and Message
- ✅ Proper relationships with cascade deletion
- ✅ User isolation via user_id foreign key
- ✅ Efficient indexes for common queries
- ✅ JSON support for tool call metadata
- ✅ Timestamp tracking for audit trail
- ✅ SQLModel schemas for CRUD operations

**Next**: Generate API contracts and quickstart guide.
