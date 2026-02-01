---
id: PHR-0002
title: Helm Chart Implementation Plan with Deployment Guide
stage: plan
date: 2026-02-01
surface: agent
model: claude-sonnet-4-5
feature: 001-helm-chart-deployment
branch: 001-helm-chart-deployment
user: MuhammadTayyab
command: /sp.plan
labels: ["helm", "kubernetes", "deployment", "planning", "minikube", "k8s", "devops"]
links:
  spec: specs/001-helm-chart-deployment/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/001-helm-chart-deployment/plan.md
  - specs/001-helm-chart-deployment/research.md
  - specs/001-helm-chart-deployment/data-model.md
  - specs/001-helm-chart-deployment/quickstart.md
  - specs/001-helm-chart-deployment/contracts/frontend-deployment.yaml
  - specs/001-helm-chart-deployment/contracts/frontend-service.yaml
  - specs/001-helm-chart-deployment/contracts/backend-deployment.yaml
  - specs/001-helm-chart-deployment/contracts/backend-service.yaml
  - specs/001-helm-chart-deployment/contracts/configmap.yaml
  - specs/001-helm-chart-deployment/contracts/ingress.yaml
  - CLAUDE.md
tests:
  - none (planning phase - no tests yet)
---

## Prompt

Create a detailed step-by-step deployment plan including:
1. Minikube setup commands
2. Image loading commands
3. Namespace creation
4. Helm installation commands
5. Verification commands
6. Access commands

Provide exact commands I should run in sequence.

## Response snapshot

Created comprehensive implementation plan for Helm chart deployment with complete Phase 0 (research) and Phase 1 (design) artifacts. Generated plan.md with technical context, constitution check, implementation strategy, and risk assessment. Created research.md documenting 8 key technical decisions (Helm structure, K8s resources, health checks, rolling updates, resource management, Minikube image loading, service discovery, Ingress). Generated data-model.md defining chart structure and all Kubernetes resources. Created 6 Kubernetes resource contracts (frontend/backend deployments, services, ConfigMap, Ingress). Produced comprehensive quickstart.md with exact step-by-step deployment commands covering Minikube setup, image loading, namespace creation, Helm installation, verification, access, updates, and troubleshooting. Updated agent context with Helm/Kubernetes technologies.

## Outcome

- ✅ Impact: Complete, production-ready implementation plan for Helm chart deployment. Plan includes detailed technical context (Helm 3.x, Kubernetes 1.24+, Minikube), 5 key architectural decisions documented with rationale, comprehensive risk assessment (6 risks identified with mitigation strategies), and clear implementation strategy across 4 phases. Research document covers 8 technical topics with best practices and alternatives considered. Data model defines complete chart structure with all Kubernetes resources and their relationships. Contracts provide ready-to-use Kubernetes resource templates with Helm templating. Quickstart guide provides exact commands for complete deployment workflow from Minikube start to application access, including 5 troubleshooting scenarios and quick reference commands.

- 🧪 Tests: No tests at planning phase. Plan defines validation strategy: helm lint, helm install --dry-run, Minikube deployment testing, health check verification, service communication testing, rolling update testing, rollback testing.

- 📁 Files: Created 11 files:
  - plan.md (implementation plan with strategy and risks)
  - research.md (technical decisions and best practices)
  - data-model.md (chart structure and K8s resources)
  - quickstart.md (step-by-step deployment guide)
  - contracts/frontend-deployment.yaml (Helm template)
  - contracts/frontend-service.yaml (Helm template)
  - contracts/backend-deployment.yaml (Helm template)
  - contracts/backend-service.yaml (Helm template)
  - contracts/configmap.yaml (Helm template)
  - contracts/ingress.yaml (Helm template)
  - Updated CLAUDE.md (agent context)

- 🔁 Next prompts:
  1. "Run /sp.tasks to generate task breakdown for implementation"
  2. "Implement the Helm chart following the plan"
  3. "Test deployment on Minikube using quickstart guide"
  4. "Commit planning artifacts"

- 🧠 Reflection: User requested specific focus on exact deployment commands, which shaped the quickstart guide to be exceptionally detailed with step-by-step instructions. The planning phase successfully addressed the infrastructure nature of this feature - it's not modifying application code but creating deployment tooling. Constitution check appropriately marked most items as N/A since this is DevOps work, not application development. Key insight: For infrastructure features, the "data model" is the configuration structure (values.yaml) and resource relationships, not database entities. The quickstart guide became the most valuable artifact, providing a complete runbook that eliminates ambiguity for implementation.

## Evaluation notes (flywheel)

- Failure modes observed: PowerShell script for setup-plan.ps1 worked correctly. Agent context update script successfully added Helm/Kubernetes technologies to CLAUDE.md. No failures observed during planning phase execution.

- Graders run and results (PASS/FAIL): No automated graders run. Manual validation: (1) All Phase 0 research topics covered - PASS, (2) All Phase 1 artifacts generated - PASS, (3) Contracts follow Kubernetes API standards - PASS, (4) Quickstart guide provides complete deployment workflow - PASS, (5) Plan addresses all spec requirements - PASS.

- Prompt variant (if applicable): Standard /sp.plan workflow with user-provided emphasis on exact deployment commands. This influenced the quickstart guide to be more detailed than typical, with explicit command sequences and expected outputs.

- Next experiment (smallest change to try): Consider adding a "validation checklist" section to quickstart.md that users can check off as they complete each step. This would make it easier to track progress through the deployment process and identify where issues occur. Could also add timing estimates for each step (e.g., "This step takes 1-2 minutes") to set user expectations.

## Planning Phase Details

### Phase 0: Research & Best Practices

**Research Topics Covered** (8 total):
1. Helm Chart Structure - Standard directory layout, Chart.yaml format, values.yaml patterns
2. Kubernetes Resource Templates - Deployment, Service, ConfigMap, Ingress best practices
3. Health Check Configuration - Readiness and liveness probes for Next.js and FastAPI
4. Rolling Update Strategy - Zero-downtime deployment configuration
5. Resource Management - CPU/memory requests and limits for Node.js and Python
6. Minikube Image Loading - Best practices for using local Docker images
7. Service Discovery - Kubernetes DNS for inter-service communication
8. Ingress Configuration - Path-based routing for frontend and backend

**Key Decisions Documented**:
- Decision 1: Chart Name - `todo-chatbot` (matches user specification)
- Decision 2: Image Pull Policy - `Never` (default for Minikube)
- Decision 3: Service Type - ClusterIP (internal communication)
- Decision 4: Health Check Endpoints - `/health` (already implemented)
- Decision 5: ConfigMap vs Secrets - ConfigMap only (secrets managed externally)

**Alternatives Considered**:
- NodePort Services (rejected - less secure than Ingress)
- LoadBalancer Services (rejected - expensive, Ingress better)
- StatefulSet (rejected - application is stateless)
- Include Secrets in Chart (rejected - security risk)
- Single Deployment (rejected - violates separation of concerns)

### Phase 1: Design Artifacts

**Data Model** (data-model.md):
- Chart metadata structure (Chart.yaml)
- Configuration values structure (values.yaml)
- Kubernetes resources (Deployments, Services, ConfigMap, Ingress)
- Resource relationships diagram
- Template helpers (_helpers.tpl)
- Validation rules
- Configuration examples (development vs production)

**Contracts** (contracts/ directory):
- frontend-deployment.yaml - Deployment with 2 replicas, health checks, rolling update strategy
- frontend-service.yaml - ClusterIP service on port 3000
- backend-deployment.yaml - Deployment with 2 replicas, health checks, rolling update strategy
- backend-service.yaml - ClusterIP service on port 8000
- configmap.yaml - Environment variables for both services
- ingress.yaml - Optional path-based routing (/ → frontend, /api → backend)

**Quickstart Guide** (quickstart.md):
- Complete 8-step deployment workflow
- Step 1: Minikube setup (start, verify, enable Ingress)
- Step 2: Load Docker images (verify, load, confirm)
- Step 3: Create namespace (optional)
- Step 4: Install Helm chart (lint, dry-run, install)
- Step 5: Verification commands (Helm status, pods, services, ConfigMap, deployments, health)
- Step 6: Access application (port-forward, Minikube service, Ingress)
- Step 7: Update and manage (upgrade, rollback, scale)
- Step 8: Cleanup (uninstall, delete namespace, stop Minikube)
- Troubleshooting section (5 common issues with solutions)
- Quick reference commands
- Next steps and resources

### Implementation Strategy

**Phase 1: Chart Structure Setup**
1. Create todo-chatbot-chart/ directory
2. Create Chart.yaml with metadata
3. Create values.yaml with default configuration
4. Create templates/ directory
5. Create .helmignore file
6. Create README.md

**Phase 2: Kubernetes Resource Templates**
1. Create templates/_helpers.tpl
2. Create frontend-deployment.yaml
3. Create frontend-service.yaml
4. Create backend-deployment.yaml
5. Create backend-service.yaml
6. Create configmap.yaml
7. Create ingress.yaml (conditional)
8. Create NOTES.txt

**Phase 3: Validation & Testing**
1. helm lint validation
2. helm install --dry-run testing
3. Minikube deployment testing
4. Pod startup verification
5. Service communication testing
6. Rolling update testing
7. Rollback testing
8. Ingress testing (if enabled)

**Phase 4: Documentation**
1. Complete README.md
2. Document values.yaml options
3. Add usage examples
4. Document troubleshooting

### Risk Assessment

**Technical Risks** (4 identified):
1. Image Availability in Minikube (High impact, Medium likelihood) - Mitigated with clear documentation
2. Health Check Failures (Medium impact, Low likelihood) - Mitigated with conservative timing
3. Resource Constraints (Medium impact, Low likelihood) - Mitigated with documented requirements
4. Ingress Controller Not Installed (Low impact, Medium likelihood) - Mitigated with optional flag

**Operational Risks** (2 identified):
1. Configuration Errors (Medium impact, Medium likelihood) - Mitigated with lint and dry-run
2. Service Communication Failures (High impact, Low likelihood) - Mitigated with DNS and testing

### Success Metrics

- SM-001: Chart passes helm lint with zero errors/warnings
- SM-002: Chart deploys on Minikube in < 2 minutes
- SM-003: All pods reach Ready state within 60 seconds
- SM-004: Frontend can communicate with backend via service DNS
- SM-005: Rolling updates complete with zero downtime
- SM-006: Rollback completes in < 30 seconds
- SM-007: Documentation enables first-time user to deploy successfully

### Constitution Compliance

**Status**: N/A for most items - This is infrastructure/deployment feature

- SDD: ✅ Followed (Constitution → Spec → Plan → Tasks)
- Phase: N/A (Infrastructure, not application feature)
- Stack: N/A (Deploys existing images, doesn't modify stack)
- Security: N/A (No new endpoints)
- Scoping: N/A (No data access changes)
- API: N/A (No API changes)
- Persistence: N/A (No persistence changes)
- Secrets: N/A (ConfigMap for non-sensitive, external secret management assumed)

**Note**: Constitution principles apply to application development, not deployment tooling. The chart deploys the existing application that already complies with all constitution requirements.

### Dependencies

**External**:
- Helm 3.x installed
- kubectl installed and configured
- Kubernetes cluster (Minikube or cloud)
- Docker images: todo-frontend:latest, todo-backend:latest
- Ingress controller (optional)

**Internal**:
- Feature 001-docker-containerization (provides Docker images)
- Health endpoints at /health (implemented in Docker containerization)

### Quickstart Guide Highlights

**Complete Command Sequence**:
1. `minikube start --cpus=4 --memory=8192 --driver=docker`
2. `minikube image load todo-frontend:latest`
3. `minikube image load todo-backend:latest`
4. `kubectl create namespace todo-app` (optional)
5. `helm lint todo-chatbot-chart/`
6. `helm install --dry-run --debug todo-app ./todo-chatbot-chart`
7. `helm install todo-app ./todo-chatbot-chart`
8. `kubectl get pods --watch`
9. `kubectl port-forward service/frontend-service 3000:3000`
10. Access http://localhost:3000

**Verification Commands**:
- `helm list` - Check release status
- `kubectl get pods` - Check pod status
- `kubectl get services` - Check services
- `kubectl logs -l app=todo-frontend` - Check logs
- `kubectl describe pod <pod-name>` - Debug issues

**Troubleshooting Scenarios**:
1. Pods stuck in ImagePullBackOff - Solution: Verify images loaded in Minikube
2. Pods stuck in Pending - Solution: Check cluster resources
3. Health checks failing - Solution: Check pod logs and health endpoints
4. Service communication failure - Solution: Test DNS resolution and connectivity
5. Helm install fails - Solution: Run lint and dry-run for validation

### Key Insights

1. **Infrastructure vs Application**: Successfully adapted planning workflow for infrastructure feature. Constitution check appropriately marked most items as N/A.

2. **User-Focused Documentation**: User's request for "exact commands" shaped quickstart guide to be exceptionally detailed with step-by-step instructions and expected outputs.

3. **Comprehensive Contracts**: Created ready-to-use Kubernetes resource templates with proper Helm templating, reducing implementation effort.

4. **Risk Mitigation**: Identified 6 risks with specific mitigation strategies, focusing on common Minikube/Kubernetes deployment issues.

5. **Validation Strategy**: Defined clear validation approach (lint, dry-run, deployment testing) to ensure chart quality before production use.

6. **Zero Downtime**: Emphasized rolling update strategy with maxSurge=1 and maxUnavailable=0 to guarantee zero downtime during updates.

7. **Troubleshooting First**: Included comprehensive troubleshooting section in quickstart guide to address common issues proactively.
