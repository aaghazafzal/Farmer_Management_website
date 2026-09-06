"""
KisanSetu Backend — Procurement Service

Procurement State Machine:
  WAITING → IN_PROGRESS → VERIFICATION → COMPLETED
  IN_PROGRESS → DELAYED → IN_PROGRESS
  Any → REJECTED (manager only)
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import not_found, AppError, invalid_procurement_transition
from app.utils.datetime_utils import format_ist, utc_now

logger = logging.getLogger(__name__)

VALID_PROC_TRANSITIONS: dict[str, set[str]] = {
    "waiting":     {"in_progress"},
    "in_progress": {"verification", "delayed", "rejected"},
    "verification": {"completed", "in_progress", "delayed"},
    "delayed":     {"in_progress", "rejected"},
    "completed":   set(),   # Terminal
    "rejected":    set(),   # Terminal
}


def _serialize_proc(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["booking_id"] = str(doc["booking_id"])
    doc["farmer_id"] = str(doc["farmer_id"])
    doc["centre_id"] = str(doc["centre_id"])
    for field in ("started_at", "completed_at", "created_at"):
        if isinstance(doc.get(field), datetime):
            doc[field] = format_ist(doc[field])
    return doc


async def get_procurement_by_id(
    db: AsyncIOMotorDatabase, procurement_id: str
) -> dict:
    doc = await db.procurements.find_one({"_id": ObjectId(procurement_id)})
    if not doc:
        raise not_found("Procurement record", AppError.PROCUREMENT_NOT_FOUND)

    history_cursor = db.procurement_history.find(
        {"procurement_id": ObjectId(procurement_id)}
    ).sort("timestamp", 1)
    history = await history_cursor.to_list(length=100)
    doc["history"] = [
        {
            "timestamp": format_ist(h["timestamp"]) if isinstance(h["timestamp"], datetime) else h["timestamp"],
            "status": h["status"],
            "staff_name": h["staff_name"],
            "note": h.get("note"),
        }
        for h in history
    ]
    return _serialize_proc(doc)


async def get_procurement_by_booking(
    db: AsyncIOMotorDatabase, booking_id: str
) -> dict | None:
    doc = await db.procurements.find_one({"booking_id": ObjectId(booking_id)})
    if not doc:
        return None
    return await get_procurement_by_id(db, str(doc["_id"]))


async def update_procurement_status(
    db: AsyncIOMotorDatabase,
    procurement_id: str,
    new_status: str,
    staff_name: str,
    actor_id: str,
    note: str | None = None,
    weighbridge_bay: str | None = None,
) -> dict:
    doc = await db.procurements.find_one({"_id": ObjectId(procurement_id)})
    if not doc:
        raise not_found("Procurement record", AppError.PROCUREMENT_NOT_FOUND)

    current = doc["status"]
    allowed = VALID_PROC_TRANSITIONS.get(current, set())
    if new_status not in allowed:
        raise invalid_procurement_transition(current, new_status)

    now = utc_now()
    update_fields: dict = {"status": new_status, "updated_at": now}

    if new_status == "in_progress" and not doc.get("started_at"):
        update_fields["started_at"] = now
    if new_status == "completed":
        update_fields["completed_at"] = now
        # Mark linked booking as completed
        await db.bookings.update_one(
            {"_id": doc["booking_id"]},
            {"$set": {"status": "completed", "updated_at": now}},
        )
    if weighbridge_bay:
        update_fields["weighbridge_bay"] = weighbridge_bay

    await db.procurements.update_one(
        {"_id": ObjectId(procurement_id)},
        {"$set": update_fields},
    )

    # Append history
    await db.procurement_history.insert_one({
        "_id": ObjectId(),
        "procurement_id": ObjectId(procurement_id),
        "status": new_status,
        "staff_name": staff_name,
        "actor_id": actor_id,
        "note": note,
        "timestamp": now,
    })

    return await get_procurement_by_id(db, procurement_id)


async def update_procurement_details(
    db: AsyncIOMotorDatabase,
    procurement_id: str,
    weight_measured: float | None = None,
    moisture_percent: float | None = None,
    grade: str | None = None,
    delay_reason: str | None = None,
) -> dict:
    update_fields: dict = {"updated_at": utc_now()}
    if weight_measured is not None:
        update_fields["weight_measured"] = weight_measured
    if moisture_percent is not None:
        update_fields["moisture_percent"] = moisture_percent
    if grade is not None:
        update_fields["grade"] = grade
    if delay_reason is not None:
        update_fields["delay_reason"] = delay_reason

    await db.procurements.update_one(
        {"_id": ObjectId(procurement_id)},
        {"$set": update_fields},
    )
    return await get_procurement_by_id(db, procurement_id)
