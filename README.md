# 📝 Todo App - Full Stack Application

A modern, full-stack todo application built with Next.js 16, FastAPI, and PostgreSQL. Features JWT authentication, task management with categories, and a beautiful dashboard interface.

![Tech Stack](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?style=flat-square&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-336791?style=flat-square&logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=flat-square&logo=python)

## 🌟 Features

### ✨ Core Functionality
- **User Authentication** - Secure JWT-based authentication with bcrypt password hashing
- **Task Management** - Create, read, update, and delete tasks with rich details
- **Category Organization** - Organize tasks into custom categories
- **Task Filtering** - Filter by status (All, Active, Completed) and search functionality
- **Due Dates** - Set and track task deadlines with overdue indicators
- **Real-time Stats** - Dashboard with live task statistics

### 🎨 User Experience
- **Modern Dashboard** - Clean, professional interface with collapsible sidebar
- **Responsive Design** - Fully responsive from mobile to desktop
- **Smooth Animations** - Polished transitions and micro-interactions
- **Theme System** - Consistent design with lime green accent color (#B9FF66)
- **Empty States** - Helpful messages when no data is available
- **Loading States** - Clear feedback during async operations

### 🔒 Security
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt with cost factor 12
- **User Isolation** - Users can only access their own data
- **CORS Protection** - Configurable allowed origins
- **Input Validation** - Pydantic models for request validation

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                            │
│  Next.js 16 + React 19 + TypeScript + Tailwind CSS        │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │   Landing    │  │     Auth     │  │   Dashboard  │    │
│  │     Page     │  │  (Sign In/Up)│  │   (Tasks)    │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                    JWT Token (localStorage)
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                         Backend                             │
│         FastAPI + SQLModel + PostgreSQL (Neon)             │
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │     Auth     │  │    Tasks     │  │  Categories  │    │
│  │   Endpoints  │  │   Endpoints  │  │   Endpoints  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌──────────────────────────────────────────────────┐     │
│  │            JWT Middleware                         │     │
│  │  (Validates token, extracts user_id)            │     │
│  └──────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Database (PostgreSQL)                    │
│                                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│  │   User   │  │   Task   │  │ Category │                │
│  └──────────┘  └──────────┘  └──────────┘                │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20+ (for frontend)
- **Python** 3.12+ (for backend)
- **PostgreSQL** database (Neon recommended)
- **npm** or **yarn** (for frontend dependencies)
- **pip** or **uv** (for backend dependencies)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hackathon2-todo-app
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -e .

# Create .env file
cat > .env << EOF
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname
BETTER_AUTH_SECRET=$(python -c "import secrets; print(secrets.token_urlsafe(32))")
CORS_ORIGINS=http://localhost:3000
EOF

# Run database migrations
alembic upgrade head

# Start the backend server
uvicorn src.main:app --reload --port 8000
```

Backend will be available at `http://localhost:8000`

📚 **Detailed backend documentation**: [backend/README.md](./backend/README.md)

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from root)
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start the development server
npm run dev
```

Frontend will be available at `http://localhost:3000`

📚 **Detailed frontend documentation**: [frontend/README.md](./frontend/README.md)

### 4. Access the Application

1. Open `http://localhost:3000` in your browser
2. Click "Sign Up" to create a new account
3. Fill in your name, email, and password
4. You'll be automatically logged in and redirected to the dashboard
5. Start creating tasks!

## 📁 Project Structure

```
hackathon2-todo-app/
├── backend/                    # FastAPI backend
│   ├── src/
│   │   ├── api/               # API routes and middleware
│   │   │   ├── middleware/    # JWT authentication
│   │   │   └── routes/        # Auth, tasks, categories endpoints
│   │   ├── models/            # SQLModel database models
│   │   ├── services/          # Business logic
│   │   ├── migrations/        # Alembic database migrations
│   │   ├── db.py             # Database connection
│   │   └── main.py           # FastAPI app entry point
│   ├── alembic.ini           # Alembic configuration
│   ├── pyproject.toml        # Python dependencies
│   └── README.md             # Backend documentation
│
├── frontend/                  # Next.js frontend
│   ├── src/
│   │   ├── app/              # Next.js app router pages
│   │   │   ├── page.tsx      # Landing page
│   │   │   ├── signin/       # Sign in page
│   │   │   ├── signup/       # Sign up page
│   │   │   └── dashboard/    # Main dashboard
│   │   ├── components/       # React components
│   │   │   ├── auth/         # Authentication forms
│   │   │   ├── dashboard/    # Dashboard components
│   │   │   └── tasks/        # Task management components
│   │   └── lib/
│   │       └── api.ts        # API client
│   ├── package.json          # Node dependencies
│   └── README.md             # Frontend documentation
│
├── specs/                     # Feature specifications
├── .specify/                  # Spec-Kit configuration
└── README.md                 # This file
```

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 16.1.1 (App Router)
- **UI Library**: React 19.2.3
- **Language**: TypeScript 5.x
- **Styling**: Tailwind CSS 4.x
- **Icons**: Lucide React
- **Fonts**: Space Grotesk, Roboto

### Backend
- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel 0.0.14+
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **Migrations**: Alembic 1.13+
- **Async Driver**: asyncpg

### Database Schema

**User Table**
- id (UUID), name, email, password_hash, created_at

**Category Table**
- id (Integer), name, user_id (FK), created_at

**Task Table**
- id (UUID), user_id (FK), title, description, due_date, category_id (FK), completed, created_at, updated_at

## 🎨 Design System

### Color Palette
```css
Primary:   #B9FF66  /* Lime green - highlights, active states */
Secondary: #191A23  /* Dark - text, buttons, borders */
Tertiary:  #F3F3F3  /* Light gray - backgrounds, cards */
Neutral:   #F9FAFB  /* Off-white - main background */
```

### Typography
- **Headings**: Space Grotesk (bold, modern)
- **Body**: Roboto (clean, readable)

### Spacing & Radius
- **Spacing**: 8px (small), 16px (medium), 24px (large)
- **Radius**: 8px (small), 12px (medium), 18px (large)

## 📖 API Documentation

Once the backend is running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key Endpoints

**Authentication**
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/signin` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

**Tasks**
- `GET /api/{user_id}/tasks` - List all tasks
- `POST /api/{user_id}/tasks` - Create task
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion

**Categories**
- `GET /api/{user_id}/categories` - List categories
- `POST /api/{user_id}/categories` - Create category

## 🧪 Testing

### Backend Testing
```bash
cd backend
pytest
```

### Frontend Testing
```bash
cd frontend
npm run lint
npm run build  # Test production build
```

### Manual Testing Checklist
- [ ] Sign up with new account
- [ ] Sign in with existing account
- [ ] Create task with all fields
- [ ] Edit task
- [ ] Delete task
- [ ] Toggle task completion
- [ ] Filter tasks (All/Active/Completed)
- [ ] Search tasks
- [ ] Create category
- [ ] Test on mobile device
- [ ] Test logout

## 🚀 Deployment

### Backend Deployment

**Environment Variables:**
```env
DATABASE_URL=postgresql+asyncpg://user:password@production-host:5432/dbname
BETTER_AUTH_SECRET=<secure-secret>
CORS_ORIGINS=https://yourdomain.com
```

**Deploy to:**
- Railway
- Render
- Fly.io
- AWS EC2
- Docker container

### Frontend Deployment

**Environment Variables:**
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

**Deploy to:**
- Vercel (recommended)
- Netlify
- AWS Amplify
- Docker container

### Docker Deployment (Optional)

**Backend Dockerfile:**
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY backend/ .
RUN pip install -e .
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Frontend Dockerfile:**
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY frontend/ .
RUN npm ci && npm run build
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Backend Issues

**Database Connection Error**
```bash
# Check DATABASE_URL format
# Ensure PostgreSQL is running
# Verify network connectivity
```

**Migration Issues**
```bash
# Reset migrations (development only)
alembic downgrade base
alembic upgrade head
```

### Frontend Issues

**API Connection Error**
```bash
# Verify backend is running on port 8000
# Check NEXT_PUBLIC_API_URL in .env.local
# Check browser console for CORS errors
```

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf .next
npm run dev
```

## 📝 Development Workflow

### Spec-Driven Development

This project uses GitHub Spec-Kit for spec-driven development:

1. **Specifications** are in `/specs/` directory
2. **Features** are documented before implementation
3. **API contracts** are defined in advance
4. **Database schemas** are planned upfront

### Adding a New Feature

1. Create spec in `/specs/features/`
2. Design API endpoints in `/specs/api/`
3. Define database models in `/specs/database/`
4. Implement backend (models → routes → tests)
5. Implement frontend (components → pages → integration)
6. Test end-to-end
7. Update documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style

**Backend:**
- Follow PEP 8
- Use type hints
- Write docstrings for functions
- Format with `black`

**Frontend:**
- Follow TypeScript best practices
- Use functional components
- Follow the design system
- Format with Prettier (if configured)

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- Built for AI Hackathon II
- Uses Neon Serverless PostgreSQL
- Designed with Tailwind CSS
- Powered by Next.js and FastAPI

## 📞 Support

For detailed documentation:
- **Backend**: [backend/README.md](./backend/README.md)
- **Frontend**: [frontend/README.md](./frontend/README.md)

For issues and questions:
- Open an issue on GitHub
- Check existing documentation
- Review API documentation at `/docs`

---

**Happy Coding! 🚀**
