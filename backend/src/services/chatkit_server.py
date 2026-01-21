"""
ChatKit Server Integration

Wraps the existing chat service to work with ChatKit React frontend.
"""

import logging
from datetime import datetime
from typing import AsyncIterator, Optional, List
from uuid import UUID, uuid4

from chatkit.server import ChatKitServer
from chatkit.store import Store, Page
from chatkit.types import (
    AssistantMessageContent,
    AssistantMessageItem,
    ThreadItemDoneEvent,
    ThreadMetadata,
    ThreadStreamEvent,
    UserMessageItem,
    ThreadItem,
    Thread,
)

from src.services.chat_service import process_chat_message

logger = logging.getLogger(__name__)


class RequestContext:
    """Context for each ChatKit request containing user info and session."""

    def __init__(self, user_id: str, jwt_token: str, session):
        self.user_id = user_id
        self.jwt_token = jwt_token
        self.session = session


class SimpleChatKitStore(Store[RequestContext]):
    """
    Minimal ChatKit Store implementation.

    This store doesn't persist data since our existing chat service
    handles all persistence. It just provides the required interface.
    """

    def generate_item_id(
        self,
        item_type: str,
        thread: ThreadMetadata,
        context: RequestContext
    ) -> str:
        """Generate unique ID for items."""
        return str(uuid4())

    def generate_thread_id(self, context: RequestContext) -> str:
        """Generate unique thread ID."""
        return str(uuid4())

    async def load_thread(
        self,
        thread_id: str,
        context: RequestContext
    ) -> Optional[Thread]:
        """Load thread metadata (not implemented - using existing chat service)."""
        return None

    async def save_thread(
        self,
        thread: Thread,
        context: RequestContext
    ) -> None:
        """Save thread metadata (not implemented - using existing chat service)."""
        pass

    async def delete_thread(
        self,
        thread_id: str,
        context: RequestContext
    ) -> None:
        """Delete thread (not implemented - using existing chat service)."""
        pass

    async def load_threads(
        self,
        context: RequestContext,
        limit: int = 20,
        after: Optional[str] = None
    ) -> Page[Thread]:
        """Load threads list (not implemented - using existing chat service)."""
        return Page(items=[], next_cursor=None)

    async def load_item(
        self,
        item_id: str,
        context: RequestContext
    ) -> Optional[ThreadItem]:
        """Load a specific item (not implemented - using existing chat service)."""
        return None

    async def save_item(
        self,
        item: ThreadItem,
        context: RequestContext
    ) -> None:
        """Save an item (not implemented - using existing chat service)."""
        pass

    async def load_thread_items(
        self,
        thread_id: str,
        context: RequestContext,
        limit: int = 50,
        after: Optional[str] = None
    ) -> Page[ThreadItem]:
        """Load thread items (not implemented - using existing chat service)."""
        return Page(items=[], next_cursor=None)

    async def add_thread_item(
        self,
        thread_id: str,
        item: ThreadItem,
        context: RequestContext
    ) -> None:
        """Add item to thread (not implemented - using existing chat service)."""
        pass

    async def delete_thread_item(
        self,
        thread_id: str,
        item_id: str,
        context: RequestContext
    ) -> None:
        """Delete thread item (not implemented - using existing chat service)."""
        pass

    async def save_attachment(
        self,
        attachment_id: str,
        data: bytes,
        context: RequestContext
    ) -> None:
        """Save attachment (not implemented)."""
        pass

    async def load_attachment(
        self,
        attachment_id: str,
        context: RequestContext
    ) -> Optional[bytes]:
        """Load attachment (not implemented)."""
        return None

    async def delete_attachment(
        self,
        attachment_id: str,
        context: RequestContext
    ) -> None:
        """Delete attachment (not implemented)."""
        pass


class TodoChatKitServer(ChatKitServer[RequestContext]):
    """ChatKit server that integrates with existing chat service."""

    async def respond(
        self,
        thread: ThreadMetadata,
        input_user_message: UserMessageItem | None,
        context: RequestContext,
    ) -> AsyncIterator[ThreadStreamEvent]:
        """
        Process user message and generate assistant response.

        This method bridges ChatKit frontend with our existing chat service.
        """
        try:
            if not input_user_message:
                logger.warning("No input message provided")
                yield ThreadItemDoneEvent(
                    item=AssistantMessageItem(
                        id=self.store.generate_item_id("message", thread, context),
                        thread_id=thread.id,
                        created_at=datetime.now(),
                        content=[AssistantMessageContent(
                            text="I didn't receive a message. Please try again."
                        )],
                    ),
                )
                return

            # Extract message text from ChatKit format
            message_text = ""
            for content in input_user_message.content:
                if hasattr(content, 'text'):
                    message_text += content.text

            if not message_text.strip():
                logger.warning("Empty message received")
                yield ThreadItemDoneEvent(
                    item=AssistantMessageItem(
                        id=self.store.generate_item_id("message", thread, context),
                        thread_id=thread.id,
                        created_at=datetime.now(),
                        content=[AssistantMessageContent(
                            text="Please send a message."
                        )],
                    ),
                )
                return

            logger.info(f"Processing message for user {context.user_id}: {message_text[:50]}...")

            # Convert thread.id to conversation_id (UUID or None)
            conversation_id = None
            if thread.id and thread.id != "new":
                try:
                    conversation_id = UUID(thread.id)
                except ValueError:
                    logger.warning(f"Invalid thread ID format: {thread.id}")

            # Call existing chat service
            result = await process_chat_message(
                session=context.session,
                user_id=UUID(context.user_id),
                message=message_text,
                jwt_token=context.jwt_token,
                conversation_id=conversation_id
            )

            # Generate message ID
            msg_id = self.store.generate_item_id("message", thread, context)

            # Return assistant response in ChatKit format
            yield ThreadItemDoneEvent(
                item=AssistantMessageItem(
                    id=msg_id,
                    thread_id=str(result["conversation_id"]),
                    created_at=result["created_at"],
                    content=[AssistantMessageContent(text=result["message"])],
                ),
            )

            logger.info(f"Successfully processed message for user {context.user_id}")

        except Exception as e:
            logger.error(f"Error in ChatKit respond: {str(e)}", exc_info=True)

            # Return error message to user
            yield ThreadItemDoneEvent(
                item=AssistantMessageItem(
                    id=self.store.generate_item_id("message", thread, context),
                    thread_id=thread.id,
                    created_at=datetime.now(),
                    content=[AssistantMessageContent(
                        text=f"I encountered an error processing your request. Please try again."
                    )],
                ),
            )


# Create global server instance
chatkit_store = SimpleChatKitStore()
chatkit_server = TodoChatKitServer(store=chatkit_store)
