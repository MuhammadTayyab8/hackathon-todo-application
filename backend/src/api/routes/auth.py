from fastapi import APIRouter, Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer
from sqlmodel.ext.asyncio.session import AsyncSession
from src.db import get_session
from src.models.user import UserCreate, UserRead, UserSignIn, AuthResponse, User
from src.services.auth_service import create_user, create_jwt_token, authenticate_user
from datetime import datetime, timedelta, timezone
from sqlmodel import select

router = APIRouter()
security = HTTPBearer()

@router.options("/signup")
async def options_signup():
    return Response(status_code=200)

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def signup(user_data: UserCreate, response: Response, session: AsyncSession = Depends(get_session)):
    try:
        print("API CALL")
        user = await create_user(session, user_data)
        token = create_jwt_token(user)
        # Expiry is set to 7 days in auth_service.py
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)

        # Set HTTP cookie with security flags
        response.set_cookie(
            key="auth_token",
            value=token,
            max_age=604800,  # 7 days in seconds
            httponly=True,  # Prevent JavaScript access (XSS protection)
            secure=True,  # Set to True in production with HTTPS
            samesite="none",  # CSRF protection
            path="/"  # Available to all routes
        )

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

@router.options("/signin")
async def options_signin():
    return Response(status_code=200)

@router.post("/signin", response_model=AuthResponse)
async def signin(credentials: UserSignIn, response: Response, session: AsyncSession = Depends(get_session)):
    user = await authenticate_user(session, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    token = create_jwt_token(user)
    # Expiry is set to 7 days in auth_service.py
    expires_at = datetime.now(timezone.utc) + timedelta(days=7)

    # Set HTTP cookie with security flags
    response.set_cookie(
        key="auth_token",
        value=token,
        max_age=604800,  # 7 days in seconds
        httponly=True,  # Prevent JavaScript access (XSS protection)
        secure=True,  # Set to True in production with HTTPS  False in locl
        samesite="none",  # CSRF protection  none in local
        path="/"  # Available to all routes
    )

    return AuthResponse(
        user=user,
        token=token,
        expires_at=expires_at
    )

@router.post("/signout")
async def signout(response: Response):
    """
    Sign out endpoint.
    Clear the auth_token cookie.
    """
    response.delete_cookie(
        key="auth_token",
        path="/",
        samesite="lax"
    )
    return {"message": "Successfully signed out"}

@router.get("/me", response_model=UserRead)
async def get_me(request: Request, session: AsyncSession = Depends(get_session)):
    """
    Return current authenticated user info.
    User ID is extracted by JWTAuthMiddleware.
    """
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated"
        )

    user = await session.get(User, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
