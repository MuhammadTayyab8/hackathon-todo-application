"""
MCP Tool Wrappers

Wraps MCP server tools as OpenAI Agents SDK function tools.
Each wrapper internally calls the MCP server via subprocess/stdio.
"""

import os
import json
from typing import Optional, Dict, Any
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

# MCP Server Configuration
MCP_SERVER_PARAMS = StdioServerParameters(
    command="python",
    args=[os.path.join(os.path.dirname(__file__), "..", "..", "mcp_server_main.py")],
    env={
        "DATABASE_URL": os.getenv("DATABASE_URL", ""),
        "PYTHONPATH": os.path.join(os.path.dirname(__file__), "..", "..")
    }
)


async def call_mcp_tool(tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
    """
    Call an MCP tool via stdio client.

    Args:
        tool_name: Name of the MCP tool to call
        arguments: Tool arguments

    Returns:
        dict: Tool result or error message

    Raises:
        Exception: If MCP client connection fails
    """
    try:
        async with stdio_client(MCP_SERVER_PARAMS) as (read, write):
            async with ClientSession(read, write) as session:
                await session.initialize()

                # Call MCP tool
                result = await session.call_tool(tool_name, arguments=arguments)

                # Parse result
                if result.isError:
                    return {"error": result.content[0].text if result.content else "Unknown error"}

                # Return parsed JSON result
                if result.content and len(result.content) > 0:
                    return json.loads(result.content[0].text)

                return {"error": "Empty response from MCP tool"}

    except Exception as e:
        return {"error": f"MCP tool call failed: {str(e)}"}


# MCP Tool Wrappers for OpenAI Agents SDK
# Note: These will be decorated with @function_tool in Phase 3 when integrating with Agent

async def add_task_tool(
    title: str,
    jwt_token: str,
    description: str = "",
    due_date: str = "",
    priority: str = "medium",
    category_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Create a new task.

    Args:
        title: Task title (required)
        jwt_token: JWT token for authentication (required)
        description: Task description (optional)
        due_date: Due date in YYYY-MM-DD format (optional)
        priority: Task priority - low, medium, high (default: medium)
        category_id: Category UUID (optional)

    Returns:
        dict: Created task details or error message
    """
    return await call_mcp_tool(
        "add_task",
        {
            "title": title,
            "description": description,
            "due_date": due_date,
            "priority": priority,
            "category_id": category_id,
            "jwt_token": jwt_token
        }
    )


async def list_tasks_tool(
    jwt_token: str,
    status: str = "all",
    category_id: Optional[str] = None,
    priority: Optional[str] = None
) -> Dict[str, Any]:
    """
    Retrieve tasks with optional filtering.

    Args:
        jwt_token: JWT token for authentication (required)
        status: Filter by status - pending, completed, all (default: all)
        category_id: Filter by category UUID (optional)
        priority: Filter by priority - low, medium, high (optional)

    Returns:
        dict: List of tasks or error message
    """
    return await call_mcp_tool(
        "list_tasks",
        {
            "status": status,
            "category_id": category_id,
            "priority": priority,
            "jwt_token": jwt_token
        }
    )


async def complete_task_tool(
    task_id: str,
    jwt_token: str
) -> Dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        task_id: Task UUID (required)
        jwt_token: JWT token for authentication (required)

    Returns:
        dict: Updated task details or error message
    """
    return await call_mcp_tool(
        "complete_task",
        {
            "task_id": task_id,
            "jwt_token": jwt_token
        }
    )


async def update_task_tool(
    task_id: str,
    jwt_token: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[str] = None
) -> Dict[str, Any]:
    """
    Update task fields.

    Args:
        task_id: Task UUID (required)
        jwt_token: JWT token for authentication (required)
        title: New task title (optional)
        description: New task description (optional)
        due_date: New due date in YYYY-MM-DD format (optional)
        priority: New priority - low, medium, high (optional)
        category_id: New category UUID (optional)

    Returns:
        dict: Updated task details or error message
    """
    # Build update fields dict (only include non-None values)
    fields = {}
    if title is not None:
        fields["title"] = title
    if description is not None:
        fields["description"] = description
    if due_date is not None:
        fields["due_date"] = due_date
    if priority is not None:
        fields["priority"] = priority
    if category_id is not None:
        fields["category_id"] = category_id

    return await call_mcp_tool(
        "update_task",
        {
            "task_id": task_id,
            "fields": fields,
            "jwt_token": jwt_token
        }
    )


async def delete_task_tool(
    task_id: str,
    jwt_token: str
) -> Dict[str, Any]:
    """
    Permanently delete a task.

    Args:
        task_id: Task UUID (required)
        jwt_token: JWT token for authentication (required)

    Returns:
        dict: Success message or error message
    """
    return await call_mcp_tool(
        "delete_task",
        {
            "task_id": task_id,
            "jwt_token": jwt_token
        }
    )


# Export all tool wrappers
__all__ = [
    "MCP_SERVER_PARAMS",
    "call_mcp_tool",
    "add_task_tool",
    "list_tasks_tool",
    "complete_task_tool",
    "update_task_tool",
    "delete_task_tool"
]
