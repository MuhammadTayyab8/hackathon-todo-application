"""
Conversation Model

Represents a chat session between a user and the AI assistant.
Each conversation belongs to a specific user and contains multiple messages.
"""

from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, SQLModel, Relationship

if TYPE_CHECKING:
    from .message import Message


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
    user_id: UUID = Field(
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
    user_id: UUID
    title: Optional[str] = None


class ConversationRead(SQLModel):
    """Schema for reading conversation data."""
    id: UUID
    user_id: UUID
    title: Optional[str]
    created_at: datetime
    updated_at: datetime
    message_count: Optional[int] = None


class ConversationUpdate(SQLModel):
    """Schema for updating conversation data."""
    title: Optional[str] = None
    updated_at: datetime = Field(default_factory=datetime.utcnow)
