"""
Chat Service

Database operations for conversation and message management.
Provides CRUD functions for chat functionality.
"""

import logging
import os
import time
import traceback
from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from ..models.conversation import Conversation
from ..models.message import Message, MessageRole
import re

# ========================
# Logging Configuration
# ========================

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Console handler (always safe)
console_handler = logging.StreamHandler()
console_handler.setLevel(logging.INFO)
formatter = logging.Formatter(
    "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)
console_handler.setFormatter(formatter)

# Add console handler if no handlers exist yet (prevent duplicates)
if not logger.handlers:
    logger.addHandler(console_handler)

# Optional file logging (try/catch to avoid deployment crash)
try:
    BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
    LOG_DIR = os.path.join(BASE_DIR, "logs")
    os.makedirs(LOG_DIR, exist_ok=True)

    LOG_FILE_PATH = os.path.join(LOG_DIR, "chat_service.log")
    file_handler = logging.FileHandler(LOG_FILE_PATH, encoding="utf-8")
    file_handler.setLevel(logging.INFO)
    file_handler.setFormatter(formatter)

    logger.addHandler(file_handler)
except Exception as e:
    logger.warning(f"Could not create log file: {e}")

    

def generate_conversation_title(message: str) -> str:
    """
    Generate a conversation title from the first user message.

    Strategy (T039):
    - Extract first 50 chars from message
    - If message starts with common phrases, extract the task/action
    - Examples:
      - "Add a task to buy groceries" → "Buy groceries"
      - "Show me my tasks" → "Show me my tasks"
      - "Create a reminder for tomorrow" → "Reminder for tomorrow"

    Args:
        message: First user message in conversation

    Returns:
        str: Generated title (max 50 chars)
    """
    # Common action phrases to strip
    action_patterns = [
        r"^add a task to\s+",
        r"^create a task to\s+",
        r"^add a task for\s+",
        r"^create a task for\s+",
        r"^add task to\s+",
        r"^create task to\s+",
        r"^add\s+",
        r"^create\s+",
        r"^make a task to\s+",
        r"^make a task for\s+",
        r"^i need to\s+",
        r"^i want to\s+",
        r"^can you\s+",
        r"^please\s+",
    ]

    # Try to extract meaningful part after action phrase
    title = message
    for pattern in action_patterns:
        match = re.match(pattern, message, re.IGNORECASE)
        if match:
            # Extract the part after the action phrase
            title = message[match.end():].strip()
            # Capitalize first letter
            if title:
                title = title[0].upper() + title[1:]
            break

    # If no pattern matched or result is empty, use first 50 chars
    if not title or title == message:
        title = message[:50].strip()

    # Ensure title is not too long
    if len(title) > 50:
        title = title[:47] + "..."

    # If title is empty, use default
    if not title:
        title = "New conversation"

    return title


async def create_conversation(
    session: AsyncSession,
    user_id: UUID,
    title: Optional[str] = None
) -> Conversation:
    """
    Create a new conversation for a user.

    Args:
        session: Database session
        user_id: User UUID who owns the conversation
        title: Optional conversation title

    Returns:
        Conversation: Created conversation instance

    Raises:
        Exception: If database operation fails
    """
    conversation = Conversation(
        user_id=user_id,
        title=title
    )

    session.add(conversation)
    await session.commit()
    await session.refresh(conversation)

    return conversation


async def get_conversation(
    session: AsyncSession,
    conversation_id: UUID,
    user_id: UUID
) -> Optional[Conversation]:
    """
    Get conversation by ID with user isolation check.

    Args:
        session: Database session
        conversation_id: Conversation UUID
        user_id: User UUID for isolation check

    Returns:
        Optional[Conversation]: Conversation if found and belongs to user, None otherwise

    Note:
        This function enforces user isolation - users can only access their own conversations
    """
    statement = select(Conversation).where(
        Conversation.id == conversation_id,
        Conversation.user_id == user_id
    )

    result = await session.execute(statement)
    return result.scalar_one_or_none()


async def create_message(
    session: AsyncSession,
    conversation_id: UUID,
    role: MessageRole,
    content: str,
    tool_calls: Optional[List[Dict[str, Any]]] = None
) -> Message:
    """
    Create a new message in a conversation.

    Args:
        session: Database session
        conversation_id: Conversation UUID
        role: Message role (user, assistant, system)
        content: Message text content
        tool_calls: Optional list of tool call metadata

    Returns:
        Message: Created message instance

    Raises:
        Exception: If database operation fails

    Note:
        This function also updates the conversation's updated_at timestamp
    """
    # Create message
    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=content,
        tool_calls=tool_calls
    )
    session.add(message)

    # Update conversation updated_at timestamp
    statement = select(Conversation).where(Conversation.id == conversation_id)
    result = await session.execute(statement)
    conversation = result.scalar_one()
    conversation.updated_at = datetime.utcnow()

    await session.commit()
    await session.refresh(message)

    return message


async def get_conversation_messages(
    session: AsyncSession,
    conversation_id: UUID,
    user_id: UUID,
    limit: Optional[int] = None
) -> List[Message]:
    """
    Get all messages in a conversation, ordered by creation time.

    Args:
        session: Database session
        conversation_id: Conversation UUID
        user_id: User UUID for isolation check
        limit: Optional limit on number of messages to retrieve

    Returns:
        List[Message]: List of messages ordered by created_at (ascending)

    Note:
        This function enforces user isolation - first verifies conversation belongs to user
    """
    # First verify conversation belongs to user
    conversation = await get_conversation(session, conversation_id, user_id)
    if not conversation:
        return []

    # Fetch messages
    statement = select(Message).where(
        Message.conversation_id == conversation_id
    ).order_by(Message.created_at.asc())

    if limit:
        statement = statement.limit(limit)

    result = await session.execute(statement)
    return list(result.scalars().all())


async def list_user_conversations(
    session: AsyncSession,
    user_id: UUID,
    limit: int = 50,
    offset: int = 0
) -> List[Conversation]:
    """
    List all conversations for a user, ordered by most recent.

    Args:
        session: Database session
        user_id: User UUID
        limit: Maximum number of conversations to return (default: 50)
        offset: Number of conversations to skip (default: 0)

    Returns:
        List[Conversation]: List of conversations ordered by updated_at (descending)

    Note:
        This function is not required for Phase 2 but included for completeness
    """
    statement = select(Conversation).where(
        Conversation.user_id == user_id
    ).order_by(
        Conversation.updated_at.desc()
    ).limit(limit).offset(offset)

    result = await session.execute(statement)
    return list(result.scalars().all())


async def delete_conversation(
    session: AsyncSession,
    conversation_id: UUID,
    user_id: UUID
) -> bool:
    """
    Delete a conversation and all its messages (cascade).

    Args:
        session: Database session
        conversation_id: Conversation UUID
        user_id: User UUID for isolation check

    Returns:
        bool: True if conversation was deleted, False if not found

    Note:
        This function is not required for Phase 2 but included for completeness.
        Messages are automatically deleted due to cascade relationship.
    """
    conversation = await get_conversation(session, conversation_id, user_id)
    if not conversation:
        return False

    await session.delete(conversation)
    await session.commit()
    return True


async def process_chat_message(
    session: AsyncSession,
    user_id: UUID,
    message: str,
    jwt_token: str,
    conversation_id: Optional[UUID] = None
) -> Dict[str, Any]:
    """
    Process a chat message through the AI agent.

    Stateless flow with history management:
    1. Get or create conversation
    2. Fetch conversation history if conversation_id provided
    3. Count tokens and trigger summarization if >600 tokens
    4. Store user message
    5. Create and run agent with history context
    6. Store assistant response
    7. Return result

    Args:
        session: Database session
        user_id: User UUID
        message: User message text
        jwt_token: JWT token for MCP tool authentication
        conversation_id: Optional conversation ID to continue existing conversation

    Returns:
        dict: Contains conversation_id, message (assistant response), created_at

    Raises:
        ValueError: If conversation not found or doesn't belong to user
        Exception: If agent execution or database operation fails
    """
    # T052: Performance monitoring - start timer
    start_time = time.time()

    # T047: Log request with context (no sensitive data)
    logger.info(
        f"Processing chat message: user_id={user_id}, "
        f"message_length={len(message)}, "
        f"conversation_id={conversation_id}, "
        f"is_new_conversation={conversation_id is None}"
    )

    try:
        from ..agents.task_agent import create_task_agent, run_agent
        from ..agents.history_manager import (
            fetch_conversation_history,
            count_tokens,
            summarize_history,
            TOKEN_THRESHOLD
        )

        # Step 1: Get or create conversation
        is_new_conversation = False
        db_start = time.time()
        if conversation_id:
            conversation = await get_conversation(session, conversation_id, user_id)
            if not conversation:
                logger.warning(
                    f"Conversation not found: conversation_id={conversation_id}, "
                    f"user_id={user_id}"
                )
                raise ValueError("Conversation not found or does not belong to user")
        else:
            # Create conversation without title initially
            conversation = await create_conversation(session, user_id)
            is_new_conversation = True
            logger.info(f"Created new conversation: conversation_id={conversation.id}")

        # Store conversation_id and title to avoid lazy-loading issues after sync operations
        current_conversation_id = conversation.id
        current_conversation_title = conversation.title

        db_time = time.time() - db_start
        logger.info(f"Database query time: {db_time:.3f}s")

        # Step 2: Fetch conversation history if conversation_id provided (T036)
        history = []
        token_count = 0
        if conversation_id:
            history = await fetch_conversation_history(
                session=session,
                conversation_id=conversation_id,
                user_id=user_id
            )
            logger.info(f"Fetched conversation history: {len(history)} messages")

        # Step 3: Count tokens and trigger summarization if >600 tokens (T037)
        if history:
            token_count = count_tokens(history)
            logger.info(f"Conversation history token count: {token_count}")
            if token_count > TOKEN_THRESHOLD:
                logger.info(
                    f"Token threshold exceeded ({token_count} > {TOKEN_THRESHOLD}), "
                    f"triggering summarization"
                )
                history = await summarize_history(history)
                new_token_count = count_tokens(history)
                logger.info(
                    f"History summarized: {token_count} tokens -> {new_token_count} tokens"
                )
                token_count = new_token_count

        # Step 4: Store user message
        user_message = await create_message(
            session=session,
            conversation_id=current_conversation_id,
            role=MessageRole.USER,
            content=message,
            tool_calls=None
        )

        # Step 5: Create agent with JWT token
        agent = create_task_agent(jwt_token=jwt_token)

        # Step 6: Run agent with user message and history context
        # T052: Track agent response time
        agent_start = time.time()
        assistant_response = await run_agent(agent=agent, message=message, history=history)
        agent_time = time.time() - agent_start

        # Count tool calls from response (approximate - would need agent instrumentation for exact count)
        tool_call_count = assistant_response.count("tool_call") if "tool_call" in assistant_response else 0

        logger.info(
            f"Agent execution completed: response_time={agent_time:.3f}s, "
            f"response_length={len(assistant_response)}"
        )

        # Step 7: Store assistant response
        assistant_message = await create_message(
            session=session,
            conversation_id=current_conversation_id,
            role=MessageRole.ASSISTANT,
            content=assistant_response,
            tool_calls=None
        )

        # Store created_at to avoid lazy-loading issues
        message_created_at = assistant_message.created_at

        # Step 8: Generate title for new conversations (T039)
        if is_new_conversation and not current_conversation_title:
            # Generate title from first user message
            title = generate_conversation_title(message)
            # Refresh conversation object to ensure it's in the session
            await session.refresh(conversation)
            conversation.title = title
            await session.commit()
            await session.refresh(conversation)
            logger.info(f"Generated conversation title: '{title}'")

        # T052: Calculate total response time and log metrics
        total_time = time.time() - start_time
        logger.info(
            f"Chat processed successfully: "
            f"response_time={total_time:.3f}s, "
            f"agent_time={agent_time:.3f}s, "
            f"db_time={db_time:.3f}s, "
            f"tokens={token_count}, "
            f"conversation_id={current_conversation_id}"
        )

        # Step 9: Return result
        return {
            "conversation_id": current_conversation_id,
            "message": assistant_response,
            "created_at": message_created_at
        }

    except ValueError as e:
        # T047: Log validation errors with context
        logger.warning(
            f"Validation error in chat processing: user_id={user_id}, "
            f"conversation_id={conversation_id}, error={str(e)}"
        )
        raise

    except Exception as e:
        # T047: Log all errors with full context and stack trace
        error_type = type(e).__name__
        logger.error(
            f"Error processing chat message: "
            f"user_id={user_id}, "
            f"conversation_id={conversation_id}, "
            f"message_length={len(message)}, "
            f"error_type={error_type}, "
            f"error_message={str(e)}"
        )
        logger.error(f"Stack trace:\n{traceback.format_exc()}")
        raise


# Export all functions
__all__ = [
    "create_conversation",
    "get_conversation",
    "create_message",
    "get_conversation_messages",
    "list_user_conversations",
    "delete_conversation",
    "process_chat_message"
]
