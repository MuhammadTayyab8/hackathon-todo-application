# Research: Docker Containerization Best Practices

**Feature**: 001-docker-containerization
**Date**: 2026-01-31
**Purpose**: Research Docker best practices for Next.js and FastAPI containerization

## Research Questions & Findings

### 1. Docker Multi-Stage Build Best Practices for Next.js

**Question**: How to optimize Next.js production builds in Docker with proper caching and minimal image size?

**Findings**:

**Decision**: Use Next.js standalone output mode with multi-stage build
- Next.js 16 supports `output: 'standalone'` in next.config.ts
- This creates a minimal production server with only required dependencies
- Reduces image size by ~80% compared to full node_modules

**Rationale**:
- Standalone mode includes only production dependencies
- Built-in server eliminates need for separate web server
- Automatic optimization for container environments

**Build Strategy**:
1. **Stage 1 (deps)**: Install dependencies only (cache layer)
2. **Stage 2 (builder)**: Build Next.js application
3. **Stage 3 (runner)**: Copy standalone output and run

**Caching Best Practices**:
- Copy package.json and package-lock.json first (separate layer)
- Run npm ci for reproducible builds
- Use .dockerignore to exclude node_modules, .next, .git

**Alternatives Considered**:
- Standard build: Larger image size (500MB+), includes dev dependencies
- nginx + static export: Doesn't support API routes or SSR
- **Rejected because**: Standalone mode provides best balance of size and functionality

---

### 2. Python FastAPI Container Optimization

**Question**: What are the best practices for Python slim images with FastAPI, asyncpg, and cryptography?

**Findings**:

**Decision**: Use python:3.11-slim with system dependencies for asyncpg and cryptography

**System Dependencies Required**:
```dockerfile
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*
```

**Rationale**:
- `gcc`: Required to compile Python packages with C extensions
- `libpq-dev`: PostgreSQL client library for asyncpg
- `postgresql-client`: Optional, useful for debugging
- Clean up apt cache to reduce image size

**Virtual Environment Decision**: Use system-wide installation
- In containers, isolation is already provided by the container
- Virtual environments add unnecessary overhead
- Simpler Dockerfile without venv activation

**Alternatives Considered**:
- python:3.11-alpine: Smaller base but requires more build dependencies, compilation issues
- python:3.11 (full): Larger image (900MB+), includes unnecessary packages
- **Rejected because**: Slim provides best balance of size and compatibility

---

### 3. Health Check Endpoint Patterns

**Question**: What are the standard patterns for health check endpoints in containerized applications?

**Findings**:

**Decision**: Implement `/health` endpoint with JSON response and appropriate status codes

**Response Format**:
```json
{
  "status": "healthy",
  "timestamp": "2026-01-31T12:00:00Z",
  "service": "frontend|backend",
  "version": "1.0.0"
}
```

**Status Codes**:
- 200 OK: Service is healthy
- 503 Service Unavailable: Service is unhealthy (database down, etc.)

**Health Check Levels**:
1. **Liveness**: Is the application running? (always return 200 if server responds)
2. **Readiness**: Is the application ready to serve traffic? (check dependencies)

**For This Implementation**:
- Frontend: Simple liveness check (server is running)
- Backend: Readiness check (verify database connection is available)

**Rationale**:
- Standard format recognized by orchestration platforms
- Timestamp helps with debugging
- Version helps track deployments
- Separate liveness/readiness allows graceful startup

**Alternatives Considered**:
- Plain text response: Less structured, harder to parse
- Deep health checks: Too slow for frequent polling
- **Rejected because**: JSON with basic checks provides best balance

---

### 4. Non-Root User Security

**Question**: How to properly create and use non-root users in Node and Python containers?

**Findings**:

**Decision**: Use built-in `node` user (Node.js) and create `appuser` (Python)

**Node.js (Alpine)**:
- Alpine node:20-alpine includes `node` user (UID 1000)
- Use `USER node` directive
- Ensure file ownership: `COPY --chown=node:node`

**Python (Slim)**:
- Create non-root user: `RUN useradd -m -u 1000 appuser`
- Use `USER appuser` directive
- Ensure file ownership: `COPY --chown=appuser:appuser`

**File Permissions**:
- Application code: Read-only (755 for directories, 644 for files)
- Writable directories: /tmp, /app/.next/cache (if needed)
- No write access to application code directory

**Rationale**:
- Principle of least privilege
- Prevents container escape vulnerabilities
- Required by many security policies (PCI-DSS, SOC2)
- Standard practice in production environments

**Alternatives Considered**:
- Run as root: Security risk, not acceptable for production
- Random UID: Less predictable, harder to debug
- **Rejected because**: Standard UIDs (1000) are well-understood and compatible

---

### 5. Environment Variable Configuration

**Question**: How to handle Next.js NEXT_PUBLIC_ prefix and runtime vs build-time variables?

**Findings**:

**Decision**: Use NEXT_PUBLIC_ prefix for client-side variables, runtime ENV for server-side

**Next.js Environment Variables**:
- `NEXT_PUBLIC_*`: Embedded at build time, available in browser
- Regular ENV: Available only on server-side at runtime
- For containers: Pass `NEXT_PUBLIC_API_URL` at build time or use runtime configuration

**Runtime Configuration Strategy**:
- Use environment variables at container startup
- Next.js standalone mode supports runtime env vars
- No rebuild required for environment changes

**Backend Environment Variables**:
- All variables read at runtime
- No build-time embedding
- Use .env file or container orchestration secrets

**Required Variables**:

Frontend:
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., http://backend:8000)
- `BETTER_AUTH_SECRET`: Shared secret for JWT verification
- `BETTER_AUTH_URL`: Frontend URL for auth callbacks

Backend:
- `DATABASE_URL`: PostgreSQL connection string
- `BETTER_AUTH_SECRET`: Shared secret for JWT verification
- `CORS_ORIGINS`: Allowed CORS origins

**Rationale**:
- Separates build-time and runtime configuration
- Allows same image to run in multiple environments
- Follows 12-factor app principles

**Alternatives Considered**:
- Hardcode values: Not flexible, requires rebuild for changes
- Config files: Less standard for containers, harder to manage
- **Rejected because**: Environment variables are container standard

---

### 6. Graceful Shutdown Handling

**Question**: How to handle SIGTERM signals for graceful shutdown in Next.js and FastAPI?

**Findings**:

**Decision**: Use default signal handling (both frameworks support SIGTERM natively)

**Next.js**:
- Next.js standalone server handles SIGTERM automatically
- Drains existing connections before shutdown
- No additional configuration required

**FastAPI/Uvicorn**:
- Uvicorn handles SIGTERM by default
- Graceful shutdown timeout: 30 seconds (configurable)
- Use `--timeout-graceful-shutdown` flag if needed

**Container Configuration**:
- Docker default stop timeout: 10 seconds
- Kubernetes default termination grace period: 30 seconds
- Both are sufficient for typical web applications

**Best Practices**:
- Don't use `SIGKILL` (immediate termination)
- Allow time for connection draining
- Log shutdown events for debugging

**Rationale**:
- Both frameworks have built-in graceful shutdown
- No custom signal handlers needed
- Standard container behavior

**Alternatives Considered**:
- Custom signal handlers: Unnecessary complexity
- Immediate shutdown: Drops active connections
- **Rejected because**: Default behavior is sufficient and well-tested

---

## Summary of Key Decisions

| Aspect | Decision | Rationale |
|--------|----------|-----------|
| Frontend Base Image | node:20-alpine | Minimal size, official support |
| Frontend Build | Multi-stage with standalone output | 80% size reduction |
| Backend Base Image | python:3.11-slim | Balance of size and compatibility |
| Backend Dependencies | System-wide installation | Simpler, container provides isolation |
| Health Checks | JSON response at /health | Standard format, orchestration compatible |
| User Security | Non-root users (node, appuser) | Security best practice, least privilege |
| Environment Config | Runtime environment variables | Flexibility, 12-factor app compliance |
| Graceful Shutdown | Default framework handling | Built-in support, no custom code needed |

## Implementation Notes

1. **Build Order**: Backend first (simpler), then frontend (more complex)
2. **Testing**: Test each container independently before integration
3. **Documentation**: Document all required environment variables
4. **Security**: Scan images for vulnerabilities before deployment
5. **Optimization**: Measure image sizes and build times against success criteria

## References

- Next.js Docker documentation: https://nextjs.org/docs/deployment#docker-image
- FastAPI deployment guide: https://fastapi.tiangolo.com/deployment/docker/
- Docker best practices: https://docs.docker.com/develop/dev-best-practices/
- 12-factor app methodology: https://12factor.net/
