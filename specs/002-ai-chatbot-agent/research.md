# Phase 0: Research & Decisions

**Feature**: AI Chatbot Agent for Task Management
**Date**: 2026-01-17
**Status**: Approved

## Overview

This document captures research decisions for implementing an AI chatbot agent that enables natural language task management. The agent uses OpenAI Agents SDK with Gemini 2.5 Flash via OpenRouter, invokes MCP tools from Sub-Phase 1, and maintains conversation history with automatic summarization.

---

## 1. Agent Architecture: OpenAI Agents SDK Integration

### Decision

Use OpenAI Agents SDK as the agent orchestration framework with OpenRouter as the LLM provider.

### Rationale

**Why OpenAI Agents SDK?**
- Provides high-level abstractions for agent creation with tools, handoffs, sessions, and guardrails
- Automatic conversation history management via Session objects
- Built-in support for function tools with automatic schema generation
- Multi-provider support via LiteLLM (works with OpenRouter)
- Lightweight framework with minimal dependencies

**Why OpenRouter?**
- Provides unified API access to multiple LLM providers including Google Gemini
- Cost-effective access to Gemini 2.5 Flash (free tier available)
- Compatible with OpenAI SDK (same API format)
- No need for separate Google Cloud setup

**Alternatives Considered**:
- **LangChain**: Too heavyweight, adds unnecessary complexity for our use case
- **Direct OpenAI API**: Limited to OpenAI models, doesn't support Gemini
- **Direct Google Gemini API**: Requires separate SDK and authentication setup
- **Custom agent implementation**: Reinventing the wheel, more maintenance burden

### Implementation Approach

```python
from agents import Agent, function_tool
from openai import OpenAI

# Configure OpenAI client with OpenRouter
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# Create agent with MCP tools
agent = Agent(
    name="Task Management Assistant",
    instructions="You are a helpful task management assistant...",
    model="google/gemini-2.0-flash-exp:free",
    tools=[add_task_tool, list_tasks_tool, complete_task_tool, update_task_tool, delete_task_tool],
    client=client
)

# Run agent (stateless - no Session object)
result = agent.run(user_message)
```

### Trade-offs

**Pros**:
- Simple API with minimal boilerplate
- Automatic tool schema generation from Python functions
- Multi-provider flexibility (can switch models easily)
- Well-documented and actively maintained

**Cons**:
- Adds dependency on OpenAI Agents SDK (new library)
- OpenRouter adds latency vs direct provider access
- Free tier has rate limits (10 requests/minute)

---

## 2. Model Configuration: Gemini 2.5 Flash via OpenRouter

### Decision

Use `google/gemini-2.0-flash-exp:free` model via OpenRouter for natural language understanding and tool invocation.

### Rationale

**Why Gemini 2.5 Flash?**
- Fast inference (<2s typical response time)
- Strong natural language understanding for intent parsing
- Supports function calling (required for MCP tool invocation)
- Cost-effective (free tier available on OpenRouter)
- Good balance of speed and accuracy for task management use case

**Why Free Tier?**
- Sufficient for hackathon/MVP development
- 10 requests/minute rate limit acceptable for initial testing
- Can upgrade to paid tier if needed for production

**Alternatives Considered**:
- **GPT-4o**: More expensive, overkill for task management
- **GPT-4o-mini**: Good alternative but requires OpenAI API key
- **Claude 3.5 Sonnet**: Excellent but more expensive than Gemini
- **Gemini Pro**: Slower than Flash, not needed for simple task operations

### Implementation Approach

```python
# Model configuration
MODEL_NAME = "google/gemini-2.0-flash-exp:free"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# Client setup
client = OpenAI(
    base_url=OPENROUTER_BASE_URL,
    api_key=os.getenv("OPENROUTER_API_KEY")
)

# Agent initialization
agent = Agent(
    model=MODEL_NAME,
    client=client,
    # ... other config
)
```

### Trade-offs

**Pros**:
- Free tier for development
- Fast response times (<3s target achievable)
- Good function calling support
- Easy to switch models if needed

**Cons**:
- Rate limits on free tier (10 req/min)
- Experimental model (may change)
- Requires OpenRouter account setup

---

## 3. MCP Tool Invocation: Wrapping MCP Server Tools

### Decision

Wrap each MCP server tool as an OpenAI Agents SDK function tool that internally calls the MCP server via subprocess/stdio.

### Rationale

**Why Wrap MCP Tools?**
- OpenAI Agents SDK expects Python function tools, not MCP protocol
- MCP server runs as separate process with stdio transport
- Need to bridge between agent function calls and MCP tool calls
- Allows passing JWT token to MCP tools for user isolation

**Architecture**:
```
User Request → Agent → Function Tool Wrapper → MCP Server (stdio) → Database
                ↓                                      ↓
            Tool Result ← JSON Response ← MCP Tool Handler
```

### Implementation Approach

```python
from agents import function_tool
import asyncio
import json
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# MCP client configuration
MCP_SERVER_PARAMS = StdioServerParameters(
    command="python",
    args=["backend/mcp_server_main.py"],
    env={"DATABASE_URL": os.getenv("DATABASE_URL")}
)

# Wrapper function for add_task MCP tool
@function_tool
async def add_task_tool(title: str, description: str = "", due_date: str = "", jwt_token: str = "") -> dict:
    """
    Create a new task.

    Args:
        title: Task title (required)
        description: Task description (optional)
        due_date: Due date in YYYY-MM-DD format (optional)
        jwt_token: JWT token for authentication (required)

    Returns:
        dict: Created task details or error message
    """
    async with stdio_client(MCP_SERVER_PARAMS) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()

            # Call MCP tool
            result = await session.call_tool(
                "add_task",
                arguments={
                    "title": title,
                    "description": description,
                    "due_date": due_date,
                    "jwt_token": jwt_token
                }
            )

            # Parse result
            if result.isError:
                return {"error": result.content[0].text}

            return json.loads(result.content[0].text)

# Similar wrappers for list_tasks, complete_task, update_task, delete_task
```

### Trade-offs

**Pros**:
- Clean separation between agent and MCP server
- Reuses existing MCP server implementation
- JWT token passing ensures user isolation
- Easy to test with mocked MCP responses

**Cons**:
- Adds overhead of subprocess communication
- Each tool call spawns new MCP client connection
- More complex than direct database access

**Optimization Opportunity**: Consider connection pooling or persistent MCP client for production.

---

## 4. Conversation Management: Stateless Flow with Database History

### Decision

Implement stateless agent runner that fetches conversation history from database on each request, rather than using OpenAI Agents SDK Session objects.

### Rationale

**Why Stateless?**
- Aligns with specification requirement (FR-004)
- Simplifies deployment (no server-side session state)
- Enables horizontal scaling (any server can handle any request)
- Conversation history persisted in database, not memory

**Why Not Use Session Objects?**
- Session objects maintain state in memory
- Would require sticky sessions or session storage
- Database is already single source of truth for history

### Implementation Approach

```python
async def process_chat_message(
    user_id: str,
    message: str,
    conversation_id: Optional[str] = None,
    jwt_token: str = ""
) -> dict:
    """
    Stateless chat message processing.

    Flow:
    1. Fetch conversation history from DB if conversation_id provided
    2. Summarize history if >600 tokens
    3. Build message array: [system_instruction, ...history, user_message]
    4. Run agent with message array
    5. Store user message and assistant response in DB
    6. Return response
    """
    # Step 1: Fetch history
    history = []
    if conversation_id:
        history = await fetch_conversation_history(conversation_id, user_id)

    # Step 2: Summarize if needed
    token_count = count_tokens(history)
    if token_count > 600:
        history = await summarize_history(history)

    # Step 3: Build message array
    messages = [
        {"role": "system", "content": SYSTEM_INSTRUCTIONS},
        *history,
        {"role": "user", "content": message}
    ]

    # Step 4: Run agent (stateless)
    agent = create_agent(jwt_token)  # Pass JWT to tool wrappers
    result = agent.run(message, context=messages)

    # Step 5: Store messages
    conv_id = conversation_id or await create_conversation(user_id)
    await store_message(conv_id, "user", message)
    await store_message(conv_id, "assistant", result.content)

    # Step 6: Return response
    return {
        "conversation_id": conv_id,
        "message": result.content,
        "created_at": datetime.utcnow().isoformat()
    }
```

### Trade-offs

**Pros**:
- Stateless design enables horizontal scaling
- No session management complexity
- Database is single source of truth
- Easy to implement and test

**Cons**:
- Database query on every request (fetch history)
- Slightly higher latency vs in-memory sessions
- Need to implement token counting and summarization

---

## 5. History Summarization: Token Counting and Summarization Strategy

### Decision

Count tokens using `tiktoken` library and trigger summarization when history exceeds 600 tokens. Use Gemini to generate summary.

### Rationale

**Why 600 Token Threshold?**
- Specification requirement (MUST summarize after >600 tokens)
- Balances context retention with API cost/latency
- Typical conversation: ~10-15 messages before summarization
- Prevents context window overflow (Gemini has 32k token limit)

**Why tiktoken?**
- Industry standard for token counting
- Fast and accurate
- Works with OpenAI-compatible models

**Why Use Gemini for Summarization?**
- Same model already in use for agent
- Understands task management context
- Can preserve key information (task IDs, user intent)

### Implementation Approach

```python
import tiktoken

# Token counting
def count_tokens(messages: list[dict]) -> int:
    """Count tokens in message history."""
    encoding = tiktoken.encoding_for_model("gpt-4")  # Close enough for Gemini
    total_tokens = 0
    for msg in messages:
        total_tokens += len(encoding.encode(msg["content"]))
    return total_tokens

# Summarization
async def summarize_history(messages: list[dict]) -> list[dict]:
    """
    Summarize conversation history to reduce token count.

    Strategy:
    - Keep last 3 messages as-is (most recent context)
    - Summarize older messages into single summary message
    - Target: Reduce to ~200 tokens
    """
    if len(messages) <= 3:
        return messages

    # Split: older messages to summarize, recent messages to keep
    older_messages = messages[:-3]
    recent_messages = messages[-3:]

    # Build summarization prompt
    history_text = "\n".join([
        f"{msg['role']}: {msg['content']}"
        for msg in older_messages
    ])

    prompt = f"""Summarize the following conversation history in 200 tokens or less, preserving key context about tasks and user intent:

{history_text}

Summary:"""

    # Call Gemini for summarization
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key=os.getenv("OPENROUTER_API_KEY")
    )

    response = client.chat.completions.create(
        model="google/gemini-2.0-flash-exp:free",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=250
    )

    summary = response.choices[0].message.content

    # Return: [summary_message, ...recent_messages]
    return [
        {"role": "system", "content": f"Previous conversation summary: {summary}"},
        *recent_messages
    ]
```

### Trade-offs

**Pros**:
- Prevents context window overflow
- Reduces API costs (fewer tokens per request)
- Preserves recent context (last 3 messages)
- Automatic and transparent to user

**Cons**:
- Adds latency (extra API call for summarization)
- May lose some context in older messages
- Summarization quality depends on model

---

## 6. Natural Language Parsing: Agent Instructions

### Decision

Provide clear system instructions to the agent for intent recognition and tool mapping, rather than implementing custom NLP parsing.

### Rationale

**Why Rely on Agent Instructions?**
- Gemini 2.5 Flash has strong natural language understanding
- Function calling automatically maps intent to tools
- Simpler than custom NLP pipeline
- More flexible (handles variations in phrasing)

### Implementation Approach

```python
SYSTEM_INSTRUCTIONS = """You are a helpful task management assistant. Your role is to help users manage their tasks through natural conversation.

**Available Tools**:
- add_task: Create a new task with title, description, and due date
- list_tasks: Retrieve tasks with optional status filtering (pending/completed/all)
- complete_task: Mark a task as completed by ID
- update_task: Update task fields (title, description, due_date) by ID
- delete_task: Permanently delete a task by ID

**Guidelines**:
1. Parse user requests and invoke the appropriate tool(s)
2. For ambiguous requests (e.g., "delete the task" when multiple exist), ask clarifying questions
3. For destructive operations (delete, bulk actions), request confirmation before proceeding
4. Extract task details from natural language (e.g., "tomorrow" → due_date)
5. If a request requires multiple tools, chain them in logical order
6. Always confirm successful operations and provide helpful feedback
7. If a tool returns an error, explain it in user-friendly language

**Examples**:
- "Add a task to buy groceries tomorrow" → add_task(title="Buy groceries", due_date="2026-01-18")
- "Show my pending tasks" → list_tasks(status="pending")
- "Mark the grocery task as done" → complete_task(task_id=<id>)
- "Delete all completed tasks" → Ask for confirmation, then delete_task for each
"""
```

### Trade-offs

**Pros**:
- Leverages model's built-in NLP capabilities
- No custom parsing logic to maintain
- Handles variations in phrasing automatically
- Easy to update instructions

**Cons**:
- Dependent on model quality
- Less control over parsing behavior
- May misinterpret complex requests

---

## 7. Tool Chaining: Sequential Tool Calls

### Decision

Allow agent to make multiple tool calls within a single run to fulfill complex requests.

### Rationale

**Why Support Tool Chaining?**
- User Story 4 (P3): "Show my tasks and delete the completed ones"
- Improves user experience (single request for complex operations)
- Agent can reason about tool call order

**How OpenAI Agents SDK Handles This**:
- Agent can make multiple tool calls in sequence
- Each tool result is fed back to agent
- Agent decides when to stop and return final response

### Implementation Approach

```python
# Agent automatically handles tool chaining
# Example: "Show my tasks and delete the completed ones"

# Agent execution flow:
# 1. Call list_tasks(status="all")
# 2. Receive task list
# 3. Identify completed tasks
# 4. Call delete_task(task_id=X) for each completed task
# 5. Return summary: "I found 3 completed tasks and deleted them: ..."

# No special implementation needed - agent handles this automatically
# Just ensure tool call limit (10 per message) is enforced
```

### Trade-offs

**Pros**:
- Handles complex requests in single interaction
- Agent reasons about tool call order
- No manual orchestration needed

**Cons**:
- Higher latency for chained operations
- Risk of partial failures (some tools succeed, others fail)
- Need to handle tool call limits (max 10 per message)

---

## 8. Action Confirmation: Destructive Operation Detection

### Decision

Implement confirmation workflow for destructive operations by having agent ask for confirmation before proceeding.

### Rationale

**Why Confirmation?**
- User Story 3 (P2): Prevents accidental data loss
- Builds user trust
- Aligns with best practices for destructive operations

**What Qualifies as Destructive?**
- delete_task (single or bulk)
- Bulk operations (e.g., "complete all tasks")
- Operations affecting multiple tasks

### Implementation Approach

```python
# Agent instructions include confirmation guidelines
CONFIRMATION_INSTRUCTIONS = """
For destructive operations, follow this workflow:

1. Detect destructive operation (delete, bulk actions)
2. Ask user for confirmation: "Are you sure you want to delete X tasks? This cannot be undone."
3. Wait for user response
4. If confirmed ("yes", "confirm", "proceed"), execute operation
5. If declined ("no", "cancel"), abort operation
6. Confirm completion or cancellation

Example:
User: "Delete all my completed tasks"
Assistant: "I found 5 completed tasks. Are you sure you want to delete them? This cannot be undone."
User: "Yes, delete them"
Assistant: "I've deleted 5 completed tasks: [list of tasks]"
"""

# Implementation: Agent handles this via conversation flow
# No special code needed - agent asks, waits for response, then acts
```

### Trade-offs

**Pros**:
- Prevents accidental data loss
- User-friendly and transparent
- Easy to implement (agent handles conversation)

**Cons**:
- Adds extra interaction (2 messages instead of 1)
- User must explicitly confirm
- May be annoying for power users

---

## 9. Error Handling: MCP Tool Errors, Database Errors, Agent Errors

### Decision

Implement comprehensive error handling at three levels: MCP tool errors, database errors, and agent errors.

### Rationale

**Why Multi-Level Error Handling?**
- MCP tools can fail (invalid input, database errors)
- Database operations can fail (connection issues, constraint violations)
- Agent can fail (rate limits, timeouts, invalid responses)
- Need to provide user-friendly error messages

### Implementation Approach

```python
# Level 1: MCP Tool Error Handling
@function_tool
async def add_task_tool(title: str, jwt_token: str, **kwargs) -> dict:
    try:
        # Call MCP tool
        result = await call_mcp_tool("add_task", {...})

        if result.isError:
            return {"error": f"Failed to create task: {result.content[0].text}"}

        return json.loads(result.content[0].text)

    except Exception as e:
        return {"error": f"Tool error: {str(e)}"}

# Level 2: Database Error Handling
async def store_message(conversation_id: str, role: str, content: str):
    try:
        async with AsyncSession(engine) as session:
            message = Message(
                conversation_id=conversation_id,
                role=role,
                content=content
            )
            session.add(message)
            await session.commit()

    except IntegrityError as e:
        raise ValueError(f"Database constraint violation: {e}")

    except Exception as e:
        raise RuntimeError(f"Database error: {e}")

# Level 3: Agent Error Handling
async def process_chat_message(user_id: str, message: str, **kwargs):
    try:
        # Fetch history, run agent, store messages
        result = agent.run(message)
        return {"conversation_id": conv_id, "message": result.content}

    except RateLimitError:
        return {"error": "Rate limit exceeded. Please try again in a moment."}

    except TimeoutError:
        return {"error": "Request timed out. Please try again."}

    except Exception as e:
        logger.error(f"Agent error: {e}")
        return {"error": "An error occurred processing your request."}

# API Endpoint Error Handling
@router.post("/api/{user_id}/chat")
async def chat_endpoint(user_id: str, request: ChatRequest, token: str = Depends(verify_jwt)):
    try:
        result = await process_chat_message(user_id, request.message, ...)

        if "error" in result:
            raise HTTPException(status_code=500, detail=result["error"])

        return result

    except HTTPException:
        raise

    except Exception as e:
        logger.error(f"Endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

### Trade-offs

**Pros**:
- Comprehensive error coverage
- User-friendly error messages
- Proper logging for debugging
- Graceful degradation

**Cons**:
- More code to maintain
- Need to balance detail vs security (don't expose internals)
- Error messages must be tested

---

## Summary

All research decisions are finalized and ready for implementation. Key takeaways:

1. **Agent Architecture**: OpenAI Agents SDK + OpenRouter provides simple, flexible foundation
2. **Model**: Gemini 2.5 Flash offers good balance of speed, cost, and accuracy
3. **MCP Integration**: Function tool wrappers bridge agent and MCP server
4. **Stateless Design**: Database-backed history enables horizontal scaling
5. **Summarization**: 600 token threshold with automatic summarization prevents context overflow
6. **NLP**: Agent instructions leverage model's built-in capabilities
7. **Tool Chaining**: Automatic support via agent framework
8. **Confirmation**: Agent-driven conversation flow for destructive operations
9. **Error Handling**: Multi-level approach ensures robustness

**Next Phase**: Generate data model, API contracts, and quickstart guide (Phase 1).
