---
description: "Task list for user authentication implementation"
---

# Tasks: User Authentication

**Input**: Design documents from `/specs/001-user-auth/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks included - tests can be added after implementation as specified in quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and environment configuration

- [X] T001 Create backend directory structure at backend/src/{models,services,api/routes,api/middleware} and backend/tests/{unit,integration,contract}
- [X] T002 Create frontend directory structure at frontend/src/components/auth and frontend/src/lib
- [X] T003 [P] Create backend/.env file with DATABASE_URL, BETTER_AUTH_SECRET, API_HOST, API_PORT environment variables
- [X] T004 [P] Create frontend/.env.local file with BETTER_AUTH_SECRET, NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_URL environment variables
- [X] T005 [P] Initialize Python backend with required dependencies (fastapi, sqlmodel, sqlalchemy[asyncio], asyncpg, pydantic, python-jose[cryptography], bcrypt, pytest, pytest-asyncio) using backend-agent skill
- [X] T006 [P] Initialize Node.js frontend with required dependencies (better-auth) using frontend-agent skill

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database Infrastructure

- [X] T007 [P] Create backend/db.py with async SQLAlchemy engine configuration for Neon PostgreSQL using sqlmodel skill
- [X] T008 [P] Implement async session management function get_session() in backend/db.py for database connections

### Backend Infrastructure

- [X] T009 [P] Add CORS middleware configuration in backend/main.py using python-fastapi skill
- [X] T010 [P] Create FastAPI app initialization in backend/main.py with basic health check endpoint

### Frontend Infrastructure

- [X] T011 [P] Create frontend/src/lib/api.ts ApiClient class with request method for backend API calls using frontend-agent skill
- [X] T012 [P] Implement automatic JWT token attachment in ApiClient Authorization headers using frontend-agent skill

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - New User Account Creation (Priority: P1) 🎯 MVP

**Goal**: Enable users to create new accounts with email, username, and password. Validate inputs and store credentials securely.

**Independent Test**: Create account with valid email/username/password. Verify password complexity validation works. Verify duplicate email/username errors are returned.

### Implementation for User Story 1

#### Backend: User Model

- [X] T013 [P] [US1] Create User SQLModel table class with id (UUID), email (unique), username (unique), hashed_password, created_at fields in backend/src/models/user.py using sqlmodel skill
- [X] T014 [US1] Create UserCreate SQLModel DTO class with email, username, password fields in backend/src/models/user.py using sqlmodel skill
- [X] T015 [US1] Create UserRead SQLModel DTO class with id, email, username, created_at fields in backend/src/models/user.py using sqlmodel skill

#### Backend: Auth Service

- [X] T016 [US1] Create hash_password() function using bcrypt with 12 rounds in backend/src/services/auth_service.py using sqlmodel skill
- [X] T017 [US1] Create verify_password() function using bcrypt in backend/src/services/auth_service.py using sqlmodel skill
- [X] T018 [US1] Create validate_password() function with complexity rules (12+ chars, uppercase, lowercase, number, special char) in backend/src/services/auth_service.py using sqlmodel skill
- [X] T019 [US1] Create create_user() async function that validates password, checks email/username uniqueness, hashes password, and creates User record in backend/src/services/auth_service.py using sqlmodel skill
- [X] T020 [US1] Create create_jwt_token() function that generates HS256-signed JWT with userId, email, username, iat, exp claims in backend/src/services/auth_service.py using python-fastapi skill

#### Backend: JWT Middleware

- [X] T021 [US1] Create JWTAuthMiddleware class in backend/src/api/middleware/jwt_middleware.py using python-fastapi skill
- [X] T022 [US1] Implement JWT verification logic in JWTAuthMiddleware that extracts token from Authorization header, decodes with BETTER_AUTH_SECRET, and extracts userId using python-fastapi skill
- [X] T023 [US1] Implement public routes whitelist for /api/auth/signup, /api/auth/signin, /health in JWTAuthMiddleware using python-fastapi skill
- [X] T024 [US1] Implement 401 Unauthorized error handling for missing/invalid/expired tokens in JWTAuthMiddleware using python-fastapi skill
- [X] T025 [US1] Add user_id to request.state after successful JWT verification in JWTAuthMiddleware using python-fastapi skill

#### Backend: Auth Routes

- [X] T026 [US1] Create FastAPI auth router with /api/auth prefix in backend/src/api/routes/auth.py using python-fastapi skill
- [X] T027 [US1] Implement POST /api/auth/signup endpoint that validates UserCreate, calls create_user(), returns AuthResponse with JWT token in backend/src/api/routes/auth.py using python-fastapi skill
- [X] T028 [US1] Implement email uniqueness validation with 409 Conflict error for duplicate emails in POST /api/auth/signup using python-fastapi skill
- [X] T029 [US1] Implement username uniqueness validation with 409 Conflict error for duplicate usernames in POST /api/auth/signup using python-fastapi skill
- [X] T030 [US1] Implement password complexity validation with 400 Bad Request error for weak passwords in POST /api/auth/signup using python-fastapi skill
- [X] T031 [US1] Add JWTAuthMiddleware to FastAPI app in backend/main.py using python-fastapi skill
- [X] T032 [US1] Include auth router in FastAPI app in backend/main.py using python-fastapi skill
- [X] T033 [US1] Add database initialization on app startup in backend/main.py using sqlmodel skill

#### Frontend: Better Auth Configuration

- [X] T034 [US1] Configure Better Auth with JWT plugin in frontend/src/lib/auth.ts using better-auth skill
- [X] T034 [US1] Set JWT plugin options (issuer: "todo-app", expiresIn: "7d", refresh: false) in frontend/src/lib/auth.ts using better-auth skill
- [X] T035 [US1] Enable emailAndPassword authentication (requireEmailVerification: false) in frontend/src/lib/auth.ts using better-auth skill
- [X] T036 [US1] Export authClient from frontend/src/lib/auth.ts using better-auth skill

#### Frontend: Sign Up Form

- [X] T037 [US1] Create SignUpForm client component with email, username, password state fields in frontend/src/components/auth/SignUpForm.tsx using frontend-agent and skills ui-ux-designer then forward to frontend-design
- [X] T038 [US1] Implement form submission handler calling authClient.signUp.email() in SignUpForm using frontend-agent skill
- [X] T039 [US1] Add error state and display for sign up failures in SignUpForm using frontend-agent skill
- [X] T040 [US1] Add loading state and disable submit button during sign up in SignUpForm using frontend-agent skill
- [X] T041 [US1] Add password complexity requirements hint in SignUpForm using frontend-agent skill

#### Frontend: Sign Up Page

- [X] T042 [US1] Create /app/(auth)/signup/page.tsx server component that renders SignUpForm using frontend-agent skill
- [X] T043 [US1] Add navigation link to /signin page in /app/(auth)/signup/page.tsx using frontend-agent skill

**Checkpoint**: At this point, User Story 1 (New User Account Creation) should be fully functional and testable independently. Users can create accounts, see validation errors for invalid inputs, and successfully create accounts.

---

## Phase 4: User Story 2 - Returning User Sign In (Priority: P1)

**Goal**: Enable registered users to sign in with email and password to regain access to their data.

**Independent Test**: Sign in with valid credentials and verify redirect to protected page. Verify error messages for invalid credentials.

### Implementation for User Story 2

#### Backend: Sign In Endpoint

- [ ] T044 [US2] Implement POST /api/auth/signin endpoint that validates UserSignIn credentials in backend/src/api/routes/auth.py using python-fastapi skill
- [ ] T045 [US2] Call authenticate_user() function in POST /api/auth/signin to verify password in backend/src/api/routes/auth.py using python-fastapi skill
- [ ] T046 [US2] Generate and return JWT token on successful sign in with AuthResponse in backend/src/api/routes/auth.py using python-fastapi skill
- [ ] T047 [US2] Return 401 Unauthorized error for invalid credentials without revealing which field is incorrect in POST /api/auth/signin using python-fastapi skill

#### Backend: Authenticate User Service

- [ ] T048 [US2] Create authenticate_user() async function that finds user by email and verifies password in backend/src/services/auth_service.py using sqlmodel skill
- [ ] T049 [US2] Return None if user not found or password invalid in authenticate_user() using sqlmodel skill

#### Frontend: Sign In Form

- [ ] T050 [US2] Create SignInForm client component with email, password state fields in frontend/src/components/auth/SignInForm.tsx using frontend-agent skill
- [ ] T051 [US2] Implement form submission handler calling authClient.signIn.email() in SignInForm using frontend-agent skill
- [ ] T052 [US2] Add error state and display for sign in failures in SignInForm using frontend-agent skill
- [ ] T053 [US2] Add loading state and disable submit button during sign in in SignInForm using frontend-agent skill
- [ ] T054 [US2] Redirect to home page (/) on successful sign in in SignInForm using frontend-agent skill

#### Frontend: Sign In Page

- [ ] T055 [US2] Create /app/(auth)/signin/page.tsx server component that renders SignInForm using frontend-agent skill
- [ ] T056 [US2] Add navigation link to /signup page in /app/(auth)/signin/page.tsx using frontend-agent skill

**Checkpoint**: At this point, User Story 2 (Returning User Sign In) should be fully functional and testable independently. Users can sign in with valid credentials and receive appropriate error messages for invalid credentials.

---

## Phase 5: User Story 3 - Secure API Access (Priority: P2)

**Goal**: Ensure all API endpoints require valid JWT authentication and user data is strictly isolated.

**Independent Test**: Access API endpoints with valid token (success), no token (401 error), expired token (401 error), and verify user_id is added to request context.

### Implementation for User Story 3

#### Backend: Sign Out Endpoint

- [ ] T057 [US3] Implement POST /api/auth/signout endpoint that clears session in backend/src/api/routes/auth.py using python-fastapi skill
- [ ] T058 [US3] Add BearerAuth security requirement to POST /api/auth/signout endpoint using python-fastapi skill
- [ ] T059 [US3] Return 200 OK with success message for sign out in POST /api/auth/signout using python-fastapi skill

#### Backend: Get Current User Endpoint

- [ ] T060 [US3] Implement GET /api/auth/me endpoint that returns current user info in backend/src/api/routes/auth.py using python-fastapi skill
- [ ] T061 [US3] Add BearerAuth security requirement to GET /api/auth/me endpoint using python-fastapi skill
- [ ] T062 [US3] Extract user_id from request.state and return user info in GET /api/auth/me using python-fastapi skill

#### Frontend: API Client Integration

- [ ] T063 [US3] Implement 401 error handler in ApiClient that redirects to /signin using frontend-agent skill
- [ ] T064 [US3] Update ApiClient to retrieve JWT token from Better Auth session before each request using frontend-agent skill
- [ ] T065 [US3] Add Authorization header with Bearer token format to all API requests in ApiClient using frontend-agent skill

**Checkpoint**: At this point, User Story 3 (Secure API Access) should be fully functional and testable independently. All protected API endpoints require valid JWT, tokens are verified, and 401 errors are returned appropriately.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories and final validation

- [ ] T066 [P] Test complete auth flow: signup → signin → API access using manual testing as outlined in quickstart.md
- [ ] T067 [P] Verify password complexity validation meets requirements (12+ chars, uppercase, lowercase, number, special char) in backend/src/services/auth_service.py
- [ ] T068 [P] Verify JWT middleware correctly validates tokens and extracts user_id in backend/src/api/middleware/jwt_middleware.py
- [ ] T069 [P] Verify Better Auth configuration matches backend JWT secret (BETTER_AUTH_SECRET) in frontend/src/lib/auth.ts and backend/.env
- [ ] T070 [P] Verify CORS configuration allows frontend to communicate with backend in backend/main.py
- [ ] T071 [P] Test API endpoints with curl commands from quickstart.md (health check, signup, signin)
- [ ] T072 [P] Verify frontend forms display appropriate error messages for all failure scenarios
- [ ] T073 [P] Verify frontend successfully redirects to home page after successful sign in/sign up
- [ ] T074 [P] Verify 7-day JWT token expiry is configured correctly in both frontend and backend
- [ ] T075 [P] Verify all passwords are hashed with bcrypt and never stored in plaintext
- [ ] T076 [P] Verify unique email and username constraints are enforced by database and API

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories should be completed in priority order: US1 (P1) → US2 (P1) → US3 (P2)
  - Stories can be tested independently before moving to next story
- **Polish (Phase 6)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Shares backend infrastructure with US1
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Depends on User Story 1 (middleware) and User Story 2 (sign in)

### Within Each User Story

- Models before services
- Services before endpoints/routes
- Frontend forms after Better Auth configuration
- Middleware before protected routes
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] in Phase 1 can run in parallel
- All Foundational tasks marked [P] in Phase 2 can run in parallel (within same domain: backend-to-backend or frontend-to-frontend)
- Models within a story can be worked on in parallel (if separate files)
- Different user stories can be worked on in parallel by different team members after Foundational phase
- All Polish tasks marked [P] in Phase 6 can run in parallel

---

## Parallel Example: User Story 1 Models & Services

```bash
# Launch backend model and service tasks together:
Task: "Create User SQLModel table class in backend/src/models/user.py"
Task: "Create UserCreate/UserRead DTO classes in backend/src/models/user.py"
Task: "Create hash_password() function in backend/src/services/auth_service.py"
Task: "Create validate_password() function in backend/src/services/auth_service.py"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 Only)

1. Complete Phase 1: Setup (T001-T006)
2. Complete Phase 2: Foundational (T007-T012) - CRITICAL BLOCKER
3. Complete Phase 3: User Story 1 (T013-T043) - Account creation
4. **STOP AND VALIDATE**: Test account creation, password validation, error handling
5. Complete Phase 4: User Story 2 (T044-T056) - Sign in
6. **STOP AND VALIDATE**: Test sign in flow, error messages, successful authentication
7. Deploy/demo if ready (MVP includes account creation AND sign in)

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Core value: users can create accounts
3. Add User Story 2 → Test independently → Core value: users can sign in
4. Add User Story 3 → Test independently → Core value: API is protected
5. Complete Phase 6: Polish → Full authentication feature complete

### Sequential Story Approach

After completing User Story 1:
- Users can create accounts but cannot sign in yet
- Value: Foundation for sign-in story

After completing User Story 2:
- Users can create accounts AND sign in
- Value: Complete auth flow available (MVP!)

After completing User Story 3:
- Full API security enforced
- Value: Production-ready authentication

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Use agent skills (better-auth, sqlmodel, python-fastapi, frontend-agent) for implementation
- Follow quickstart.md for detailed code examples
- Use contracts/openapi.yaml for API endpoint specifications
- Neon PostgreSQL DATABASE_URL will be provided by user - task T003 requires user to add it
- Better Auth and backend MUST share the same BETTER_AUTH_SECRET
- JWT middleware applies to all routes except public routes (/api/auth/signup, /api/auth/signin, /health)
- All passwords MUST be hashed with bcrypt before storage
- No plaintext passwords stored at any time
- Verify tests fail before implementing (TDD approach if desired)
- Stop at any checkpoint to validate story independently
- Environment variables (.env files) must NOT be committed to version control
