"""
Chat API Routes

Endpoints for AI chatbot interaction and task management via natural language.
"""

import logging
import time
import traceback
from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field, validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlmodel.ext.asyncio.session import AsyncSession

from src.db import get_session
from src.services.chat_service import process_chat_message
from src.services.chatkit_server import chatkit_server, RequestContext
from chatkit.server import StreamingResult
from openai import OpenAI
import os

# Configure logging safely for deployment
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

console_handler = logging.StreamHandler()
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    "%Y-%m-%d %H:%M:%S"
)
console_handler.setFormatter(formatter)

# prevent duplicate handlers
if not logger.handlers:
    logger.addHandler(console_handler)

# Optional: try to create file logging, but don't crash if it fails
try:
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
    LOG_DIR = os.path.join(BASE_DIR, "logs")
    os.makedirs(LOG_DIR, exist_ok=True)
    LOG_FILE = os.path.join(LOG_DIR, "chat_routes.log")
    file_handler = logging.FileHandler(LOG_FILE, encoding="utf-8")
    file_handler.setFormatter(formatter)
    logger.addHandler(file_handler)
except Exception as e:
    logger.warning(f"Could not create log file: {e}")

# T049: Rate limiting configuration (60 requests per minute per user)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter()


# Pydantic Models (T027, T028)

class ChatRequest(BaseModel):
    """
    Request model for chat endpoint.

    Attributes:
        message: User's message text (required, 1-2000 chars)
        conversation_id: Optional UUID to continue existing conversation
    """
    message: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="User's message text"
    )
    conversation_id: Optional[UUID] = Field(
        None,
        description="Optional conversation ID to continue existing conversation"
    )

    @validator('message')
    def message_not_empty(cls, v):
        """
        Validate message is not empty or whitespace only.

        T050: Input validation - check for special characters that could cause issues.
        """
        if not v or not v.strip():
            raise ValueError("Message text cannot be empty")

        # Check for null bytes or other problematic characters
        if '\x00' in v:
            raise ValueError("Message contains invalid characters")

        return v.strip()

    @validator('conversation_id')
    def validate_conversation_id(cls, v):
        """
        T050: Validate conversation_id format if provided.
        """
        if v is not None:
            # UUID validation is automatic via Pydantic, but we can add extra checks
            try:
                # Ensure it's a valid UUID
                str(v)
            except Exception:
                raise ValueError("Invalid conversation_id format (must be UUID)")
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Add a task to buy groceries tomorrow",
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000"
            }
        }


class ChatResponse(BaseModel):
    """
    Response model for chat endpoint.

    Attributes:
        conversation_id: UUID of the conversation
        message: AI assistant's response message
        created_at: Timestamp when response was created
    """
    conversation_id: UUID = Field(
        ...,
        description="Conversation ID (use this for follow-up messages)"
    )
    message: str = Field(
        ...,
        description="AI assistant's response message"
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when response was created"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                "message": "I've created a task 'Buy groceries' with due date tomorrow (2026-01-18).",
                "created_at": "2026-01-17T10:30:00Z"
            }
        }


class ChatSessionResponse(BaseModel):
    """
    Response model for chat session creation endpoint.

    Attributes:
        client_secret: OpenAI client secret for ChatKit integration
    """
    client_secret: str = Field(
        ...,
        description="OpenAI client secret for establishing ChatKit connection"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "client_secret": "sess_abc123xyz..."
            }
        }


# Helper Functions

def get_jwt_token(request: Request) -> str:
    """
    Extract JWT token from request (cookie or Authorization header).

    Args:
        request: FastAPI request object

    Returns:
        str: JWT token

    Raises:
        HTTPException: If token is missing
    """
    # Try cookie first
    token = request.cookies.get("auth_token")

    # Fall back to Authorization header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization token"
        )

    return token


def verify_user_id_match(request: Request, user_id: str) -> None:
    """
    Verify that user_id in URL matches authenticated user from JWT.

    Args:
        request: FastAPI request object (contains request.state.user_id from middleware)
        user_id: User ID from URL path parameter

    Raises:
        HTTPException: If user_id doesn't match authenticated user
    """
    authenticated_user_id = getattr(request.state, "user_id", None)

    if not authenticated_user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )

    if str(authenticated_user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User ID in URL does not match authenticated user"
        )


# API Endpoints (T029, T030, T031)

@router.post(
    "/{user_id}/chat",
    response_model=ChatResponse,
    status_code=status.HTTP_200_OK,
    summary="Send chat message to AI assistant",
    description="""
    Send a message to the AI chatbot for natural language task management.

    **Features:**
    - Natural language parsing of task management requests
    - Automatic tool invocation (add, list, complete, update, delete tasks)
    - Conversation history maintained across messages
    - Context-aware responses with conversation memory
    - Tool chaining for complex multi-step requests
    - Confirmation prompts for destructive operations

    **Rate Limiting:**
    - 60 requests per minute per user
    - Returns 429 status code when limit exceeded
    - Retry-After header indicates wait time in seconds

    **Authentication:**
    - Requires valid JWT token in Authorization header (Bearer token)
    - User ID in URL must match authenticated user from JWT

    **Conversation Flow:**
    1. First message: Creates new conversation, returns conversation_id
    2. Follow-up messages: Include conversation_id to maintain context
    3. Agent remembers previous messages and task operations

    **Examples:**
    - "Add a task to buy groceries tomorrow"
    - "Show me my pending tasks"
    - "Mark the first task as complete"
    - "Update the grocery task due date to next Monday"
    - "Delete all completed tasks"

    For detailed usage examples, see: specs/002-ai-chatbot-agent/quickstart.md
    """,
    responses={
        200: {
            "description": "Successful response from chatbot",
            "content": {
                "application/json": {
                    "examples": {
                        "task_created": {
                            "summary": "Task created successfully",
                            "value": {
                                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                                "message": "I've created a task 'Buy groceries' with due date tomorrow (2026-01-18).",
                                "created_at": "2026-01-17T10:30:00Z"
                            }
                        },
                        "tasks_listed": {
                            "summary": "Tasks listed",
                            "value": {
                                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                                "message": "You have 3 pending tasks:\n1. Buy groceries (due tomorrow)\n2. Finish report (due Friday)\n3. Call dentist (no due date)",
                                "created_at": "2026-01-17T10:31:00Z"
                            }
                        },
                        "confirmation_request": {
                            "summary": "Confirmation requested for destructive operation",
                            "value": {
                                "conversation_id": "550e8400-e29b-41d4-a716-446655440000",
                                "message": "Are you sure you want to delete all completed tasks? This will permanently remove 5 tasks. Please confirm.",
                                "created_at": "2026-01-17T10:32:00Z"
                            }
                        }
                    }
                }
            }
        },
        400: {
            "description": "Bad request (invalid input)",
            "content": {
                "application/json": {
                    "examples": {
                        "empty_message": {
                            "summary": "Message cannot be empty",
                            "value": {"detail": "Message text cannot be empty"}
                        },
                        "message_too_long": {
                            "summary": "Message exceeds maximum length",
                            "value": {"detail": "Message text must not exceed 2000 characters"}
                        },
                        "invalid_conversation_id": {
                            "summary": "Invalid conversation ID format",
                            "value": {"detail": "Invalid conversation_id format (must be UUID)"}
                        },
                        "invalid_user_id": {
                            "summary": "Invalid user ID format",
                            "value": {"detail": "Invalid user_id format (must be UUID)"}
                        }
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized (invalid or missing JWT token)",
            "content": {
                "application/json": {
                    "examples": {
                        "missing_token": {
                            "summary": "Missing JWT token",
                            "value": {"detail": "Missing authorization token"}
                        },
                        "invalid_token": {
                            "summary": "Invalid or expired JWT token",
                            "value": {"detail": "Invalid or expired JWT token"}
                        },
                        "user_id_mismatch": {
                            "summary": "User ID mismatch",
                            "value": {"detail": "User ID in URL does not match authenticated user"}
                        }
                    }
                }
            }
        },
        404: {
            "description": "Conversation not found or does not belong to user",
            "content": {
                "application/json": {
                    "example": {"detail": "Conversation not found or does not belong to user"}
                }
            }
        },
        429: {
            "description": "Rate limit exceeded (60 requests per minute)",
            "content": {
                "application/json": {
                    "example": {"detail": "Rate limit exceeded. Please try again in 60 seconds."}
                }
            },
            "headers": {
                "Retry-After": {
                    "description": "Number of seconds to wait before retrying",
                    "schema": {"type": "integer", "example": 60}
                }
            }
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "examples": {
                        "mcp_server_error": {
                            "summary": "MCP server unavailable",
                            "value": {"detail": "Task management service is temporarily unavailable"}
                        },
                        "database_error": {
                            "summary": "Database error",
                            "value": {"detail": "Service temporarily unavailable"}
                        },
                        "agent_error": {
                            "summary": "Agent error",
                            "value": {"detail": "An error occurred processing your request"}
                        }
                    }
                }
            }
        }
    },
    tags=["Chat"]
)
@limiter.limit("60/minute")  # T049: Rate limiting - 60 requests per minute
async def send_chat_message(
    user_id: str,
    request: Request,
    chat_request: ChatRequest,
    session: AsyncSession = Depends(get_session)
) -> ChatResponse:
    """
    Send a chat message to the AI assistant.

    This endpoint processes natural language requests for task management.
    The AI agent will:
    - Parse the user's intent
    - Invoke appropriate MCP tools (add_task, list_tasks, complete_task, update_task, delete_task)
    - Return a natural language response

    Args:
        user_id: User ID from URL path (must match authenticated user)
        request: FastAPI request object
        chat_request: Chat request with message and optional conversation_id
        session: Database session

    Returns:
        ChatResponse: Contains conversation_id, assistant message, and timestamp

    Raises:
        HTTPException: For various error conditions (401, 400, 404, 429, 500)
    """
    # T048: Request logging - start timer
    start_time = time.time()

    # T048: Log incoming request (no sensitive data)
    logger.info(
        f"Incoming chat request: user_id={user_id}, "
        f"message_length={len(chat_request.message)}, "
        f"conversation_id={chat_request.conversation_id}, "
        f"remote_addr={request.client.host if request.client else 'unknown'}"
    )

    try:
        # T030: JWT verification - verify user_id matches authenticated user
        verify_user_id_match(request, user_id)

        # Extract JWT token for MCP tool authentication
        jwt_token = get_jwt_token(request)

        # Convert user_id string to UUID
        try:
            user_uuid = UUID(user_id)
        except ValueError:
            logger.warning(f"Invalid user_id format: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid user_id format (must be UUID)"
            )

        # T031: Error handling - validate conversation_id format if provided
        if chat_request.conversation_id:
            try:
                # Ensure it's a valid UUID
                UUID(str(chat_request.conversation_id))
            except ValueError:
                logger.warning(f"Invalid conversation_id format: {chat_request.conversation_id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid conversation_id format (must be UUID)"
                )

        # Process chat message through agent
        result = await process_chat_message(
            session=session,
            user_id=user_uuid,
            message=chat_request.message,
            jwt_token=jwt_token,
            conversation_id=chat_request.conversation_id
        )

        # T048: Calculate response time and log success
        response_time = time.time() - start_time
        logger.info(
            f"Chat request successful: user_id={user_id}, "
            f"conversation_id={result['conversation_id']}, "
            f"response_time={response_time:.3f}s, "
            f"response_length={len(result['message'])}"
        )

        # Return response
        return ChatResponse(
            conversation_id=result["conversation_id"],
            message=result["message"],
            created_at=result["created_at"]
        )

    # T031: Comprehensive error handling
    except HTTPException as e:
        # T048: Log HTTP exceptions with WARNING level
        response_time = time.time() - start_time
        logger.warning(
            f"Chat request failed: user_id={user_id}, "
            f"status_code={e.status_code}, "
            f"detail={e.detail}, "
            f"response_time={response_time:.3f}s"
        )
        # Re-raise HTTP exceptions (already have proper status codes)
        raise

    except ValueError as e:
        # T048: Log validation errors
        response_time = time.time() - start_time
        error_msg = str(e)
        logger.warning(
            f"Validation error: user_id={user_id}, "
            f"error={error_msg}, "
            f"response_time={response_time:.3f}s"
        )

        # Handle validation errors (conversation not found, etc.)
        if "not found" in error_msg.lower() or "does not belong" in error_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=error_msg
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=error_msg
            )

    except Exception as e:
        # T047, T051: Log full error details internally, return sanitized message to user
        response_time = time.time() - start_time
        error_type = type(e).__name__

        logger.error(
            f"Chat endpoint error: user_id={user_id}, "
            f"conversation_id={chat_request.conversation_id}, "
            f"error_type={error_type}, "
            f"error_message={str(e)}, "
            f"response_time={response_time:.3f}s"
        )
        logger.error(f"Stack trace:\n{traceback.format_exc()}")

        # T051: Sanitize error messages - never expose internal details
        error_detail = "An error occurred processing your request"

        # Provide slightly more specific messages for known error types (still sanitized)
        error_str = str(e).lower()
        if "mcp" in error_str or "tool" in error_str or "server" in error_str:
            error_detail = "Task management service is temporarily unavailable"
        elif "database" in error_str or "connection" in error_str or "pool" in error_str:
            error_detail = "Service temporarily unavailable"
        elif "timeout" in error_str:
            error_detail = "Request timed out. Please try again."
        elif "openrouter" in error_str or "api" in error_str:
            error_detail = "AI service is temporarily unavailable"

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=error_detail
        )


@router.post(
    "/{user_id}/chat/session",
    response_model=ChatSessionResponse,
    status_code=status.HTTP_200_OK,
    summary="Create ChatKit session",
    description="""
    Create a new ChatKit session for real-time chat interaction.

    **Authentication:**
    - Requires valid JWT token in Authorization header (Bearer token)
    - User ID in URL must match authenticated user from JWT

    **Returns:**
    - client_secret: OpenAI client secret for ChatKit integration

    **Usage:**
    Use the returned client_secret to initialize ChatKit on the frontend.
    """,
    responses={
        200: {
            "description": "Session created successfully",
            "content": {
                "application/json": {
                    "example": {
                        "client_secret": "sess_abc123xyz..."
                    }
                }
            }
        },
        401: {
            "description": "Unauthorized (invalid or missing JWT token)",
            "content": {
                "application/json": {
                    "examples": {
                        "missing_token": {
                            "summary": "Missing JWT token",
                            "value": {"detail": "Missing authorization token"}
                        },
                        "user_id_mismatch": {
                            "summary": "User ID mismatch",
                            "value": {"detail": "User ID in URL does not match authenticated user"}
                        }
                    }
                }
            }
        },
        500: {
            "description": "Internal server error",
            "content": {
                "application/json": {
                    "example": {"detail": "Failed to create chat session"}
                }
            }
        }
    },
    tags=["Chat"]
)
@limiter.limit("60/minute")
async def create_chat_session(
    user_id: str,
    request: Request
) -> ChatSessionResponse:
    """
    Create a new ChatKit session.

    This endpoint creates an OpenAI Realtime session and returns a client_secret
    that can be used to initialize ChatKit on the frontend.

    Args:
        user_id: User ID from URL path (must match authenticated user)
        request: FastAPI request object

    Returns:
        ChatSessionResponse: Contains client_secret for ChatKit

    Raises:
        HTTPException: For various error conditions (401, 500)
    """
    start_time = time.time()

    logger.info(
        f"Creating chat session: user_id={user_id}, "
        f"remote_addr={request.client.host if request.client else 'unknown'}"
    )

    try:
        # Verify user_id matches authenticated user
        verify_user_id_match(request, user_id)

        # Get OpenAI API key from environment
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            logger.error("OPENAI_API_KEY not configured")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Chat service is not configured"
            )

        # Initialize OpenAI client
        client = OpenAI(api_key=openai_api_key)

        # Create a Realtime session
        session = client.realtime.sessions.create(
            model="gpt-4o-realtime-preview-2024-12-17",
            voice="alloy"
        )

        response_time = time.time() - start_time
        logger.info(
            f"Chat session created successfully: user_id={user_id}, "
            f"response_time={response_time:.3f}s"
        )

        return ChatSessionResponse(client_secret=session.client_secret.value)

    except HTTPException as e:
        response_time = time.time() - start_time
        logger.warning(
            f"Chat session creation failed: user_id={user_id}, "
            f"status_code={e.status_code}, "
            f"detail={e.detail}, "
            f"response_time={response_time:.3f}s"
        )
        raise

    except Exception as e:
        response_time = time.time() - start_time
        error_type = type(e).__name__

        logger.error(
            f"Chat session creation error: user_id={user_id}, "
            f"error_type={error_type}, "
            f"error_message={str(e)}, "
            f"response_time={response_time:.3f}s"
        )
        logger.error(f"Stack trace:\n{traceback.format_exc()}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create chat session"
        )


@router.post(
    "/chatkit",
    summary="ChatKit endpoint for React frontend",
    description="""
    ChatKit protocol endpoint that handles chat interactions from ChatKit React frontend.

    **Authentication:**
    - Requires valid JWT token in Authorization header (Bearer token)
    - Extracts user_id from JWT token

    **Returns:**
    - Streaming response with ChatKit protocol events
    - Or JSON response for non-streaming requests

    **Usage:**
    This endpoint is used by the ChatKit React component via useChatKit hook.
    """,
    tags=["Chat"]
)
async def chatkit_endpoint(
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    """
    ChatKit protocol endpoint.

    Processes ChatKit requests from the React frontend and returns
    streaming responses using the ChatKit protocol.

    Args:
        request: FastAPI request object
        session: Database session

    Returns:
        StreamingResponse or JSON Response
    """
    start_time = time.time()

    try:
        # Extract JWT token and verify authentication
        jwt_token = get_jwt_token(request)

        # Get authenticated user_id from request state (set by JWT middleware)
        user_id = getattr(request.state, "user_id", None)

        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not authenticated"
            )

        logger.info(f"ChatKit request from user: {user_id}")

        # Create request context with user info and session
        context = RequestContext(
            user_id=str(user_id),
            jwt_token=jwt_token,
            session=session
        )

        # Process request through ChatKit server
        result = await chatkit_server.process(await request.body(), context)

        response_time = time.time() - start_time
        logger.info(f"ChatKit request processed: user_id={user_id}, response_time={response_time:.3f}s")

        # Return appropriate response type
        if isinstance(result, StreamingResult):
            return StreamingResult(result)

        return Response(content=result.json)

    except HTTPException as e:
        response_time = time.time() - start_time
        logger.warning(
            f"ChatKit request failed: status_code={e.status_code}, "
            f"detail={e.detail}, response_time={response_time:.3f}s"
        )
        raise

    except Exception as e:
        response_time = time.time() - start_time
        logger.error(
            f"ChatKit endpoint error: error_type={type(e).__name__}, "
            f"error_message={str(e)}, response_time={response_time:.3f}s"
        )
        logger.error(f"Stack trace:\n{traceback.format_exc()}")

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred processing your chat request"
        )
