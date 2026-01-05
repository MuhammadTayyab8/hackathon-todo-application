# Implementation Plan: User Authentication

**Branch**: `001-user-auth` | **Date**: 2026-01-05 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-user-auth/spec.md`

## Summary

Implement secure user authentication with account creation, sign-in/sign-out, and JWT-based API protection. Users can register with email/username/password, store credentials securely, and access protected API endpoints with time-limited tokens. All user data is strictly isolated per-user, with proper error handling and security enforcement.

## Technical Context

**Language/Version**: Python 3.11+, TypeScript 5.0+
**Primary Dependencies**: FastAPI, Better Auth, SQLModel, Next.js 16+
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest, @testing-library/react, jest
**Target Platform**: Web (browser)
**Project Type**: web (frontend + backend monorepo)
**Performance Goals**: <200ms p95 for auth requests, 1000+ concurrent users
**Constraints**: 7-day token expiry, 24-hour session inactivity timeout
**Scale/Scope**: Initial deployment supporting 1000+ users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Pre-Phase 0)
- [x] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)? ✓
- [x] **Phase**: Change allowed in active phase ([Phase 2])? ✓ (Authentication is Phase 2)
- [x] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB? ✓
- [x] **Security**: JWT verification required for all new endpoints? ✓
- [x] **Scoping**: Data access scoped to user via `user_id` from JWT? ✓
- [x] **API**: URL follows `/api/{user_id}/tasks` pattern? ✓ (auth endpoints will follow `/api/auth/*` pattern)
- [x] **Persistence**: Database access ONLY via backend API? ✓
- [x] **Secrets**: No secrets stored on frontend? ✓

### Post-Phase 1 Re-evaluation
- [x] **SDD**: All decisions trace back to spec and research
- [x] **Phase**: Auth is explicitly Phase 2 feature ✓
- [x] **Stack**: Better Auth (Next.js) + FastAPI + SQLModel + Neon confirmed
- [x] **Security**: JWT middleware verifies tokens on all protected routes ✓
- [x] **Scoping**: User model defines `user_id` for data isolation ✓
- [x] **API**: Auth endpoints follow `/api/auth/*` pattern, protected routes use JWT ✓
- [x] **Persistence**: SQLModel models enforce schema, frontend only via API client ✓
- [x] **Secrets**: `BETTER_AUTH_SECRET` only in environment variables ✓

**Status**: All Constitution checks passed. Ready for Phase 2 (task generation).

## Project Structure

### Documentation (this feature)

```text
specs/001-user-auth/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (/sp.plan command)
├── data-model.md        # Phase 1 output (/sp.plan command)
├── quickstart.md        # Phase 1 output (/sp.plan command)
├── contracts/           # Phase 1 output (/sp.plan command)
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── models/
│   │   └── user.py          # User model with id, email, username, hashed_password
│   ├── services/
│   │   └── auth_service.py  # User creation, password hashing, token validation
│   └── api/
│       ├── routes/
│       │   └── auth.py      # Sign up, sign in, sign out endpoints
│       └── middleware/
│           └── jwt_middleware.py  # JWT verification middleware
├── db.py                    # Neon PostgreSQL connection with SQLModel engine
└── tests/
    ├── contract/
    ├── integration/
    └── unit/

frontend/
├── src/
│   ├── components/
│   │   └── auth/
│   │       ├── SignUpForm.tsx
│   │       └── SignInForm.tsx
│   ├── lib/
│   │   └── auth.ts          # Better Auth configuration with JWT plugin
│   └── app/
│       └── (auth)/
│           ├── signup/
│           │   └── page.tsx
│           └── signin/
│               └── page.tsx
└── tests/
```

**Structure Decision**: Web application with separate frontend (Next.js) and backend (FastAPI) directories, connected via REST API with JWT authentication.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |
