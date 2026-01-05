---
id: PHR-20260105-001
title: user-auth-plan
stage: plan
date: 2026-01-05T00:00:00Z
surface: cli
model: claude-sonnet-4.5-20250929
feature: 001-user-auth
branch: 001-user-auth
user: unspecified
command: /sp.plan
labels: [auth, jwt, better-auth, sqlmodel, fastapi]
links:
  spec: ../../../../specs/001-user-auth/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - path: specs/001-user-auth/plan.md
    role: "Implementation plan with technical context and project structure"
  - path: specs/001-user-auth/research.md
    role: "Phase 0 research findings for technology choices and patterns"
  - path: specs/001-user-auth/data-model.md
    role: "Phase 1 data model definition (User entity)"
  - path: specs/001-user-auth/contracts/openapi.yaml
    role: "Phase 1 OpenAPI contract for auth endpoints"
  - path: specs/001-user-auth/quickstart.md
    role: "Phase 1 quickstart guide for implementation"
  - path: .claude/agents/frontend-agent/AGENT.md
    role: "Updated frontend agent context with auth info"
  - path: .claude/agents/backend-agent/AGENT.md
    role: "Updated backend agent context with auth info"
tests:
  - type: spec-validation
    scope: "Constitution check passed for all 8 gates"
---

## Prompt

generate a technical plan based on the auth spec for Todo Full-Stack Web Application. Focus on auth implementation: Outline steps for DB connection (Neon PostgreSQL setup, SQLModel engine creation, User model definition). Plan Better Auth config on Next.js (enable JWT plugin, shared secret, signup/signin routes). Plan frontend to store/issue JWT on login and attach to API headers. Plan FastAPI middleware for JWT verification (extract token from headers, decode with secret, get user ID, add to request context for ownership checks). Include error handling (401 responses), hashing passwords, and testing. Delegate to agents: backend-agent for FastAPI/SQLModel/Neon/middleware, frontend-agent for Next.js auth integration. Ensure no manual coding; use skills like better-auth, sqlmodel, python-fastapi. Output the plan in markdown with sections for DB plan, frontend auth plan, backend middleware plan, JWT flow, security enforcement, and validation steps.

## Response snapshot

Successfully generated comprehensive implementation plan for user authentication (feature 001-user-auth):

**Created Artifacts:**

1. **plan.md** - Implementation plan with:
   - Technical context (Python 3.11+, TypeScript 5.0+, FastAPI, Better Auth, SQLModel, Neon)
   - Constitution check (all 8 gates passed pre- and post-Phase 1)
   - Project structure (monorepo with frontend/ and backend/ directories)
   - No complexity violations

2. **research.md** - Phase 0 research covering:
   - Neon PostgreSQL + SQLModel integration (asyncpg driver)
   - Better Auth configuration with JWT plugin
   - FastAPI JWT verification middleware design
   - User model schema (id, email, username, hashed_password, created_at)
   - Password hashing strategy (bcrypt with 12 rounds)
   - JWT token format and 7-day expiry
   - Frontend auth forms and state management
   - API client design with automatic token attachment
   - Testing strategy (unit, integration, contract)
   - Security best practices
   - All dependencies and integration points

3. **data-model.md** - Phase 1 data model:
   - User entity with full field definitions
   - Validation rules (email, username, password complexity)
   - PostgreSQL schema with indexes
   - SQLModel model definitions
   - Request/Response DTOs (UserCreate, UserRead, UserSignIn, AuthResponse)
   - Future relationships (User → Tasks)
   - Security considerations and lifecycle flows

4. **contracts/openapi.yaml** - Phase 1 API contract:
   - POST /api/auth/signup - Account creation
   - POST /api/auth/signin - User sign-in
   - POST /api/auth/signout - User sign-out (protected)
   - GET /api/auth/me - Get current user (protected)
   - Full schemas and error responses
   - BearerAuth security scheme

5. **quickstart.md** - Implementation guide with:
   - Prerequisites and environment setup
   - Backend implementation steps (db.py, user.py, auth_service.py, jwt_middleware.py, auth.py, main.py)
   - Frontend implementation steps (auth.ts, api.ts, SignUpForm.tsx, SignInForm.tsx, pages)
   - Running instructions and test commands

6. **Updated agent contexts:**
   - frontend-agent/AGENT.md - Added Better Auth skill and current auth context
   - backend-agent/AGENT.md - Added detailed auth context (JWT middleware, endpoints, security)

**Key Decisions:**
- JWT with HS256, 7-day expiry, shared secret
- bcrypt password hashing (12 rounds)
- Stateful tokens, no refresh needed (24-hour session inactivity)
- User model with UUID primary key
- Async PostgreSQL via asyncpg driver
- Middleware-based JWT verification on FastAPI

## Outcome

- ✅ Impact: Complete technical plan for user authentication ready for implementation
- 🧪 Tests: Constitution validation passed (8/8 gates), no security violations
- 📁 Files: 7 files created/modified (plan.md, research.md, data-model.md, openapi.yaml, quickstart.md, 2 AGENT.md files)
- 🔁 Next prompts: Run /sp.tasks to generate actionable implementation tasks
- 🧠 Reflection: Plan follows all constitution requirements, includes comprehensive security considerations, and provides clear path for delegated implementation via frontend/backend agents

## Evaluation notes (flywheel)

- Failure modes observed: None - all validation checks passed
- Graders run and results (PASS/FAIL): Constitution Check: PASS (8/8)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to task generation via /sp.tasks
