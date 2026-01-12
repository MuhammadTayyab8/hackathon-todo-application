from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlmodel import SQLModel, Field, Relationship

class TaskBase(SQLModel):
    content: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)

class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4,
        primary_key=True,
        index=True,
        nullable=False,
    )
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, nullable=False)
    title: str = Field(min_length=1)
    description: Optional[str] = Field(default=None)
    start_date: Optional[datetime] = Field(default=None)
    due_date: Optional[datetime] = Field(default=None)
    category_id: Optional[int] = Field(default=None, foreign_key="category.id", index=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

class TaskCreate(SQLModel):
    title: str = Field(min_length=1)
    category_id: int
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None

class TaskUpdate(SQLModel):
    title: Optional[str] = None
    category_id: Optional[int] = None
    description: Optional[str] = None
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    content: Optional[str] = None
    completed: Optional[bool] = None

class TaskRead(TaskBase):
    id: uuid.UUID
    user_id: uuid.UUID
    title: str
    description: Optional[str]
    start_date: Optional[datetime]
    due_date: Optional[datetime]
    category_id: Optional[int]
    category_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
