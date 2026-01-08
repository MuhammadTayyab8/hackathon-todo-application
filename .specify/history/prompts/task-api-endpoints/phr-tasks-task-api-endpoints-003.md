---
id: phr-tasks-task-api-endpoints-003
title: task-endpoints-generated
stage: tasks
date: 2026-01-08
surface: cli
model: claude-sonnet-4-5-20250929
feature: task-api-endpoints
branch: 002-task-api-endpoints
user: unknown
command: /sp.tasks
labels: [tasks, api, security, sqlmodel, backend, frontend]
links:
  spec: specs/002-task-api-endpoints/spec.md
  ticket:
  adr:
  pr:
files:
  - specs/002-task-api-endpoints/tasks.md
tests:
---

## Prompt

break the API technical plan into executable tasks for Todo Full-Stack Web Application. Create a list of granular tasks focused on endpoints + security. Examples:
1. Define SQLModel Task model with user_id foreign key.
2. Add DB session dependency in FastAPI.
3. Implement GET /api/{user_id}/tasks (query tasks where task.user_id == current_user.id).
4. Implement POST /api/{user_id}/tasks (create task with user_id from JWT).
5. Similarly for other endpoints, with ownership checks (raise 403/404 if not owner).
6. Update middleware if needed for user extraction.
7. Set up frontend API service file in Next.js to include JWT in headers.
8. Test endpoints with authenticated requests, verify isolation. Assign tasks to agents (e.g., backend-agent for models/routes, frontend-agent for calls). Ensure tasks use spec-driven approach, no manual coding, and invoke skills like sqlmodel, python-fastapi, better-auth. Output as a numbered list with descriptions, dependencies, assigned agent, and expected outputs.

## Response snapshot

Generated `specs/002-task-api-endpoints/tasks.md` with:
- Phase 1: Setup (T001-T002)
- Phase 2: Foundational (T003-T006) - Models, Routes, Middleware
- Phase 3: User Story 1 (T007-T012) - RESTful CRUD implementation
- Phase 4: User Story 2 (T013-T014) - Task completion toggle
- Phase 5: Polish (T015-T016) - Security verification

The tasks file is structured for spec-driven execution.

## Outcome

- ✅ Impact: Executable task list created for Task API feature.
- 🧪 Tests: Independent tests defined for each user story.
- 📁 Files: Created `specs/002-task-api-endpoints/tasks.md`.
- 🔁 Next prompts: "Implement tasks from specs/002-task-api-endpoints/tasks.md" or use `/sp.implement`.
- 🧠 Reflection: Tasks are granular and security-focused, aligning with project constitution.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): N/A
