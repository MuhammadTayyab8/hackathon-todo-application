# Research: User Authentication

**Feature**: 001-user-auth
**Date**: 2026-01-05

## Overview

Research findings for implementing secure user authentication with Better Auth (Next.js) and FastAPI middleware using JWT tokens.

---

## Neon PostgreSQL + SQLModel Integration

**Decision**: Use SQLModel with async PostgreSQL connection via `asyncpg` driver.

**Rationale**:
- SQLModel provides type-safe ORM models that work seamlessly with Pydantic for FastAPI
- `asyncpg` is the fastest PostgreSQL driver for Python and supports async/await
- Neon provides managed PostgreSQL with connection pooling and serverless scaling
- SQLModel's declarative syntax matches the existing project patterns

**Implementation Approach**:
```python
# db.py
from sqlmodel import SQLModel, create_engine, Session
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlalchemy.ext.asyncio import create_async_engine, AsyncEngine

DATABASE_URL = os.getenv("DATABASE_URL")
engine: AsyncEngine = create_async_engine(DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://"))

async def get_session() -> AsyncSession:
    async with AsyncSession(engine) as session:
        yield session
```

**Alternatives Considered**:
- SQLAlchemy Core: Lower-level, more boilerplate
- Django ORM: Too heavy, incompatible with FastAPI patterns
- Tortoise ORM: Less mature than SQLModel

---

## Better Auth Configuration with JWT Plugin

**Decision**: Configure Better Auth with JWT plugin for token-based authentication.

**Rationale**:
- Better Auth is a modern authentication library designed for Next.js 16+ App Router
- JWT plugin enables stateless authentication compatible with FastAPI backend
- Built-in support for password hashing, email validation, and session management
- Shared secret (`BETTER_AUTH_SECRET`) allows backend token verification

**Implementation Approach**:
```typescript
// frontend/src/lib/auth.ts
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
```

**Alternatives Considered**:
- NextAuth.js (Auth.js): Too opinionated, harder to integrate with custom backend
- Lucia: Great library but less mature than Better Auth for Next.js 16+
- Custom JWT implementation: More security risk, re-inventing the wheel

---

## FastAPI JWT Verification Middleware

**Decision**: Create custom FastAPI middleware to extract and verify JWT from `Authorization` header.

**Rationale**:
- Middleware applies authentication to all protected routes consistently
- Extracts user ID from JWT and adds to request state for route handlers
- Shared secret (`BETTER_AUTH_SECRET`) ensures token authenticity
- Returns 401 Unauthorized for missing or invalid tokens

**Implementation Approach**:
```python
# backend/src/api/middleware/jwt_middleware.py
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
import jwt
from jwt import PyJWTError

JWT_SECRET = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Skip auth for public routes
        if request.url.path in ["/api/auth/signup", "/api/auth/signin", "/health"]:
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
                detail=f"Invalid token: {str(e)}"
            )

        return await call_next(request)
```

**Alternatives Considered**:
- FastAPI `Depends` with per-route auth functions: More repetitive, inconsistent
- Third-party middleware: Less control over error handling and user extraction
- OAuth2PasswordBearer from fastapi.security: Too tied to OAuth2 flow, not compatible with Better Auth

---

## User Model Schema Design

**Decision**: User model with `id`, `email`, `username`, `hashed_password`, and `created_at` fields.

**Rationale**:
- `id`: Primary key (UUID for security and distributed systems)
- `email`: Unique identifier for sign-in, requires uniqueness constraint
- `username`: Unique display name, requires uniqueness constraint
- `hashed_password`: Securely stored password using bcrypt or argon2
- `created_at`: Timestamp for auditing and user lifecycle management

**Implementation Approach**:
```python
# backend/src/models/user.py
from typing import Optional
from sqlmodel import Field, SQLModel
from datetime import datetime
import uuid

class User(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    email: str = Field(unique=True, index=True, max_length=255)
    username: str = Field(unique=True, index=True, max_length=100)
    hashed_password: str = Field(max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserCreate(SQLModel):
    email: str
    username: str
    password: str  # Plain text, will be hashed

class UserRead(SQLModel):
    id: str
    email: str
    username: str
    created_at: datetime
```

**Alternatives Considered**:
- Auto-increment integer ID: Exposes user count, less secure
- Separate Profile model: Over-engineering for initial implementation
- Additional fields (bio, avatar): Out of scope for MVP

---

## Password Hashing Strategy

**Decision**: Use `bcrypt` for password hashing with 12 rounds.

**Rationale**:
- bcrypt is battle-tested and industry standard
- Configurable work factor (12 rounds) balances security and performance
- Built-in salt prevents rainbow table attacks
- Python's `passlib` or `bcrypt` packages provide easy integration

**Implementation Approach**:
```python
# backend/src/services/auth_service.py
import bcrypt
from .models import User, UserCreate

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

def verify_password(password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))

async def create_user(user_create: UserCreate, session: AsyncSession) -> User:
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
```

**Alternatives Considered**:
- argon2: More secure but slower, bcrypt is sufficient for most use cases
- PBKDF2: Less secure than bcrypt, requires custom salt management
- SHA256 with custom salt: Vulnerable to GPU brute-force attacks

---

## JWT Token Format and Expiry

**Decision**: HS256-signed JWT with `userId`, `email`, `username`, and `exp` claims. 7-day expiry.

**Rationale**:
- HS256 is sufficient with a strong shared secret
- Minimal payload size for performance
- 7-day expiry balances user convenience and security
- 24-hour session inactivity timeout enforced on frontend

**Token Structure**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "username": "johndoe",
  "iat": 1736064000,
  "exp": 1736668800
}
```

**Implementation Notes**:
- Better Auth automatically generates tokens on sign-in
- Frontend stores token in secure httpOnly cookie or memory
- Frontend attaches token to API calls via `Authorization: Bearer <token>` header
- Backend verifies token signature and claims

**Alternatives Considered**:
- RS256 asymmetric signing: More complex, overkill for single backend
- Longer expiry (30 days): More security risk if token compromised
- Shorter expiry (1 day): Poor user experience, requires frequent re-auth

---

## Frontend Auth Forms and State Management

**Decision**: Server components with client components for forms, Better Auth for session management.

**Rationale**:
- Next.js 16+ App Router prefers server components for initial page load
- Client components needed for form state and validation
- Better Auth provides `signIn`, `signUp`, `signOut` methods
- Auth state accessible via `auth.api.getSession()` on client

**Implementation Approach**:
```typescript
// frontend/src/app/(auth)/signin/page.tsx (server component)
import { SignInForm } from '@/components/auth/SignInForm'

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <SignInForm />
    </div>
  )
}

// frontend/src/components/auth/SignInForm.tsx (client component)
"use client"

import { useState } from 'react'
import { authClient } from '@/lib/auth'

export function SignInForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    const result = await authClient.signIn.email({
      email,
      password
    })
    if (result.error) {
      console.error('Sign in failed:', result.error)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <form onSubmit={handleSignIn}>
      {/* form fields */}
    </form>
  )
}
```

**Alternatives Considered**:
- React Query for auth state: Over-engineering, Better Auth handles this
- Context API for auth state: Better Auth provides built-in state management
- Separate auth library: Adds dependency bloat

---

## API Client for Frontend-Backend Communication

**Decision**: Create centralized API client that automatically attaches JWT to requests.

**Rationale**:
- Consistent error handling across all API calls
- Automatic token attachment from Better Auth session
- Type-safe API responses using TypeScript
- Easy to test and mock

**Implementation Approach**:
```typescript
// frontend/src/lib/api.ts
import { authClient } from './auth'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Get token from Better Auth session
    const session = await authClient.api.getSession()
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
        // Redirect to sign in
        window.location.href = '/signin'
      }
      throw new Error(`API error: ${response.status}`)
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

**Alternatives Considered**:
- axios: Additional dependency, fetch is sufficient
- SWR or TanStack Query: Over-engineering for MVP
- Per-request token handling: Repetitive and error-prone

---

## Testing Strategy

**Decision**: Multi-layer testing with unit tests, integration tests, and contract tests.

**Rationale**:
- Unit tests: Individual functions (password hashing, token verification)
- Integration tests: End-to-end auth flows (signup → signin → API access)
- Contract tests: API contract validation
- Frontend tests: Form validation and user interactions

**Test Coverage Goals**:
- Backend: 90%+ code coverage for auth-related code
- Frontend: 80%+ coverage for auth components
- Integration: All critical user flows covered

**Implementation Approach**:
```python
# backend/tests/unit/test_auth_service.py
import pytest
from backend.src.services.auth_service import hash_password, verify_password

def test_password_hashing():
    password = "test_password_123"
    hashed = hash_password(password)
    assert hashed != password
    assert verify_password(password, hashed)
    assert not verify_password("wrong_password", hashed)

# backend/tests/integration/test_auth_flow.py
async def test_signup_signin_flow():
    # Test account creation
    response = await client.post("/api/auth/signup", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "SecurePassword123!"
    })
    assert response.status_code == 200
    token = response.json()["token"]

    # Test API access with token
    response = await client.get("/api/tasks", headers={
        "Authorization": f"Bearer {token}"
    })
    assert response.status_code == 200
```

**Alternatives Considered**:
- E2E testing with Playwright: Good for UI, slower and more complex
- Manual testing only: Insufficient for confidence in security-critical code
- Contract testing only: Doesn't catch integration issues

---

## Security Best Practices

### JWT Secret Management
- Store `BETTER_AUTH_SECRET` in environment variables
- Use strong random string (minimum 32 characters)
- Never commit secrets to version control
- Rotate secrets periodically in production

### Password Requirements
- Minimum 12 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

### Error Handling
- Never reveal whether email or password is incorrect
- Rate limit failed sign-in attempts (5 per 15 minutes per IP)
- Log authentication failures for security monitoring
- Return generic error messages to prevent information leakage

### Token Management
- Use httpOnly cookies for additional protection (optional)
- Implement token refresh if needed (not required for 7-day expiry)
- Invalidate tokens on sign out (frontend clears token)
- Support concurrent sessions from multiple devices

---

## Dependencies Summary

### Backend Dependencies
```python
# requirements.txt
fastapi>=0.104.0
sqlmodel>=0.0.14
sqlalchemy[asyncio]>=2.0.0
asyncpg>=0.29.0
pydantic>=2.0.0
python-jose[cryptography]>=3.3.0  # For JWT
bcrypt>=4.0.0
pytest>=7.4.0
pytest-asyncio>=0.21.0
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "better-auth": "^1.0.0",
    "next": "16.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

---

## Integration Points

### Frontend ↔ Better Auth
- Better Auth handles authentication flow
- Issues JWT tokens on successful sign-in
- Stores session in cookie or memory
- Provides `authClient` for auth operations

### Frontend ↔ Backend API
- Frontend API client attaches JWT to requests
- Backend middleware verifies JWT
- Backend extracts user ID from token
- Backend enforces user data isolation

### Backend ↔ Neon Database
- SQLModel models map to database tables
- Async PostgreSQL connection via `asyncpg`
- Connection pooling managed by Neon
- User data stored in `users` table

---

## Open Questions Resolved

**Q: Should we support password reset functionality?**
A: Not included in initial scope (FR-009 covers sign out only). Can be added as a follow-up feature.

**Q: Should we support social auth (Google, GitHub, etc.)?**
A: Not included in initial scope. Email/password only per spec. Can be extended later.

**Q: Should tokens be stored in cookies or localStorage?**
A: Better Auth defaults to cookies (httpOnly, secure). This is more secure than localStorage and automatically handled.

**Q: Should we implement token refresh?**
A: Not needed for 7-day expiry. Users re-authenticate after expiry, which is acceptable for this use case.

---

## Conclusion

This research provides a comprehensive approach to implementing secure user authentication with Better Auth and FastAPI. All technical decisions follow the project constitution and best practices. The implementation will proceed in Phase 1 with data model, contracts, and quickstart documentation.
