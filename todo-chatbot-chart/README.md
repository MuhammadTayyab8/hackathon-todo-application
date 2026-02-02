# Todo Chatbot Helm Chart

A Helm chart for deploying the Todo Chatbot application (Next.js frontend + FastAPI backend) to Kubernetes.

## Overview

This chart deploys a complete Todo application stack with:
- **Frontend**: Next.js 16 application (2 replicas by default)
- **Backend**: FastAPI Python application (2 replicas by default)
- **ConfigMap**: Environment configuration for service discovery
- **Services**: ClusterIP services for internal communication
- **Ingress**: Optional external access with path-based routing

## Prerequisites

- Kubernetes 1.24+
- Helm 3.x
- Docker images: `todo-frontend:latest` and `todo-backend:latest`
- For local development: Minikube with sufficient resources (4 CPUs, 8GB RAM)

## Installation

### Quick Start (Minikube)

```bash
# Start Minikube
minikube start --cpus=4 --memory=8192

# Load Docker images into Minikube
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Install the chart
helm install todo-app ./todo-chatbot-chart

# Check deployment status
kubectl get pods
```

### Installation Options

**Install to specific namespace:**
```bash
kubectl create namespace todo-app
helm install todo-app ./todo-chatbot-chart --namespace todo-app
```

**Install with custom values:**
```bash
helm install todo-app ./todo-chatbot-chart --values custom-values.yaml
```

**Install with inline value overrides:**
```bash
helm install todo-app ./todo-chatbot-chart \
  --set frontend.replicaCount=3 \
  --set backend.replicaCount=3
```

## Configuration

### Frontend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `frontend.replicaCount` | Number of frontend replicas | `2` |
| `frontend.image.repository` | Frontend image repository | `todo-frontend` |
| `frontend.image.tag` | Frontend image tag | `latest` |
| `frontend.image.pullPolicy` | Image pull policy | `Never` |
| `frontend.service.name` | Frontend service name | `frontend-service` |
| `frontend.service.type` | Frontend service type | `ClusterIP` |
| `frontend.service.port` | Frontend service port | `3000` |
| `frontend.resources.requests.cpu` | CPU request | `100m` |
| `frontend.resources.requests.memory` | Memory request | `128Mi` |
| `frontend.resources.limits.cpu` | CPU limit | `500m` |
| `frontend.resources.limits.memory` | Memory limit | `512Mi` |
| `frontend.healthCheck.path` | Health check endpoint | `/health` |
| `frontend.healthCheck.initialDelaySeconds` | Initial delay for health check | `10` |
| `frontend.healthCheck.periodSeconds` | Health check period | `10` |

### Backend Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `backend.replicaCount` | Number of backend replicas | `2` |
| `backend.image.repository` | Backend image repository | `todo-backend` |
| `backend.image.tag` | Backend image tag | `latest` |
| `backend.image.pullPolicy` | Image pull policy | `Never` |
| `backend.service.name` | Backend service name | `backend-service` |
| `backend.service.type` | Backend service type | `ClusterIP` |
| `backend.service.port` | Backend service port | `8000` |
| `backend.resources.requests.cpu` | CPU request | `100m` |
| `backend.resources.requests.memory` | Memory request | `128Mi` |
| `backend.resources.limits.cpu` | CPU limit | `500m` |
| `backend.resources.limits.memory` | Memory limit | `512Mi` |
| `backend.healthCheck.path` | Health check endpoint | `/health` |
| `backend.healthCheck.initialDelaySeconds` | Initial delay for health check | `10` |
| `backend.healthCheck.periodSeconds` | Health check period | `10` |

### ConfigMap Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `config.frontendApiUrl` | Backend URL for frontend | `http://backend-service:8000` |
| `config.backendCorsOrigins` | CORS origins for backend | `http://frontend-service:3000` |

### Ingress Configuration

| Parameter | Description | Default |
|-----------|-------------|---------|
| `ingress.enabled` | Enable Ingress | `false` |
| `ingress.className` | Ingress class name | `nginx` |
| `ingress.hostname` | Ingress hostname | `todo-app.local` |
| `ingress.paths.frontend` | Frontend path | `/` |
| `ingress.paths.backend` | Backend path | `/api` |
| `ingress.tls.enabled` | Enable TLS | `false` |
| `ingress.tls.secretName` | TLS secret name | `todo-app-tls` |

## Usage

### Accessing the Application

**Via Port Forwarding (Recommended for Testing):**
```bash
# Access frontend
kubectl port-forward service/frontend-service 3000:3000
# Open http://localhost:3000

# Access backend API
kubectl port-forward service/backend-service 8000:8000
# Open http://localhost:8000/docs
```

**Via Minikube Service:**
```bash
minikube service frontend-service --url
minikube service backend-service --url
```

**Via Ingress (if enabled):**
```bash
# Enable Ingress in values.yaml
ingress:
  enabled: true

# Upgrade the release
helm upgrade todo-app ./todo-chatbot-chart

# Add hostname to /etc/hosts
echo "$(minikube ip) todo-app.local" | sudo tee -a /etc/hosts

# Access application
# Frontend: http://todo-app.local/
# Backend: http://todo-app.local/api
```

### Updating the Deployment

**Update configuration:**
```bash
# Edit values.yaml
vim todo-chatbot-chart/values.yaml

# Apply changes
helm upgrade todo-app ./todo-chatbot-chart
```

**Scale replicas:**
```bash
helm upgrade todo-app ./todo-chatbot-chart \
  --set frontend.replicaCount=3 \
  --set backend.replicaCount=3
```

### Rollback

```bash
# View release history
helm history todo-app

# Rollback to previous version
helm rollback todo-app

# Rollback to specific revision
helm rollback todo-app 1
```

## Verification

### Check Deployment Status

```bash
# Check pods
kubectl get pods -l app.kubernetes.io/instance=todo-app

# Check services
kubectl get services

# Check deployments
kubectl get deployments

# Check ConfigMap
kubectl get configmap
```

### View Logs

```bash
# Frontend logs
kubectl logs -l app=todo-frontend --tail=50

# Backend logs
kubectl logs -l app=todo-backend --tail=50
```

### Test Health Endpoints

```bash
# Test backend health
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -- \
  curl http://backend-service:8000/health

# Test frontend health
kubectl run curl-test --image=curlimages/curl --rm -it --restart=Never -- \
  curl http://frontend-service:3000/health
```

## Uninstallation

```bash
# Uninstall the release
helm uninstall todo-app

# Verify resources are deleted
kubectl get all
```

## Troubleshooting

### Pods in ImagePullBackOff

**Problem**: Pods can't pull images

**Solution**:
```bash
# Verify images are loaded in Minikube
minikube image ls | grep todo

# Load images if missing
minikube image load todo-frontend:latest
minikube image load todo-backend:latest

# Restart pods
kubectl delete pods -l app=todo-frontend
kubectl delete pods -l app=todo-backend
```

### Health Checks Failing

**Problem**: Pods show 0/1 Ready

**Solution**:
```bash
# Check pod logs
kubectl logs <pod-name>

# Verify health endpoint
kubectl exec <pod-name> -- curl http://localhost:3000/health
kubectl exec <pod-name> -- curl http://localhost:8000/health
```

### Service Communication Issues

**Problem**: Frontend can't reach backend

**Solution**:
```bash
# Test DNS resolution
kubectl exec <frontend-pod> -- nslookup backend-service

# Test connectivity
kubectl exec <frontend-pod> -- curl http://backend-service:8000/health

# Check ConfigMap
kubectl get configmap -o yaml
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Ingress                              │
│                    (todo-app.local)                          │
│                                                              │
│  / → frontend-service:3000                                  │
│  /api → backend-service:8000                                │
└────────────────┬────────────────────────┬───────────────────┘
                 │                        │
                 ▼                        ▼
        ┌────────────────┐      ┌────────────────┐
        │ Frontend       │      │ Backend        │
        │ Service        │      │ Service        │
        │ (ClusterIP)    │      │ (ClusterIP)    │
        │ Port: 3000     │      │ Port: 8000     │
        └────────┬───────┘      └────────┬───────┘
                 │                       │
                 │ Selects               │ Selects
                 │ app=todo-frontend     │ app=todo-backend
                 │                       │
                 ▼                       ▼
        ┌────────────────┐      ┌────────────────┐
        │ Frontend       │      │ Backend        │
        │ Deployment     │      │ Deployment     │
        │ Replicas: 2    │      │ Replicas: 2    │
        └────────┬───────┘      └────────┬───────┘
                 │                       │
                 │ Creates               │ Creates
                 │                       │
                 ▼                       ▼
        ┌────────────────┐      ┌────────────────┐
        │ Frontend Pods  │      │ Backend Pods   │
        │ (2 replicas)   │      │ (2 replicas)   │
        │                │      │                │
        │ Image:         │      │ Image:         │
        │ todo-frontend  │      │ todo-backend   │
        │                │      │                │
        │ Env from       │      │ Env from       │
        │ ConfigMap      │      │ ConfigMap      │
        └────────────────┘      └────────────────┘
                 │                       │
                 └───────────┬───────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   ConfigMap    │
                    │                │
                    │ NEXT_PUBLIC_   │
                    │ API_URL        │
                    │                │
                    │ CORS_ORIGINS   │
                    └────────────────┘
```

## Features

- **Zero-downtime deployments**: Rolling update strategy with maxSurge=1, maxUnavailable=0
- **Health checks**: Readiness and liveness probes for both services
- **Resource management**: CPU and memory requests/limits configured
- **Service discovery**: Kubernetes DNS for inter-service communication
- **Configurable**: All settings exposed via values.yaml
- **Optional Ingress**: External access with path-based routing
- **Production-ready**: Follows Helm and Kubernetes best practices

## Development

### Linting

```bash
helm lint todo-chatbot-chart/
```

### Dry Run

```bash
helm install --dry-run --debug todo-app ./todo-chatbot-chart
```

### Template Rendering

```bash
helm template todo-app ./todo-chatbot-chart
```

## License

This chart is part of the Todo Chatbot application.

## Maintainers

- Todo App Team

## Support

For issues and questions, please refer to the main project documentation.
