# Todo App Backend

This is the FastAPI backend for the Todo Application.

## 🚀 Setup & Running

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Environment Setup**
   Ensure you have a `.env` file in `backend/` (or root depending on setup) with:
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host/dbname
   BETTER_AUTH_SECRET=your_jwt_secret
   ```

3. **Run Server**
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   The API will be available at `http://localhost:8000`.

## 📚 API Documentation

Once running, visit the interactive Swagger UI at:
- **URL**: [http://localhost:8000/docs](http://localhost:8000/docs)

This UI allows you to execute requests directly from the browser.

## 🧪 Manual Testing Guide (Postman / Curl)

Here is a step-by-step guide to testing the Task API endpoints manually.

### 1. Sign Up (Create User)
**POST** `/api/auth/signup`
```json
{
  "email": "test@example.com",
  "password": "password123",
  "username": "testuser"
}
```

### 2. Sign In (Get Token)
**POST** `/api/auth/signin`
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```
**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1Ni...",
  "user": {
    "id": "USER_ID_UUID",
    "email": "test@example.com",
    ...
  }
}
```
> **Copy the `token` and `user.id` from the response.** You will need them for all subsequent requests.

### 3. Authentication Headers
For all following requests, add the header:
- `Authorization`: `Bearer <YOUR_TOKEN>`

### 4. Task Operations

#### A. List Tasks
**GET** `/api/{user_id}/tasks`
- Replace `{user_id}` with the UUID from the Sign In response.
- Response: `[]` (Empty list initially)

#### B. Create a Task
**POST** `/api/{user_id}/tasks`
- Body:
```json
{
  "content": "Buy groceries"
}
```
- Response:
```json
{
  "id": "TASK_ID_UUID",
  "content": "Buy groceries",
  "completed": false,
  "user_id": "...",
  "created_at": "..."
}
```

#### C. Get Task Details
**GET** `/api/{user_id}/tasks/{task_id}`
- Replace `{task_id}` with the UUID from step B.

#### D. Update Task Content
**PUT** `/api/{user_id}/tasks/{task_id}`
- Body:
```json
{
  "content": "Buy groceries and milk",
  "completed": false
}
```

#### E. Toggle Completion (New Feature)
**PATCH** `/api/{user_id}/tasks/{task_id}/complete`
- No body required.
- Toggles `completed` status (false -> true).

#### F. Delete Task
**DELETE** `/api/{user_id}/tasks/{task_id}`
- Response: 204 No Content

## 🔒 Security Verification

Try accessing these endpoints with:
1. No Token -> Should return **401 Unauthorized**.
2. A different `user_id` in the URL (e.g. valid token for User A, but URL has User B's ID) -> Should return **403 Forbidden** "You can only access your own tasks".
