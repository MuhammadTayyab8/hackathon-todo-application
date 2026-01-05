---
id: PHR-20260105-000
title: user-auth-spec
stage: spec
date: 2026-01-05T00:00:00Z
surface: cli
model: claude-sonnet-4.5-20250929
feature: 001-user-auth
branch: 001-user-auth
user: unspecified
command: /sp.specify
labels: [auth, spec, specification, user-stories]
links:
  spec: ../../../../specs/001-user-auth/spec.md
  ticket: ""
  adr: ""
  pr: ""
files:
  - path: specs/001-user-auth/spec.md
    role: "Feature specification with user stories, requirements, and success criteria"
  - path: specs/001-user-auth/checklists/requirements.md
    role: "Specification quality checklist"
tests:
  - type: spec-validation
    scope: "Quality checklist validation with one clarification resolved"
---

## Prompt

generate a specification focused on authentication for Todo Full-Stack Web Application. Include user signup/signin using Better Auth on Next.js frontend, configured to issue JWT tokens. Store user data in Neon Serverless PostgreSQL database using SQLModel ORM (define User model with id, email, username, hashed_password). Connect to Neon DB with connection string in env vars. Secure API with Better Auth + FastAPI integration: Enable JWT plugin in Better Auth config to issue tokens on login, attach JWT to frontend API headers (Authorization: Bearer <token>), add FastAPI middleware to verify JWT signature using shared BETTER_AUTH_SECRET env var, extract user ID/email, and enforce user isolation. Ensure stateless auth, token expiry (e.g., 7 days), 401 Unauthorized for invalid/missing tokens, and no shared DB sessions. Technology stack subset: Frontend - Next.js 16+ (App Router) for auth forms; Backend - uv for project management; Python FastAPI for middleware; ORM - SQLModel; Database - Neon Serverless PostgreSQL; Authentication - Better Auth. Output the spec in a structured format with sections for overview, DB setup, auth features, JWT flow, middleware details, security benefits, and integration changes.

## Response snapshot

Successfully generated specification for user authentication feature:

**Created Branch**: `001-user-auth` (feature 001, short-name "user-auth")

**Created Files**:

1. **specs/001-user-auth/spec.md** - Comprehensive feature specification with:
   - User Story 1 (P1): New User Account Creation - signup flow with validation
   - User Story 2 (P1): Returning User Sign In - authentication with credentials
   - User Story 3 (P2): Secure API Access - JWT-based API protection
   - 20 Functional Requirements (FR-001 to FR-020)
   - 2 Key Entities: User, Authentication Token
   - 8 Success Criteria (SC-001 to SC-008)
   - 10 Edge cases identified

2. **specs/001-user-auth/checklists/requirements.md** - Quality checklist for specification validation

**Clarification Resolved**: The spec initially contained one [NEEDS CLARIFICATION] marker for inactivity timeout period. This was resolved using a reasonable default of 24 hours based on industry standards for web applications.

**Key Requirements**:
- Unique email and username constraints
- Password complexity requirements (minimum 12 chars with uppercase, lowercase, number, special char)
- Bcrypt password hashing
- 7-day JWT token expiry
- 24-hour session inactivity timeout
- User data isolation enforced
- 401 Unauthorized for missing/invalid tokens
- Support for concurrent sign-ins from multiple devices

**Note**: The spec intentionally contains technology-specific terms (Better Auth, JWT, Next.js, FastAPI, SQLModel, API) per the user's detailed input. These represent the architecture decisions rather than implementation details that should be avoided in a pure business spec.

## Outcome

- ✅ Impact: Complete feature specification for user authentication ready for planning phase
- 🧪 Tests: Quality checklist created, one clarification resolved with informed decision
- 📁 Files: 2 files created (spec.md, requirements checklist)
- 🔁 Next prompts: Run /sp.plan to generate technical implementation plan
- 🧠 Reflection: Specification captures all auth requirements with clear user stories and measurable success criteria. Ready for planning phase.

## Evaluation notes (flywheel)

- Failure modes observed: Spec contains some implementation-specific terms per detailed user input (Better Auth, JWT, specific stack) - acceptable as these were architectural decisions explicitly provided by user
- Graders run and results (PASS/FAIL): Quality Checklist: INCOMPLETE (one clarification resolved but spec retains tech-specific terms per user request)
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to planning phase via /sp.plan
