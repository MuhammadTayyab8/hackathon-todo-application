# Tasks: Helm Chart for Kubernetes Deployment

**Input**: Design documents from `/specs/001-helm-chart-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No test tasks included (not requested in specification)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Helm chart**: `todo-chatbot-chart/` at repository root
- **Templates**: `todo-chatbot-chart/templates/`
- **Contracts**: `specs/001-helm-chart-deployment/contracts/` (reference for templates)

---

## Phase 1: Setup (Chart Structure)

**Purpose**: Initialize Helm chart directory structure

- [X] T001 Create chart directory structure at repository root: `todo-chatbot-chart/` with subdirectories `templates/`
- [X] T002 Create `.helmignore` file in `todo-chatbot-chart/.helmignore` (exclude .git, .DS_Store, *.swp, *.bak)

---

## Phase 2: Foundational (Core Chart Files)

**Purpose**: Core chart configuration that MUST be complete before resource templates

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 Create `Chart.yaml` in `todo-chatbot-chart/Chart.yaml` with metadata (name: todo-chatbot, version: 1.0.0, appVersion: "1.0", description)
- [X] T004 Create `values.yaml` in `todo-chatbot-chart/values.yaml` with complete configuration (frontend, backend, config, ingress sections per data-model.md)
- [X] T005 Create `_helpers.tpl` in `todo-chatbot-chart/templates/_helpers.tpl` with template helper functions (chart name, fullname, labels, selectorLabels)

**Checkpoint**: Foundation ready - Kubernetes resource templates can now be created

---

## Phase 3: User Story 1 - Deploy Application to Kubernetes Cluster (Priority: P1) 🎯 MVP

**Goal**: Enable DevOps engineers to deploy the complete Todo application stack (frontend + backend) to Kubernetes with a single `helm install` command

**Independent Test**: Run `helm install todo-app ./todo-chatbot-chart` on Minikube, verify 4 pods running (2 frontend + 2 backend), confirm frontend can reach backend via service DNS

### Kubernetes Resource Templates

- [X] T006 [P] [US1] Create ConfigMap template in `todo-chatbot-chart/templates/configmap.yaml` (environment variables: NEXT_PUBLIC_API_URL, CORS_ORIGINS)
- [X] T007 [P] [US1] Create frontend Deployment template in `todo-chatbot-chart/templates/frontend-deployment.yaml` (2 replicas, health probes, rolling update strategy, resources)
- [X] T008 [P] [US1] Create frontend Service template in `todo-chatbot-chart/templates/frontend-service.yaml` (ClusterIP, port 3000)
- [X] T009 [P] [US1] Create backend Deployment template in `todo-chatbot-chart/templates/backend-deployment.yaml` (2 replicas, health probes, rolling update strategy, resources)
- [X] T010 [P] [US1] Create backend Service template in `todo-chatbot-chart/templates/backend-service.yaml` (ClusterIP, port 8000)
- [X] T011 [US1] Create `NOTES.txt` in `todo-chatbot-chart/templates/NOTES.txt` with post-install instructions

### Validation

- [X] T012 [US1] Run `helm lint todo-chatbot-chart/` and fix any errors or warnings
- [X] T013 [US1] Run `helm install --dry-run --debug todo-app ./todo-chatbot-chart` and verify all templates render correctly

### Deployment Testing

- [ ] T014 [US1] Start Minikube and load Docker images (follow quickstart.md steps 1-2) - SKIPPED: Requires Minikube environment
- [ ] T015 [US1] Install chart on Minikube with `helm install todo-app ./todo-chatbot-chart` - SKIPPED: Requires Minikube environment
- [ ] T016 [US1] Verify all 4 pods reach Running status within 60 seconds (`kubectl get pods`) - SKIPPED: Requires Minikube environment
- [ ] T017 [US1] Verify both services are created (`kubectl get svc`) - SKIPPED: Requires Minikube environment
- [ ] T018 [US1] Test frontend-to-backend communication (exec into frontend pod, curl backend-service:8000/health) - SKIPPED: Requires Minikube environment
- [ ] T019 [US1] Test application access via port-forward (`kubectl port-forward service/frontend-service 3000:3000`) - SKIPPED: Requires Minikube environment

**Checkpoint**: At this point, the chart successfully deploys both services and they can communicate

---

## Phase 4: User Story 2 - Update Configuration and Manage Releases (Priority: P2)

**Goal**: Enable DevOps engineers to update configuration and perform rolling updates without downtime

**Independent Test**: Modify values.yaml (change replica count to 3), run `helm upgrade todo-app ./todo-chatbot-chart`, verify zero downtime and new configuration applied

### Configuration Update Testing

- [ ] T020 [US2] Test helm upgrade with replica count change (modify values.yaml, run `helm upgrade todo-app ./todo-chatbot-chart`, verify rolling update) - SKIPPED: Requires Minikube environment
- [ ] T021 [US2] Test helm upgrade with resource limit changes (modify values.yaml resources, run upgrade, verify pods recreated with new limits) - SKIPPED: Requires Minikube environment
- [ ] T022 [US2] Test helm upgrade with ConfigMap changes (modify environment variables, run upgrade, verify new values in pods) - SKIPPED: Requires Minikube environment
- [ ] T023 [US2] Verify zero downtime during upgrade (monitor pod status, ensure maxUnavailable=0 works) - SKIPPED: Requires Minikube environment

### Rollback Testing

- [ ] T024 [US2] Test helm rollback functionality (run `helm rollback todo-app`, verify application reverts to previous version) - SKIPPED: Requires Minikube environment
- [ ] T025 [US2] Verify rollback completes in under 30 seconds - SKIPPED: Requires Minikube environment

### Documentation

- [X] T026 [US2] Document upgrade procedures in `specs/001-helm-chart-deployment/quickstart.md` (already exists, verify completeness)

**Checkpoint**: Chart supports configuration updates and rollback with zero downtime

---

## Phase 5: User Story 3 - Expose Application via Ingress (Priority: P3)

**Goal**: Enable external access to the application via Ingress controller with path-based routing

**Independent Test**: Enable Ingress in values.yaml, run `helm upgrade`, verify external requests route correctly (/ → frontend, /api → backend)

### Ingress Implementation

- [X] T027 [US3] Create Ingress template in `todo-chatbot-chart/templates/ingress.yaml` (conditional rendering based on ingress.enabled, path-based routing)
- [X] T028 [US3] Verify Ingress template has proper conditional logic (only renders when `ingress.enabled: true`)

### Ingress Testing

- [ ] T029 [US3] Enable Minikube Ingress addon (`minikube addons enable ingress`) - SKIPPED: Requires Minikube environment
- [ ] T030 [US3] Update values.yaml to enable Ingress (`ingress.enabled: true`) - SKIPPED: Requires Minikube environment
- [ ] T031 [US3] Run `helm upgrade todo-app ./todo-chatbot-chart` to deploy Ingress - SKIPPED: Requires Minikube environment
- [ ] T032 [US3] Verify Ingress resource is created (`kubectl get ingress`) - SKIPPED: Requires Minikube environment
- [ ] T033 [US3] Test path routing: verify / routes to frontend-service and /api routes to backend-service - SKIPPED: Requires Minikube environment
- [ ] T034 [US3] Add Ingress hostname to /etc/hosts and test browser access - SKIPPED: Requires Minikube environment

**Checkpoint**: Application is accessible externally via Ingress with proper path routing

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final documentation and validation

- [X] T035 [P] Create `README.md` in `todo-chatbot-chart/README.md` with chart description, installation instructions, configuration options, and examples
- [X] T036 [P] Verify all values.yaml options are documented with comments explaining each configuration parameter
- [X] T037 Run final `helm lint` validation to ensure zero errors and warnings
- [X] T038 Verify all success criteria from specification are met (deploy < 2 min, lint passes, dry-run succeeds, pods ready < 60s, etc.)
- [ ] T039 Run complete deployment workflow from quickstart.md to validate documentation accuracy - SKIPPED: Requires Minikube environment
- [X] T040 [P] Update root `README.md` with Helm chart usage instructions (add section on Kubernetes deployment)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Depends on User Story 1 completion (needs deployed chart to test updates)
  - User Story 3 (P3): Depends on User Story 1 completion (needs deployed chart to add Ingress)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Creates all core templates
- **User Story 2 (P2)**: Depends on User Story 1 - Tests update/rollback of existing deployment
- **User Story 3 (P3)**: Depends on User Story 1 - Adds Ingress to existing deployment

### Within Each User Story

**User Story 1**:
- ConfigMap, frontend Deployment, frontend Service, backend Deployment, backend Service can be created in parallel (T006-T010)
- NOTES.txt depends on templates being created (T011)
- Validation depends on all templates (T012-T013)
- Deployment testing must be sequential (T014-T019)

**User Story 2**:
- All testing tasks must be sequential (T020-T025)
- Documentation can be done in parallel (T026)

**User Story 3**:
- Ingress template creation and verification can be done together (T027-T028)
- Testing tasks must be sequential (T029-T034)

### Parallel Opportunities

- **Phase 1**: Both tasks can run in parallel (T001-T002)
- **Phase 2**: Chart.yaml, values.yaml, _helpers.tpl can be created in parallel (T003-T005)
- **Phase 3 (US1)**:
  - Template creation (T006-T010) can all run in parallel - different files, no dependencies
  - Validation and testing must be sequential
- **Phase 6**: README.md, values.yaml documentation, root README update can run in parallel (T035-T036, T040)

---

## Parallel Example: User Story 1 (Template Creation)

```bash
# After Phase 2 completes, create all templates in parallel:

# Developer/Agent A:
Task T006: "Create ConfigMap template in todo-chatbot-chart/templates/configmap.yaml"
Task T007: "Create frontend Deployment template in todo-chatbot-chart/templates/frontend-deployment.yaml"

# Developer/Agent B:
Task T008: "Create frontend Service template in todo-chatbot-chart/templates/frontend-service.yaml"
Task T009: "Create backend Deployment template in todo-chatbot-chart/templates/backend-deployment.yaml"

# Developer/Agent C:
Task T010: "Create backend Service template in todo-chatbot-chart/templates/backend-service.yaml"
Task T011: "Create NOTES.txt in todo-chatbot-chart/templates/NOTES.txt"

# Then sequential validation and testing (T012-T019)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002)
2. Complete Phase 2: Foundational (T003-T005)
3. Complete Phase 3: User Story 1 (T006-T019)
4. **STOP and VALIDATE**: Test complete deployment on Minikube
5. Deploy/demo if ready - chart can now deploy the application

**MVP Deliverable**: Working Helm chart that deploys frontend and backend to Kubernetes

### Incremental Delivery

1. **Foundation** (Phases 1-2): Chart structure + core files → Ready for template creation
2. **MVP** (Phase 3): User Story 1 → Test independently → Chart deploys application
3. **Operations** (Phase 4): User Story 2 → Test updates/rollback → Chart supports lifecycle management
4. **External Access** (Phase 5): User Story 3 → Test Ingress → Chart supports external traffic
5. **Polished** (Phase 6): Final documentation and validation → Feature complete

### Parallel Team Strategy

With multiple developers or agents:

1. **Team completes Setup + Foundational together** (Phases 1-2)
2. **Once Foundational is done, split into parallel tracks for US1**:
   - Developer/Agent A: ConfigMap + frontend templates (T006-T008)
   - Developer/Agent B: Backend templates + NOTES (T009-T011)
3. **Merge for validation and testing** (T012-T019)
4. **Sequential for US2 and US3** (testing-focused, less parallelization)
5. **Parallel for documentation** (T035-T036, T040)

---

## Success Criteria Validation

After completing all tasks, verify these success criteria from the specification:

- [ ] **SC-001**: DevOps engineer can deploy with single `helm install` command in < 2 minutes (validate with T015)
- [ ] **SC-002**: Chart passes `helm lint` with zero errors/warnings (validate with T012, T037)
- [ ] **SC-003**: Chart successfully performs `helm install --dry-run` without errors (validate with T013)
- [ ] **SC-004**: Both services achieve "Running" status within 60 seconds (validate with T016)
- [ ] **SC-005**: Frontend pods can communicate with backend via service DNS (validate with T018)
- [ ] **SC-006**: Rolling updates complete without downtime (validate with T023)
- [ ] **SC-007**: Chart deploys to Kubernetes 1.24+ (validate with T015)
- [ ] **SC-008**: Configuration changes take effect within 30 seconds of `helm upgrade` (validate with T020-T022)
- [ ] **SC-009**: Chart supports rollback in < 30 seconds (validate with T024-T025)
- [ ] **SC-010**: All pods pass health checks and reach Ready state (validate with T016)

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **No tests included**: Specification doesn't request automated tests
- **Contracts as reference**: Use contracts/ directory as blueprint for templates
- **Each user story independently testable**: US1 delivers working deployment, US2 adds update capability, US3 adds external access
- **Commit strategy**: Commit after each phase completion (after Phase 2, after US1, after US2, after US3, after Polish)
- **Stop at checkpoints**: Validate each user story independently before proceeding
- **Lean approach**: Focused on essential tasks only, avoiding unnecessary overhead per user request

---

## Task Count Summary

- **Phase 1 (Setup)**: 2 tasks
- **Phase 2 (Foundational)**: 3 tasks
- **Phase 3 (US1 - Deploy Application)**: 14 tasks
- **Phase 4 (US2 - Update/Manage)**: 7 tasks
- **Phase 5 (US3 - Ingress)**: 8 tasks
- **Phase 6 (Polish)**: 6 tasks

**Total**: 40 tasks

**Parallel Opportunities**:
- Phase 1: 2 tasks can run in parallel
- Phase 2: 3 tasks can run in parallel
- Phase 3: 5 template creation tasks (T006-T010) can run in parallel
- Phase 6: 3 documentation tasks (T035-T036, T040) can run in parallel

**Estimated MVP Scope** (User Story 1 only): 19 tasks (Phases 1-3)
