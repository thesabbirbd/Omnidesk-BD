from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.sessions import router as sessions_router
from app.api.tasks import router as tasks_router
from app.api.projects import router as projects_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(sessions_router, prefix="/sessions", tags=["Study Sessions"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])

__all__ = [
    "api_router",
    "auth_router",
    "sessions_router",
    "tasks_router",
    "projects_router"
]
