"""
MCP Tool Schemas

This module defines JSON Schema specifications for all MCP tool inputs and outputs.
These schemas are used by the MCP SDK for automatic validation and documentation.

All schemas follow the MCP specification format with inputSchema and outputSchema.
"""

import mcp.types as types


def get_add_task_tool() -> types.Tool:
    """Define the add_task tool schema."""
    return types.Tool(
        name="add_task",
        description="Create a new task for the authenticated user. Returns the created task's ID, status, and title.",
        inputSchema={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "User ID extracted from JWT token (automatically provided by authentication)"
                },
                "title": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 500,
                    "description": "Task title (required, non-empty)"
                },
                "description": {
                    "type": "string",
                    "maxLength": 5000,
                    "description": "Detailed task description (optional)"
                },
                "start_date": {
                    "type": "string",
                    "format": "date-time",
                    "description": "When the task should start (ISO 8601 format, optional)"
                },
                "end_date": {
                    "type": "string",
                    "format": "date-time",
                    "description": "When the task is due (ISO 8601 format, optional, must be >= start_date)"
                }
            },
            "required": ["user_id", "title"]
        },
        outputSchema={
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "Unique identifier of the created task"
                },
                "status": {
                    "type": "string",
                    "enum": ["pending", "completed"],
                    "description": "Task completion status (always 'pending' for newly created tasks)"
                },
                "title": {
                    "type": "string",
                    "description": "Task title as stored"
                }
            },
            "required": ["task_id", "status", "title"]
        }
    )


def get_list_tasks_tool() -> types.Tool:
    """Define the list_tasks tool schema."""
    return types.Tool(
        name="list_tasks",
        description="Retrieve all tasks for the authenticated user, optionally filtered by completion status.",
        inputSchema={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "User ID extracted from JWT token"
                },
                "status_filter": {
                    "type": "string",
                    "enum": ["all", "pending", "completed"],
                    "description": "Filter tasks by completion status"
                }
            },
            "required": ["user_id", "status_filter"]
        },
        outputSchema={
            "type": "object",
            "properties": {
                "tasks": {
                    "type": "array",
                    "items": {
                        "type": "object",
                        "properties": {
                            "task_id": {"type": "string", "format": "uuid"},
                            "title": {"type": "string"},
                            "description": {"type": ["string", "null"]},
                            "status": {"type": "string", "enum": ["pending", "completed"]},
                            "start_date": {"type": ["string", "null"], "format": "date-time"},
                            "end_date": {"type": ["string", "null"], "format": "date-time"},
                            "created_at": {"type": "string", "format": "date-time"},
                            "updated_at": {"type": "string", "format": "date-time"}
                        }
                    }
                },
                "count": {"type": "integer", "minimum": 0}
            },
            "required": ["tasks", "count"]
        }
    )


def get_complete_task_tool() -> types.Tool:
    """Define the complete_task tool schema."""
    return types.Tool(
        name="complete_task",
        description="Mark a task as completed for the authenticated user.",
        inputSchema={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "User ID extracted from JWT token"
                },
                "task_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "Unique identifier of the task to complete"
                }
            },
            "required": ["user_id", "task_id"]
        },
        outputSchema={
            "type": "object",
            "properties": {
                "task_id": {"type": "string", "format": "uuid"},
                "status": {"type": "string", "enum": ["completed"]},
                "title": {"type": "string"}
            },
            "required": ["task_id", "status", "title"]
        }
    )


def get_delete_task_tool() -> types.Tool:
    """Define the delete_task tool schema."""
    return types.Tool(
        name="delete_task",
        description="Permanently delete a task for the authenticated user.",
        inputSchema={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "User ID extracted from JWT token"
                },
                "task_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "Unique identifier of the task to delete"
                }
            },
            "required": ["user_id", "task_id"]
        },
        outputSchema={
            "type": "object",
            "properties": {
                "task_id": {"type": "string", "format": "uuid"},
                "status": {"type": "string", "enum": ["deleted"]},
                "title": {"type": "string"}
            },
            "required": ["task_id", "status", "title"]
        }
    )


def get_update_task_tool() -> types.Tool:
    """Define the update_task tool schema."""
    return types.Tool(
        name="update_task",
        description="Update a task's title and/or description for the authenticated user.",
        inputSchema={
            "type": "object",
            "properties": {
                "user_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "User ID extracted from JWT token"
                },
                "task_id": {
                    "type": "string",
                    "format": "uuid",
                    "description": "Unique identifier of the task to update"
                },
                "title": {
                    "type": "string",
                    "minLength": 1,
                    "maxLength": 500,
                    "description": "New task title (optional)"
                },
                "description": {
                    "type": "string",
                    "maxLength": 5000,
                    "description": "New task description (optional)"
                }
            },
            "required": ["user_id", "task_id"]
        },
        outputSchema={
            "type": "object",
            "properties": {
                "task_id": {"type": "string", "format": "uuid"},
                "status": {"type": "string", "enum": ["pending", "completed"]},
                "title": {"type": "string"}
            },
            "required": ["task_id", "status", "title"]
        }
    )
