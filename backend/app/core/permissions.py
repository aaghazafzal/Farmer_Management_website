"""
KisanSetu Backend — Role-Based Access Control & Centre Access Guards

Rules:
- Role is read from the database user document, NEVER from request body or token claims.
- Centre staff can only access data for their assigned centre.
- Farmers can only access their own bookings, queue, and procurement data.
- Every permission violation returns 403 with FORBIDDEN error code.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.core.exceptions import forbidden, auth_required, AppError, KisanSetuException
from app.core.security import get_firebase_uid

logger = logging.getLogger(__name__)

# ─── Role constants ────────────────────────────────────────────────────────────

class Role:
    FARMER = "FARMER"
    CENTRE_STAFF = "CENTRE_STAFF"
    CENTRE_MANAGER = "CENTRE_MANAGER"
    ADMIN = "ADMIN"

    STAFF_ROLES = {CENTRE_STAFF, CENTRE_MANAGER, ADMIN}
    MANAGER_ROLES = {CENTRE_MANAGER, ADMIN}


# ─── Current user dependency ───────────────────────────────────────────────────

async def get_current_user(
    firebase_uid: str = Depends(get_firebase_uid),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> dict:
    """
    Load the full user document from MongoDB using the Firebase UID.
    Role is authoritative from the database — never from token claims.
    Raises 401 if user not found, 403 if inactive.
    """
    user = await db.users.find_one({"firebase_uid": firebase_uid})
    if not user:
        raise KisanSetuException(
            401, AppError.AUTH_INVALID,
            "Authenticated user not registered in this system."
        )
    if not user.get("is_active", True):
        raise KisanSetuException(
            403, AppError.INACTIVE_USER,
            "This account has been deactivated. Contact support."
        )
    return user


# ─── Role guards ──────────────────────────────────────────────────────────────

async def require_farmer(current_user: dict = Depends(get_current_user)) -> dict:
    """Require FARMER role."""
    if current_user.get("role") != Role.FARMER:
        raise forbidden("This endpoint is for farmers only.")
    return current_user


async def require_staff(current_user: dict = Depends(get_current_user)) -> dict:
    """Require CENTRE_STAFF, CENTRE_MANAGER, or ADMIN role."""
    if current_user.get("role") not in Role.STAFF_ROLES:
        raise forbidden("This endpoint is for procurement centre staff only.")
    return current_user


async def require_manager(current_user: dict = Depends(get_current_user)) -> dict:
    """Require CENTRE_MANAGER or ADMIN role."""
    if current_user.get("role") not in Role.MANAGER_ROLES:
        raise forbidden("Centre manager or admin privileges required.")
    return current_user


async def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """Require ADMIN role."""
    if current_user.get("role") != Role.ADMIN:
        raise forbidden("Admin privileges required.")
    return current_user


# ─── Centre access guard ──────────────────────────────────────────────────────

def get_centre_access_checker(centre_id_param: str = "centre_id"):
    """
    Dependency factory: creates a guard that verifies the authenticated staff
    member is assigned to the requested centre (or is ADMIN).

    Usage:
        @router.get("/centres/{centre_id}/queue")
        async def get_queue(
            centre_id: str,
            staff=Depends(get_centre_access_checker("centre_id")),
            db=Depends(get_db),
        ): ...
    """
    async def _check(
        centre_id: str,
        current_user: dict = Depends(require_staff),
        db: AsyncIOMotorDatabase = Depends(get_db),
    ) -> dict:
        if current_user.get("role") == Role.ADMIN:
            return current_user

        staff_record = await db.staff.find_one(
            {"user_id": str(current_user["_id"]), "is_active": True}
        )
        if not staff_record:
            raise forbidden("Staff record not found for your account.")

        if str(staff_record.get("centre_id")) != str(centre_id):
            raise KisanSetuException(
                403,
                AppError.CENTRE_ACCESS_DENIED,
                "You do not have access to this procurement centre.",
            )
        return current_user

    return _check


async def get_staff_centre_id(
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
) -> str:
    """Return the centre_id that the authenticated staff member is assigned to."""
    if current_user.get("role") == Role.ADMIN:
        return "__admin__"

    staff_record = await db.staff.find_one(
        {"user_id": str(current_user["_id"]), "is_active": True}
    )
    if not staff_record:
        raise forbidden("No active staff assignment found for your account.")
    return str(staff_record["centre_id"])
