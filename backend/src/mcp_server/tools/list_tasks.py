"""
List Tasks Tool Handler

Implements the list_tasks MCP tool for retrieving user tasks with filtering.
Enforces user isolation and supports status-based filtering.
"""

from typing import Any, Dict
from sqlalchemy.ext.asyncio import AsyncEngine
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
import mcp.types as types

from src.models.task import Task
from src.mcp_server.auth import (
    extract_user_id_from_arguments,
    validate_uuid,
    create_success_result,
    handle_tool_error,
    AuthenticationError,
    ValidationError,
    DatabaseError,
)


async def handle_list_tasks(
    db_engine: AsyncEngine,
    arguments: Dict[str, Any]
) -> types.CallToolResult:
    """
    Handle list_tasks tool execution.

    Retrieves all tasks for the authenticated user with optional status filtering.

    Args:
        db_engine: Database engine from lifespan context
        arguments: Tool arguments including user_id and status_filter

    Returns:
        CallToolResult with tasks array and count
    """
    try:
        # Extract and verify JWT authentication
        user_id = extract_user_id_from_arguments(arguments)
        user_uuid = validate_uuid(user_id, "user_id")

        # Extract and validate status filter
        status_filter = arguments.get("status_filter", "all")
        if status_filter not in ["all", "pending", "completed"]:
            raise ValidationError(
                f"Invalid status_filter: must be 'all', 'pending', or 'completed'"
            )

        # Query tasks from database
        async with AsyncSession(db_engine) as session:
            try:
                # Build query with user_id filter
                statement = select(Task).where(Task.user_id == user_uuid)

                # Apply status filter
                if status_filter == "pending":
                    statement = statement.where(Task.completed == False)
                elif status_filter == "completed":
                    statement = statement.where(Task.completed == True)
                # "all" filter: no additional where clause

                # Execute query
                result = await session.execute(statement)
                tasks = result.scalars().all()

                # Serialize tasks to output format
                tasks_data = []
                for task in tasks:
                    task_dict = {
                        "task_id": str(task.id),
                        "title": task.title,
                        "description": task.description,
                        "status": "completed" if task.completed else "pending",
                        "start_date": task.start_date.isoformat() if task.start_date else None,
                        "end_date": task.due_date.isoformat() if task.due_date else None,
                        "created_at": task.created_at.isoformat() if task.created_at else None,
                        "updated_at": task.updated_at.isoformat() if task.updated_at else None,
                    }
                    tasks_data.append(task_dict)

                # Return success result
                result_data = {
                    "tasks": tasks_data,
                    "count": len(tasks_data)
                }

                return create_success_result(result_data)

            except Exception as e:
                raise DatabaseError(f"Failed to retrieve tasks: {str(e)}")

    except (AuthenticationError, ValidationError, DatabaseError) as e:
        return handle_tool_error(e)
    except Exception as e:
        return handle_tool_error(DatabaseError(f"Unexpected error: {str(e)}"))
