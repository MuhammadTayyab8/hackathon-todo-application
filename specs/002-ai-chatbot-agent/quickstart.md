# Quickstart Guide: AI Chatbot Agent

**Feature**: AI Chatbot Agent for Task Management
**Date**: 2026-01-17
**Audience**: Developers implementing and testing the chatbot feature

## Overview

This guide provides step-by-step instructions for setting up, running, and testing the AI Chatbot Agent feature. Follow these steps to get the chatbot operational in your local development environment.

---

## Prerequisites

Before starting, ensure you have:

1. **MCP Server Running**: Sub-Phase 1 MCP server must be operational
   - Verify: `python backend/mcp_server_main.py` runs without errors
   - MCP server provides 5 tools: add_task, list_tasks, complete_task, update_task, delete_task

2. **Database Setup**: Neon PostgreSQL database with migrations applied
   - Conversation and Message tables created
   - User table exists (from Better Auth)

3. **Better Auth Configured**: JWT authentication working
   - Users can sign up and sign in
   - JWT tokens are issued and can be verified

4. **OpenRouter Account**: API key for accessing Gemini 2.5 Flash
   - Sign up at https://openrouter.ai
   - Get API key from dashboard
   - Free tier sufficient for development

5. **Python Environment**: Python 3.11+ with pip or uv

---

## Step 1: Environment Setup

### 1.1 Configure Environment Variables

Create or update `.env` file in `backend/` directory:

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:password@host/database

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here

# OpenRouter
OPENROUTER_API_KEY=your-openrouter-api-key-here

# Optional: Logging
LOG_LEVEL=INFO
```

### 1.2 Verify Environment Variables

```bash
cd backend
python -c "import os; from dotenv import load_dotenv; load_dotenv(); print('DATABASE_URL:', os.getenv('DATABASE_URL')[:20]); print('OPENROUTER_API_KEY:', 'Set' if os.getenv('OPENROUTER_API_KEY') else 'Missing')"
```

Expected output:
```
DATABASE_URL: postgresql+asyncpg:
OPENROUTER_API_KEY: Set
```

---

## Step 2: Install Dependencies

### 2.1 Install Python Packages

```bash
cd backend

# Using pip
pip install openai-agents openai tiktoken sqlmodel fastapi uvicorn python-dotenv

# OR using uv (faster)
uv add openai-agents openai tiktoken sqlmodel fastapi uvicorn python-dotenv
```

### 2.2 Verify Installation

```bash
python -c "import agents; import openai; import tiktoken; print('All packages installed successfully')"
```

---

## Step 3: Database Migrations

### 3.1 Generate Migration

```bash
cd backend

# Using Alembic
alembic revision --autogenerate -m "Add conversation and message tables"
```

### 3.2 Apply Migration

```bash
alembic upgrade head
```

### 3.3 Verify Tables

```bash
# Connect to database and verify tables exist
psql $DATABASE_URL -c "\dt conversation"
psql $DATABASE_URL -c "\dt message"
```

Expected output:
```
           List of relations
 Schema |     Name     | Type  | Owner
--------+--------------+-------+-------
 public | conversation | table | user
 public | message      | table | user
```

---

## Step 4: Run Backend Server

### 4.1 Start FastAPI Server

```bash
cd backend
uvicorn main:app --reload --port 8000
```

Expected output:
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [12345] using StatReload
INFO:     Started server process [12346]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

### 4.2 Verify Server Health

```bash
curl http://localhost:8000/health
```

Expected response:
```json
{"status": "healthy"}
```

---

## Step 5: Test Chat Endpoint

### 5.1 Get JWT Token

First, authenticate to get a JWT token:

```bash
# Sign in (adjust URL and credentials)
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

Response will include JWT token:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {"id": "user_123", "email": "test@example.com"}
}
```

Save the token for subsequent requests.

### 5.2 Test: Create Task via Chat

```bash
# Set variables
export JWT_TOKEN="your-jwt-token-here"
export USER_ID="user_123"

# Send chat message
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy groceries tomorrow"
  }'
```

Expected response:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "I've created a task 'Buy groceries' with due date tomorrow (2026-01-18).",
  "created_at": "2026-01-17T10:30:00Z"
}
```

### 5.3 Test: List Tasks via Chat

```bash
# Continue conversation (use conversation_id from previous response)
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my pending tasks",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

Expected response:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "You have 1 pending task:\n1. Buy groceries (due tomorrow)",
  "created_at": "2026-01-17T10:31:00Z"
}
```

### 5.4 Test: Complete Task via Chat

```bash
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mark the grocery task as done",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

Expected response:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "I've marked the task 'Buy groceries' as completed.",
  "created_at": "2026-01-17T10:32:00Z"
}
```

### 5.5 Test: Tool Chaining

```bash
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show my tasks and mark the first one complete",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

Expected response:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "message": "You have 2 pending tasks:\n1. Finish report (due Friday)\n2. Call dentist (no due date)\n\nI've marked 'Finish report' as completed.",
  "created_at": "2026-01-17T10:33:00Z"
}
```

---

## Step 6: Verify Database

### 6.1 Check Conversation Table

```bash
psql $DATABASE_URL -c "SELECT id, user_id, title, created_at FROM conversation ORDER BY created_at DESC LIMIT 5;"
```

Expected output:
```
                  id                  |  user_id  |         title          |       created_at
--------------------------------------+-----------+------------------------+------------------------
 550e8400-e29b-41d4-a716-446655440000 | user_123  | Task Management        | 2026-01-17 10:30:00
```

### 6.2 Check Message Table

```bash
psql $DATABASE_URL -c "SELECT id, conversation_id, role, LEFT(content, 50) as content_preview, created_at FROM message ORDER BY created_at DESC LIMIT 10;"
```

Expected output:
```
                  id                  |           conversation_id            |   role    |              content_preview               |       created_at
--------------------------------------+--------------------------------------+-----------+--------------------------------------------+------------------------
 660e8400-e29b-41d4-a716-446655440001 | 550e8400-e29b-41d4-a716-446655440000 | user      | Add a task to buy groceries tomorrow       | 2026-01-17 10:30:00
 660e8400-e29b-41d4-a716-446655440002 | 550e8400-e29b-41d4-a716-446655440000 | assistant | I've created a task 'Buy groceries' with   | 2026-01-17 10:30:01
 660e8400-e29b-41d4-a716-446655440003 | 550e8400-e29b-41d4-a716-446655440000 | user      | Show me my pending tasks                   | 2026-01-17 10:31:00
 660e8400-e29b-41d4-a716-446655440004 | 550e8400-e29b-41d4-a716-446655440000 | assistant | You have 1 pending task:                   | 2026-01-17 10:31:01
```

---

## Step 7: Test Conversation History

### 7.1 Send Multiple Messages

```bash
# Message 1
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task to write report"}'

# Message 2 (use conversation_id from response)
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "What tasks do I have?", "conversation_id": "CONV_ID_HERE"}'

# Message 3 (agent should remember context)
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Mark the first one as done", "conversation_id": "CONV_ID_HERE"}'
```

The agent should remember which tasks were listed and mark the correct one.

### 7.2 Test History Summarization

Send 15+ messages to trigger summarization (>600 tokens):

```bash
# Send multiple messages in same conversation
for i in {1..15}; do
  curl -X POST http://localhost:8000/api/$USER_ID/chat \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Add a task number $i\", \"conversation_id\": \"CONV_ID_HERE\"}"
  sleep 2
done
```

Check logs for summarization trigger:
```
INFO: Conversation history exceeds 600 tokens (actual: 650), triggering summarization
INFO: History summarized from 15 messages to 1 summary + 3 recent messages
```

---

## Step 8: Test Error Handling

### 8.1 Test Invalid JWT

```bash
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer invalid-token" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task"}'
```

Expected response (401):
```json
{
  "detail": "Invalid or expired JWT token"
}
```

### 8.2 Test Missing Message

```bash
curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected response (400):
```json
{
  "detail": "Message text is required"
}
```

### 8.3 Test User ID Mismatch

```bash
curl -X POST http://localhost:8000/api/different_user_id/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Add a task"}'
```

Expected response (401):
```json
{
  "detail": "User ID in URL does not match authenticated user"
}
```

---

## Step 9: Monitor and Debug

### 9.1 Check Server Logs

```bash
# View FastAPI logs
tail -f backend/logs/app.log

# Look for:
# - Agent initialization
# - MCP tool calls
# - Token counting
# - Summarization triggers
# - Error messages
```

### 9.2 Enable Debug Logging

Update `.env`:
```bash
LOG_LEVEL=DEBUG
```

Restart server to see detailed logs:
```
DEBUG: Fetching conversation history for conversation_id=550e8400...
DEBUG: Found 5 messages in history
DEBUG: Token count: 450 (below 600 threshold, no summarization needed)
DEBUG: Building message array with 5 history messages + 1 new message
DEBUG: Running agent with 6 messages
DEBUG: Agent invoked tool: list_tasks
DEBUG: MCP tool response: {"tasks": [...]}
DEBUG: Storing user message and assistant response
```

### 9.3 Test MCP Server Connectivity

```bash
# Verify MCP server is running
python backend/mcp_server_main.py &

# Test MCP tool directly
python -c "
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

async def test():
    params = StdioServerParameters(command='python', args=['backend/mcp_server_main.py'])
    async with stdio_client(params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            tools = await session.list_tools()
            print(f'Available tools: {[t.name for t in tools.tools]}')

asyncio.run(test())
"
```

Expected output:
```
Available tools: ['add_task', 'list_tasks', 'complete_task', 'update_task', 'delete_task']
```

---

## Step 10: Performance Testing

### 10.1 Test Response Time

```bash
# Measure response time for simple request
time curl -X POST http://localhost:8000/api/$USER_ID/chat \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Show my tasks"}'
```

Expected: <3 seconds for simple requests

### 10.2 Test Concurrent Requests

```bash
# Send 10 concurrent requests
for i in {1..10}; do
  curl -X POST http://localhost:8000/api/$USER_ID/chat \
    -H "Authorization: Bearer $JWT_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{\"message\": \"Add task $i\"}" &
done
wait
```

All requests should complete successfully.

---

## Troubleshooting

### Issue: "Database not initialized"

**Solution**: Ensure DATABASE_URL is set and migrations are applied
```bash
echo $DATABASE_URL
alembic upgrade head
```

### Issue: "OpenRouter API key not found"

**Solution**: Set OPENROUTER_API_KEY in .env
```bash
export OPENROUTER_API_KEY=your-key-here
```

### Issue: "MCP server unavailable"

**Solution**: Verify MCP server is running
```bash
python backend/mcp_server_main.py
```

### Issue: "Rate limit exceeded"

**Solution**: Wait 60 seconds or upgrade OpenRouter plan
```bash
# Free tier: 10 requests/minute
# Wait and retry
sleep 60
```

### Issue: "Conversation not found"

**Solution**: Verify conversation_id belongs to authenticated user
```bash
psql $DATABASE_URL -c "SELECT id, user_id FROM conversation WHERE id='CONV_ID_HERE';"
```

---

## Next Steps

1. **Frontend Integration**: Build chat UI components in Next.js
2. **Production Deployment**: Configure production environment variables
3. **Monitoring**: Set up logging and error tracking
4. **Rate Limiting**: Implement rate limiting for production
5. **Testing**: Run full test suite with pytest

---

## Summary

You should now have:
- ✅ Backend server running on http://localhost:8000
- ✅ Chat endpoint responding to requests
- ✅ Conversation history persisted in database
- ✅ MCP tools invoked successfully
- ✅ Error handling working correctly

**Success Criteria Met**:
- Users can send natural language messages
- Agent correctly invokes MCP tools
- Conversation context is maintained
- History is persisted in database
- Response times are <3 seconds

**Ready for**: Task breakdown (`/sp.tasks`) and implementation (`/sp.implement`)
