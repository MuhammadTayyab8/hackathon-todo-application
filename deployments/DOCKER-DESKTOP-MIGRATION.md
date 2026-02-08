# Migration from Minikube to Docker Desktop Kubernetes

## Overview

This document explains the changes made to adapt the Kubernetes deployment from Minikube to Docker Desktop's built-in Kubernetes cluster. This migration is necessary for systems with limited RAM (4GB) where Minikube cannot run efficiently.

## What Changed

### 1. New Deployment Scripts

#### For Windows Users:
- **`deploy-to-docker-desktop.bat`** - Windows batch script for deployment
- **`verify-deployment.bat`** - Windows batch script for verification

#### For Linux/Mac/Git Bash Users:
- **`deploy-to-docker-desktop.sh`** - Bash script for deployment
- **`verify-deployment-docker-desktop.sh`** - Bash script for verification

### 2. Key Differences from Minikube

| Feature | Minikube | Docker Desktop K8s |
|---------|----------|-------------------|
| **Cluster Management** | `minikube start/stop` required | Always running with Docker Desktop |
| **Image Loading** | `minikube image load` required | Direct access to local Docker images |
| **Image Pull Policy** | `Never` (already configured) | `Never` (no change needed) |
| **Memory Overhead** | Separate VM (~1800MB minimum) | Shared with Docker Desktop |
| **Networking** | Separate VM network | Integrated with Docker network |
| **Cluster Context** | `minikube` | `docker-desktop` |

### 3. What Was Removed

The following Minikube-specific steps were removed from deployment scripts:

```bash
# ❌ No longer needed
minikube start --cpus=2 --memory=1800
minikube image load todo-frontend:latest
minikube image load todo-backend:latest
minikube image ls
minikube status
minikube stop
```

### 4. What Was Added

New verification for Docker Desktop Kubernetes:

```bash
# ✅ New checks
kubectl cluster-info | grep "kubernetes.docker.internal"
kubectl config current-context  # Should show: docker-desktop
```

### 5. Helm Chart Compatibility

**No changes required!** The existing Helm chart works perfectly with Docker Desktop because:

- `imagePullPolicy: Never` is already set in `values.yaml`
- This tells Kubernetes to use local Docker images
- Docker Desktop Kubernetes has direct access to the local Docker daemon

## Prerequisites

### Enable Kubernetes in Docker Desktop

1. Open Docker Desktop
2. Go to **Settings** → **Kubernetes**
3. Check **"Enable Kubernetes"**
4. Click **"Apply & Restart"**
5. Wait for the green indicator showing Kubernetes is running

### Verify Installation

```bash
# Check Kubernetes is running
kubectl get nodes
# Expected output: docker-desktop   Ready   control-plane

# Check cluster info
kubectl cluster-info
# Expected: Kubernetes control plane is running at https://kubernetes.docker.internal:6443
```

## Deployment Instructions

### Step 1: Build Docker Images

```bash
# Build backend
cd backend
docker build -t todo-backend:latest .

# Build frontend
cd ../frontend
docker build -t todo-frontend:latest .

# Verify images
docker images | findstr todo
```

### Step 2: Deploy to Kubernetes

**Windows (Command Prompt or PowerShell):**
```cmd
cd D:\Tayyab\AI-Hackathon\hackathon2-todo-app
deploy-to-docker-desktop.bat
```

**Linux/Mac/Git Bash:**
```bash
cd /d/Tayyab/AI-Hackathon/hackathon2-todo-app
chmod +x deploy-to-docker-desktop.sh
./deploy-to-docker-desktop.sh
```

### Step 3: Verify Deployment

**Windows:**
```cmd
verify-deployment.bat
```

**Linux/Mac/Git Bash:**
```bash
chmod +x verify-deployment-docker-desktop.sh
./verify-deployment-docker-desktop.sh
```

### Step 4: Access the Application

Open two terminal windows:

**Terminal 1 - Frontend:**
```bash
kubectl port-forward -n todo-app service/frontend-service 3000:3000
```

**Terminal 2 - Backend:**
```bash
kubectl port-forward -n todo-app service/backend-service 8000:8000
```

Then access:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/docs

## Troubleshooting

### Issue: "Docker Desktop Kubernetes not detected"

**Solution:**
1. Verify Kubernetes is enabled in Docker Desktop settings
2. Check the status indicator in Docker Desktop (should be green)
3. Restart Docker Desktop if needed

### Issue: Pods stuck in "ImagePullBackOff"

**Solution:**
```bash
# Verify images exist locally
docker images | findstr todo

# Should show:
# todo-frontend   latest   ...
# todo-backend    latest   ...

# If missing, rebuild the images
cd backend && docker build -t todo-backend:latest .
cd ../frontend && docker build -t todo-frontend:latest .
```

### Issue: Pods stuck in "Pending"

**Solution:**
1. Check Docker Desktop resource allocation:
   - Settings → Resources
   - Memory: At least 4GB
   - CPUs: At least 2
2. Restart Docker Desktop

### Issue: "Cannot connect to cluster"

**Solution:**
```bash
# Check current context
kubectl config current-context
# Should show: docker-desktop

# If not, switch context
kubectl config use-context docker-desktop
```

## Resource Requirements

### Minimum System Requirements
- **RAM:** 4GB (Docker Desktop + Kubernetes)
- **CPU:** 2 cores
- **Disk:** 10GB free space

### Docker Desktop Settings
Recommended allocation:
- **Memory:** 4GB
- **CPUs:** 2
- **Swap:** 1GB
- **Disk image size:** 60GB

## Advantages of Docker Desktop Kubernetes

✅ **Lower Memory Footprint** - No separate VM overhead
✅ **Faster Deployment** - No image loading step required
✅ **Simpler Workflow** - Fewer commands to run
✅ **Better Integration** - Single Docker Desktop interface
✅ **Ideal for 4GB RAM** - More efficient resource usage

## Cleanup

To remove the deployment:

```bash
# Uninstall Helm release
helm uninstall todo-chatbot -n todo-app

# Delete namespace
kubectl delete namespace todo-app

# Verify cleanup
kubectl get all -n todo-app
# Should show: No resources found
```

## Files Reference

### New Files Created
- `deploy-to-docker-desktop.sh` - Bash deployment script
- `deploy-to-docker-desktop.bat` - Windows deployment script
- `verify-deployment.bat` - Windows verification script
- `verify-deployment-docker-desktop.sh` - Bash verification script
- `DOCKER-DESKTOP-QUICKSTART.md` - Quick start guide
- `DOCKER-DESKTOP-MIGRATION.md` - This migration guide

### Existing Files (Unchanged)
- `todo-chatbot-chart/` - Helm chart (works with both Minikube and Docker Desktop)
- `deploy-to-minikube.sh` - Original Minikube deployment script (kept for reference)
- `verify-deployment.sh` - Original Minikube verification script (kept for reference)

## Next Steps

1. ✅ Deploy to Docker Desktop Kubernetes (you are here)
2. 🔄 Test application functionality
3. 📊 Monitor resource usage
4. 🚀 Consider cloud deployment (EKS, GKE, AKS) for production

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs: `kubectl logs -l app=todo-frontend -n todo-app`
3. Check events: `kubectl get events -n todo-app`
4. Refer to `DOCKER-DESKTOP-QUICKSTART.md` for detailed instructions

## References

- [Docker Desktop Kubernetes Documentation](https://docs.docker.com/desktop/kubernetes/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Original Minikube Deployment Spec](./specs/001-minikube-deployment/spec.md)
