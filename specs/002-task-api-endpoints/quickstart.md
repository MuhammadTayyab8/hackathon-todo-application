# Quickstart: Task API Endpoints

## Prerequisites
1. Ensure Backend is running: `cd backend && uvicorn src.main:app --reload`
2. Ensure Frontend is running: `cd frontend && npm run dev`
3. Ensure Database is accessible via `DATABASE_URL`

## Testing with Curl

### 1. Authenticate & Get Token
First, sign in to get a JWT token.
```bash
TOKEN="YOUR_JWT_TOKEN"
USER_ID="YOUR_USER_ID"
BASE_URL="http://localhost:8000/api"
```

### 2. List Tasks
```bash
curl -X GET "$BASE_URL/$USER_ID/tasks" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Create Task
```bash
curl -X POST "$BASE_URL/$USER_ID/tasks" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "Buy milk"}'
```

### 4. Toggle Completion
```bash
TASK_ID="TARGET_TASK_ID"
curl -X PATCH "$BASE_URL/$USER_ID/tasks/$TASK_ID/complete" \
  -H "Authorization: Bearer $TOKEN"
```
