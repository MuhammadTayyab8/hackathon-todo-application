# import asyncio
# from src.mcp_server.server import handle_call_tool

# async def test_add_task():
#     args = {
#         "user_id": "5e9385a0-6dd3-4871-befd-3145969901c1",
#         "title": "Test Task",
#         "description": "This is a test task",
#         "start_date": "2026-01-30T10:00:00Z",
#         "end_date": "2026-02-01T10:00:00Z"
#     }

#     result = await handle_call_tool("add_task", args)
#     print(result)

# asyncio.run(test_add_task())



import asyncio
import src.mcp_server.server as server_module
from src.mcp_server.server import handle_call_tool, initialize_database

async def test_add_task():
    # Assign to the server module's global db_engine
    if server_module.db_engine is None:
        server_module.db_engine = initialize_database()

    args = {
        "_jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1ZTkzODVhMC02ZGQzLTQ4NzEtYmVmZC0zMTQ1OTY5OTAxYzEiLCJ1c2VySWQiOiI1ZTkzODVhMC02ZGQzLTQ4NzEtYmVmZC0zMTQ1OTY5OTAxYzEiLCJlbWFpbCI6InRheXlhYmNic3Bha2lzdGFuQGdtYWlsLmNvbSIsInVzZXJuYW1lIjoibXVoYW1tYWRfdGF5eWFiIiwiaWF0IjoxNzY5NzUzODQ4LCJleHAiOjE3NzAzNTg2NDh9.ciWOfyQ1YzzPvF6y2ddqvEelbUH_VbwHOH971FZnidk",
        "title": "Test Task",
        "description": "This is a test task",
        "start_date": "2026-01-30T10:00:00Z",
        "end_date": "2026-02-01T10:00:00Z"
    }

    result = await handle_call_tool("add_task", args)
    print(result)

asyncio.run(test_add_task())
