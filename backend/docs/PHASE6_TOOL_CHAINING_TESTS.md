# Phase 6: Tool Chaining Test Documentation

## Overview

This document provides comprehensive test scenarios for validating tool chaining functionality in the AI chatbot agent. Tool chaining allows the agent to execute multiple tool calls in logical order to fulfill complex user requests in a single interaction.

## Test Environment Setup

**Prerequisites**:
- Backend server running on port 8000
- Valid JWT token for authentication
- Database with test user account
- At least 10 test tasks in various states (pending/completed)

**Base URL**: `http://localhost:8000`

**Endpoint**: `POST /api/{user_id}/chat`

**Headers**:
```json
{
  "Authorization": "Bearer <jwt_token>",
  "Content-Type": "application/json"
}
```

---

## Test Scenario 1: List Then Delete (Basic Chaining)

**Objective**: Verify agent can list tasks and delete completed ones in sequence

**Test Case 1.1 - Delete Completed Tasks**

**Setup**:
- Create 3 completed tasks: "Buy groceries", "Call dentist", "Send email"
- Create 2 pending tasks: "Review report", "Update calendar"

**Request**:
```json
{
  "message": "Show my completed tasks and delete them"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks(status="completed")`
2. Agent receives 3 completed tasks
3. Agent calls `delete_task(id)` for each of the 3 tasks
4. Agent confirms deletion with task titles

**Expected Response**:
```
I found 3 completed tasks and deleted them: 'Buy groceries', 'Call dentist', 'Send email'.
```

**Validation**:
- Verify 3 `delete_task` tool calls were made
- Verify all 3 completed tasks are removed from database
- Verify 2 pending tasks remain untouched
- Verify response includes all deleted task titles

**Test Case 1.2 - Delete with Confirmation**

**Setup**:
- Create 5 completed tasks

**Request**:
```json
{
  "message": "Delete all my completed tasks"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks(status="completed")`
2. Agent asks for confirmation (5+ items triggers confirmation)
3. Wait for user response

**Expected Response**:
```
I found 5 completed tasks. Are you sure you want to delete them? This cannot be undone.
```

**Follow-up Request**:
```json
{
  "message": "Yes, delete them",
  "conversation_id": "<conversation_id_from_previous_response>"
}
```

**Expected Behavior**:
1. Agent confirms user intent
2. Agent calls `delete_task(id)` for each of the 5 tasks
3. Agent confirms deletion

**Expected Response**:
```
I've deleted 5 completed tasks: 'Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5'.
```

---

## Test Scenario 2: Create Then List (Sequential Operations)

**Objective**: Verify agent can create a task and immediately show updated task list

**Test Case 2.1 - Add and Show**

**Setup**:
- Existing tasks: 2 pending tasks

**Request**:
```json
{
  "message": "Add a task to buy milk and show me all my tasks"
}
```

**Expected Behavior**:
1. Agent calls `add_task(title="Buy milk")`
2. Agent receives created task with ID
3. Agent calls `list_tasks()`
4. Agent shows all tasks including the newly created one

**Expected Response**:
```
I've added 'Buy milk' to your tasks. Here are all your tasks:
1) Buy milk (pending)
2) Review report (pending)
3) Update calendar (pending)
```

**Validation**:
- Verify `add_task` was called first
- Verify `list_tasks` was called second
- Verify new task appears in the list
- Verify total task count increased by 1

**Test Case 2.2 - Multiple Creates Then List**

**Request**:
```json
{
  "message": "Add tasks to buy milk, bread, and eggs, then show me my shopping list"
}
```

**Expected Behavior**:
1. Agent calls `add_task(title="Buy milk")`
2. Agent calls `add_task(title="Buy bread")`
3. Agent calls `add_task(title="Buy eggs")`
4. Agent calls `list_tasks()`
5. Agent shows all tasks including the 3 new ones

**Expected Response**:
```
I've added 3 tasks: 'Buy milk', 'Buy bread', 'Buy eggs'. Here are all your tasks:
1) Buy milk (pending)
2) Buy bread (pending)
3) Buy eggs (pending)
[... other tasks ...]
```

**Validation**:
- Verify 3 `add_task` calls were made
- Verify 1 `list_tasks` call was made
- Verify all 3 new tasks appear in the list

---

## Test Scenario 3: Find Then Update (Search and Modify)

**Objective**: Verify agent can search for tasks and update them

**Test Case 3.1 - Find and Complete**

**Setup**:
- Create task: "Buy groceries" (pending)
- Create task: "Call dentist" (pending)

**Request**:
```json
{
  "message": "Find my grocery task and mark it done"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks()` to search for tasks
2. Agent identifies task with "grocery" in title
3. Agent calls `complete_task(id)` with the found task ID
4. Agent confirms completion

**Expected Response**:
```
I found your task 'Buy groceries' and marked it as completed.
```

**Validation**:
- Verify `list_tasks` was called first
- Verify `complete_task` was called with correct task ID
- Verify task status changed to completed in database

**Test Case 3.2 - Find and Update Details**

**Setup**:
- Create task: "Meeting with team" (pending, due_date: 2026-01-20)

**Request**:
```json
{
  "message": "Find my meeting task and change it to tomorrow"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks()` to search for tasks
2. Agent identifies task with "meeting" in title
3. Agent parses "tomorrow" as 2026-01-18 (assuming today is 2026-01-17)
4. Agent calls `update_task(id, due_date="2026-01-18")`
5. Agent confirms update

**Expected Response**:
```
I found your task 'Meeting with team' and updated the due date to tomorrow (2026-01-18).
```

**Validation**:
- Verify `list_tasks` was called first
- Verify `update_task` was called with correct task ID and due_date
- Verify task due_date changed in database

---

## Test Scenario 4: Complex Multi-Step Operations

**Objective**: Verify agent can handle complex requests with multiple sequential operations

**Test Case 4.1 - List, Complete, and Delete**

**Setup**:
- Create 5 pending tasks
- Create 3 completed tasks

**Request**:
```json
{
  "message": "Show my pending tasks, mark the first two as done, and delete all completed tasks"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks(status="pending")` → Gets 5 tasks
2. Agent calls `complete_task(id)` for first task
3. Agent calls `complete_task(id)` for second task
4. Agent calls `list_tasks(status="completed")` → Gets 5 tasks (3 old + 2 new)
5. Agent asks for confirmation (5+ items)
6. After confirmation, agent calls `delete_task(id)` for each of 5 completed tasks
7. Agent provides comprehensive summary

**Expected Response (First Message)**:
```
I found 5 pending tasks. I can mark the first two as done and then delete all completed tasks. However, this will delete 5 completed tasks in total (including the 3 you already have). Are you sure you want to proceed? This cannot be undone.
```

**Follow-up Request**:
```json
{
  "message": "Yes, proceed",
  "conversation_id": "<conversation_id>"
}
```

**Expected Response (Second Message)**:
```
I've marked 'Task 1' and 'Task 2' as completed, then deleted 5 completed tasks: 'Task 1', 'Task 2', 'Old Task 1', 'Old Task 2', 'Old Task 3'.
```

**Validation**:
- Verify total of 8 tool calls (2 list, 2 complete, 5 delete) - within 10 limit
- Verify correct tasks were completed
- Verify correct tasks were deleted
- Verify comprehensive summary provided

**Test Case 4.2 - Update Multiple and List**

**Setup**:
- Create 3 tasks with priority "low"

**Request**:
```json
{
  "message": "Find all my low priority tasks and change them to high priority, then show me the updated list"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks(priority="low")` → Gets 3 tasks
2. Agent calls `update_task(id, priority="high")` for each task
3. Agent calls `list_tasks()` to show updated list
4. Agent confirms updates

**Expected Response**:
```
I found 3 low priority tasks and updated them to high priority: 'Task 1', 'Task 2', 'Task 3'. Here are all your tasks:
1) Task 1 (high priority, pending)
2) Task 2 (high priority, pending)
3) Task 3 (high priority, pending)
[... other tasks ...]
```

**Validation**:
- Verify 5 tool calls total (1 list, 3 update, 1 list)
- Verify all 3 tasks have priority="high" in database
- Verify updated list shows correct priorities

---

## Test Scenario 5: Partial Failure Handling

**Objective**: Verify agent handles failures gracefully and reports what succeeded vs. failed

**Test Case 5.1 - Delete with One Failure**

**Setup**:
- Create 5 completed tasks
- Manually delete one task from database (to simulate not found error)
- Keep task ID in agent's context

**Request**:
```json
{
  "message": "Delete all my completed tasks"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks(status="completed")` → Gets 5 task IDs
2. Agent asks for confirmation
3. After confirmation, agent calls `delete_task(id)` for each
4. One delete fails (task not found)
5. Agent continues with remaining deletes
6. Agent reports what succeeded and what failed

**Expected Response**:
```
I deleted 4 tasks successfully: 'Task 1', 'Task 2', 'Task 3', 'Task 4'. However, I failed to delete 'Task 5' (ID: xyz-789): Task not found. It may have already been deleted.
```

**Validation**:
- Verify 4 tasks were successfully deleted
- Verify error message includes specific task that failed
- Verify agent did not rollback successful operations
- Verify clear communication of partial success

**Test Case 5.2 - Update with Permission Error**

**Setup**:
- Create 3 tasks
- Simulate permission error for one task (e.g., task belongs to different user)

**Request**:
```json
{
  "message": "Mark all my pending tasks as done"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks(status="pending")` → Gets 3 tasks
2. Agent calls `complete_task(id)` for each
3. One complete fails (permission denied)
4. Agent continues with remaining completes
5. Agent reports what succeeded and what failed

**Expected Response**:
```
I marked 2 tasks as completed: 'Task 1', 'Task 2'. However, I failed to complete 'Task 3' (ID: abc-123): Permission denied. You may not have access to this task.
```

**Validation**:
- Verify 2 tasks were successfully completed
- Verify 1 task remains pending
- Verify error message is user-friendly
- Verify no rollback occurred

---

## Test Scenario 6: Tool Call Limit Enforcement

**Objective**: Verify agent respects 10 tool call limit and handles requests that exceed it

**Test Case 6.1 - Request Exceeding Limit**

**Setup**:
- Create 25 completed tasks

**Request**:
```json
{
  "message": "Delete all my completed tasks"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks(status="completed")` → Gets 25 tasks
2. Agent calculates total tool calls needed: 1 (list) + 25 (delete) = 26
3. Agent recognizes this exceeds 10 tool call limit
4. Agent informs user and suggests alternatives

**Expected Response**:
```
You have 25 completed tasks. Deleting all of them would require 26 tool calls (1 to list, 25 to delete), which exceeds the 10 tool call limit. Would you like me to delete the first 9 completed tasks, or would you prefer a different approach?
```

**Validation**:
- Verify agent did not attempt to delete all tasks
- Verify agent communicated the limitation clearly
- Verify agent suggested alternatives

**Test Case 6.2 - Request Within Limit**

**Setup**:
- Create 8 completed tasks

**Request**:
```json
{
  "message": "Delete all my completed tasks"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks(status="completed")` → Gets 8 tasks
2. Agent calculates total tool calls: 1 (list) + 8 (delete) = 9 (within limit)
3. Agent asks for confirmation
4. After confirmation, agent proceeds with deletion

**Expected Response (First Message)**:
```
I found 8 completed tasks. Are you sure you want to delete them? This cannot be undone.
```

**Follow-up Request**:
```json
{
  "message": "Yes",
  "conversation_id": "<conversation_id>"
}
```

**Expected Response (Second Message)**:
```
I've deleted 8 completed tasks: 'Task 1', 'Task 2', 'Task 3', 'Task 4', 'Task 5', 'Task 6', 'Task 7', 'Task 8'.
```

**Validation**:
- Verify 9 tool calls were made (within limit)
- Verify all 8 tasks were deleted
- Verify agent handled the request successfully

---

## Test Scenario 7: Edge Cases

**Test Case 7.1 - Empty Result Set**

**Setup**:
- No completed tasks in database

**Request**:
```json
{
  "message": "Show my completed tasks and delete them"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks(status="completed")` → Gets empty list
2. Agent informs user no tasks found
3. Agent does not attempt delete operations

**Expected Response**:
```
You don't have any completed tasks to delete.
```

**Test Case 7.2 - Ambiguous Request**

**Setup**:
- Create 3 tasks with "meeting" in title

**Request**:
```json
{
  "message": "Delete the meeting task"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks()` to search
2. Agent finds 3 tasks with "meeting" in title
3. Agent asks for clarification (does not proceed with deletion)

**Expected Response**:
```
I found 3 tasks with "meeting" in the title:
1) Meeting with team
2) Prepare meeting notes
3) Schedule meeting room

Which one would you like to delete?
```

**Test Case 7.3 - Single Tool Call (Not Chaining)**

**Request**:
```json
{
  "message": "Show me all my tasks"
}
```

**Expected Behavior**:
1. Agent calls `list_tasks()` only
2. Agent returns task list

**Expected Response**:
```
Here are all your tasks:
1) Buy milk (pending)
2) Call dentist (pending)
3) Review report (completed)
```

**Validation**:
- Verify only 1 tool call was made
- Verify response is clear and concise

---

## Success Criteria

For Phase 6 to be considered complete, the following must be validated:

1. **Tool Chaining Works**: Agent successfully chains multiple tool calls in logical order
2. **Limit Enforcement**: Agent respects 10 tool call limit and communicates when exceeded
3. **Partial Failures Handled**: Agent reports what succeeded and what failed without rollback
4. **Comprehensive Results**: Agent provides results from all tool calls, not just the final one
5. **Confirmation Workflow**: Agent still asks for confirmation on destructive operations even in chains
6. **Natural Language**: Agent correctly interprets complex requests and chains appropriate tools
7. **Error Messages**: Clear, user-friendly error messages for all failure scenarios

---

## Manual Testing Checklist

- [ ] Test Scenario 1: List Then Delete (both test cases)
- [ ] Test Scenario 2: Create Then List (both test cases)
- [ ] Test Scenario 3: Find Then Update (both test cases)
- [ ] Test Scenario 4: Complex Multi-Step (both test cases)
- [ ] Test Scenario 5: Partial Failure Handling (both test cases)
- [ ] Test Scenario 6: Tool Call Limit Enforcement (both test cases)
- [ ] Test Scenario 7: Edge Cases (all three test cases)
- [ ] Verify conversation history maintained across chained operations
- [ ] Verify JWT authentication works for all chained tool calls
- [ ] Verify database state is correct after all operations

---

## Automated Testing Notes

While these scenarios are documented for manual testing, they can be automated using:

1. **Unit Tests**: Test individual tool wrappers in isolation
2. **Integration Tests**: Test agent runner with mocked MCP tools
3. **End-to-End Tests**: Test full chat endpoint with real database

**Recommended Test Framework**: pytest with pytest-asyncio for async operations

**Example Test Structure**:
```python
@pytest.mark.asyncio
async def test_list_then_delete_chaining():
    # Setup: Create test tasks
    # Execute: Send chat message
    # Assert: Verify tool calls and database state
    pass
```

---

## Notes

- All test scenarios assume today's date is 2026-01-17
- JWT tokens must be valid and match the user_id in the URL
- Database should be reset between test scenarios for consistency
- Conversation IDs should be tracked for multi-turn conversations
- Tool call counts can be verified by examining agent logs or response metadata
