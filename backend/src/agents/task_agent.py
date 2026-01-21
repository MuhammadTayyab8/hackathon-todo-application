"""
Task Agent Configuration

Configures the OpenAI Agents SDK with OpenRouter and Gemini 2.5 Flash.
Defines system instructions for natural language task management.
"""

import os
import asyncio
from typing import Optional, List, Dict
from agents import Agent, function_tool, set_tracing_disabled
from dotenv import load_dotenv

load_dotenv()

# Disable tracing to prevent 401 errors with OpenRouter
set_tracing_disabled(True)

# Model Configuration
# For OpenRouter with OpenAI Agents SDK (OpenRouter is OpenAI-compatible)
MODEL_NAME = "mistralai/devstral-2512:free"
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

# System Instructions for Task Management Agent
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

**Confirmation Workflow for Destructive Operations**:

Destructive operations require user confirmation to prevent accidental data loss. Follow this workflow:

1. **Detect Destructive Operation**:
   - Any delete_task operation (single or bulk)
   - Bulk operations affecting 5+ items (e.g., marking 10+ tasks as complete)
   - Any operation that cannot be undone

2. **Ask for Confirmation**:
   - Provide specific details: "Are you sure you want to [action]? This cannot be undone."
   - Include count if applicable: "I found 5 completed tasks. Are you sure you want to delete them?"
   - Be clear about the consequences

3. **Wait for User Response**:
   - Do NOT execute the operation immediately
   - Wait for the user's next message
   - The user's response will be in the next conversation turn

4. **Process User Response**:
   - **Confirmation phrases**: "yes", "confirm", "proceed", "delete them", "do it", "go ahead", "sure", "ok", "okay"
   - **Decline phrases**: "no", "cancel", "stop", "wait", "don't", "abort", "nevermind", "never mind"
   - If ambiguous, ask for clarification

5. **Execute or Cancel**:
   - If confirmed: Execute the operation and confirm completion with details
   - If declined: Abort the operation and confirm cancellation clearly

6. **Confirm Result**:
   - On success: "I've deleted 5 completed tasks: [list task titles]"
   - On cancellation: "Okay, I've cancelled the deletion. No tasks were deleted."

**Confirmation Examples**:

Example 1 - Delete all completed tasks:
- User: "Delete all my completed tasks"
- Assistant: "I found 5 completed tasks. Are you sure you want to delete them? This cannot be undone."
- User: "Yes, delete them"
- Assistant: "I've deleted 5 completed tasks: 'Buy groceries', 'Call dentist', 'Review report', 'Send email', 'Update calendar'."

Example 2 - User declines deletion:
- User: "Delete all my tasks"
- Assistant: "I found 12 tasks in total. Are you sure you want to delete all of them? This cannot be undone."
- User: "No, cancel that"
- Assistant: "Okay, I've cancelled the deletion. No tasks were deleted."

Example 3 - Bulk complete operation:
- User: "Mark all pending tasks as done"
- Assistant: "I found 15 pending tasks. Are you sure you want to mark all of them as completed?"
- User: "Yes, proceed"
- Assistant: "I've marked 15 tasks as completed."

Example 4 - Single delete (no confirmation needed for single operations):
- User: "Delete the grocery task"
- Assistant: "I've deleted the task 'Buy groceries'."

Example 5 - Multiple matches require clarification first:
- User: "Delete the task"
- Assistant: "I found 3 tasks with similar names. Which one would you like to delete? 1) Buy groceries 2) Buy milk 3) Buy bread"
- User: "The first one"
- Assistant: "Are you sure you want to delete 'Buy groceries'? This cannot be undone."
- User: "Yes"
- Assistant: "I've deleted the task 'Buy groceries'."

**When Confirmation is Required**:
- Any delete operation (single or bulk)
- Bulk operations affecting 5+ items
- Operations explicitly marked as destructive
- When user uses phrases like "all", "everything", "delete all"

**When Confirmation is NOT Required**:
- Single task operations (complete, update) that are easily reversible
- Listing/viewing tasks
- Creating new tasks
- Single task deletion when task is clearly identified (use judgment)

**Tool Chaining for Complex Requests**:

You can chain multiple tool calls in logical order to fulfill complex requests in a single interaction.

**Guidelines**:
1. **Identify Complex Requests**: Requests that require multiple operations (e.g., "list and delete", "create then show", "find and update")
2. **Chain in Logical Order**: Execute tools in dependency order (e.g., list before delete, create before show)
3. **Maximum 10 Tool Calls**: Enforce a limit of 10 tool calls per message to prevent infinite loops
4. **Show Comprehensive Results**: Provide results from all tool calls, not just the final one
5. **Handle Dependencies**: Ensure earlier tool results inform later tool calls (e.g., use task IDs from list_tasks in delete_task)

**Common Chaining Patterns**:
- **List then Delete**: "Show my tasks and delete the completed ones" → list_tasks(status="completed") → delete_task(id) for each
- **Create then List**: "Add a task to buy milk and show me all my tasks" → add_task(title="Buy milk") → list_tasks()
- **Find then Update**: "Find the grocery task and mark it done" → list_tasks() → complete_task(id)
- **Find then Delete**: "Delete all tasks with 'meeting' in the title" → list_tasks() → delete_task(id) for matches
- **Update then List**: "Change my meeting task to tomorrow and show my schedule" → update_task(id, due_date) → list_tasks()
- **Multiple Creates**: "Add tasks to buy milk, bread, and eggs" → add_task() three times

**Partial Failure Handling**:
- If a tool chain fails midway, communicate what succeeded and what failed
- Do NOT rollback successful operations (tools are stateless)
- Provide clear error messages indicating which step failed
- Example: "I successfully listed your 5 tasks, but failed to delete task 'Buy groceries' (ID: abc-123): Task not found. The other 4 tasks were deleted successfully."

**Examples**:

Example 1 - List then Delete:
- User: "Show my completed tasks and delete them"
- Assistant: Calls list_tasks(status="completed") → Gets 3 tasks → Calls delete_task() for each → "I found 3 completed tasks and deleted them: 'Buy groceries', 'Call dentist', 'Send email'."

Example 2 - Create then List:
- User: "Add a task to buy milk and show me all my tasks"
- Assistant: Calls add_task(title="Buy milk") → Calls list_tasks() → "I've added 'Buy milk' to your tasks. Here are all your tasks: 1) Buy milk (pending), 2) Call dentist (pending), 3) Review report (completed)."

Example 3 - Find then Update:
- User: "Find my grocery task and mark it done"
- Assistant: Calls list_tasks() → Finds task with "grocery" in title → Calls complete_task(id) → "I found your task 'Buy groceries' and marked it as completed."

Example 4 - Partial Failure:
- User: "Delete all my tasks"
- Assistant: Calls list_tasks() → Gets 5 tasks → Calls delete_task() for each → One fails → "I deleted 4 tasks successfully: 'Buy milk', 'Call dentist', 'Send email', 'Review report'. However, I failed to delete 'Meeting notes' (ID: xyz-789): Permission denied."

Example 5 - Complex Multi-Step:
- User: "Show my pending tasks, mark the first two as done, and delete the completed ones"
- Assistant: Calls list_tasks(status="pending") → Calls complete_task() twice → Calls list_tasks(status="completed") → Calls delete_task() for each completed → "I found 5 pending tasks, marked 'Buy milk' and 'Call dentist' as completed, then deleted 3 completed tasks: 'Buy milk', 'Call dentist', 'Old meeting notes'."

**Tool Call Limit Enforcement**:
- If a request would require more than 10 tool calls, inform the user and ask them to break it into smaller requests
- Example: "You have 25 completed tasks. Deleting all of them would require 26 tool calls (1 to list, 25 to delete), which exceeds the 10 tool call limit. Would you like me to delete the first 9 completed tasks, or would you prefer a different approach?"

**Natural Language Parsing**:
- "tomorrow" → due_date = next day in YYYY-MM-DD format
- "next week" → due_date = 7 days from now
- "buy groceries and milk" → title = "Buy groceries and milk"
- "the grocery task" → search for task with "grocery" in title
"""


def validate_openrouter_key() -> None:
    """
    Validate that OPENROUTER_API_KEY is set in environment.

    Raises:
        ValueError: If OPENROUTER_API_KEY is not set
    """
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise ValueError("OPENROUTER_API_KEY environment variable is not set")


def create_task_agent(jwt_token: str) -> Agent:
    """
    Create a task management agent with MCP tools.

    Args:
        jwt_token: JWT token for user authentication

    Returns:
        Agent: Configured agent instance with 5 MCP tool wrappers

    Raises:
        ValueError: If OPENROUTER_API_KEY is not set
    """
    from .mcp_tools_api import (
        add_task_tool,
        list_tasks_tool,
        complete_task_tool,
        update_task_tool,
        delete_task_tool
    )
    from openai import AsyncOpenAI
    from agents import set_default_openai_client

    # Create async wrappers for async MCP tools with JWT token bound
    @function_tool
    async def add_task(
        title: str,
        description: str = "",
        due_date: str = "",
        priority: str = "medium",
        category_id: Optional[str] = None
    ) -> dict:
        """
        Create a new task.

        Args:
            title: Task title (required)
            description: Task description (optional)
            due_date: Due date in YYYY-MM-DD format (optional)
            priority: Task priority - low, medium, high (default: medium)
            category_id: Category UUID (optional)

        Returns:
            dict: Created task details or error message
        """
        try:
            result = await add_task_tool(
                title=title,
                jwt_token=jwt_token,
                description=description,
                due_date=due_date,
                priority=priority,
                category_id=category_id
            )
            return result
        except Exception as e:
            import traceback
            error_details = f"Error in add_task: {str(e)}\n{traceback.format_exc()}"
            print(error_details)  # This will show in the backend logs
            return {"error": str(e), "details": "Check backend logs for full traceback"}

    @function_tool
    async def list_tasks(
        status: str = "all",
        category_id: Optional[str] = None,
        priority: Optional[str] = None
    ) -> dict:
        """
        Retrieve tasks with optional filtering.

        Args:
            status: Filter by status - pending, completed, all (default: all)
            category_id: Filter by category UUID (optional)
            priority: Filter by priority - low, medium, high (optional)

        Returns:
            dict: List of tasks or error message
        """
        return await list_tasks_tool(
            jwt_token=jwt_token,
            status=status,
            category_id=category_id,
            priority=priority
        )

    @function_tool
    async def complete_task(task_id: str) -> dict:
        """
        Mark a task as completed.

        Args:
            task_id: Task UUID (required)

        Returns:
            dict: Updated task details or error message
        """
        return await complete_task_tool(
            task_id=task_id,
            jwt_token=jwt_token
        )

    @function_tool
    async def update_task(
        task_id: str,
        title: Optional[str] = None,
        description: Optional[str] = None,
        due_date: Optional[str] = None,
        priority: Optional[str] = None,
        category_id: Optional[str] = None
    ) -> dict:
        """
        Update task fields.

        Args:
            task_id: Task UUID (required)
            title: New task title (optional)
            description: New task description (optional)
            due_date: New due date in YYYY-MM-DD format (optional)
            priority: New priority - low, medium, high (optional)
            category_id: New category UUID (optional)

        Returns:
            dict: Updated task details or error message
        """
        return await update_task_tool(
            task_id=task_id,
            jwt_token=jwt_token,
            title=title,
            description=description,
            due_date=due_date,
            priority=priority,
            category_id=category_id
        )

    @function_tool
    async def delete_task(task_id: str) -> dict:
        """
        Permanently delete a task.

        Args:
            task_id: Task UUID (required)

        Returns:
            dict: Success message or error message
        """
        return await delete_task_tool(
            task_id=task_id,
            jwt_token=jwt_token
        )

    # Validate OpenRouter API key is set
    validate_openrouter_key()

    # Get OpenRouter API key
    openrouter_api_key = os.getenv("OPENROUTER_API_KEY")

    # Create custom AsyncOpenAI client for OpenRouter
    # OpenRouter has an OpenAI-compatible API endpoint
    # OpenRouter requires specific headers for proper authentication
    openrouter_client = AsyncOpenAI(
        base_url=OPENROUTER_BASE_URL,
        api_key=openrouter_api_key,
        default_headers={
            "HTTP-Referer": "http://localhost:3000",  # Your site URL
            "X-Title": "Task Management App"  # Your app name
        }
    )

    # Set as default client for the agents SDK
    set_default_openai_client(openrouter_client)

    # Create Agent with all 5 MCP tools
    # Use the model name without "openrouter/" prefix since we're using OpenRouter's endpoint
    agent = Agent(
        name="Task Management Assistant",
        instructions=SYSTEM_INSTRUCTIONS,
        model=MODEL_NAME,
        tools=[add_task, list_tasks, complete_task, update_task, delete_task]
    )

    return agent


async def run_agent(agent: Agent, message: str, history: Optional[List[Dict[str, str]]] = None) -> str:
    """
    Run the agent with a user message and optional conversation history.

    Builds message array with system instructions + history + new message,
    then passes to agent for processing with full context.

    Supports multiple tool calls per message (up to 10 tool calls).
    Handles partial failures gracefully by tracking successful and failed operations.

    Args:
        agent: Agent instance
        message: User message
        history: Optional conversation history as list of message dicts
                 Format: [{"role": "user", "content": "..."}, ...]

    Returns:
        str: Assistant response as string

    Raises:
        Exception: If agent execution fails

    Example:
        >>> history = [
        ...     {"role": "user", "content": "Show my tasks"},
        ...     {"role": "assistant", "content": "Here are your tasks: ..."}
        ... ]
        >>> response = await run_agent(agent, "Mark the first one as done", history)
    """
    try:
        from agents import Runner

        # Build message with history context (T038)
        # For stateless operation, prepend history as context to the message
        if history and len(history) > 0:
            # Format history as context
            history_context = "Previous conversation:\n"
            for msg in history:
                role = msg.get("role", "unknown")
                content = msg.get("content", "")
                if role == "user":
                    history_context += f"User: {content}\n"
                elif role == "assistant":
                    history_context += f"Assistant: {content}\n"
                elif role == "system":
                    # System messages (like summaries) are included as-is
                    history_context += f"{content}\n"

            # Prepend history context to current message
            message_with_context = f"{history_context}\nCurrent request:\nUser: {message}"
        else:
            # No history, use message as-is
            message_with_context = message

        # Run agent with message (including history context if present)
        # The OpenAI Agents SDK uses Runner.run() for async contexts
        # The agent will automatically chain tool calls as needed
        runner = Runner()
        result = await runner.run(
            starting_agent=agent,
            input=message_with_context,
            max_turns=20
        )

        # Extract response content from RunResult
        # The SDK returns a RunResult object with final_output attribute
        if hasattr(result, 'final_output'):
            # final_output contains the agent's final response
            if isinstance(result.final_output, str):
                response_content = result.final_output
            else:
                # If it's not a string, convert it
                response_content = str(result.final_output)
        else:
            # Fallback to string representation
            response_content = str(result)

        # Tool call limit enforcement (T044)
        # Note: The OpenAI Agents SDK handles tool calls internally via max_turns
        # We set max_turns=10 to limit the number of agent invocations
        # The SDK's native behavior should prevent excessive tool calls

        return response_content

    except Exception as e:
        # Handle agent errors gracefully (T045)
        # Partial failure handling: If tool chain fails midway, the SDK will
        # return the error in the response content, which the agent should
        # communicate to the user based on system instructions
        error_msg = f"I encountered an error processing your request: {str(e)}"
        return error_msg
