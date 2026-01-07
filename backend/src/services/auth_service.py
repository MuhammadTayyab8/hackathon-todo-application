import os
import re
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import HTTPException, status
from jose import jwt
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.models.user import User, UserCreate

# JWT Settings
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

def hash_password(password: str) -> str:
    """Hash a password using bcrypt with 12 rounds."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password using bcrypt."""
    return bcrypt.checkpw(
        plain_password.encode("utf-8"),
        hashed_password.encode("utf-8")
    )

def validate_password_complexity(password: str):
    """
    Validate password complexity:
    - 12+ characters
    - At least one uppercase letter
    - At least one lowercase letter
    - At least one number
    - At least one special character
    """
    if len(password) < 12:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 12 characters long"
        )
    if not re.search(r"[A-Z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one uppercase letter"
        )
    if not re.search(r"[a-z]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one lowercase letter"
        )
    if not re.search(r"\d", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one number"
        )
    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must contain at least one special character"
        )

async def create_user(session: AsyncSession, user_create: UserCreate) -> User:
    """
    Validate password, check uniqueness, hash password, and create user.
    """
    # Validate password complexity
    validate_password_complexity(user_create.password)

    # Check email uniqueness
    email_query = select(User).where(User.email == user_create.email)
    existing_email = await session.exec(email_query)
    if existing_email.first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered"
        )

    # Check username uniqueness
    username_query = select(User).where(User.username == user_create.username)
    existing_username = await session.exec(username_query)
    if existing_username.first():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Username already taken"
        )

    # Create new user record
    new_user = User(
        email=user_create.email,
        username=user_create.username,
        hashed_password=hash_password(user_create.password)
    )

    session.add(new_user)
    await session.commit()
    await session.refresh(new_user)
    return new_user

def create_jwt_token(user: User) -> str:
    """
    Generate HS256-signed JWT token with:
    - userId (sub)
    - email
    - username
    - iat (issued at)
    - exp (expiry)
    """
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)

    payload = {
        "sub": str(user.id),
        "userId": str(user.id),
        "email": user.email,
        "username": user.username,
        "iat": now,
        "exp": expire
    }

    token = jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
    return token
