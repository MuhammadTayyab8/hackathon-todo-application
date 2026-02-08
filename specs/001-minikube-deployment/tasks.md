# Tasks: Minikube Deployment and Validation

**Input**: Design documents from `/specs/001-minikube-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: No test tasks included (operational deployment, not development)

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Deployment script**: `deploy-to-minikube.sh` at repository root
- **Verification script**: `verify-deployment.sh` at repository root
- **Documentation**: `specs/001-minikube-deployment/`
- **Helm chart**: `todo-chatbot-chart/` (existing, not modified)

---

## Phase 1: Setup (Prerequisites and Scripts)

**Purpose**: Create deployment automation scripts and verify prerequisites

- [ ] T001 Verify all prerequisites are installed (Minikube, kubectl, Helm, Docker) by running commands from contracts/deployment-sequence.md Step 0
- [ ] T002 Verify Docker images exist locally (todo-frontend:latest, todo-backend:latest) using `docker images | grep todo`
- [ ] T003 Create deployment script `deploy-to-minikube.sh` at repository root with error handling, status messages, and all deployment steps from contracts/deployment-sequence.md
- [ ] T004 Create verification script `verify-deployment.sh` at repository root with health checks and connectivity tests from contracts/verification-checklist.md
- [ ] T005 Make scripts executable with `chmod +x deploy-to-minikube.sh verify-deployment.sh`

---

## Phase 2: User Story 1 - Deploy Application to Minikube (Priority: P1) 🎯 MVP

**Goal**: Enable DevOps engineers to deploy the complete Todo application stack (frontend + backend) to Minikube with a single command or script execution

**Independent Test**: Run deployment script or manual commands, verify all 4 pods reach Running status, confirm services are created with correct ports

### Minikube Cluster Setup

- [ ] T006 [US1] Start Minikube cluster with `minikube start --cpus=4 --memory=8192 --driver=docker`
- [ ] T007 [US1] Verify Minikube status with `minikube status` (expect: minikube, kubelet, apiserver all Running)
- [ ] T008 [US1] Verify kubectl can connect with `kubectl cluster-info`

### Image Loading

- [ ] T009 [US1] Load frontend image into Minikube with `minikube image load todo-frontend:latest`
- [ ] T010 [US1] Load backend image into Minikube with `minikube image load todo-backend:latest`
- [ ] T011 [US1] Verify images are loaded with `minikube image ls | grep todo` (expect both images listed)

### Namespace and Deployment

- [ ] T012 [US1] Create todo-app namespace with `kubectl create namespace todo-app`
- [ ] T013 [US1] Verify namespace exists with `kubectl get namespace todo-app`
- [ ] T014 [US1] Validate Helm chart with `helm lint todo-chatbot-chart/` (expect 0 failures)
- [ ] T015 [US1] Install Helm chart with `helm install todo-chatbot ./todo-chatbot-chart --namespace todo-app`
- [ ] T016 [US1] Verify Helm release with `helm list -n todo-app` (expect STATUS: deployed)

### Pod Verification

- [ ] T017 [US1] Wait for all pods to be ready with `kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s`
- [ ] T018 [US1] Verify all 4 pods are Running with `kubectl get pods -n todo-app` (expect 4 pods, all Running, all 1/1 Ready)
- [ ] T019 [US1] Verify frontend pods exist with `kubectl get pods -n todo-app -l app=todo-frontend` (expect 2 pods)
- [ ] T020 [US1] Verify backend pods exist with `kubectl get pods -n todo-app -l app=todo-backend` (expect 2 pods)

### Service Verification

- [ ] T021 [US1] Verify frontend service exists with `kubectl get service frontend-service -n todo-app` (expect ClusterIP, port 3000)
- [ ] T022 [US1] Verify backend service exists with `kubectl get service backend-service -n todo-app` (expect ClusterIP, port 8000)
- [ ] T023 [US1] Verify frontend service has 2 endpoints with `kubectl get endpoints frontend-service -n todo-app`
- [ ] T024 [US1] Verify backend service has 2 endpoints with `kubectl get endpoints backend-service -n todo-app`

### Deployment Status

- [ ] T025 [US1] Verify frontend deployment with `kubectl get deployment todo-chatbot-frontend -n todo-app` (expect READY: 2/2)
- [ ] T026 [US1] Verify backend deployment with `kubectl get deployment todo-chatbot-backend -n todo-app` (expect READY: 2/2)
- [ ] T027 [US1] Capture deployment output with `kubectl get all -n todo-app > deployment-output.txt`

**Checkpoint**: At this point, the application is fully deployed with all pods running and services created

---

## Phase 3: User Story 2 - Verify Deployment Health (Priority: P2)

**Goal**: Enable DevOps engineers to verify that the deployed application is healthy and all components can communicate correctly

**Independent Test**: Run verification commands against existing deployment, confirm all health checks pass and inter-service connectivity works

### Health Check Verification

- [ ] T028 [US2] Verify all pods pass readiness probes with `kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.conditions[?(@.type=="Ready")].status}{"\n"}{end}'`
- [ ] T029 [US2] Verify no pod restarts with `kubectl get pods -n todo-app -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.containerStatuses[0].restartCount}{"\n"}{end}'` (expect all 0)
- [ ] T030 [US2] Test backend health endpoint with `kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n todo-app -- curl -s http://backend-service:8000/health`
- [ ] T031 [US2] Test frontend health endpoint with `kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n todo-app -- curl -s http://frontend-service:3000/health`

### Deployment Status Verification

- [ ] T032 [US2] Verify frontend deployment is Available with `kubectl get deployment todo-chatbot-frontend -n todo-app -o jsonpath='{.status.conditions[?(@.type=="Available")].status}'` (expect True)
- [ ] T033 [US2] Verify backend deployment is Available with `kubectl get deployment todo-chatbot-backend -n todo-app -o jsonpath='{.status.conditions[?(@.type=="Available")].status}'` (expect True)
- [ ] T034 [US2] Check rollout status with `kubectl rollout status deployment/todo-chatbot-frontend -n todo-app` and `kubectl rollout status deployment/todo-chatbot-backend -n todo-app`

### Inter-Service Connectivity

- [ ] T035 [US2] Test frontend-to-backend connectivity by getting frontend pod name and executing curl from within pod: `kubectl exec -n todo-app <frontend-pod> -- curl -s http://backend-service:8000/health`
- [ ] T036 [US2] Verify backend service DNS resolution with `kubectl run dns-test --image=busybox --rm -it --restart=Never -n todo-app -- nslookup backend-service`
- [ ] T037 [US2] Verify frontend service DNS resolution with `kubectl run dns-test --image=busybox --rm -it --restart=Never -n todo-app -- nslookup frontend-service`

### Log Verification

- [ ] T038 [US2] Check frontend pod logs for errors with `kubectl logs -l app=todo-frontend -n todo-app --tail=50` (expect no error messages)
- [ ] T039 [US2] Check backend pod logs for errors with `kubectl logs -l app=todo-backend -n todo-app --tail=50` (expect no error messages)
- [ ] T040 [US2] Check for warning/error events with `kubectl get events -n todo-app --field-selector type!=Normal` (expect no critical events)

### ConfigMap Verification

- [ ] T041 [US2] Verify ConfigMap exists with `kubectl get configmap todo-chatbot-config -n todo-app`
- [ ] T042 [US2] Verify ConfigMap data with `kubectl get configmap todo-chatbot-config -n todo-app -o yaml` (expect NEXT_PUBLIC_API_URL and CORS_ORIGINS keys)
- [ ] T043 [US2] Capture pod logs with `kubectl logs -l app=todo-frontend -n todo-app > frontend-logs.txt` and `kubectl logs -l app=todo-backend -n todo-app > backend-logs.txt`

**Checkpoint**: All health checks pass, inter-service connectivity verified, no errors in logs

---

## Phase 4: User Story 3 - Access and Test Application (Priority: P3)

**Goal**: Enable end users and QA engineers to access the deployed application through a browser and verify that core todo functionality works correctly

**Independent Test**: Access application via port-forward, perform todo CRUD operations in browser, verify data persistence

### External Access Setup

- [ ] T044 [US3] Set up port-forward to frontend service with `kubectl port-forward -n todo-app service/frontend-service 3000:3000` (run in background or separate terminal)
- [ ] T045 [US3] Set up port-forward to backend service with `kubectl port-forward -n todo-app service/backend-service 8000:8000` (run in background or separate terminal)
- [ ] T046 [US3] Verify frontend is accessible with `curl http://localhost:3000/health` (expect health status response)
- [ ] T047 [US3] Verify backend is accessible with `curl http://localhost:8000/health` (expect {"status":"healthy",...})

### Browser Testing

- [ ] T048 [US3] Access frontend in browser at http://localhost:3000 and verify UI loads without errors
- [ ] T049 [US3] Access backend API documentation at http://localhost:8000/docs and verify Swagger UI loads with all endpoints visible
- [ ] T050 [US3] Test create todo operation: Add a new todo item via frontend UI and verify it appears in the list
- [ ] T051 [US3] Test read todo operation: Refresh page or navigate to todo list and verify previously created todos are visible
- [ ] T052 [US3] Test update todo operation: Edit an existing todo item and verify changes are saved and reflected in UI
- [ ] T053 [US3] Test delete todo operation: Delete a todo item from the list and verify it is removed
- [ ] T054 [US3] Test data persistence: Refresh browser page and verify todos remain visible after refresh

### Performance Verification

- [ ] T055 [US3] Verify frontend loads in < 5 seconds (measure time from request to page load)
- [ ] T056 [US3] Verify todo operations complete in < 2 seconds per operation (create, update, delete)
- [ ] T057 [US3] Verify health endpoints respond in < 1 second

**Checkpoint**: Application is fully functional from user perspective, all CRUD operations work, data persists

---

## Phase 5: Polish & Documentation

**Purpose**: Complete documentation, capture artifacts, and create troubleshooting guide

- [ ] T058 [P] Document deployment process in `specs/001-minikube-deployment/DEPLOYMENT_LOG.md` with exact commands executed, outputs received, and any issues encountered
- [ ] T059 [P] Create troubleshooting guide in `specs/001-minikube-deployment/TROUBLESHOOTING.md` with solutions for at least 5 common issues (ImagePullBackOff, CrashLoopBackOff, Pods Pending, Service Not Accessible, Port-Forward Connection Drops)
- [ ] T060 [P] Capture screenshots of running application: frontend UI, backend API docs, kubectl get pods output, kubectl get services output
- [ ] T061 [P] Save kubectl outputs: `kubectl get all -n todo-app`, `helm status todo-chatbot -n todo-app`, pod logs
- [ ] T062 Verify all success criteria from specification are met (SC-001 through SC-014)
- [ ] T063 Test deployment script end-to-end by running `./deploy-to-minikube.sh` on a clean Minikube cluster
- [ ] T064 Test verification script by running `./verify-deployment.sh` after deployment
- [ ] T065 Document cleanup procedure: `helm uninstall todo-chatbot -n todo-app`, `kubectl delete namespace todo-app`, `minikube stop`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **User Story 1 (Phase 2)**: Depends on Setup completion - Creates deployment
- **User Story 2 (Phase 3)**: Depends on User Story 1 completion - Verifies existing deployment
- **User Story 3 (Phase 4)**: Depends on User Story 1 completion - Tests existing deployment (can run in parallel with US2)
- **Polish (Phase 5)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Setup - Creates all resources
- **User Story 2 (P2)**: Depends on User Story 1 - Verifies health of deployed resources
- **User Story 3 (P3)**: Depends on User Story 1 - Tests functionality of deployed application

### Within Each User Story

**User Story 1**:
- Minikube setup must complete before image loading
- Image loading must complete before Helm installation
- Helm installation must complete before verification
- All verification tasks can run sequentially

**User Story 2**:
- All verification tasks can run in any order (no dependencies)
- Log capture should be done last

**User Story 3**:
- Port-forward setup must complete before browser testing
- Browser testing tasks must be sequential (create → read → update → delete)

### Parallel Opportunities

- **Phase 1**: T001-T002 can run in parallel (different checks)
- **Phase 1**: T003-T004 can run in parallel (different scripts)
- **Phase 2 (US1)**: T009-T010 can run in parallel (loading different images)
- **Phase 2 (US1)**: T019-T020 can run in parallel (checking different pod types)
- **Phase 2 (US1)**: T021-T022 can run in parallel (checking different services)
- **Phase 2 (US1)**: T023-T024 can run in parallel (checking different endpoints)
- **Phase 2 (US1)**: T025-T026 can run in parallel (checking different deployments)
- **Phase 3 (US2)**: Most verification tasks can run in parallel (T028-T042)
- **Phase 4 (US3)**: T044-T045 can run in parallel (different port-forwards)
- **Phase 5**: T058-T061 can run in parallel (different documentation tasks)

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T005)
2. Complete Phase 2: User Story 1 (T006-T027)
3. **STOP and VALIDATE**: Verify all pods running, services created
4. Deploy/demo if ready - application is deployed and accessible

**MVP Deliverable**: Working Minikube deployment with all pods running and services accessible

### Incremental Delivery

1. **Foundation** (Phase 1): Scripts created → Ready for deployment
2. **MVP** (Phase 2): User Story 1 → Test independently → Application deployed
3. **Health Verification** (Phase 3): User Story 2 → Test health checks → Deployment verified healthy
4. **Functional Testing** (Phase 4): User Story 3 → Test in browser → Application fully functional
5. **Polished** (Phase 5): Documentation complete → Feature complete

### Parallel Team Strategy

With multiple developers or agents:

1. **Team completes Setup together** (Phase 1)
2. **Sequential for US1** (Phase 2) - Deployment must be sequential
3. **Parallel for US2 and US3** (Phases 3-4):
   - Developer/Agent A: Health verification (T028-T043)
   - Developer/Agent B: Functional testing (T044-T057)
4. **Parallel for documentation** (Phase 5): T058-T061

---

## Success Criteria Validation

After completing all tasks, verify these success criteria from the specification:

- [ ] **SC-001**: Minikube cluster starts successfully and kubectl can connect within 2 minutes (validate with T006-T008)
- [ ] **SC-002**: Both Docker images load into Minikube within 5 minutes total (validate with T009-T011)
- [ ] **SC-003**: Helm chart installs without errors and all resources are created within 30 seconds (validate with T015-T016)
- [ ] **SC-004**: All 4 pods reach Running status within 2 minutes of Helm installation (validate with T017-T020)
- [ ] **SC-005**: All pods pass readiness probes within 60 seconds of reaching Running status (validate with T028)
- [ ] **SC-006**: Frontend can successfully communicate with backend (validate with T035)
- [ ] **SC-007**: Frontend is accessible via port-forward and loads in browser within 5 seconds (validate with T048, T055)
- [ ] **SC-008**: Backend API documentation is accessible and displays all endpoints correctly (validate with T049)
- [ ] **SC-009**: User can create, read, update, and delete todo items with response times under 2 seconds per operation (validate with T050-T053, T056)
- [ ] **SC-010**: Todo data persists correctly after page refresh and pod restarts (validate with T054)
- [ ] **SC-011**: No error messages appear in pod logs during normal operation (validate with T038-T039)
- [ ] **SC-012**: All verification commands complete successfully with expected output (validate with T028-T043)
- [ ] **SC-013**: Complete deployment process is documented with exact commands and expected outputs (validate with T058)
- [ ] **SC-014**: Troubleshooting guide includes solutions for at least 5 common failure scenarios (validate with T059)

---

## Notes

- **No [P] markers on sequential tasks**: Deployment steps must run in order
- **[Story] labels**: Map tasks to specific user stories for traceability
- **No tests included**: This is operational deployment, not development
- **Scripts as deliverables**: deploy-to-minikube.sh and verify-deployment.sh are key outputs
- **Each user story independently testable**: US1 delivers deployment, US2 adds verification, US3 adds functional testing
- **Commit strategy**: Commit after each phase completion (after Setup, after US1, after US2, after US3, after Polish)
- **Stop at checkpoints**: Validate each user story independently before proceeding
- **Documentation is critical**: Process must be repeatable by others

---

## Task Count Summary

- **Phase 1 (Setup)**: 5 tasks
- **Phase 2 (US1 - Deploy Application)**: 22 tasks
- **Phase 3 (US2 - Verify Health)**: 16 tasks
- **Phase 4 (US3 - Access and Test)**: 14 tasks
- **Phase 5 (Polish)**: 8 tasks

**Total**: 65 tasks

**Parallel Opportunities**:
- Phase 1: 4 tasks can run in parallel (T001-T002, T003-T004)
- Phase 2: 8 tasks can run in parallel (T009-T010, T019-T020, T021-T022, T023-T024, T025-T026)
- Phase 3: Most tasks can run in parallel (T028-T042)
- Phase 4: 2 tasks can run in parallel (T044-T045)
- Phase 5: 4 tasks can run in parallel (T058-T061)

**Estimated MVP Scope** (User Story 1 only): 27 tasks (Phases 1-2)

---

## Deployment Script Requirements

The `deploy-to-minikube.sh` script (T003) should include:

1. **Shebang and error handling**: `#!/bin/bash` and `set -e`
2. **Prerequisites check**: Verify Minikube, kubectl, Helm, Docker installed
3. **Image verification**: Check Docker images exist before loading
4. **Minikube management**: Check if running, start if not
5. **Image loading**: Load both images with progress messages
6. **Namespace creation**: Create namespace idempotently
7. **Helm deployment**: Install chart with proper flags
8. **Wait for ready**: Use kubectl wait with timeout
9. **Status display**: Show deployment status with kubectl get all
10. **Access instructions**: Print port-forward commands for user
11. **Error messages**: Clear error messages for each failure point
12. **Exit codes**: Proper exit codes for success/failure

The `verify-deployment.sh` script (T004) should include:

1. **Pod verification**: Check all pods Running and Ready
2. **Service verification**: Check services exist with endpoints
3. **Deployment verification**: Check deployments Available
4. **Health checks**: Test health endpoints
5. **Connectivity tests**: Test inter-service communication
6. **Summary output**: Print verification results with ✓/✗ markers
7. **Exit codes**: Exit 0 if all checks pass, exit 1 if any fail
