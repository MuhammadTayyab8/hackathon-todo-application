"""
MCP Server Authentication and Error Handling

This module provides JWT authentication and error handling utilities for the MCP server.
It integrates with the existing Better Auth JWT system to verify user identity and
enforce user isolation across all tool calls.
"""

import os
import uuid
from typing import Any, Dict, Optional
from jose import jwt, JWTError
import mcp.types as types


# JWT Settings (reuse from existing auth_service.py)
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"


class AuthenticationError(Exception):
    """Raised when JWT authentication fails."""
    pass


class TaskNotFoundError(Exception):
    """Raised when a task is not found or user is unauthorized."""
    pass


class ValidationError(Exception):
    """Raised when input validation fails."""
    pass


class DatabaseError(Exception):
    """Raised when database operations fail."""
    pass


def verify_jwt_token(token: str) -> str:
    """
    Verify JWT token and extract user_id.

    Args:
        token: JWT token string

    Returns:
        user_id as string (UUID format)

    Raises:
        AuthenticationError: If token is invalid or expired
    """
    if not token:
        raise AuthenticationError("JWT token is required")

    if not SECRET_KEY:
        raise AuthenticationError("BETTER_AUTH_SECRET not configured")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("userId") or payload.get("sub")

        if not user_id:
            raise AuthenticationError("Invalid token payload: missing userId")

        # Validate UUID format
        try:
            uuid.UUID(user_id)
        except ValueError:
            raise AuthenticationError("Invalid user_id format in token")

        return user_id

    except JWTError as e:
        raise AuthenticationError(f"Invalid or expired token: {str(e)}")


def extract_user_id_from_arguments(arguments: Dict[str, Any]) -> str:
    """
    Extract and validate user_id from tool arguments.

    This function expects the JWT token to be passed in the arguments
    as '_jwt_token' and extracts the user_id from it.

    Args:
        arguments: Tool call arguments dictionary

    Returns:
        user_id as string (UUID format)

    Raises:
        AuthenticationError: If authentication fails
    """
    # Extract JWT token from arguments
    token = arguments.get("_jwt_token")

    if not token:
        raise AuthenticationError("Authentication required: JWT token not provided")

    # Verify token and extract user_id
    user_id = verify_jwt_token(token)

    # Validate that user_id in arguments matches token
    provided_user_id = arguments.get("user_id")
    if provided_user_id and provided_user_id != user_id:
        raise AuthenticationError("User ID mismatch: token user_id does not match provided user_id")

    return user_id


def create_error_result(error_message: str) -> types.CallToolResult:
    """
    Create an error CallToolResult for MCP.

    Args:
        error_message: Descriptive error message

    Returns:
        CallToolResult with isError=True
    """
    return types.CallToolResult(
        content=[types.TextContent(type="text", text=error_message)],
        isError=True
    )


def create_success_result(data: Dict[str, Any]) -> types.CallToolResult:
    """
    Create a success CallToolResult for MCP.

    Args:
        data: Result data dictionary

    Returns:
        CallToolResult with structured content
    """
    import json
    return types.CallToolResult(
        content=[types.TextContent(type="text", text=json.dumps(data))],
        isError=False
    )


def handle_tool_error(error: Exception) -> types.CallToolResult:
    """
    Handle tool execution errors and return appropriate CallToolResult.

    Args:
        error: Exception that occurred during tool execution

    Returns:
        CallToolResult with error information
    """
    if isinstance(error, AuthenticationError):
        return create_error_result(f"Authentication required: {str(error)}")
    elif isinstance(error, TaskNotFoundError):
        return create_error_result(f"Task not found: {str(error)}")
    elif isinstance(error, ValidationError):
        return create_error_result(f"Validation error: {str(error)}")
    elif isinstance(error, DatabaseError):
        return create_error_result(f"Database error: {str(error)}")
    else:
        return create_error_result(f"Internal error: {str(error)}")


def validate_uuid(value: str, field_name: str) -> uuid.UUID:
    """
    Validate and convert string to UUID.

    Args:
        value: String value to validate
        field_name: Name of the field (for error messages)

    Returns:
        UUID object

    Raises:
        ValidationError: If value is not a valid UUID
    """
    try:
        return uuid.UUID(value)
    except (ValueError, AttributeError):
        raise ValidationError(f"Invalid {field_name}: must be a valid UUID")


def validate_date_range(start_date: Optional[str], end_date: Optional[str]) -> None:
    """
    Validate that end_date is not before start_date.

    Args:
        start_date: ISO 8601 datetime string (optional)
        end_date: ISO 8601 datetime string (optional)

    Raises:
        ValidationError: If end_date is before start_date
    """
    if start_date and end_date:
        from datetime import datetime
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            end = datetime.fromisoformat(end_date.replace('Z', '+00:00'))

            if end < start:
                raise ValidationError("end_date must be greater than or equal to start_date")
        except ValueError as e:
            raise ValidationError(f"Invalid date format: {str(e)}")
