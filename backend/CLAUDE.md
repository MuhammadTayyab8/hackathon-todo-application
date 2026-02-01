# Backend Guidelines

## Stack
- FastAPI
- SQLModel (ORM)
- Neon PostgreSQL
- Python 3.12+
- uv (package manager)

## Project Structure
- `src/main.py` - FastAPI app entry point
- `src/models.py` - SQLModel database models
- `src/api/routes/` - API route handlers
- `src/db.py` - Database connection
- `Dockerfile` - Container configuration
- `.dockerignore` - Files excluded from Docker build

## API Conventions
- All routes under `/api/`
- Return JSON responses
- Use Pydantic models for request/response
- Handle errors with HTTPException
- Health check endpoint at `/health`

## Database
- Use SQLModel for all database operations
- Connection string from environment variable: DATABASE_URL
- Async operations with asyncpg

## Running

### Local Development
```bash
# Install dependencies
uv sync

# Run with hot reload
uvicorn src.main:app --reload --port 8000
```

### Docker Development
```bash
# Build container
docker build -t todo-backend:latest .

# Run container
docker run -d \
  --name todo-backend \
  -p 8000:8000 \
  -e DATABASE_URL="postgresql://user:pass@host/db" \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

# View logs
docker logs -f todo-backend

# Stop container
docker stop todo-backend
```

### Health Check
```bash
curl http://localhost:8000/health
```

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string (required)
- `BETTER_AUTH_SECRET` - JWT secret key (required)
- `FRONTEND_URL` - Frontend URL for CORS (default: http://localhost:3000)
- `CORS_ORIGINS` - Comma-separated allowed origins

## Docker Notes
- Container runs as non-root user `appuser`
- Port 8000 exposed
- Health check endpoint available at `/health`
- Uses multi-stage build for optimization
- Image size target: < 300MB

For detailed Docker instructions, see [Docker Quickstart Guide](../specs/001-docker-containerization/quickstart.md).