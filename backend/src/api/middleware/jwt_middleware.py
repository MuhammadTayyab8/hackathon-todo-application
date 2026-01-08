import os
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from jose import jwt, JWTError
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.status import HTTP_401_UNAUTHORIZED

# JWT Settings
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

# Public routes that don't require JWT
PUBLIC_ROUTES = [
    "/api/auth/signup",
    "/api/auth/signin",
    "/health",
    "/docs",
    "/openapi.json"
]

class JWTAuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Allow OPTIONS requests unconditionally so CORS middleware can handle them
        print(request.url.path, "request.url.path")
        
        if request.method == "OPTIONS":
            return await call_next(request)

        # 1. Implementation of public routes whitelist (T023)
        if any(request.url.path.startswith(route) for route in PUBLIC_ROUTES):
            return await call_next(request)

        # 2. Extract Authorization header (T022)
        auth_header = request.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            return JSONResponse(
                status_code=HTTP_401_UNAUTHORIZED,
                content={"detail": "Missing or invalid authorization header"}
            )

        token = auth_header.split(" ")[1]

        try:
            # 3. Decode and verify token (T022, T024)
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id = payload.get("userId") or payload.get("sub")

            if user_id is None:
                raise JWTError("User ID not found in token")

            # 4. Add user_id to request state (T025)
            request.state.user_id = user_id

        except JWTError as e:
            return JSONResponse(
                status_code=HTTP_401_UNAUTHORIZED,
                content={"detail": f"Could not validate credentials: {str(e)}"}
            )

        return await call_next(request)
