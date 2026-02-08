# Deployment Sequence Contract

**Feature**: 001-minikube-deployment
**Date**: 2026-02-02
**Purpose**: Define the exact sequence of commands for deploying to Minikube

## Contract Overview

This contract defines the mandatory sequence of operations that must be executed to successfully deploy the Todo application to Minikube. Each step has prerequisites, commands, and success criteria.

---

## Step 0: Prerequisites Verification

**Purpose**: Verify all required tools are installed before attempting deployment

**Prerequisites**: None (this is the first step)

**Commands**:
```bash
# Check Minikube
minikube version

# Check kubectl
kubectl version --client

# Check Helm
helm version

# Check Docker
docker --version

# Check Docker images exist
docker images | grep todo-frontend
docker images | grep todo-backend
```

**Success Criteria**:
- All commands execute without errors
- Minikube version >= 1.30.0
- kubectl version >= 1.24.0
- Helm version >= 3.0.0
- Docker is running
- Both todo-frontend:latest and todo-backend:latest images exist

**On Failure**:
- Install missing tools
- Build Docker images if missing
- Start Docker Desktop if not running

---

## Step 1: Start Minikube Cluster

**Purpose**: Start local Kubernetes cluster with sufficient resources

**Prerequisites**: Minikube installed, Docker running

**Commands**:
```bash
# Start Minikube with specified resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify cluster is running
minikube status

# Verify kubectl can connect
kubectl cluster-info
```

**Success Criteria**:
- `minikube status` shows:
  - minikube: Running
  - kubelet: Running
  - apiserver: Running
- `kubectl cluster-info` returns cluster information
- No error messages

**Expected Duration**: 1-2 minutes

**On Failure**:
- If Minikube fails to start: Check Docker is running, check available resources
- If driver error: Try different driver (--driver=virtualbox or --driver=hyperv)
- If resource error: Reduce --cpus or --memory values

---

## Step 2: Load Docker Images

**Purpose**: Transfer Docker images from host to Minikube's Docker daemon

**Prerequisites**: Minikube running, Docker images built

**Commands**:
```bash
# Load frontend image
minikube image load todo-frontend:latest

# Load backend image
minikube image load todo-backend:latest

# Verify images are loaded
minikube image ls | grep todo
```

**Success Criteria**:
- Both `minikube image load` commands complete without errors
- `minikube image ls` shows:
  - docker.io/library/todo-frontend:latest
  - docker.io/library/todo-backend:latest

**Expected Duration**: 2-5 minutes (depends on image sizes)

**On Failure**:
- If image not found: Build images first with `docker build`
- If load fails: Check Minikube has sufficient disk space
- If timeout: Increase timeout or try loading one image at a time

---

## Step 3: Create Namespace

**Purpose**: Create isolated namespace for application resources

**Prerequisites**: Minikube running, kubectl connected

**Commands**:
```bash
# Create namespace
kubectl create namespace todo-app

# Verify namespace exists
kubectl get namespace todo-app
```

**Success Criteria**:
- Namespace created successfully
- `kubectl get namespace todo-app` shows STATUS: Active

**Expected Duration**: < 5 seconds

**On Failure**:
- If namespace already exists: Use `kubectl delete namespace todo-app` to clean up first
- If permission error: Check kubectl context and permissions

**Alternative (Idempotent)**:
```bash
# Create namespace if it doesn't exist
kubectl create namespace todo-app --dry-run=client -o yaml | kubectl apply -f -
```

---

## Step 4: Validate Helm Chart

**Purpose**: Ensure Helm chart is valid before installation

**Prerequisites**: Helm installed, chart exists at `todo-chatbot-chart/`

**Commands**:
```bash
# Lint the chart
helm lint todo-chatbot-chart/

# Dry-run installation
helm install todo-app ./todo-chatbot-chart --namespace todo-app --dry-run --debug
```

**Success Criteria**:
- `helm lint` shows "0 chart(s) failed"
- `helm install --dry-run` completes without errors
- All templates render correctly

**Expected Duration**: < 10 seconds

**On Failure**:
- If lint errors: Fix chart templates
- If template errors: Check values.yaml syntax
- If missing chart: Verify chart directory exists

---

## Step 5: Install Helm Chart

**Purpose**: Deploy application to Kubernetes using Helm

**Prerequisites**: Namespace created, images loaded, chart validated

**Commands**:
```bash
# Install chart
helm install todo-chatbot ./todo-chatbot-chart --namespace todo-app

# Verify installation
helm list -n todo-app

# Check release status
helm status todo-chatbot -n todo-app
```

**Success Criteria**:
- `helm install` completes without errors
- `helm list` shows STATUS: deployed
- `helm status` shows all resources created

**Expected Duration**: 10-30 seconds

**On Failure**:
- If already exists: Use `helm upgrade --install` instead
- If template error: Run `helm lint` and fix issues
- If timeout: Increase timeout with `--timeout 5m`

---

## Step 6: Wait for Pods to be Ready

**Purpose**: Ensure all pods start successfully and pass health checks

**Prerequisites**: Helm chart installed

**Commands**:
```bash
# Wait for all pods to be ready (with timeout)
kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s

# Check pod status
kubectl get pods -n todo-app

# Check pod details if needed
kubectl describe pods -n todo-app
```

**Success Criteria**:
- `kubectl wait` completes successfully
- All 4 pods show STATUS: Running
- All 4 pods show READY: 1/1
- No pods in CrashLoopBackOff or ImagePullBackOff

**Expected Duration**: 30-120 seconds

**On Failure**:
- If timeout: Check pod logs with `kubectl logs`
- If ImagePullBackOff: Verify images are loaded in Minikube
- If CrashLoopBackOff: Check application logs for errors
- If Pending: Check resource availability with `kubectl describe pod`

---

## Step 7: Verify Services

**Purpose**: Ensure services are created and have endpoints

**Prerequisites**: Pods running

**Commands**:
```bash
# List services
kubectl get services -n todo-app

# Check service endpoints
kubectl get endpoints -n todo-app

# Describe services
kubectl describe service frontend-service -n todo-app
kubectl describe service backend-service -n todo-app
```

**Success Criteria**:
- 2 services exist: frontend-service, backend-service
- frontend-service has 2 endpoints (port 3000)
- backend-service has 2 endpoints (port 8000)
- Both services have ClusterIP assigned

**Expected Duration**: < 5 seconds

**On Failure**:
- If no endpoints: Check pod labels match service selectors
- If wrong port: Verify service and pod port configuration
- If service missing: Check Helm chart templates

---

## Step 8: Verify Deployments

**Purpose**: Ensure deployments are available and healthy

**Prerequisites**: Pods running, services created

**Commands**:
```bash
# List deployments
kubectl get deployments -n todo-app

# Check deployment status
kubectl rollout status deployment/todo-chatbot-frontend -n todo-app
kubectl rollout status deployment/todo-chatbot-backend -n todo-app
```

**Success Criteria**:
- 2 deployments exist
- Both show READY: 2/2
- Both show AVAILABLE: 2
- Rollout status shows "successfully rolled out"

**Expected Duration**: < 5 seconds

**On Failure**:
- If not available: Check pod status
- If wrong replica count: Check values.yaml configuration
- If rollout failed: Check pod logs and events

---

## Step 9: Test Inter-Service Connectivity

**Purpose**: Verify frontend can communicate with backend

**Prerequisites**: All pods running and ready

**Commands**:
```bash
# Get frontend pod name
FRONTEND_POD=$(kubectl get pods -n todo-app -l app=todo-frontend -o jsonpath='{.items[0].metadata.name}')

# Test connectivity from frontend to backend
kubectl exec -n todo-app $FRONTEND_POD -- curl -s http://backend-service:8000/health

# Alternative: Test from a temporary pod
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n todo-app -- curl http://backend-service:8000/health
```

**Success Criteria**:
- curl command returns 200 OK
- Response contains health status JSON
- No connection errors

**Expected Duration**: < 5 seconds

**On Failure**:
- If connection refused: Check backend service is running
- If DNS error: Verify service name and namespace
- If timeout: Check network policies and pod networking

---

## Step 10: Access Application Externally

**Purpose**: Enable external access to application for testing

**Prerequisites**: All services running and healthy

**Commands**:
```bash
# Port-forward frontend (run in separate terminal)
kubectl port-forward -n todo-app service/frontend-service 3000:3000

# Port-forward backend (run in separate terminal)
kubectl port-forward -n todo-app service/backend-service 8000:8000

# Test frontend access
curl http://localhost:3000/health

# Test backend access
curl http://localhost:8000/health
```

**Success Criteria**:
- Port-forward commands start without errors
- Frontend accessible at http://localhost:3000
- Backend accessible at http://localhost:8000
- Both health endpoints return 200 OK

**Expected Duration**: < 5 seconds to start port-forward

**On Failure**:
- If port already in use: Use different local port (e.g., 3001:3000)
- If connection refused: Verify service is running
- If timeout: Check pod logs for application errors

---

## Complete Deployment Sequence (Copy-Paste)

```bash
# Step 0: Verify prerequisites
minikube version && kubectl version --client && helm version && docker images | grep todo

# Step 1: Start Minikube
minikube start --cpus=4 --memory=8192 --driver=docker
minikube status

# Step 2: Load images
minikube image load todo-frontend:latest
minikube image load todo-backend:latest
minikube image ls | grep todo

# Step 3: Create namespace
kubectl create namespace todo-app

# Step 4: Validate chart
helm lint todo-chatbot-chart/

# Step 5: Install chart
helm install todo-chatbot ./todo-chatbot-chart --namespace todo-app

# Step 6: Wait for pods
kubectl wait --for=condition=ready pod --all -n todo-app --timeout=120s
kubectl get pods -n todo-app

# Step 7: Verify services
kubectl get services -n todo-app
kubectl get endpoints -n todo-app

# Step 8: Verify deployments
kubectl get deployments -n todo-app

# Step 9: Test connectivity
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -n todo-app -- curl http://backend-service:8000/health

# Step 10: Access application
kubectl port-forward -n todo-app service/frontend-service 3000:3000
# Open http://localhost:3000 in browser
```

---

## Cleanup Sequence

```bash
# Uninstall Helm release
helm uninstall todo-chatbot -n todo-app

# Delete namespace (removes all resources)
kubectl delete namespace todo-app

# Stop Minikube (optional)
minikube stop

# Delete Minikube cluster (optional, for fresh start)
minikube delete
```

---

**Contract Status**: ✅ Complete - All deployment steps defined with success criteria
