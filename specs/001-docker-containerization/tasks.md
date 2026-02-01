# Tasks: Docker Containerization

**Input**: Design documents from `/specs/001-docker-containerization/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test tasks included (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/` and `frontend/` at repository root
- Backend files: `backend/Dockerfile`, `backend/.dockerignore`, `backend/src/`
- Frontend files: `frontend/Dockerfile`, `frontend/.dockerignore`, `frontend/src/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify prerequisites and prepare for container implementation

- [x] T001 Verify Docker is installed and accessible (docker --version)
- [x] T002 Verify backend requirements.txt exists and is up to date in backend/requirements.txt
- [x] T003 Verify frontend package.json and package-lock.json exist in frontend/
- [x] T004 Review current environment variables in backend/.env.example and frontend/.env.local
- [x] T005 Check if Next.js config supports standalone output mode in frontend/next.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core configuration that MUST be complete before container implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Configure Next.js standalone output mode in frontend/next.config.ts (add output: 'standalone')
- [x] T007 Document required environment variables for both services in specs/001-docker-containerization/quickstart.md

**Checkpoint**: Foundation ready - container implementation can now begin

---

## Phase 3: User Story 1 - Local Development with Containers (Priority: P1) 🎯 MVP

**Goal**: Enable developers to build and run the entire Todo application stack locally using Docker containers with environment consistency

**Independent Test**: Run `docker build` for both services, start containers with environment variables, access application at localhost:3000, verify frontend communicates with backend

### Backend Container Implementation

- [x] T008 [P] [US1] Create backend .dockerignore file in backend/.dockerignore (exclude .venv, __pycache__, .git, .env, logs/, docs/, *.pyc, .pytest_cache)
- [x] T009 [US1] Create backend Dockerfile in backend/Dockerfile with python:3.11-slim base image
- [x] T010 [US1] Add system dependencies installation to backend/Dockerfile (gcc, libpq-dev, postgresql-client)
- [x] T011 [US1] Add Python dependencies installation to backend/Dockerfile (COPY requirements.txt, RUN pip install --no-cache-dir -r requirements.txt)
- [x] T012 [US1] Add application code copy to backend/Dockerfile (COPY src/ /app/src/)
- [x] T013 [US1] Create non-root user 'appuser' in backend/Dockerfile (RUN useradd -m -u 1000 appuser, USER appuser)
- [x] T014 [US1] Add EXPOSE 8000 and CMD to backend/Dockerfile (CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"])
- [ ] T015 [US1] Test backend container build (docker build -t todo-backend:latest backend/) **[BLOCKED: Docker network connectivity]**
- [ ] T016 [US1] Test backend container run with environment variables (verify it starts and responds) **[BLOCKED: Docker network connectivity]**

### Frontend Container Implementation

- [x] T017 [P] [US1] Create frontend .dockerignore file in frontend/.dockerignore (exclude node_modules, .next, .git, .env*, npm-debug.log, .DS_Store)
- [x] T018 [US1] Create frontend Dockerfile in frontend/Dockerfile with node:20-alpine base image
- [x] T019 [US1] Add Stage 1 (deps) to frontend/Dockerfile (COPY package*.json, RUN npm ci --only=production)
- [x] T020 [US1] Add Stage 2 (builder) to frontend/Dockerfile (COPY all files, RUN npm run build)
- [x] T021 [US1] Add Stage 3 (runner) to frontend/Dockerfile (copy standalone output, create non-root user node)
- [x] T022 [US1] Add EXPOSE 3000 and CMD to frontend/Dockerfile (CMD ["node", "server.js"])
- [ ] T023 [US1] Test frontend container build (docker build -t todo-frontend:latest frontend/) **[BLOCKED: Docker network connectivity]**
- [ ] T024 [US1] Test frontend container run with environment variables (verify it starts and responds) **[BLOCKED: Docker network connectivity]**

### Integration Testing

- [ ] T025 [US1] Test both containers running together with proper environment variables **[BLOCKED: Docker network connectivity]**
- [ ] T026 [US1] Verify frontend can communicate with backend API (test API calls work) **[BLOCKED: Docker network connectivity]**
- [ ] T027 [US1] Verify Todo application functions correctly in containerized environment **[BLOCKED: Docker network connectivity]**
- [x] T028 [US1] Document container build and run commands in specs/001-docker-containerization/quickstart.md

**Checkpoint**: At this point, both containers should build successfully and run locally with full application functionality

---

## Phase 4: User Story 2 - Production Deployment (Priority: P2)

**Goal**: Enable production deployment with health checks, security configurations, and performance optimization

**Independent Test**: Deploy containers to staging environment, verify health endpoints respond correctly, confirm application handles production traffic, validate image sizes and startup times

### Backend Health Check

- [x] T029 [US2] Check if backend health endpoint exists at /health in backend/src/main.py or backend/src/api/routes/
- [x] T030 [US2] If health endpoint doesn't exist, create GET /health endpoint in backend/src/main.py
- [x] T031 [US2] Implement health check response with JSON format (status, timestamp, service, version, database)
- [x] T032 [US2] Add database connectivity check to backend health endpoint (verify connection pool is active)
- [ ] T033 [US2] Test backend health endpoint returns 200 OK when healthy (curl http://localhost:8000/health) **[BLOCKED: Docker network connectivity]**
- [ ] T034 [US2] Test backend health endpoint returns 503 when database is unavailable **[BLOCKED: Docker network connectivity]**

### Frontend Health Check

- [x] T035 [P] [US2] Create frontend health check API route in frontend/src/app/health/route.ts
- [x] T036 [US2] Implement GET handler with JSON response (status, timestamp, service, version)
- [ ] T037 [US2] Test frontend health endpoint returns 200 OK (curl http://localhost:3000/health) **[BLOCKED: Docker network connectivity]**

### Production Optimization

- [ ] T038 [P] [US2] Measure backend container image size (docker images | grep todo-backend) **[BLOCKED: Docker network connectivity]**
- [ ] T039 [P] [US2] Measure frontend container image size (docker images | grep todo-frontend) **[BLOCKED: Docker network connectivity]**
- [ ] T040 [US2] Optimize backend Dockerfile if image size exceeds 300MB (clean apt cache, remove unnecessary files) **[BLOCKED: Pending T038]**
- [ ] T041 [US2] Optimize frontend Dockerfile if image size exceeds 200MB (verify standalone mode, optimize layers) **[BLOCKED: Pending T039]**
- [ ] T042 [P] [US2] Measure container startup times (docker run and time to health check response) **[BLOCKED: Docker network connectivity]**
- [ ] T043 [P] [US2] Measure container build times (time docker build commands) **[BLOCKED: Docker network connectivity]**
- [x] T044 [US2] Add Docker labels to both Dockerfiles (version, created, revision, source)
- [ ] T045 [US2] Test graceful shutdown with SIGTERM (docker stop and verify clean shutdown) **[BLOCKED: Docker network connectivity]**

### Security Validation

- [ ] T046 [P] [US2] Verify backend container runs as non-root user (docker exec todo-backend whoami) **[BLOCKED: Docker network connectivity]**
- [ ] T047 [P] [US2] Verify frontend container runs as non-root user (docker exec todo-frontend whoami) **[BLOCKED: Docker network connectivity]**
- [ ] T048 [P] [US2] Verify no secrets in Dockerfile or image layers (inspect image history) **[BLOCKED: Docker network connectivity]**
- [x] T049 [US2] Document security best practices in specs/001-docker-containerization/quickstart.md

**Checkpoint**: At this point, containers should meet all production requirements (size, startup time, health checks, security)

---

## Phase 5: User Story 3 - CI/CD Pipeline Integration (Priority: P3)

**Goal**: Document CI/CD integration patterns for automated container builds and deployments

**Independent Test**: Review documentation completeness for CI/CD integration

**Note**: Full CI/CD pipeline implementation is out of scope per specification. This phase focuses on documentation only.

### Documentation

- [x] T050 [P] [US3] Document container build commands for CI/CD in specs/001-docker-containerization/quickstart.md
- [x] T051 [P] [US3] Document container tagging strategy (latest, version, commit SHA) in specs/001-docker-containerization/quickstart.md
- [x] T052 [P] [US3] Document container registry push commands in specs/001-docker-containerization/quickstart.md
- [x] T053 [US3] Add CI/CD integration notes to specs/001-docker-containerization/quickstart.md (GitHub Actions, GitLab CI examples)

**Checkpoint**: CI/CD integration is documented for future implementation

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements and documentation updates

- [x] T054 [P] Update root README.md with Docker container usage instructions
- [x] T055 [P] Update backend/CLAUDE.md with Docker-specific development instructions
- [x] T056 [P] Update frontend/CLAUDE.md with Docker-specific development instructions
- [x] T057 [P] Create example .env files (backend/.env.example, frontend/.env.example) with all required variables
- [ ] T058 Validate all success criteria from specification are met (image sizes, startup times, health checks) **[BLOCKED: Docker network connectivity]**
- [ ] T059 Run complete quickstart.md validation (build, run, test all commands) **[BLOCKED: Docker network connectivity]**
- [x] T060 [P] Add troubleshooting section to specs/001-docker-containerization/quickstart.md (common errors and solutions)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Depends on User Story 1 completion (needs containers to exist)
  - User Story 3 (P3): Can start after User Story 1 (documents existing containers)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Creates both containers
- **User Story 2 (P2)**: Depends on User Story 1 - Adds health checks and optimizes existing containers
- **User Story 3 (P3)**: Depends on User Story 1 - Documents existing container build process

### Within Each User Story

**User Story 1**:
- Backend .dockerignore and Frontend .dockerignore can run in parallel (T008, T017)
- Backend Dockerfile creation (T009-T014) must be sequential
- Frontend Dockerfile creation (T018-T022) must be sequential
- Backend and Frontend implementation tracks can run in parallel
- Integration testing (T025-T028) depends on both containers being built

**User Story 2**:
- Backend health check (T029-T034) and Frontend health check (T035-T037) can run in parallel
- Image size measurements (T038, T039) can run in parallel
- Startup time and build time measurements (T042, T043) can run in parallel
- Security validation tasks (T046-T048) can run in parallel

**User Story 3**:
- All documentation tasks (T050-T053) can run in parallel

### Parallel Opportunities

- **Phase 1**: All verification tasks (T001-T005) can run in parallel
- **Phase 2**: T006 and T007 can run in parallel
- **Phase 3 (US1)**:
  - T008 and T017 (both .dockerignore files) can run in parallel
  - Backend track (T008-T016) and Frontend track (T017-T024) can run in parallel after T006 completes
- **Phase 4 (US2)**:
  - Backend health check track (T029-T034) and Frontend health check track (T035-T037) can run in parallel
  - Measurement tasks (T038, T039, T042, T043) can run in parallel
  - Security validation tasks (T046-T048) can run in parallel
- **Phase 5 (US3)**: All documentation tasks (T050-T053) can run in parallel
- **Phase 6**: Documentation updates (T054-T057, T060) can run in parallel

---

## Parallel Example: User Story 1 (Backend and Frontend Tracks)

```bash
# After Phase 2 completes, launch both container implementations in parallel:

# Backend Track (Developer A or Agent A):
Task T008: "Create backend .dockerignore file in backend/.dockerignore"
Task T009: "Create backend Dockerfile in backend/Dockerfile"
Task T010: "Add system dependencies installation to backend/Dockerfile"
Task T011: "Add Python dependencies installation to backend/Dockerfile"
Task T012: "Add application code copy to backend/Dockerfile"
Task T013: "Create non-root user in backend/Dockerfile"
Task T014: "Add EXPOSE and CMD to backend/Dockerfile"
Task T015: "Test backend container build"
Task T016: "Test backend container run"

# Frontend Track (Developer B or Agent B):
Task T017: "Create frontend .dockerignore file in frontend/.dockerignore"
Task T018: "Create frontend Dockerfile in frontend/Dockerfile"
Task T019: "Add Stage 1 (deps) to frontend/Dockerfile"
Task T020: "Add Stage 2 (builder) to frontend/Dockerfile"
Task T021: "Add Stage 3 (runner) to frontend/Dockerfile"
Task T022: "Add EXPOSE and CMD to frontend/Dockerfile"
Task T023: "Test frontend container build"
Task T024: "Test frontend container run"

# Integration (After both tracks complete):
Task T025: "Test both containers running together"
Task T026: "Verify frontend-backend communication"
Task T027: "Verify application functionality"
Task T028: "Document commands in quickstart.md"
```

---

## Parallel Example: User Story 2 (Health Checks)

```bash
# Launch both health check implementations in parallel:

# Backend Health Check Track:
Task T029: "Check if backend health endpoint exists"
Task T030: "Create GET /health endpoint if needed"
Task T031: "Implement health check response format"
Task T032: "Add database connectivity check"
Task T033: "Test health endpoint returns 200 OK"
Task T034: "Test health endpoint returns 503 when unhealthy"

# Frontend Health Check Track:
Task T035: "Create frontend health check API route"
Task T036: "Implement GET handler with JSON response"
Task T037: "Test frontend health endpoint"

# Optimization Tasks (can run in parallel):
Task T038: "Measure backend image size"
Task T039: "Measure frontend image size"
Task T042: "Measure startup times"
Task T043: "Measure build times"
Task T046: "Verify backend runs as non-root"
Task T047: "Verify frontend runs as non-root"
Task T048: "Verify no secrets in images"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: Foundational (T006-T007)
3. Complete Phase 3: User Story 1 (T008-T028)
4. **STOP and VALIDATE**: Test both containers independently and together
5. Deploy/demo if ready - developers can now use containers for local development

**MVP Deliverable**: Working Docker containers for both frontend and backend that can be built and run locally

### Incremental Delivery

1. **Foundation** (Phases 1-2): Setup + Next.js config → Ready for container implementation
2. **MVP** (Phase 3): User Story 1 → Test independently → Developers can use containers locally
3. **Production Ready** (Phase 4): User Story 2 → Test health checks and optimization → Ready for production deployment
4. **CI/CD Documented** (Phase 5): User Story 3 → Documentation complete → Ready for automation
5. **Polished** (Phase 6): Final documentation and validation → Feature complete

### Parallel Team Strategy

With multiple developers or agents:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. **Once Foundational is done, split into parallel tracks**:
   - Developer/Agent A: Backend container (T008-T016)
   - Developer/Agent B: Frontend container (T017-T024)
3. **Merge for integration testing** (T025-T028)
4. **Split again for User Story 2**:
   - Developer/Agent A: Backend health check (T029-T034)
   - Developer/Agent B: Frontend health check (T035-T037)
5. **Parallel optimization and validation** (T038-T049)
6. **Parallel documentation** (T050-T060)

---

## Success Criteria Validation

After completing all tasks, verify these success criteria from the specification:

- [ ] **SC-001**: Frontend container image size < 200MB (validate with T039)
- [ ] **SC-002**: Backend container image size < 300MB (validate with T038)
- [ ] **SC-003**: Both containers start and pass health checks within 30 seconds (validate with T042)
- [ ] **SC-004**: Containers build successfully on any machine with Docker (validate with T015, T023)
- [ ] **SC-005**: Application functions identically in containers (validate with T027)
- [ ] **SC-006**: Health check endpoints respond within 1 second (validate with T033, T037)
- [ ] **SC-007**: Containers deployable to any orchestration platform (validate with T049)
- [ ] **SC-008**: Container builds complete in under 5 minutes (validate with T043)
- [ ] **SC-009**: Containers restart successfully after crashes (validate with T045)
- [ ] **SC-010**: Zero security vulnerabilities in base images (validate with T048)

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **No tests included**: Specification doesn't request automated tests
- **Backend first**: Implementation follows plan.md recommendation (backend simpler than frontend)
- **Each user story independently testable**: US1 delivers working containers, US2 adds production features, US3 documents automation
- **Commit strategy**: Commit after each logical group (e.g., after completing backend Dockerfile, after completing frontend Dockerfile)
- **Stop at checkpoints**: Validate each user story independently before proceeding
- **Out of scope**: docker-compose.yml, CI/CD pipeline implementation, database containerization, Kubernetes manifests

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (Foundational)**: 2 tasks
- **Phase 3 (US1 - Local Development)**: 21 tasks
- **Phase 4 (US2 - Production Deployment)**: 21 tasks
- **Phase 5 (US3 - CI/CD Documentation)**: 4 tasks
- **Phase 6 (Polish)**: 7 tasks

**Total**: 60 tasks

**Parallel Opportunities**:
- Phase 1: 5 tasks can run in parallel
- Phase 2: 2 tasks can run in parallel
- Phase 3: Backend track (9 tasks) and Frontend track (8 tasks) can run in parallel
- Phase 4: Multiple parallel tracks (health checks, measurements, security)
- Phase 5: 4 tasks can run in parallel
- Phase 6: 5 tasks can run in parallel

**Estimated MVP Scope** (User Story 1 only): 28 tasks (Phases 1-3)
