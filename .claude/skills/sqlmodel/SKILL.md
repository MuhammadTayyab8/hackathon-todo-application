---
name: sqlmodel
description: Handles ORM operations with SQLModel for Python apps, including model definitions, CRUD, and database migrations. Use for defining tables like User and Todo in FastAPI.
allowed-tools: Read, Grep
---

# SQLModel ORM Guide
## Instructions
1. Install: `uv add sqlmodel`.
2. Define Models: Inherit from SQLModel, table=True (e.g., class User(SQLModel, table=True): id: int, username: str).
3. Engine: Create with create_engine('postgresql://...') using Neon URL.
4. CRUD: Use session.add(), session.commit() for create; query with select(User).
5. Integration: In FastAPI dependencies for DB sessions.

## Example
from sqlmodel import SQLModel, Field, create_engine, Session
class Todo(SQLModel, table=True):
    id: int = Field(primary_key=True)
    content: str
engine = create_engine('your-neon-url')