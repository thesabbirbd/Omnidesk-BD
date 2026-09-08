from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "StudyOS API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"

    # Default Database URL (PostgreSQL)
    DATABASE_URL: str = "postgresql://admin:secret123@localhost/studyos_db"

    # CORS configuration
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore"
    )


settings = Settings()
