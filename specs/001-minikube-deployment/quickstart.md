# Quickstart Guide: Deploy Todo App to Minikube

**Feature**: 001-minikube-deployment
**Date**: 2026-02-02
**Purpose**: Quick reference guide with exact commands to deploy and verify the application

## Prerequisites

Before starting, ensure you have:
- Minikube installed
- kubectl installed
- Helm 3.x installed
- Docker Desktop running
- Docker images built: `todo-frontend:latest` and `todo-backend:latest`
- Helm chart exists at `todo-chatbot-chart/`

## Quick Deployment (Copy-Paste)

```bash
# 1. Start Minikube
minikube start --cpus=4 --memory=8192 --driver=docker

# 2. Load Docker images
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# 3. Create namespace
kubectl create namespace todo-app

# 4. Install Helm chart
helm install todo-chatbot ./todo-chatbot-chart --namespace todo-app

# 5. Wait for pods to be ready
kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s

# 6. Verify deployment
kubectl get all -n todo-app

# 7. Access frontend (run in separate terminal)
kubectl port-forward -n todo-app service/frontend-service 3000:3000

# 8. Access backend (run in separate terminal)
kubectl port-forward -n todo-app service/backend-service 8000:8000
```

Then open:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

---

## Detailed Step-by-Step Guide

### Step 1: Verify Prerequisites

```bash
# Check all tools are installed
minikube version
kubectl version --client
helm version
docker --version

# Verify Docker images exist
docker images | grep todo
```

**Expected Output**:
- Minikube version >= 1.30.0
- kubectl version >= 1.24.0
- Helm version >= 3.0.0
- Both todo-frontend:latest and todo-backend:latest images listed

---

### Step 2: Start Minikube Cluster

```bash
# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify cluster is running
minikube status
```

**Expected Output**:
```
minikube
type: Control Plane
host: Running
kubelet: Running
apiserver: Running
kubeconfig: Configured
```

**Duration**: 1-2 minutes

---

### Step 3: Load Docker Images into Minikube

```bash
# Load frontend image
minikube image load todo-frontend:latest

# Load backend image
minikube image load todo-backend:latest

# Verify images are loaded
minikube image ls | grep todo
```

**Expected Output**:
```
docker.io/library/todo-frontend:latest
docker.io/library/todo-backend:latest
```

**Duration**: 2-5 minutes (depends on image sizes)

---

### Step 4: Create Namespace

```bash
# Create dedicated namespace
kubectl create namespace todo-app

# Verify namespace exists
kubectl get namespace todo-app
```

**Expected Output**:
```
NAME       STATUS   AGE
todo-app   Active   5s
```

---

### Step 5: Validate Helm Chart (Optional but Recommended)

```bash
# Lint the chart
helm lint todo-chatbot-chart/

# Dry-run installation
helm install todo-app ./todo-chatbot-chart --namespace todo-app --dry-run --debug | head -50
```

**Expected Output**:
- Lint: "1 chart(s) linted, 0 chart(s) failed"
- Dry-run: All templates render without errors

---

### Step 6: Install Helm Chart

```bash
# Install the chart
helm install todo-chatbot ./todo-chatbot-chart --namespace todo-app

# Verify installation
helm list -n todo-app
```

**Expected Output**:
```
NAME          NAMESPACE  REVISION  UPDATED                                STATUS    CHART              APP VERSION
todo-chatbot  todo-app   1         2026-02-02 20:00:00.000000 +0000 UTC  deployed  todo-chatbot-1.0.0 1.0
```

**Duration**: 10-30 seconds

---

### Step 7: Wait for Pods to be Ready

```bash
# Wait for all pods (with timeout)
kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s

# Check pod status
kubectl get pods -n todo-app
```

**Expected Output**:
```
NAME                                     READY   STATUS    RESTARTS   AGE
todo-chatbot-backend-xxxxxxxxxx-xxxxx    1/1     Running   0          45s
todo-chatbot-backend-xxxxxxxxxx-xxxxx    1/1     Running   0          45s
todo-chatbot-frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          45s
todo-chatbot-frontend-xxxxxxxxxx-xxxxx   1/1     Running   0          45s
```

**Duration**: 30-120 seconds

---

### Step 8: Verify Deployment

```bash
# View all resources
kubectl get all -n todo-app

# Check services
kubectl get services -n todo-app

# Check deployments
kubectl get deployments -n todo-app

# Check ConfigMap
kubectl get configmap -n todo-app
```

**Expected Output**:
- 4 pods (all Running, all 1/1 Ready)
- 2 services (frontend-service:3000, backend-service:8000)
- 2 deployments (both 2/2 Ready)
- 1 ConfigMap (todo-chatbot-config)

---

### Step 9: Test Inter-Service Connectivity

```bash
# Test backend health from temporary pod
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n todo-app -- curl http://backend-service:8000/health
```

**Expected Output**:
```json
{"status":"healthy","timestamp":"2026-02-02T20:00:00Z","service":"todo-backend","version":"1.0.0"}
```

---

### Step 10: Access Application

#### Option A: Port-Forward (Recommended)

```bash
# Forward frontend (run in terminal 1)
kubectl port-forward -n todo-app service/frontend-service 3000:3000

# Forward backend (run in terminal 2)
kubectl port-forward -n todo-app service/backend-service 8000:8000
```

Then open in browser:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

**Note**: Port-forward runs in foreground. Press Ctrl+C to stop.

#### Option B: Minikube Service

```bash
# Get frontend URL
minikube service frontend-service -n todo-app --url

# Get backend URL
minikube service backend-service -n todo-app --url
```

Use the returned URLs to access the application.

---

### Step 11: Test Application Functionality

1. **Access Frontend**: Open http://localhost:3000 (with port-forward active)
2. **Create Todo**: Add a new todo item via the UI
3. **Read Todos**: Verify the todo appears in the list
4. **Update Todo**: Edit the todo item
5. **Delete Todo**: Remove the todo item
6. **Verify Persistence**: Refresh page and check todos remain

---

## Verification Commands

### Quick Health Check

```bash
# Check everything is running
kubectl get pods -n todo-app
kubectl get services -n todo-app
kubectl get deployments -n todo-app

# Check pod logs for errors
kubectl logs -l app=todo-frontend -n todo-app --tail=20
kubectl logs -l app=todo-backend -n todo-app --tail=20

# Check events for issues
kubectl get events -n todo-app --sort-by='.lastTimestamp' | tail -20
```

### Detailed Verification

```bash
# Check pod details
kubectl describe pods -n todo-app

# Check service endpoints
kubectl get endpoints -n todo-app

# Check deployment status
kubectl rollout status deployment/todo-chatbot-frontend -n todo-app
kubectl rollout status deployment/todo-chatbot-backend -n todo-app

# Check Helm release
helm status todo-chatbot -n todo-app
```

---

## Troubleshooting

### Issue: Pods in ImagePullBackOff

**Cause**: Images not loaded into Minikube

**Solution**:
```bash
# Verify images in Minikube
minikube image ls | grep todo

# If missing, load them
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Delete pods to force recreation
kubectl delete pods -l app=todo-frontend -n todo-app
kubectl delete pods -l app=todo-backend -n todo-app
```

---

### Issue: Pods in CrashLoopBackOff

**Cause**: Application crashes on startup

**Solution**:
```bash
# Check pod logs
kubectl logs <pod-name> -n todo-app

# Check pod events
kubectl describe pod <pod-name> -n todo-app

# Common fixes:
# - Verify health endpoints exist in Docker images
# - Check resource limits aren't too restrictive
# - Verify environment variables are correct
```

---

### Issue: Pods Stuck in Pending

**Cause**: Insufficient cluster resources

**Solution**:
```bash
# Check pod status
kubectl describe pod <pod-name> -n todo-app

# Check node resources
kubectl top nodes

# If resources insufficient, restart Minikube with more
minikube delete
minikube start --cpus=4 --memory=8192 --driver=docker
```

---

### Issue: Service Not Accessible

**Cause**: Service selector mismatch or wrong port

**Solution**:
```bash
# Check service details
kubectl describe service frontend-service -n todo-app

# Check service endpoints
kubectl get endpoints frontend-service -n todo-app

# Verify pod labels match service selector
kubectl get pods -n todo-app --show-labels
```

---

### Issue: Port-Forward Connection Drops

**Cause**: Network instability or timeout

**Solution**:
```bash
# Restart port-forward
kubectl port-forward -n todo-app service/frontend-service 3000:3000

# Alternative: Use different local port
kubectl port-forward -n todo-app service/frontend-service 3001:3000

# Alternative: Use minikube service
minikube service frontend-service -n todo-app --url
```

---

## Cleanup

### Uninstall Application

```bash
# Uninstall Helm release
helm uninstall todo-chatbot -n todo-app

# Delete namespace (removes all resources)
kubectl delete namespace todo-app

# Verify cleanup
kubectl get all -n todo-app
# Expected: No resources found or namespace not found
```

### Stop Minikube

```bash
# Stop Minikube (preserves cluster state)
minikube stop

# Or delete Minikube cluster (fresh start next time)
minikube delete
```

---

## Quick Reference Commands

### Deployment
```bash
minikube start --cpus=4 --memory=8192 --driver=docker
minikube image load todo-frontend:latest && minikube image load todo-backend:latest
kubectl create namespace todo-app
helm install todo-chatbot ./todo-chatbot-chart --namespace todo-app
kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s
```

### Verification
```bash
kubectl get all -n todo-app
kubectl logs -l app=todo-frontend -n todo-app --tail=20
kubectl logs -l app=todo-backend -n todo-app --tail=20
helm status todo-chatbot -n todo-app
```

### Access
```bash
kubectl port-forward -n todo-app service/frontend-service 3000:3000
kubectl port-forward -n todo-app service/backend-service 8000:8000
```

### Cleanup
```bash
helm uninstall todo-chatbot -n todo-app
kubectl delete namespace todo-app
minikube stop
```

---

## Expected Timeline

| Step | Duration | Cumulative |
|------|----------|------------|
| Start Minikube | 1-2 min | 2 min |
| Load Images | 2-5 min | 7 min |
| Create Namespace | < 5 sec | 7 min |
| Install Chart | 10-30 sec | 7.5 min |
| Wait for Pods | 30-120 sec | 9.5 min |
| Verification | 1-2 min | 11 min |
| **Total** | **~10 min** | |

---

## Success Criteria

✅ Minikube cluster running
✅ Both images loaded in Minikube
✅ Namespace created
✅ Helm chart deployed successfully
✅ All 4 pods Running and Ready
✅ Both services have 2 endpoints each
✅ Inter-service connectivity works
✅ Application accessible via port-forward
✅ Todo CRUD operations functional

---

## Next Steps

After successful deployment:
1. Test all todo operations (create, read, update, delete)
2. Verify data persistence across page refreshes
3. Check pod logs for any warnings or errors
4. Document any issues encountered
5. Capture screenshots of running application
6. Save kubectl outputs for reference

---

**Quickstart Status**: ✅ Complete - Ready for deployment execution
