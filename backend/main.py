import time
import json
import logging
from fastapi import FastAPI, Request, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.core.config import settings
from app.core.rate_limiter import check_rate_limit, _get_redis
from app.db.session import SessionLocal
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
from app.api.lab import router as lab_router, lab_terminal_websocket
from app.api import api_router

# Configure root and structured logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL, logging.INFO),
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("studyos.api")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS middleware allowing development and production origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS if settings.BACKEND_CORS_ORIGINS != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Structured JSON HTTP Request Logging Middleware
@app.middleware("http")
async def structured_logging_middleware(request: Request, call_next):
    start_time = time.time()
    client_ip = request.client.host if request.client else "127.0.0.1"
    path = request.url.path

    # Evaluate rate limiting on API mutations and queries (skip probes and static docs)
    if path.startswith("/api/") and not path.startswith("/api/v1/lab/ws"):
        is_allowed, remaining, reset_in = check_rate_limit(request)
        if not is_allowed:
            logger.warning(
                "Rate limit exceeded: ip=%s path=%s remaining=0 reset_in=%ss",
                client_ip, path, reset_in
            )
            return Response(
                content=json.dumps({
                    "detail": f"Too many requests. Rate limit exceeded. Try again in {reset_in} seconds."
                }),
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                media_type="application/json",
                headers={"Retry-After": str(reset_in), "X-RateLimit-Remaining": "0"}
            )

    response = await call_next(request)
    duration_ms = round((time.time() - start_time) * 1000, 2)

    # Log structured payload
    if path not in ["/health", "/ready"]:
        logger.info(
            "HTTP %s %s %s %sms [client=%s]",
            request.method,
            path,
            response.status_code,
            duration_ms,
            client_ip
        )

    return response


# Primary API Router (/api/auth, /api/users, /api/study-spaces, /api/topics, /api/sync, /api/analytics, etc.)
app.include_router(api_router, prefix=settings.API_V1_STR)

# Top-level direct routers for flexible access and backwards compatibility
app.include_router(auth_router, prefix="/auth", tags=["Auth Direct"])
app.include_router(users_router, prefix="/users", tags=["Users Direct"])
app.include_router(study_spaces_router, prefix="/study-spaces", tags=["Study Spaces Direct"])
app.include_router(topics_router, prefix="/topics", tags=["Topics Direct"])
app.include_router(mindmap_router, prefix="/mindmap", tags=["MindMap Direct"])
app.include_router(materials_router, prefix="/materials", tags=["Materials Direct"])
app.include_router(sessions_router, prefix="/sessions", tags=["Study Sessions Direct"])
app.include_router(tasks_router, prefix="/tasks", tags=["Tasks Direct"])
app.include_router(projects_router, prefix="/projects", tags=["Projects Direct"])
app.include_router(command_center_router, prefix="/command-center", tags=["Command Center Direct"])
app.include_router(debug_journals_router, prefix="/debug-journals", tags=["Debug Journals Direct"])
app.include_router(knowledge_graph_router, prefix="/knowledge-graph", tags=["Knowledge Graph Direct"])
app.include_router(sync_router, prefix="/sync", tags=["Offline Sync Direct"])
app.include_router(analytics_router, prefix="/analytics", tags=["Analytics Direct"])
app.include_router(lab_router, prefix="/lab", tags=["DevOps Lab Direct"])

# Explicit WebSocket routes for DevOps Lab Terminal
app.add_api_websocket_route("/api/v1/lab/ws", lab_terminal_websocket)
app.add_api_websocket_route("/api/lab/ws", lab_terminal_websocket)


@app.get("/health", tags=["Observability"])
def health_check():
    """
    Liveness probe: verifies that the web service application process is alive.
    """
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


@app.get("/ready", tags=["Observability"])
def readiness_check(response: Response):
    """
    Readiness probe: verifies backend connections to PostgreSQL and Redis
    without leaking database credentials, passwords, or connection strings.
    """
    db_status = "unreachable"
    redis_status = "offline_fallback"

    # 1. Probe PostgreSQL connection
    try:
        db = SessionLocal()
        try:
            db.execute(text("SELECT 1"))
            db_status = "healthy"
        finally:
            db.close()
    except Exception as exc:
        logger.error("Readiness check: Database probe failed: %s", exc)
        db_status = "unreachable"

    # 2. Probe Redis connection
    r = _get_redis()
    if r is not None:
        try:
            if r.ping():
                redis_status = "connected"
        except Exception:
            redis_status = "offline_fallback"
    else:
        redis_status = "offline_fallback"

    is_ready = (db_status == "healthy")
    if not is_ready:
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return {
        "status": "ready" if is_ready else "not_ready",
        "database": db_status,
        "redis": redis_status,
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)