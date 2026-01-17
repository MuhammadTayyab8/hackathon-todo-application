"""
Add Task Tool Handler

Implements the add_task MCP tool for creating new tasks.
Enforces user isolation via JWT authentication and validates all inputs.
"""

from datetime import datetime, timezone
from typing import Any, Dict
import uuid

from sqlalchemy.ext.asyncio import AsyncEngine
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession
import mcp.types as types

from src.models.task import Task
from src.mcp_server.auth import (
    extract_user_id_from_arguments,
    validate_uuid,
    validate_date_range,
    create_success_result,
    handle_tool_error,
    AuthenticationError,
    ValidationError,
    DatabaseError,
)


async def handle_add_task(
    db_engine: AsyncEngine,
    arguments: Dict[str, Any]
) -> types.CallToolResult:
    """
    Handle add_task tool execution.

    Creates a new task for the authenticated user with the provided details.

    Args:
        db_engine: Database engine from lifespan context
        arguments: Tool arguments including user_id, title, description, dates

    Returns:
        CallToolResult with task_id, status, and title
    """
    try:
        # Extract and verify JWT authentication
        user_id = extract_user_id_from_arguments(arguments)
        user_uuid = validate_uuid(user_id, "user_id")

        # Extract and validate required fields
        title = arguments.get("title")
        if not title or not title.strip():
            raise ValidationError("Title is required and cannot be empty")

        if len(title) > 500:
            raise ValidationError("Title must be 500 characters or less")

        # Extract optional fields
        description = arguments.get("description")
        if description and len(description) > 5000:
            raise ValidationError("Description must be 5000 characters or less")

        start_date_str = arguments.get("start_date")
        end_date_str = arguments.get("end_date")

        # Validate date range if both provided
        validate_date_range(start_date_str, end_date_str)

        # Parse dates
        start_date = None
        end_date = None

        if start_date_str:
            try:
                start_date = datetime.fromisoformat(start_date_str.replace('Z', '+00:00'))
                # Store without timezone info (as per existing Task model)
                start_date = start_date.replace(tzinfo=None)
            except ValueError as e:
                raise ValidationError(f"Invalid start_date format: {str(e)}")

        if end_date_str:
            try:
                end_date = datetime.fromisoformat(end_date_str.replace('Z', '+00:00'))
                # Store without timezone info (as per existing Task model)
                end_date = end_date.replace(tzinfo=None)
            except ValueError as e:
                raise ValidationError(f"Invalid end_date format: {str(e)}")

        # Create task in database
        async with AsyncSession(db_engine) as session:
            try:
                # Create new task
                new_task = Task(
                    user_id=user_uuid,
                    title=title.strip(),
                    description=description.strip() if description else None,
                    start_date=start_date,
                    due_date=end_date,
                    completed=False,
                    created_at=datetime.now(timezone.utc).replace(tzinfo=None),
                    updated_at=datetime.now(timezone.utc).replace(tzinfo=None)
                )

                session.add(new_task)
                await session.commit()
                await session.refresh(new_task)

                # Return success result
                result_data = {
                    "task_id": str(new_task.id),
                    "status": "pending",
                    "title": new_task.title
                }

                return create_success_result(result_data)

            except Exception as e:
                await session.rollback()
                raise DatabaseError(f"Failed to create task: {str(e)}")

    except (AuthenticationError, ValidationError, DatabaseError) as e:
        return handle_tool_error(e)
    except Exception as e:
        return handle_tool_error(DatabaseError(f"Unexpected error: {str(e)}"))
