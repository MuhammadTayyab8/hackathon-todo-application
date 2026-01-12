---
name: mcp-sdk
description: Build Model Context Protocol (MCP) servers and clients using the Python SDK. Create tools, resources, and prompts to provide context for LLMs in a standardized way.
allowed-tools: Read, Bash(python:*), Grep
---

# Model Context Protocol (MCP) Python SDK Guide

## Overview
The Model Context Protocol (MCP) allows applications to provide context for LLMs in a standardized way, separating the concerns of providing context from the actual LLM interaction. The Python SDK implements the full MCP specification for building servers and clients.

## Core Concepts

### MCP Primitives
1. **Tools**: Executable functions that LLMs can call (e.g., fetch data, run calculations)
2. **Resources**: Data exposure endpoints (e.g., files, database records, API responses)
3. **Prompts**: Reusable prompt templates with arguments

### Transports
- **stdio**: Standard input/output (default, best for local processes)
- **SSE**: Server-Sent Events (for web applications)
- **Streamable HTTP**: HTTP-based streaming (accessible via HTTP endpoints)

## Instructions

### 1. Installation
```bash
pip install mcp
# or with uv
uv add mcp
```

### 2. Creating a Basic MCP Server (FastMCP)

FastMCP is the high-level interface for rapid server development:

```python
from mcp.server.fastmcp import FastMCP

# Initialize server
mcp = FastMCP("My Server")

# Define a tool
@mcp.tool()
def add(a: int, b: int) -> int:
    """Add two numbers"""
    return a + b

# Define a resource
@mcp.resource("greeting://{name}")
def get_greeting(name: str) -> str:
    """Get a personalized greeting"""
    return f"Hello, {name}!"

# Define a prompt
@mcp.prompt()
def greet_user(name: str, style: str = "friendly") -> str:
    """Generate a greeting prompt"""
    return f"Write a {style} greeting for someone named {name}."

# Run the server (defaults to stdio)
if __name__ == "__main__":
    mcp.run()
```

### 3. Server with Metadata and Icons

Add branding and visual customization:

```python
from mcp.server.fastmcp import FastMCP, Icon

mcp = FastMCP(
    "Weather Service",
    website_url="https://weather.example.com",
    icons=[
        Icon(
            src="https://weather.example.com/icon.png",
            mimeType="image/png"
        )
    ]
)

@mcp.tool()
def get_weather(city: str, unit: str = "celsius") -> str:
    """Get current weather for a city."""
    return f"Weather in {city}: 22°{unit[0].upper()}"
```

### 4. Tools with Side Effects

Tools can perform actions and have side effects:

```python
@mcp.tool()
def send_email(to: str, subject: str, body: str) -> str:
    """Send an email to a recipient."""
    # Actual email sending logic
    send_mail(to, subject, body)
    return f"Email sent to {to}"

@mcp.tool()
def create_file(path: str, content: str) -> str:
    """Create a file with content."""
    with open(path, 'w') as f:
        f.write(content)
    return f"File created at {path}"
```

### 5. Resources for Data Exposure

Resources expose data without side effects:

```python
@mcp.resource("config://settings")
def get_settings() -> str:
    """Expose application settings."""
    return '{"theme": "dark", "language": "en"}'

@mcp.resource("file://{path}")
def read_file(path: str) -> str:
    """Read file contents."""
    with open(path, 'r') as f:
        return f.read()

@mcp.resource("db://users/{user_id}")
def get_user(user_id: int) -> str:
    """Get user data from database."""
    user = db.query(User).filter(User.id == user_id).first()
    return user.to_json()
```

### 6. Prompts with Templates

Create reusable prompt templates:

```python
@mcp.prompt()
def review_code(code: str, language: str = "python") -> str:
    """Generate a code review prompt."""
    return f"Please review this {language} code:\n\n{code}"

@mcp.prompt()
def summarize_text(text: str, max_words: int = 100) -> str:
    """Generate a text summarization prompt."""
    return f"Summarize the following text in {max_words} words or less:\n\n{text}"

@mcp.prompt()
def translate(text: str, target_lang: str) -> str:
    """Generate a translation prompt."""
    return f"Translate the following text to {target_lang}:\n\n{text}"
```

### 7. Rich Media Support

Return images and audio from tools:

```python
from mcp.types import Image, Audio

@mcp.tool()
def take_screenshot(window: str) -> Image:
    """Take a screenshot of a window."""
    image_data = capture_screenshot(window)
    return Image(
        data=image_data,
        mimeType="image/png"
    )

@mcp.tool()
def generate_speech(text: str) -> Audio:
    """Generate speech from text."""
    audio_data = text_to_speech(text)
    return Audio(
        data=audio_data,
        mimeType="audio/wav"
    )
```

### 8. Running with Different Transports

#### Stdio (Default)
```python
if __name__ == "__main__":
    mcp.run()  # Uses stdio by default
```

#### Streamable HTTP
```python
if __name__ == "__main__":
    mcp.run(transport="streamable-http")
    # Server accessible at http://localhost:8000/mcp
```

#### SSE (Server-Sent Events)
```python
if __name__ == "__main__":
    mcp.run(transport="sse")
```

### 9. Creating an MCP Client

Connect to MCP servers from your application:

```python
import asyncio
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client
from pydantic import AnyUrl
from mcp import types

# Configure server connection
server_params = StdioServerParameters(
    command="uv",
    args=["run", "server.py"],
    env={"API_KEY": "your-key-here"}
)

async def run_client():
    # Connect using stdio transport
    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            # Initialize connection
            await session.initialize()

            # List available resources
            resources = await session.list_resources()
            print(f"Resources: {[r.uri for r in resources.resources]}")

            # Read a resource
            content = await session.read_resource(AnyUrl("config://settings"))
            text_content = content.contents[0]
            if isinstance(text_content, types.TextContent):
                print(f"Config: {text_content.text}")

            # List available tools
            tools = await session.list_tools()
            print(f"Tools: {[t.name for t in tools.tools]}")

            # Call a tool
            result = await session.call_tool("get_weather", {"city": "London"})

            # Access content
            for content in result.content:
                if isinstance(content, types.TextContent):
                    print(f"Result: {content.text}")

            # Access structured content (2025-06-18 spec)
            if result.structuredContent:
                print(f"Structured: {result.structuredContent}")

            # List and get prompts
            prompts = await session.list_prompts()
            if prompts.prompts:
                prompt = await session.get_prompt(
                    "review_code",
                    arguments={"code": "def hello(): pass"}
                )
                print(f"Prompt: {prompt.messages[0].content}")

if __name__ == "__main__":
    asyncio.run(run_client())
```

### 10. Integration with FastAPI

Expose MCP server via FastAPI:

```python
from fastapi import FastAPI
from mcp.server.fastmcp import FastMCP

app = FastAPI()
mcp = FastMCP("API Server")

@mcp.tool()
def process_data(data: str) -> str:
    """Process incoming data."""
    return f"Processed: {data}"

# Mount MCP server on FastAPI
@app.get("/mcp")
async def mcp_endpoint():
    # MCP server integration logic
    pass

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Best Practices

### 1. Tool Design
- **Clear names**: Use descriptive function names that indicate what the tool does
- **Good docstrings**: The docstring becomes the tool description for the LLM
- **Type hints**: Always use type hints for automatic schema generation
- **Error handling**: Wrap tool logic in try-except blocks

```python
@mcp.tool()
def fetch_user_data(user_id: int) -> dict:
    """
    Fetch user data from the database.

    Args:
        user_id: The unique identifier for the user

    Returns:
        User data including name, email, and preferences
    """
    try:
        user = db.get_user(user_id)
        return user.to_dict()
    except UserNotFound:
        return {"error": "User not found"}
```

### 2. Resource URIs
- Use clear, hierarchical URI schemes
- Support parameterized URIs for dynamic resources
- Follow REST-like conventions

```python
# Good URI patterns
@mcp.resource("file://{path}")
@mcp.resource("db://users/{user_id}")
@mcp.resource("api://weather/{city}")
@mcp.resource("config://settings/{section}")
```

### 3. Prompt Templates
- Make prompts reusable with parameters
- Provide sensible defaults
- Include context in the prompt

```python
@mcp.prompt()
def analyze_code(
    code: str,
    language: str = "python",
    focus: str = "bugs"
) -> str:
    """
    Generate a code analysis prompt.

    Args:
        code: The code to analyze
        language: Programming language
        focus: What to focus on (bugs, performance, style)
    """
    return f"""Analyze this {language} code with focus on {focus}:

{code}

Provide specific recommendations for improvement."""
```

### 4. Transport Selection
- **stdio**: Best for local processes, CLI tools, and desktop apps
- **HTTP**: Best for web services and remote access
- **SSE**: Best for real-time updates and streaming

### 5. Security Considerations
- Validate all tool inputs
- Sanitize file paths and database queries
- Use environment variables for sensitive data
- Implement rate limiting for public servers

```python
import os
from pathlib import Path

@mcp.tool()
def read_safe_file(filename: str) -> str:
    """Read a file from the safe directory."""
    # Validate and sanitize path
    safe_dir = Path(os.getenv("SAFE_DIR", "/tmp"))
    file_path = (safe_dir / filename).resolve()

    # Ensure path is within safe directory
    if not str(file_path).startswith(str(safe_dir)):
        raise ValueError("Invalid file path")

    with open(file_path, 'r') as f:
        return f.read()
```

## Common Patterns

### Pattern 1: Database MCP Server
```python
from mcp.server.fastmcp import FastMCP
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

mcp = FastMCP("Database Server")
engine = create_engine(os.getenv("DATABASE_URL"))
Session = sessionmaker(bind=engine)

@mcp.tool()
def query_users(filter: str) -> list:
    """Query users from database."""
    session = Session()
    users = session.query(User).filter_by(**eval(filter)).all()
    return [u.to_dict() for u in users]

@mcp.resource("db://users/{user_id}")
def get_user_resource(user_id: int) -> str:
    """Get user as a resource."""
    session = Session()
    user = session.query(User).get(user_id)
    return user.to_json()
```

### Pattern 2: File System MCP Server
```python
from pathlib import Path

mcp = FastMCP("File System Server")
BASE_DIR = Path("/data")

@mcp.tool()
def list_files(directory: str = ".") -> list:
    """List files in a directory."""
    path = BASE_DIR / directory
    return [f.name for f in path.iterdir()]

@mcp.resource("file://{path}")
def read_file_resource(path: str) -> str:
    """Read file contents."""
    file_path = BASE_DIR / path
    return file_path.read_text()

@mcp.tool()
def write_file(path: str, content: str) -> str:
    """Write content to a file."""
    file_path = BASE_DIR / path
    file_path.write_text(content)
    return f"Written to {path}"
```

### Pattern 3: API Wrapper MCP Server
```python
import requests

mcp = FastMCP("API Wrapper")

@mcp.tool()
def fetch_weather(city: str) -> dict:
    """Fetch weather data from external API."""
    api_key = os.getenv("WEATHER_API_KEY")
    response = requests.get(
        f"https://api.weather.com/v1/current",
        params={"city": city, "key": api_key}
    )
    return response.json()

@mcp.tool()
def search_news(query: str, limit: int = 10) -> list:
    """Search news articles."""
    api_key = os.getenv("NEWS_API_KEY")
    response = requests.get(
        f"https://api.news.com/search",
        params={"q": query, "limit": limit, "key": api_key}
    )
    return response.json()["articles"]
```

### Pattern 4: Multi-Tool Workflow Server
```python
mcp = FastMCP("Workflow Server")

@mcp.tool()
def step1_fetch_data(source: str) -> dict:
    """Step 1: Fetch data from source."""
    return {"data": fetch_from_source(source)}

@mcp.tool()
def step2_process_data(data: dict) -> dict:
    """Step 2: Process the fetched data."""
    return {"processed": process(data)}

@mcp.tool()
def step3_save_results(data: dict, destination: str) -> str:
    """Step 3: Save processed results."""
    save_to_destination(data, destination)
    return f"Saved to {destination}"

@mcp.prompt()
def workflow_prompt(source: str, destination: str) -> str:
    """Generate a workflow execution prompt."""
    return f"""Execute the following workflow:
1. Fetch data from {source}
2. Process the data
3. Save results to {destination}"""
```

## Testing MCP Servers

```python
import pytest
from mcp.server.fastmcp import FastMCP

@pytest.fixture
def mcp_server():
    mcp = FastMCP("Test Server")

    @mcp.tool()
    def test_tool(value: int) -> int:
        return value * 2

    return mcp

def test_tool_execution(mcp_server):
    # Test tool logic
    result = mcp_server.tools["test_tool"](5)
    assert result == 10
```

## Debugging and Logging

```python
import logging

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

mcp = FastMCP("Debug Server")

@mcp.tool()
def debug_tool(input: str) -> str:
    """Tool with logging."""
    logger.debug(f"Received input: {input}")
    result = process(input)
    logger.info(f"Returning result: {result}")
    return result
```

## Resources
- GitHub: https://github.com/modelcontextprotocol/python-sdk
- Documentation: https://modelcontextprotocol.io
- Specification: https://github.com/modelcontextprotocol/specification
- Examples: https://github.com/modelcontextprotocol/python-sdk/tree/main/examples
