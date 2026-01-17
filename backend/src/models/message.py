"""
Message Model

Represents a single message in a conversation.
Messages can be from the user or the AI assistant.
"""

from datetime import datetime
from enum import Enum
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship, Column, JSON

if TYPE_CHECKING:
    from .conversation import Conversation


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
