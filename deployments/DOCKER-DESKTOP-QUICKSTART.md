# Docker Desktop Kubernetes Deployment - Quick Start Guide

This guide helps you deploy the Todo App to Docker Desktop's built-in Kubernetes cluster. This is ideal for local development when you have limited RAM (4GB) and cannot run Minikube.

## Prerequisites

### 1. Docker Desktop with Kubernetes Enabled
- Install Docker Desktop for Windows
- Enable Kubernetes in Docker Desktop:
  1. Open Docker Desktop
  2. Go to Settings → Kubernetes
  3. Check "Enable Kubernetes"
  4. Click "Apply & Restart"
  5. Wait for Kubernetes to start (green indicator)

### 2. Required Tools
- **kubectl** - Kubernetes command-line tool
  ```bash
  # Verify installation
  kubectl version --client
  ```

- **Helm** - Kubernetes package manager
  ```bash
  # Install via Chocolatey (Windows)
  choco install kubernetes-helm

  # Verify installation
  helm version
  ```

### 3. Verify Kubernetes is Running
```bash
kubectl get nodes
# Should show: docker-desktop   Ready   control-plane

kubectl cluster-info
# Should show: Kubernetes control plane is running at https://kubernetes.docker.internal:6443
```

## Deployment Steps

### Step 1: Build Docker Images
First, build the frontend and backend Docker images:

```bash
# Build backend image
cd backend
docker build -t todo-backend:latest .

# Build frontend image
cd ../frontend
docker build -t todo-frontend:latest .

# Verify images
docker images | findstr todo
```

### Step 2: Deploy to Kubernetes

#### Option A: Using Windows Batch File (Recommended for Windows)
```cmd
cd D:\Tayyab\AI-Hackathon\hackathon2-todo-app
deploy-to-docker-desktop.bat
```

#### Option B: Using Bash Script (Git Bash/WSL)
```bash
cd /d/Tayyab/AI-Hackathon/hackathon2-todo-app
chmod +x deploy-to-docker-desktop.sh
./deploy-to-docker-desktop.sh
```

### Step 3: Verify Deployment

#### Option A: Using Windows Batch File
```cmd
verify-deployment.bat
```

#### Option B: Using Bash Script
```bash
./verify-deployment.sh
```

### Step 4: Access the Application

Open **two separate terminal windows**:

**Terminal 1 - Frontend:**
```bash
kubectl port-forward -n todo-app service/frontend-service 3000:3000
```

**Terminal 2 - Backend:**
```bash
kubectl port-forward -n todo-app service/backend-service 8000:8000
```

Then open in your browser:
- Frontend: http://localhost:3000
- Backend API Docs: http://localhost:8000/docs

## Key Differences from Minikube

| Aspect | Minikube | Docker Desktop K8s |
|--------|----------|-------------------|
| **Image Loading** | Requires `minikube image load` | Uses local Docker images directly |
| **Cluster Start** | `minikube start` required | Always running with Docker Desktop |
| **Memory Usage** | Configurable (min 1800MB) | Shares Docker Desktop resources |
| **Networking** | Separate VM network | Integrated with Docker network |
| **Access** | `minikube service` or port-forward | Port-forward only |

## Advantages of Docker Desktop Kubernetes

✅ **Lower Memory Footprint** - No separate VM overhead
✅ **Faster Image Access** - Direct access to local Docker images
✅ **Simpler Setup** - No need to load images into cluster
✅ **Integrated Experience** - Single Docker Desktop interface
✅ **Better for 4GB RAM** - More efficient resource usage

## Common Commands

### View Resources
```bash
# View all pods
kubectl get pods -n todo-app

# View services
kubectl get services -n todo-app

# View deployments
kubectl get deployments -n todo-app

# View logs
kubectl logs -l app=todo-frontend -n todo-app
kubectl logs -l app=todo-backend -n todo-app
```

### Troubleshooting
```bash
# Describe a pod (replace POD_NAME)
kubectl describe pod POD_NAME -n todo-app

# Get events
kubectl get events -n todo-app --sort-by='.lastTimestamp'

# Check pod status
kubectl get pods -n todo-app -o wide
```

### Cleanup
```bash
# Uninstall Helm release
helm uninstall todo-chatbot -n todo-app

# Delete namespace
kubectl delete namespace todo-app

# Verify cleanup
kubectl get all -n todo-app
```

## Troubleshooting

### Issue: Pods stuck in ImagePullBackOff
**Solution:** Ensure images are built locally with correct tags:
```bash
docker images | findstr todo
# Should show: todo-frontend:latest and todo-backend:latest
```

### Issue: Pods stuck in Pending
**Solution:** Check if Docker Desktop has enough resources:
1. Docker Desktop → Settings → Resources
2. Increase Memory to at least 4GB
3. Increase CPUs to at least 2

### Issue: Cannot connect to cluster
**Solution:** Verify Kubernetes is enabled:
```bash
kubectl config current-context
# Should show: docker-desktop
```

### Issue: Port-forward connection refused
**Solution:** Ensure pods are running:
```bash
kubectl get pods -n todo-app
# All pods should show STATUS: Running and READY: 1/1
```

## Environment Variables

The deployment uses these environment variables (configured in Helm chart):

**Backend:**
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - JWT secret key
- `CORS_ORIGINS` - Allowed CORS origins

**Frontend:**
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `BETTER_AUTH_SECRET` - JWT secret key
- `BETTER_AUTH_URL` - Frontend URL for auth callbacks

## Next Steps

1. ✅ Deploy to Docker Desktop Kubernetes (you are here)
2. 🔄 Test application functionality
3. 🚀 Deploy to cloud Kubernetes (EKS, GKE, AKS)
4. 📊 Add monitoring and logging
5. 🔒 Configure production secrets

## Resources

- [Docker Desktop Kubernetes Docs](https://docs.docker.com/desktop/kubernetes/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Helm Documentation](https://helm.sh/docs/)
- [Original Minikube Deployment Spec](./specs/001-minikube-deployment/spec.md)

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review pod logs: `kubectl logs -l app=todo-frontend -n todo-app`
3. Check events: `kubectl get events -n todo-app`
4. Verify Docker Desktop is running and Kubernetes is enabled
