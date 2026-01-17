# Research Document: MCP Todo AI Chatbot Server

**Feature**: 001-mcp-todo-server
**Date**: 2026-01-17
**Status**: Completed

## Overview

This document captures research findings and technology decisions for implementing an MCP (Model Context Protocol) server that exposes task management tools to AI assistants. The research focused on MCP SDK architecture, database integration patterns, authentication strategies, and error handling approaches.

## Research Questions & Findings

### 1. MCP Python SDK Architecture

**Question**: Which MCP SDK API level should we use - low-level Server API or high-level FastMCP?

**Research Findings**:
- **Low-level Server API** (`mcp.server.lowlevel.Server`):
  - Provides explicit control over tool registration via decorators
  - Supports lifespan context manager for resource initialization/cleanup
  - Allows access to request context for per-request data
  - Requires manual setup of initialization options and capabilities
  - Best for complex integrations requiring database connections and authentication

- **High-level FastMCP API** (`mcp.server.fastmcp.FastMCP`):
  - Simplified API with automatic configuration
  - Designed for stateless tools without external dependencies
  - Limited documentation on database connection management
  - Better suited for simple use cases without authentication requirements

**Decision**: Use low-level `Server` API from `mcp.server.lowlevel`

**Rationale**:
1. Provides lifespan context manager for database engine initialization
2. Allows access to database sessions via `server.request_context.lifespan_context`
3. Explicit control over tool registration and error handling
4. Better suited for integration with existing SQLModel/SQLAlchemy infrastructure
5. Clear patterns for managing stateful resources (database connections) in stateless tools

**Code Example**:
```python
from mcp.server.lowlevel import Server
from contextlib import asynccontextmanager

@asynccontextmanager
async def server_lifespan(_server: Server):
    # Initialize database engine on startup
    db_engine = create_async_engine(DATABASE_URL)
    try:
        yield {"db_engine": db_engine}
    finally:
        # Cleanup on shutdown
        await db_engine.dispose()

server = Server("todo-mcp-server", lifespan=server_lifespan)
```

### 2. Database Connection Strategy

**Question**: How should we manage database connections across multiple tool calls?

**Research Findings**:
- **Option A**: Create new engine per tool call
  - Pros: Simple, isolated
  - Cons: High overhead, connection pool exhaustion, slow performance

- **Option B**: Global engine singleton
  - Pros: Reusable, fast
  - Cons: Difficult to test, cleanup issues, not idiomatic for MCP

- **Option C**: Lifespan context manager (recommended by MCP SDK)
  - Pros: Proper initialization/cleanup, accessible to all tools, testable
  - Cons: Requires understanding of MCP lifespan API

**Decision**: Use MCP server lifespan context manager

**Rationale**:
1. MCP SDK provides lifespan API specifically for this use case
2. Engine initialized once on server startup, disposed on shutdown
3. Tools access engine via `server.request_context.lifespan_context["db_engine"]`
4. Prevents connection leaks and pool exhaustion
5. Follows MCP best practices and patterns

**Implementation Pattern**:
```python
@server.call_tool()
async def handle_tool(name: str, arguments: dict):
    # Access database engine from lifespan context
    ctx = server.request_context
    db_engine = ctx.lifespan_context["db_engine"]

    # Create session for this tool call
    async with AsyncSession(db_engine) as session:
        # Perform database operations
        result = await session.exec(select(Task).where(...))
        return result
```

### 3. JWT Authentication Integration

**Question**: How should MCP tools authenticate users and extract user_id?

**Research Findings**:
- MCP protocol doesn't have built-in authentication
- MCP clients can pass metadata/headers with requests
- Need to integrate with existing Better Auth JWT system
- JWT contains `userId` in payload (from existing auth_service.py)

**Decision**: Extract JWT from MCP request metadata and validate using existing auth_service.py

**Rationale**:
1. Reuses existing JWT verification logic (SECRET_KEY, ALGORITHM)
2. Maintains consistency with FastAPI backend authentication
3. No duplication of authentication code
4. MCP clients (like Claude Desktop) can pass JWT in request metadata

**Implementation Approach**:
```python
from src.services.auth_service import SECRET_KEY, ALGORITHM
from jose import jwt, JWTError

async def verify_jwt_from_mcp_request(arguments: dict) -> str:
    """Extract and verify JWT, return user_id"""
    token = arguments.get("_jwt_token")  # Passed by MCP client
    if not token:
        raise AuthenticationError("JWT token required")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("userId")
        if not user_id:
            raise AuthenticationError("Invalid token payload")
        return user_id
    except JWTError:
        raise AuthenticationError("Invalid or expired token")
```

**Note**: MCP clients need to be configured to pass JWT token in tool arguments. This will be documented in quickstart.md.

### 4. Tool Input/Output Schema Design

**Question**: How should we define and validate tool schemas?

**Research Findings**:
- MCP SDK uses JSON Schema format (not Pydantic)
- SDK provides automatic validation against inputSchema
- outputSchema is optional but recommended for structured responses
- Validation errors are automatically handled by SDK

**Decision**: Define JSON Schema for each tool's input and output

**Rationale**:
1. MCP SDK expects JSON Schema format
2. Automatic validation reduces boilerplate code
3. Clear contracts for AI assistants
4. Type safety and documentation in one place

**Schema Example**:
```python
types.Tool(
    name="add_task",
    description="Create a new task",
    inputSchema={
        "type": "object",
        "properties": {
            "user_id": {"type": "string", "format": "uuid"},
            "title": {"type": "string", "minLength": 1},
            "description": {"type": "string"},
            "start_date": {"type": "string", "format": "date-time"},
            "end_date": {"type": "string", "format": "date-time"}
        },
        "required": ["user_id", "title"]
    },
    outputSchema={
        "type": "object",
        "properties": {
            "task_id": {"type": "string", "format": "uuid"},
            "status": {"type": "string", "enum": ["pending", "completed"]},
            "title": {"type": "string"}
        },
        "required": ["task_id", "status", "title"]
    }
)
```

### 5. Error Handling Strategy

**Question**: How should tools handle and report errors to AI assistants?

**Research Findings**:
- MCP SDK catches exceptions and returns generic errors
- `CallToolResult` supports `isError=True` flag for explicit errors
- Error messages should be descriptive for AI assistant interpretation
- Different error types: authentication, validation, not found, database

**Decision**: Use `CallToolResult` with `isError=True` and descriptive messages

**Rationale**:
1. Explicit error handling preserves error context
2. AI assistants can parse error messages and explain to users
3. Avoids generic "Internal Server Error" messages
4. Allows categorization of errors (auth, validation, not found, etc.)

**Error Handling Pattern**:
```python
from mcp.types import CallToolResult, TextContent

try:
    # Tool logic
    result = await perform_operation()
    return CallToolResult(
        content=[TextContent(type="text", text=str(result))],
        isError=False
    )
except TaskNotFoundError as e:
    return CallToolResult(
        content=[TextContent(type="text", text=f"Task not found: {e}")],
        isError=True
    )
except AuthenticationError as e:
    return CallToolResult(
        content=[TextContent(type="text", text=f"Authentication failed: {e}")],
        isError=True
    )
except Exception as e:
    return CallToolResult(
        content=[TextContent(type="text", text=f"Database error: {e}")],
        isError=True
    )
```

## Technology Stack Decisions

| Component | Selected Technology | Version | Justification |
|-----------|-------------------|---------|---------------|
| MCP SDK | `mcp` (Python) | Latest stable | Official Python implementation, well-documented |
| Server API | Low-level Server | N/A | Provides control needed for DB and auth integration |
| ORM | SQLModel | 0.0.14+ | Already used in project, reuse existing models |
| Database Driver | asyncpg | 0.29.0+ | Already used in project, async support |
| JWT Library | python-jose | 3.3.0+ | Already used in project, reuse auth logic |
| Testing | pytest + pytest-asyncio | 7.4+ / 0.21+ | Already used in project, async test support |
| Transport | stdio | Built-in | Standard MCP transport, works with Claude Desktop |

## Architectural Decisions

### 1. Stateless Tool Design

**Decision**: Each tool call is completely independent with no server-side session state.

**Implications**:
- User context (user_id) extracted from JWT on every call
- No caching of user data between calls
- Database session created and disposed per tool call
- Simplifies concurrency and scaling

### 2. User Isolation Enforcement

**Decision**: All database queries filtered by user_id extracted from JWT.

**Implementation**:
```python
# Every query includes user_id filter
statement = select(Task).where(
    Task.user_id == user_id,
    Task.id == task_id
)
```

**Security Benefit**: Prevents cross-user data access even if task_id is guessed.

### 3. Database Session Management

**Decision**: Use async context managers for database sessions.

**Pattern**:
```python
async with AsyncSession(db_engine) as session:
    # Perform operations
    await session.commit()
# Session automatically closed, even on errors
```

**Benefits**: Automatic cleanup, exception safety, connection pool management.

### 4. Concurrent Access Handling

**Decision**: Rely on SQLAlchemy connection pool and database ACID guarantees.

**Rationale**:
- Read operations (list_tasks) are naturally concurrent-safe
- Write operations (add, update, delete) use database transactions
- No application-level locking needed
- Connection pool handles concurrent requests

### 5. Date/Time Handling

**Decision**: Store and transmit all dates in ISO 8601 format (UTC timezone).

**Validation**:
- Parse dates using Python datetime.fromisoformat()
- Validate end_date >= start_date when both provided
- Store in database as timezone-aware datetime (UTC)

## Performance Considerations

### Database Query Optimization

1. **Indexing**: Ensure `user_id` column is indexed (already exists in schema)
2. **Query Filtering**: Apply filters in SQL, not in Python
3. **Connection Pooling**: Reuse engine across tool calls
4. **Async Operations**: Use async/await for non-blocking I/O

### Expected Performance

- **list_tasks**: < 500ms for 1000 tasks (with proper indexing)
- **add_task**: < 200ms (single INSERT)
- **update_task**: < 200ms (single UPDATE)
- **complete_task**: < 200ms (single UPDATE)
- **delete_task**: < 200ms (single DELETE)

## Security Considerations

### JWT Validation

- Verify signature using BETTER_AUTH_SECRET
- Check expiration timestamp
- Extract user_id from payload
- Reject requests without valid JWT

### User Isolation

- Never trust client-supplied user_id
- Always use user_id from JWT payload
- Filter all queries by authenticated user_id
- Return 404 (not 403) for unauthorized access to prevent information leakage

### SQL Injection Prevention

- Use SQLModel parameterized queries
- Never concatenate user input into SQL
- Validate input types against JSON Schema

### Error Message Security

- Don't leak database structure in errors
- Don't expose other users' task IDs
- Use generic messages for authentication failures

## Testing Strategy

### Unit Tests

- Test each tool handler in isolation
- Mock database sessions
- Test error handling paths
- Verify JWT validation logic

### Integration Tests

- Test full MCP server with test database
- Verify tool registration and discovery
- Test concurrent tool calls
- Verify user isolation

### Performance Tests

- Benchmark list_tasks with 1000 tasks
- Test 100 concurrent tool calls
- Verify connection pool doesn't exhaust

## Open Questions & Future Considerations

### Resolved Questions

1. ✅ How to pass JWT from MCP client? - Via tool arguments
2. ✅ How to manage database connections? - Lifespan context manager
3. ✅ Which MCP API level to use? - Low-level Server API
4. ✅ How to handle errors? - CallToolResult with isError flag

### Future Enhancements (Out of Scope)

1. **Pagination**: If task lists grow beyond 1000 items
2. **Caching**: If read performance becomes an issue
3. **Rate Limiting**: If abuse becomes a concern
4. **Audit Logging**: Track all tool calls for security/debugging
5. **Metrics**: Prometheus metrics for monitoring

## References

- [MCP Python SDK Documentation](https://github.com/modelcontextprotocol/python-sdk)
- [MCP Specification](https://github.com/modelcontextprotocol/specification)
- [SQLModel Documentation](https://sqlmodel.tiangolo.com/)
- [Better Auth JWT Documentation](https://www.better-auth.com/)

## Conclusion

Research phase is complete. All technical decisions have been made with clear rationale. The implementation approach leverages existing infrastructure (SQLModel, Better Auth) while following MCP best practices. The architecture supports the performance and security requirements defined in the specification.

**Next Phase**: Proceed to Phase 1 (Design & Contracts) to create data-model.md, contracts/, and quickstart.md.
