from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Omnidesk BD API"
    VERSION: str = "1.2.5"
    API_V1_STR: str = "/api"

    # Default Database URL (PostgreSQL)
    DATABASE_URL: str = "postgresql://admin:secret123@localhost:5432/studyos_db"

    # JWT Authentication Security Settings
    SECRET_KEY: str = "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7"
    REFRESH_SECRET_KEY: str = "e4d6a1b2c3f890123456789abcdef0123456789abcdef0123456789abcdef012"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30         # 30 days

    # File Storage
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE_MB: int = 50

    # Redis & Task Queue
    REDIS_URL: str = "redis://localhost:6379/0"
    REDIS_ENABLED: bool = True

    # Security & Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 120
    ENVIRONMENT: str = "development"
    LOG_LEVEL: str = "INFO"

    # Optional AI Adapter
    AI_PROVIDER: str = "none"
    OLLAMA_BASE_URL: str = "http://127.0.0.1:11434"
    OLLAMA_MODEL: str = "llama3"
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-1.5-flash"

    # CORS configuration
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
