"""
Runtime + migration configuration. Values come from environment variables
(optionally loaded from backend/.env). See .env.example.
"""

from __future__ import annotations

import os
from functools import lru_cache

try:  # optional convenience; not required in production
    from dotenv import load_dotenv

    load_dotenv()
except Exception:  # pragma: no cover
    pass


class Settings:
    def __init__(self) -> None:
        self.db_host = os.getenv("DB_HOST", "localhost")
        self.db_port = int(os.getenv("DB_PORT", "5432"))
        self.db_name = os.getenv("DB_NAME", "df_toolkit")
        self.db_user = os.getenv("DB_USER", "df")
        self.db_password = os.getenv("DB_PASSWORD", "df")

    @property
    def sync_dsn(self) -> str:
        """Sync DSN (psycopg2) used by Alembic migrations."""
        return os.getenv("DATABASE_URL") or (
            f"postgresql+psycopg2://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def async_dsn(self) -> str:
        """SQLAlchemy-style async DSN (asyncpg driver)."""
        return (
            f"postgresql+asyncpg://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def asyncpg_dsn(self) -> str:
        """Plain libpq DSN for asyncpg.create_pool()."""
        return (
            f"postgresql://{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )

    @property
    def cors_origins(self) -> list[str]:
        raw = os.getenv("CORS_ORIGINS", "http://localhost:5174,http://127.0.0.1:5174")
        return [o.strip() for o in raw.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
