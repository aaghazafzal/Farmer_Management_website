"""
KisanSetu Backend — Alert Service
Manages centre broadcast alerts with lifecycle and reach tracking.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.exceptions import not_found, AppError
from app.utils.ids import generate_alert_id
from app.utils.datetime_utils import utc_now, format_ist, IST

logger = logging.getLogger(__name__)


def _serialize_alert(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["centre_id"] = str(doc["centre_id"])
    if isinstance(doc.get("created_at"), datetime):
        ist_dt = doc["created_at"].astimezone(IST)
        doc["timestamp"] = ist_dt.strftime("%I:%M %p")
        doc["created_at"] = format_ist(doc["created_at"])
    return doc


async def create_alert(
    db: AsyncIOMotorDatabase,
    centre_id: str,
    alert_type: str,
    title: str,
    message: str,
    audience: str,
    created_by_name: str,
    actor_id: str,
) -> dict:
    """Create and broadcast a new centre alert."""
    # Estimate reach: number of active bookings for this centre
    reach = await db.bookings.count_documents({
        "centre_id": ObjectId(centre_id),
        "status": {"$in": ["upcoming", "arrived", "processing"]},
    })

    now = utc_now()
    doc = {
        "_id": ObjectId(),
        "alert_id": generate_alert_id(),
        "centre_id": ObjectId(centre_id),
        "type": alert_type,
        "title": title,
        "message": message,
        "audience": audience,
        "status": "active",
        "reach": reach,
        "created_by": created_by_name,
        "actor_id": actor_id,
        "created_at": now,
    }
    await db.alerts.insert_one(doc)
    return _serialize_alert(doc)


async def get_alerts(
    db: AsyncIOMotorDatabase,
    centre_id: str | None = None,
    limit: int = 30,
) -> list[dict]:
    """Get alerts for a centre (or all centres if admin), newest first."""
    query = {}
    if centre_id and centre_id != "__admin__" and ObjectId.is_valid(centre_id):
        query["centre_id"] = ObjectId(centre_id)
    cursor = db.alerts.find(query).sort("created_at", -1).limit(limit)
    docs = await cursor.to_list(length=limit)
    return [_serialize_alert(d) for d in docs]


async def cancel_alert(
    db: AsyncIOMotorDatabase,
    alert_id: str,
    centre_id: str,
) -> dict:
    doc = await db.alerts.find_one({
        "_id": ObjectId(alert_id),
        "centre_id": ObjectId(centre_id),
    })
    if not doc:
        raise not_found("Alert", AppError.ALERT_NOT_FOUND)

    await db.alerts.update_one(
        {"_id": ObjectId(alert_id)},
        {"$set": {"status": "cancelled", "updated_at": utc_now()}},
    )
    updated = await db.alerts.find_one({"_id": ObjectId(alert_id)})
    return _serialize_alert(updated)
