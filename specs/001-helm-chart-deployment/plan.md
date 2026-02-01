# Implementation Plan: Helm Chart for Kubernetes Deployment

**Branch**: `001-helm-chart-deployment` | **Date**: 2026-02-01 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-helm-chart-deployment/spec.md`

## Summary

Create a production-ready Helm chart to deploy the Todo application (Next.js frontend + FastAPI backend) to Kubernetes clusters. The chart will support local Minikube deployments and cloud Kubernetes environments, with configurable replicas, resources, health checks, and optional Ingress for external access. The implementation follows Helm and Kubernetes best practices with rolling updates, zero-downtime deployments, and comprehensive documentation.

## Technical Context

**Language/Version**: Helm 3.x, Kubernetes 1.24+
**Primary Dependencies**: Helm CLI, kubectl, Minikube (for local testing), Docker images (todo-frontend:latest, todo-backend:latest)
**Storage**: N/A (stateless application, external database)
**Testing**: helm lint, helm install --dry-run, kubectl validation
**Target Platform**: Kubernetes clusters (Minikube, GKE, EKS, AKS, kind)
**Project Type**: Infrastructure/DevOps (Helm chart package)
**Performance Goals**: Deploy in < 2 minutes, rolling updates in < 1 minute, health checks respond in < 1 second
**Constraints**: Image size targets (frontend < 200MB, backend < 300MB), zero downtime during updates, Kubernetes 1.24+ API compatibility
**Scale/Scope**: 4 pods (2 frontend + 2 backend), configurable replicas, supports horizontal scaling

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)? ✅ Yes
- [N/A] **Phase**: Change allowed in active phase? ⚠️ N/A - This is infrastructure/deployment, not application feature
- [N/A] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB? ⚠️ N/A - Chart deploys existing images, doesn't modify stack
- [N/A] **Security**: JWT verification required for all new endpoints? ⚠️ N/A - No new endpoints, deploying existing application
- [N/A] **Scoping**: Data access scoped to user via `user_id` from JWT? ⚠️ N/A - No data access changes
- [N/A] **API**: URL follows `/api/{user_id}/tasks` pattern? ⚠️ N/A - No API changes
- [N/A] **Persistence**: Database access ONLY via backend API? ⚠️ N/A - No persistence changes
- [N/A] **Secrets**: No secrets stored on frontend? ⚠️ N/A - Chart uses ConfigMap for non-sensitive config, assumes external secret management

**Constitution Compliance Note**: This feature is infrastructure/deployment focused and does not modify application code, API endpoints, or data access patterns. The constitution principles apply to application development, not deployment tooling. The chart deploys the existing application that already complies with all constitution requirements.

## Project Structure

### Documentation (this feature)

```text
specs/001-helm-chart-deployment/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output - Helm/K8s best practices
├── data-model.md        # Phase 1 output - Chart structure and K8s resources
├── quickstart.md        # Phase 1 output - Deployment commands and guide
├── contracts/           # Phase 1 output - Kubernetes resource definitions
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml
│   └── ingress.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command)
```

### Source Code (repository root)

```text
todo-chatbot-chart/           # Helm chart directory (to be created)
├── Chart.yaml                # Chart metadata
├── values.yaml               # Default configuration values
├── templates/                # Kubernetes resource templates
│   ├── _helpers.tpl          # Template helpers
│   ├── frontend-deployment.yaml
│   ├── frontend-service.yaml
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── configmap.yaml
│   ├── ingress.yaml
│   └── NOTES.txt             # Post-install notes
├── .helmignore               # Files to exclude from chart package
└── README.md                 # Chart documentation

# Existing structure (unchanged)
backend/
├── Dockerfile                # Used by chart (imagePullPolicy: Never for Minikube)
└── src/

frontend/
├── Dockerfile                # Used by chart (imagePullPolicy: Never for Minikube)
└── src/

specs/001-helm-chart-deployment/  # This feature's documentation
```

**Structure Decision**: Helm chart will be created at repository root as `todo-chatbot-chart/` directory. This follows Helm conventions and makes the chart easily discoverable. The chart references Docker images built from existing `backend/` and `frontend/` directories but does not modify those directories.

## Complexity Tracking

> **No Constitution violations** - This is an infrastructure feature that deploys existing application code without modifying it.

## Phase 0: Research & Best Practices

### Research Topics

1. **Helm Chart Structure**: Standard directory layout, Chart.yaml format, values.yaml patterns
2. **Kubernetes Resource Templates**: Deployment, Service, ConfigMap, Ingress best practices
3. **Health Check Configuration**: Readiness and liveness probes for Next.js and FastAPI
4. **Rolling Update Strategy**: Zero-downtime deployment configuration
5. **Resource Management**: CPU/memory requests and limits for Node.js and Python applications
6. **Minikube Image Loading**: Best practices for using local Docker images in Minikube
7. **Service Discovery**: Kubernetes DNS for inter-service communication
8. **Ingress Configuration**: Path-based routing for frontend and backend services

### Key Decisions

**Decision 1: Chart Name**
- **Chosen**: `todo-chatbot` (as specified in requirements)
- **Rationale**: Matches user specification, descriptive name for the application
- **Alternatives**: `todo-app`, `hackathon-todo` (rejected - user specified exact name)

**Decision 2: Image Pull Policy**
- **Chosen**: `Never` (default for Minikube), configurable via values.yaml
- **Rationale**: Supports local Minikube development without registry, can be overridden for cloud deployments
- **Alternatives**: `IfNotPresent`, `Always` (available via values.yaml override)

**Decision 3: Service Type**
- **Chosen**: ClusterIP for both services
- **Rationale**: Internal communication only, external access via Ingress (optional)
- **Alternatives**: NodePort, LoadBalancer (rejected - Ingress provides better routing control)

**Decision 4: Health Check Endpoints**
- **Chosen**: `/health` for both frontend and backend
- **Rationale**: Already implemented in feature 001-docker-containerization
- **Alternatives**: `/healthz`, `/ready` (rejected - endpoints already exist)

**Decision 5: ConfigMap vs Secrets**
- **Chosen**: ConfigMap for non-sensitive config (API URLs, CORS origins), assume external secret management for sensitive data
- **Rationale**: Keeps chart simple, follows Kubernetes best practices (secrets managed separately)
- **Alternatives**: Include Secret resources (rejected - out of scope per spec)

## Phase 1: Design Artifacts

### Data Model (Chart Structure)

The "data model" for a Helm chart is the structure of Kubernetes resources and their relationships:

**Chart Metadata** (Chart.yaml):
- name: todo-chatbot
- version: 1.0.0
- appVersion: "1.0"
- description: Todo Chatbot with Next.js and FastAPI
- apiVersion: v2

**Configuration Values** (values.yaml):
- Frontend: replicas, image, port, resources
- Backend: replicas, image, port, resources
- Services: names, types, ports
- Ingress: enabled flag, hostname, paths
- ConfigMap: environment variables

**Kubernetes Resources** (templates/):
- Deployments: frontend-deployment, backend-deployment
- Services: frontend-service, backend-service
- ConfigMap: app-config
- Ingress: app-ingress (optional)

### API Contracts (Kubernetes Resources)

Contracts are defined as Kubernetes resource specifications in `/contracts/` directory. These serve as the blueprint for the Helm templates.

### Quickstart Guide

Comprehensive deployment guide with exact commands for Minikube setup, image loading, chart installation, verification, and access. See `quickstart.md` for full details.

## Implementation Strategy

### Phase 1: Chart Structure Setup
1. Create `todo-chatbot-chart/` directory at repository root
2. Create `Chart.yaml` with metadata
3. Create `values.yaml` with default configuration
4. Create `templates/` directory
5. Create `.helmignore` file
6. Create `README.md` with chart documentation

### Phase 2: Kubernetes Resource Templates
1. Create `templates/_helpers.tpl` with template functions
2. Create `templates/frontend-deployment.yaml` with health checks and rolling update strategy
3. Create `templates/frontend-service.yaml` with ClusterIP configuration
4. Create `templates/backend-deployment.yaml` with health checks and rolling update strategy
5. Create `templates/backend-service.yaml` with ClusterIP configuration
6. Create `templates/configmap.yaml` with environment variables
7. Create `templates/ingress.yaml` with conditional rendering (enabled flag)
8. Create `templates/NOTES.txt` with post-install instructions

### Phase 3: Validation & Testing
1. Run `helm lint todo-chatbot-chart/` to validate chart structure
2. Run `helm install --dry-run --debug todo-app ./todo-chatbot-chart` to validate templates
3. Test on Minikube with local images
4. Verify pod startup and health checks
5. Test service-to-service communication
6. Test rolling updates
7. Test rollback functionality
8. Test Ingress (if enabled)

### Phase 4: Documentation
1. Complete `README.md` with installation instructions
2. Document all values.yaml configuration options
3. Add examples for common use cases
4. Document troubleshooting steps

## Critical Files

### Chart.yaml
```yaml
apiVersion: v2
name: todo-chatbot
description: Todo Chatbot with Next.js and FastAPI
version: 1.0.0
appVersion: "1.0"
```

### values.yaml (structure)
```yaml
frontend:
  replicaCount: 2
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: Never
  service:
    name: frontend-service
    type: ClusterIP
    port: 3000
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi

backend:
  replicaCount: 2
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: Never
  service:
    name: backend-service
    type: ClusterIP
    port: 8000
  resources:
    requests:
      cpu: 100m
      memory: 128Mi
    limits:
      cpu: 500m
      memory: 512Mi

ingress:
  enabled: false
  className: nginx
  hostname: todo-app.local
  paths:
    frontend: /
    backend: /api
```

### Template Helpers (_helpers.tpl)
- Chart name functions
- Label selectors
- Service names
- Common annotations

## Risk Assessment

### Technical Risks

**Risk 1: Image Availability in Minikube**
- **Impact**: High - Chart won't deploy if images aren't loaded
- **Mitigation**: Clear documentation in quickstart.md, use `minikube image load` commands
- **Likelihood**: Medium

**Risk 2: Health Check Failures**
- **Impact**: Medium - Pods won't reach Ready state
- **Mitigation**: Configure appropriate initialDelaySeconds, test health endpoints before deployment
- **Likelihood**: Low (endpoints already implemented)

**Risk 3: Resource Constraints**
- **Impact**: Medium - Pods may not schedule
- **Mitigation**: Document minimum cluster requirements, use reasonable default resource requests
- **Likelihood**: Low

**Risk 4: Ingress Controller Not Installed**
- **Impact**: Low - Ingress won't work but app still functions internally
- **Mitigation**: Make Ingress optional (disabled by default), document Ingress controller installation
- **Likelihood**: Medium

### Operational Risks

**Risk 1: Configuration Errors**
- **Impact**: Medium - Deployment may fail or behave incorrectly
- **Mitigation**: Helm lint validation, dry-run testing, comprehensive examples
- **Likelihood**: Medium

**Risk 2: Service Communication Failures**
- **Impact**: High - Frontend can't reach backend
- **Mitigation**: Use Kubernetes DNS names, test service discovery, document troubleshooting
- **Likelihood**: Low

## Success Metrics

- **SM-001**: Chart passes `helm lint` with zero errors/warnings
- **SM-002**: Chart deploys successfully on Minikube in < 2 minutes
- **SM-003**: All pods reach Ready state within 60 seconds
- **SM-004**: Frontend can communicate with backend via service DNS
- **SM-005**: Rolling updates complete with zero downtime
- **SM-006**: Rollback completes in < 30 seconds
- **SM-007**: Documentation enables first-time user to deploy successfully

## Dependencies

### External Dependencies
- Helm 3.x installed
- kubectl installed and configured
- Kubernetes cluster (Minikube or cloud)
- Docker images: todo-frontend:latest, todo-backend:latest
- Ingress controller (optional, for Ingress feature)

### Internal Dependencies
- Feature 001-docker-containerization (provides Docker images)
- Health endpoints at `/health` (implemented in Docker containerization)

## Next Steps

1. **Phase 0**: Generate `research.md` with Helm/Kubernetes best practices
2. **Phase 1**: Generate `data-model.md` with chart structure details
3. **Phase 1**: Generate `contracts/` with Kubernetes resource definitions
4. **Phase 1**: Generate `quickstart.md` with detailed deployment commands
5. **Phase 2**: Run `/sp.tasks` to generate task breakdown
6. **Implementation**: Create Helm chart files following the plan
7. **Validation**: Test on Minikube and validate all success criteria
8. **Documentation**: Complete README and troubleshooting guides

---

**Plan Status**: ✅ Complete - Ready for Phase 0 research generation
