---
id: phr-spec-task-api-endpoints-001
title: task-api-endpoints-spec
stage: spec
date: 2026-01-07
surface: claude-code
model: sonnet-3.5
feature: task-api-endpoints
branch: 002-task-api-endpoints
user: user
command: /sp.specify
labels: [spec, feature, backlog]
links:
  spec: specs/002-task-api-endpoints/spec.md
  ticket:
  adr:
  pr:
files:
  - specs/002-task-api-endpoints/spec.md
  - specs/002-task-api-endpoints/checklists/requirements.md
tests:

---

## Prompt

generate a detailed specification focused on RESTful API endpoints for Todo Full-Stack Web Application. Build on existing auth: Implement endpoints - GET /api/{user_id}/tasks (list all user tasks), POST /api/{user_id}/tasks (create new task), GET /api/{user_id}/tasks/{id} (get task details), PUT /api/{user_id}/tasks/{id} (update task), DELETE /api/{user_id}/tasks/{id} (delete task), PATCH /api/{user_id}/tasks/{id}/complete (toggle completion). Use SQLModel for Task model (id, user_id, content, completed, etc.) with Neon PostgreSQL persistence. Secure with existing JWT middleware: Verify token, extract user_id, enforce ownership (filter/modify only own tasks), return 401 for unauthorized/missing token. Ensure user isolation, stateless auth. Integrate with frontend: Next.js API calls with Bearer token headers. Technology stack subset: Backend - Python FastAPI; ORM - SQLModel; Database - Neon Serverless PostgreSQL; Authentication - Better Auth (JWT). Output the spec in a structured format with sections for overview, Task model, endpoint details, security enforcement, ownership checks, error handling, and frontend integration.

## Response snapshot

Created feature specification for Task API Endpoints.
- Generated spec file: specs/002-task-api-endpoints/spec.md
- Generated checklist: specs/002-task-api-endpoints/checklists/requirements.md
- Validated spec against checklist (all passed)

## Outcome

- ✅ Impact: Drafted complete specification for task management API
- 🧪 Tests: No tests generated yet (spec phase)
- 📁 Files: Created spec.md and requirements.md
- 🔁 Next prompts: /sp.plan
- 🧠 Reflection: Spec generation was straightforward with clear requirements provided by user.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): N/A
- Prompt variant (if applicable): default
- Next experiment (smallest change to try): N/A
