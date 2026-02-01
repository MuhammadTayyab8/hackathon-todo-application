# Quickstart Guide: Deploy Todo App to Kubernetes with Helm

**Feature**: 001-helm-chart-deployment
**Date**: 2026-02-01
**Purpose**: Step-by-step guide to deploy the Todo application to Kubernetes using Helm

## Prerequisites

Before starting, ensure you have:
- Docker Desktop installed and running
- Minikube installed
- Helm 3.x installed
- kubectl installed
- Docker images built: `todo-frontend:latest` and `todo-backend:latest`

## Complete Deployment Sequence

Follow these commands in order to deploy the Todo application to Minikube.

---

## Step 1: Minikube Setup

### 1.1 Start Minikube

```bash
# Start Minikube with sufficient resources
minikube start --cpus=4 --memory=8192 --driver=docker

# Verify Minikube is running
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

### 1.2 Verify kubectl Connection

```bash
# Check kubectl can connect to Minikube
kubectl cluster-info

# Check nodes are ready
kubectl get nodes
```

**Expected Output**:
```
NAME       STATUS   ROLES           AGE   VERSION
minikube   Ready    control-plane   1m    v1.28.3
```

### 1.3 Enable Ingress Addon (Optional)

```bash
# Enable Ingress controller in Minikube
minikube addons enable ingress

# Verify Ingress controller is running
kubectl get pods -n ingress-nginx
```

**Note**: Skip this step if you don't plan to use Ingress (it's disabled by default in the chart).

---

## Step 2: Load Docker Images into Minikube

### 2.1 Verify Images Exist Locally

```bash
# List Docker images on host
docker images | grep todo
```

**Expected Output**:
```
todo-frontend   latest   abc123def456   2 hours ago   180MB
todo-backend    latest   def456ghi789   2 hours ago   280MB
```

**If images don't exist**, build them first:
```bash
# Build backend image
cd backend
docker build -t todo-backend:latest .

# Build frontend image
cd ../frontend
docker build -t todo-frontend:latest .

# Return to repository root
cd ..
```

### 2.2 Load Images into Minikube

```bash
# Load frontend image into Minikube's Docker daemon
minikube image load todo-frontend:latest

# Load backend image into Minikube's Docker daemon
minikube image load todo-backend:latest
```

**This may take 1-2 minutes per image.**

### 2.3 Verify Images in Minikube

```bash
# List images in Minikube
minikube image ls | grep todo
```

**Expected Output**:
```
docker.io/library/todo-frontend:latest
docker.io/library/todo-backend:latest
```

---

## Step 3: Create Namespace (Optional)

### 3.1 Create Dedicated Namespace

```bash
# Create namespace for the application
kubectl create namespace todo-app

# Verify namespace was created
kubectl get namespaces
```

**Expected Output**:
```
NAME              STATUS   AGE
default           Active   5m
todo-app          Active   5s
kube-system       Active   5m
kube-public       Active   5m
kube-node-lease   Active   5m
```

**Note**: If you skip this step, the chart will deploy to the `default` namespace.

---

## Step 4: Install Helm Chart

### 4.1 Verify Helm is Installed

```bash
# Check Helm version
helm version

# Expected: version.BuildInfo{Version:"v3.x.x", ...}
```

### 4.2 Lint the Chart (Validation)

```bash
# Validate chart structure and templates
helm lint todo-chatbot-chart/
```

**Expected Output**:
```
==> Linting todo-chatbot-chart/
[INFO] Chart.yaml: icon is recommended

1 chart(s) linted, 0 chart(s) failed
```

### 4.3 Dry-Run Installation (Test Without Deploying)

```bash
# Test chart rendering without actually deploying
helm install todo-app ./todo-chatbot-chart --dry-run --debug
```

**This will show all rendered Kubernetes manifests. Review for any errors.**

### 4.4 Install the Chart

**Option A: Install to default namespace**
```bash
helm install todo-app ./todo-chatbot-chart
```

**Option B: Install to todo-app namespace**
```bash
helm install todo-app ./todo-chatbot-chart --namespace todo-app
```

**Expected Output**:
```
NAME: todo-app
LAST DEPLOYED: Sat Feb  1 10:00:00 2026
NAMESPACE: default
STATUS: deployed
REVISION: 1
NOTES:
Thank you for installing todo-chatbot!

Your release is named todo-app.

To learn more about the release, try:

  $ helm status todo-app
  $ helm get all todo-app
```

---

## Step 5: Verification Commands

### 5.1 Check Helm Release Status

```bash
# List Helm releases
helm list

# Get detailed release information
helm status todo-app

# Get all release resources
helm get all todo-app
```

**Expected Output** (helm list):
```
NAME      NAMESPACE  REVISION  UPDATED                                STATUS    CHART              APP VERSION
todo-app  default    1         2026-02-01 10:00:00.000000 +0000 UTC  deployed  todo-chatbot-1.0.0 1.0
```

### 5.2 Check Pod Status

```bash
# Watch pods starting up
kubectl get pods --watch

# Or check current status
kubectl get pods
```

**Expected Output** (after 30-60 seconds):
```
NAME                                    READY   STATUS    RESTARTS   AGE
todo-app-frontend-xxxxxxxxxx-xxxxx     1/1     Running   0          45s
todo-app-frontend-xxxxxxxxxx-xxxxx     1/1     Running   0          45s
todo-app-backend-xxxxxxxxxx-xxxxx      1/1     Running   0          45s
todo-app-backend-xxxxxxxxxx-xxxxx      1/1     Running   0          45s
```

**Press Ctrl+C to stop watching.**

### 5.3 Check Pod Details

```bash
# Get detailed pod information
kubectl describe pods -l app=todo-frontend

# Check pod logs
kubectl logs -l app=todo-frontend --tail=50

# Check backend logs
kubectl logs -l app=todo-backend --tail=50
```

### 5.4 Check Services

```bash
# List services
kubectl get services

# Get service details
kubectl describe service frontend-service
kubectl describe service backend-service
```

**Expected Output**:
```
NAME               TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
frontend-service   ClusterIP   10.96.100.100   <none>        3000/TCP   1m
backend-service    ClusterIP   10.96.100.101   <none>        8000/TCP   1m
```

### 5.5 Check ConfigMap

```bash
# List ConfigMaps
kubectl get configmaps

# View ConfigMap contents
kubectl describe configmap todo-app-config
```

### 5.6 Check Deployments

```bash
# List deployments
kubectl get deployments

# Check deployment status
kubectl rollout status deployment/todo-app-frontend
kubectl rollout status deployment/todo-app-backend
```

**Expected Output**:
```
deployment "todo-app-frontend" successfully rolled out
deployment "todo-app-backend" successfully rolled out
```

### 5.7 Test Health Endpoints

```bash
# Test backend health (from within cluster)
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -- \
  curl http://backend-service:8000/health

# Test frontend health (from within cluster)
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -- \
  curl http://frontend-service:3000/health
```

**Expected Output**:
```json
{"status":"healthy","timestamp":"2026-02-01T10:00:00Z","service":"todo-backend","version":"1.0.0"}
```

---

## Step 6: Access the Application

### 6.1 Access via Port Forwarding (Recommended for Testing)

**Option A: Access Frontend**
```bash
# Forward local port 3000 to frontend service
kubectl port-forward service/frontend-service 3000:3000
```

**Then open in browser**: http://localhost:3000

**Option B: Access Backend API**
```bash
# Forward local port 8000 to backend service
kubectl port-forward service/backend-service 8000:8000
```

**Then open in browser**: http://localhost:8000/docs (FastAPI Swagger UI)

**Note**: Port forwarding runs in foreground. Press Ctrl+C to stop. Open a new terminal for additional port forwards.

### 6.2 Access via Minikube Service (Alternative)

```bash
# Get Minikube service URL for frontend
minikube service frontend-service --url

# Get Minikube service URL for backend
minikube service backend-service --url
```

**This will output URLs like**: http://192.168.49.2:30000

### 6.3 Access via Ingress (If Enabled)

**If you enabled Ingress in values.yaml**:

```bash
# Get Minikube IP
minikube ip

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
# Replace <MINIKUBE_IP> with actual IP from above command
echo "<MINIKUBE_IP> todo-app.local" | sudo tee -a /etc/hosts

# Access application
# Frontend: http://todo-app.local/
# Backend: http://todo-app.local/api
```

---

## Step 7: Update and Manage the Deployment

### 7.1 Update Configuration

```bash
# Edit values.yaml to change configuration
# For example, increase replicas to 3

# Upgrade the release
helm upgrade todo-app ./todo-chatbot-chart

# Watch the rolling update
kubectl get pods --watch
```

### 7.2 Rollback to Previous Version

```bash
# View release history
helm history todo-app

# Rollback to previous revision
helm rollback todo-app

# Or rollback to specific revision
helm rollback todo-app 1
```

### 7.3 Scale Deployments

```bash
# Scale frontend to 3 replicas
kubectl scale deployment todo-app-frontend --replicas=3

# Scale backend to 3 replicas
kubectl scale deployment todo-app-backend --replicas=3

# Verify scaling
kubectl get pods
```

---

## Step 8: Cleanup

### 8.1 Uninstall Helm Release

```bash
# Uninstall the release
helm uninstall todo-app

# Verify resources are deleted
kubectl get all
```

### 8.2 Delete Namespace (If Created)

```bash
# Delete namespace and all resources in it
kubectl delete namespace todo-app
```

### 8.3 Stop Minikube

```bash
# Stop Minikube
minikube stop

# Or delete Minikube cluster entirely
minikube delete
```

---

## Troubleshooting

### Issue 1: Pods Stuck in ImagePullBackOff

**Symptom**: `kubectl get pods` shows ImagePullBackOff status

**Solution**:
```bash
# Verify images are loaded in Minikube
minikube image ls | grep todo

# If missing, load images again
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Delete and recreate pods
kubectl delete pods -l app=todo-frontend
kubectl delete pods -l app=todo-backend
```

### Issue 2: Pods Stuck in Pending

**Symptom**: Pods remain in Pending state

**Solution**:
```bash
# Check pod events
kubectl describe pod <pod-name>

# Check if cluster has sufficient resources
kubectl top nodes

# If resources insufficient, restart Minikube with more resources
minikube delete
minikube start --cpus=4 --memory=8192
```

### Issue 3: Health Checks Failing

**Symptom**: Pods show 0/1 Ready, health checks failing

**Solution**:
```bash
# Check pod logs for errors
kubectl logs <pod-name>

# Check if health endpoint is accessible
kubectl exec <pod-name> -- curl http://localhost:3000/health
kubectl exec <pod-name> -- curl http://localhost:8000/health

# If health endpoint doesn't exist, verify Docker images are correct
```

### Issue 4: Service Communication Failure

**Symptom**: Frontend can't reach backend

**Solution**:
```bash
# Verify services exist
kubectl get services

# Test DNS resolution from frontend pod
kubectl exec <frontend-pod-name> -- nslookup backend-service

# Test connectivity from frontend to backend
kubectl exec <frontend-pod-name> -- curl http://backend-service:8000/health

# Check ConfigMap has correct values
kubectl get configmap todo-app-config -o yaml
```

### Issue 5: Helm Install Fails

**Symptom**: `helm install` command fails with errors

**Solution**:
```bash
# Run lint to check for template errors
helm lint todo-chatbot-chart/

# Run dry-run to see rendered templates
helm install todo-app ./todo-chatbot-chart --dry-run --debug

# Check Helm version (must be 3.x)
helm version

# Verify kubectl can connect to cluster
kubectl cluster-info
```

---

## Quick Reference Commands

### Essential Commands
```bash
# Start Minikube
minikube start --cpus=4 --memory=8192

# Load images
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Install chart
helm install todo-app ./todo-chatbot-chart

# Check status
kubectl get pods
kubectl get services
helm status todo-app

# Access application
kubectl port-forward service/frontend-service 3000:3000

# Uninstall
helm uninstall todo-app

# Stop Minikube
minikube stop
```

### Monitoring Commands
```bash
# Watch pods
kubectl get pods --watch

# View logs
kubectl logs -f <pod-name>
kubectl logs -l app=todo-frontend --tail=50

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods
kubectl top nodes
```

### Debugging Commands
```bash
# Describe resources
kubectl describe pod <pod-name>
kubectl describe service <service-name>
kubectl describe deployment <deployment-name>

# Execute commands in pod
kubectl exec -it <pod-name> -- /bin/sh

# Port forward for debugging
kubectl port-forward <pod-name> 3000:3000
```

---

## Next Steps

1. **Customize Configuration**: Edit `values.yaml` to adjust replicas, resources, or other settings
2. **Enable Ingress**: Set `ingress.enabled: true` in values.yaml for external access
3. **Add Secrets**: Create Kubernetes Secrets for sensitive data (DATABASE_URL, BETTER_AUTH_SECRET)
4. **Set Up Monitoring**: Install Prometheus and Grafana for observability
5. **Configure Autoscaling**: Add HorizontalPodAutoscaler for automatic scaling
6. **Deploy to Cloud**: Adapt chart for GKE, EKS, or AKS deployment

---

## Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)

---

**Quickstart Status**: ✅ Complete - All deployment commands documented
