# Docker Containerization - Validation Checklist

This checklist should be completed once Docker connectivity is restored to ensure all success criteria are met.

## Phase 3: User Story 1 - Local Development (Remaining)

### T015: Test Backend Container Build
```bash
cd backend
docker build -t todo-backend:latest .

# Expected output:
# - Build completes successfully
# - No errors in output
# - Final message: "Successfully tagged todo-backend:latest"
```

**Success Criteria:**
- [ ] Build completes without errors
- [ ] All layers cached properly on subsequent builds
- [ ] Build time < 5 minutes (T043)

### T016: Test Backend Container Run
```bash
docker run -d \
  --name todo-backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname" \
  -e BETTER_AUTH_SECRET="test-secret-key-min-32-chars-long" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

# Wait 10 seconds for startup
sleep 10

# Check container is running
docker ps | grep todo-backend

# Test health endpoint
curl http://localhost:8000/health
```

**Success Criteria:**
- [ ] Container starts successfully
- [ ] Health endpoint returns 200 OK
- [ ] Response includes database connectivity status
- [ ] Container startup time < 30 seconds (T042)

### T023: Test Frontend Container Build
```bash
cd frontend
docker build -t todo-frontend:latest .

# Expected output:
# - Multi-stage build completes
# - Standalone output generated
# - Final message: "Successfully tagged todo-frontend:latest"
```

**Success Criteria:**
- [ ] Build completes without errors
- [ ] All three stages complete successfully
- [ ] Build time < 5 minutes (T043)

### T024: Test Frontend Container Run
```bash
docker run -d \
  --name todo-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e BETTER_AUTH_SECRET="test-secret-key-min-32-chars-long" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest

# Wait 10 seconds for startup
sleep 10

# Check container is running
docker ps | grep todo-frontend

# Test health endpoint
curl http://localhost:3000/health
```

**Success Criteria:**
- [ ] Container starts successfully
- [ ] Health endpoint returns 200 OK
- [ ] Container startup time < 30 seconds (T042)

### T025: Test Both Containers Together
```bash
# Create custom network
docker network create todo-network

# Run backend on network
docker run -d \
  --name todo-backend \
  --network todo-network \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname" \
  -e BETTER_AUTH_SECRET="test-secret-key-min-32-chars-long" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

# Run frontend on network
docker run -d \
  --name todo-frontend \
  --network todo-network \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://todo-backend:8000" \
  -e BETTER_AUTH_SECRET="test-secret-key-min-32-chars-long" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest

# Wait for both to start
sleep 15

# Check both are running
docker ps
```

**Success Criteria:**
- [ ] Both containers start successfully
- [ ] Both containers on same network
- [ ] No port conflicts

### T026: Verify Frontend-Backend Communication
```bash
# Test from host
curl http://localhost:3000
curl http://localhost:8000/docs

# Test backend health from frontend container
docker exec todo-frontend wget -qO- http://todo-backend:8000/health

# Check backend logs for CORS
docker logs todo-backend | grep -i cors

# Test API endpoint from frontend
docker exec todo-frontend wget -qO- http://todo-backend:8000/api/tasks
```

**Success Criteria:**
- [ ] Frontend can reach backend using container name
- [ ] CORS configured correctly
- [ ] API requests work from frontend container
- [ ] No CORS errors in logs

### T027: Verify Application Functionality
```bash
# Access frontend in browser
open http://localhost:3000

# Manual testing checklist:
# 1. Frontend loads without errors
# 2. Can navigate to signup page
# 3. Can create account
# 4. Can login
# 5. Can create task
# 6. Can view tasks
# 7. Can update task
# 8. Can delete task
# 9. Can logout

# Check logs for errors
docker logs todo-backend | grep -i error
docker logs todo-frontend | grep -i error
```

**Success Criteria:**
- [ ] All CRUD operations work
- [ ] Authentication works
- [ ] No errors in container logs
- [ ] Application behaves identically to non-containerized version

### T028: Document Container Commands
**Status:** ✅ COMPLETED - Commands documented in quickstart.md

---

## Phase 4: User Story 2 - Production Deployment

### T029-T037: Health Check Endpoints
**Status:** ✅ COMPLETED - Health endpoints implemented

### T038: Measure Backend Image Size
```bash
docker images | grep todo-backend

# Get exact size
docker inspect todo-backend:latest --format='{{.Size}}' | awk '{print $1/1024/1024 " MB"}'
```

**Success Criteria:**
- [ ] Image size < 300MB (SC-002)
- [ ] Document actual size

**Actual Size:** ___________ MB

### T039: Measure Frontend Image Size
```bash
docker images | grep todo-frontend

# Get exact size
docker inspect todo-frontend:latest --format='{{.Size}}' | awk '{print $1/1024/1024 " MB"}'
```

**Success Criteria:**
- [ ] Image size < 200MB (SC-001)
- [ ] Document actual size

**Actual Size:** ___________ MB

### T040: Optimize Backend Dockerfile (if needed)
Only if T038 shows size > 300MB:

```bash
# Analyze layers
docker history todo-backend:latest

# Use dive for detailed analysis
dive todo-backend:latest

# Optimization strategies:
# 1. Clean apt cache in same RUN command
# 2. Remove unnecessary system packages
# 3. Use --no-install-recommends for apt
# 4. Remove build dependencies after use
# 5. Minimize number of layers
```

### T041: Optimize Frontend Dockerfile (if needed)
Only if T039 shows size > 200MB:

```bash
# Analyze layers
docker history todo-frontend:latest

# Use dive for detailed analysis
dive todo-frontend:latest

# Optimization strategies:
# 1. Verify standalone mode is working
# 2. Ensure only necessary files copied
# 3. Check .dockerignore is comprehensive
# 4. Use alpine base image (already done)
```

### T042: Measure Container Startup Times
```bash
# Backend startup time
time docker run --rm \
  -e DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname" \
  -e BETTER_AUTH_SECRET="test-secret-key-min-32-chars-long" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest &

# Wait for health check to pass
start_time=$(date +%s)
until curl -f http://localhost:8000/health 2>/dev/null; do
  sleep 1
done
end_time=$(date +%s)
echo "Backend startup time: $((end_time - start_time)) seconds"

# Frontend startup time
start_time=$(date +%s)
until curl -f http://localhost:3000/health 2>/dev/null; do
  sleep 1
done
end_time=$(date +%s)
echo "Frontend startup time: $((end_time - start_time)) seconds"
```

**Success Criteria:**
- [ ] Backend starts and passes health check within 30 seconds (SC-003)
- [ ] Frontend starts and passes health check within 30 seconds (SC-003)

**Actual Times:**
- Backend: ___________ seconds
- Frontend: ___________ seconds

### T043: Measure Container Build Times
```bash
# Backend build time
time docker build --no-cache -t todo-backend:latest backend/

# Frontend build time
time docker build --no-cache -t todo-frontend:latest frontend/
```

**Success Criteria:**
- [ ] Backend builds in < 5 minutes (SC-008)
- [ ] Frontend builds in < 5 minutes (SC-008)

**Actual Times:**
- Backend: ___________ minutes
- Frontend: ___________ minutes

### T044: Add Docker Labels
**Status:** ✅ COMPLETED - Labels added to both Dockerfiles

### T045: Test Graceful Shutdown
```bash
# Start backend container
docker run -d --name todo-backend \
  -e DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname" \
  -e BETTER_AUTH_SECRET="test-secret-key-min-32-chars-long" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

# Send SIGTERM and measure shutdown time
time docker stop todo-backend

# Check logs for clean shutdown
docker logs todo-backend | tail -20

# Repeat for frontend
docker run -d --name todo-frontend \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e BETTER_AUTH_SECRET="test-secret-key-min-32-chars-long" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest

time docker stop todo-frontend
docker logs todo-frontend | tail -20
```

**Success Criteria:**
- [ ] Backend shuts down cleanly within 10 seconds (SC-009)
- [ ] Frontend shuts down cleanly within 10 seconds (SC-009)
- [ ] No error messages in shutdown logs
- [ ] Containers restart successfully after stop

### T046: Verify Backend Runs as Non-Root
```bash
docker exec todo-backend whoami
# Expected output: appuser

docker exec todo-backend id
# Expected: uid=1000(appuser) gid=1000(appuser)
```

**Success Criteria:**
- [ ] Container runs as user 'appuser'
- [ ] UID is 1000
- [ ] Not running as root

### T047: Verify Frontend Runs as Non-Root
```bash
docker exec todo-frontend whoami
# Expected output: node

docker exec todo-frontend id
# Expected: uid=1000(node) gid=1000(node)
```

**Success Criteria:**
- [ ] Container runs as user 'node'
- [ ] UID is 1000
- [ ] Not running as root

### T048: Verify No Secrets in Images
```bash
# Inspect backend image history
docker history --no-trunc todo-backend:latest | grep -i "secret\|password\|key"

# Inspect frontend image history
docker history --no-trunc todo-frontend:latest | grep -i "secret\|password\|key"

# Check for .env files in images
docker run --rm todo-backend:latest find /app -name ".env*"
docker run --rm todo-frontend:latest find /app -name ".env*"

# Scan for vulnerabilities
docker scout cves todo-backend:latest
docker scout cves todo-frontend:latest

# Or use Trivy
trivy image todo-backend:latest
trivy image todo-frontend:latest
```

**Success Criteria:**
- [ ] No secrets in image layers (SC-010)
- [ ] No .env files in images
- [ ] No hardcoded credentials
- [ ] Vulnerability scan passes or has acceptable risk

### T049: Document Security Best Practices
**Status:** ✅ COMPLETED - Security section in quickstart.md

---

## Phase 5: User Story 3 - CI/CD Documentation

### T050-T053: CI/CD Documentation
**Status:** ✅ COMPLETED - CI/CD section added to quickstart.md

---

## Phase 6: Polish & Cross-Cutting Concerns

### T054: Update Root README.md
**Status:** ✅ COMPLETED - README.md created with Docker instructions

### T055: Update backend/CLAUDE.md
**Status:** ✅ COMPLETED - Docker instructions added

### T056: Update frontend/CLAUDE.md
**Status:** ✅ COMPLETED - Docker instructions added

### T057: Create Example .env Files
**Status:** ✅ COMPLETED - .env.example files created for both services

### T058: Validate Success Criteria
```bash
# SC-001: Frontend image size < 200MB
docker images todo-frontend:latest --format "{{.Size}}"

# SC-002: Backend image size < 300MB
docker images todo-backend:latest --format "{{.Size}}"

# SC-003: Startup time < 30 seconds (see T042)

# SC-004: Builds work on any machine with Docker
# Test on different OS if possible

# SC-005: Application functions identically (see T027)

# SC-006: Health checks respond < 1 second
time curl http://localhost:8000/health
time curl http://localhost:3000/health

# SC-007: Deployable to any orchestration platform
# Verify Dockerfiles follow best practices

# SC-008: Build time < 5 minutes (see T043)

# SC-009: Restart after crashes (see T045)

# SC-010: Zero security vulnerabilities (see T048)
```

**Success Criteria Checklist:**
- [ ] SC-001: Frontend image < 200MB
- [ ] SC-002: Backend image < 300MB
- [ ] SC-003: Startup time < 30 seconds
- [ ] SC-004: Builds work on any machine
- [ ] SC-005: Application functions identically
- [ ] SC-006: Health checks < 1 second
- [ ] SC-007: Deployable to orchestration platforms
- [ ] SC-008: Build time < 5 minutes
- [ ] SC-009: Restarts successfully
- [ ] SC-010: No security vulnerabilities

### T059: Run Complete Quickstart Validation
```bash
# Follow quickstart.md from start to finish
# Document any issues or unclear instructions

# 1. Build both containers
cd backend
docker build -t todo-backend:latest .
cd ../frontend
docker build -t todo-frontend:latest .

# 2. Run containers
docker run -d --name todo-backend -p 8000:8000 \
  -e DATABASE_URL="..." \
  -e BETTER_AUTH_SECRET="..." \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

docker run -d --name todo-frontend -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e BETTER_AUTH_SECRET="..." \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest

# 3. Verify health
curl http://localhost:8000/health
curl http://localhost:3000/health

# 4. Access application
open http://localhost:3000

# 5. Test all functionality
# - Signup
# - Login
# - Create task
# - Update task
# - Delete task
# - Logout

# 6. Clean up
docker stop todo-backend todo-frontend
docker rm todo-backend todo-frontend
```

**Success Criteria:**
- [ ] All commands in quickstart.md work
- [ ] No errors or unclear instructions
- [ ] Application fully functional
- [ ] Documentation is clear and complete

### T060: Enhanced Troubleshooting Section
**Status:** ✅ COMPLETED - Comprehensive troubleshooting added to quickstart.md

---

## Summary

### Completed Without Docker Connectivity
- ✅ All Dockerfiles created and configured
- ✅ All .dockerignore files created
- ✅ Health check endpoints implemented
- ✅ Docker labels added
- ✅ CI/CD documentation complete
- ✅ All CLAUDE.md files updated
- ✅ Root README.md created
- ✅ .env.example files created
- ✅ Comprehensive troubleshooting guide
- ✅ Security best practices documented

### Requires Docker Connectivity to Complete
- ⏳ Container build testing (T015, T023)
- ⏳ Container run testing (T016, T024)
- ⏳ Integration testing (T025-T027)
- ⏳ Performance measurements (T038-T043)
- ⏳ Security validation (T046-T048)
- ⏳ Final validation (T058-T059)

### Next Steps
1. Resolve Docker network connectivity issue
2. Run validation checklist from this document
3. Document actual measurements (image sizes, startup times, build times)
4. Address any issues found during validation
5. Complete final success criteria validation
