# Kubernetes Deployment Summary

## Quick Reference

This project supports two Kubernetes deployment options:

### Option 1: Docker Desktop Kubernetes (Recommended for 4GB RAM)
✅ **Best for:** Local development with limited resources
✅ **Memory:** Works well with 4GB RAM
✅ **Setup:** Enable Kubernetes in Docker Desktop settings

**Deploy:**
```bash
# Windows
deploy-to-docker-desktop.bat

# Linux/Mac/Git Bash
./deploy-to-docker-desktop.sh
```

**Verify:**
```bash
# Windows
verify-deployment.bat

# Linux/Mac/Git Bash
./verify-deployment-docker-desktop.sh
```

**Documentation:** See `DOCKER-DESKTOP-QUICKSTART.md`

---

### Option 2: Minikube (Original)
✅ **Best for:** Systems with 8GB+ RAM
✅ **Memory:** Requires at least 1800MB for Minikube VM
✅ **Setup:** Install Minikube separately

**Deploy:**
```bash
./deploy-to-minikube.sh
```

**Verify:**
```bash
./verify-deployment.sh
```

**Documentation:** See `specs/001-minikube-deployment/quickstart.md`

---

## Which Should You Use?

| Your Situation | Recommended Option |
|----------------|-------------------|
| 4GB RAM system | Docker Desktop Kubernetes |
| 8GB+ RAM system | Either option works |
| Windows user | Docker Desktop Kubernetes (easier setup) |
| Need VM isolation | Minikube |
| Simplest setup | Docker Desktop Kubernetes |

## Current Status

Based on your system:
- **RAM:** 4GB
- **OS:** Windows
- **Kubernetes:** Docker Desktop (enabled)

**✅ You should use Docker Desktop Kubernetes**

## Quick Start (Docker Desktop)

### 1. Verify Prerequisites
```bash
kubectl get nodes
# Should show: docker-desktop   Ready   control-plane
```

### 2. Build Images
```bash
cd backend
docker build -t todo-backend:latest .

cd ../frontend
docker build -t todo-frontend:latest .
```

### 3. Deploy
```bash
cd ..
deploy-to-docker-desktop.bat
```

### 4. Access Application
```bash
# Terminal 1
kubectl port-forward -n todo-app service/frontend-service 3000:3000

# Terminal 2
kubectl port-forward -n todo-app service/backend-service 8000:8000
```

Open: http://localhost:3000

## Files Overview

### Docker Desktop Kubernetes
- `deploy-to-docker-desktop.sh` - Bash deployment script
- `deploy-to-docker-desktop.bat` - Windows deployment script
- `verify-deployment.bat` - Windows verification
- `verify-deployment-docker-desktop.sh` - Bash verification
- `DOCKER-DESKTOP-QUICKSTART.md` - Detailed guide
- `DOCKER-DESKTOP-MIGRATION.md` - Migration guide

### Minikube (Original)
- `deploy-to-minikube.sh` - Minikube deployment script
- `verify-deployment.sh` - Minikube verification
- `specs/001-minikube-deployment/quickstart.md` - Minikube guide

### Shared Resources
- `todo-chatbot-chart/` - Helm chart (works with both)

## Common Commands

### View Resources
```bash
kubectl get pods -n todo-app
kubectl get services -n todo-app
kubectl get deployments -n todo-app
```

### View Logs
```bash
kubectl logs -l app=todo-frontend -n todo-app
kubectl logs -l app=todo-backend -n todo-app
```

### Cleanup
```bash
helm uninstall todo-chatbot -n todo-app
kubectl delete namespace todo-app
```

## Troubleshooting

### Pods not starting?
```bash
# Check pod status
kubectl describe pods -n todo-app

# Check events
kubectl get events -n todo-app --sort-by='.lastTimestamp'
```

### Images not found?
```bash
# Verify images exist
docker images | findstr todo

# Rebuild if needed
cd backend && docker build -t todo-backend:latest .
cd ../frontend && docker build -t todo-frontend:latest .
```

### Cannot connect to cluster?
```bash
# Check context
kubectl config current-context

# Should show: docker-desktop (for Docker Desktop)
# Should show: minikube (for Minikube)
```

## Need Help?

1. **Docker Desktop:** See `DOCKER-DESKTOP-QUICKSTART.md`
2. **Minikube:** See `specs/001-minikube-deployment/quickstart.md`
3. **Migration:** See `DOCKER-DESKTOP-MIGRATION.md`
4. **Troubleshooting:** Check the respective quickstart guides

## Architecture

```
┌─────────────────────────────────────────┐
│         Kubernetes Cluster              │
│  (Docker Desktop or Minikube)           │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  Namespace: todo-app            │   │
│  │                                 │   │
│  │  ┌──────────────────────────┐  │   │
│  │  │  Frontend Deployment     │  │   │
│  │  │  - 2 replicas            │  │   │
│  │  │  - Port 3000             │  │   │
│  │  └──────────────────────────┘  │   │
│  │                                 │   │
│  │  ┌──────────────────────────┐  │   │
│  │  │  Backend Deployment      │  │   │
│  │  │  - 2 replicas            │  │   │
│  │  │  - Port 8000             │  │   │
│  │  └──────────────────────────┘  │   │
│  │                                 │   │
│  │  ┌──────────────────────────┐  │   │
│  │  │  ConfigMap               │  │   │
│  │  │  - API URLs              │  │   │
│  │  │  - CORS settings         │  │   │
│  │  └──────────────────────────┘  │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
         │                    │
         │ port-forward       │ port-forward
         │ 3000:3000          │ 8000:8000
         ▼                    ▼
    localhost:3000      localhost:8000
```

## Resources

- **Helm Chart:** `todo-chatbot-chart/`
- **Backend Code:** `backend/`
- **Frontend Code:** `frontend/`
- **Specs:** `specs/001-minikube-deployment/`
