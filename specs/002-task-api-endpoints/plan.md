# Implementation Plan: Task API Endpoints

**Branch**: `002-task-api-endpoints` | **Date**: 2026-01-07 | **Spec**: [Task API Endpoints](../spec.md)
**Input**: Feature specification from `/specs/002-task-api-endpoints/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Implement RESTful CRUD endpoints for Task management, scoped to the authenticated user.
Approach:
1. Define `Task` SQLModel.
2. Update Auth middleware to extract user_id from JWT.
3. Create FastAPI routes in `backend/src/api/routes/tasks.py`.
4. Integrate with Neon DB using SQLModel session.
5. Setup frontend API client in Next.js to call these endpoints.

## Technical Context

**Language/Version**: Python 3.11 (Backend), TypeScript 5.x (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, Pydantic, Better Auth (Next.js client), Axios/Fetch
**Storage**: Neon Serverless PostgreSQL
**Testing**: Pytest (Backend), Jest/React Testing Library (Frontend)
**Target Platform**: Web Application (monorepo)
**Project Type**: Web application
**Performance Goals**: <200ms API response time
**Constraints**: Stateless auth via JWT, Strict user isolation
**Scale/Scope**: Feature-scoped (Tasks resource)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)?
- [x] **Phase**: Change allowed in active phase (Phase 2)?
- [x] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB?
- [x] **Security**: JWT verification required for all new endpoints?
- [x] **Scoping**: Data access scoped to user via `user_id` from JWT?
- [x] **API**: URL follows `/api/{user_id}/tasks` pattern?
- [x] **Persistence**: Database access ONLY via backend API?
- [x] **Secrets**: No secrets stored on frontend?

## Project Structure

### Documentation (this feature)

```text
specs/002-task-api-endpoints/
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
│   │   └── task.py          # NEW: Task SQLModel definition
│   ├── api/
│   │   ├── routes/
│   │   │   └── tasks.py     # NEW: Task CRUD endpoints
│   │   └── middleware/      # UPDATE: Auth middleware if needed
│   └── main.py              # UPDATE: Register task router
└── tests/
    └── api/
        └── test_tasks.py    # NEW: Task API tests

frontend/
├── src/
│   └── lib/
│       └── api.ts           # UPDATE: Add task API methods
└── tests/                   # UPDATE: Add integration tests if applicable
```

**Structure Decision**: Monorepo with explicit separation between Backend (FastAPI/SQLModel) and Frontend (Next.js).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
