---
name: openai-agents
description: Build multi-agent AI workflows using OpenAI Agents SDK. Create agents with tools, handoffs, guardrails, and sessions for complex agentic applications.
allowed-tools: Read, Bash(python:*), Grep
---

# OpenAI Agents SDK Development Guide

## Overview
The OpenAI Agents SDK is a lightweight framework for building multi-agent workflows in Python. It provides primitives for creating intelligent agents with tools, delegation between agents (handoffs), input/output validation (guardrails), and automatic conversation history management (sessions).

## Instructions

### 1. Installation
```bash
pip install openai-agents
# or with uv
uv add openai-agents
```

### 2. Basic Agent Creation
Create an agent with instructions, model, and tools:
```python
from agents import Agent, function_tool

@function_tool
def get_weather(city: str) -> str:
    """Returns weather info for the specified city."""
    return f"The weather in {city} is sunny"

agent = Agent(
    name="Weather Assistant",
    instructions="Help users with weather information",
    model="gpt-4o",
    tools=[get_weather],
)
```

### 3. Running Agents
Use `run()` for single interactions or `run_stream()` for streaming:
```python
# Single run
result = agent.run("What's the weather in Paris?")
print(result.content)

# Streaming
for chunk in agent.run_stream("What's the weather in Paris?"):
    print(chunk.content, end="")
```

### 4. Function Tools
Turn any Python function into a tool with automatic schema generation:
```python
from agents import function_tool
from typing import List

@function_tool
def search_database(query: str, limit: int = 10) -> List[dict]:
    """Search the database for matching records."""
    # Your implementation
    return [{"id": 1, "name": "Result"}]

# Pydantic validation is automatic
agent = Agent(
    name="Database Agent",
    tools=[search_database],
    model="gpt-4o"
)
```

### 5. Handoffs (Agent Delegation)
Enable agents to delegate tasks to other specialized agents:
```python
from agents import Agent, handoff

# Create specialized agents
sales_agent = Agent(
    name="Sales Agent",
    instructions="Handle sales inquiries and quotes"
)

support_agent = Agent(
    name="Support Agent",
    instructions="Handle technical support questions"
)

# Main agent with handoffs
main_agent = Agent(
    name="Triage Agent",
    instructions="Route users to the right department",
    handoffs=[
        handoff(sales_agent, "Transfer to sales for pricing questions"),
        handoff(support_agent, "Transfer to support for technical issues")
    ]
)

# Agents automatically delegate when appropriate
result = main_agent.run("I need help with my account")
```

### 6. Sessions (Conversation History)
Automatically maintain conversation context across multiple turns:
```python
from agents import Agent, Session

agent = Agent(name="Assistant", model="gpt-4o")
session = Session(agent=agent)

# First message
response1 = session.run("My name is Alice")

# Context is preserved
response2 = session.run("What's my name?")  # Agent remembers "Alice"

# Access history
print(session.history)
```

### 7. Guardrails (Input/Output Validation)
Add validation checks that run in parallel:
```python
from agents import Agent, guardrail

@guardrail
def check_no_profanity(text: str) -> bool:
    """Ensure input contains no profanity."""
    banned_words = ["badword1", "badword2"]
    return not any(word in text.lower() for word in banned_words)

@guardrail
def check_length(text: str) -> bool:
    """Ensure input is not too long."""
    return len(text) < 1000

agent = Agent(
    name="Moderated Agent",
    guardrails=[check_no_profanity, check_length],
    model="gpt-4o"
)

# Guardrails run before agent processes input
# Breaks early if any check fails
```

### 8. Agents as Tools
Use one agent as a tool for another agent:
```python
from agents import Agent, agent_tool

# Specialized agent
calculator_agent = Agent(
    name="Calculator",
    instructions="Perform mathematical calculations",
    model="gpt-4o"
)

# Use agent as a tool
main_agent = Agent(
    name="Main Agent",
    tools=[agent_tool(calculator_agent)],
    model="gpt-4o"
)

# Main agent can call calculator agent as needed
result = main_agent.run("What is 123 * 456?")
```

### 9. Tracing and Debugging
Built-in tracing for visualization and debugging:
```python
from agents import Agent, trace

# Enable tracing
with trace():
    result = agent.run("Hello")

# Traces are automatically logged and can be:
# - Visualized in the OpenAI dashboard
# - Used for evaluation
# - Used for fine-tuning
```

### 10. Multi-Provider Support
Works with OpenAI and 100+ other LLM providers via LiteLLM:
```python
from agents import Agent

# OpenAI (default)
agent1 = Agent(model="gpt-4o")

# Anthropic Claude
agent2 = Agent(model="claude-3-5-sonnet-20241022")

# Other providers
agent3 = Agent(model="gemini/gemini-pro")
```

## Best Practices

1. **Agent Design**: Keep agents focused on specific tasks. Use handoffs for complex workflows.

2. **Tool Naming**: Use descriptive function names and docstrings - they become part of the tool schema.

3. **Error Handling**: Wrap tool functions with try-except to handle failures gracefully.

4. **Sessions**: Use sessions for multi-turn conversations to maintain context automatically.

5. **Guardrails**: Add input validation early to prevent processing invalid requests.

6. **Model Selection**: Use appropriate models for each agent (e.g., gpt-4o for complex reasoning, gpt-4o-mini for simple tasks).

7. **Tracing**: Enable tracing in production for monitoring and debugging agent behavior.

## Common Patterns

### Pattern 1: Multi-Agent Workflow
```python
# Specialist agents
researcher = Agent(name="Researcher", instructions="Research topics")
writer = Agent(name="Writer", instructions="Write content")
editor = Agent(name="Editor", instructions="Edit and refine")

# Coordinator with handoffs
coordinator = Agent(
    name="Coordinator",
    handoffs=[
        handoff(researcher, "Research the topic first"),
        handoff(writer, "Write based on research"),
        handoff(editor, "Final editing")
    ]
)
```

### Pattern 2: Tool-Heavy Agent
```python
@function_tool
def fetch_data(source: str) -> dict:
    """Fetch data from external source."""
    pass

@function_tool
def process_data(data: dict) -> dict:
    """Process and transform data."""
    pass

@function_tool
def save_results(data: dict) -> bool:
    """Save results to database."""
    pass

agent = Agent(
    name="Data Pipeline Agent",
    tools=[fetch_data, process_data, save_results],
    instructions="Execute data pipeline tasks"
)
```

### Pattern 3: Validated Agent with Session
```python
@guardrail
def validate_input(text: str) -> bool:
    return len(text) > 0 and len(text) < 500

agent = Agent(
    name="Chat Agent",
    guardrails=[validate_input],
    model="gpt-4o"
)

session = Session(agent=agent)
# Multi-turn conversation with validation
```

## Integration with FastAPI

```python
from fastapi import FastAPI, HTTPException
from agents import Agent, Session
from pydantic import BaseModel

app = FastAPI()
agent = Agent(name="API Agent", model="gpt-4o")
sessions = {}  # In production, use proper session storage

class ChatRequest(BaseModel):
    session_id: str
    message: str

@app.post("/chat")
async def chat(request: ChatRequest):
    if request.session_id not in sessions:
        sessions[request.session_id] = Session(agent=agent)

    session = sessions[request.session_id]
    result = session.run(request.message)

    return {"response": result.content}
```

## Resources
- GitHub: https://github.com/openai/openai-agents-python
- Documentation: https://github.com/openai/openai-agents-python/blob/main/docs/index.md
- Agents Guide: https://github.com/openai/openai-agents-python/blob/main/docs/agents.md
- Tools Guide: https://github.com/openai/openai-agents-python/blob/main/docs/tools.md
