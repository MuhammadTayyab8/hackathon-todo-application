---
id: const-20260104-001
title: update-project-constitution-v1
stage: constitution
date: 2026-01-04
surface: cli
model: claude-sonnet-4-5-20250929
feature: n/a
branch: master
user: default
command: /sp.constitution
labels: [constitution, setup, hackathon]
links:
  spec: n/a
  ticket: n/a
  adr: n/a
  pr: n/a
files:
  - path: .specify/memory/constitution.md
    action: update
  - path: .specify/templates/plan-template.md
    action: update
tests: []
---

## Prompt

You are Claude Code operating under Spec-Kit Plus for a hackathon project.

Project Name:
Hackathon Todo Application

Core Rules:
- Follow strict Spec-Driven Development (SDD).
- All development must follow the sequence:
  Constitution → Specification → Planning → Task Breakdown → Implementation.
- Specs are the single source of truth.
- If implementation conflicts with specs, update specs first.

Development Phases:
- Phase 1 (phase1-console): Task CRUD logic only.
- Phase 2 (phase2-web): Task CRUD + Authentication + Web UI.
- Phase 3 (phase3-chatbot): Task CRUD + Authentication + Chatbot.
Only implement features allowed in the active phase.

Technology Stack (Must Not Change):
- Frontend: Next.js 16+ using App Router
- Backend: Python FastAPI
- ORM: SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth (Next.js) with JWT tokens
- API Style: REST
- Repository Type: Monorepo

Authentication & Security Rules:
- All backend API routes must require JWT authentication.
- JWT tokens are issued by Better Auth on the frontend.
- JWT must be sent in Authorization: Bearer <token> header.
- Backend must verify JWT using shared secret BETTER_AUTH_SECRET.
- User identity must be extracted from JWT, not trusted from client input.
- All data access must be scoped to the authenticated user.
- Requests without valid JWT must return 401 Unauthorized.

API Design Rules:
- RESTful endpoints only.
- URL structure must follow: /api/{user_id}/tasks
- Backend must verify that {user_id} matches the JWT user ID.
- No user may access or modify another user’s data.

Database Rules:
- Use SQLModel models derived strictly from specs.
- Tasks must be linked to users via user_id.
- No database access from frontend.

Frontend Rules:
- Frontend must never store secrets.
- JWT handling must be done via Better Auth.
- All API calls must attach JWT automatically.
- UI must be responsive and multi-user aware.

Spec Management Rules:
- All specifications must be written into the specs/ directory.
- Use organized spec structure:
  - specs/features/
  - specs/api/
  - specs/database/
  - specs/ui/
- Specs should evolve over time through /sp.specify, not manual edits.
- Maintain clear spec history for review and evaluation.

Quality & Review Rules:
- Prefer clarity over cleverness.
- Generate readable, maintainable code.
- After implementation, be able to explain how specs map to code.
- Be prepared to analyze spec drift and correct it.

Primary Goal:
Demonstrate correct and complete use of Spec-Kit Plus with Claude Code,
showing a clear history of specification, planning, and AI-driven implementation.

## Response snapshot

Updated the project constitution at `.specify/memory/constitution.md` with version 1.0.0. Propagated constitution checks to `.specify/templates/plan-template.md`.

## Outcome

- ✅ Impact: Established core project rules and tech stack in the constitution.
- 🧪 Tests: n/a
- 📁 Files: Updated constitution.md and plan-template.md
- 🔁 Next prompts: /sp.specify to create initial feature specs.
- 🧠 Reflection: The constitution now strictly defines the tech stack and security model required for the hackathon.

## Evaluation notes (flywheel)

- Failure modes observed: n/a
- Graders run and results (PASS/FAIL): n/a
- Prompt variant (if applicable): n/a
- Next experiment (smallest change to try): n/a
