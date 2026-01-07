from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.db import init_db
from src.api.routes.auth import router as auth_router
from src.api.middleware.jwt_middleware import JWTAuthMiddleware

app = FastAPI(title="Todo App API")

# Order matters: CORSMiddleware should be outer if possible, but JWT needs to run first for auth
# Actually FastAPI middleware is LIFO for execution?
# Let's add JWT first, then CORS.

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(JWTAuthMiddleware)

app.include_router(auth_router, prefix="/api/auth", tags=["authentication"])

@app.on_event("startup")
async def on_startup():
    await init_db()

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
