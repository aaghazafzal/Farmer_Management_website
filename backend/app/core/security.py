"""
KisanSetu Backend — Firebase Authentication & Token Verification

SECURITY NOTES:
- Firebase ID tokens are verified server-side using the Admin SDK.
- Roles are NEVER read from the token claims — only from the users collection.
- Auth endpoints are rate-limited (5/min per IP) to prevent account farming attacks.
- Tokens are never logged.
"""
from __future__ import annotations

import logging
import os
from typing import Optional

import firebase_admin
from firebase_admin import auth, credentials
from fastapi import Depends, Header
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.core.exceptions import auth_invalid, auth_required

logger = logging.getLogger(__name__)

_firebase_initialized = False
bearer_scheme = HTTPBearer(auto_error=False)


def init_firebase() -> None:
    """Initialize Firebase Admin SDK on application startup."""
    global _firebase_initialized
    if _firebase_initialized:
        return

    try:
        # Option 1: Service account JSON file
        sa_path = settings.FIREBASE_SERVICE_ACCOUNT_PATH
        if os.path.isfile(sa_path):
            cred = credentials.Certificate(sa_path)
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized via service account file: %s", sa_path)
        # Option 2: Individual env vars (production / CI)
        elif settings.FIREBASE_CLIENT_EMAIL and settings.FIREBASE_PRIVATE_KEY:
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
                "token_uri": "https://oauth2.googleapis.com/token",
            })
            firebase_admin.initialize_app(cred)
            logger.info("Firebase initialized via environment credentials")
        else:
            # Development fallback — token verification will be skipped for seeded users
            logger.warning(
                "Firebase Admin SDK not configured. "
                "Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY. "
                "Auth will work in demo mode only."
            )
            firebase_admin.initialize_app(options={"projectId": settings.FIREBASE_PROJECT_ID})

        _firebase_initialized = True
    except Exception as exc:
        logger.error("Firebase init failed: %s", exc)
        raise


async def verify_firebase_token(token: str) -> dict:
    """
    Verify a Firebase ID token and return decoded claims.
    Raises auth_invalid() if the token is missing, invalid, or expired.
    """
    if not token:
        raise auth_required()

    # Development fallback for demo tokens
    if settings.ENVIRONMENT == "development" and (token.startswith("demo-") or token in ("demo-token", "demo-admin", "demo-staff")):
        return {"uid": token}

    try:
        decoded = auth.verify_id_token(token, check_revoked=True)
        return decoded
    except auth.RevokedIdTokenError:
        raise auth_invalid()
    except auth.ExpiredIdTokenError:
        raise auth_invalid()
    except auth.InvalidIdTokenError:
        raise auth_invalid()
    except Exception as exc:
        logger.warning("Token verification error: %s", type(exc).__name__)
        raise auth_invalid()


async def get_current_user_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
) -> str:
    """Extract Bearer token from Authorization header."""
    if not credentials or not credentials.credentials:
        if settings.ENVIRONMENT == "development":
            return "demo-admin-uid-001"
        raise auth_required()
    return credentials.credentials


async def get_firebase_uid(
    token: str = Depends(get_current_user_token),
) -> str:
    """Verify token and return the Firebase UID."""
    claims = await verify_firebase_token(token)
    uid = claims.get("uid")
    if not uid:
        raise auth_invalid()
    return uid
