"""
KisanSetu Backend — Dashboard Router
Aggregated data for both farmer and staff dashboards.
"""
from __future__ import annotations

from bson import ObjectId
from fastapi import APIRouter, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import not_found, AppError
from app.core.permissions import require_farmer, require_staff, get_staff_centre_id
from app.schemas import ok
from app.services import queue_service
from app.services import booking_service
from app.utils.datetime_utils import today_str_ist

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/farmer", summary="Farmer dashboard aggregated data")
@limiter.limit(settings.API_RATE_LIMIT)
async def farmer_dashboard(
    request: Request,
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Returns active booking + queue status + recent notifications in one call."""
    user_id = str(current_user["_id"])

    # Farmer profile
    farmer = await db.farmers.find_one({"user_id": user_id})
    if not farmer:
        raise not_found("Farmer profile", AppError.FARMER_NOT_FOUND)
    farmer["id"] = str(farmer.pop("_id"))

    # Active booking (upcoming, arrived, or processing)
    active_booking_doc = await db.bookings.find_one(
        {"user_id": user_id, "status": {"$in": ["upcoming", "arrived", "processing"]}},
        sort=[("created_at", -1)],
    )
    active_booking = None
    queue_entry = None

    if active_booking_doc:
        from app.utils.datetime_utils import format_ist
        import datetime
        active_booking = {
            "id": str(active_booking_doc["_id"]),
            "booking_reference": active_booking_doc.get("booking_reference", ""),
            "centre_name": active_booking_doc.get("centre_name", ""),
            "slot_time": active_booking_doc.get("slot_time", ""),
            "booking_date": active_booking_doc.get("booking_date", ""),
            "commodity": active_booking_doc.get("commodity", ""),
            "quantity_quintals": active_booking_doc.get("quantity_quintals", 0),
            "status": active_booking_doc.get("status", ""),
            "created_at": format_ist(active_booking_doc["created_at"]) if isinstance(active_booking_doc.get("created_at"), datetime.datetime) else "",
        }

        # Queue entry for this booking
        qe = await db.queue_entries.find_one(
            {"booking_id": active_booking_doc["_id"]}
        )
        if qe:
            qe["id"] = str(qe.pop("_id"))
            qe["centre_id"] = str(qe["centre_id"])
            qe["booking_id"] = str(qe["booking_id"])
            queue_entry = qe

    # Unread notification count
    unread_count = await db.notifications.count_documents(
        {"recipient_user_id": user_id, "read": False}
    )

    # Recent bookings count
    total_bookings = await db.bookings.count_documents({"user_id": user_id})

    return ok({
        "farmer": farmer,
        "active_booking": active_booking,
        "queue_entry": queue_entry,
        "unread_notifications": unread_count,
        "total_bookings": total_bookings,
    })


@router.get("/staff", summary="Staff operations dashboard aggregated data")
@limiter.limit(settings.API_RATE_LIMIT)
async def staff_dashboard(
    request: Request,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Returns full queue state + slot stats + today's metrics for the staff centre."""
    centre_id = await get_staff_centre_id(current_user, db)

    centre = await db.centres.find_one({"_id": ObjectId(centre_id)})
    centre_data = {"id": centre_id, "name": centre["name"] if centre else ""}

    # Queue state
    queue_state = await queue_service.get_queue_state(db, centre_id)

    # Today's slot summary
    today = today_str_ist()
    slots_cursor = db.slots.find({"centre_id": ObjectId(centre_id), "date": today})
    slots = await slots_cursor.to_list(length=50)
    total_slot_capacity = sum(s["capacity"] for s in slots)
    total_booked = sum(s["booked"] for s in slots)

    # Alerts (active count)
    active_alerts = await db.alerts.count_documents(
        {"centre_id": centre_id, "status": "active"}
    )

    return ok({
        "centre": centre_data,
        "queue": queue_state,
        "slots_today": {
            "total_slots": len(slots),
            "total_capacity": total_slot_capacity,
            "total_booked": total_booked,
            "available": max(0, total_slot_capacity - total_booked),
        },
        "active_alerts": active_alerts,
        "today_date": today,
    })
