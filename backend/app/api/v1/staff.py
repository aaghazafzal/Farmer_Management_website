"""
KisanSetu Backend — Staff Directory Router
Staff-side farmer record lookup with masked phone numbers.
"""
from __future__ import annotations

from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, Query, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import not_found, AppError
from app.core.permissions import require_staff, require_manager, get_staff_centre_id
from app.schemas import ok

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/staff", tags=["Staff"])


@router.get("/farmers", summary="Staff farmer directory with search")
@limiter.limit(settings.API_RATE_LIMIT)
async def list_farmers(
    request: Request,
    search: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Returns farmers with active queue entries at the staff's centre.
    Phone numbers are always masked. Staff cannot see full phone numbers."""
    centre_id = await get_staff_centre_id(current_user, db)

    # Get active queue entries for this centre
    q_filt: dict = {"centre_id": ObjectId(centre_id)}
    if status and status != "all":
        q_filt["status"] = status

    queue_entries = await db.queue_entries.find(q_filt).sort("queue_number", 1).to_list(200)

    # Augment with farmer info from bookings
    results = []
    for entry in queue_entries:
        booking = await db.bookings.find_one({"_id": entry["booking_id"]})
        if not booking:
            continue
        farmer = await db.farmers.find_one({"_id": booking["farmer_id"]})
        if not farmer:
            continue

        # Apply search filter
        if search:
            q = search.lower()
            name_match = q in farmer.get("name", "").lower()
            ref_match = q in farmer.get("farmer_reference", "").lower()
            village_match = q in farmer.get("village", "").lower()
            token_match = q in entry.get("token", "").lower()
            booking_match = q in booking.get("booking_reference", "").lower()
            if not any([name_match, ref_match, village_match, token_match, booking_match]):
                continue

        results.append({
            "id": str(farmer["_id"]),
            "reference": farmer.get("farmer_reference", ""),
            "name": farmer.get("name", ""),
            "phone_masked": farmer.get("phone_masked", "••••••••••"),
            "village": farmer.get("village", ""),
            "current_booking_id": str(booking["_id"]),
            "booking_reference": booking.get("booking_reference", ""),
            "queue_number": entry.get("token", ""),
            "commodity": booking.get("commodity", ""),
            "quantity": f"{booking.get('quantity_quintals', 0)} quintals",
            "status": entry.get("status", ""),
            "total_deliveries": farmer.get("total_deliveries", 0),
            "land_area": farmer.get("land_area", ""),
        })

    return ok(results)


@router.get("/members", summary="Staff member list for this centre")
async def list_staff_members(
    current_user: dict = Depends(require_manager),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    centre_id = await get_staff_centre_id(current_user, db)
    from bson import ObjectId
    members_cursor = db.staff.find(
        {"centre_id": centre_id, "is_active": True},
        {"_id": 1, "user_id": 1, "role": 1, "staff_id": 1, "joined_at": 1},
    )
    members = await members_cursor.to_list(100)
    results = []
    for m in members:
        user = await db.users.find_one({"_id": ObjectId(m["user_id"])}, {"display_name": 1, "phone": 1})
        results.append({
            "id": str(m["_id"]),
            "user_id": m["user_id"],
            "name": user.get("display_name", "") if user else "",
            "staff_id": m.get("staff_id", ""),
            "role": m.get("role", ""),
        })
    return ok(results)
