# Data Model: Kubernetes Resources for Minikube Deployment

**Feature**: 001-minikube-deployment
**Date**: 2026-02-02
**Purpose**: Define the structure of Kubernetes resources deployed to Minikube

## Overview

For a deployment feature, the "data model" represents the Kubernetes resources and their relationships. This document defines the complete resource topology that will exist in the Minikube cluster after deployment.

## Namespace

**Resource**: `todo-app` (Namespace)

**Purpose**: Isolates all application resources from other deployments

**Attributes**:
- Name: `todo-app`
- Labels: Standard Kubernetes labels

**Relationships**:
- Contains: All application resources (Deployments, Services, ConfigMap, Pods)
- Scope: All kubectl commands use `-n todo-app` flag

---

## Helm Release

**Resource**: `todo-chatbot` (Helm Release)

**Purpose**: Manages all Kubernetes resources as a versioned unit

**Attributes**:
- Name: `todo-chatbot`
- Namespace: `todo-app`
- Chart: `todo-chatbot-chart` (version 1.0.0)
- Revision: 1 (increments with each upgrade)
- Status: deployed

**Relationships**:
- Manages: All resources created from Helm templates
- Enables: Upgrades, rollbacks, version tracking

---

## ConfigMap

**Resource**: `todo-chatbot-config` (ConfigMap)

**Purpose**: Stores non-sensitive configuration for both services

**Attributes**:
- Name: `todo-chatbot-config`
- Namespace: `todo-app`
- Data:
  - `NEXT_PUBLIC_API_URL`: `http://backend-service:8000`
  - `CORS_ORIGINS`: `http://frontend-service:3000`

**Relationships**:
- Referenced by: Frontend Deployment (environment variables)
- Referenced by: Backend Deployment (environment variables)

---

## Frontend Deployment

**Resource**: `todo-chatbot-frontend` (Deployment)

**Purpose**: Manages frontend (Next.js) pod replicas

**Attributes**:
- Name: `todo-chatbot-frontend`
- Namespace: `todo-app`
- Replicas: 2
- Selector: `app: todo-frontend`
- Strategy: RollingUpdate (maxSurge: 1, maxUnavailable: 0)

**Pod Template**:
- Image: `todo-frontend:latest`
- ImagePullPolicy: `Never`
- Container Port: 3000
- Environment Variables:
  - `NEXT_PUBLIC_API_URL` (from ConfigMap)
  - `NODE_ENV`: `production`
- Resources:
  - Requests: CPU 100m, Memory 128Mi
  - Limits: CPU 500m, Memory 512Mi
- Readiness Probe:
  - HTTP GET `/health` on port 3000
  - Initial Delay: 10s, Period: 10s
- Liveness Probe:
  - HTTP GET `/health` on port 3000
  - Initial Delay: 30s, Period: 30s

**Labels**:
- `app: todo-frontend`
- `app.kubernetes.io/name: todo-chatbot`
- `app.kubernetes.io/instance: todo-chatbot`

**Relationships**:
- Creates: 2 frontend pods
- Selected by: Frontend Service
- Mounts: ConfigMap for environment variables

---

## Frontend Service

**Resource**: `frontend-service` (Service)

**Purpose**: Provides stable network endpoint for frontend pods

**Attributes**:
- Name: `frontend-service`
- Namespace: `todo-app`
- Type: ClusterIP
- Selector: `app: todo-frontend`
- Ports:
  - Port: 3000 (service port)
  - TargetPort: 3000 (container port)
  - Protocol: TCP

**DNS Name**: `frontend-service.todo-app.svc.cluster.local` (or `frontend-service` within namespace)

**Relationships**:
- Selects: Pods created by Frontend Deployment
- Endpoints: 2 endpoints (one per pod)
- Accessed by: kubectl port-forward for external access
- Referenced in: Backend CORS configuration

---

## Backend Deployment

**Resource**: `todo-chatbot-backend` (Deployment)

**Purpose**: Manages backend (FastAPI) pod replicas

**Attributes**:
- Name: `todo-chatbot-backend`
- Namespace: `todo-app`
- Replicas: 2
- Selector: `app: todo-backend`
- Strategy: RollingUpdate (maxSurge: 1, maxUnavailable: 0)

**Pod Template**:
- Image: `todo-backend:latest`
- ImagePullPolicy: `Never`
- Container Port: 8000
- Environment Variables:
  - `CORS_ORIGINS` (from ConfigMap)
  - `PYTHONUNBUFFERED`: `1`
- Resources:
  - Requests: CPU 100m, Memory 128Mi
  - Limits: CPU 500m, Memory 512Mi
- Readiness Probe:
  - HTTP GET `/health` on port 8000
  - Initial Delay: 10s, Period: 10s
- Liveness Probe:
  - HTTP GET `/health` on port 8000
  - Initial Delay: 30s, Period: 30s

**Labels**:
- `app: todo-backend`
- `app.kubernetes.io/name: todo-chatbot`
- `app.kubernetes.io/instance: todo-chatbot`

**Relationships**:
- Creates: 2 backend pods
- Selected by: Backend Service
- Mounts: ConfigMap for environment variables

---

## Backend Service

**Resource**: `backend-service` (Service)

**Purpose**: Provides stable network endpoint for backend pods

**Attributes**:
- Name: `backend-service`
- Namespace: `todo-app`
- Type: ClusterIP
- Selector: `app: todo-backend`
- Ports:
  - Port: 8000 (service port)
  - TargetPort: 8000 (container port)
  - Protocol: TCP

**DNS Name**: `backend-service.todo-app.svc.cluster.local` (or `backend-service` within namespace)

**Relationships**:
- Selects: Pods created by Backend Deployment
- Endpoints: 2 endpoints (one per pod)
- Accessed by: kubectl port-forward for external access
- Referenced in: Frontend API URL configuration

---

## Pods (4 total)

### Frontend Pods (2)

**Resource**: `todo-chatbot-frontend-<random-id>` (Pod)

**Purpose**: Run frontend application containers

**Attributes**:
- Name: Generated by Deployment (e.g., `todo-chatbot-frontend-7d8f9c5b4-abc12`)
- Namespace: `todo-app`
- Status: Running
- Ready: 1/1
- Container: `frontend`
- Image: `todo-frontend:latest`
- Port: 3000

**Relationships**:
- Created by: Frontend Deployment
- Selected by: Frontend Service
- Reads from: ConfigMap

### Backend Pods (2)

**Resource**: `todo-chatbot-backend-<random-id>` (Pod)

**Purpose**: Run backend application containers

**Attributes**:
- Name: Generated by Deployment (e.g., `todo-chatbot-backend-6c7d8e9f0-xyz34`)
- Namespace: `todo-app`
- Status: Running
- Ready: 1/1
- Container: `backend`
- Image: `todo-backend:latest`
- Port: 8000

**Relationships**:
- Created by: Backend Deployment
- Selected by: Backend Service
- Reads from: ConfigMap

---

## Resource Relationships Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      Namespace: todo-app                     │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │         Helm Release: todo-chatbot                  │    │
│  │         (Manages all resources below)               │    │
│  └────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │              ConfigMap: todo-chatbot-config         │    │
│  │  - NEXT_PUBLIC_API_URL: http://backend-service:8000│    │
│  │  - CORS_ORIGINS: http://frontend-service:3000      │    │
│  └────────────────┬───────────────────┬────────────────┘    │
│                   │                   │                      │
│                   │ Env Vars          │ Env Vars            │
│                   ▼                   ▼                      │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │ Deployment:            │  │ Deployment:            │    │
│  │ todo-chatbot-frontend  │  │ todo-chatbot-backend   │    │
│  │ Replicas: 2            │  │ Replicas: 2            │    │
│  └────────┬───────────────┘  └────────┬───────────────┘    │
│           │ Creates                    │ Creates            │
│           ▼                            ▼                     │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │ Pod: frontend-xxx      │  │ Pod: backend-xxx       │    │
│  │ Image: todo-frontend   │  │ Image: todo-backend    │    │
│  │ Port: 3000             │  │ Port: 8000             │    │
│  │ Status: Running        │  │ Status: Running        │    │
│  └────────┬───────────────┘  └────────┬───────────────┘    │
│           │                            │                     │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │ Pod: frontend-yyy      │  │ Pod: backend-yyy       │    │
│  │ Image: todo-frontend   │  │ Image: todo-backend    │    │
│  │ Port: 3000             │  │ Port: 8000             │    │
│  │ Status: Running        │  │ Status: Running        │    │
│  └────────┬───────────────┘  └────────┬───────────────┘    │
│           │                            │                     │
│           │ Selected by                │ Selected by         │
│           ▼                            ▼                     │
│  ┌────────────────────────┐  ┌────────────────────────┐    │
│  │ Service:               │  │ Service:               │    │
│  │ frontend-service       │  │ backend-service        │    │
│  │ Type: ClusterIP        │  │ Type: ClusterIP        │    │
│  │ Port: 3000             │  │ Port: 8000             │    │
│  │ Endpoints: 2           │  │ Endpoints: 2           │    │
│  └────────────────────────┘  └────────────────────────┘    │
│           │                            │                     │
│           │ Accessed via               │ Accessed via        │
│           ▼                            ▼                     │
│  kubectl port-forward          kubectl port-forward         │
│  localhost:3000                localhost:8000                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Resource Counts

| Resource Type | Count | Names |
|---------------|-------|-------|
| Namespace | 1 | todo-app |
| Helm Release | 1 | todo-chatbot |
| ConfigMap | 1 | todo-chatbot-config |
| Deployment | 2 | todo-chatbot-frontend, todo-chatbot-backend |
| Service | 2 | frontend-service, backend-service |
| Pod | 4 | 2 frontend pods, 2 backend pods |
| **Total** | **11** | |

---

## Resource States

### Expected States After Successful Deployment

**Namespace**:
- Status: Active

**Helm Release**:
- Status: deployed
- Revision: 1

**ConfigMap**:
- Status: Active
- Data: 2 keys

**Deployments**:
- Available: True
- Replicas: 2/2 (desired/current/ready)
- Up-to-date: 2
- Available: 2

**Services**:
- Type: ClusterIP
- Cluster-IP: Assigned (e.g., 10.96.x.x)
- Endpoints: 2 (matching pod count)

**Pods**:
- Status: Running
- Ready: 1/1
- Restarts: 0
- Age: < 2 minutes

---

## Verification Commands

```bash
# View all resources
kubectl get all -n todo-app

# View specific resource types
kubectl get namespace todo-app
kubectl get configmap -n todo-app
kubectl get deployments -n todo-app
kubectl get services -n todo-app
kubectl get pods -n todo-app

# View Helm release
helm list -n todo-app
helm status todo-chatbot -n todo-app

# View resource details
kubectl describe deployment todo-chatbot-frontend -n todo-app
kubectl describe service frontend-service -n todo-app
kubectl describe pod <pod-name> -n todo-app

# View logs
kubectl logs -l app=todo-frontend -n todo-app
kubectl logs -l app=todo-backend -n todo-app
```

---

**Data Model Status**: ✅ Complete - All Kubernetes resources defined with relationships
