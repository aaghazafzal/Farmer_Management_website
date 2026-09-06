"""
KisanSetu Backend — Auth Router

SECURITY: This router applies STRICT rate limiting on all endpoints to prevent:
  - Account farming attacks (mass account creation)
  - Brute-force OTP attacks
  - Token enumeration attacks

Rate limit: 5 requests per minute per IP address (configurable via AUTH_RATE_LIMIT env).
On limit breach, returns HTTP 429 with RATE_LIMITED error code.

The frontend uses Firebase phone OTP — this backend only verifies the resulting
Firebase ID token and creates/loads the user record.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import KisanSetuException, AppError, auth_invalid
from app.core.permissions import get_current_user, Role
from app.core.security import verify_firebase_token
from app.schemas import ok
from app.schemas.auth import VerifyTokenRequest, AuthResponse, UserOut
from app.utils.datetime_utils import utc_now, format_ist
from app.utils.ids import generate_farmer_reference

logger = logging.getLogger(__name__)

# ── Rate limiter (per-IP) ─────────────────────────────────────────────────────
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/verify-token",
    summary="Verify Firebase token and register/load user",
    description="""
Verifies a Firebase ID token (from phone OTP) and returns the user record.
Creates a new user document on first sign-in.

**Rate limit: 5 requests per minute per IP** — prevents account farming and
mass registration attacks. Returns HTTP 429 if limit is exceeded.
    """,
)
@limiter.limit(settings.AUTH_RATE_LIMIT)
async def verify_token(
    request: Request,  # Required by slowapi for IP extraction
    body: VerifyTokenRequest,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Verify Firebase token → load or create user → return user + role.
    Never exposes raw Firebase claims or phone numbers in full.
    """
    # Verify with Firebase Admin SDK
    claims = await verify_firebase_token(body.firebase_token)
    firebase_uid = claims.get("uid")
    if not firebase_uid:
        raise auth_invalid()

    phone = claims.get("phone_number", "")
    display_name = claims.get("name") or claims.get("display_name") or ""
    is_new_user = False

    # Load existing user
    user = await db.users.find_one({"firebase_uid": firebase_uid})

    if not user:
        # First sign-in: create user with FARMER role by default
        is_new_user = True
        now = utc_now()
        new_user = {
            "firebase_uid": firebase_uid,
            "phone": phone,
            "display_name": display_name,
            "role": Role.FARMER,
            "is_active": True,
            "created_at": now,
            "updated_at": now,
        }
        result = await db.users.insert_one(new_user)
        new_user["_id"] = result.inserted_id

        # Create farmer profile for new users
        await db.farmers.insert_one({
            "user_id": str(result.inserted_id),
            "firebase_uid": firebase_uid,
            "farmer_reference": generate_farmer_reference(),
            "name": display_name or "Farmer",
            "phone": phone,
            "phone_masked": _mask_phone(phone),
            "village": "",
            "district": "",
            "state": "Punjab",
            "land_area": "",
            "total_deliveries": 0,
            "created_at": now,
        })

        user = new_user
        logger.info("New user registered: %s (role: FARMER)", firebase_uid[:8])
    else:
        # Update display name on login if changed
        if display_name and display_name != user.get("display_name"):
            await db.users.update_one(
                {"_id": user["_id"]},
                {"$set": {"display_name": display_name, "updated_at": utc_now()}},
            )
        logger.info("User authenticated: %s (role: %s)", firebase_uid[:8], user["role"])

    user_out = UserOut(
        id=str(user["_id"]),
        firebase_uid=user["firebase_uid"],
        phone=_mask_phone(user.get("phone", "")),
        display_name=user.get("display_name", ""),
        role=user["role"],
        is_active=user.get("is_active", True),
        created_at=format_ist(user["created_at"]) if isinstance(user.get("created_at"), __import__("datetime").datetime) else None,
    )

    return {"success": True, "user": user_out, "is_new_user": is_new_user}


@router.get(
    "/me",
    summary="Get current authenticated user",
)
@limiter.limit(settings.AUTH_RATE_LIMIT)
async def get_me(
    request: Request,
    current_user: dict = Depends(get_current_user),
):
    """Return the current authenticated user's profile."""
    user_out = UserOut(
        id=str(current_user["_id"]),
        firebase_uid=current_user["firebase_uid"],
        phone=_mask_phone(current_user.get("phone", "")),
        display_name=current_user.get("display_name", ""),
        role=current_user["role"],
        is_active=current_user.get("is_active", True),
    )
    return ok(user_out)


def _mask_phone(phone: str) -> str:
    """Mask a phone number: +919876543210 → 98••••3210"""
    if not phone:
        return ""
    digits = "".join(c for c in phone if c.isdigit())
    if len(digits) >= 10:
        last10 = digits[-10:]
        return f"{last10[:2]}••••{last10[6:]}"
    return "••••••••••"
