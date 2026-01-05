<!--
Sync Impact Report
Version change: 1.0.0 (Initial)
Modified principles:
- I. Spec-Driven Development (SDD)
- II. Phased Development (Phase 1-3)
- III. Technology Stack (Next.js/FastAPI/SQLModel/Neon)
- IV. Authentication & Security (JWT/Better Auth)
- V. API Design & Scoping (RESTful/User-Scoped)
- VI. Spec Management (Specs as Single Source of Truth)
- VII. Quality & Review (Clarity/Maintainability)
Added sections: Technology Stack, Security & API Rules, Database & Frontend Rules
Removed sections: N/A
Templates requiring updates:
- .specify/templates/plan-template.md (✅ updated)
- .specify/templates/spec-template.md (✅ updated)
- .specify/templates/tasks-template.md (✅ updated)
Follow-up TODOs: N/A
-->

# Hackathon Todo Application Constitution

## Core Principles

### I. Spec-Driven Development (SDD)
- All development MUST follow the sequence: Constitution → Specification → Planning → Task Breakdown → Implementation.
- Specifications are the single source of truth for all features and logic.
- If implementation conflicts with specs, specs MUST be updated and approved first.
- Strictly adhere to AI-driven implementation workflows.

### II. Phased Development
- Implementation MUST proceed through defined phases:
  - Phase 1 (phase1-console): Task CRUD logic only.
  - Phase 2 (phase2-web): Task CRUD + Authentication + Web UI.
  - Phase 3 (phase3-chatbot): Task CRUD + Authentication + Chatbot.
- Only features explicitly allowed in the active phase MUST be implemented.

### III. Technology Stack (Static)
- Frontend: Next.js 16+ using App Router.
- Backend: Python FastAPI.
- ORM: SQLModel.
- Database: Neon Serverless PostgreSQL.
- Authentication: Better Auth (Next.js) with JWT tokens.
- API Style: REST.
- Repository: Monorepo.

### IV. Authentication & Security
- All backend API routes MUST require JWT authentication.
- JWT tokens are issued by Better Auth on the frontend and sent in the `Authorization: Bearer <token>` header.
- Backend MUST verify JWT using the shared secret `BETTER_AUTH_SECRET`.
- User identity MUST be extracted from the JWT; client-supplied IDs MUST be verified against the token.
- Requests without a valid JWT MUST return 401 Unauthorized.

### V. API Design & Scoping
- RESTful endpoints only: `/api/{user_id}/tasks`.
- All data access and modifications MUST be scoped to the authenticated user.
- No user may access or modify another user’s data.
- Backend MUST verify that the `{user_id}` in the URL matches the JWT user ID.

### VI. Spec Management
- All specifications MUST be written into the `specs/` directory using an organized structure:
  - `specs/features/`
  - `specs/api/`
  - `specs/database/`
  - `specs/ui/`
- Specs MUST evolve through the `/sp.specify` command, not manual edits.

### VII. Quality & Review
- Prefer clarity over cleverness; code MUST be readable and maintainable.
- Implementation MUST be traceable back to specifications.
- Spec drift MUST be identified and corrected proactively.

## Technology & Infrastructure

### Database Rules
- Use SQLModel models derived strictly from specifications.
- Tasks MUST be linked to users via a `user_id` foreign key.
- No direct database access from the frontend; all persistence MUST go through the backend API.

### Frontend Rules
- Frontend MUST never store secrets (API keys, shared secrets).
- JWT handling and session management MUST be done via Better Auth.
- All API calls MUST attach the JWT automatically.
- UI MUST be responsive and aware of multiple users.

## Governance
- This Constitution supersedes all other development practices in the project.
- Amendments to the Constitution MUST be documented, versioned, and propagate to all templates.
- All Pull Requests and implementation tasks MUST be checked against these principles for compliance.

**Version**: 1.0.0 | **Ratified**: 2026-01-04 | **Last Amended**: 2026-01-04
