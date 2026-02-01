# Research: Helm Chart for Kubernetes Deployment

**Feature**: 001-helm-chart-deployment
**Date**: 2026-02-01
**Purpose**: Document research findings, best practices, and technical decisions for Helm chart implementation

## Research Topics

### 1. Helm Chart Structure

**Standard Directory Layout**:
```
chart-name/
├── Chart.yaml          # Chart metadata (required)
├── values.yaml         # Default configuration values (required)
├── charts/             # Chart dependencies (optional)
├── templates/          # Kubernetes resource templates (required)
│   ├── NOTES.txt       # Post-install notes (optional but recommended)
│   ├── _helpers.tpl    # Template helpers (optional but recommended)
│   └── *.yaml          # Resource templates
├── .helmignore         # Files to exclude from packaging (optional)
└── README.md           # Chart documentation (optional but recommended)
```

**Chart.yaml Format** (API version v2 for Helm 3):
```yaml
apiVersion: v2
name: chart-name
description: A Helm chart for Kubernetes
type: application
version: 1.0.0        # Chart version (SemVer)
appVersion: "1.0"     # Application version
```

**Best Practices**:
- Use semantic versioning for chart version
- Keep appVersion in sync with application version
- Include keywords for discoverability
- Add maintainers information for production charts

**Decision**: Use Helm 3 API version v2, follow standard directory layout, include all recommended optional files.

---

### 2. Kubernetes Resource Templates

**Deployment Best Practices**:
- Use `apps/v1` API version (stable since Kubernetes 1.9)
- Include proper labels and selectors
- Configure rolling update strategy for zero downtime
- Set resource requests and limits
- Configure health probes (readiness and liveness)
- Use non-root security context (already in Docker images)

**Service Best Practices**:
- Use ClusterIP for internal services
- Match service selector with deployment labels
- Use consistent naming conventions
- Document port mappings

**ConfigMap Best Practices**:
- Use for non-sensitive configuration only
- Mount as environment variables or volumes
- Keep ConfigMaps small and focused
- Version ConfigMaps if needed for rollback

**Ingress Best Practices**:
- Make Ingress optional (not all clusters have controllers)
- Use path-based routing for multiple services
- Support TLS configuration
- Use appropriate Ingress class

**Decision**: Follow all best practices, use stable API versions, make Ingress optional with feature flag.

---

### 3. Health Check Configuration

**Readiness Probes**:
- Purpose: Determine when pod is ready to receive traffic
- For Next.js: HTTP GET to `/health` on port 3000
- For FastAPI: HTTP GET to `/health` on port 8000
- Configuration:
  - initialDelaySeconds: 10 (allow app startup time)
  - periodSeconds: 10 (check every 10 seconds)
  - timeoutSeconds: 5 (wait up to 5 seconds for response)
  - successThreshold: 1 (one success = ready)
  - failureThreshold: 3 (three failures = not ready)

**Liveness Probes**:
- Purpose: Determine when to restart pod
- Same endpoints as readiness probes
- Configuration:
  - initialDelaySeconds: 30 (allow more time for initial startup)
  - periodSeconds: 30 (check less frequently)
  - timeoutSeconds: 5
  - successThreshold: 1
  - failureThreshold: 3 (three failures = restart pod)

**Decision**: Implement both readiness and liveness probes with conservative timing to avoid false positives during startup.

---

### 4. Rolling Update Strategy

**Zero-Downtime Deployment Configuration**:
```yaml
strategy:
  type: RollingUpdate
  rollingUpdate:
    maxSurge: 1           # Allow 1 extra pod during update
    maxUnavailable: 0     # Never allow all pods to be unavailable
```

**How it works**:
1. Create 1 new pod with updated configuration
2. Wait for new pod to pass readiness probe
3. Terminate 1 old pod
4. Repeat until all pods updated

**Benefits**:
- Zero downtime (always at least 2 pods available)
- Gradual rollout reduces risk
- Automatic rollback if new pods fail health checks

**Decision**: Use RollingUpdate strategy with maxSurge=1 and maxUnavailable=0 for zero downtime.

---

### 5. Resource Management

**CPU and Memory Requests/Limits**:

**Frontend (Next.js)**:
- Requests: cpu: 100m, memory: 128Mi (minimum guaranteed)
- Limits: cpu: 500m, memory: 512Mi (maximum allowed)
- Rationale: Next.js SSR can be CPU-intensive, needs reasonable memory for Node.js runtime

**Backend (FastAPI)**:
- Requests: cpu: 100m, memory: 128Mi (minimum guaranteed)
- Limits: cpu: 500m, memory: 512Mi (maximum allowed)
- Rationale: Python FastAPI is lightweight, but needs headroom for request processing

**Best Practices**:
- Always set requests (used for scheduling)
- Set limits to prevent resource exhaustion
- Requests should be realistic minimum
- Limits should allow for traffic spikes
- Monitor actual usage and adjust

**Decision**: Use specified resource values, make them configurable via values.yaml for different environments.

---

### 6. Minikube Image Loading

**Problem**: Minikube runs in a VM/container with its own Docker daemon, separate from host Docker daemon.

**Solution**: Load images into Minikube's Docker daemon:
```bash
# Method 1: Load from host Docker (recommended)
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Method 2: Build directly in Minikube
eval $(minikube docker-env)
docker build -t todo-frontend:latest frontend/
docker build -t todo-backend:latest backend/
```

**Image Pull Policy**:
- Use `imagePullPolicy: Never` for local images
- Prevents Kubernetes from trying to pull from registry
- Fails fast if image not available locally

**Verification**:
```bash
# List images in Minikube
minikube image ls | grep todo
```

**Decision**: Use `imagePullPolicy: Never` by default, document image loading in quickstart guide, make pull policy configurable.

---

### 7. Service Discovery

**Kubernetes DNS**:
- Every Service gets a DNS name: `<service-name>.<namespace>.svc.cluster.local`
- Within same namespace, can use short name: `<service-name>`
- DNS resolution is automatic for all pods

**For This Application**:
- Frontend connects to backend: `http://backend-service:8000`
- Backend allows CORS from frontend: `http://frontend-service:3000`
- No need for IP addresses or external DNS

**Environment Variables**:
- Frontend: `NEXT_PUBLIC_API_URL=http://backend-service:8000`
- Backend: `CORS_ORIGINS=http://frontend-service:3000`

**Decision**: Use Kubernetes service DNS names for inter-service communication, configure via ConfigMap.

---

### 8. Ingress Configuration

**Path-Based Routing**:
```yaml
rules:
  - host: todo-app.local
    http:
      paths:
        - path: /
          pathType: Prefix
          backend:
            service:
              name: frontend-service
              port:
                number: 3000
        - path: /api
          pathType: Prefix
          backend:
            service:
              name: backend-service
              port:
                number: 8000
```

**Ingress Controllers**:
- nginx-ingress: Most common, good for path-based routing
- traefik: Modern, automatic TLS with Let's Encrypt
- AWS ALB: For EKS clusters
- GCE: For GKE clusters

**Best Practices**:
- Make Ingress optional (disabled by default)
- Support multiple Ingress controllers via className
- Document Ingress controller installation
- Provide example for local testing (minikube addons enable ingress)

**Decision**: Make Ingress optional with feature flag, default to disabled, support nginx Ingress controller.

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Helm API Version | v2 | Standard for Helm 3, supports all features |
| Chart Name | todo-chatbot | Matches user specification |
| Image Pull Policy | Never (default) | Supports Minikube local development |
| Service Type | ClusterIP | Internal communication, Ingress for external |
| Health Endpoints | /health | Already implemented in Docker images |
| Readiness Probe | 10s initial, 10s period | Conservative timing for reliable startup |
| Liveness Probe | 30s initial, 30s period | Avoid false positives during startup |
| Rolling Update | maxSurge=1, maxUnavailable=0 | Zero downtime guarantee |
| Resource Requests | 100m CPU, 128Mi memory | Minimum for scheduling |
| Resource Limits | 500m CPU, 512Mi memory | Allow for traffic spikes |
| Service Discovery | Kubernetes DNS | Standard, automatic, reliable |
| ConfigMap vs Secrets | ConfigMap only | Secrets managed externally |
| Ingress | Optional (disabled) | Not all clusters have controllers |

---

## Alternatives Considered

### Alternative 1: NodePort Services
**Rejected**: NodePort exposes services on all nodes, less secure than Ingress, harder to manage multiple services.

### Alternative 2: LoadBalancer Services
**Rejected**: Requires cloud provider, expensive (one LB per service), Ingress provides better routing.

### Alternative 3: StatefulSet for Deployments
**Rejected**: Application is stateless, Deployment is simpler and more appropriate.

### Alternative 4: Include Secrets in Chart
**Rejected**: Security risk, secrets should be managed separately (Kubernetes Secrets, external secret managers).

### Alternative 5: Single Deployment for Both Services
**Rejected**: Violates separation of concerns, makes scaling and updates harder.

---

## Implementation Recommendations

1. **Start Simple**: Implement core Deployment and Service resources first
2. **Test Incrementally**: Validate each resource before adding next
3. **Use Helm Lint**: Catch template errors early
4. **Dry-Run First**: Always test with `--dry-run` before actual deployment
5. **Document Everything**: Clear README and NOTES.txt for users
6. **Make Configurable**: Use values.yaml for all environment-specific settings
7. **Follow Conventions**: Use standard Helm template functions and naming

---

## References

- Helm Documentation: https://helm.sh/docs/
- Kubernetes API Reference: https://kubernetes.io/docs/reference/
- Helm Best Practices: https://helm.sh/docs/chart_best_practices/
- Kubernetes Patterns: https://kubernetes.io/docs/concepts/
- Next.js Deployment: https://nextjs.org/docs/deployment
- FastAPI Deployment: https://fastapi.tiangolo.com/deployment/

---

**Research Status**: ✅ Complete - All technical decisions documented and justified
