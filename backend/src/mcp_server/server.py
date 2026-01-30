"""
MCP Server Core Implementation

This module implements the core MCP server with database connection management.
It registers all tools and handles tool calls with proper authentication and error handling.
"""

import asyncio
import os
import re
from typing import Any, Dict, Optional

import mcp.server.stdio
import mcp.types as types
from mcp.server import Server, NotificationOptions
from mcp.server.models import InitializationOptions
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession

from src.mcp_server import schemas
from src.mcp_server.auth import handle_tool_error

from dotenv import load_dotenv

load_dotenv()

# Global database engine (initialized on server startup)
db_engine: Optional[AsyncEngine] = None


def initialize_database() -> AsyncEngine:
    """
    Initialize database engine with connection pooling.

    Returns:
        AsyncEngine instance configured for the application
    """
    # Load database URL from environment
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL environment variable is not set")

    # Ensure asyncpg scheme for async operations
    if database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    # Remove query parameters that might cause issues
    database_url = re.sub(r"\?.*$", "", database_url)

    # Create async engine with connection pooling
    engine: AsyncEngine = create_async_engine(
        database_url,
        echo=False,  # Set to True for SQL query logging
        pool_size=5,
        max_overflow=10,
        pool_timeout=30,
    )

    print("Database engine initialized", flush=True)
    return engine


# Create server instance
server = Server("todo-mcp-server")


@server.list_tools()
async def handle_list_tools() -> list[types.Tool]:
    """
    List all available tools.

    Returns:
        List of Tool objects with schemas
    """
    print("Listing MCP tools...")
    return [
        schemas.get_add_task_tool(),
        schemas.get_list_tasks_tool(),
        schemas.get_complete_task_tool(),
        schemas.get_delete_task_tool(),
        schemas.get_update_task_tool(),
    ]


@server.call_tool()
async def handle_call_tool(
    name: str,
    arguments: dict[str, Any]
) -> types.CallToolResult:
    """
    Handle tool execution requests.

    Routes tool calls to appropriate handlers and manages error handling.

    Args:
        name: Tool name
        arguments: Tool arguments

    Returns:
        CallToolResult with tool output or error
    """
    try:
        # Use global database engine
        global db_engine
        if db_engine is None:
            return types.CallToolResult(
                content=[types.TextContent(type="text", text="Database not initialized")],
                isError=True
            )

        # Route to appropriate tool handler
        if name == "add_task":
            from src.mcp_server.tools.add_task import handle_add_task
            return await handle_add_task(db_engine, arguments)

        elif name == "list_tasks":
            from src.mcp_server.tools.list_tasks import handle_list_tasks
            return await handle_list_tasks(db_engine, arguments)

        elif name == "complete_task":
            from src.mcp_server.tools.complete_task import handle_complete_task
            return await handle_complete_task(db_engine, arguments)

        elif name == "delete_task":
            from src.mcp_server.tools.delete_task import handle_delete_task
            return await handle_delete_task(db_engine, arguments)

        elif name == "update_task":
            from src.mcp_server.tools.update_task import handle_update_task
            return await handle_update_task(db_engine, arguments)

        else:
            return types.CallToolResult(
                content=[types.TextContent(type="text", text=f"Unknown tool: {name}")],
                isError=True
            )

    except Exception as e:
        return handle_tool_error(e)


async def run_server():
    """
    Run the MCP server with stdio transport.

    This function initializes the database engine, runs the server with stdio transport,
    and properly cleans up resources on shutdown.
    """
    global db_engine

    # Initialize database engine
    db_engine = initialize_database()

    try:
        # Run server with stdio transport
        async with mcp.server.stdio.stdio_server() as (read_stream, write_stream):
            await server.run(
                read_stream,
                write_stream,
                InitializationOptions(
                    server_name="todo-mcp-server",
                    server_version="1.0.0",
                    capabilities=server.get_capabilities(
                        notification_options=NotificationOptions(),
                        experimental_capabilities={},
                    ),
                ),
            )
    finally:
        # Cleanup: dispose database engine
        if db_engine is not None:
            await db_engine.dispose()
            print("Database engine disposed", flush=True)



if __name__ == "__main__":
    import asyncio
    print("Starting MCP server...")
    asyncio.run(run_server())
