"""
History Manager

Manages conversation history including token counting, summarization, and retrieval.
Implements the 600 token threshold requirement for automatic summarization.
"""

import os
from typing import List, Dict
from uuid import UUID

import tiktoken
from openai import OpenAI
from sqlmodel.ext.asyncio.session import AsyncSession

from ..services.chat_service import get_conversation_messages


# OpenRouter Configuration
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
MODEL_NAME = "google/gemini-2.0-flash-exp:free"

# Token threshold for triggering summarization (MUST requirement from spec)
TOKEN_THRESHOLD = 600


def count_tokens(messages: List[Dict[str, str]]) -> int:
    """
    Count tokens in message history using tiktoken.

    Uses gpt-4 encoding as a close approximation for Gemini token counting.
    This is the industry standard approach for token estimation.

    Args:
        messages: List of message dictionaries with 'role' and 'content' keys

    Returns:
        int: Total token count across all messages

    Example:
        >>> messages = [
        ...     {"role": "user", "content": "Hello"},
        ...     {"role": "assistant", "content": "Hi there!"}
        ... ]
        >>> count_tokens(messages)
        8
    """
    try:
        # Use gpt-4 encoding (close enough for Gemini)
        encoding = tiktoken.encoding_for_model("gpt-4")

        total_tokens = 0
        for msg in messages:
            # Count tokens in message content
            content = msg.get("content", "")
            total_tokens += len(encoding.encode(content))

            # Add overhead for role and formatting (approximately 4 tokens per message)
            total_tokens += 4

        return total_tokens

    except Exception as e:
        # If token counting fails, return a conservative estimate
        # Average ~4 characters per token
        total_chars = sum(len(msg.get("content", "")) for msg in messages)
        return total_chars // 4


async def summarize_history(messages: List[Dict[str, str]]) -> List[Dict[str, str]]:
    """
    Summarize conversation history to reduce token count.

    Strategy (from research.md):
    - Keep last 3 messages as-is (most recent context)
    - Summarize older messages into single summary message
    - Target: Reduce to ~200 tokens
    - Use Gemini via OpenRouter for summarization

    Args:
        messages: List of message dictionaries with 'role' and 'content' keys

    Returns:
        List[Dict[str, str]]: Condensed message history with summary + last 3 messages

    Example:
        >>> messages = [msg1, msg2, msg3, msg4, msg5]  # 5 messages
        >>> summarized = await summarize_history(messages)
        >>> len(summarized)
        4  # [summary, msg3, msg4, msg5]
    """
    # If 3 or fewer messages, no summarization needed
    if len(messages) <= 3:
        return messages

    # Split: older messages to summarize, recent messages to keep
    older_messages = messages[:-3]
    recent_messages = messages[-3:]

    # Build summarization prompt
    history_text = "\n".join([
        f"{msg['role']}: {msg['content']}"
        for msg in older_messages
    ])

    prompt = f"""Summarize the following conversation history in 200 tokens or less, preserving key context about tasks and user intent:

{history_text}

Summary:"""

    try:
        # Get OpenRouter API key
        api_key = os.getenv("OPENROUTER_API_KEY")
        if not api_key:
            # If no API key, return original messages (fail gracefully)
            return messages

        # Call Gemini for summarization
        client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=api_key
        )

        response = client.chat.completions.create(
            model=MODEL_NAME,
            messages=[{"role": "user", "content": prompt}],
            max_tokens=250
        )

        summary = response.choices[0].message.content

        # Return: [summary_message, ...recent_messages]
        return [
            {"role": "system", "content": f"Previous conversation summary: {summary}"},
            *recent_messages
        ]

    except Exception as e:
        # If summarization fails, return original messages (fail gracefully)
        print(f"Summarization error: {e}")
        return messages


async def fetch_conversation_history(
    session: AsyncSession,
    conversation_id: UUID,
    user_id: UUID
) -> List[Dict[str, str]]:
    """
    Fetch conversation history from database and convert to message array format.

    Retrieves all messages for a conversation and converts them to the format
    expected by the agent: [{"role": "user", "content": "..."}, ...]

    Args:
        session: Database session
        conversation_id: Conversation UUID
        user_id: User UUID for isolation check

    Returns:
        List[Dict[str, str]]: Message array ordered by created_at (ascending)

    Example:
        >>> history = await fetch_conversation_history(session, conv_id, user_id)
        >>> history
        [
            {"role": "user", "content": "Add a task"},
            {"role": "assistant", "content": "Task created!"}
        ]
    """
    # Call get_conversation_messages from chat_service
    messages = await get_conversation_messages(
        session=session,
        conversation_id=conversation_id,
        user_id=user_id
    )

    # Convert Message objects to dict format
    message_array = []
    for msg in messages:
        message_array.append({
            "role": msg.role.value,  # Convert enum to string
            "content": msg.content
        })

    return message_array


# Export all functions
__all__ = [
    "count_tokens",
    "summarize_history",
    "fetch_conversation_history",
    "TOKEN_THRESHOLD"
]
