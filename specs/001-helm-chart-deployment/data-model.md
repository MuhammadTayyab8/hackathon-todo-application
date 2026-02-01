# Data Model: Helm Chart Structure

**Feature**: 001-helm-chart-deployment
**Date**: 2026-02-01
**Purpose**: Define the structure of the Helm chart and Kubernetes resources

## Overview

For a Helm chart, the "data model" represents the structure of configuration values and Kubernetes resources. This document defines the chart's architecture and resource relationships.

## Chart Metadata

**Chart.yaml**:
```yaml
apiVersion: v2
name: todo-chatbot
description: Todo Chatbot with Next.js and FastAPI
type: application
version: 1.0.0
appVersion: "1.0"
keywords:
  - todo
  - chatbot
  - nextjs
  - fastapi
maintainers:
  - name: Todo App Team
```

**Attributes**:
- `apiVersion`: Helm chart API version (v2 for Helm 3)
- `name`: Chart name (must match directory name)
- `description`: Human-readable description
- `type`: application (vs library)
- `version`: Chart version (SemVer)
- `appVersion`: Application version being deployed

---

## Configuration Values Structure

**values.yaml** defines all configurable parameters:

### Frontend Configuration
```yaml
frontend:
  replicaCount: 2                    # Number of pod replicas
  image:
    repository: todo-frontend        # Image name
    tag: latest                      # Image tag
    pullPolicy: Never                # Pull policy (Never for Minikube)
  service:
    name: frontend-service           # Service name
    type: ClusterIP                  # Service type
    port: 3000                       # Service port
  resources:
    requests:
      cpu: 100m                      # Minimum CPU
      memory: 128Mi                  # Minimum memory
    limits:
      cpu: 500m                      # Maximum CPU
      memory: 512Mi                  # Maximum memory
  healthCheck:
    path: /health                    # Health check endpoint
    initialDelaySeconds: 10          # Wait before first check
    periodSeconds: 10                # Check interval
```

### Backend Configuration
```yaml
backend:
  replicaCount: 2                    # Number of pod replicas
  image:
    repository: todo-backend         # Image name
    tag: latest                      # Image tag
    pullPolicy: Never                # Pull policy (Never for Minikube)
  service:
    name: backend-service            # Service name
    type: ClusterIP                  # Service type
    port: 8000                       # Service port
  resources:
    requests:
      cpu: 100m                      # Minimum CPU
      memory: 128Mi                  # Minimum memory
    limits:
      cpu: 500m                      # Maximum CPU
      memory: 512Mi                  # Maximum memory
  healthCheck:
    path: /health                    # Health check endpoint
    initialDelaySeconds: 10          # Wait before first check
    periodSeconds: 10                # Check interval
```

### ConfigMap Configuration
```yaml
config:
  frontendApiUrl: http://backend-service:8000    # Backend URL for frontend
  backendCorsOrigins: http://frontend-service:3000  # CORS origins for backend
```

### Ingress Configuration
```yaml
ingress:
  enabled: false                     # Enable/disable Ingress
  className: nginx                   # Ingress controller class
  hostname: todo-app.local           # Hostname for Ingress
  paths:
    frontend: /                      # Path for frontend
    backend: /api                    # Path for backend
  tls:
    enabled: false                   # Enable TLS
    secretName: todo-app-tls         # TLS secret name
```

---

## Kubernetes Resources

### 1. Frontend Deployment

**Resource Type**: `apps/v1/Deployment`

**Purpose**: Manages frontend (Next.js) pod replicas

**Key Attributes**:
- `replicas`: Number of pods (from values.frontend.replicaCount)
- `selector`: Matches pods with labels `app: todo-frontend`
- `template`: Pod specification
  - `image`: todo-frontend:latest
  - `ports`: Container port 3000
  - `env`: Environment variables from ConfigMap
  - `resources`: CPU/memory requests and limits
  - `readinessProbe`: HTTP GET /health on port 3000
  - `livenessProbe`: HTTP GET /health on port 3000

**Labels**:
- `app: todo-frontend`
- `release: {{ .Release.Name }}`
- `chart: {{ .Chart.Name }}-{{ .Chart.Version }}`

**Relationships**:
- Creates pods with label `app: todo-frontend`
- Pods mount ConfigMap for environment variables
- Pods are selected by frontend-service

---

### 2. Frontend Service

**Resource Type**: `v1/Service`

**Purpose**: Provides stable network endpoint for frontend pods

**Key Attributes**:
- `type`: ClusterIP (internal only)
- `selector`: `app: todo-frontend` (matches deployment pods)
- `ports`:
  - `port`: 3000 (service port)
  - `targetPort`: 3000 (container port)
  - `protocol`: TCP

**DNS Name**: `frontend-service.default.svc.cluster.local` (or just `frontend-service` within namespace)

**Relationships**:
- Selects pods created by frontend-deployment
- Targeted by Ingress (if enabled)
- Referenced in backend CORS configuration

---

### 3. Backend Deployment

**Resource Type**: `apps/v1/Deployment`

**Purpose**: Manages backend (FastAPI) pod replicas

**Key Attributes**:
- `replicas`: Number of pods (from values.backend.replicaCount)
- `selector`: Matches pods with labels `app: todo-backend`
- `template`: Pod specification
  - `image`: todo-backend:latest
  - `ports`: Container port 8000
  - `env`: Environment variables from ConfigMap
  - `resources`: CPU/memory requests and limits
  - `readinessProbe`: HTTP GET /health on port 8000
  - `livenessProbe`: HTTP GET /health on port 8000

**Labels**:
- `app: todo-backend`
- `release: {{ .Release.Name }}`
- `chart: {{ .Chart.Name }}-{{ .Chart.Version }}`

**Relationships**:
- Creates pods with label `app: todo-backend`
- Pods mount ConfigMap for environment variables
- Pods are selected by backend-service

---

### 4. Backend Service

**Resource Type**: `v1/Service`

**Purpose**: Provides stable network endpoint for backend pods

**Key Attributes**:
- `type`: ClusterIP (internal only)
- `selector`: `app: todo-backend` (matches deployment pods)
- `ports`:
  - `port`: 8000 (service port)
  - `targetPort`: 8000 (container port)
  - `protocol`: TCP

**DNS Name**: `backend-service.default.svc.cluster.local` (or just `backend-service` within namespace)

**Relationships**:
- Selects pods created by backend-deployment
- Targeted by Ingress (if enabled)
- Referenced in frontend API URL configuration

---

### 5. ConfigMap

**Resource Type**: `v1/ConfigMap`

**Purpose**: Stores non-sensitive configuration for both services

**Key Attributes**:
- `data`:
  - `NEXT_PUBLIC_API_URL`: Backend service URL for frontend
  - `CORS_ORIGINS`: Frontend service URL for backend CORS

**Values**:
```yaml
data:
  NEXT_PUBLIC_API_URL: "http://backend-service:8000"
  CORS_ORIGINS: "http://frontend-service:3000"
```

**Relationships**:
- Mounted as environment variables in frontend-deployment
- Mounted as environment variables in backend-deployment

---

### 6. Ingress (Optional)

**Resource Type**: `networking.k8s.io/v1/Ingress`

**Purpose**: Routes external traffic to frontend and backend services

**Key Attributes**:
- `ingressClassName`: nginx (or other controller)
- `rules`:
  - `host`: todo-app.local
  - `paths`:
    - `/` → frontend-service:3000
    - `/api` → backend-service:8000

**Conditional**: Only created if `values.ingress.enabled: true`

**Relationships**:
- Routes traffic to frontend-service
- Routes traffic to backend-service
- Requires Ingress controller to be installed

---

## Resource Relationships Diagram

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

---

## Template Helpers

**_helpers.tpl** provides reusable template functions:

### Chart Name
```go
{{- define "todo-chatbot.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}
```

### Full Name
```go
{{- define "todo-chatbot.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
```

### Common Labels
```go
{{- define "todo-chatbot.labels" -}}
helm.sh/chart: {{ include "todo-chatbot.chart" . }}
{{ include "todo-chatbot.selectorLabels" . }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}
```

### Selector Labels
```go
{{- define "todo-chatbot.selectorLabels" -}}
app.kubernetes.io/name: {{ include "todo-chatbot.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

---

## Validation Rules

### Chart Validation
- Chart name must match directory name
- Version must be valid SemVer
- All required fields in Chart.yaml must be present

### Values Validation
- replicaCount must be >= 1
- Resource requests must be <= limits
- Ports must be valid (1-65535)
- Image pull policy must be: Always, IfNotPresent, or Never

### Resource Validation
- All resources must have valid apiVersion
- All resources must have valid kind
- Selectors must match pod labels
- Service ports must match container ports

---

## Configuration Examples

### Development (Minikube)
```yaml
frontend:
  replicaCount: 1
  image:
    pullPolicy: Never
backend:
  replicaCount: 1
  image:
    pullPolicy: Never
ingress:
  enabled: false
```

### Production (Cloud)
```yaml
frontend:
  replicaCount: 3
  image:
    pullPolicy: IfNotPresent
  resources:
    requests:
      cpu: 200m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 1Gi
backend:
  replicaCount: 3
  image:
    pullPolicy: IfNotPresent
  resources:
    requests:
      cpu: 200m
      memory: 256Mi
    limits:
      cpu: 1000m
      memory: 1Gi
ingress:
  enabled: true
  hostname: todo-app.example.com
  tls:
    enabled: true
```

---

**Data Model Status**: ✅ Complete - Chart structure and resources fully defined
