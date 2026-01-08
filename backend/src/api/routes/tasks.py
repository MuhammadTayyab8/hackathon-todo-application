from typing import List
from uuid import UUID
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from src.db import get_session
from src.models.task import Task, TaskCreate, TaskRead, TaskUpdate

router = APIRouter()

async def verify_user_access(user_id: UUID, request: Request):
    """
    Ensure the authenticated user matches the path user_id.
    """
    if not hasattr(request.state, "user_id"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )

    # Check if request.state.user_id matches user_id (ignoring string/uuid differences)
    if str(request.state.user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own tasks"
        )

@router.get("/{user_id}/tasks", response_model=List[TaskRead])
async def list_tasks(
    user_id: UUID,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    await verify_user_access(user_id, request)
    statement = select(Task).where(Task.user_id == user_id)
    result = await session.exec(statement)
    return result.all()

@router.post("/{user_id}/tasks", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(
    user_id: UUID,
    task_in: TaskCreate,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    await verify_user_access(user_id, request)
    task = Task.from_orm(task_in)
    task.user_id = user_id
    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def get_task(
    user_id: UUID,
    task_id: UUID,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    await verify_user_access(user_id, request)
    statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
    result = await session.exec(statement)
    task = result.first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return task

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskRead)
async def update_task(
    user_id: UUID,
    task_id: UUID,
    task_update: TaskUpdate,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    await verify_user_access(user_id, request)
    statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
    result = await session.exec(statement)
    task = result.first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task_data = task_update.dict(exclude_unset=True)
    for key, value in task_data.items():
        setattr(task, key, value)

    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task

@router.delete("/{user_id}/tasks/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    user_id: UUID,
    task_id: UUID,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    await verify_user_access(user_id, request)
    statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
    result = await session.exec(statement)
    task = result.first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    await session.delete(task)
    await session.commit()
    return None

@router.patch("/{user_id}/tasks/{task_id}/complete", response_model=TaskRead)
async def complete_task(
    user_id: UUID,
    task_id: UUID,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    await verify_user_access(user_id, request)
    statement = select(Task).where(Task.user_id == user_id, Task.id == task_id)
    result = await session.exec(statement)
    task = result.first()
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")

    task.completed = not task.completed
    task.updated_at = datetime.now(timezone.utc).replace(tzinfo=None)

    session.add(task)
    await session.commit()
    await session.refresh(task)
    return task
