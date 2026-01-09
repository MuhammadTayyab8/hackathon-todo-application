# Todo App Backend

FastAPI backend for the Todo Application with JWT authentication, task management, and category organization.

## 🏗️ Tech Stack

- **Framework**: FastAPI 0.104+
- **ORM**: SQLModel 0.0.14+
- **Database**: PostgreSQL (Neon Serverless)
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **Migrations**: Alembic 1.13+
- **Async Driver**: asyncpg

## 📁 Project Structure

```
backend/
├── src/
│   ├── api/
│   │   ├── middleware/
│   │   │   └── jwt_middleware.py    # JWT authentication middleware
│   │   └── routes/
│   │       ├── auth.py              # Authentication endpoints
│   │       ├── tasks.py             # Task CRUD endpoints
│   │       └── categories.py        # Category endpoints
│   ├── models/
│   │   ├── user.py                  # User model & schemas
│   │   ├── task.py                  # Task model & schemas
│   │   └── category.py              # Category model & schemas
│   ├── services/
│   │   └── auth_service.py          # Auth business logic
│   ├── migrations/                  # Alembic migrations
│   │   ├── env.py
│   │   └── versions/
│   ├── db.py                        # Database connection
│   └── main.py                      # FastAPI app entry point
├── alembic.ini                      # Alembic configuration
├── pyproject.toml                   # Dependencies
└── README.md
```

## 🗄️ Database Schema

### User Table
```sql
- id: UUID (Primary Key)
- name: String
- email: String (Unique)
- password_hash: String
- created_at: DateTime
```

### Category Table
```sql
- id: Integer (Primary Key, Auto-increment)
- name: String
- user_id: UUID (Foreign Key -> User.id)
- created_at: DateTime
```

### Task Table
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key -> User.id)
- title: String (Required)
- description: String (Optional)
- due_date: DateTime (Optional)
- category_id: Integer (Foreign Key -> Category.id)
- completed: Boolean (Default: False)
- created_at: DateTime
- updated_at: DateTime
```

## 🚀 Setup & Installation

### 1. Install Dependencies

Using pip:
```bash
cd backend
pip install -e .
```

Or using uv (recommended):
```bash
cd backend
uv pip install -e .
```

### 2. Environment Configuration

Create a `.env` file in the `backend/` directory:

```env
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host:5432/dbname

# JWT Secret (generate a secure random string)
BETTER_AUTH_SECRET=your-super-secret-jwt-key-change-this-in-production

# Optional: CORS origins (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

**Generate a secure JWT secret:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 3. Database Setup

#### Initialize Alembic (if not already done)
```bash
cd backend
alembic init src/migrations
```

#### Run Migrations
```bash
# Apply all migrations
alembic upgrade head

# Create a new migration (after model changes)
alembic revision --autogenerate -m "description of changes"
```

### 4. Run the Server

**Development mode (with auto-reload):**
```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

**Production mode:**
```bash
cd backend
uvicorn src.main:app --host 0.0.0.0 --port 8000 --workers 4
```

The API will be available at `http://localhost:8000`

## 📚 API Documentation

### Interactive Documentation

Once the server is running, visit:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

### API Endpoints Overview

#### Authentication (`/api/auth`)
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/signin` - Login and get JWT token
- `POST /api/auth/signout` - Logout (client-side token removal)
- `GET /api/auth/me` - Get current authenticated user info

#### Tasks (`/api/{user_id}/tasks`)
- `GET /api/{user_id}/tasks` - List all tasks (with category names)
- `POST /api/{user_id}/tasks` - Create a new task
- `GET /api/{user_id}/tasks/{task_id}` - Get task details
- `PUT /api/{user_id}/tasks/{task_id}` - Update task
- `DELETE /api/{user_id}/tasks/{task_id}` - Delete task
- `PATCH /api/{user_id}/tasks/{task_id}/complete` - Toggle completion status

#### Categories (`/api/{user_id}/categories`)
- `GET /api/{user_id}/categories` - List all categories
- `POST /api/{user_id}/categories` - Create a new category

## 🧪 Manual Testing Guide

### Step 1: Sign Up (Create User)

**Request:**
```bash
POST http://localhost:8000/api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "created_at": "2026-01-09T12:00:00"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_at": "2026-01-16T12:00:00"
}
```

### Step 2: Sign In (Get Token)

**Request:**
```bash
POST http://localhost:8000/api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as signup response

> **Important:** Save the `token` and `user.id` for subsequent requests.

### Step 3: Get Current User Info

**Request:**
```bash
GET http://localhost:8000/api/auth/me
Authorization: Bearer <YOUR_TOKEN>
```

**Response:**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2026-01-09T12:00:00"
}
```

### Step 4: Create a Category

**Request:**
```bash
POST http://localhost:8000/api/{user_id}/categories
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "name": "Work"
}
```

**Response:**
```json
{
  "id": 1,
  "name": "Work",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "created_at": "2026-01-09T12:00:00"
}
```

### Step 5: Create a Task

**Request:**
```bash
POST http://localhost:8000/api/{user_id}/tasks
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "due_date": "2026-01-15T17:00:00Z",
  "category_id": 1
}
```

**Response:**
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "user_id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Complete project documentation",
  "description": "Write comprehensive README and API docs",
  "due_date": "2026-01-15T17:00:00Z",
  "category_id": 1,
  "category_name": null,
  "completed": false,
  "created_at": "2026-01-09T12:00:00",
  "updated_at": "2026-01-09T12:00:00"
}
```

### Step 6: List Tasks (with Category Names)

**Request:**
```bash
GET http://localhost:8000/api/{user_id}/tasks
Authorization: Bearer <YOUR_TOKEN>
```

**Response:**
```json
[
  {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "user_id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "due_date": "2026-01-15T17:00:00Z",
    "category_id": 1,
    "category_name": "Work",
    "completed": false,
    "created_at": "2026-01-09T12:00:00",
    "updated_at": "2026-01-09T12:00:00"
  }
]
```

### Step 7: Update a Task

**Request:**
```bash
PUT http://localhost:8000/api/{user_id}/tasks/{task_id}
Authorization: Bearer <YOUR_TOKEN>
Content-Type: application/json

{
  "title": "Complete project documentation (Updated)",
  "description": "Write comprehensive README, API docs, and deployment guide",
  "completed": false
}
```

### Step 8: Toggle Task Completion

**Request:**
```bash
PATCH http://localhost:8000/api/{user_id}/tasks/{task_id}/complete
Authorization: Bearer <YOUR_TOKEN>
```

**Response:** Task with `completed` toggled to `true`

### Step 9: Delete a Task

**Request:**
```bash
DELETE http://localhost:8000/api/{user_id}/tasks/{task_id}
Authorization: Bearer <YOUR_TOKEN>
```

**Response:** `204 No Content`

## 🔒 Security Features

### Authentication & Authorization

1. **JWT-based Authentication**
   - Tokens expire after 7 days
   - Tokens include user_id in payload
   - All protected routes require valid Bearer token

2. **Password Security**
   - Passwords hashed with bcrypt (cost factor 12)
   - Plain passwords never stored

3. **User Isolation**
   - Middleware extracts user_id from JWT
   - All task/category operations verify ownership
   - Users can only access their own resources

4. **CORS Protection**
   - Configurable allowed origins
   - Credentials support enabled

### Security Testing

**Test 1: No Token**
```bash
GET http://localhost:8000/api/{user_id}/tasks
# Expected: 401 Unauthorized
```

**Test 2: Invalid Token**
```bash
GET http://localhost:8000/api/{user_id}/tasks
Authorization: Bearer invalid-token-here
# Expected: 401 Unauthorized
```

**Test 3: Access Another User's Resources**
```bash
# Login as User A, get token
# Try to access User B's tasks using User A's token
GET http://localhost:8000/api/{user_b_id}/tasks
Authorization: Bearer <USER_A_TOKEN>
# Expected: 403 Forbidden - "You can only access your own tasks"
```

## 🔧 Development

### Running Tests

```bash
cd backend
pytest
```

### Database Migrations

**Create a new migration:**
```bash
alembic revision --autogenerate -m "Add new field to Task model"
```

**Apply migrations:**
```bash
alembic upgrade head
```

**Rollback last migration:**
```bash
alembic downgrade -1
```

**View migration history:**
```bash
alembic history
```

### Code Quality

**Format code:**
```bash
black src/
```

**Lint code:**
```bash
ruff check src/
```

## 🐛 Troubleshooting

### Database Connection Issues

**Error:** `asyncpg.exceptions.InvalidCatalogNameError: database "dbname" does not exist`

**Solution:** Create the database first:
```sql
CREATE DATABASE dbname;
```

### Migration Issues

**Error:** `Target database is not up to date`

**Solution:** Run migrations:
```bash
alembic upgrade head
```

### JWT Token Issues

**Error:** `401 Unauthorized` on protected routes

**Solutions:**
1. Check token is included in `Authorization: Bearer <token>` header
2. Verify token hasn't expired (7 day expiry)
3. Ensure `BETTER_AUTH_SECRET` matches between token creation and validation

## 📝 Notes

- All timestamps are stored in UTC
- Task queries use SQL joins to include category names in responses
- User passwords are never returned in API responses
- The API uses async/await throughout for better performance
- Database connections are pooled and managed by SQLModel/SQLAlchemy

## 🚀 Deployment

### Environment Variables for Production

```env
DATABASE_URL=postgresql+asyncpg://user:password@production-host:5432/dbname
BETTER_AUTH_SECRET=<generate-secure-secret>
CORS_ORIGINS=https://yourdomain.com
```

### Running with Docker (Optional)

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -e .
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📄 License

MIT License - See LICENSE file for details
