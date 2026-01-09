from datetime import datetime, timezone
import uuid
from typing import Optional
from sqlmodel import SQLModel, Field

class CategoryBase(SQLModel):
    name: str = Field(unique=True, index=True, min_length=1)

class Category(CategoryBase, table=True):
    __tablename__ = "category"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: uuid.UUID = Field(foreign_key="user.id", index=True, nullable=False)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc).replace(tzinfo=None))

class CategoryCreate(CategoryBase):
    pass

class CategoryRead(CategoryBase):
    id: int
    user_id: uuid.UUID
    created_at: datetime
