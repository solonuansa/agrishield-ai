"""Konfigurasi aplikasi menggunakan Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # App
    environment: str = "development"
    secret_key: str
    access_token_expire_minutes: int = 15  # 15 menit
    refresh_token_expire_days: int = 7  # 7 hari

    # Database
    database_url: str = "postgresql+asyncpg://postgres:postgres@db:5432/agrishield"

    # Redis
    redis_url: str = "redis://redis:6379/0"
    redis_password: str = ""

    # ML Service
    ml_service_url: str = "http://ml-service:8001"
    # NOTE: hanya untuk logging startup — logika mock ada di ml-service
    use_mock_model: bool = True

    # Google Gemini
    gemini_api_key: str = ""
    # Model yang digunakan untuk rekomendasi penanganan penyakit
    gemini_model: str = "gemini-2.0-flash"

    # Cloudflare R2 (S3-compatible)
    r2_endpoint: str = ""
    r2_bucket_name: str = "agrishield-images"
    r2_access_key_id: str = ""
    r2_secret_access_key: str = ""
    r2_public_url: str = ""

    # Logging
    log_level: str = "INFO"

    # Error tracking (Sentry)
    sentry_dsn: str = ""

    # CORS
    allowed_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Feature flags
    registration_open: bool = True
    community_enabled: bool = True

    @property
    def is_development(self) -> bool:
        return self.environment == "development"


settings = Settings()
