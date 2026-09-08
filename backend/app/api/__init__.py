from fastapi import APIRouter
from app.api.auth import router as auth_router
from app.api.users import router as users_router
from app.api.study_spaces import router as study_spaces_router
from app.api.topics import router as topics_router
from app.api.mindmap import router as mindmap_router
from app.api.materials import router as materials_router
from app.api.sessions import router as sessions_router
from app.api.tasks import router as tasks_router
from app.api.projects import router as projects_router
from app.api.command_center import router as command_center_router
from app.api.debug_journals import router as debug_journals_router
from app.api.knowledge_graph import router as knowledge_graph_router
from app.api.sync import router as sync_router
from app.api.analytics import router as analytics_router
from app.api.lab import router as lab_router
from app.api.ai import router as ai_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["Auth"])
api_router.include_router(users_router, prefix="/users", tags=["Users & Profiles"])
api_router.include_router(study_spaces_router, prefix="/study-spaces", tags=["Universal Study Spaces"])
api_router.include_router(topics_router, prefix="/topics", tags=["Topics & Competencies"])
api_router.include_router(mindmap_router, prefix="/mindmap", tags=["React Flow Mind Map"])
api_router.include_router(materials_router, prefix="/materials", tags=["Materials & Document Processing"])
api_router.include_router(sessions_router, prefix="/sessions", tags=["Study Sessions"])
api_router.include_router(tasks_router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(projects_router, prefix="/projects", tags=["Projects"])
api_router.include_router(command_center_router, prefix="/command-center", tags=["Command Center & Analytics"])
api_router.include_router(debug_journals_router, prefix="/debug-journals", tags=["Debug Lab ('I'm Stuck')"])
api_router.include_router(knowledge_graph_router, prefix="/knowledge-graph", tags=["Knowledge Graph Engine"])
api_router.include_router(sync_router, prefix="/sync", tags=["Offline Sync"])
api_router.include_router(analytics_router, prefix="/analytics", tags=["Analytics Engine"])
api_router.include_router(lab_router, prefix="/lab", tags=["DevOps Lab Terminal"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Engine & Verification Quiz"])

__all__ = [
    "api_router",
    "auth_router",
    "users_router",
    "study_spaces_router",
    "topics_router",
    "mindmap_router",
    "materials_router",
    "sessions_router",
    "tasks_router",
    "projects_router",
    "command_center_router",
    "debug_journals_router",
    "knowledge_graph_router",
    "sync_router",
    "analytics_router",
    "lab_router",
    "ai_router"
]
