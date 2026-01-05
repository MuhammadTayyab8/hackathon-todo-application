---
name: better-auth
description: Implements secure user authentication using Better Auth library in FastAPI apps. Use for signup, signin, JWT sessions, and protected routes in web apps.
allowed-tools: Read, Grep, Bash(python:*)
---

# Better Auth Implementation Guide
## Instructions
1. Install: Run `uv add better-auth` in the backend environment.
2. Configure: Create auth middleware with JWT secret from env vars.
3. Models: Use SQLModel for User table (id, username, hashed_password).
4. Routes: Define POST /signup (hash password), POST /signin (verify and issue JWT), middleware for protected endpoints.
5. Integration: Connect to DB engine, handle errors like invalid credentials.
6. Best Practices: Use bcrypt for hashing, secure JWT expiry.

## Example Code Snippet
from better_auth import BetterAuth, JWTMiddleware
auth = BetterAuth(secret='your-secret')
app.add_middleware(JWTMiddleware, auth=auth)

@app.post("/signup")
async def signup(user: UserCreate):
    # Hash and save to DB