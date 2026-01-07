from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel.ext.asyncio.session import AsyncSession
from pydantic import BaseModel
from src.db import get_session
from src.models.user import UserCreate, UserRead
from src.services.auth_service import create_user, create_jwt_token
from datetime import datetime, timedelta, timezone

router = APIRouter()

class UserSignIn(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    user: UserRead
    token: str
    expires_at: datetime

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, session: AsyncSession = Depends(get_session)):
    try:
        user = await create_user(session, user_data)
        token = create_jwt_token(user)
        # Expiry is set to 7 days in auth_service.py
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)

        return AuthResponse(
            user=user,
            token=token,
            expires_at=expires_at
        )
    except HTTPException:
        raise
    except ValueError as e:
        error_msg = str(e)
        if "already exists" in error_msg:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=error_msg)
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_msg)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
