# Implementation Plan: Phase II Task Updates & Category Integration

**Branch**: `002-phase-ii-tasks` | **Date**: 2026-01-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-phase-ii-tasks/spec.md`

## Summary

This plan implements Phase II requirements for the Todo Application:
1.  **Backend**: Upgrade `Task` model (Title, Desc, Due Date, Category FK), introduce `Category` model, and enable Alembic migrations.
2.  **API**: Update endpoints to support new fields and return Joined data (`Task` + `Category Name`).
3.  **Frontend**: Build the missing Task Management UI (List, Create/Edit Forms) using the updated API and Forms.

## Technical Context

**Language/Version**: Python 3.12 (Backend), TypeScript 5+ (Frontend)
**Primary Dependencies**: FastAPI, SQLModel, Alembic (Backend); Next.js 16, React Hook Form, Zod (Frontend)
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest (Backend)
**Target Platform**: Web
**Project Type**: Web Application
**Performance Goals**: N/A
**Constraints**: User Isolation enforced via JWT and `user_id` scoping.
**Scale/Scope**: Feature-level update.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)?
- [x] **Phase**: Change allowed in active phase (Phase 2 - Web UI + Logic)?
- [x] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB?
- [x] **Security**: JWT verification required for all new endpoints?
- [x] **Scoping**: Data access scoped to user via `user_id` from JWT?
- [x] **API**: URL follows `/api/{user_id}/tasks` pattern?
- [x] **Persistence**: Database access ONLY via backend API?
- [x] **Secrets**: No secrets stored on frontend?

## Project Structure

### Documentation (this feature)

```text
specs/002-phase-ii-tasks/
├── plan.md              # This file
├── research.md          # Research findings
├── data-model.md        # Entity definitions
├── quickstart.md        # Dev setup
├── contracts/           # API Specs
└── tasks.md             # To be generated
```

### Source Code

```text
backend/
├── src/
│   ├── models/
│   │   ├── category.py     # New
│   │   └── task.py         # Update
│   ├── api/
│   │   └── routes/
│   │       ├── tasks.py    # Update
│   │       └── categories.py # New (Helper)
│   └── migrations/         # New (Alembic)
└── tests/

frontend/
├── src/
│   ├── components/
│   │   └── tasks/          # New
│   │       ├── TaskList.tsx
│   │       ├── TaskForm.tsx
│   │       └── TaskItem.tsx
│   └── lib/
│       └── api.ts          # Update client
```

**Structure Decision**: Standard "Option 2: Web application" structure with new components for Task UI and new backend models.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       |            |                                     |
