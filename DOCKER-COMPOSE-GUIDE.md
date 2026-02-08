# Docker Compose Quick Start Guide

## Prerequisites
- Docker and Docker Compose installed
- Images already built:
  - `todo-backend:latest`
  - `todo-frontend:latest`

## Files Created
- `docker-compose.yml` - Container orchestration configuration
- `.env` - Environment variables for docker-compose

## Starting the Application

### 1. Start all services
```bash
docker-compose up -d
```

### 2. View logs
```bash
# All services
docker-compose logs -f

# Backend only
docker-compose logs -f backend

# Frontend only
docker-compose logs -f frontend
```

### 3. Check service status
```bash
docker-compose ps
```

## Accessing the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Backend Health**: http://localhost:8000/health
- **Frontend Health**: http://localhost:3000/health

## Stopping the Application

### Stop services (keeps containers)
```bash
docker-compose stop
```

### Stop and remove containers
```bash
docker-compose down
```

### Stop and remove containers + volumes
```bash
docker-compose down -v
```

## Troubleshooting

### View container logs
```bash
docker-compose logs backend
docker-compose logs frontend
```

### Restart a specific service
```bash
docker-compose restart backend
docker-compose restart frontend
```

### Rebuild and restart (if images updated)
```bash
docker-compose up -d --force-recreate
```

### Check health status
```bash
# Backend
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000/health
```

## Environment Variables

All sensitive environment variables are stored in `.env` file:
- `DATABASE_URL` - Neon PostgreSQL connection
- `BETTER_AUTH_SECRET` - Shared authentication secret
- `GEMINI_API_KEY` - Google Gemini API key
- `OPENROUTER_API_KEY` - OpenRouter API key

**IMPORTANT**: Never commit `.env` to version control!

## Network Configuration
- Both services run on a shared Docker network: `todo-network`
- Frontend depends on backend health check before starting
- Services can communicate using container names

## Health Checks
- Backend: Checks every 30s, 3 retries, 40s start period
- Frontend: Checks every 30s, 3 retries, 40s start period
- Frontend waits for backend to be healthy before starting

## Common Commands

```bash
# Start in foreground (see logs directly)
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# View running containers
docker-compose ps

# Execute command in container
docker-compose exec backend bash
docker-compose exec frontend sh

# View resource usage
docker stats
```
