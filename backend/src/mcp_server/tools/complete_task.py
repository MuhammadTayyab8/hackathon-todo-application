"""
Complete Task Tool Handler

Implements the complete_task MCP tool for marking tasks as completed.
Enforces user isolation and updates the task status and timestamp.
"""

from datetime import datetime, timezone
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


async def handle_complete_task(
    db_engine: AsyncEngine,
    arguments: Dict[str, Any]
) -> types.CallToolResult:
    """
    Handle complete_task tool execution.

    Marks a task as completed for the authenticated user.

    Args:
        db_engine: Database engine from lifespan context
        arguments: Tool arguments including user_id and task_id

    Returns:
        CallToolResult with task_id, status "completed", and title
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

        # Update task in database
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

                # Mark task as completed
                task.completed = True
                task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

                await session.commit()
                await session.refresh(task)

                # Return success result
                result_data = {
                    "task_id": str(task.id),
                    "status": "completed",
                    "title": task.title
                }

                return create_success_result(result_data)

            except TaskNotFoundError:
                raise
            except Exception as e:
                await session.rollback()
                raise DatabaseError(f"Failed to complete task: {str(e)}")

    except (AuthenticationError, ValidationError, TaskNotFoundError, DatabaseError) as e:
        return handle_tool_error(e)
    except Exception as e:
        return handle_tool_error(DatabaseError(f"Unexpected error: {str(e)}"))
