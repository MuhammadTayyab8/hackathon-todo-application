---
name: python-fastapi
description: Builds RESTful APIs with FastAPI, including endpoints, dependencies, and async operations. Use for creating Todo app backend with auth and DB integration.
allowed-tools: Read, Bash(python:*)
---

# FastAPI Development Guide
## Instructions
1. Install: `uv add fastapi uvicorn`.
2. App Setup: from fastapi import FastAPI; app = FastAPI().
3. Endpoints: Use @app.get("/todos") for reads, Pydantic models for validation.
4. Dependencies: For DB sessions or auth checks.
5. Run: uvicorn main:app --reload.
6. Best Practices: Error handling, CORS for frontend.

## Example
from fastapi import FastAPI, Depends
app = FastAPI()

@app.get("/todos")
def get_todos(db=Depends(get_db)):
    # Query DB