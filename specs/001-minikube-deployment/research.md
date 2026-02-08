# Research: Minikube Deployment Best Practices

**Feature**: 001-minikube-deployment
**Date**: 2026-02-02
**Purpose**: Document research findings and best practices for deploying applications to Minikube

## Research Topics

### 1. Minikube Resource Requirements

**Findings**:
- Minikube runs Kubernetes in a VM or container, requiring resources for both the cluster and workloads
- Kubernetes system components (kube-apiserver, etcd, coredns, etc.) typically consume 1-2 CPUs and 1-2GB RAM
- Each application pod requires resources based on its requests/limits
- Recommended minimum: 2 CPUs and 2GB RAM for basic cluster
- For production-like testing: 4+ CPUs and 8+ GB RAM

**For This Application**:
- 4 pods × (100m CPU request + 128Mi memory request) = 400m CPU + 512Mi memory (minimum)
- 4 pods × (500m CPU limit + 512Mi memory limit) = 2000m CPU + 2048Mi memory (maximum)
- Kubernetes system: ~1 CPU + 1GB RAM
- **Total recommended**: 4 CPUs + 8GB RAM (provides headroom for spikes)

**Decision**: Use `minikube start --cpus=4 --memory=8192` for reliable deployment

---

### 2. Image Loading Methods

**Method 1: minikube image load** (Recommended)
```bash
minikube image load <image-name>:<tag>
```
- **Pros**: Simple, reliable, works with imagePullPolicy: Never
- **Cons**: Requires image to exist in host Docker daemon first
- **Use case**: Pre-built images that need to be transferred to Minikube

**Method 2: Build in Minikube**
```bash
eval $(minikube docker-env)
docker build -t <image-name>:<tag> .
```
- **Pros**: No image transfer needed, faster for iterative development
- **Cons**: Requires Dockerfile and source code, rebuilds from scratch
- **Use case**: Active development with frequent image changes

**Method 3: Docker Registry**
```bash
# Push to registry, pull from Minikube
docker push <registry>/<image-name>:<tag>
# Set imagePullPolicy: Always or IfNotPresent
```
- **Pros**: Works like production, supports image versioning
- **Cons**: Requires registry setup, slower, unnecessary for local testing
- **Use case**: Testing registry integration, multi-developer environments

**Decision**: Use Method 1 (minikube image load) for simplicity and reliability with existing images

---

### 3. Helm Deployment Patterns

**Standard Deployment Workflow**:
1. Validate chart: `helm lint <chart-path>`
2. Dry-run: `helm install --dry-run --debug <release> <chart-path>`
3. Install: `helm install <release> <chart-path> --namespace <ns>`
4. Verify: `helm list -n <ns>` and `kubectl get all -n <ns>`
5. Upgrade: `helm upgrade <release> <chart-path> --namespace <ns>`
6. Rollback: `helm rollback <release> <revision> --namespace <ns>`

**Best Practices**:
- Always use `--namespace` flag to avoid default namespace clutter
- Use `helm upgrade --install` for idempotent deployments
- Set `--wait` flag to wait for resources to be ready
- Use `--timeout` to prevent indefinite hangs
- Check `helm status <release>` for deployment information

**Decision**: Use standard workflow with explicit namespace, add --wait for reliability

---

### 4. Health Check Validation

**Kubernetes Health Probes**:
- **Readiness Probe**: Determines when pod is ready to receive traffic
- **Liveness Probe**: Determines when to restart pod

**Validation Methods**:
1. **kubectl get pods**: Check STATUS and READY columns
2. **kubectl describe pod**: View probe results and events
3. **kubectl logs**: Check application logs for errors
4. **Direct curl**: Test health endpoint from within cluster

**Best Practices**:
- Set appropriate `initialDelaySeconds` (allow app startup time)
- Use `periodSeconds` for regular checks (10-30 seconds typical)
- Set `failureThreshold` to avoid false positives (3 failures typical)
- Test health endpoints before deploying

**Decision**: Verify health probes are configured in Helm chart, use kubectl wait for automated verification

---

### 5. Troubleshooting Strategies

**Common Issues and Solutions**:

**Issue 1: ImagePullBackOff**
- **Cause**: Image not available in Minikube
- **Solution**: Verify with `minikube image ls`, reload with `minikube image load`

**Issue 2: CrashLoopBackOff**
- **Cause**: Application crashes on startup
- **Solution**: Check logs with `kubectl logs`, verify health endpoints, check resource limits

**Issue 3: Pods Pending**
- **Cause**: Insufficient cluster resources
- **Solution**: Check with `kubectl describe pod`, increase Minikube resources, reduce pod resource requests

**Issue 4: Service Not Accessible**
- **Cause**: Service selector mismatch, wrong port, network policy
- **Solution**: Verify selector matches pod labels, check service endpoints, test with curl from another pod

**Issue 5: Health Checks Failing**
- **Cause**: Health endpoint not responding, slow startup
- **Solution**: Increase initialDelaySeconds, verify endpoint exists, check application logs

**Decision**: Document all common issues with exact troubleshooting commands

---

### 6. Port-Forward vs Minikube Service

**kubectl port-forward**:
```bash
kubectl port-forward service/<service-name> <local-port>:<service-port>
```
- **Pros**: Works on all platforms, simple, no additional configuration
- **Cons**: Runs in foreground, connection can drop, one service at a time
- **Use case**: Quick testing, debugging, development

**minikube service**:
```bash
minikube service <service-name> --url
```
- **Pros**: Returns accessible URL, works with NodePort services
- **Cons**: Less reliable on Windows, requires NodePort or LoadBalancer service type
- **Use case**: Accessing services from browser, sharing with team

**minikube tunnel** (for LoadBalancer):
```bash
minikube tunnel
```
- **Pros**: Enables LoadBalancer services, production-like
- **Cons**: Requires sudo/admin, runs in foreground, only for LoadBalancer type
- **Use case**: Testing LoadBalancer behavior

**Decision**: Use kubectl port-forward for simplicity and cross-platform compatibility

---

### 7. Namespace Management

**Benefits of Dedicated Namespace**:
- Isolation: Resources don't interfere with other deployments
- Organization: Easy to see all related resources
- Cleanup: Single command to delete everything (`kubectl delete namespace <ns>`)
- RBAC: Can apply permissions at namespace level
- Resource Quotas: Can limit resources per namespace

**Best Practices**:
- Use descriptive names (e.g., todo-app, not app1)
- Create namespace before deploying resources
- Use `--namespace` flag consistently in all commands
- Set default namespace for convenience: `kubectl config set-context --current --namespace=<ns>`
- Document namespace in deployment instructions

**Decision**: Use dedicated 'todo-app' namespace for isolation and easy management

---

## Key Decisions Summary

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Minikube Resources | 4 CPUs, 8GB RAM | Sufficient for 4 pods + Kubernetes system |
| Image Loading | minikube image load | Simple, reliable, works with existing images |
| Namespace | Dedicated 'todo-app' | Isolation, easy cleanup, best practice |
| Access Method | kubectl port-forward | Cross-platform, simple, no extra config |
| Verification | Sequential checks | Logical progression, easier troubleshooting |
| Helm Workflow | Standard with --namespace | Explicit, avoids default namespace clutter |
| Health Validation | kubectl wait + manual checks | Automated + manual verification |

---

## Implementation Recommendations

1. **Pre-flight Checks**: Always verify prerequisites before starting deployment
2. **Incremental Verification**: Check each step before proceeding to next
3. **Document Everything**: Capture commands, outputs, and any issues encountered
4. **Use Scripts**: Create reusable deployment and verification scripts
5. **Test Cleanup**: Verify cleanup process works before considering deployment complete
6. **Error Handling**: Plan for failures at each step with clear recovery procedures

---

## References

- Minikube Documentation: https://minikube.sigs.k8s.io/docs/
- Kubernetes Best Practices: https://kubernetes.io/docs/concepts/configuration/overview/
- Helm Documentation: https://helm.sh/docs/
- kubectl Cheat Sheet: https://kubernetes.io/docs/reference/kubectl/cheatsheet/

---

**Research Status**: ✅ Complete - All technical decisions documented and justified
