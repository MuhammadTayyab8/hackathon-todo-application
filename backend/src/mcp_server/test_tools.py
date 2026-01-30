import asyncio
from mcp.types import CallToolResult
from src.mcp_server.server import handle_list_tools

async def test_list_tools():
    tools = await handle_list_tools()
    for t in tools:
        print(f"Tool: {t.name}, Description: {t.description}")

asyncio.run(test_list_tools())
