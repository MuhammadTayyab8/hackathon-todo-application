# Quickstart Guide: Docker Containerization

**Feature**: 001-docker-containerization
**Date**: 2026-01-31
**Purpose**: Instructions for building and running containerized Todo application

## Prerequisites

- Docker Desktop installed (Windows/Mac) or Docker Engine (Linux)
- Docker version 20.10 or higher
- Git repository cloned locally
- Basic understanding of Docker commands

## Quick Start

### 1. Build Both Containers

```bash
# Build backend container
cd backend
docker build -t todo-backend:latest .

# Build frontend container
cd ../frontend
docker build -t todo-frontend:latest .
```

### 2. Run Containers with Docker

```bash
# Run backend container
docker run -d \
  --name todo-backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host/db" \
  -e BETTER_AUTH_SECRET="your-secret-key" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

# Run frontend container
docker run -d \
  --name todo-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e BETTER_AUTH_SECRET="your-secret-key" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest
```

### 3. Verify Health

```bash
# Check backend health
curl http://localhost:8000/health

# Check frontend health
curl http://localhost:3000/health

# Expected response:
# {"status":"healthy","timestamp":"2026-01-31T12:00:00Z","service":"backend|frontend","version":"1.0.0"}
```

### 4. Access Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- Backend Docs: http://localhost:8000/docs

## Detailed Instructions

### Backend Container

#### Build Backend

```bash
cd backend

# Build with default tag
docker build -t todo-backend:latest .

# Build with specific version
docker build -t todo-backend:v1.0.0 .

# Build with build arguments (if needed)
docker build --build-arg PYTHON_VERSION=3.11 -t todo-backend:latest .
```

#### Run Backend

**Minimum Configuration**:
```bash
docker run -d \
  --name todo-backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@neon.tech/db" \
  -e BETTER_AUTH_SECRET="your-secret-key" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest
```

**Full Configuration**:
```bash
docker run -d \
  --name todo-backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@neon.tech/db" \
  -e BETTER_AUTH_SECRET="your-secret-key" \
  -e CORS_ORIGINS="http://localhost:3000,https://app.example.com" \
  -e LOG_LEVEL="info" \
  -e PORT="8000" \
  --restart unless-stopped \
  --health-cmd="curl -f http://localhost:8000/health || exit 1" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  todo-backend:latest
```

#### Backend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| DATABASE_URL | Yes | - | PostgreSQL connection string |
| BETTER_AUTH_SECRET | Yes | - | JWT verification secret |
| CORS_ORIGINS | Yes | - | Comma-separated allowed origins |
| LOG_LEVEL | No | info | Logging level (debug, info, warning, error) |
| PORT | No | 8000 | Server port |

#### Backend Logs

```bash
# View logs
docker logs todo-backend

# Follow logs
docker logs -f todo-backend

# Last 100 lines
docker logs --tail 100 todo-backend
```

---

### Frontend Container

#### Build Frontend

```bash
cd frontend

# Build with default tag
docker build -t todo-frontend:latest .

# Build with specific version
docker build -t todo-frontend:v1.0.0 .

# Build with build arguments
docker build \
  --build-arg NEXT_PUBLIC_API_URL="http://backend:8000" \
  -t todo-frontend:latest .
```

#### Run Frontend

**Minimum Configuration**:
```bash
docker run -d \
  --name todo-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e BETTER_AUTH_SECRET="your-secret-key" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest
```

**Full Configuration**:
```bash
docker run -d \
  --name todo-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e BETTER_AUTH_SECRET="your-secret-key" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  -e NODE_ENV="production" \
  -e PORT="3000" \
  --restart unless-stopped \
  --health-cmd="curl -f http://localhost:3000/health || exit 1" \
  --health-interval=30s \
  --health-timeout=3s \
  --health-retries=3 \
  todo-frontend:latest
```

#### Frontend Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| NEXT_PUBLIC_API_URL | Yes | - | Backend API URL |
| BETTER_AUTH_SECRET | Yes | - | JWT verification secret |
| BETTER_AUTH_URL | Yes | - | Frontend URL for auth callbacks |
| NODE_ENV | No | production | Node environment |
| PORT | No | 3000 | Server port |

#### Frontend Logs

```bash
# View logs
docker logs todo-frontend

# Follow logs
docker logs -f todo-frontend

# Last 100 lines
docker logs --tail 100 todo-frontend
```

---

## Container Management

### Stop Containers

```bash
# Stop backend
docker stop todo-backend

# Stop frontend
docker stop todo-frontend

# Stop both
docker stop todo-backend todo-frontend
```

### Start Containers

```bash
# Start backend
docker start todo-backend

# Start frontend
docker start todo-frontend

# Start both
docker start todo-backend todo-frontend
```

### Restart Containers

```bash
# Restart backend
docker restart todo-backend

# Restart frontend
docker restart todo-frontend
```

### Remove Containers

```bash
# Remove backend (must be stopped first)
docker rm todo-backend

# Remove frontend (must be stopped first)
docker rm todo-frontend

# Force remove (stops and removes)
docker rm -f todo-backend todo-frontend
```

### View Container Status

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View container details
docker inspect todo-backend
docker inspect todo-frontend
```

---

## Networking

### Container-to-Container Communication

When running both containers on the same Docker network:

```bash
# Create a custom network
docker network create todo-network

# Run backend on the network
docker run -d \
  --name todo-backend \
  --network todo-network \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@neon.tech/db" \
  -e BETTER_AUTH_SECRET="your-secret-key" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

# Run frontend on the same network
docker run -d \
  --name todo-frontend \
  --network todo-network \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://todo-backend:8000" \
  -e BETTER_AUTH_SECRET="your-secret-key" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest
```

**Note**: When using a custom network, containers can communicate using container names as hostnames.

---

## Troubleshooting

### Container Won't Start

**Symptoms**: Container exits immediately after starting

**Solutions**:
```bash
# Check logs for errors
docker logs todo-backend
docker logs todo-frontend

# Check container status and exit code
docker ps -a
docker inspect todo-backend --format='{{.State.ExitCode}}'

# Common issues:
# - Exit code 1: Application error (check logs)
# - Exit code 137: Out of memory (increase memory limit)
# - Exit code 139: Segmentation fault (check dependencies)

# Inspect full container configuration
docker inspect todo-backend
```

**Common Causes**:
- Missing or invalid environment variables
- Database connection failure
- Port already in use
- Insufficient memory/resources

### Build Failures

**Symptoms**: Docker build command fails

**Solutions**:
```bash
# Check Docker daemon is running
docker info

# Check network connectivity
ping registry-1.docker.io

# Build with verbose output
docker build --progress=plain -t todo-backend:latest backend/

# Build without cache to force fresh build
docker build --no-cache -t todo-backend:latest backend/

# Check disk space
docker system df
docker system prune  # Clean up if needed
```

**Common Causes**:
- Network connectivity issues (can't pull base images)
- Insufficient disk space
- Corrupted build cache
- Missing files (check .dockerignore isn't too aggressive)

### Health Check Failing

**Symptoms**: Container shows as unhealthy in `docker ps`

**Solutions**:
```bash
# Check health status
docker inspect --format='{{json .State.Health}}' todo-backend

# Manually test health endpoint from inside container
docker exec todo-backend curl http://localhost:8000/health

# Check if port is accessible from host
curl http://localhost:8000/health

# Check if application is listening on correct port
docker exec todo-backend netstat -tlnp

# View health check logs
docker inspect todo-backend --format='{{range .State.Health.Log}}{{.Output}}{{end}}'
```

**Common Causes**:
- Application not fully started yet (increase health check interval)
- Database connection failing
- Wrong port in health check command
- Application crashed after starting

### Environment Variables Not Working

**Symptoms**: Application can't find configuration

**Solutions**:
```bash
# Verify environment variables are set in container
docker exec todo-backend env | grep DATABASE_URL
docker exec todo-frontend env | grep NEXT_PUBLIC_API_URL

# Check if variables are being read by application
docker logs todo-backend | grep -i "database"
docker logs todo-frontend | grep -i "api"

# Restart container with correct variables
docker stop todo-backend
docker rm todo-backend
docker run -d --name todo-backend -p 8000:8000 \
  -e DATABASE_URL="correct-value" \
  -e BETTER_AUTH_SECRET="correct-value" \
  todo-backend:latest
```

**Common Causes**:
- Typo in environment variable name
- Missing quotes around values with special characters
- Variables not passed to `docker run` command
- Frontend variables must start with `NEXT_PUBLIC_` to be accessible

### Permission Errors

**Symptoms**: "Permission denied" errors in logs

**Solutions**:
```bash
# Check if running as non-root user
docker exec todo-backend whoami
# Should output: appuser

docker exec todo-frontend whoami
# Should output: node

# Check file permissions
docker exec todo-backend ls -la /app

# If permissions are wrong, rebuild with correct ownership
# Backend Dockerfile should have:
# RUN chown -R appuser:appuser /app
# USER appuser

# Frontend Dockerfile should have:
# COPY --from=builder --chown=node:node /app/.next/standalone ./
# USER node
```

**Common Causes**:
- Files not owned by the non-root user
- Trying to write to read-only filesystem
- Volume mounts with wrong permissions

### Network Connectivity Issues

**Symptoms**: Frontend can't reach backend, or backend can't reach database

**Solutions**:
```bash
# Test backend from host
curl http://localhost:8000/health

# Test backend from frontend container
docker exec todo-frontend curl http://todo-backend:8000/health

# Check if containers are on same network
docker network inspect bridge

# Create custom network for better isolation
docker network create todo-network
docker run --network todo-network --name todo-backend ...
docker run --network todo-network --name todo-frontend ...

# Test external database connection from backend
docker exec todo-backend curl -v telnet://neon.tech:5432

# Check DNS resolution
docker exec todo-backend nslookup neon.tech
```

**Common Causes**:
- Containers not on same network
- Wrong hostname (use container name, not localhost)
- Firewall blocking connections
- Database not accessible from container IP

### Port Already in Use

**Symptoms**: "bind: address already in use" error

**Solutions**:
```bash
# Check what's using the port
# Windows:
netstat -ano | findstr :8000
netstat -ano | findstr :3000

# Linux/Mac:
lsof -i :8000
lsof -i :3000

# Stop existing container using the port
docker ps
docker stop <container-id>

# Or use different port
docker run -p 8001:8000 todo-backend:latest
```

### Database Connection Errors

**Symptoms**: Backend health check fails with database error

**Solutions**:
```bash
# Check database URL format
# Correct: postgresql://user:pass@host.neon.tech/dbname
# Wrong: postgresql://user:pass@host.neon.tech/dbname?sslmode=require

# Test database connection from container
docker exec todo-backend python -c "
import asyncpg
import asyncio
async def test():
    conn = await asyncpg.connect('postgresql://...')
    print('Connected!')
    await conn.close()
asyncio.run(test())
"

# Check if database allows connections from container IP
# May need to whitelist container IP in database firewall
```

**Common Causes**:
- Invalid DATABASE_URL format
- Database firewall blocking container IP
- Wrong credentials
- Database not accessible from internet (if using cloud database)

### Container Logs Show No Output

**Symptoms**: `docker logs` shows nothing

**Solutions**:
```bash
# Check if container is still running
docker ps -a

# Check if application is writing to stdout/stderr
# Python: Use print() or logging to stdout
# Node: Use console.log()

# For Python, ensure PYTHONUNBUFFERED=1 is set
docker run -e PYTHONUNBUFFERED=1 todo-backend:latest

# Attach to container to see live output
docker attach todo-backend
```

### Image Size Too Large

**Symptoms**: Images exceed target sizes (backend > 300MB, frontend > 200MB)

**Solutions**:
```bash
# Check current image sizes
docker images | grep todo

# Analyze image layers
docker history todo-backend:latest
docker history todo-frontend:latest

# Use dive tool for detailed analysis
dive todo-backend:latest

# Optimization tips:
# - Use alpine base images where possible
# - Combine RUN commands to reduce layers
# - Clean up package manager caches
# - Use multi-stage builds (already implemented)
# - Remove unnecessary files in same layer they're created
```

### Slow Build Times

**Symptoms**: Builds take longer than 5 minutes

**Solutions**:
```bash
# Use BuildKit for better caching
export DOCKER_BUILDKIT=1
docker build -t todo-backend:latest backend/

# Check build cache usage
docker builder prune  # Clear old cache

# Optimize Dockerfile layer order
# - Put frequently changing files (source code) last
# - Put rarely changing files (dependencies) first

# Use .dockerignore to exclude unnecessary files
# Check .dockerignore includes:
# - node_modules/
# - .git/
# - .venv/
# - __pycache__/
```

### Container Restarts Continuously

**Symptoms**: Container keeps restarting in `docker ps`

**Solutions**:
```bash
# Check restart policy
docker inspect todo-backend --format='{{.HostConfig.RestartPolicy}}'

# View recent logs to see crash reason
docker logs --tail 50 todo-backend

# Run without restart policy to debug
docker run --rm -it todo-backend:latest

# Common causes:
# - Application crashes on startup
# - Health check failing repeatedly
# - Out of memory
```

---

## Performance Optimization

### Image Size

```bash
# Check image sizes
docker images | grep todo

# Expected sizes:
# todo-frontend:latest  ~150-200MB
# todo-backend:latest   ~250-300MB
```

### Build Cache

```bash
# Build without cache (clean build)
docker build --no-cache -t todo-backend:latest .

# Prune build cache
docker builder prune
```

### Resource Limits

```bash
# Run with memory limit
docker run -d \
  --name todo-backend \
  --memory="512m" \
  --cpus="1.0" \
  -p 8000:8000 \
  -e DATABASE_URL="..." \
  todo-backend:latest
```

---

## Security Best Practices

### Secrets Management

**Don't**:
- Hardcode secrets in Dockerfile
- Commit .env files with real secrets
- Use default/weak secrets

**Do**:
- Use environment variables
- Use Docker secrets (Swarm) or Kubernetes secrets
- Rotate secrets regularly
- Use strong, random secrets

### Scanning for Vulnerabilities

```bash
# Scan images for vulnerabilities (requires Docker Scout or similar)
docker scout cves todo-backend:latest
docker scout cves todo-frontend:latest

# Or use Trivy
trivy image todo-backend:latest
trivy image todo-frontend:latest
```

---

## CI/CD Integration

### Container Tagging Strategy

Use semantic versioning and commit-based tags for traceability:

```bash
# Latest tag (for development)
docker build -t todo-backend:latest .
docker build -t todo-frontend:latest .

# Version tag (for releases)
docker build -t todo-backend:v1.0.0 .
docker build -t todo-frontend:v1.0.0 .

# Commit SHA tag (for traceability)
docker build -t todo-backend:$(git rev-parse --short HEAD) .
docker build -t todo-frontend:$(git rev-parse --short HEAD) .

# Combined tagging
docker build -t todo-backend:latest -t todo-backend:v1.0.0 -t todo-backend:abc123 .
```

### Container Registry Push

Push images to your container registry (Docker Hub, GitHub Container Registry, AWS ECR, etc.):

```bash
# Docker Hub
docker tag todo-backend:latest username/todo-backend:latest
docker push username/todo-backend:latest

# GitHub Container Registry
docker tag todo-backend:latest ghcr.io/username/todo-backend:latest
docker push ghcr.io/username/todo-backend:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker tag todo-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/todo-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/todo-backend:latest
```

### GitHub Actions Example

Create `.github/workflows/docker-build.yml`:

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [main, develop]
    tags: ['v*']
  pull_request:
    branches: [main]

env:
  REGISTRY: ghcr.io
  BACKEND_IMAGE: ${{ github.repository }}/todo-backend
  FRONTEND_IMAGE: ${{ github.repository }}/todo-frontend

jobs:
  build-backend:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.BACKEND_IMAGE }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push backend
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max

  build-frontend:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3

      - name: Log in to Container Registry
        uses: docker/login-action@v3
        with:
          registry: ${{ env.REGISTRY }}
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}

      - name: Extract metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ${{ env.REGISTRY }}/${{ env.FRONTEND_IMAGE }}
          tags: |
            type=ref,event=branch
            type=ref,event=pr
            type=semver,pattern={{version}}
            type=semver,pattern={{major}}.{{minor}}
            type=sha,prefix={{branch}}-

      - name: Build and push frontend
        uses: docker/build-push-action@v5
        with:
          context: ./frontend
          push: ${{ github.event_name != 'pull_request' }}
          tags: ${{ steps.meta.outputs.tags }}
          labels: ${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### GitLab CI Example

Create `.gitlab-ci.yml`:

```yaml
stages:
  - build
  - push

variables:
  DOCKER_DRIVER: overlay2
  DOCKER_TLS_CERTDIR: "/certs"

build-backend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - cd backend
    - docker build -t $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHORT_SHA .
    - docker build -t $CI_REGISTRY_IMAGE/backend:latest .
    - docker push $CI_REGISTRY_IMAGE/backend:$CI_COMMIT_SHORT_SHA
    - docker push $CI_REGISTRY_IMAGE/backend:latest
  only:
    - main
    - develop

build-frontend:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  before_script:
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
  script:
    - cd frontend
    - docker build -t $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHORT_SHA .
    - docker build -t $CI_REGISTRY_IMAGE/frontend:latest .
    - docker push $CI_REGISTRY_IMAGE/frontend:$CI_COMMIT_SHORT_SHA
    - docker push $CI_REGISTRY_IMAGE/frontend:latest
  only:
    - main
    - develop
```

### CI/CD Best Practices

1. **Build Caching**: Use layer caching to speed up builds
2. **Multi-stage Builds**: Already implemented in Dockerfiles
3. **Parallel Builds**: Build backend and frontend in parallel
4. **Security Scanning**: Integrate vulnerability scanning (Trivy, Snyk)
5. **Image Signing**: Sign images for supply chain security
6. **Automated Testing**: Run tests before building containers
7. **Environment-specific Tags**: Use different tags for dev/staging/prod

---

## Next Steps

1. **Development**: Use these containers for local development
2. **Testing**: Run integration tests against containerized services
3. **CI/CD**: Integrate container builds into CI/CD pipeline using examples above
4. **Production**: Deploy containers to orchestration platform (Kubernetes, ECS, etc.)

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Next.js Docker Guide](https://nextjs.org/docs/deployment#docker-image)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/docker/)
- [Dockerfile Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Docker](https://docs.github.com/en/actions/publishing-packages/publishing-docker-images)
- [GitLab CI Docker](https://docs.gitlab.com/ee/ci/docker/using_docker_build.html)
