"""
Delete Task Tool Handler

Implements the delete_task MCP tool for permanently removing tasks.
Enforces user isolation and captures task title before deletion.
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
    TaskNotFoundError,
    DatabaseError,
)


async def handle_delete_task(
    db_engine: AsyncEngine,
    arguments: Dict[str, Any]
) -> types.CallToolResult:
    """
    Handle delete_task tool execution.

    Permanently deletes a task for the authenticated user.

    Args:
        db_engine: Database engine from lifespan context
        arguments: Tool arguments including user_id and task_id

    Returns:
        CallToolResult with task_id, status "deleted", and title
    """
    try:
        # Extract and verify JWT authentication
        user_id = extract_user_id_from_arguments(arguments)
        user_uuid = validate_uuid(user_id, "user_id")

        # Extract and validate task_id
        task_id = arguments.get("task_id")
        if not task_id:
            raise ValidationError("task_id is required")

        task_uuid = validate_uuid(task_id, "task_id")

        # Delete task from database
        async with AsyncSession(db_engine) as session:
            try:
                # Query task with user_id and task_id filters (user isolation)
                statement = select(Task).where(
                    Task.user_id == user_uuid,
                    Task.id == task_uuid
                )
                result = await session.execute(statement)
                task = result.scalar_one_or_none()

                if not task:
                    raise TaskNotFoundError(
                        f"Task not found or you don't have permission to access it"
                    )

                # Capture task details before deletion
                task_id_str = str(task.id)
                task_title = task.title

                # Delete task
                await session.delete(task)
                await session.commit()

                # Return success result
                result_data = {
                    "task_id": task_id_str,
                    "status": "deleted",
                    "title": task_title
                }

                return create_success_result(result_data)

            except TaskNotFoundError:
                raise
            except Exception as e:
                await session.rollback()
                raise DatabaseError(f"Failed to delete task: {str(e)}")

    except (AuthenticationError, ValidationError, TaskNotFoundError, DatabaseError) as e:
        return handle_tool_error(e)
    except Exception as e:
        return handle_tool_error(DatabaseError(f"Unexpected error: {str(e)}"))
