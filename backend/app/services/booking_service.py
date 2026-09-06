"""
KisanSetu Backend — Booking Service

CRITICAL: Booking creation uses atomic MongoDB findOneAndUpdate to prevent
overbooking. Two farmers requesting the same slot simultaneously will never
both succeed — exactly one will get SLOT_FULL.

Idempotency: duplicate requests with the same X-Idempotency-Key return the
original booking (24h TTL on idempotency_keys collection).
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import (
    KisanSetuException, AppError, not_found, slot_full, slot_closed
)
from app.services.notification_service import create_notification
from app.utils.datetime_utils import slot_time_label, format_ist, utc_now
from app.utils.ids import generate_booking_reference

logger = logging.getLogger(__name__)
UTC = timezone.utc

CANCELLABLE_STATUSES = {"upcoming", "arrived"}
RESCHEDULABLE_STATUSES = {"upcoming"}


def _serialize_booking(doc: dict, centre_name: str = "", slot_time: str = "") -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["farmer_id"] = str(doc["farmer_id"])
    doc["centre_id"] = str(doc["centre_id"])
    doc["slot_id"] = str(doc["slot_id"])
    doc["centre_name"] = centre_name or doc.get("centre_name", "")
    doc["slot_time"] = slot_time or doc.get("slot_time", "")
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = format_ist(doc["created_at"])
    if isinstance(doc.get("updated_at"), datetime):
        doc["updated_at"] = format_ist(doc["updated_at"])
    if isinstance(doc.get("cancelled_at"), datetime):
        doc["cancelled_at"] = format_ist(doc["cancelled_at"])
    return doc


async def create_booking(
    db: AsyncIOMotorDatabase,
    farmer_id: str,
    user_id: str,
    centre_id: str,
    slot_id: str,
    commodity: str,
    quantity_quintals: float,
    notes: str | None = None,
    idempotency_key: str | None = None,
) -> dict:
    """
    Atomically create a booking and decrement slot availability.
    Returns the new booking document.
    """
    # ── Idempotency check ─────────────────────────────────────────────────────
    if idempotency_key:
        idem_doc = await db.idempotency_keys.find_one({"key": idempotency_key})
        if idem_doc:
            existing = await db.bookings.find_one({"_id": idem_doc["booking_id"]})
            if existing:
                logger.info("Idempotent booking returned for key %s", idempotency_key)
                return _serialize_booking(existing)

    # ── Conflict check: farmer must not already have an active booking ────────
    conflict = await db.bookings.find_one({
        "farmer_id": ObjectId(farmer_id),
        "status": {"$in": ["upcoming", "arrived", "processing"]},
    })
    if conflict:
        raise KisanSetuException(
            409, AppError.BOOKING_CONFLICT,
            "You already have an active booking. Cancel or complete it before booking again."
        )

    # ── Atomic slot decrement (anti-overbooking) ──────────────────────────────
    updated_slot = await db.slots.find_one_and_update(
        {
            "_id": ObjectId(slot_id),
            "status": {"$nin": ["closed", "full"]},
            "$expr": {"$lt": ["$booked", "$capacity"]},
        },
        {"$inc": {"booked": 1}, "$set": {"updated_at": utc_now()}},
        return_document=True,
    )

    if not updated_slot:
        # Slot either doesn't exist, is closed, or just became full
        slot_doc = await db.slots.find_one({"_id": ObjectId(slot_id)})
        if not slot_doc:
            raise not_found("Slot", AppError.SLOT_NOT_FOUND)
        if slot_doc.get("is_closed"):
            raise slot_closed()
        raise slot_full()

    # Recompute slot status and save
    booked = updated_slot["booked"]
    capacity = updated_slot["capacity"]
    new_status = "full" if booked >= capacity else ("limited" if booked >= capacity * 0.85 else "available")
    await db.slots.update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": {"status": new_status}},
    )

    # ── Fetch centre for display name ─────────────────────────────────────────
    centre = await db.centres.find_one({"_id": ObjectId(centre_id)}, {"name": 1})
    centre_name = centre["name"] if centre else ""

    # ── Create booking document ───────────────────────────────────────────────
    now = utc_now()
    slot_time = slot_time_label(updated_slot["start_time"], updated_slot["end_time"])

    booking = {
        "_id": ObjectId(),
        "booking_reference": generate_booking_reference(),
        "farmer_id": ObjectId(farmer_id),
        "user_id": user_id,
        "centre_id": ObjectId(centre_id),
        "centre_name": centre_name,
        "slot_id": ObjectId(slot_id),
        "slot_time": slot_time,
        "booking_date": updated_slot["date"],
        "commodity": commodity,
        "quantity_quintals": quantity_quintals,
        "notes": notes,
        "status": "upcoming",
        "created_at": now,
        "updated_at": now,
    }
    await db.bookings.insert_one(booking)

    # ── Idempotency key storage ───────────────────────────────────────────────
    if idempotency_key:
        await db.idempotency_keys.insert_one({
            "key": idempotency_key,
            "booking_id": booking["_id"],
            "created_at": now,
        })

    # ── Create confirmation notification for farmer ───────────────────────────
    await create_notification(
        db, user_id,
        title="Booking Confirmed ✓",
        message=f"Slot {slot_time} at {centre_name} on {updated_slot['date']}. Reference: {booking['booking_reference']}",
        notif_type="booking",
        action_url=f"/farmer/bookings",
    )

    return _serialize_booking(booking, centre_name, slot_time)


async def get_booking_by_id(
    db: AsyncIOMotorDatabase,
    booking_id: str,
    farmer_id: str | None = None,
) -> dict:
    """Get booking. If farmer_id provided, enforce ownership."""
    filt: dict = {"_id": ObjectId(booking_id)}
    if farmer_id:
        filt["farmer_id"] = ObjectId(farmer_id)
    doc = await db.bookings.find_one(filt)
    if not doc:
        raise not_found("Booking", AppError.BOOKING_NOT_FOUND)
    return _serialize_booking(doc)


async def get_farmer_bookings(
    db: AsyncIOMotorDatabase,
    farmer_id: str,
    status_filter: str | None = None,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[dict], int]:
    """Paginated booking history for a farmer."""
    filt: dict = {"farmer_id": ObjectId(farmer_id)}
    if status_filter == "upcoming":
        filt["status"] = {"$in": ["upcoming", "arrived", "processing"]}
    elif status_filter == "completed":
        filt["status"] = "completed"
    elif status_filter == "cancelled":
        filt["status"] = {"$in": ["cancelled", "no_show"]}

    total = await db.bookings.count_documents(filt)
    skip = (page - 1) * page_size
    cursor = db.bookings.find(filt).sort("created_at", -1).skip(skip).limit(page_size)
    docs = await cursor.to_list(length=page_size)
    return [_serialize_booking(d) for d in docs], total


async def cancel_booking(
    db: AsyncIOMotorDatabase,
    booking_id: str,
    farmer_id: str,
    reason: str | None = None,
) -> dict:
    """Cancel a booking and release slot capacity."""
    doc = await db.bookings.find_one({
        "_id": ObjectId(booking_id),
        "farmer_id": ObjectId(farmer_id),
    })
    if not doc:
        raise not_found("Booking", AppError.BOOKING_NOT_FOUND)

    if doc["status"] not in CANCELLABLE_STATUSES:
        raise KisanSetuException(
            409, AppError.BOOKING_NOT_CANCELLABLE,
            f"Cannot cancel a booking with status '{doc['status']}'."
        )

    now = utc_now()
    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"status": "cancelled", "cancelled_at": now, "cancel_reason": reason, "updated_at": now}},
    )
    # Release the slot capacity
    await db.slots.update_one(
        {"_id": doc["slot_id"]},
        {"$inc": {"booked": -1}, "$set": {"updated_at": now}},
    )
    # Recompute slot status
    slot = await db.slots.find_one({"_id": doc["slot_id"]})
    if slot:
        booked = max(0, slot["booked"])
        capacity = slot["capacity"]
        new_status = "available" if not slot.get("is_closed") else "closed"
        if not slot.get("is_closed"):
            new_status = "full" if booked >= capacity else ("limited" if booked >= capacity * 0.85 else "available")
        await db.slots.update_one({"_id": doc["slot_id"]}, {"$set": {"status": new_status}})

    return await get_booking_by_id(db, booking_id)


async def reschedule_booking(
    db: AsyncIOMotorDatabase,
    booking_id: str,
    farmer_id: str,
    new_slot_id: str,
) -> dict:
    """Atomically move a booking to a different slot."""
    doc = await db.bookings.find_one({
        "_id": ObjectId(booking_id),
        "farmer_id": ObjectId(farmer_id),
    })
    if not doc:
        raise not_found("Booking", AppError.BOOKING_NOT_FOUND)

    if doc["status"] not in RESCHEDULABLE_STATUSES:
        raise KisanSetuException(
            409, AppError.BOOKING_NOT_RESCHEDULABLE,
            f"Cannot reschedule a booking with status '{doc['status']}'."
        )

    # Atomic decrement on new slot
    updated_new_slot = await db.slots.find_one_and_update(
        {
            "_id": ObjectId(new_slot_id),
            "status": {"$nin": ["closed", "full"]},
            "$expr": {"$lt": ["$booked", "$capacity"]},
        },
        {"$inc": {"booked": 1}, "$set": {"updated_at": utc_now()}},
        return_document=True,
    )
    if not updated_new_slot:
        new_slot = await db.slots.find_one({"_id": ObjectId(new_slot_id)})
        if not new_slot:
            raise not_found("New slot", AppError.SLOT_NOT_FOUND)
        if new_slot.get("is_closed"):
            raise slot_closed()
        raise slot_full()

    # Release old slot
    now = utc_now()
    await db.slots.update_one(
        {"_id": doc["slot_id"]},
        {"$inc": {"booked": -1}, "$set": {"updated_at": now}},
    )

    new_slot_time = slot_time_label(updated_new_slot["start_time"], updated_new_slot["end_time"])
    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {
            "slot_id": ObjectId(new_slot_id),
            "slot_time": new_slot_time,
            "booking_date": updated_new_slot["date"],
            "updated_at": now,
        }},
    )
    return await get_booking_by_id(db, booking_id)
