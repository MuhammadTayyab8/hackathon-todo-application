---
description: "Task list for Task API Endpoints implementation"
---

# Tasks: Task API Endpoints

**Input**: Design documents from `/specs/002-task-api-endpoints/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/openapi.yaml

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project prerequisites and dependencies (FastAPI, SQLModel, etc.)
- [x] T002 Update `backend/src/models/__init__.py` to expose future Task model

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [x] T003 Define Task SQLModel in `backend/src/models/task.py` with foreign key to User
- [x] T004 [P] Create initial empty router file `backend/src/api/routes/tasks.py`
- [x] T005 Register tasks router in `backend/src/main.py`
- [x] T006 [P] Verify/Update `backend/src/api/middleware/jwt_middleware.py` to ensure user_id is properly set in request state

## Phase 3: User Story 1 - Manage Personal Tasks (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can create, read, update, and delete their own tasks.

**Independent Test**: Use Postman/curl to perform CRUD operations with a valid JWT. Accessing another user's task should fail.

### Implementation for User Story 1

- [x] T007 [US1] Implement `GET /api/{user_id}/tasks` (List) in `backend/src/api/routes/tasks.py` with ownership check
- [x] T008 [US1] Implement `POST /api/{user_id}/tasks` (Create) in `backend/src/api/routes/tasks.py` using user_id from token
- [x] T009 [US1] Implement `GET /api/{user_id}/tasks/{task_id}` (Detail) in `backend/src/api/routes/tasks.py`
- [x] T010 [US1] Implement `PUT /api/{user_id}/tasks/{task_id}` (Update) in `backend/src/api/routes/tasks.py`
- [x] T011 [US1] Implement `DELETE /api/{user_id}/tasks/{task_id}` (Delete) in `backend/src/api/routes/tasks.py`
- [x] T012 [P] [US1] Update `frontend/src/lib/api.ts` to include typed methods for Task CRUD operations

## Phase 4: User Story 2 - Toggle Task Completion (Priority: P2)

**Goal**: Efficiently toggle task status without sending full update payload.

**Independent Test**: PATCH request toggles the boolean status of the task.

### Implementation for User Story 2

- [x] T013 [US2] Implement `PATCH /api/{user_id}/tasks/{task_id}/complete` in `backend/src/api/routes/tasks.py`
- [x] T014 [US2] Add toggle method to `frontend/src/lib/api.ts`

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements and validation

- [x] T015 Verify isolation: Ensure User A cannot access User B's tasks (via manual test or script)
- [x] T016 Check error handling consistency (401 vs 403 vs 404) across all new endpoints

## Dependencies & Execution Order

1. **Setup & Foundational** (T001-T006) must be done first.
2. **User Story 1** (T007-T012) implements core CRUD.
3. **User Story 2** (T013-T014) adds convenience endpoint.
4. **Polish** (T015-T016) validates security requirements.

## Implementation Strategy

1. **Backend First**: Implement models and API endpoints. Test with curl/Postman.
2. **Frontend Integration**: Update `api.ts` to consume the new endpoints.
