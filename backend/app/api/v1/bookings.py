"""
KisanSetu Backend — Bookings Router
Farmer creates, views, cancels, and reschedules bookings.
"""
from __future__ import annotations

import logging
from typing import Optional

from fastapi import APIRouter, Depends, Header, Query, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import not_found, forbidden, AppError
from app.core.permissions import require_farmer, get_current_user
from app.schemas import ok
from app.schemas.booking import BookingCreateRequest, BookingCancelRequest, BookingRescheduleRequest
from app.services import booking_service
from app.utils.pagination import PaginationParams

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/bookings", tags=["Bookings"])


async def _get_farmer_id(current_user: dict, db: AsyncIOMotorDatabase) -> str:
    farmer = await db.farmers.find_one({"user_id": str(current_user["_id"])})
    if not farmer:
        raise not_found("Farmer profile", AppError.FARMER_NOT_FOUND)
    return str(farmer["_id"])


@router.post("", summary="Create a new booking (atomic, idempotent)")
@limiter.limit(settings.BOOKING_RATE_LIMIT)
async def create_booking(
    request: Request,
    body: BookingCreateRequest,
    x_idempotency_key: Optional[str] = Header(None, alias="X-Idempotency-Key"),
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """
    Atomically create a booking. Uses MongoDB findOneAndUpdate to prevent
    overbooking even under concurrent requests.

    Supports X-Idempotency-Key header for mobile network retry safety.
    Rate limited: 10 requests per minute per IP.
    """
    farmer_id = await _get_farmer_id(current_user, db)
    booking = await booking_service.create_booking(
        db,
        farmer_id=farmer_id,
        user_id=str(current_user["_id"]),
        centre_id=body.centre_id,
        slot_id=body.slot_id,
        commodity=body.commodity,
        quantity_quintals=body.quantity_quintals,
        notes=body.notes,
        idempotency_key=x_idempotency_key,
    )
    return ok(booking, "Booking confirmed successfully.")


@router.get("/{booking_id}", summary="Get booking detail")
async def get_booking(
    booking_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Farmers can only view their own bookings. Staff can view any."""
    from app.core.permissions import Role
    farmer_id = None
    if current_user.get("role") == Role.FARMER:
        farmer_id = await _get_farmer_id(current_user, db)

    booking = await booking_service.get_booking_by_id(db, booking_id, farmer_id=farmer_id)
    return ok(booking)


@router.post("/{booking_id}/cancel", summary="Cancel a booking")
async def cancel_booking(
    booking_id: str,
    body: BookingCancelRequest,
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    farmer_id = await _get_farmer_id(current_user, db)
    booking = await booking_service.cancel_booking(
        db, booking_id, farmer_id=farmer_id, reason=body.reason
    )
    return ok(booking, "Booking cancelled.")


@router.patch("/{booking_id}/reschedule", summary="Reschedule to a different slot")
async def reschedule_booking(
    booking_id: str,
    body: BookingRescheduleRequest,
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    farmer_id = await _get_farmer_id(current_user, db)
    booking = await booking_service.reschedule_booking(
        db, booking_id, farmer_id=farmer_id, new_slot_id=body.new_slot_id
    )
    return ok(booking, "Booking rescheduled.")
