# Tasks: Auth-Aware Frontend Routing & Task Calendar Enhancements

**Input**: Design documents from `/specs/001-auth-routing-calendar/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Tests are NOT explicitly requested in the specification, so test tasks are omitted per template guidelines.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown below follow the monorepo structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [x] T001 Verify Next.js 16.1+ and Better Auth 1.0+ dependencies in frontend/package.json
- [x] T002 Verify Python 3.11+, FastAPI, and SQLModel dependencies in backend/pyproject.toml
- [x] T003 [P] Review existing authentication setup in frontend/src/lib/auth.ts
- [x] T004 [P] Review existing JWT middleware in backend/src/api/middleware/jwt_middleware.py
- [x] T005 [P] Review existing Task model in backend/src/models/task.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Create Alembic migration file for start_date field in backend/src/migrations/versions/002_add_task_start_date.py
- [x] T007 Apply database migration to add start_date column to tasks table (run: alembic upgrade head)
- [x] T008 Update Task model to include start_date field in backend/src/models/task.py
- [x] T009 Update TaskCreate schema to include start_date field in backend/src/models/task.py
- [x] T010 Update TaskUpdate schema to include start_date field in backend/src/models/task.py
- [x] T011 Update TaskRead schema to include start_date field in backend/src/models/task.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Protected Route Access Control (Priority: P1) 🎯 MVP

**Goal**: Implement middleware-based route protection to prevent unauthorized access to protected routes and redirect authenticated users away from auth pages

**Independent Test**: Navigate to /dashboard without authentication → redirects to /signin. Login and navigate to /signin → redirects to /dashboard. Access / without auth → no redirect.

### Implementation for User Story 1 (Authentication & Middleware)

- [x] T012 [US1] Create Next.js middleware file at frontend/src/middleware.ts
- [x] T013 [US1] Implement route classification logic (public vs protected routes) in frontend/src/middleware.ts
- [x] T014 [US1] Implement cookie reading logic to check auth_token in frontend/src/middleware.ts
- [x] T015 [US1] Implement redirect logic for unauthenticated users on protected routes in frontend/src/middleware.ts
- [x] T016 [US1] Implement redirect logic for authenticated users on auth pages (/signin, /signup) in frontend/src/middleware.ts
- [x] T017 [US1] Configure middleware matcher to exclude static assets in frontend/src/middleware.ts
- [x] T018 [US1] Add redirect parameter preservation for post-login navigation in frontend/src/middleware.ts
- [ ] T019 [US1] Test middleware redirects manually: access /dashboard without auth, /signin with auth, / without auth

**Checkpoint**: At this point, User Story 1 should be fully functional - all route protection working correctly

---

## Phase 4: User Story 3 - Secure Token Storage (Priority: P2)

**Goal**: Migrate authentication token storage from localStorage to HTTP cookies with proper security flags

**Independent Test**: Login and verify auth_token exists in cookies (not localStorage). Refresh page and verify authentication persists. Logout and verify cookie is removed.

### Implementation for User Story 3 (Cookie-based Token Handling)

- [x] T020 [US3] Configure Better Auth cookie storage in frontend/src/lib/auth.ts
- [x] T021 [US3] Set HttpOnly flag to true in cookie configuration in frontend/src/lib/auth.ts
- [x] T022 [US3] Set Secure flag based on NODE_ENV (true in production) in frontend/src/lib/auth.ts
- [x] T023 [US3] Set SameSite flag to 'lax' for CSRF protection in frontend/src/lib/auth.ts
- [x] T024 [US3] Set maxAge to 604800 (7 days) to match JWT expiry in frontend/src/lib/auth.ts
- [x] T025 [US3] Set cookie name to 'auth_token' in frontend/src/lib/auth.ts
- [x] T026 [US3] Remove any localStorage token storage logic from existing auth code in frontend/src/lib/auth.ts
- [ ] T027 [US3] Test cookie storage: login, check browser cookies for auth_token with HttpOnly flag
- [ ] T028 [US3] Test authentication persistence: login, refresh page, verify still authenticated
- [ ] T029 [US3] Test logout: logout, verify auth_token cookie is removed from browser

**Checkpoint**: At this point, User Stories 1 AND 3 should both work - route protection with cookie-based auth

---

## Phase 5: User Story 2 - Authenticated Navigation Experience (Priority: P1)

**Goal**: Update navbar to display user's name when authenticated and Login/Signup buttons when not authenticated

**Independent Test**: Login and verify navbar shows username. Logout and verify navbar shows Login/Signup buttons. Navbar updates immediately on auth state change.

### Implementation for User Story 2 (UI / Navbar Updates)

- [x] T030 [P] [US2] Create useAuth hook in frontend/src/hooks/useAuth.ts
- [x] T031 [US2] Implement getSession call to Better Auth in useAuth hook in frontend/src/hooks/useAuth.ts
- [x] T032 [US2] Return user, isAuthenticated, and isLoading state from useAuth hook in frontend/src/hooks/useAuth.ts
- [x] T033 [US2] Update Navbar component to use useAuth hook in frontend/src/components/layout/Navbar.tsx
- [x] T034 [US2] Implement conditional rendering: show username when authenticated in frontend/src/components/layout/Navbar.tsx
- [x] T035 [US2] Implement conditional rendering: show Login/Signup buttons when not authenticated in frontend/src/components/layout/Navbar.tsx
- [x] T036 [US2] Add logout button and handler in Navbar component in frontend/src/components/layout/Navbar.tsx
- [x] T037 [US2] Add navigation links (Dashboard, Tasks, Categories, Calendar) for authenticated users in frontend/src/components/layout/Navbar.tsx
- [ ] T038 [US2] Test navbar: login and verify username displays, logout and verify Login/Signup buttons display

**Checkpoint**: All P1 user stories (US1, US2) and P2 story (US3) complete - core auth functionality working

---

## Phase 6: User Story 4 - Task Date Range Definition (Priority: P3)

**Goal**: Add start_date field to task creation/editing forms with validation to ensure start_date <= end_date

**Independent Test**: Create task with start_date and end_date. Verify validation rejects start_date > end_date. Edit task and verify both dates can be updated.

### Implementation for User Story 4 (Task Form Enhancements)

**Backend Implementation:**

- [x] T039 [P] [US4] Add date validation logic to create_task endpoint in backend/src/api/routes/tasks.py
- [x] T040 [P] [US4] Add date validation logic to update_task endpoint in backend/src/api/routes/tasks.py
- [x] T041 [US4] Implement HTTPException for start_date > due_date validation error in backend/src/api/routes/tasks.py
- [ ] T042 [US4] Test backend validation: POST task with start_date > due_date, verify 400 error returned

**Frontend Implementation:**

- [x] T043 [P] [US4] Update Task interface to include start_date field in frontend/src/lib/api.ts
- [x] T044 [P] [US4] Update TaskCreate interface to include start_date field in frontend/src/lib/api.ts
- [x] T045 [P] [US4] Update TaskUpdate interface to include start_date field in frontend/src/lib/api.ts
- [x] T046 [US4] Add start_date input field to TaskForm component in frontend/src/components/tasks/TaskForm.tsx
- [x] T047 [US4] Update due_date label to "End Date" in TaskForm component in frontend/src/components/tasks/TaskForm.tsx
- [x] T048 [US4] Add client-side date validation (start_date <= due_date) in TaskForm component in frontend/src/components/tasks/TaskForm.tsx
- [x] T049 [US4] Display validation error message when start_date > due_date in frontend/src/components/tasks/TaskForm.tsx
- [x] T050 [US4] Convert date inputs to ISO 8601 format before API submission in frontend/src/components/tasks/TaskForm.tsx
- [ ] T051 [US4] Test task form: create task with valid dates, create task with invalid dates (start > end), edit task dates

**Checkpoint**: User Story 4 complete - tasks can have date ranges with proper validation

---

## Phase 7: User Story 5 - Visual Task Calendar (Priority: P4)

**Goal**: Create calendar page with month view displaying tasks across their date ranges with color-coded urgency indicators

**Independent Test**: Navigate to /calendar and see tasks displayed. Tasks spanning multiple days appear across date range. Color coding: red (≤1 day), yellow (2-3 days), green (≥4 days).

### Implementation for User Story 5 (Calendar Feature Implementation)

**Utility Functions:**

- [x] T052 [P] [US5] Create task-colors.ts utility with getTaskUrgencyColor function in frontend/src/lib/utils/task-colors.ts
- [x] T053 [P] [US5] Implement color logic: ≤1 day = red, 2-3 days = yellow, ≥4 days = green in frontend/src/lib/utils/task-colors.ts
- [x] T054 [P] [US5] Create date-helpers.ts utility with date calculation functions in frontend/src/lib/utils/date-helpers.ts
- [x] T055 [P] [US5] Implement getDaysInMonth, getFirstDayOfMonth, isSameDay, isDateInRange functions in frontend/src/lib/utils/date-helpers.ts

**Calendar Components:**

- [x] T056 [P] [US5] Create CalendarHeader component with month navigation in frontend/src/components/calendar/CalendarHeader.tsx
- [x] T057 [P] [US5] Implement prev/next month buttons in CalendarHeader in frontend/src/components/calendar/CalendarHeader.tsx
- [x] T058 [P] [US5] Display current month and year in CalendarHeader in frontend/src/components/calendar/CalendarHeader.tsx
- [x] T059 [P] [US5] Create TaskEvent component for displaying tasks on calendar in frontend/src/components/calendar/TaskEvent.tsx
- [x] T060 [P] [US5] Apply urgency color to TaskEvent background in frontend/src/components/calendar/TaskEvent.tsx
- [x] T061 [P] [US5] Display task title in TaskEvent component in frontend/src/components/calendar/TaskEvent.tsx
- [x] T062 [US5] Create CalendarGrid component with CSS Grid layout in frontend/src/components/calendar/CalendarGrid.tsx
- [x] T063 [US5] Render day-of-week headers (Sun-Sat) in CalendarGrid in frontend/src/components/calendar/CalendarGrid.tsx
- [x] T064 [US5] Generate calendar days with proper offset for first day of month in frontend/src/components/calendar/CalendarGrid.tsx
- [x] T065 [US5] Filter tasks for each calendar day based on date range in frontend/src/components/calendar/CalendarGrid.tsx
- [x] T066 [US5] Render TaskEvent components for each task on each day in frontend/src/components/calendar/CalendarGrid.tsx
- [x] T067 [US5] Handle empty state (no tasks) in CalendarGrid in frontend/src/components/calendar/CalendarGrid.tsx
- [x] T068 [US5] Create CalendarView component as main container in frontend/src/components/calendar/CalendarView.tsx
- [x] T069 [US5] Implement useState for current month/year in CalendarView in frontend/src/components/calendar/CalendarView.tsx
- [x] T070 [US5] Fetch all user tasks on component mount in CalendarView in frontend/src/components/calendar/CalendarView.tsx
- [x] T071 [US5] Implement month navigation handlers (prev/next) in CalendarView in frontend/src/components/calendar/CalendarView.tsx
- [x] T072 [US5] Pass tasks and currentDate to CalendarGrid in frontend/src/components/calendar/CalendarView.tsx

**Calendar Page:**

- [x] T073 [US5] Create calendar page directory at frontend/src/app/calendar/
- [x] T074 [US5] Create calendar page component in frontend/src/app/calendar/page.tsx
- [x] T075 [US5] Import and render CalendarView component in calendar page in frontend/src/app/calendar/page.tsx
- [x] T076 [US5] Add page title and container styling in frontend/src/app/calendar/page.tsx
- [ ] T077 [US5] Test calendar page: navigate to /calendar, verify tasks display with correct colors
- [ ] T078 [US5] Test calendar navigation: click prev/next month, verify calendar updates
- [ ] T079 [US5] Test task spanning: create task with multi-day range, verify displays across all days
- [ ] T080 [US5] Test empty state: remove all tasks, verify empty calendar displays correctly

**Checkpoint**: All user stories complete - full feature functionality delivered

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T081 [P] Add loading states to calendar view in frontend/src/components/calendar/CalendarView.tsx
- [ ] T082 [P] Add error handling for failed task fetches in frontend/src/components/calendar/CalendarView.tsx
- [ ] T083 [P] Optimize calendar rendering for 100+ tasks (memoization) in frontend/src/components/calendar/CalendarGrid.tsx
- [ ] T084 [P] Add responsive styling for mobile devices in frontend/src/components/calendar/CalendarGrid.tsx
- [ ] T085 [P] Add hover states and tooltips to calendar tasks in frontend/src/components/calendar/TaskEvent.tsx
- [ ] T086 [P] Verify middleware performance (<100ms redirects) using browser DevTools
- [ ] T087 [P] Verify calendar performance (<1s load for 100 tasks) using browser DevTools
- [ ] T088 [P] Verify navbar update performance (<200ms) using browser DevTools
- [ ] T089 Code cleanup: remove console.logs and debug code across all modified files
- [ ] T090 Documentation: update README.md with new features (middleware, calendar)
- [ ] T091 Run quickstart.md validation: follow all steps and verify feature works end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 (Phase 3): Can start after Foundational - No dependencies on other stories
  - US3 (Phase 4): Can start after Foundational - No dependencies on other stories
  - US2 (Phase 5): Depends on US1 and US3 (needs middleware and cookie auth working)
  - US4 (Phase 6): Can start after Foundational - No dependencies on other stories
  - US5 (Phase 7): Depends on US4 (needs start_date field in tasks)
- **Polish (Phase 8)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Depends on US1 and US3 completion (needs middleware and cookie auth)
- **User Story 4 (P3)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 5 (P4)**: Depends on US4 completion (needs start_date field)

### Within Each User Story

- Setup tasks before implementation
- Backend changes before frontend changes (for US4)
- Utility functions before components (for US5)
- Components before pages (for US5)
- Core implementation before testing

### Parallel Opportunities

- **Phase 1 (Setup)**: T003, T004, T005 can run in parallel (different files)
- **Phase 2 (Foundational)**: T006-T011 must run sequentially (database migration)
- **Phase 3 (US1)**: All tasks sequential (same file - middleware.ts)
- **Phase 4 (US3)**: All tasks sequential (same file - auth.ts)
- **Phase 5 (US2)**: T030 can run in parallel with T033-T037 (different files)
- **Phase 6 (US4)**: T039-T040 (backend) can run in parallel with T043-T045 (frontend interfaces)
- **Phase 7 (US5)**: T052-T055 (utilities) can run in parallel, T056-T061 (components) can run in parallel
- **Phase 8 (Polish)**: T081-T088 can run in parallel (different files)

**Key Insight**: US1, US3, and US4 can be worked on in parallel by different developers after Foundational phase completes. US2 must wait for US1+US3. US5 must wait for US4.

---

## Parallel Example: User Story 5 (Calendar)

```bash
# Launch all utility functions together:
Task: "Create task-colors.ts utility with getTaskUrgencyColor function"
Task: "Create date-helpers.ts utility with date calculation functions"

# Launch all component files together (after utilities complete):
Task: "Create CalendarHeader component with month navigation"
Task: "Create TaskEvent component for displaying tasks on calendar"
```

---

## Implementation Strategy

### MVP First (User Stories 1, 3, 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (Route Protection)
4. Complete Phase 4: User Story 3 (Cookie Storage)
5. Complete Phase 5: User Story 2 (Navbar Updates)
6. **STOP and VALIDATE**: Test auth flow end-to-end
7. Deploy/demo if ready (MVP = secure auth with good UX)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1 + US3 + US2 → Test independently → Deploy/Demo (MVP - Auth complete!)
3. Add US4 → Test independently → Deploy/Demo (Task date ranges added)
4. Add US5 → Test independently → Deploy/Demo (Calendar visualization added)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Middleware)
   - Developer B: User Story 3 (Cookie Auth)
   - Developer C: User Story 4 (Task Dates - backend + frontend)
3. After US1 + US3 complete:
   - Developer A: User Story 2 (Navbar)
4. After US4 complete:
   - Developer B or C: User Story 5 (Calendar)
5. Stories complete and integrate independently

---

## Task Summary

**Total Tasks**: 91 tasks

**Tasks by User Story**:
- Setup (Phase 1): 5 tasks
- Foundational (Phase 2): 6 tasks
- User Story 1 (P1): 8 tasks
- User Story 3 (P2): 10 tasks
- User Story 2 (P1): 9 tasks
- User Story 4 (P3): 13 tasks
- User Story 5 (P4): 29 tasks
- Polish (Phase 8): 11 tasks

**Parallel Opportunities**: 23 tasks marked [P] can run in parallel

**Independent Test Criteria**:
- US1: Route protection redirects work correctly
- US3: Cookies store auth token, localStorage empty
- US2: Navbar shows username when logged in, Login/Signup when logged out
- US4: Task form accepts date ranges, validates start <= end
- US5: Calendar displays tasks with color coding across date ranges

**Suggested MVP Scope**: User Stories 1, 3, and 2 (Phases 3-5) = 27 tasks
- Delivers: Secure route protection, cookie-based auth, personalized navbar
- Estimated time: 4-6 hours
- Value: Complete authentication enhancement with excellent UX

**Full Feature Scope**: All user stories (Phases 1-8) = 91 tasks
- Estimated time: 11-17 hours (per plan.md)
- Value: Complete feature with calendar visualization

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend tasks (T006-T011, T039-T042) require backend server restart
- Frontend tasks require browser refresh to see changes
- Database migration (T007) is irreversible without rollback
- Middleware changes (T012-T018) affect all routes immediately
