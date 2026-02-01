# Feature Specification: Helm Chart for Kubernetes Deployment

**Feature Branch**: `001-helm-chart-deployment`
**Created**: 2026-02-01
**Status**: Draft
**Input**: User description: "Create Helm chart for Kubernetes deployment of Todo application with frontend (Next.js) and backend (FastAPI) services"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Deploy Application to Kubernetes Cluster (Priority: P1) 🎯 MVP

A DevOps engineer needs to deploy the Todo application (frontend and backend) to a Kubernetes cluster using a single Helm command, with both services running and able to communicate with each other.

**Why this priority**: This is the core functionality - without the ability to deploy the application, the Helm chart has no value. This represents the minimum viable product.

**Independent Test**: Can be fully tested by running `helm install todo-app ./todo-chatbot-chart` on a Kubernetes cluster (Minikube or cloud), verifying both pods are running, and confirming the frontend can reach the backend service.

**Acceptance Scenarios**:

1. **Given** a Kubernetes cluster is running and Helm is installed, **When** a DevOps engineer runs `helm install todo-app ./todo-chatbot-chart`, **Then** the chart deploys successfully with both frontend and backend deployments created
2. **Given** the chart is installed, **When** checking pod status with `kubectl get pods`, **Then** 2 frontend pods and 2 backend pods are running and healthy
3. **Given** both services are deployed, **When** the frontend pod attempts to connect to the backend service, **Then** the connection succeeds using the internal service DNS name
4. **Given** the application is deployed, **When** running `helm list`, **Then** the release shows as "deployed" status
5. **Given** the deployment is complete, **When** checking service endpoints with `kubectl get svc`, **Then** both frontend-service and backend-service are created with ClusterIP type

---

### User Story 2 - Update Configuration and Manage Releases (Priority: P2)

A DevOps engineer needs to update application configuration (environment variables, replica counts, resource limits) and perform rolling updates without downtime.

**Why this priority**: After initial deployment, teams need to manage and update configurations. This is essential for production operations but can be done after basic deployment works.

**Independent Test**: Can be tested by modifying values.yaml (e.g., changing replica count from 2 to 3), running `helm upgrade todo-app ./todo-chatbot-chart`, and verifying the change is applied with zero downtime.

**Acceptance Scenarios**:

1. **Given** the application is deployed, **When** a DevOps engineer modifies values.yaml and runs `helm upgrade`, **Then** the configuration changes are applied with a rolling update
2. **Given** an upgrade is in progress, **When** monitoring pod status, **Then** old pods are terminated only after new pods are healthy
3. **Given** an upgrade fails, **When** running `helm rollback todo-app`, **Then** the application reverts to the previous working version
4. **Given** configuration needs to change, **When** updating the ConfigMap values in values.yaml, **Then** the new environment variables are available to the pods after upgrade
5. **Given** resource requirements change, **When** updating CPU/memory limits in values.yaml, **Then** pods are recreated with new resource allocations

---

### User Story 3 - Expose Application via Ingress (Priority: P3)

A DevOps engineer needs to expose the application to external traffic using an Ingress controller, routing requests to the appropriate service based on path.

**Why this priority**: While important for production access, the application can function internally without Ingress. This is an enhancement that can be added after core deployment works.

**Independent Test**: Can be tested by enabling Ingress in values.yaml, running `helm upgrade`, and verifying external requests to the Ingress hostname are routed correctly to frontend (/) and backend (/api).

**Acceptance Scenarios**:

1. **Given** an Ingress controller is installed in the cluster, **When** enabling Ingress in values.yaml and upgrading the release, **Then** an Ingress resource is created
2. **Given** the Ingress is configured, **When** accessing the Ingress hostname at path "/", **Then** requests are routed to the frontend service
3. **Given** the Ingress is configured, **When** accessing the Ingress hostname at path "/api", **Then** requests are routed to the backend service
4. **Given** the Ingress is deployed, **When** checking Ingress status with `kubectl get ingress`, **Then** the Ingress shows the configured hostname and paths
5. **Given** external traffic is routed through Ingress, **When** the application receives requests, **Then** both frontend and backend respond correctly

---

### Edge Cases

- What happens when the Kubernetes cluster has insufficient resources to schedule all pods?
- How does the system handle when one service (frontend or backend) fails health checks?
- What happens when ConfigMap values are invalid or missing required environment variables?
- How does the chart behave when deployed to a cluster without an Ingress controller but Ingress is enabled?
- What happens when attempting to deploy with imagePullPolicy "Never" on a cluster that doesn't have the images locally?
- How does the system handle when service names conflict with existing services in the namespace?
- What happens during a rolling update if new pods fail to start?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Chart MUST create a Deployment resource for the frontend service with configurable replica count
- **FR-002**: Chart MUST create a Deployment resource for the backend service with configurable replica count
- **FR-003**: Chart MUST create a Service resource for the frontend with ClusterIP type exposing port 3000
- **FR-004**: Chart MUST create a Service resource for the backend with ClusterIP type exposing port 8000
- **FR-005**: Chart MUST create a ConfigMap containing environment variables for both services
- **FR-006**: Chart MUST configure frontend pods with environment variable NEXT_PUBLIC_API_URL pointing to backend service
- **FR-007**: Chart MUST configure backend pods with environment variable CORS_ORIGINS allowing frontend service
- **FR-008**: Chart MUST support configurable resource requests and limits for both services
- **FR-009**: Chart MUST use imagePullPolicy "Never" by default for local Minikube deployments
- **FR-010**: Chart MUST include proper labels and selectors for all resources
- **FR-011**: Chart MUST support optional Ingress resource creation via values.yaml flag
- **FR-012**: Chart MUST pass `helm lint` validation without errors
- **FR-013**: Chart MUST support `helm install --dry-run` for validation before deployment
- **FR-014**: Chart MUST include health check probes for both frontend and backend deployments
- **FR-015**: Chart MUST support rolling updates with zero downtime
- **FR-016**: Chart MUST include a README.md with installation and configuration instructions
- **FR-017**: Chart MUST use semantic versioning in Chart.yaml
- **FR-018**: Chart MUST allow customization of service names via values.yaml
- **FR-019**: Chart MUST support namespace deployment via Helm release namespace
- **FR-020**: Chart MUST include proper metadata in Chart.yaml (name, version, description, appVersion)

### Key Entities

- **Helm Chart**: Package containing all Kubernetes resource templates and configuration values for deploying the Todo application
- **Frontend Deployment**: Kubernetes Deployment managing Next.js application pods with configurable replicas and resources
- **Backend Deployment**: Kubernetes Deployment managing FastAPI application pods with configurable replicas and resources
- **Frontend Service**: Kubernetes Service providing stable network endpoint for frontend pods (ClusterIP on port 3000)
- **Backend Service**: Kubernetes Service providing stable network endpoint for backend pods (ClusterIP on port 8000)
- **ConfigMap**: Kubernetes ConfigMap storing environment variables for application configuration
- **Ingress**: Optional Kubernetes Ingress resource for external traffic routing to frontend and backend services
- **Values**: Configuration file (values.yaml) containing all customizable parameters for the chart

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: DevOps engineer can deploy the complete application stack with a single `helm install` command in under 2 minutes
- **SC-002**: Chart passes `helm lint` validation with zero errors and zero warnings
- **SC-003**: Chart successfully performs `helm install --dry-run` without errors
- **SC-004**: Both frontend and backend services achieve "Running" status within 60 seconds of deployment
- **SC-005**: Frontend pods can successfully communicate with backend pods using service DNS names
- **SC-006**: Rolling updates complete without any downtime (zero failed requests during update)
- **SC-007**: Chart can be deployed to any Kubernetes cluster version 1.24 or higher
- **SC-008**: Configuration changes via values.yaml take effect within 30 seconds of running `helm upgrade`
- **SC-009**: Chart supports rollback to previous version in under 30 seconds
- **SC-010**: All pods pass health check probes and reach "Ready" state before receiving traffic

## Scope *(mandatory)*

### In Scope

- Helm chart structure with Chart.yaml, values.yaml, and templates directory
- Kubernetes Deployment templates for frontend and backend
- Kubernetes Service templates for frontend and backend
- ConfigMap template for environment variables
- Optional Ingress template for external access
- Resource requests and limits configuration
- Health check probe configuration (readiness and liveness)
- Rolling update strategy configuration
- README.md with installation and usage instructions
- Support for Minikube local deployment with imagePullPolicy "Never"
- Helm lint validation
- Helm dry-run support

### Out of Scope

- Persistent storage configuration (StatefulSets, PersistentVolumeClaims)
- Database deployment (assumes external database like Neon PostgreSQL)
- Secrets management (assumes secrets are managed separately via Kubernetes Secrets or external tools)
- Horizontal Pod Autoscaler (HPA) configuration
- Network policies for pod-to-pod communication restrictions
- Service mesh integration (Istio, Linkerd)
- Monitoring and observability setup (Prometheus, Grafana)
- Logging aggregation configuration
- Certificate management (cert-manager integration)
- Multi-cluster deployment
- GitOps integration (ArgoCD, Flux)
- Helm chart repository hosting
- CI/CD pipeline integration
- Production-grade security hardening (Pod Security Policies, Security Contexts beyond basics)

## Assumptions *(mandatory)*

1. **Kubernetes Cluster**: A Kubernetes cluster (Minikube, kind, or cloud provider) is already running and accessible via kubectl
2. **Helm Installation**: Helm 3.x is installed and configured on the deployment machine
3. **Docker Images**: Docker images `todo-frontend:latest` and `todo-backend:latest` are already built and available (locally for Minikube or in a registry)
4. **Image Availability**: For Minikube deployments, images are loaded into Minikube's Docker daemon using `minikube image load`
5. **External Database**: The backend connects to an external database (Neon PostgreSQL) - database deployment is not part of this chart
6. **Ingress Controller**: If Ingress is enabled, an Ingress controller (e.g., nginx-ingress) is already installed in the cluster
7. **Namespace**: Chart will be deployed to the default namespace unless specified otherwise via `helm install --namespace`
8. **Resource Availability**: The Kubernetes cluster has sufficient resources to run 4 pods (2 frontend + 2 backend) with specified resource requests
9. **Network Connectivity**: Pods can communicate with each other via Kubernetes service DNS
10. **Health Endpoints**: Both frontend and backend expose `/health` endpoints for health check probes
11. **Environment Variables**: Required environment variables (DATABASE_URL, BETTER_AUTH_SECRET) are provided via values.yaml or external secrets
12. **Kubernetes Version**: Target Kubernetes version is 1.24 or higher (for current API versions)

## Dependencies *(mandatory)*

### External Dependencies

- **Kubernetes Cluster**: Requires a running Kubernetes cluster (Minikube, kind, GKE, EKS, AKS, etc.)
- **Helm**: Requires Helm 3.x for chart installation and management
- **Docker Images**: Depends on pre-built Docker images from feature 001-docker-containerization
- **Ingress Controller**: Optional dependency if Ingress feature is enabled (e.g., nginx-ingress-controller)
- **External Database**: Backend service depends on external Neon PostgreSQL database

### Internal Dependencies

- **Feature 001-docker-containerization**: This feature depends on Docker images created in the Docker containerization feature
- **Health Endpoints**: Depends on `/health` endpoints implemented in both frontend and backend applications

## Non-Functional Requirements *(optional)*

### Performance

- Chart installation should complete within 2 minutes on a standard Kubernetes cluster
- Rolling updates should complete within 1 minute for typical configuration changes
- Health check probes should respond within 1 second to avoid unnecessary pod restarts

### Reliability

- Chart must support rollback to previous versions without data loss
- Deployments must use rolling update strategy to ensure zero downtime
- Health checks must prevent traffic routing to unhealthy pods

### Usability

- Chart must include clear README.md with examples
- values.yaml must include comments explaining each configuration option
- Error messages from failed deployments must be clear and actionable

### Maintainability

- Chart templates must follow Kubernetes and Helm best practices
- Resource names must be consistent and predictable
- Chart must be version-controlled and follow semantic versioning

## Security Considerations *(optional)*

- Pods should run as non-root users (already configured in Docker images)
- Sensitive environment variables (DATABASE_URL, BETTER_AUTH_SECRET) should be managed via Kubernetes Secrets (not included in this chart, assumed to be managed externally)
- Service-to-service communication uses internal ClusterIP services (not exposed externally by default)
- Ingress should support TLS termination (configuration provided but certificate management is out of scope)
- Resource limits prevent resource exhaustion attacks

## Open Questions *(optional)*

None - all requirements are clear from the provided specification.
