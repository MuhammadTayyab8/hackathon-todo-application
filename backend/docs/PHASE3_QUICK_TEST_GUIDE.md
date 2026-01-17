# Phase 3 Implementation - Quick Test Guide

## Prerequisites

1. **Environment Variables** (in `backend/.env`):
```bash
DATABASE_URL=postgresql+asyncpg://user:pass@host/db
BETTER_AUTH_SECRET=your_jwt_secret_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

2. **Database Migrations Applied**:
```bash
cd backend
alembic upgrade head
```

3. **Dependencies Installed**:
```bash
cd backend
pip install -r requirements.txt
```

## Starting the Server

```bash
cd backend
uvicorn src.main:app --reload --port 8000
```

Server will be available at: `http://localhost:8000`
API docs at: `http://localhost:8000/docs`

## Testing the Chat Endpoint

### Step 1: Create a Test User

```bash
curl -X POST "http://localhost:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "SecurePass123!"
  }'
```

**Save the response**:
- `user.id` - Your user_id
- `token` - Your JWT token

### Step 2: Test Chat Endpoint - Create Task

```bash
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy groceries tomorrow"
  }'
```

**Expected Response**:
```json
{
  "conversation_id": "uuid-here",
  "message": "I've created a task 'Buy groceries' with due date tomorrow.",
  "created_at": "2026-01-17T10:30:00Z"
}
```

### Step 3: Test Chat Endpoint - List Tasks

```bash
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my pending tasks",
    "conversation_id": "{conversation_id_from_step2}"
  }'
```

### Step 4: Test Chat Endpoint - Complete Task

```bash
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mark the grocery task as done",
    "conversation_id": "{conversation_id}"
  }'
```

### Step 5: Test Chat Endpoint - Update Task

```bash
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Change the grocery task to Buy groceries and milk",
    "conversation_id": "{conversation_id}"
  }'
```

### Step 6: Test Chat Endpoint - Delete Task

```bash
curl -X POST "http://localhost:8000/api/{user_id}/chat" \
  -H "Authorization: Bearer {jwt_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Delete the grocery task",
    "conversation_id": "{conversation_id}"
  }'
```

## Testing with Swagger UI

1. Open `http://localhost:8000/docs`
2. Click "Authorize" button
3. Enter your JWT token in format: `Bearer {token}`
4. Navigate to `/api/{user_id}/chat` endpoint
5. Click "Try it out"
6. Fill in user_id and request body
7. Click "Execute"

## Verifying Database

Check that conversations and messages are stored:

```sql
-- Check conversations
SELECT * FROM conversation WHERE user_id = '{user_id}';

-- Check messages
SELECT * FROM message WHERE conversation_id = '{conversation_id}' ORDER BY created_at;

-- Check tasks created via chat
SELECT * FROM task WHERE user_id = '{user_id}';
```

## Troubleshooting

### Error: "Missing authorization token"
- Ensure you're passing the JWT token in Authorization header
- Format: `Authorization: Bearer {token}`

### Error: "User ID in URL does not match authenticated user"
- Ensure the user_id in the URL matches the user_id from your JWT token

### Error: "Task management service is temporarily unavailable"
- Check that MCP server can be started: `python backend/mcp_server_main.py`
- Verify DATABASE_URL is correct in .env

### Error: "OPENROUTER_API_KEY environment variable is not set"
- Add OPENROUTER_API_KEY to backend/.env file
- Get API key from: https://openrouter.ai/

### Agent not calling tools correctly
- Check OpenRouter API key is valid
- Verify MCP server is accessible
- Check backend logs for detailed error messages

## Success Criteria

Phase 3 is successful if:
- ✅ POST /api/{user_id}/chat endpoint responds with 200
- ✅ Agent creates tasks when asked
- ✅ Agent lists tasks when asked
- ✅ Agent completes tasks when asked
- ✅ Agent updates tasks when asked
- ✅ Agent deletes tasks when asked
- ✅ Conversation history is stored in database
- ✅ Messages are stored in database
- ✅ JWT authentication works correctly
- ✅ User isolation is enforced

## Next Steps

After verifying Phase 3 works:

1. **Phase 4 (Optional)**: Add conversation history and context
2. **Phase 5 (Optional)**: Add confirmation for destructive operations
3. **Phase 6 (Optional)**: Add tool chaining for complex requests
4. **Frontend Integration**: Connect Next.js frontend to chat endpoint
5. **Production Deployment**: Deploy to production environment

## Files Modified/Created

### Created:
- `backend/src/api/routes/chat.py` - Chat endpoint and models
- `backend/PHASE3_IMPLEMENTATION_SUMMARY.md` - Detailed implementation summary
- `backend/PHASE3_QUICK_TEST_GUIDE.md` - This file

### Modified:
- `backend/src/agents/task_agent.py` - Agent initialization and runner
- `backend/src/services/chat_service.py` - Chat message processing
- `backend/src/main.py` - Router registration
- `specs/002-ai-chatbot-agent/tasks.md` - Marked T024-T032 complete

## Support

If you encounter issues:
1. Check backend logs for detailed error messages
2. Verify all environment variables are set
3. Ensure database migrations are applied
4. Test MCP server independently
5. Verify OpenRouter API key is valid
