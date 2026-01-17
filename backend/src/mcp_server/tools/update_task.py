"""
Update Task Tool Handler

Implements the update_task MCP tool for modifying task details.
Supports partial updates (title and/or description) with user isolation.
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


async def handle_update_task(
    db_engine: AsyncEngine,
    arguments: Dict[str, Any]
) -> types.CallToolResult:
    """
    Handle update_task tool execution.

    Updates a task's title and/or description for the authenticated user.

    Args:
        db_engine: Database engine from lifespan context
        arguments: Tool arguments including user_id, task_id, and optional title/description

    Returns:
        CallToolResult with task_id, status, and updated title
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

        # Extract optional update fields
        new_title = arguments.get("title")
        new_description = arguments.get("description")

        # Validate that at least one field is provided
        if new_title is None and new_description is None:
            raise ValidationError(
                "At least one of 'title' or 'description' must be provided"
            )

        # Validate title if provided
        if new_title is not None:
            if not new_title.strip():
                raise ValidationError("Title cannot be empty")
            if len(new_title) > 500:
                raise ValidationError("Title must be 500 characters or less")

        # Validate description if provided
        if new_description is not None and len(new_description) > 5000:
            raise ValidationError("Description must be 5000 characters or less")

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

                # Update only provided fields
                if new_title is not None:
                    task.title = new_title.strip()

                if new_description is not None:
                    task.description = new_description.strip() if new_description else None

                # Update timestamp
                task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

                await session.commit()
                await session.refresh(task)

                # Return success result
                result_data = {
                    "task_id": str(task.id),
                    "status": "completed" if task.completed else "pending",
                    "title": task.title
                }

                return create_success_result(result_data)

            except TaskNotFoundError:
                raise
            except Exception as e:
                await session.rollback()
                raise DatabaseError(f"Failed to update task: {str(e)}")

    except (AuthenticationError, ValidationError, TaskNotFoundError, DatabaseError) as e:
        return handle_tool_error(e)
    except Exception as e:
        return handle_tool_error(DatabaseError(f"Unexpected error: {str(e)}"))
