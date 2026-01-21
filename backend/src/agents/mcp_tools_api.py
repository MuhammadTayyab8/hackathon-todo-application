"""
MCP Tool Wrappers - API Mode

All tools use direct HTTP API calls instead of stdio subprocess.
This avoids Windows NotImplementedError with subprocess operations.
"""

import os
from typing import Optional, Dict, Any
from jose import jwt
from dotenv import load_dotenv

load_dotenv()


async def add_task_tool(
    title: str,
    jwt_token: str,
    description: str = "",
    due_date: str = "",
    priority: str = "medium",
    category_id: Optional[str] = None
) -> Dict[str, Any]:
    """Create a new task via direct API call."""
    import httpx
    import traceback

    try:
        print(f"[API MODE] add_task: {title}, due: {due_date}, priority: {priority}")

        # Decode JWT to get user_id
        decoded = jwt.decode(jwt_token, key="", options={"verify_signature": False})
        user_id = decoded.get("userId") or decoded.get("sub")

        url = f"http://localhost:8001/api/{user_id}/tasks"
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={
                    "title": title,
                    "description": description,
                    "due_date": due_date if due_date else None,
                    "priority": priority,
                    "category_id": category_id
                },
                headers={"Authorization": f"Bearer {jwt_token}"},
                timeout=10.0
            )

            print(f"[API MODE] Response: {response.status_code}")
            if response.status_code == 201:
                result = response.json()
                print(f"[API MODE] ✅ Task created: {result.get('id')}")
                return {"success": True, "task": result}
            else:
                print(f"[API MODE] ❌ Error: {response.text}")
                return {"error": f"API error {response.status_code}"}

    except Exception as e:
        print(f"[API MODE ERROR] {str(e)}\n{traceback.format_exc()}")
        return {"error": str(e)}


async def list_tasks_tool(
    jwt_token: str,
    status: str = "all",
    category_id: Optional[str] = None,
    priority: Optional[str] = None
) -> Dict[str, Any]:
    """Retrieve tasks via direct API call."""
    import httpx
    import traceback

    try:
        print(f"[API MODE] list_tasks: status={status}")

        decoded = jwt.decode(jwt_token, key="", options={"verify_signature": False})
        user_id = decoded.get("userId") or decoded.get("sub")

        url = f"http://localhost:8001/api/{user_id}/tasks"
        async with httpx.AsyncClient() as client:
            response = await client.get(
                url,
                headers={"Authorization": f"Bearer {jwt_token}"},
                timeout=10.0
            )

            if response.status_code == 200:
                result = response.json()
                print(f"[API MODE] ✅ Retrieved {len(result)} tasks")
                return {"success": True, "tasks": result}
            else:
                return {"error": f"API error {response.status_code}"}

    except Exception as e:
        print(f"[API MODE ERROR] {str(e)}")
        return {"error": str(e)}


async def complete_task_tool(
    task_id: str,
    jwt_token: str
) -> Dict[str, Any]:
    """Mark a task as completed via direct API call."""
    import httpx
    import traceback

    try:
        print(f"[API MODE] complete_task: {task_id}")

        decoded = jwt.decode(jwt_token, key="", options={"verify_signature": False})
        user_id = decoded.get("userId") or decoded.get("sub")

        url = f"http://localhost:8001/api/{user_id}/tasks/{task_id}/complete"
        async with httpx.AsyncClient() as client:
            response = await client.patch(
                url,
                headers={"Authorization": f"Bearer {jwt_token}"},
                timeout=10.0
            )

            if response.status_code == 200:
                result = response.json()
                print(f"[API MODE] ✅ Task completed")
                return {"success": True, "task": result}
            else:
                return {"error": f"API error {response.status_code}"}

    except Exception as e:
        print(f"[API MODE ERROR] {str(e)}")
        return {"error": str(e)}


async def update_task_tool(
    task_id: str,
    jwt_token: str,
    title: Optional[str] = None,
    description: Optional[str] = None,
    due_date: Optional[str] = None,
    priority: Optional[str] = None,
    category_id: Optional[str] = None
) -> Dict[str, Any]:
    """Update task fields via direct API call."""
    import httpx
    import traceback

    try:
        print(f"[API MODE] update_task: {task_id}")

        decoded = jwt.decode(jwt_token, key="", options={"verify_signature": False})
        user_id = decoded.get("userId") or decoded.get("sub")

        # Build update payload
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if description is not None:
            update_data["description"] = description
        if due_date is not None:
            update_data["due_date"] = due_date
        if priority is not None:
            update_data["priority"] = priority
        if category_id is not None:
            update_data["category_id"] = category_id

        url = f"http://localhost:8001/api/{user_id}/tasks/{task_id}"
        async with httpx.AsyncClient() as client:
            response = await client.put(
                url,
                json=update_data,
                headers={"Authorization": f"Bearer {jwt_token}"},
                timeout=10.0
            )

            if response.status_code == 200:
                result = response.json()
                print(f"[API MODE] ✅ Task updated")
                return {"success": True, "task": result}
            else:
                return {"error": f"API error {response.status_code}"}

    except Exception as e:
        print(f"[API MODE ERROR] {str(e)}")
        return {"error": str(e)}


async def delete_task_tool(
    task_id: str,
    jwt_token: str
) -> Dict[str, Any]:
    """Delete a task via direct API call."""
    import httpx
    import traceback

    try:
        print(f"[API MODE] delete_task: {task_id}")

        decoded = jwt.decode(jwt_token, key="", options={"verify_signature": False})
        user_id = decoded.get("userId") or decoded.get("sub")

        url = f"http://localhost:8001/api/{user_id}/tasks/{task_id}"
        async with httpx.AsyncClient() as client:
            response = await client.delete(
                url,
                headers={"Authorization": f"Bearer {jwt_token}"},
                timeout=10.0
            )

            if response.status_code == 204:
                print(f"[API MODE] ✅ Task deleted")
                return {"success": True, "message": "Task deleted"}
            else:
                return {"error": f"API error {response.status_code}"}

    except Exception as e:
        print(f"[API MODE ERROR] {str(e)}")
        return {"error": str(e)}
