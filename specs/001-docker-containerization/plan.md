# Implementation Plan: Docker Containerization

**Branch**: `001-docker-containerization` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-docker-containerization/spec.md`

## Summary

Create production-ready Docker containers for the Next.js frontend and FastAPI backend of the Todo application. The implementation will provide multi-stage Dockerfiles optimized for size and security, with health check endpoints, proper environment variable configuration, and .dockerignore files to exclude unnecessary files. This enables consistent development environments, simplified deployment, and container orchestration platform compatibility.

## Technical Context

**Language/Version**:
- Frontend: Node.js 20 (Next.js 16.1.1)
- Backend: Python 3.11

**Primary Dependencies**:
- Frontend: Next.js 16, React 19, Better Auth, OpenAI ChatKit, Tailwind CSS
- Backend: FastAPI, SQLModel, SQLAlchemy, asyncpg, uvicorn, python-jose, bcrypt

**Storage**: Neon PostgreSQL (external, not containerized)

**Testing**:
- Frontend: Next.js built-in testing
- Backend: pytest, pytest-asyncio

**Target Platform**:
- Development: Docker Desktop (Windows/Mac/Linux)
- Production: Container orchestration platforms (Docker Compose, Kubernetes, ECS, etc.)

**Project Type**: Web application (frontend + backend monorepo)

**Performance Goals**:
- Frontend container image < 200MB
- Backend container image < 300MB
- Container startup time < 30 seconds
- Health check response < 1 second
- Build time < 5 minutes

**Constraints**:
- Must run as non-root user for security
- Must support graceful shutdown (SIGTERM)
- Must log to stdout/stderr for orchestration compatibility
- Must be reproducible builds
- Zero security vulnerabilities in base images

**Scale/Scope**:
- 2 containers (frontend + backend)
- 2 Dockerfiles
- 2 .dockerignore files
- 2 health check endpoints (1 new for frontend)
- Environment variable configuration for both services

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Initial Check (Before Phase 0)

- [x] **SDD**: Sequence followed (Constitution → Spec → Plan → Tasks)? ✅ Yes, spec created first
- [x] **Phase**: Change allowed in active phase (Phase 2)? ✅ Yes, containerization is infrastructure work compatible with Phase 2
- [x] **Stack**: Using Next.js 16+, FastAPI, SQLModel, Neon DB? ✅ Yes, existing stack unchanged
- [x] **Security**: JWT verification required for all new endpoints? ✅ N/A - no new API endpoints, only health checks
- [x] **Scoping**: Data access scoped to user via `user_id` from JWT? ✅ N/A - no data access changes
- [x] **API**: URL follows `/api/{user_id}/tasks` pattern? ✅ N/A - no new API routes
- [x] **Persistence**: Database access ONLY via backend API? ✅ Yes, unchanged
- [x] **Secrets**: No secrets stored on frontend? ✅ Yes, only NEXT_PUBLIC_API_URL environment variable

**Initial Result**: ✅ PASSED

### Post-Design Check (After Phase 1)

- [x] **SDD**: Design artifacts created (research.md, data-model.md, contracts/, quickstart.md)? ✅ Yes, all Phase 1 deliverables complete
- [x] **Phase**: Design still compatible with Phase 2? ✅ Yes, infrastructure only
- [x] **Stack**: No new technologies introduced? ✅ Correct - only Docker containers for existing stack
- [x] **Security**: Health check endpoints are public (no auth)? ✅ Acceptable - standard practice for health checks
- [x] **Scoping**: No user data exposed in health checks? ✅ Correct - only service status returned
- [x] **API**: Health check endpoints don't follow user-scoped pattern? ✅ Acceptable - health checks are infrastructure endpoints
- [x] **Persistence**: Containers remain stateless, database external? ✅ Yes, Neon PostgreSQL remains external
- [x] **Secrets**: Environment variables properly configured? ✅ Yes, secrets via env vars, not in images

**Post-Design Result**: ✅ PASSED - Design maintains all constitution principles. Health check endpoints are infrastructure-level and don't require authentication, which is standard practice.

**Final Constitution Check**: ✅ PASSED - This feature is ready for task breakdown.

## Project Structure

### Documentation (this feature)

```text
specs/001-docker-containerization/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (Docker best practices)
├── data-model.md        # Phase 1 output (Container entities)
├── quickstart.md        # Phase 1 output (How to build and run)
├── contracts/           # Phase 1 output (Health check API specs)
│   ├── frontend-health.yaml
│   └── backend-health.yaml
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
# Web application structure (frontend + backend)
backend/
├── src/
│   ├── api/
│   │   ├── routes/
│   │   │   ├── auth.py
│   │   │   ├── tasks.py
│   │   │   ├── categories.py
│   │   │   └── chat.py
│   │   └── middleware/
│   ├── models/
│   ├── services/
│   ├── agents/
│   ├── mcp_server/
│   ├── db.py
│   └── main.py          # FastAPI entry point
├── requirements.txt     # Python dependencies
├── Dockerfile           # ⭐ NEW: Backend container definition
├── .dockerignore        # ⭐ NEW: Backend build exclusions
└── .env.example

frontend/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (main)/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   └── proxy.ts
├── public/
├── package.json         # Node.js dependencies
├── package-lock.json
├── Dockerfile           # ⭐ NEW: Frontend container definition
├── .dockerignore        # ⭐ NEW: Frontend build exclusions
└── .env.local

# Root level (optional orchestration - OUT OF SCOPE for this feature)
# docker-compose.yml     # NOT created in this feature
# .github/workflows/     # NOT created in this feature
```

**Structure Decision**: This is a web application monorepo with separate frontend and backend directories. Each service will have its own Dockerfile and .dockerignore file at the service root level. The containers will be built independently and can communicate over a network using environment variables for configuration.

## Complexity Tracking

> **No violations** - This feature follows all constitution principles and doesn't introduce additional complexity.

## Phase 0: Research & Discovery

### Research Questions

1. **Docker Multi-Stage Build Best Practices for Next.js**
   - How to optimize Next.js production builds in Docker
   - Best practices for caching node_modules layers
   - Standalone output mode vs standard build

2. **Python FastAPI Container Optimization**
   - Best practices for Python slim images
   - System dependencies required for asyncpg and cryptography
   - Virtual environment vs system-wide installation in containers

3. **Health Check Endpoint Patterns**
   - Standard health check response formats
   - Database connection verification in health checks
   - Kubernetes/Docker health check best practices

4. **Non-Root User Security**
   - Creating and using non-root users in Node and Python containers
   - File permission considerations
   - Security implications and best practices

5. **Environment Variable Configuration**
   - Next.js NEXT_PUBLIC_ prefix requirements
   - Runtime vs build-time environment variables
   - Secrets management in containers

6. **Graceful Shutdown Handling**
   - SIGTERM signal handling in Next.js
   - FastAPI/uvicorn graceful shutdown
   - Connection draining best practices

### Research Outputs

See [research.md](./research.md) for detailed findings and decisions.

## Phase 1: Design & Contracts

### Data Model

See [data-model.md](./data-model.md) for container entity definitions.

**Key Entities**:
- Frontend Container Image
- Backend Container Image
- Health Check Endpoint (Frontend)
- Health Check Endpoint (Backend)
- Environment Configuration

### API Contracts

See [contracts/](./contracts/) directory for health check endpoint specifications.

**New Endpoints**:
- `GET /health` (Frontend) - Returns Next.js application health status
- `GET /health` (Backend) - Returns FastAPI application health status (may already exist)

### Quickstart Guide

See [quickstart.md](./quickstart.md) for build and run instructions.

## Phase 2: Task Breakdown

Task breakdown will be generated by the `/sp.tasks` command after this plan is approved.

**Expected Task Categories**:
1. Backend Dockerfile creation
2. Backend .dockerignore creation
3. Backend health check endpoint (if not exists)
4. Frontend Dockerfile creation
5. Frontend .dockerignore creation
6. Frontend health check endpoint
7. Testing and validation
8. Documentation updates

## Implementation Strategy

### Build Order

1. **Backend First** (Priority: P1)
   - Backend is simpler (single-stage possible)
   - Backend health check may already exist
   - Backend has fewer build-time complexities

2. **Frontend Second** (Priority: P1)
   - Frontend requires multi-stage build
   - Frontend needs health check endpoint added
   - Frontend has more optimization opportunities

3. **Integration Testing** (Priority: P1)
   - Test both containers together
   - Verify network communication
   - Validate environment variable configuration

### Testing Strategy

**Unit Testing**:
- Health check endpoints return correct status codes
- Health check endpoints return valid JSON
- Environment variables are correctly read

**Integration Testing**:
- Build both containers successfully
- Start both containers with proper environment variables
- Frontend can reach backend API
- Health checks respond correctly
- Containers handle SIGTERM gracefully

**Performance Testing**:
- Measure image sizes (must meet success criteria)
- Measure build times (must be under 5 minutes)
- Measure startup times (must be under 30 seconds)
- Measure health check response times (must be under 1 second)

### Rollout Plan

1. **Development Environment** (P1)
   - Developers can build and run containers locally
   - Verify functionality matches non-containerized version

2. **CI/CD Integration** (P3 - Out of scope for this feature)
   - Automated container builds on code changes
   - Push to container registry
   - Automated testing

3. **Production Deployment** (P2 - Deployment config out of scope)
   - Containers can be deployed to orchestration platform
   - Health checks integrated with platform
   - Environment variables configured per environment

## Dependencies & Prerequisites

**Required Before Implementation**:
- Docker installed on development machine
- Access to backend source code and requirements.txt
- Access to frontend source code and package.json
- Understanding of current application startup process
- Knowledge of required environment variables

**External Dependencies**:
- Node.js 20 base image (node:20-alpine)
- Python 3.11 base image (python:3.11-slim)
- Docker build tools
- Container registry (for distribution, not required for local development)

## Risk Assessment

**Low Risk**:
- Dockerfiles are additive (don't modify existing code)
- Can be tested locally before deployment
- Easy to rollback (just don't use containers)

**Medium Risk**:
- Environment variable configuration differences between local and container
- File permission issues with non-root users
- Network configuration for container-to-container communication

**Mitigation Strategies**:
- Thorough testing in development environment
- Document all required environment variables
- Use .env.example files as templates
- Test with same user permissions as production

## Success Metrics

From specification success criteria:

- ✅ Frontend container image size < 200MB
- ✅ Backend container image size < 300MB
- ✅ Container startup time < 30 seconds
- ✅ Health check response time < 1 second
- ✅ Build time < 5 minutes
- ✅ Containers work on any machine with Docker
- ✅ Application functions identically in containers
- ✅ Compatible with any orchestration platform
- ✅ Containers restart successfully after crashes
- ✅ Zero security vulnerabilities in base images

## Next Steps

1. Review and approve this implementation plan
2. Run `/sp.tasks` to generate detailed task breakdown
3. Begin implementation starting with backend Dockerfile
4. Test each component as it's completed
5. Perform integration testing with both containers
6. Update documentation with container usage instructions
