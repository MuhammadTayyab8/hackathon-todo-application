import os
import sys
import asyncio
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db import init_db
from src.api.routes.auth import router as auth_router
from src.api.routes.tasks import router as tasks_router
from src.api.routes.categories import router as categories_router
from src.api.routes.chat import router as chat_router
from src.api.middleware.jwt_middleware import JWTAuthMiddleware

from dotenv import load_dotenv
load_dotenv()

# Fix for Windows: Use ProactorEventLoop to support subprocess operations
# This is required for MCP stdio client to work on Windows
if sys.platform == 'win32':
    asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

app = FastAPI(title="Todo App API")

# Order matters: CORSMiddleware should be outer if possible, but JWT needs to run first for auth
# Actually FastAPI middleware is LIFO for execution?
# Let's add JWT first, then CORS.

app.add_middleware(JWTAuthMiddleware)

# Configure CORS origins
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
allowed_origins = [
    FRONTEND_URL,
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:8001",
]

# Remove None values and duplicates
allowed_origins = list(set(filter(None, allowed_origins)))

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])
app.include_router(tasks_router, prefix="/api", tags=["tasks"])
app.include_router(categories_router, prefix="/api", tags=["categories"])
app.include_router(chat_router, prefix="/api", tags=["chat"])

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
