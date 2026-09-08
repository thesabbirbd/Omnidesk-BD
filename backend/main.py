from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.auth import router as auth_router
from app.api.sessions import router as sessions_router
from app.api.tasks import router as tasks_router
from app.api.projects import router as projects_router
from app.api import api_router

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware allowing all origins for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Primary API Router (/api/auth, /api/sessions, /api/tasks, /api/projects)
app.include_router(api_router, prefix=settings.API_V1_STR)

# Top-level direct routers for flexible access (/auth, /sessions, /tasks, /projects)
app.include_router(auth_router, prefix="/auth", tags=["Auth Direct"])
app.include_router(sessions_router, prefix="/sessions", tags=["Study Sessions Direct"])
app.include_router(tasks_router, prefix="/tasks", tags=["Tasks Direct"])
app.include_router(projects_router, prefix="/projects", tags=["Projects Direct"])


@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint returning server status.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)