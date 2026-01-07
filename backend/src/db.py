import os
import re
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine
from dotenv import load_dotenv

# Load .env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("DATABASE_URL is not set")

# Ensure asyncpg scheme
if DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace(
        "postgresql://",
        "postgresql+asyncpg://",
        1
    )

# REMOVE all query params (?sslmode, channel_binding, etc.)
DATABASE_URL = re.sub(r"\?.*$", "", DATABASE_URL)

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=True,
)

async def get_session() -> AsyncSession:
    async with AsyncSession(engine) as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
