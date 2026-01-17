# Phase 5: Confirmation Workflow Test Documentation

## Overview
This document provides test scenarios for User Story 3 - Action Confirmation for Destructive Operations.

**Feature**: AI agent asks for user confirmation before executing destructive operations to prevent accidental data loss.

**Implementation**: Confirmation logic is embedded in agent system instructions in `backend/src/agents/task_agent.py`

---

## Test Scenarios

### Scenario 1: Delete All Tasks - User Confirms

**Objective**: Verify agent asks for confirmation and deletes tasks when user confirms

**Prerequisites**:
- User has at least 5 tasks in the database
- User is authenticated with valid JWT token

**Test Steps**:
1. Send POST request to `/api/{user_id}/chat`:
   ```json
   {
     "message": "Delete all my tasks"
   }
   ```

2. Verify agent response asks for confirmation:
   - Response should include: "Are you sure you want to delete"
   - Response should include task count (e.g., "12 tasks")
   - Response should include warning: "This cannot be undone"

3. Send follow-up POST request with same `conversation_id`:
   ```json
   {
     "message": "Yes, delete them",
     "conversation_id": "<conversation_id_from_step_1>"
   }
   ```

4. Verify agent response confirms deletion:
   - Response should confirm tasks were deleted
   - Response should list deleted task titles (if possible)
   - Response should include count of deleted tasks

5. Verify database state:
   - Query database to confirm all tasks for user are deleted
   - Verify conversation history contains both messages

**Expected Results**:
- ✓ Agent asks for confirmation before deleting
- ✓ Agent waits for user response
- ✓ Agent executes deletion after confirmation
- ✓ All tasks are deleted from database
- ✓ Conversation history is preserved

---

### Scenario 2: Delete All Tasks - User Declines

**Objective**: Verify agent respects user's decision to cancel deletion

**Prerequisites**:
- User has at least 5 tasks in the database
- User is authenticated with valid JWT token

**Test Steps**:
1. Send POST request to `/api/{user_id}/chat`:
   ```json
   {
     "message": "Delete all my tasks"
   }
   ```

2. Verify agent response asks for confirmation:
   - Response should include: "Are you sure you want to delete"
   - Response should include task count
   - Response should include warning: "This cannot be undone"

3. Send follow-up POST request with same `conversation_id`:
   ```json
   {
     "message": "No, cancel that",
     "conversation_id": "<conversation_id_from_step_1>"
   }
   ```

4. Verify agent response confirms cancellation:
   - Response should confirm operation was cancelled
   - Response should state: "No tasks were deleted"
   - Response should be reassuring

5. Verify database state:
   - Query database to confirm all tasks still exist
   - Verify no tasks were deleted

**Expected Results**:
- ✓ Agent asks for confirmation before deleting
- ✓ Agent respects user's decline
- ✓ No tasks are deleted from database
- ✓ Agent confirms cancellation clearly
- ✓ Conversation history is preserved

---

### Scenario 3: Bulk Complete Operation (10+ Tasks) - User Confirms

**Objective**: Verify agent asks for confirmation for bulk operations affecting many items

**Prerequisites**:
- User has at least 10 pending tasks in the database
- User is authenticated with valid JWT token

**Test Steps**:
1. Send POST request to `/api/{user_id}/chat`:
   ```json
   {
     "message": "Mark all pending tasks as done"
   }
   ```

2. Verify agent response asks for confirmation:
   - Response should include: "Are you sure you want to mark"
   - Response should include task count (e.g., "15 pending tasks")
   - Response may include warning about bulk operation

3. Send follow-up POST request with same `conversation_id`:
   ```json
   {
     "message": "Yes, proceed",
     "conversation_id": "<conversation_id_from_step_1>"
   }
   ```

4. Verify agent response confirms completion:
   - Response should confirm tasks were marked as completed
   - Response should include count of completed tasks

5. Verify database state:
   - Query database to confirm all pending tasks are now completed
   - Verify `status` field is updated to "completed"

**Expected Results**:
- ✓ Agent asks for confirmation for bulk operation (10+ items)
- ✓ Agent executes bulk complete after confirmation
- ✓ All pending tasks are marked as completed
- ✓ Database reflects updated status

---

### Scenario 4: Single Task Delete - No Confirmation Required

**Objective**: Verify agent does NOT ask for confirmation for single task deletion

**Prerequisites**:
- User has a task titled "Buy groceries" in the database
- User is authenticated with valid JWT token

**Test Steps**:
1. Send POST request to `/api/{user_id}/chat`:
   ```json
   {
     "message": "Delete the grocery task"
   }
   ```

2. Verify agent response:
   - Response should confirm deletion immediately
   - Response should NOT ask for confirmation
   - Response should state: "I've deleted the task 'Buy groceries'"

3. Verify database state:
   - Query database to confirm task is deleted
   - Verify only the specified task was deleted

**Expected Results**:
- ✓ Agent deletes single task without asking for confirmation
- ✓ Task is deleted from database
- ✓ Agent confirms deletion clearly

**Note**: This scenario verifies that confirmation is only required for bulk/destructive operations, not single operations.

---

### Scenario 5: Delete All Completed Tasks - User Confirms

**Objective**: Verify agent asks for confirmation when deleting multiple completed tasks

**Prerequisites**:
- User has at least 5 completed tasks in the database
- User has some pending tasks (to verify only completed are deleted)
- User is authenticated with valid JWT token

**Test Steps**:
1. Send POST request to `/api/{user_id}/chat`:
   ```json
   {
     "message": "Delete all my completed tasks"
   }
   ```

2. Verify agent response asks for confirmation:
   - Response should include: "Are you sure you want to delete"
   - Response should specify "completed tasks"
   - Response should include count (e.g., "5 completed tasks")
   - Response should include warning: "This cannot be undone"

3. Send follow-up POST request with same `conversation_id`:
   ```json
   {
     "message": "Yes, delete them",
     "conversation_id": "<conversation_id_from_step_1>"
   }
   ```

4. Verify agent response confirms deletion:
   - Response should confirm completed tasks were deleted
   - Response should list deleted task titles
   - Response should include count

5. Verify database state:
   - Query database to confirm only completed tasks are deleted
   - Verify pending tasks still exist
   - Verify correct tasks were deleted

**Expected Results**:
- ✓ Agent asks for confirmation before deleting
- ✓ Agent correctly identifies completed tasks
- ✓ Only completed tasks are deleted
- ✓ Pending tasks remain in database
- ✓ Agent provides detailed confirmation

---

### Scenario 6: Ambiguous Delete Request - Clarification Then Confirmation

**Objective**: Verify agent asks for clarification first, then confirmation

**Prerequisites**:
- User has multiple tasks with similar names (e.g., "Buy groceries", "Buy milk", "Buy bread")
- User is authenticated with valid JWT token

**Test Steps**:
1. Send POST request to `/api/{user_id}/chat`:
   ```json
   {
     "message": "Delete the task"
   }
   ```

2. Verify agent response asks for clarification:
   - Response should list matching tasks
   - Response should ask which task to delete
   - Response should provide numbered options

3. Send follow-up POST request with same `conversation_id`:
   ```json
   {
     "message": "The first one",
     "conversation_id": "<conversation_id_from_step_1>"
   }
   ```

4. Verify agent response asks for confirmation:
   - Response should ask: "Are you sure you want to delete 'Buy groceries'?"
   - Response should include warning: "This cannot be undone"

5. Send follow-up POST request with same `conversation_id`:
   ```json
   {
     "message": "Yes",
     "conversation_id": "<conversation_id_from_step_1>"
   }
   ```

6. Verify agent response confirms deletion:
   - Response should confirm task was deleted
   - Response should specify which task was deleted

7. Verify database state:
   - Query database to confirm correct task is deleted
   - Verify other tasks still exist

**Expected Results**:
- ✓ Agent asks for clarification when request is ambiguous
- ✓ Agent asks for confirmation after clarification
- ✓ Agent executes deletion after both clarification and confirmation
- ✓ Correct task is deleted from database
- ✓ Multi-turn conversation context is maintained

---

## Verification Checklist

### Functional Requirements
- [ ] Agent detects destructive operations (delete, bulk actions)
- [ ] Agent asks for confirmation with specific details
- [ ] Agent waits for user response before executing
- [ ] Agent recognizes confirmation phrases ("yes", "confirm", "proceed", etc.)
- [ ] Agent recognizes decline phrases ("no", "cancel", "stop", etc.)
- [ ] Agent executes operation when user confirms
- [ ] Agent cancels operation when user declines
- [ ] Agent provides clear feedback on completion or cancellation

### Confirmation Triggers
- [ ] Any delete operation (single or bulk)
- [ ] Bulk operations affecting 5+ items
- [ ] Operations with "all", "everything" keywords
- [ ] Operations that cannot be undone

### No Confirmation Required
- [ ] Single task operations (complete, update)
- [ ] Listing/viewing tasks
- [ ] Creating new tasks
- [ ] Reversible operations

### Conversation Context
- [ ] Confirmation workflow works across multiple messages
- [ ] Conversation history is preserved
- [ ] Agent maintains context between confirmation request and response
- [ ] Multi-turn conversations work correctly

### Error Handling
- [ ] Agent handles ambiguous confirmation responses
- [ ] Agent handles invalid task IDs gracefully
- [ ] Agent handles database errors during deletion
- [ ] Agent provides user-friendly error messages

---

## Test Execution Notes

### Setup
1. Ensure backend server is running: `uvicorn main:app --reload --port 8000`
2. Ensure database is accessible and migrations are applied
3. Create test user and obtain JWT token
4. Populate database with test tasks

### Tools
- **API Client**: Postman, curl, or Python requests library
- **Database Client**: psql, pgAdmin, or DBeaver
- **Logs**: Check backend logs for agent behavior

### Test Data
Create test tasks with various properties:
- Mix of pending and completed tasks
- Tasks with different priorities
- Tasks with similar names (for ambiguity testing)
- At least 10-15 tasks for bulk operation testing

### Validation
After each test:
1. Check API response for expected confirmation/cancellation messages
2. Query database to verify data integrity
3. Check conversation history in database
4. Review backend logs for any errors

---

## Known Limitations

1. **Single Task Deletion**: Agent uses judgment to determine if confirmation is needed. May vary based on context.
2. **Confirmation Phrases**: Agent relies on natural language understanding. Edge cases may require clarification.
3. **Bulk Threshold**: 5+ items trigger confirmation. This threshold is configurable in system instructions.
4. **Tool Chaining**: Confirmation workflow may interact with tool chaining. Test complex scenarios carefully.

---

## Success Criteria

Phase 5 is considered complete when:
- ✓ All 6 test scenarios pass
- ✓ All items in verification checklist are checked
- ✓ Agent consistently asks for confirmation for destructive operations
- ✓ Agent respects user's confirmation or decline decisions
- ✓ No accidental data loss occurs during testing
- ✓ Conversation context is maintained throughout confirmation workflow

---

## Related Files

- **Agent Configuration**: `backend/src/agents/task_agent.py`
- **System Instructions**: `SYSTEM_INSTRUCTIONS` constant in task_agent.py
- **Chat Service**: `backend/src/services/chat_service.py`
- **Chat Routes**: `backend/src/routes/chat.py`
- **Tasks Specification**: `specs/002-ai-chatbot-agent/tasks.md`

---

## Revision History

- **2026-01-17**: Initial test documentation created for Phase 5 (T042)
