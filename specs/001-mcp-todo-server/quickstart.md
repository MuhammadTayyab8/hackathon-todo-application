# Quickstart Guide: MCP Todo AI Chatbot Server

**Feature**: 001-mcp-todo-server
**Date**: 2026-01-17
**Status**: Ready for Implementation

## Overview

This guide provides step-by-step instructions for setting up, running, and testing the MCP Todo AI Chatbot Server. The server exposes 5 stateless tools that allow AI assistants (like Claude Desktop) to manage user tasks through natural language interaction.

## Prerequisites

- Python 3.11 or higher
- Existing Todo application backend with database setup
- Valid Neon PostgreSQL database connection
- Better Auth JWT secret key
- Claude Desktop or another MCP-compatible client

## Installation

### 1. Install MCP Python SDK

```bash
cd backend
pip install mcp
```

Or add to `requirements.txt`:
```
mcp>=1.0.0
```

### 2. Verify Existing Dependencies

The MCP server reuses existing backend dependencies. Ensure these are installed:

```bash
pip install -r requirements.txt
```

Required packages:
- `sqlmodel>=0.0.14`
- `sqlalchemy[asyncio]>=2.0.0`
- `asyncpg>=0.29.0`
- `python-jose[cryptography]>=3.3.0`
- `python-dotenv`

### 3. Environment Configuration

Ensure your `.env` file contains:

```env
DATABASE_URL=postgresql+asyncpg://user:password@host/database
BETTER_AUTH_SECRET=your-secret-key-here
```

**Note**: The MCP server uses the same environment variables as the FastAPI backend.

## Project Structure

After implementation, your backend directory will look like:

```
backend/
├── src/
│   ├── models/
│   │   ├── task.py          # Existing (reused)
│   │   └── user.py          # Existing (reused)
│   ├── services/
│   │   └── auth_service.py  # Existing (reused)
│   ├── db.py                # Existing (reused)
│   └── mcp_server/          # NEW
│       ├── __init__.py
│       ├── server.py        # Main MCP server
│       ├── tools/
│       │   ├── __init__.py
│       │   ├── add_task.py
│       │   ├── list_tasks.py
│       │   ├── complete_task.py
│       │   ├── delete_task.py
│       │   └── update_task.py
│       ├── auth.py          # JWT authentication
│       └── schemas.py       # Tool schemas
│
├── mcp_server_main.py       # NEW: Entry point
└── requirements.txt         # Updated with mcp
```

## Running the MCP Server

### Development Mode

Run the MCP server directly:

```bash
cd backend
python mcp_server_main.py
```

The server will:
1. Load environment variables from `.env`
2. Initialize database connection
3. Register 5 MCP tools
4. Listen on stdio for MCP client connections

### Production Mode

For production deployment, use a process manager like `systemd` or `supervisor`:

```bash
# Example systemd service
[Unit]
Description=MCP Todo Server
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/backend
Environment="DATABASE_URL=postgresql+asyncpg://..."
Environment="BETTER_AUTH_SECRET=..."
ExecStart=/usr/bin/python3 mcp_server_main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

## Configuring Claude Desktop

### 1. Locate Claude Desktop Configuration

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`
**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
**Linux**: `~/.config/Claude/claude_desktop_config.json`

### 2. Add MCP Server Configuration

Edit `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "todo-server": {
      "command": "python",
      "args": ["D:/path/to/hackathon2-todo-app/backend/mcp_server_main.py"],
      "env": {
        "DATABASE_URL": "postgresql+asyncpg://user:password@host/database",
        "BETTER_AUTH_SECRET": "your-secret-key-here"
      }
    }
  }
}
```

**Important**: Use absolute paths for the Python script.

### 3. Restart Claude Desktop

Close and reopen Claude Desktop to load the new MCP server configuration.

### 4. Verify Connection

In Claude Desktop, you should see the MCP server listed in the available tools. Try asking:

> "What MCP tools are available?"

Claude should list the 5 todo management tools.

## Testing the MCP Server

### Manual Testing with Claude Desktop

#### Test 1: Create a Task

Ask Claude:
> "Add a task to buy groceries tomorrow at 3pm"

Expected response:
- Claude calls `add_task` tool
- Returns task_id, status "pending", and title
- Confirms task creation to you

#### Test 2: List Tasks

Ask Claude:
> "What tasks do I have pending?"

Expected response:
- Claude calls `list_tasks` with filter "pending"
- Returns array of your pending tasks
- Displays tasks in readable format

#### Test 3: Complete a Task

Ask Claude:
> "Mark the grocery shopping task as done"

Expected response:
- Claude identifies the task (may ask for clarification if multiple matches)
- Calls `complete_task` tool
- Confirms task completion

#### Test 4: Update a Task

Ask Claude:
> "Change the grocery task description to include apples"

Expected response:
- Claude calls `update_task` tool
- Updates description field
- Confirms update

#### Test 5: Delete a Task

Ask Claude:
> "Delete the old meeting notes task"

Expected response:
- Claude identifies the task
- Calls `delete_task` tool
- Confirms deletion

### Automated Testing

Run the test suite:

```bash
cd backend
pytest tests/mcp_server/ -v
```

Test categories:
- **Unit tests**: Test individual tool handlers
- **Integration tests**: Test full MCP server with test database
- **Authentication tests**: Verify JWT validation and user isolation
- **Performance tests**: Verify response times meet requirements

### Testing with MCP Inspector

Use the MCP Inspector tool for debugging:

```bash
npx @modelcontextprotocol/inspector python backend/mcp_server_main.py
```

This opens a web interface where you can:
- View registered tools
- Test tool calls manually
- Inspect request/response payloads
- Debug authentication issues

## Authentication Setup

### Getting a JWT Token

The MCP server requires a valid JWT token for authentication. To get a token:

1. **Sign in through the web app**:
   ```bash
   # Start the FastAPI backend
   cd backend
   uvicorn src.main:app --reload
   ```

2. **Use the `/api/auth/signin` endpoint**:
   ```bash
   curl -X POST http://localhost:8000/api/auth/signin \
     -H "Content-Type: application/json" \
     -d '{"email": "user@example.com", "password": "your-password"}'
   ```

3. **Extract the token** from the response:
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {...}
   }
   ```

### Passing JWT to MCP Tools

**Note**: The current implementation expects the JWT token to be passed in tool arguments. This is a temporary approach for Phase 3.

When calling MCP tools, include the `_jwt_token` parameter:

```python
# Example tool call (internal)
{
  "user_id": "12345678-1234-1234-1234-123456789012",
  "title": "Buy groceries",
  "_jwt_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Future Enhancement**: Implement MCP authentication middleware to automatically extract JWT from client metadata.

## Troubleshooting

### Issue: "Database connection failed"

**Cause**: Invalid `DATABASE_URL` or database not accessible

**Solution**:
1. Verify `DATABASE_URL` in `.env` file
2. Test database connection:
   ```bash
   python -c "from src.db import engine; import asyncio; asyncio.run(engine.connect())"
   ```
3. Check network connectivity to Neon database

### Issue: "Authentication required"

**Cause**: Missing or invalid JWT token

**Solution**:
1. Verify `BETTER_AUTH_SECRET` matches the one used by FastAPI backend
2. Generate a fresh JWT token through the web app
3. Check token expiration (tokens expire after 7 days)

### Issue: "Task not found"

**Cause**: Task doesn't exist or belongs to different user

**Solution**:
1. Verify task_id is correct
2. Check that you're authenticated as the correct user
3. Use `list_tasks` to see available tasks

### Issue: "MCP server not appearing in Claude Desktop"

**Cause**: Configuration error or server not starting

**Solution**:
1. Check `claude_desktop_config.json` syntax (valid JSON)
2. Verify absolute path to `mcp_server_main.py`
3. Check Claude Desktop logs:
   - Windows: `%APPDATA%\Claude\logs\`
   - macOS: `~/Library/Logs/Claude/`
4. Restart Claude Desktop after config changes

### Issue: "Slow response times"

**Cause**: Database query performance or connection pool issues

**Solution**:
1. Verify `user_id` index exists on tasks table
2. Check database connection pool settings
3. Monitor database query performance
4. Consider adding pagination for large task lists

## Performance Benchmarks

Expected performance (with proper indexing):

| Operation | Expected Time | Notes |
|-----------|---------------|-------|
| add_task | < 200ms | Single INSERT |
| list_tasks (100 tasks) | < 100ms | Indexed query |
| list_tasks (1000 tasks) | < 500ms | Indexed query |
| complete_task | < 200ms | Single UPDATE |
| delete_task | < 200ms | Single DELETE |
| update_task | < 200ms | Single UPDATE |

If performance is slower, check:
- Database indexing on `user_id` column
- Network latency to Neon database
- Connection pool configuration

## Security Considerations

### JWT Token Security

- **Never log JWT tokens** in production
- **Tokens expire after 7 days** - users must re-authenticate
- **Tokens are signed** with `BETTER_AUTH_SECRET` - keep this secret secure
- **User ID is extracted from token** - never trust client-supplied user_id

### User Isolation

- All database queries filter by `user_id` from JWT
- Users cannot access other users' tasks
- 404 errors returned for unauthorized access (not 403) to prevent information leakage

### Input Validation

- JSON Schema validation on all tool inputs
- SQL injection prevented by SQLModel parameterized queries
- Date validation ensures end_date >= start_date

## Next Steps

1. **Implement the MCP server** following the plan in `plan.md`
2. **Run tests** to verify functionality
3. **Configure Claude Desktop** with your MCP server
4. **Test with real users** and gather feedback
5. **Monitor performance** and optimize as needed

## Additional Resources

- [MCP Python SDK Documentation](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [Claude Desktop MCP Guide](https://docs.anthropic.com/claude/docs/mcp)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Better Auth Documentation](https://www.better-auth.com/)

## Support

For issues or questions:
1. Check this quickstart guide
2. Review the implementation plan (`plan.md`)
3. Check the specification (`spec.md`)
4. Review MCP SDK documentation
5. Check Claude Desktop logs for errors

---

**Last Updated**: 2026-01-17
**Version**: 1.0.0
**Status**: Ready for Implementation
