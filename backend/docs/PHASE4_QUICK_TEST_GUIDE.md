# Phase 4 Quick Test Guide: Conversation Context and History

**Feature**: Multi-turn conversations with context retention and automatic summarization
**Prerequisites**: Phase 3 complete, backend server running, valid JWT token

## Quick Start

### 1. Start Backend Server
```bash
cd D:\Tayyab\AI-Hackathon\hackathon2-todo-app\backend
uvicorn src.main:app --reload --port 8000
```

### 2. Get JWT Token
```bash
# Sign up or sign in to get JWT token
curl -X POST http://localhost:8000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "your_password"}'

# Extract token from response
export JWT_TOKEN="your_jwt_token_here"
export USER_ID="your_user_id_here"
```

## Test Scenarios

### Test 1: Context Retention (Basic Multi-Turn)

**Objective**: Verify AI remembers previous conversation context

```bash
# Step 1: First message - List tasks
curl -X POST http://localhost:8000/api/${USER_ID}/chat \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Show me my pending tasks"
  }'

# Response will include conversation_id
# Example: {"conversation_id": "550e8400-e29b-41d4-a716-446655440000", ...}

# Step 2: Second message - Reference first task (with conversation_id)
curl -X POST http://localhost:8000/api/${USER_ID}/chat \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mark the first one as done",
    "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
  }'

# Expected: AI remembers which tasks were shown and marks the correct one
```

**Success Criteria**:
- ✓ AI correctly identifies "the first one" from previous message
- ✓ Task is marked as complete
- ✓ Response confirms which task was completed

### Test 2: Task Creation with Follow-up Update

**Objective**: Verify AI remembers just-created task

```bash
# Step 1: Create a task
curl -X POST http://localhost:8000/api/${USER_ID}/chat \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy groceries tomorrow"
  }'

# Note the conversation_id from response

# Step 2: Update the task (within same conversation)
curl -X POST http://localhost:8000/api/${USER_ID}/chat \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Actually, change it to include milk and bread",
    "conversation_id": "YOUR_CONVERSATION_ID"
  }'

# Expected: AI updates the grocery task to "Buy groceries, milk and bread"
```

**Success Criteria**:
- ✓ AI identifies which task to update (the just-created one)
- ✓ Task title is updated correctly
- ✓ No new task is created

### Test 3: Title Generation

**Objective**: Verify conversation titles are auto-generated

```bash
# Test various message formats
curl -X POST http://localhost:8000/api/${USER_ID}/chat \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to buy groceries"
  }'

# Check database or API response for conversation title
# Expected title: "Buy groceries" (not "Add a task to buy groceries")
```

**Test Cases**:
| Input Message | Expected Title |
|--------------|----------------|
| "Add a task to buy groceries" | "Buy groceries" |
| "Create a task for team meeting" | "Team meeting" |
| "Show me my tasks" | "Show me my tasks" |
| "I need to prepare presentation" | "Prepare presentation" |

**Success Criteria**:
- ✓ Title is extracted from first message
- ✓ Common action phrases are stripped
- ✓ Title is max 50 characters
- ✓ Title is capitalized

### Test 4: Token Counting and Summarization

**Objective**: Verify automatic summarization at 600 token threshold

```bash
# Send multiple messages to exceed 600 tokens
# Each message ~50-100 tokens

for i in {1..15}; do
  curl -X POST http://localhost:8000/api/${USER_ID}/chat \
    -H "Authorization: Bearer ${JWT_TOKEN}" \
    -H "Content-Type: application/json" \
    -d "{
      \"message\": \"Add a task to complete project milestone $i with detailed description and requirements\",
      \"conversation_id\": \"YOUR_CONVERSATION_ID\"
    }"
  sleep 2
done

# After ~12-15 messages, check backend logs for summarization
# Expected: "Summarization triggered" or similar log message
```

**Success Criteria**:
- ✓ Token count increases with each message
- ✓ Summarization triggers when >600 tokens
- ✓ History is condensed (last 3 messages + summary)
- ✓ Context is preserved after summarization

### Test 5: History Persistence

**Objective**: Verify history is retrieved from database

```bash
# Step 1: Start conversation
curl -X POST http://localhost:8000/api/${USER_ID}/chat \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Add a task to review code"
  }'

# Note conversation_id

# Step 2: Wait (simulate time passing)
sleep 60

# Step 3: Continue conversation
curl -X POST http://localhost:8000/api/${USER_ID}/chat \
  -H "Authorization: Bearer ${JWT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Mark that task as done",
    "conversation_id": "YOUR_CONVERSATION_ID"
  }'

# Expected: AI remembers "that task" refers to "review code"
```

**Success Criteria**:
- ✓ History is fetched from database
- ✓ Context is maintained across time
- ✓ AI correctly identifies referenced task

## Debugging

### Check Token Count
```python
# In Python shell
from backend.src.agents.history_manager import count_tokens

messages = [
    {"role": "user", "content": "Show my tasks"},
    {"role": "assistant", "content": "Here are your tasks: Task 1, Task 2, Task 3"}
]

token_count = count_tokens(messages)
print(f"Token count: {token_count}")
```

### Check Title Generation
```python
from backend.src.services.chat_service import generate_conversation_title

test_messages = [
    "Add a task to buy groceries",
    "Create a task for team meeting",
    "Show me my tasks",
    "I need to prepare presentation"
]

for msg in test_messages:
    title = generate_conversation_title(msg)
    print(f"{msg} → {title}")
```

### Check History Retrieval
```python
# Check database directly
import asyncio
from sqlmodel import select
from backend.src.db import get_session
from backend.src.models.message import Message

async def check_history(conversation_id):
    async with get_session() as session:
        statement = select(Message).where(
            Message.conversation_id == conversation_id
        ).order_by(Message.created_at)

        result = await session.execute(statement)
        messages = result.scalars().all()

        for msg in messages:
            print(f"{msg.role}: {msg.content[:50]}...")

# Run
asyncio.run(check_history("YOUR_CONVERSATION_ID"))
```

## Common Issues

### Issue 1: History Not Retrieved
**Symptom**: AI doesn't remember previous messages
**Causes**:
- conversation_id not included in request
- conversation_id doesn't exist
- User isolation check failing

**Solution**:
```bash
# Verify conversation exists
curl http://localhost:8000/api/${USER_ID}/conversations/${CONVERSATION_ID} \
  -H "Authorization: Bearer ${JWT_TOKEN}"
```

### Issue 2: Summarization Not Triggering
**Symptom**: Long conversations don't get summarized
**Causes**:
- Token count below 600
- Summarization failing silently

**Solution**:
- Check backend logs for errors
- Verify OPENROUTER_API_KEY is set
- Test token counting function directly

### Issue 3: Title Not Generated
**Symptom**: Conversation title is null
**Causes**:
- Title generation logic not executing
- Empty message

**Solution**:
- Check if conversation is new
- Verify message is not empty
- Check database for title field

## Performance Benchmarks

Expected response times:
- **First message** (no history): ~2-3 seconds
- **Subsequent messages** (with history): ~2-4 seconds
- **With summarization**: ~4-6 seconds (one-time cost)

Token counts:
- **Typical message**: 10-50 tokens
- **Typical conversation** (10 messages): 200-500 tokens
- **Summarization trigger**: >600 tokens (~12-15 messages)

## Verification Checklist

After running tests, verify:

- [ ] Multi-turn conversations work (Test 1)
- [ ] Context is maintained across messages (Test 2)
- [ ] Titles are auto-generated (Test 3)
- [ ] Token counting works (Test 4)
- [ ] Summarization triggers at 600 tokens (Test 4)
- [ ] History persists in database (Test 5)
- [ ] User isolation is enforced
- [ ] Error handling works gracefully

## Next Steps

If all tests pass:
1. ✓ Phase 4 is complete and functional
2. → Move to Phase 5 (User Story 3 - Action Confirmation)
3. → Or move to Phase 6 (User Story 4 - Tool Chaining)
4. → Or move to Phase 7 (Polish & Production Readiness)

If tests fail:
1. Check backend logs for errors
2. Verify environment variables (OPENROUTER_API_KEY, DATABASE_URL)
3. Ensure Phase 3 is working correctly
4. Review implementation summary for troubleshooting

## Support

For issues or questions:
1. Check PHASE4_IMPLEMENTATION_SUMMARY.md for detailed documentation
2. Review backend logs: `tail -f backend/logs/app.log`
3. Test individual functions in Python shell
4. Verify database state with SQL queries
