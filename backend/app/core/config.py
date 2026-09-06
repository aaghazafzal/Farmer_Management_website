"""
KisanSetu Backend — Application Configuration
Reads all settings from environment variables via pydantic-settings.
"""
from __future__ import annotations

import os
from functools import lru_cache
from typing import List

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # ── Application ────────────────────────────────────────────
    ENVIRONMENT: str = "development"
    APP_ENV: str = "development"
    LOG_LEVEL: str = "INFO"
    PORT: int = 8000
    APP_VERSION: str = "1.0.0"
    APP_TIMEZONE: str = "Asia/Kolkata"

    # ── MongoDB ────────────────────────────────────────────────
    DATABASE_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "kisansetu"

    # ── Firebase Admin SDK ─────────────────────────────────────
    FIREBASE_SERVICE_ACCOUNT_PATH: str = "./firebase-adminsdk.json"
    FIREBASE_PROJECT_ID: str = "kisansetu-a1cad"
    FIREBASE_CLIENT_EMAIL: str = ""
    FIREBASE_PRIVATE_KEY: str = ""

    # ── Google Maps ────────────────────────────────────────────
    GOOGLE_MAPS_API_KEY: str = ""

    # ── Firebase Web Credentials (frontend config delivery) ────
    FIREBASE_API_KEY: str = ""
    FIREBASE_AUTH_DOMAIN: str = "kisansetu-a1cad.firebaseapp.com"
    FIREBASE_STORAGE_BUCKET: str = "kisansetu-a1cad.firebasestorage.app"
    FIREBASE_MESSAGING_SENDER_ID: str = ""
    FIREBASE_APP_ID: str = ""

    # ── CORS ────────────────────────────────────────────────────
    FRONTEND_ORIGINS: str = "http://localhost:3000,http://localhost:3001"

    @property
    def allowed_origins(self) -> List[str]:
        return [o.strip() for o in self.FRONTEND_ORIGINS.split(",") if o.strip()]

    # ── Rate Limiting ───────────────────────────────────────────
    # CRITICAL: Auth endpoints are heavily limited to prevent account farming
    # and brute-force attacks. 5 requests per minute per IP is intentionally strict.
    AUTH_RATE_LIMIT: str = "5/minute"
    API_RATE_LIMIT: str = "60/minute"
    BOOKING_RATE_LIMIT: str = "10/minute"
    ALERT_RATE_LIMIT: str = "20/hour"

    # ── Queue Operations ────────────────────────────────────────
    DEFAULT_PROCESSING_MINUTES: int = 12

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT.lower() == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    """Return a cached singleton Settings instance."""
    return Settings()


settings = get_settings()
