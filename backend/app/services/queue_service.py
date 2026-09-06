"""
KisanSetu Backend — Queue Service

Queue State Machine (enforced server-side):
  WAITING → ARRIVED → PROCESSING → COMPLETED
  PROCESSING → DELAYED → PROCESSING
  ARRIVED → PROCESSING (bypass WAITING sequence)
  WAITING | ARRIVED → CANCELLED

Any other transition raises INVALID_QUEUE_TRANSITION.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import (
    KisanSetuException, AppError, not_found, invalid_queue_transition
)
from app.services.notification_service import create_notification
from app.utils.datetime_utils import format_ist, utc_now, IST

logger = logging.getLogger(__name__)
UTC = timezone.utc

# Valid transitions map: from → set of allowed to
VALID_TRANSITIONS: dict[str, set[str]] = {
    "waiting":    {"arrived", "processing", "cancelled"},
    "arrived":    {"processing", "cancelled"},
    "processing": {"delayed", "completed"},
    "delayed":    {"processing", "completed"},
    "completed":  set(),  # Terminal
    "cancelled":  set(),  # Terminal
}


def _time_ist() -> str:
    return datetime.now(IST).strftime("%I:%M %p")


def _serialize_entry(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["centre_id"] = str(doc["centre_id"])
    doc["booking_id"] = str(doc["booking_id"])
    if isinstance(doc.get("arrived_at"), datetime):
        doc["arrived_at"] = format_ist(doc["arrived_at"])
    if isinstance(doc.get("processing_started_at"), datetime):
        doc["processing_started_at"] = format_ist(doc["processing_started_at"])
    return doc


async def get_queue_state(
    db: AsyncIOMotorDatabase,
    centre_id: str,
) -> dict:
    """Return full live queue state for a centre."""
    filt = {"centre_id": ObjectId(centre_id)}
    cursor = db.queue_entries.find(filt).sort("queue_number", 1)
    entries = await cursor.to_list(length=500)
    serialized = [_serialize_entry(e) for e in entries]

    active = [e for e in serialized if e["status"] not in ("completed", "cancelled")]
    processing = [e for e in serialized if e["status"] == "processing"]
    delayed = [e for e in serialized if e["status"] == "delayed"]
    completed_today = await db.queue_entries.count_documents(
        {"centre_id": ObjectId(centre_id), "status": "completed"}
    )

    now_serving = processing[0]["token"] if processing else None

    return {
        "centre_id": centre_id,
        "entries": serialized,
        "active_count": len(active),
        "processing_count": len(processing),
        "delayed_count": len(delayed),
        "completed_today": completed_today,
        "now_serving_token": now_serving,
        "last_updated": _time_ist(),
    }


async def update_queue_status(
    db: AsyncIOMotorDatabase,
    entry_id: str,
    new_status: str,
    actor_id: str,
    actor_name: str,
    centre_id: str,
    weighbridge_bay: str | None = None,
) -> dict:
    """Transition a queue entry to a new status with validation."""
    entry = await db.queue_entries.find_one({"_id": ObjectId(entry_id)})
    if not entry:
        raise not_found("Queue entry", AppError.QUEUE_NOT_FOUND)

    current_status = entry["status"]
    allowed = VALID_TRANSITIONS.get(current_status, set())

    if new_status not in allowed:
        raise invalid_queue_transition(current_status, new_status)

    # Guard: only one processing entry at a time
    if new_status == "processing":
        existing_processing = await db.queue_entries.find_one({
            "centre_id": ObjectId(centre_id),
            "status": "processing",
            "_id": {"$ne": ObjectId(entry_id)},
        })
        if existing_processing:
            raise KisanSetuException(
                409, AppError.QUEUE_ALREADY_PROCESSING,
                f"Token #{existing_processing['queue_number']:02d} is already processing. Complete or delay it first."
            )

    now = utc_now()
    update_fields: dict = {"status": new_status, "updated_at": now}

    if new_status == "arrived" and not entry.get("arrived_at"):
        update_fields["arrived_at"] = now
    if new_status == "processing":
        update_fields["processing_started_at"] = now
        if weighbridge_bay:
            update_fields["weighbridge_bay"] = weighbridge_bay
    if new_status == "completed":
        update_fields["completed_at"] = now
        # Update linked booking status
        await db.bookings.update_one(
            {"_id": entry["booking_id"]},
            {"$set": {"status": "completed", "updated_at": now}},
        )

    await db.queue_entries.update_one(
        {"_id": ObjectId(entry_id)},
        {"$set": update_fields},
    )

    # Notify farmer if status is meaningful to them
    if new_status in ("processing", "completed"):
        booking = await db.bookings.find_one({"_id": entry["booking_id"]})
        if booking:
            user_id = booking.get("user_id")
            if user_id:
                if new_status == "processing":
                    await create_notification(
                        db, user_id,
                        title="Your Procurement Has Started 🌾",
                        message=f"Token {entry['token']} is now being processed{(' at ' + weighbridge_bay) if weighbridge_bay else ''}.",
                        notif_type="queue",
                    )
                elif new_status == "completed":
                    await create_notification(
                        db, user_id,
                        title="Procurement Completed ✓",
                        message=f"Your produce (Token {entry['token']}) has been successfully procured. Receipt is being generated.",
                        notif_type="procurement",
                    )

    updated = await db.queue_entries.find_one({"_id": ObjectId(entry_id)})
    return _serialize_entry(updated)


async def mark_delayed(
    db: AsyncIOMotorDatabase,
    entry_id: str,
    reason: str,
    actor_id: str,
    actor_name: str,
    centre_id: str,
) -> dict:
    """Mark a processing queue entry as delayed with a reason."""
    entry = await db.queue_entries.find_one({"_id": ObjectId(entry_id)})
    if not entry:
        raise not_found("Queue entry", AppError.QUEUE_NOT_FOUND)

    if entry["status"] not in ("processing", "arrived", "waiting"):
        raise invalid_queue_transition(entry["status"], "delayed")

    now = utc_now()
    await db.queue_entries.update_one(
        {"_id": ObjectId(entry_id)},
        {"$set": {"status": "delayed", "delay_reason": reason, "updated_at": now}},
    )

    # Notify farmer
    booking = await db.bookings.find_one({"_id": entry["booking_id"]})
    if booking and booking.get("user_id"):
        await create_notification(
            db, booking["user_id"],
            title="Delay Notice",
            message=f"Your queue token {entry['token']} has been delayed. Reason: {reason}",
            notif_type="queue",
        )

    updated = await db.queue_entries.find_one({"_id": ObjectId(entry_id)})
    return _serialize_entry(updated)


async def call_next_token(
    db: AsyncIOMotorDatabase,
    centre_id: str,
    actor_id: str,
    actor_name: str,
) -> dict | None:
    """
    Advance queue: find the next WAITING or ARRIVED entry and move to PROCESSING.
    Returns None if queue is empty.
    """
    # Ensure nothing is already processing
    current = await db.queue_entries.find_one({
        "centre_id": ObjectId(centre_id),
        "status": "processing",
    })
    if current:
        raise KisanSetuException(
            409, AppError.QUEUE_ALREADY_PROCESSING,
            f"Token #{current['queue_number']:02d} is already in processing. Complete it before calling next."
        )

    # Find next by queue_number order
    next_entry = await db.queue_entries.find_one(
        {"centre_id": ObjectId(centre_id), "status": {"$in": ["arrived", "waiting"]}},
        sort=[("queue_number", 1)],
    )
    if not next_entry:
        return None

    return await update_queue_status(
        db, str(next_entry["_id"]), "processing",
        actor_id=actor_id, actor_name=actor_name, centre_id=centre_id,
    )


async def calculate_estimated_wait(
    db: AsyncIOMotorDatabase,
    centre_id: str,
    queue_number: int,
    avg_processing_minutes: int = 12,
) -> str:
    """Estimate wait time for a given queue number based on entries ahead."""
    ahead = await db.queue_entries.count_documents({
        "centre_id": ObjectId(centre_id),
        "queue_number": {"$lt": queue_number},
        "status": {"$in": ["waiting", "arrived", "processing", "delayed"]},
    })
    total_minutes = ahead * avg_processing_minutes
    if total_minutes < 1:
        return "Your turn soon"
    if total_minutes < 60:
        return f"~{total_minutes} min"
    hours = total_minutes // 60
    mins = total_minutes % 60
    return f"~{hours}h {mins}m" if mins else f"~{hours}h"
