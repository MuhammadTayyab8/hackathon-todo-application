# Data Model: Docker Containerization

**Feature**: 001-docker-containerization
**Date**: 2026-01-31
**Purpose**: Define container entities and their relationships

## Overview

This feature introduces containerized deployment artifacts for the Todo application. The data model describes the container images, their configuration, and runtime behavior rather than database entities.

## Container Entities

### Frontend Container Image

**Description**: Containerized Next.js application serving the Todo chatbot UI

**Attributes**:
- **Base Image**: node:20-alpine
- **Build Type**: Multi-stage (deps → builder → runner)
- **Output Mode**: Standalone
- **Exposed Port**: 3000
- **User**: node (UID 1000)
- **Health Endpoint**: GET /health
- **Size Target**: < 200MB

**Environment Variables**:
| Variable | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| NEXT_PUBLIC_API_URL | Build/Runtime | Yes | Backend API URL | http://backend:8000 |
| BETTER_AUTH_SECRET | Runtime | Yes | JWT verification secret | <secret-key> |
| BETTER_AUTH_URL | Runtime | Yes | Frontend URL for auth | http://localhost:3000 |
| NODE_ENV | Runtime | No | Node environment | production |
| PORT | Runtime | No | Server port | 3000 |

**Build Stages**:
1. **deps**: Install production dependencies only
2. **builder**: Build Next.js application with standalone output
3. **runner**: Copy standalone output and serve

**File Structure in Container**:
```
/app/
├── .next/
│   └── standalone/     # Minimal production server
├── public/             # Static assets
├── node_modules/       # Only required runtime deps
└── package.json
```

**Lifecycle**:
- Build: npm ci → next build
- Start: node server.js
- Health: HTTP GET /health → 200 OK
- Shutdown: SIGTERM → graceful drain → exit

---

### Backend Container Image

**Description**: Containerized FastAPI application providing REST API for Todo operations

**Attributes**:
- **Base Image**: python:3.11-slim
- **Build Type**: Single-stage with system dependencies
- **Exposed Port**: 8000
- **User**: appuser (UID 1000)
- **Health Endpoint**: GET /health
- **Size Target**: < 300MB

**Environment Variables**:
| Variable | Type | Required | Description | Example |
|----------|------|----------|-------------|---------|
| DATABASE_URL | Runtime | Yes | PostgreSQL connection | postgresql://user:pass@host/db |
| BETTER_AUTH_SECRET | Runtime | Yes | JWT verification secret | <secret-key> |
| CORS_ORIGINS | Runtime | Yes | Allowed CORS origins | http://localhost:3000 |
| LOG_LEVEL | Runtime | No | Logging level | info |
| PORT | Runtime | No | Server port | 8000 |

**System Dependencies**:
- gcc (compile Python packages)
- libpq-dev (PostgreSQL client library)
- postgresql-client (optional, for debugging)

**Python Dependencies**: From requirements.txt
- fastapi, uvicorn (web framework)
- sqlmodel, sqlalchemy, asyncpg (database)
- python-jose, bcrypt (authentication)
- pytest, pytest-asyncio (testing)

**File Structure in Container**:
```
/app/
├── src/
│   ├── api/
│   ├── models/
│   ├── services/
│   ├── agents/
│   ├── mcp_server/
│   ├── db.py
│   └── main.py
├── requirements.txt
└── alembic.ini
```

**Lifecycle**:
- Build: pip install -r requirements.txt
- Start: uvicorn src.main:app --host 0.0.0.0 --port 8000
- Health: HTTP GET /health → 200 OK (with DB check)
- Shutdown: SIGTERM → graceful drain → exit

---

### Health Check Endpoint (Frontend)

**Description**: HTTP endpoint for container orchestration health monitoring

**Attributes**:
- **Path**: /health
- **Method**: GET
- **Authentication**: None (public endpoint)
- **Response Time**: < 1 second
- **Check Type**: Liveness (server is running)

**Response Schema**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T12:00:00Z",
  "service": "frontend",
  "version": "1.0.0"
}
```

**Status Codes**:
- 200 OK: Service is healthy
- 503 Service Unavailable: Service is unhealthy

**Implementation**: Next.js API route at /app/health/route.ts

---

### Health Check Endpoint (Backend)

**Description**: HTTP endpoint for container orchestration health monitoring with database connectivity check

**Attributes**:
- **Path**: /health
- **Method**: GET
- **Authentication**: None (public endpoint)
- **Response Time**: < 1 second
- **Check Type**: Readiness (server + database ready)

**Response Schema**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T12:00:00Z",
  "service": "backend",
  "version": "1.0.0",
  "database": "connected"
}
```

**Status Codes**:
- 200 OK: Service and database are healthy
- 503 Service Unavailable: Service or database is unhealthy

**Implementation**: FastAPI route in src/api/routes/ or src/main.py

---

### Docker Image Artifact

**Description**: Built container image stored in registry

**Attributes**:
- **Registry**: Docker Hub, ECR, GCR, or private registry
- **Tag Format**: `{service}:{version}` or `{service}:latest`
- **Layers**: Optimized for caching and minimal size
- **Metadata**: Labels for version, build date, commit SHA

**Tagging Strategy**:
- `frontend:latest` - Latest stable build
- `frontend:v1.0.0` - Semantic version
- `frontend:sha-abc123` - Git commit SHA
- `backend:latest` - Latest stable build
- `backend:v1.0.0` - Semantic version
- `backend:sha-abc123` - Git commit SHA

**Build Metadata** (Docker labels):
```dockerfile
LABEL org.opencontainers.image.version="1.0.0"
LABEL org.opencontainers.image.created="2026-01-31T12:00:00Z"
LABEL org.opencontainers.image.revision="abc123"
LABEL org.opencontainers.image.source="https://github.com/org/repo"
```

---

## Entity Relationships

```
┌─────────────────────┐
│  Frontend Container │
│   (Next.js App)     │
│   Port: 3000        │
└──────────┬──────────┘
           │
           │ HTTP Requests
           │ (NEXT_PUBLIC_API_URL)
           │
           ▼
┌─────────────────────┐
│  Backend Container  │
│   (FastAPI App)     │
│   Port: 8000        │
└──────────┬──────────┘
           │
           │ SQL Queries
           │ (DATABASE_URL)
           │
           ▼
┌─────────────────────┐
│  Neon PostgreSQL    │
│  (External Service) │
│  Not Containerized  │
└─────────────────────┘

┌─────────────────────┐
│ Container Registry  │
│  (Docker Hub/ECR)   │
└──────────┬──────────┘
           │
           │ Pull Images
           │
           ▼
┌─────────────────────┐
│ Orchestration       │
│ Platform            │
│ (Docker/K8s/ECS)    │
└─────────────────────┘
```

## Configuration Flow

1. **Build Time**:
   - Dockerfile defines build steps
   - .dockerignore excludes unnecessary files
   - Multi-stage build optimizes image size
   - Base images pulled from Docker Hub

2. **Runtime**:
   - Environment variables injected by orchestration platform
   - Containers start with non-root user
   - Health checks monitor container status
   - Logs output to stdout/stderr

3. **Network**:
   - Frontend → Backend: HTTP over container network
   - Backend → Database: PostgreSQL protocol over internet
   - External → Frontend: HTTP/HTTPS through load balancer

## State Management

**Stateless Containers**:
- No persistent data stored in containers
- All state in external database (Neon PostgreSQL)
- Containers can be destroyed and recreated without data loss

**Ephemeral Storage**:
- /tmp directory for temporary files
- .next/cache for Next.js build cache (optional)
- Cleared on container restart

**Persistent Storage** (if needed in future):
- Volume mounts for logs or uploads
- Not required for current implementation

## Security Considerations

**Non-Root Users**:
- Frontend: node (UID 1000)
- Backend: appuser (UID 1000)
- Prevents privilege escalation

**Secrets Management**:
- Environment variables for runtime secrets
- No secrets in Dockerfile or image layers
- Use orchestration platform secret management

**Network Security**:
- Containers communicate over private network
- Only necessary ports exposed
- CORS configured on backend

**Image Security**:
- Use official base images
- Scan for vulnerabilities
- Keep base images updated
- Minimal attack surface (slim/alpine images)

## Validation Rules

**Frontend Container**:
- Image size MUST be < 200MB
- MUST expose port 3000
- MUST run as non-root user
- Health check MUST respond in < 1 second
- MUST start in < 30 seconds

**Backend Container**:
- Image size MUST be < 300MB
- MUST expose port 8000
- MUST run as non-root user
- Health check MUST respond in < 1 second
- MUST start in < 30 seconds
- Health check MUST verify database connectivity

**Both Containers**:
- MUST handle SIGTERM gracefully
- MUST log to stdout/stderr
- MUST be reproducible builds
- MUST have no critical vulnerabilities
