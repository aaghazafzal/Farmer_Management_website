"""
KisanSetu Backend — Audit Log Service
Every significant action by staff is recorded here for the Reports & Audit view.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.utils.ids import generate_short_id
from app.utils.datetime_utils import IST

logger = logging.getLogger(__name__)
UTC = timezone.utc


async def add_audit_log(
    db: AsyncIOMotorDatabase,
    actor_id: str,
    actor_name: str,
    centre_id: str,
    action: str,
    details: str | None = None,
    entity_type: str | None = None,
    entity_id: str | None = None,
) -> None:
    """
    Insert a structured audit log entry.
    Called from services, never directly from route handlers.
    """
    try:
        now = datetime.now(UTC)
        entry = {
            "_id": ObjectId(),
            "log_id": generate_short_id("LOG-", 6),
            "actor_id": actor_id,
            "actor_name": actor_name,
            "centre_id": centre_id,
            "action": action,
            "details": details,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "timestamp": now,
            "time_ist": now.astimezone(IST).strftime("%I:%M %p"),
        }
        await db.audit_logs.insert_one(entry)
    except Exception:
        # Audit logging must NEVER crash the main operation
        logger.exception("Failed to write audit log: %s", action)


async def get_audit_logs(
    db: AsyncIOMotorDatabase,
    centre_id: str | None = None,
    limit: int = 50,
    skip: int = 0,
) -> list[dict]:
    """Retrieve audit logs for a centre (or all if admin), newest first."""
    query = {}
    if centre_id and centre_id != "__admin__":
        query["centre_id"] = centre_id
    cursor = db.audit_logs.find(
        query,
        {"_id": 0, "log_id": 1, "actor_name": 1, "action": 1, "details": 1, "time_ist": 1, "timestamp": 1, "entity_type": 1, "entity_id": 1},
    ).sort("timestamp", -1).skip(skip).limit(limit)
    return await cursor.to_list(length=limit)
