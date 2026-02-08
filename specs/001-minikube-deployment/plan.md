# Implementation Plan: Minikube Deployment and Validation

**Branch**: `001-minikube-deployment` | **Date**: 2026-02-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-minikube-deployment/spec.md`

## Summary

Deploy and validate the Todo application (Next.js frontend + FastAPI backend) to a local Minikube cluster using the existing Helm chart. This is an operational validation feature that proves the Helm chart works correctly in a Kubernetes environment. The implementation consists of executing a sequence of commands to set up Minikube, load Docker images, deploy via Helm, verify health, and test functionality. Documentation of the process and troubleshooting steps are key deliverables.

## Technical Context

**Language/Version**: N/A (operational deployment, not development)
**Primary Dependencies**: Minikube (latest), kubectl (latest), Helm 3.x, Docker Desktop
**Storage**: N/A (using existing Helm chart and Docker images)
**Testing**: Manual verification via kubectl commands and browser testing
**Target Platform**: Minikube on local machine (Windows/macOS/Linux)
**Project Type**: Operational/Infrastructure (deployment and validation)
**Performance Goals**: Deployment completes in < 10 minutes, pods ready in < 2 minutes
**Constraints**: Minimum 4 CPUs and 8GB RAM required, images must be pre-built
**Scale/Scope**: 4 pods (2 frontend + 2 backend), 2 services, 1 namespace, 1 Helm release

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [N/A] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)? ✅ Yes
- [N/A] **Phase**: Change allowed in active phase? ⚠️ N/A - This is infrastructure/deployment, not application feature
- [N/A] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB? ⚠️ N/A - Deploying existing application, not modifying stack
- [N/A] **Security**: JWT verification required for all new endpoints? ⚠️ N/A - No new endpoints, deploying existing application
- [N/A] **Scoping**: Data access scoped to user via `user_id` from JWT? ⚠️ N/A - No data access changes
- [N/A] **API**: URL follows `/api/{user_id}/tasks` pattern? ⚠️ N/A - No API changes
- [N/A] **Persistence**: Database access ONLY via backend API? ⚠️ N/A - No persistence changes
- [N/A] **Secrets**: No secrets stored on frontend? ⚠️ N/A - Using existing ConfigMap for non-sensitive config

**Constitution Compliance Note**: This feature is operational/infrastructure focused and does not modify application code, API endpoints, or data access patterns. The constitution principles apply to application development, not deployment operations. This deployment validates that the existing application (which already complies with all constitution requirements) works correctly in a Kubernetes environment.

## Project Structure

### Documentation (this feature)

```text
specs/001-minikube-deployment/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - Minikube/Helm best practices
├── data-model.md        # Phase 1 output - Kubernetes resources structure
├── quickstart.md        # Phase 1 output - Exact deployment commands
├── contracts/           # Phase 1 output - Kubernetes resource definitions (reference)
│   ├── deployment-sequence.md
│   └── verification-checklist.md
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
# Existing structure (unchanged)
backend/
├── Dockerfile           # Used for building todo-backend:latest
└── src/

frontend/
├── Dockerfile           # Used for building todo-frontend:latest
└── src/

todo-chatbot-chart/      # Existing Helm chart (created in previous iteration)
├── Chart.yaml
├── values.yaml
├── templates/
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml
│   ├── ingress.yaml
│   └── NOTES.txt
└── README.md

specs/001-minikube-deployment/  # This feature's documentation
```

**Structure Decision**: This is an operational feature that uses existing artifacts (Docker images, Helm chart) without modifying the source code structure. The focus is on deployment documentation and validation procedures.

## Complexity Tracking

> **No Constitution violations** - This is an infrastructure/deployment feature that validates existing application code without modifying it.

## Phase 0: Research & Best Practices

### Research Topics

1. **Minikube Resource Requirements**: Optimal CPU/memory allocation for running 4 pods
2. **Image Loading Methods**: Best practices for loading local Docker images into Minikube
3. **Helm Deployment Patterns**: Standard deployment and verification workflows
4. **Health Check Validation**: Methods to verify pod readiness and liveness
5. **Troubleshooting Strategies**: Common Minikube/Kubernetes deployment issues and solutions
6. **Port-Forward vs Minikube Service**: Trade-offs for accessing applications locally
7. **Namespace Management**: Best practices for isolating deployments

### Key Decisions

**Decision 1: Minikube Resource Allocation**
- **Chosen**: 4 CPUs, 8GB RAM
- **Rationale**: Sufficient for 4 pods with resource limits (500m CPU, 512Mi memory each), plus Kubernetes system components
- **Alternatives**: 2 CPUs/4GB (rejected - insufficient for 4 pods), 8 CPUs/16GB (rejected - overkill for local testing)

**Decision 2: Image Loading Method**
- **Chosen**: `minikube image load` command
- **Rationale**: Simple, reliable, works with imagePullPolicy: Never
- **Alternatives**: `eval $(minikube docker-env)` then rebuild (rejected - slower, requires rebuilding), Docker registry (rejected - unnecessary complexity)

**Decision 3: Namespace Strategy**
- **Chosen**: Dedicated 'todo-app' namespace
- **Rationale**: Isolates deployment, easy to clean up, follows best practices
- **Alternatives**: Default namespace (rejected - cluttered, harder to manage), Multiple namespaces (rejected - unnecessary for single app)

**Decision 4: Access Method**
- **Chosen**: kubectl port-forward for testing
- **Rationale**: Simple, works on all platforms, no additional configuration needed
- **Alternatives**: minikube service (rejected - less reliable on Windows), Ingress (rejected - disabled by default in chart)

**Decision 5: Verification Approach**
- **Chosen**: Sequential verification (pods → services → connectivity → functionality)
- **Rationale**: Logical progression, easier to troubleshoot failures
- **Alternatives**: Parallel verification (rejected - harder to debug), Automated testing (rejected - out of scope)

## Phase 1: Design Artifacts

### Data Model (Kubernetes Resources)

The "data model" for this deployment consists of Kubernetes resources and their relationships:

**Namespace**: `todo-app`
- Isolates all application resources
- Allows easy cleanup with single delete command

**Helm Release**: `todo-chatbot`
- Manages all Kubernetes resources as a unit
- Enables upgrades, rollbacks, and version tracking

**Deployments** (2):
- `todo-chatbot-frontend`: 2 replicas, todo-frontend:latest image
- `todo-chatbot-backend`: 2 replicas, todo-backend:latest image
- Both configured with rolling update strategy (maxSurge: 1, maxUnavailable: 0)

**Pods** (4 total):
- 2 frontend pods: Port 3000, health checks at /health
- 2 backend pods: Port 8000, health checks at /health
- Resource requests: 100m CPU, 128Mi memory
- Resource limits: 500m CPU, 512Mi memory

**Services** (2):
- `frontend-service`: ClusterIP, port 3000 → pod port 3000
- `backend-service`: ClusterIP, port 8000 → pod port 8000
- Enable Kubernetes DNS-based service discovery

**ConfigMap**: `todo-chatbot-config`
- NEXT_PUBLIC_API_URL: http://backend-service:8000
- CORS_ORIGINS: http://frontend-service:3000

### API Contracts (Deployment Sequence)

This feature doesn't create API endpoints but defines a deployment contract - the sequence of operations that must be executed:

**Contract 1: Pre-Deployment Verification**
```yaml
Prerequisites:
  - Minikube installed
  - kubectl installed
  - Helm 3.x installed
  - Docker images built: todo-frontend:latest, todo-backend:latest
  - Helm chart exists: todo-chatbot-chart/

Verification Commands:
  - minikube version
  - kubectl version --client
  - helm version
  - docker images | grep todo
  - helm lint todo-chatbot-chart/
```

**Contract 2: Deployment Sequence**
```yaml
Step 1: Start Minikube
  Command: minikube start --cpus=4 --memory=8192 --driver=docker
  Success: minikube status shows "Running"

Step 2: Load Images
  Commands:
    - minikube image load todo-frontend:latest
    - minikube image load todo-backend:latest
  Success: minikube image ls | grep todo shows both images

Step 3: Create Namespace
  Command: kubectl create namespace todo-app
  Success: kubectl get namespace todo-app exists

Step 4: Install Helm Chart
  Command: helm install todo-chatbot ./todo-chatbot-chart --namespace todo-app
  Success: helm list -n todo-app shows "deployed" status

Step 5: Wait for Pods
  Command: kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s
  Success: All 4 pods show "Running" and "1/1 Ready"
```

**Contract 3: Verification Checklist**
```yaml
Pod Verification:
  - kubectl get pods -n todo-app
  - Expected: 4 pods, all Running, all 1/1 Ready

Service Verification:
  - kubectl get services -n todo-app
  - Expected: frontend-service (3000), backend-service (8000)

Deployment Verification:
  - kubectl get deployments -n todo-app
  - Expected: 2 deployments, both Available, correct replica counts

ConfigMap Verification:
  - kubectl get configmap -n todo-app
  - Expected: todo-chatbot-config exists

Connectivity Verification:
  - kubectl exec -n todo-app [frontend-pod] -- curl http://backend-service:8000/health
  - Expected: 200 OK response

Health Endpoint Verification:
  - kubectl port-forward -n todo-app service/backend-service 8000:8000
  - curl http://localhost:8000/health
  - Expected: {"status":"healthy",...}
```

### Quickstart Guide

Comprehensive step-by-step deployment guide with exact commands. See `quickstart.md` for full details.

## Implementation Strategy

### Phase 1: Pre-Deployment Setup
1. Verify all prerequisites are installed (Minikube, kubectl, Helm, Docker)
2. Verify Docker images exist locally
3. Validate Helm chart with `helm lint`
4. Document system state (versions, available resources)

### Phase 2: Minikube Cluster Setup
1. Start Minikube with specified resources (4 CPUs, 8GB RAM)
2. Verify cluster is running and kubectl can connect
3. Check cluster resource availability
4. Document cluster information (IP, version, driver)

### Phase 3: Image Loading
1. Load todo-frontend:latest into Minikube
2. Load todo-backend:latest into Minikube
3. Verify images are available in Minikube's Docker daemon
4. Document image sizes and load times

### Phase 4: Deployment
1. Create todo-app namespace
2. Install Helm chart in todo-app namespace
3. Monitor pod creation and startup
4. Wait for all pods to reach Running status
5. Document deployment time and any issues

### Phase 5: Verification
1. Verify pod status (all Running, all Ready)
2. Verify service creation and endpoints
3. Verify deployment status (Available condition)
4. Test inter-service connectivity (frontend → backend)
5. Verify health endpoints respond correctly
6. Check pod logs for errors
7. Document verification results

### Phase 6: Access and Testing
1. Set up port-forward to frontend service
2. Access frontend in browser
3. Set up port-forward to backend service
4. Access backend API documentation
5. Test todo CRUD operations
6. Verify data persistence
7. Document user experience and any issues

### Phase 7: Documentation and Cleanup
1. Capture kubectl get all output
2. Capture pod logs
3. Document any issues encountered and resolutions
4. Create troubleshooting guide
5. (Optional) Clean up deployment for fresh start

## Critical Files

### Deployment Script (Optional)

While the primary deliverable is documentation, a deployment script can be created for repeatability:

```bash
#!/bin/bash
# deploy-to-minikube.sh

set -e  # Exit on error

echo "=== Todo App Minikube Deployment ==="

# Step 1: Verify prerequisites
echo "Step 1: Verifying prerequisites..."
command -v minikube >/dev/null 2>&1 || { echo "Minikube not installed"; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "kubectl not installed"; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "Helm not installed"; exit 1; }

# Step 2: Verify Docker images
echo "Step 2: Verifying Docker images..."
docker images | grep -q "todo-frontend.*latest" || { echo "todo-frontend:latest not found"; exit 1; }
docker images | grep -q "todo-backend.*latest" || { echo "todo-backend:latest not found"; exit 1; }

# Step 3: Start Minikube
echo "Step 3: Starting Minikube..."
minikube start --cpus=4 --memory=8192 --driver=docker

# Step 4: Load images
echo "Step 4: Loading Docker images into Minikube..."
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Step 5: Create namespace
echo "Step 5: Creating namespace..."
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -

# Step 6: Install Helm chart
echo "Step 6: Installing Helm chart..."
helm upgrade --install todo-chatbot ./todo-chatbot-chart --namespace todo-app

# Step 7: Wait for pods
echo "Step 7: Waiting for pods to be ready..."
kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s

# Step 8: Display status
echo "Step 8: Deployment complete!"
kubectl get all -n todo-app

echo ""
echo "Access the application:"
echo "  Frontend: kubectl port-forward -n todo-app service/frontend-service 3000:3000"
echo "  Backend:  kubectl port-forward -n todo-app service/backend-service 8000:8000"
```

### Verification Script

```bash
#!/bin/bash
# verify-deployment.sh

set -e

echo "=== Deployment Verification ==="

# Check pods
echo "Checking pods..."
kubectl get pods -n todo-app
POD_COUNT=$(kubectl get pods -n todo-app --no-headers | wc -l)
READY_COUNT=$(kubectl get pods -n todo-app --no-headers | grep "1/1" | wc -l)

if [ "$POD_COUNT" -ne 4 ]; then
  echo "ERROR: Expected 4 pods, found $POD_COUNT"
  exit 1
fi

if [ "$READY_COUNT" -ne 4 ]; then
  echo "ERROR: Expected 4 ready pods, found $READY_COUNT"
  exit 1
fi

echo "✓ All pods running and ready"

# Check services
echo "Checking services..."
kubectl get services -n todo-app
SERVICE_COUNT=$(kubectl get services -n todo-app --no-headers | wc -l)

if [ "$SERVICE_COUNT" -lt 2 ]; then
  echo "ERROR: Expected at least 2 services, found $SERVICE_COUNT"
  exit 1
fi

echo "✓ Services created"

# Check deployments
echo "Checking deployments..."
kubectl get deployments -n todo-app
AVAILABLE=$(kubectl get deployments -n todo-app -o jsonpath='{.items[*].status.conditions[?(@.type=="Available")].status}')

if [[ ! "$AVAILABLE" =~ "True True" ]]; then
  echo "ERROR: Deployments not available"
  exit 1
fi

echo "✓ Deployments available"

# Test connectivity
echo "Testing inter-service connectivity..."
FRONTEND_POD=$(kubectl get pods -n todo-app -l app=todo-frontend -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n todo-app "$FRONTEND_POD" -- curl -s http://backend-service:8000/health > /dev/null

echo "✓ Frontend can reach backend"

echo ""
echo "=== Verification Complete ==="
echo "All checks passed!"
```

## Risk Assessment

### Technical Risks

**Risk 1: Minikube fails to start**
- **Impact**: High - Cannot proceed with deployment
- **Mitigation**: Document minimum requirements, provide troubleshooting steps for common issues (Hyper-V conflicts, Docker daemon not running, insufficient resources)

**Risk 2: Image loading takes excessive time**
- **Impact**: Medium - Delays deployment
- **Mitigation**: Document expected load times (2-5 minutes per image), suggest building images in Minikube directly as alternative

**Risk 3: Pods fail health checks**
- **Impact**: High - Application not functional
- **Mitigation**: Document how to check logs, describe pods, verify health endpoints exist in Docker images

**Risk 4: Port-forward connection unstable**
- **Impact**: Low - Can be restarted
- **Mitigation**: Document how to restart port-forward, suggest using minikube service as alternative

### Operational Risks

**Risk 1: Documentation becomes outdated**
- **Impact**: Medium - Users follow incorrect instructions
- **Mitigation**: Reference existing Helm chart quickstart guide, keep deployment docs focused on Minikube-specific steps

**Risk 2: Environment-specific issues**
- **Impact**: Medium - Works on one machine but not another
- **Mitigation**: Document prerequisites clearly, include troubleshooting section for common platform-specific issues

## Success Metrics

- **SM-001**: Minikube starts successfully within 2 minutes
- **SM-002**: Both images load into Minikube within 5 minutes total
- **SM-003**: Helm chart installs without errors
- **SM-004**: All 4 pods reach Running status within 2 minutes
- **SM-005**: All pods pass readiness probes within 60 seconds
- **SM-006**: Frontend can communicate with backend (verified via curl)
- **SM-007**: Application accessible via port-forward
- **SM-008**: Todo CRUD operations work correctly
- **SM-009**: Complete deployment documented with exact commands
- **SM-010**: Troubleshooting guide covers at least 5 common issues

## Dependencies

### External Dependencies
- Minikube installed on local machine
- kubectl installed and configured
- Helm 3.x installed
- Docker Desktop running
- Web browser for testing

### Internal Dependencies
- Feature 001-docker-containerization: Docker images must be built
- Feature 001-helm-chart-deployment: Helm chart must exist and be validated

## Next Steps

1. **Phase 0**: Generate `research.md` with Minikube/Helm best practices
2. **Phase 1**: Generate `data-model.md` with Kubernetes resources structure
3. **Phase 1**: Generate `contracts/` with deployment sequence and verification checklist
4. **Phase 1**: Generate `quickstart.md` with exact deployment commands
5. **Phase 2**: Run `/sp.tasks` to generate task breakdown
6. **Implementation**: Execute deployment following the plan
7. **Documentation**: Capture outputs, screenshots, and troubleshooting steps

---

**Plan Status**: ✅ Complete - Ready for Phase 0 research generation
