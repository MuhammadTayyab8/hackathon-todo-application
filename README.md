# Todo App - Hackathon II

A full-stack Todo application built with Next.js 16 and FastAPI, featuring user authentication, task management, and AI-powered chat assistance.

## Features

- 🔐 User authentication with Better Auth
- ✅ Task management (CRUD operations)
- 🏷️ Task categories and organization
- 🤖 AI-powered chat assistant
- 🐳 Docker containerization for easy deployment
- 📱 Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Better Auth

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.12
- **ORM**: SQLModel
- **Database**: Neon PostgreSQL
- **Authentication**: Better Auth

## Quick Start

### Option 1: Docker (Recommended)

The easiest way to run the application is using Docker containers:

```bash
# 1. Clone the repository
git clone <repository-url>
cd hackathon2-todo-app

# 2. Set up environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
# Edit .env files with your configuration

# 3. Build containers
docker build -t todo-backend:latest backend/
docker build -t todo-frontend:latest frontend/

# 4. Run containers
docker run -d --name todo-backend -p 8000:8000 \
  -e DATABASE_URL="your-database-url" \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e CORS_ORIGINS="http://localhost:3000" \
  todo-backend:latest

docker run -d --name todo-frontend -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL="http://localhost:8000" \
  -e BETTER_AUTH_SECRET="your-secret" \
  -e BETTER_AUTH_URL="http://localhost:3000" \
  todo-frontend:latest

# 5. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

For detailed Docker instructions, see [Docker Quickstart Guide](specs/001-docker-containerization/quickstart.md).

### Option 2: Local Development

#### Prerequisites
- Node.js 20+
- Python 3.12+
- PostgreSQL database (Neon recommended)

#### Backend Setup

```bash
cd backend

# Install dependencies (using uv)
curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run the server
uvicorn src.main:app --reload --port 8000
```

#### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your configuration

# Run the development server
npm run dev
```

## Project Structure

```
hackathon2-todo-app/
├── backend/              # FastAPI backend
│   ├── src/
│   │   ├── api/         # API routes
│   │   ├── models.py    # Database models
│   │   ├── db.py        # Database connection
│   │   └── main.py      # Application entry point
│   ├── Dockerfile       # Backend container
│   └── .env.example     # Environment template
├── frontend/            # Next.js frontend
│   ├── src/
│   │   ├── app/        # App router pages
│   │   ├── components/ # React components
│   │   └── lib/        # Utilities and API client
│   ├── Dockerfile      # Frontend container
│   └── .env.example    # Environment template
└── specs/              # Feature specifications
    ├── overview.md
    ├── features/       # Feature specs
    ├── api/           # API specs
    ├── database/      # Schema specs
    └── ui/            # Component specs
```

## Development Workflow

This project uses GitHub Spec-Kit for spec-driven development:

1. **Read the spec**: Check `specs/features/[feature].md` before implementing
2. **Implement backend**: Follow `backend/CLAUDE.md` guidelines
3. **Implement frontend**: Follow `frontend/CLAUDE.md` guidelines
4. **Test and iterate**: Verify functionality works as specified

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
BETTER_AUTH_SECRET=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=http://localhost:3000
```

## API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Health Checks

Both services provide health check endpoints:

```bash
# Backend health
curl http://localhost:8000/health

# Frontend health
curl http://localhost:3000/health
```

## Docker Commands

```bash
# Build images
docker build -t todo-backend:latest backend/
docker build -t todo-frontend:latest frontend/

# Run containers
docker run -d --name todo-backend -p 8000:8000 [env-vars] todo-backend:latest
docker run -d --name todo-frontend -p 3000:3000 [env-vars] todo-frontend:latest

# View logs
docker logs -f todo-backend
docker logs -f todo-frontend

# Stop containers
docker stop todo-backend todo-frontend

# Remove containers
docker rm todo-backend todo-frontend
```

## Troubleshooting

### Docker Issues
- **Build fails**: Check network connectivity and Docker daemon status
- **Container won't start**: Check logs with `docker logs [container-name]`
- **Health check fails**: Verify environment variables are set correctly

### Local Development Issues
- **Backend won't start**: Verify DATABASE_URL is correct and database is accessible
- **Frontend can't connect**: Check NEXT_PUBLIC_API_URL matches backend URL
- **Auth issues**: Ensure BETTER_AUTH_SECRET matches between frontend and backend

For more troubleshooting tips, see the [Docker Quickstart Guide](specs/001-docker-containerization/quickstart.md).

## Contributing

1. Read the relevant specification in `specs/`
2. Create a feature branch
3. Implement following the guidelines in `CLAUDE.md` files
4. Test thoroughly
5. Submit a pull request

## Documentation

- [Project Overview](specs/overview.md)
- [Docker Quickstart](specs/001-docker-containerization/quickstart.md)
- [Backend Guidelines](backend/CLAUDE.md)
- [Frontend Guidelines](frontend/CLAUDE.md)
- [Feature Specifications](specs/features/)

## License

[Your License Here]

## Support

For issues and questions, please open an issue on GitHub.
