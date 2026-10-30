import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_ENV: str = "development"
    APP_BASE_URL: str = "http://localhost:3000"
    BACKEND_BASE_URL: str = "http://localhost:8000"
    BACKEND_CORS_ORIGINS: Union[str, List[str]] = "http://localhost:3000"

    # Default to sqlite:///./wattsathi.db if postgres is not provided or unavailable
    DATABASE_URL: str = "sqlite:///./wattsathi.db"

    JWT_SECRET: str = "dev-secret-key-change-in-production-long-random-string"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    ADMIN_EMAIL: str = "admin@example.com"
    ADMIN_PASSWORD: str = "wattsathi_admin_password_2026"

    # Bolna
    BOLNA_API_BASE_URL: str = "https://api.bolna.ai"
    BOLNA_API_KEY: str = ""
    BOLNA_AGENT_ID: str = ""

    # Shared secret for custom Bolna function tools
    WATTSATHI_BOLNA_TOOL_SECRET: str = "wattsathi-tool-secret-key-change-in-prod"
    BOLNA_WEBHOOK_SECRET: str = ""

    # Uploads
    MAX_UPLOAD_MB: int = 20
    UPLOAD_STORAGE_PATH: str = "./storage/uploads"

    # Call guards
    VOICE_TEST_MAX_SECONDS: int = 150
    VOICE_TEST_REQUIRES_CONFIRMATION: bool = True

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()

