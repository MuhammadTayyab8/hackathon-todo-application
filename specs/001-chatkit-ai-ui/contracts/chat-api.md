# Chat API Contract

**Endpoint**: `/api/{user_id}/chat`
**Feature**: ChatKit AI Chatbot UI
**Version**: 1.0
**Date**: 2026-01-17

## Overview

This document defines the API contract for the chat endpoint that enables users to send messages to the AI assistant and receive responses with optional tool call proposals.

---

## POST /api/{user_id}/chat

Send a message to the AI assistant and receive a response.

### Request

**URL Parameters**:
- `user_id` (string, required): ID of the authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body**:
```json
{
  "message": "string",
  "conversation_id": "string | null"
}
```

**Field Descriptions**:
- `message` (string, required): The user's message text
  - Min length: 1 character
  - Max length: 10,000 characters
  - Cannot be empty or whitespace-only
- `conversation_id` (string | null, optional): ID of existing conversation
  - Must be valid UUID v4 if provided
  - Use `null` or omit for new conversation
  - Must belong to authenticated user

**Example Request**:
```json
{
  "message": "Add a task to buy groceries tomorrow",
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Example Request (New Conversation)**:
```json
{
  "message": "Hello, I need help with my tasks",
  "conversation_id": null
}
```

---

### Response

#### Success (200 OK)

**Body**:
```json
{
  "conversation_id": "string",
  "response": "string",
  "tool_calls": [
    {
      "id": "string",
      "description": "string",
      "parameters": {},
      "status": "pending"
    }
  ]
}
```

**Field Descriptions**:
- `conversation_id` (string): ID of the conversation (new or existing)
  - UUID v4 format
  - Same as request if existing conversation
  - New UUID if new conversation
- `response` (string): AI assistant's response text
  - May include markdown formatting
  - Max length: 5,000 characters
- `tool_calls` (array, optional): Array of tool calls proposed by AI
  - Empty array or omitted if no tool calls
  - Each tool call requires user approval before execution

**Tool Call Object**:
- `id` (string): Unique identifier for the tool call (UUID v4)
- `description` (string): Human-readable description of the action
- `parameters` (object): Parameters for the tool execution
- `status` (string): Always "pending" in initial response

**Example Response (With Tool Call)**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "I can help you add that task. I'll create a new task called 'Buy groceries' with a due date of tomorrow. Would you like me to proceed?",
  "tool_calls": [
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "description": "Create task: Buy groceries (due: 2026-01-18)",
      "parameters": {
        "title": "Buy groceries",
        "due_date": "2026-01-18",
        "priority": "medium"
      },
      "status": "pending"
    }
  ]
}
```

**Example Response (No Tool Call)**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "response": "Hello! I'm your AI assistant. I can help you manage your tasks, answer questions, and more. What would you like to do today?",
  "tool_calls": []
}
```

---

#### Error Responses

##### 400 Bad Request

Invalid request parameters.

**Body**:
```json
{
  "error": "Bad Request",
  "message": "string",
  "details": {}
}
```

**Example**:
```json
{
  "error": "Bad Request",
  "message": "Message cannot be empty",
  "details": {
    "field": "message",
    "constraint": "min_length"
  }
}
```

**Common Causes**:
- Empty or whitespace-only message
- Message exceeds 10,000 characters
- Invalid conversation_id format
- Conversation_id doesn't belong to user

---

##### 401 Unauthorized

Missing or invalid JWT token.

**Body**:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing JWT token"
}
```

**Common Causes**:
- No Authorization header
- Invalid JWT token
- Expired JWT token
- user_id in URL doesn't match JWT user_id

---

##### 403 Forbidden

User doesn't have access to the requested conversation.

**Body**:
```json
{
  "error": "Forbidden",
  "message": "You don't have access to this conversation"
}
```

**Common Causes**:
- Conversation belongs to different user
- User trying to access another user's data

---

##### 404 Not Found

Conversation not found.

**Body**:
```json
{
  "error": "Not Found",
  "message": "Conversation not found"
}
```

**Common Causes**:
- Invalid conversation_id
- Conversation was deleted
- Conversation doesn't exist

---

##### 429 Too Many Requests

Rate limit exceeded.

**Body**:
```json
{
  "error": "Too Many Requests",
  "message": "Rate limit exceeded. Please try again later.",
  "retry_after": 60
}
```

**Rate Limits**:
- 60 requests per minute per user
- 1000 requests per hour per user

---

##### 500 Internal Server Error

Server-side error.

**Body**:
```json
{
  "error": "Internal Server Error",
  "message": "Failed to process chat message"
}
```

**Common Causes**:
- Backend service unavailable
- Database connection error
- AI model API error

---

## GET /api/{user_id}/conversations

Retrieve list of user's conversations.

### Request

**URL Parameters**:
- `user_id` (string, required): ID of the authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `limit` (number, optional): Maximum number of conversations to return
  - Default: 50
  - Max: 100
- `offset` (number, optional): Number of conversations to skip
  - Default: 0
  - For pagination

**Example Request**:
```
GET /api/user123/conversations?limit=20&offset=0
```

---

### Response

#### Success (200 OK)

**Body**:
```json
{
  "conversations": [
    {
      "id": "string",
      "created_at": "string",
      "updated_at": "string",
      "last_message": "string",
      "message_count": number
    }
  ],
  "total": number,
  "limit": number,
  "offset": number
}
```

**Field Descriptions**:
- `conversations` (array): Array of conversation objects
- `total` (number): Total number of conversations for user
- `limit` (number): Limit used in request
- `offset` (number): Offset used in request

**Conversation Object**:
- `id` (string): Conversation UUID
- `created_at` (string): ISO 8601 timestamp
- `updated_at` (string): ISO 8601 timestamp
- `last_message` (string): Preview of last message (max 100 chars)
- `message_count` (number): Total messages in conversation

**Example Response**:
```json
{
  "conversations": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "created_at": "2026-01-17T10:30:00Z",
      "updated_at": "2026-01-17T14:25:00Z",
      "last_message": "I've added the task for you. Is there anything else?",
      "message_count": 8
    },
    {
      "id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      "created_at": "2026-01-16T09:15:00Z",
      "updated_at": "2026-01-16T09:45:00Z",
      "last_message": "Great! Let me know if you need help with anything else.",
      "message_count": 4
    }
  ],
  "total": 15,
  "limit": 50,
  "offset": 0
}
```

---

## GET /api/{user_id}/conversations/{conversation_id}/messages

Retrieve messages for a specific conversation.

### Request

**URL Parameters**:
- `user_id` (string, required): ID of the authenticated user
- `conversation_id` (string, required): ID of the conversation

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Query Parameters**:
- `limit` (number, optional): Maximum number of messages to return
  - Default: 100
  - Max: 200
- `before` (string, optional): Return messages before this message ID
  - For pagination (load older messages)

**Example Request**:
```
GET /api/user123/conversations/550e8400-e29b-41d4-a716-446655440000/messages?limit=50
```

---

### Response

#### Success (200 OK)

**Body**:
```json
{
  "messages": [
    {
      "id": "string",
      "conversation_id": "string",
      "sender": "user | assistant",
      "content": "string",
      "timestamp": "string",
      "tool_calls": []
    }
  ],
  "has_more": boolean
}
```

**Example Response**:
```json
{
  "messages": [
    {
      "id": "msg-001",
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "sender": "user",
      "content": "Add a task to buy groceries tomorrow",
      "timestamp": "2026-01-17T10:30:00Z",
      "tool_calls": []
    },
    {
      "id": "msg-002",
      "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
      "sender": "assistant",
      "content": "I can help you add that task. Would you like me to proceed?",
      "timestamp": "2026-01-17T10:30:05Z",
      "tool_calls": [
        {
          "id": "tool-001",
          "message_id": "msg-002",
          "description": "Create task: Buy groceries (due: 2026-01-18)",
          "parameters": {
            "title": "Buy groceries",
            "due_date": "2026-01-18"
          },
          "status": "executed",
          "result": "Task created successfully with ID: task-123"
        }
      ]
    }
  ],
  "has_more": false
}
```

---

## POST /api/{user_id}/chat/tool-action

Approve or reject a tool action proposed by the AI.

### Request

**URL Parameters**:
- `user_id` (string, required): ID of the authenticated user

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Body**:
```json
{
  "conversation_id": "string",
  "tool_call_id": "string",
  "action": "approve | reject"
}
```

**Field Descriptions**:
- `conversation_id` (string, required): ID of the conversation
- `tool_call_id` (string, required): ID of the tool call to act on
- `action` (string, required): Either "approve" or "reject"

**Example Request (Approve)**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "tool_call_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "action": "approve"
}
```

**Example Request (Reject)**:
```json
{
  "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
  "tool_call_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "action": "reject"
}
```

---

### Response

#### Success (200 OK)

**Body**:
```json
{
  "tool_call_id": "string",
  "status": "executed | rejected | failed",
  "result": "string",
  "error": "string"
}
```

**Field Descriptions**:
- `tool_call_id` (string): ID of the tool call
- `status` (string): New status after action
  - "executed": Tool was approved and executed successfully
  - "rejected": Tool was rejected by user
  - "failed": Tool was approved but execution failed
- `result` (string, optional): Result message if executed
- `error` (string, optional): Error message if failed

**Example Response (Approved & Executed)**:
```json
{
  "tool_call_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "status": "executed",
  "result": "Task 'Buy groceries' created successfully with ID: task-123"
}
```

**Example Response (Rejected)**:
```json
{
  "tool_call_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "status": "rejected"
}
```

**Example Response (Failed)**:
```json
{
  "tool_call_id": "7c9e6679-7425-40de-944b-e07fc1f90ae7",
  "status": "failed",
  "error": "Failed to create task: Database connection error"
}
```

---

## Security Considerations

### Authentication
- All endpoints require valid JWT token in Authorization header
- JWT must be issued by Better Auth
- Token must not be expired
- user_id in URL must match user_id in JWT

### Authorization
- Users can only access their own conversations
- Backend must verify conversation ownership before returning data
- Tool actions can only be performed on user's own conversations

### Rate Limiting
- 60 requests per minute per user
- 1000 requests per hour per user
- Rate limits apply per endpoint

### Input Validation
- All inputs must be validated on backend
- Sanitize user messages to prevent injection attacks
- Validate conversation_id and tool_call_id formats
- Enforce message length limits

---

## Error Handling

### Client-Side Error Handling
- Display user-friendly error messages
- Provide retry option for transient errors
- Preserve unsent messages on error
- Handle authentication errors by redirecting to login

### Backend Error Handling
- Return appropriate HTTP status codes
- Include descriptive error messages
- Log errors for monitoring
- Don't expose sensitive information in error messages

---

## Versioning

**Current Version**: 1.0

**Version History**:
- 1.0 (2026-01-17): Initial API contract

**Breaking Changes Policy**:
- Major version bump for breaking changes
- Deprecation notices 30 days before removal
- Backward compatibility maintained within major version

---

## Testing

### Test Scenarios

1. **Send message to new conversation**
   - Verify conversation_id is created
   - Verify message is stored
   - Verify response is returned

2. **Send message to existing conversation**
   - Verify message is added to conversation
   - Verify conversation_id remains same
   - Verify conversation updated_at is updated

3. **Tool call approval**
   - Verify tool is executed
   - Verify result is returned
   - Verify tool status is updated

4. **Tool call rejection**
   - Verify tool is not executed
   - Verify status is updated to rejected

5. **Authentication errors**
   - Verify 401 for missing token
   - Verify 401 for invalid token
   - Verify 403 for wrong user_id

6. **Validation errors**
   - Verify 400 for empty message
   - Verify 400 for message too long
   - Verify 400 for invalid conversation_id

---

## Next Steps

1. ✅ API contract defined
2. ⏭️ Implement backend endpoints (if not already done)
3. ⏭️ Implement frontend API client
4. ⏭️ Write integration tests
5. ⏭️ Validate against functional requirements
