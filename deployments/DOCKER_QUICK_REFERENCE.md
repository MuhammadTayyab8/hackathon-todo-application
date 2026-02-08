# Docker Containerization - Quick Reference

## Quick Commands

### Build Containers
```bash
# Backend
docker build -t todo-backend:latest backend/

# Frontend
docker build -t todo-frontend:latest frontend/
```

### Run Containers (Standalone)
```bash
# Backend
docker run -d --name todo-backend -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname" \
  -e BETTER_AUTH_SECRET="your-secret-key-min-32-chars" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

# Frontend
docker run -d --name todo-frontend -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e BETTER_AUTH_SECRET="your-secret-key-min-32-chars" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest
```

### Run Containers (Networked)
```bash
# Create network
docker network create todo-network

# Backend
docker run -d --name todo-backend --network todo-network -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host.neon.tech/dbname" \
  -e BETTER_AUTH_SECRET="your-secret-key-min-32-chars" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

# Frontend (note: uses container name for backend URL)
docker run -d --name todo-frontend --network todo-network -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://todo-backend:8000" \
  -e BETTER_AUTH_SECRET="your-secret-key-min-32-chars" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest
```

### Health Checks
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000/health
```

### View Logs
```bash
# Backend
docker logs -f todo-backend

# Frontend
docker logs -f todo-frontend
```

### Stop and Remove
```bash
# Stop
docker stop todo-backend todo-frontend

# Remove
docker rm todo-backend todo-frontend

# Remove network
docker network rm todo-network
```

### Restart
```bash
docker restart todo-backend
docker restart todo-frontend
```

## Environment Variables

### Backend Required
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - JWT secret (min 32 chars)
- `CORS_ORIGINS` - Allowed origins (comma-separated)

### Frontend Required
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `BETTER_AUTH_SECRET` - JWT secret (must match backend)
- `BETTER_AUTH_URL` - Frontend URL for auth callbacks

## Troubleshooting Quick Fixes

### Container won't start
```bash
docker logs <container-name>
docker inspect <container-name>
```

### Port already in use
```bash
# Windows
netstat -ano | findstr :8000

# Linux/Mac
lsof -i :8000
```

### Health check failing
```bash
docker exec <container-name> curl http://localhost:8000/health
```

### Environment variables not working
```bash
docker exec <container-name> env | grep DATABASE_URL
```

## Validation

### Run automated validation (once Docker connectivity restored)
```bash
# Linux/Mac
chmod +x validate-docker.sh
./validate-docker.sh

# Windows PowerShell
.\validate-docker.ps1
```

### Manual validation checklist
1. Build both containers
2. Run both containers
3. Test health endpoints
4. Access application at http://localhost:3000
5. Test CRUD operations
6. Check logs for errors
7. Verify image sizes
8. Test graceful shutdown

## File Locations

### Dockerfiles
- `backend/Dockerfile` - Backend container configuration
- `frontend/Dockerfile` - Frontend container configuration

### Docker Ignore
- `backend/.dockerignore` - Files excluded from backend build
- `frontend/.dockerignore` - Files excluded from frontend build

### Environment Examples
- `backend/.env.example` - Backend environment template
- `frontend/.env.example` - Frontend environment template

### Documentation
- `specs/001-docker-containerization/quickstart.md` - Complete guide
- `specs/001-docker-containerization/VALIDATION.md` - Validation checklist
- `specs/001-docker-containerization/IMPLEMENTATION_SUMMARY.md` - Implementation details
- `README.md` - Project overview with Docker instructions

### Validation Scripts
- `validate-docker.sh` - Bash validation script (Linux/Mac)
- `validate-docker.ps1` - PowerShell validation script (Windows)

## Success Criteria

- [ ] Backend image < 300MB
- [ ] Frontend image < 200MB
- [ ] Startup time < 30 seconds
- [ ] Build time < 5 minutes
- [ ] Health checks respond < 1 second
- [ ] Runs as non-root user
- [ ] No secrets in images
- [ ] Graceful shutdown < 10 seconds

## Next Steps

1. **Resolve Docker connectivity** - Fix network/proxy issues
2. **Run validation** - Use automated scripts
3. **Test manually** - Verify all functionality
4. **Document results** - Update tasks.md
5. **Deploy** - Push to container registry

## Support

For detailed instructions, see:
- [Quickstart Guide](specs/001-docker-containerization/quickstart.md)
- [Validation Checklist](specs/001-docker-containerization/VALIDATION.md)
- [Troubleshooting](specs/001-docker-containerization/quickstart.md#troubleshooting)
