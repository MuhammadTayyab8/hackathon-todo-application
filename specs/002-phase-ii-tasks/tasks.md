---
description: "Implementation tasks for Phase II Task Updates & Category Integration"
---

# Tasks: Phase II Task Updates & Category Integration

**Input**: Design documents from `/specs/002-phase-ii-tasks/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Install alembic and update requirements in backend/requirements.txt
- [ ] T002 Initialize Alembic configuration in backend/alembic.ini and backend/src/migrations/env.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Create Category model in backend/src/models/category.py
- [ ] T004 Update Task model with new fields and FK in backend/src/models/task.py
- [ ] T005 Create migration script for new schema in backend/src/migrations/versions/
- [ ] T006 Apply migrations to update database schema (alembic upgrade head)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create Rich Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable users to create tasks with Title, Description, DueDate, and Category.

**Independent Test**: Send POST to /api/{user_id}/tasks with new payload; verify 201 Created and persisted data including CategoryID.

### Implementation for User Story 1

- [ ] T007 [US1] Create POST /api/categories endpoint (helper) or seed script in backend/src/api/routes/categories.py
- [ ] T008 [US1] Update TaskCreate and TaskRead schemas in backend/src/models/task.py
- [ ] T009 [US1] Update POST /api/{user_id}/tasks endpoint in backend/src/api/routes/tasks.py
- [ ] T010 [P] [US1] Create TaskForm component in frontend/src/components/tasks/TaskForm.tsx
- [ ] T011 [P] [US1] Update API client with createTask function in frontend/src/lib/api.ts

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - View Tasks with Category Context (Priority: P1)

**Goal**: Display tasks with their associated Category Name in the list view.

**Independent Test**: GET /api/{user_id}/tasks returns list objects containing "category_name".

### Implementation for User Story 2

- [ ] T012 [US2] Update TaskRead schema to include category_name in backend/src/models/task.py
- [ ] T013 [US2] Update GET /api/{user_id}/tasks to use SQL Join in backend/src/api/routes/tasks.py
- [ ] T014 [US2] Update GET /api/{user_id}/tasks/{id} to use SQL Join in backend/src/api/routes/tasks.py
- [ ] T015 [P] [US2] Create TaskItem component in frontend/src/components/tasks/TaskItem.tsx
- [ ] T016 [P] [US2] Create TaskList component in frontend/src/components/tasks/TaskList.tsx

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Update Task Details (Priority: P2)

**Goal**: Allow modification of Task properties including Category.

**Independent Test**: PUT /api/{user_id}/tasks/{id} updates fields; subsequent GET shows new values.

### Implementation for User Story 3

- [ ] T017 [US3] Update TaskUpdate schema in backend/src/models/task.py
- [ ] T018 [US3] Update PUT /api/{user_id}/tasks/{id} endpoint in backend/src/api/routes/tasks.py
- [ ] T019 [P] [US3] Add Edit functionality to TaskForm in frontend/src/components/tasks/TaskForm.tsx
- [ ] T020 [P] [US3] Update API client with updateTask function in frontend/src/lib/api.ts

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T021 Integrate TaskList and TaskForm into Main Page in frontend/src/app/page.tsx (or create dashboard page)
- [ ] T022 Verify End-to-End flow (Create -> List -> Update) manually

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Update TaskCreate and TaskRead schemas in backend/src/models/task.py"
Task: "Create TaskForm component in frontend/src/components/tasks/TaskForm.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories
