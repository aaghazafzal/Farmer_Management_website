"""
KisanSetu Backend — Notification Service
Creates per-farmer notifications for booking confirmations, queue updates, etc.
"""
from __future__ import annotations

import logging
from datetime import datetime, timezone

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.utils.ids import generate_short_id

logger = logging.getLogger(__name__)
UTC = timezone.utc


async def create_notification(
    db: AsyncIOMotorDatabase,
    recipient_user_id: str,
    title: str,
    message: str,
    notif_type: str = "general",
    action_url: str | None = None,
) -> None:
    """Create a single notification for one user."""
    try:
        now = datetime.now(UTC)
        await db.notifications.insert_one({
            "_id": ObjectId(),
            "notif_id": generate_short_id("N-", 8),
            "recipient_user_id": recipient_user_id,
            "title": title,
            "message": message,
            "type": notif_type,
            "read": False,
            "action_url": action_url,
            "created_at": now,
        })
    except Exception:
        logger.exception("Failed to create notification for user %s", recipient_user_id)


async def get_notifications(
    db: AsyncIOMotorDatabase,
    user_id: str,
    page: int = 1,
    page_size: int = 20,
) -> tuple[list[dict], int]:
    """Return paginated notifications for a user, newest first."""
    filt = {"recipient_user_id": user_id}
    total = await db.notifications.count_documents(filt)
    skip = (page - 1) * page_size
    cursor = db.notifications.find(filt).sort("created_at", -1).skip(skip).limit(page_size)
    docs = await cursor.to_list(length=page_size)
    return docs, total


async def mark_read(db: AsyncIOMotorDatabase, notif_id: str, user_id: str) -> bool:
    res = await db.notifications.update_one(
        {"notif_id": notif_id, "recipient_user_id": user_id},
        {"$set": {"read": True}},
    )
    return res.modified_count > 0


async def mark_all_read(db: AsyncIOMotorDatabase, user_id: str) -> int:
    res = await db.notifications.update_many(
        {"recipient_user_id": user_id, "read": False},
        {"$set": {"read": True}},
    )
    return res.modified_count
