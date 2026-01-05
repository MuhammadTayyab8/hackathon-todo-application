# Quick Start: User Authentication Implementation

**Feature**: 001-user-auth
**Date**: 2026-01-05

## Overview

This guide provides step-by-step instructions for implementing user authentication with Better Auth (Next.js) and FastAPI with JWT verification.

---

## Prerequisites

- Node.js 20+ installed
- Python 3.11+ installed
- Neon PostgreSQL account and database created
- Git repository initialized
- Branch `001-user-auth` checked out

---

## Environment Setup

### 1. Create Environment Variables

Create `.env` files for both frontend and backend:

#### Backend (backend/.env)
```bash
# Neon PostgreSQL connection string
DATABASE_URL=postgresql://user:password@ep-xxx.aws.neon.tech/neondb?sslmode=require

# Shared secret for JWT (must match frontend)
BETTER_AUTH_SECRET=your-super-secret-key-minimum-32-characters

# FastAPI configuration
API_HOST=0.0.0.0
API_PORT=8000
```

#### Frontend (frontend/.env.local)
```bash
# Better Auth configuration
BETTER_AUTH_SECRET=your-super-secret-key-minimum-32-characters

# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
cd backend
pip install fastapi uvicorn sqlmodel sqlalchemy[asyncio] asyncpg pydantic python-jose[cryptography] bcrypt pytest pytest-asyncio
```

#### Frontend Dependencies
```bash
cd frontend
npm install better-auth
npm install --save-dev @types/node
```

---

## Backend Implementation

### Step 1: Database Connection (backend/db.py)

```python
import os
from sqlmodel import SQLModel
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine

DATABASE_URL = os.getenv("DATABASE_URL")
engine: AsyncEngine = create_async_engine(
    DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"),
    echo=True
)

async def get_session() -> AsyncSession:
    async with AsyncSession(engine) as session:
        yield session

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
```

### Step 2: User Model (backend/src/models/user.py)

```python
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
import uuid

class User(SQLModel, table=True):
    __tablename__ = "users"

    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    username: str = Field(unique=True, index=True, max_length=100)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(SQLModel):
    email: str
    username: str
    password: str

class UserSignIn(SQLModel):
    email: str
    password: str

class UserRead(SQLModel):
    id: str
    email: str
    username: str
    created_at: datetime
```

### Step 3: Auth Service (backend/src/services/auth_service.py)

```python
import bcrypt
import re
from datetime import datetime, timedelta
import jwt
from sqlmodel import select, Session
from backend.src.models.user import User, UserCreate

JWT_SECRET = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

def validate_password(password: str) -> tuple[bool, str]:
    """Validate password meets requirements."""
    if len(password) < 12:
        return False, "Password must be at least 12 characters"
    if not re.search(r'[A-Z]', password):
        return False, "Password must contain at least one uppercase letter"
    if not re.search(r'[a-z]', password):
        return False, "Password must contain at least one lowercase letter"
    if not re.search(r'[0-9]', password):
        return False, "Password must contain at least one number"
    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain at least one special character"
    return True, ""

def create_jwt_token(user_id: str, email: str, username: str) -> str:
    expires_delta = timedelta(days=7)
    expire = datetime.utcnow() + expires_delta
    payload = {
        "userId": user_id,
        "email": email,
        "username": username,
        "iat": datetime.utcnow(),
        "exp": expire
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=ALGORITHM)

async def create_user(user_create: UserCreate, session: Session) -> User:
    """Create a new user with hashed password."""
    # Validate password
    valid, message = validate_password(user_create.password)
    if not valid:
        raise ValueError(message)

    # Check if email already exists
    existing_user = await session.execute(
        select(User).where(User.email == user_create.email)
    )
    if existing_user.scalar_one_or_none():
        raise ValueError("Email already in use")

    # Check if username already exists
    existing_user = await session.execute(
        select(User).where(User.username == user_create.username)
    )
    if existing_user.scalar_one_or_none():
        raise ValueError("Username already taken")

    # Create user
    hashed_password = hash_password(user_create.password)
    user = User(
        email=user_create.email,
        username=user_create.username,
        hashed_password=hashed_password
    )
    session.add(user)
    await session.commit()
    await session.refresh(user)
    return user

async def authenticate_user(email: str, password: str, session: Session) -> Optional[User]:
    """Authenticate user with email and password."""
    user = await session.execute(
        select(User).where(User.email == email)
    )
    user = user.scalar_one_or_none()
    if not user:
        return None
    if not verify_password(password, user.hashed_password):
        return None
    return user
```

### Step 4: JWT Middleware (backend/src/api/middleware/jwt_middleware.py)

```python
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import jwt
from jwt import PyJWTError
import os

JWT_SECRET = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"
PUBLIC_ROUTES = {"/api/auth/signup", "/api/auth/signin", "/health"}

class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth for public routes
        if request.url.path in PUBLIC_ROUTES:
            return await call_next(request)

        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing or invalid authentication token"
            )

        token = auth_header.split(" ")[1]

        try:
            payload = jwt.decode(token, JWT_SECRET, algorithms=[ALGORITHM])
            user_id = payload.get("userId")
            if not user_id:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid token: missing user ID"
                )
            request.state.user_id = user_id
        except PyJWTError as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid token"
            )

        return await call_next(request)
```

### Step 5: Auth Routes (backend/src/api/routes/auth.py)

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from backend.src.models.user import UserCreate, UserSignIn, UserRead
from backend.src.services.auth_service import (
    create_user,
    authenticate_user,
    create_jwt_token
)
from backend.db import get_session

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/signup", status_code=status.HTTP_200_OK)
async def signup(
    user_create: UserCreate,
    session: AsyncSession = Depends(get_session)
):
    try:
        user = await create_user(user_create, session)
        token = create_jwt_token(user.id, user.email, user.username)

        return {
            "user": UserRead(
                id=user.id,
                email=user.email,
                username=user.username,
                created_at=user.created_at
            ),
            "token": token,
            "expires_at": datetime.utcnow() + timedelta(days=7)
        }
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/signin", status_code=status.HTTP_200_OK)
async def signin(
    user_signin: UserSignIn,
    session: AsyncSession = Depends(get_session)
):
    user = await authenticate_user(user_signin.email, user_signin.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_jwt_token(user.id, user.email, user.username)

    return {
        "user": UserRead(
            id=user.id,
            email=user.email,
            username=user.username,
            created_at=user.created_at
        ),
        "token": token,
        "expires_at": datetime.utcnow() + timedelta(days=7)
    }

@router.post("/signout")
async def signout():
    return {"message": "Signed out successfully"}

@router.get("/me")
async def get_me(request: Request):
    user_id = request.state.user_id
    # Fetch user from database and return
    return {"user_id": user_id}
```

### Step 6: Main Application (backend/main.py)

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.src.api.middleware.jwt_middleware import JWTAuthMiddleware
from backend.src.api.routes.auth import router as auth_router
from backend.db import init_db

app = FastAPI(title="Todo App API")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# JWT authentication middleware
app.add_middleware(JWTAuthMiddleware)

# Include routers
app.include_router(auth_router)

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/health")
async def health():
    return {"status": "ok"}
```

---

## Frontend Implementation

### Step 1: Better Auth Configuration (frontend/src/lib/auth.ts)

```typescript
import { betterAuth } from "better-auth"
import { jwt } from "better-auth/plugins/jwt"

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET!,
  plugins: [
    jwt({
      issuer: "todo-app",
      expiresIn: "7d",
      refresh: false
    })
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false
  }
})

export const authClient = auth.api
```

### Step 2: API Client (frontend/src/lib/api.ts)

```typescript
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const session = await authClient.getSession()
    const token = session?.token

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    })

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/signin'
      }
      const error = await response.json()
      throw new Error(error.error || 'API error')
    }

    return response.json()
  }

  async get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' })
  }

  async post<T>(endpoint: string, data: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }
}

export const api = new ApiClient()
```

### Step 3: Sign Up Form (frontend/src/components/auth/SignUpForm.tsx)

```typescript
"use client"

import { useState } from 'react'
import { authClient } from '@/lib/auth'

export function SignUpForm() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authClient.signUp.email({
        email,
        username,
        password
      })
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message || 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="username" className="block text-sm font-medium">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="mt-1 block w-full rounded border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded border p-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  )
}
```

### Step 4: Sign In Form (frontend/src/components/auth/SignInForm.tsx)

```typescript
"use client"

import { useState } from 'react'
import { authClient } from '@/lib/auth'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await authClient.signIn.email({
        email,
        password
      })
      window.location.href = '/'
    } catch (err: any) {
      setError(err.message || 'Sign in failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSignIn} className="space-y-4">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded">{error}</div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded border p-2"
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded border p-2"
          required
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded disabled:bg-gray-400"
      >
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  )
}
```

### Step 5: Sign Up Page (frontend/src/app/(auth)/signup/page.tsx)

```typescript
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Sign Up</h1>
        <SignInForm />
        <p className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <a href="/signin" className="text-blue-600">Sign in</a>
        </p>
      </div>
    </div>
  )
}
```

### Step 6: Sign In Page (frontend/src/app/(auth)/signin/page.tsx)

```typescript
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6">Sign In</h1>
        <SignInForm />
        <p className="mt-4 text-center text-sm">
          Don't have an account?{' '}
          <a href="/signup" className="text-blue-600">Sign up</a>
        </p>
      </div>
    </div>
  )
}
```

---

## Running the Application

### Start Backend
```bash
cd backend
uvicorn main:app --reload --port 8000
```

### Start Frontend
```bash
cd frontend
npm run dev
```

### Test API
```bash
# Health check
curl http://localhost:8000/health

# Sign up
curl -X POST http://localhost:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"SecurePassword123!"}'

# Sign in
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"SecurePassword123!"}'
```

---

## Next Steps

After completing this quickstart:
1. Implement unit tests for auth service
2. Implement integration tests for auth flows
3. Add error logging and monitoring
4. Implement rate limiting for auth endpoints
5. Add password reset functionality (future feature)
6. Add email verification (future feature)
