"""
MCP Todo AI Chatbot Server - Entry Point

This is the main entry point for the MCP server. It initializes the server
with stdio transport and runs it to handle tool calls from AI assistants.

Usage:
    python mcp_server_main.py

Configuration:
    - DATABASE_URL: PostgreSQL connection string (from .env)
    - BETTER_AUTH_SECRET: JWT secret key (from .env)
"""

import asyncio
import sys
from src.mcp_server.server import run_server


def main():
    """Main entry point for the MCP server."""
    try:
        asyncio.run(run_server())
    except KeyboardInterrupt:
        print("\nMCP server stopped by user", file=sys.stderr)
        sys.exit(0)
    except Exception as e:
        print(f"Fatal error: {e}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
