from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlmodel.ext.asyncio.session import AsyncSession
from sqlmodel import select

from src.db import get_session
from src.models.category import Category, CategoryCreate, CategoryRead

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

    if str(request.state.user_id) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only access your own categories"
        )

@router.get("/{user_id}/categories", response_model=List[CategoryRead])
async def list_categories(
    user_id: UUID,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    await verify_user_access(user_id, request)
    statement = select(Category).where(Category.user_id == user_id)
    result = await session.exec(statement)
    return result.all()

@router.post("/{user_id}/categories", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    user_id: UUID,
    category_in: CategoryCreate,
    request: Request,
    session: AsyncSession = Depends(get_session)
):
    await verify_user_access(user_id, request)

    # Check if category with same name already exists for this user
    statement = select(Category).where(
        Category.user_id == user_id,
        Category.name == category_in.name
    )
    result = await session.exec(statement)
    existing = result.first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Category with this name already exists"
        )

    category = Category(**category_in.model_dump(), user_id=user_id)
    session.add(category)
    await session.commit()
    await session.refresh(category)
    return category
