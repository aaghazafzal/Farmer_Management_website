"""
KisanSetu Backend — Slot Service
Manages slot creation, status updates, and capacity adjustments.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import (
    KisanSetuException, AppError, not_found, slot_full, slot_closed
)
from app.utils.datetime_utils import slot_time_label
from app.utils.ids import generate_short_id

logger = logging.getLogger(__name__)
UTC = timezone.utc


def _compute_slot_status(booked: int, capacity: int, is_closed: bool) -> str:
    if is_closed:
        return "closed"
    if booked >= capacity:
        return "full"
    if booked >= capacity * 0.85:
        return "limited"
    return "available"


def _serialize_slot(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["centre_id"] = str(doc["centre_id"])
    doc["available"] = max(0, doc["capacity"] - doc["booked"])
    doc["time"] = slot_time_label(doc["start_time"], doc["end_time"])
    return doc


async def get_slots_for_centre(
    db: AsyncIOMotorDatabase,
    centre_id: str,
    date: str | None = None,
) -> list[dict]:
    """List all slots for a centre, optionally filtered by date."""
    filt: dict = {"centre_id": ObjectId(centre_id)}
    if date:
        filt["date"] = date
    cursor = db.slots.find(filt).sort("start_time", 1)
    docs = await cursor.to_list(length=200)
    return [_serialize_slot(d) for d in docs]


async def get_slot_by_id(db: AsyncIOMotorDatabase, slot_id: str) -> dict:
    doc = await db.slots.find_one({"_id": ObjectId(slot_id)})
    if not doc:
        raise not_found("Slot", AppError.SLOT_NOT_FOUND)
    return _serialize_slot(doc)


async def create_slot(
    db: AsyncIOMotorDatabase,
    centre_id: str,
    date: str,
    start_time: str,
    end_time: str,
    capacity: int,
    commodity: str,
    note: str | None = None,
) -> dict:
    """Create a new procurement slot. Checks for time overlap."""
    # Overlap check: no two slots on same centre+date with overlapping time
    overlap = await db.slots.find_one({
        "centre_id": ObjectId(centre_id),
        "date": date,
        "$or": [
            {"start_time": {"$lt": end_time}, "end_time": {"$gt": start_time}},
        ],
    })
    if overlap:
        raise KisanSetuException(
            409, AppError.SLOT_OVERLAP,
            f"A slot already exists that overlaps with {start_time}–{end_time} on {date}."
        )

    now = datetime.now(UTC)
    doc = {
        "_id": ObjectId(),
        "slot_ref": generate_short_id("SLT-", 6),
        "centre_id": ObjectId(centre_id),
        "date": date,
        "start_time": start_time,
        "end_time": end_time,
        "capacity": capacity,
        "booked": 0,
        "status": "available",
        "commodity": commodity,
        "note": note,
        "is_closed": False,
        "created_at": now,
        "updated_at": now,
    }
    await db.slots.insert_one(doc)
    return _serialize_slot(doc)


async def update_slot_capacity(
    db: AsyncIOMotorDatabase,
    slot_id: str,
    new_capacity: int,
) -> dict:
    """Adjust capacity — cannot set below already booked count."""
    slot = await db.slots.find_one({"_id": ObjectId(slot_id)})
    if not slot:
        raise not_found("Slot", AppError.SLOT_NOT_FOUND)

    if new_capacity < slot["booked"]:
        raise KisanSetuException(
            409, AppError.SLOT_CAPACITY_CONFLICT,
            f"Cannot set capacity to {new_capacity}: {slot['booked']} bookings already exist."
        )

    new_status = _compute_slot_status(slot["booked"], new_capacity, slot.get("is_closed", False))
    await db.slots.update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": {"capacity": new_capacity, "status": new_status, "updated_at": datetime.now(UTC)}},
    )
    return await get_slot_by_id(db, slot_id)


async def close_slot(db: AsyncIOMotorDatabase, slot_id: str) -> dict:
    await db.slots.update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": {"status": "closed", "is_closed": True, "updated_at": datetime.now(UTC)}},
    )
    return await get_slot_by_id(db, slot_id)


async def reopen_slot(db: AsyncIOMotorDatabase, slot_id: str) -> dict:
    slot = await db.slots.find_one({"_id": ObjectId(slot_id)})
    if not slot:
        raise not_found("Slot", AppError.SLOT_NOT_FOUND)
    new_status = _compute_slot_status(slot["booked"], slot["capacity"], False)
    await db.slots.update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": {"status": new_status, "is_closed": False, "updated_at": datetime.now(UTC)}},
    )
    return await get_slot_by_id(db, slot_id)
