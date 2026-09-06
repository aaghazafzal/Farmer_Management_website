"""
KisanSetu Backend — Async MongoDB Client
Uses Motor (async driver) for non-blocking database access.
"""
from __future__ import annotations

import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.core.config import settings

logger = logging.getLogger(__name__)

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


async def connect_db() -> None:
    """Initialize the MongoDB connection pool on application startup."""
    global _client, _db
    try:
        _client = AsyncIOMotorClient(
            settings.DATABASE_URL,
            serverSelectionTimeoutMS=5000,
            maxPoolSize=50,
            minPoolSize=5,
        )
        # Verify the connection is alive
        await _client.admin.command("ping")
        _db = _client[settings.DATABASE_NAME]
        logger.info(
            "MongoDB connected — database: %s", settings.DATABASE_NAME
        )
        await _create_indexes()
    except (ConnectionFailure, ServerSelectionTimeoutError) as exc:
        logger.error("MongoDB connection failed: %s", exc)
        raise


async def disconnect_db() -> None:
    """Close the MongoDB connection pool on application shutdown."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
        logger.info("MongoDB connection closed")


def get_db() -> AsyncIOMotorDatabase:
    """Return the active database instance. Raises if not connected."""
    if _db is None:
        raise RuntimeError("Database not initialised. Call connect_db() first.")
    return _db


get_database = get_db


async def ping_db() -> bool:
    """Return True if the database is reachable."""
    try:
        client = _client or AsyncIOMotorClient(
            settings.DATABASE_URL, serverSelectionTimeoutMS=3000
        )
        await client.admin.command("ping")
        return True
    except Exception:
        return False


async def _create_indexes() -> None:
    """Create all required MongoDB indexes for performance and correctness."""
    db = get_db()

    # ── users ────────────────────────────────────────────────────
    await db.users.create_index("firebase_uid", unique=True)
    await db.users.create_index("phone")
    await db.users.create_index("role")

    # ── farmers ─────────────────────────────────────────────────
    await db.farmers.create_index("user_id")
    await db.farmers.create_index("farmer_reference", unique=True)
    await db.farmers.create_index("phone")
    await db.farmers.create_index([("district", ASCENDING), ("state", ASCENDING)])

    # ── staff ───────────────────────────────────────────────────
    await db.staff.create_index("user_id")
    await db.staff.create_index("centre_id")
    await db.staff.create_index([("centre_id", ASCENDING), ("is_active", ASCENDING)])

    # ── centres ─────────────────────────────────────────────────
    await db.centres.create_index("code", unique=True)
    await db.centres.create_index("district")
    await db.centres.create_index("status")
    await db.centres.create_index(
        [("latitude", ASCENDING), ("longitude", ASCENDING)]
    )

    # ── slots ────────────────────────────────────────────────────
    await db.slots.create_index(
        [("centre_id", ASCENDING), ("date", ASCENDING), ("start_time", ASCENDING)]
    )
    await db.slots.create_index([("centre_id", ASCENDING), ("status", ASCENDING)])

    # ── bookings ─────────────────────────────────────────────────
    await db.bookings.create_index("farmer_id")
    await db.bookings.create_index("centre_id")
    await db.bookings.create_index("slot_id")
    await db.bookings.create_index("booking_reference", unique=True)
    await db.bookings.create_index([("status", ASCENDING), ("booking_date", DESCENDING)])
    await db.bookings.create_index("idempotency_key", sparse=True)

    # ── queue_entries ────────────────────────────────────────────
    await db.queue_entries.create_index(
        [("centre_id", ASCENDING), ("queue_number", ASCENDING)],
        unique=True,
    )
    await db.queue_entries.create_index("booking_id", unique=True)
    await db.queue_entries.create_index([("centre_id", ASCENDING), ("status", ASCENDING)])

    # ── procurements ─────────────────────────────────────────────
    await db.procurements.create_index("booking_id", unique=True)
    await db.procurements.create_index("centre_id")
    await db.procurements.create_index("farmer_id")
    await db.procurements.create_index("status")

    # ── procurement_history ──────────────────────────────────────
    await db.procurement_history.create_index("procurement_id")
    await db.procurement_history.create_index("timestamp")

    # ── notifications ────────────────────────────────────────────
    await db.notifications.create_index(
        [("recipient_user_id", ASCENDING), ("created_at", DESCENDING)]
    )
    await db.notifications.create_index("read")

    # ── alerts ───────────────────────────────────────────────────
    await db.alerts.create_index([("centre_id", ASCENDING), ("status", ASCENDING)])
    await db.alerts.create_index("created_at")

    # ── audit_logs ───────────────────────────────────────────────
    await db.audit_logs.create_index([("entity_id", ASCENDING), ("timestamp", DESCENDING)])
    await db.audit_logs.create_index("actor_id")
    await db.audit_logs.create_index("timestamp")

    # ── idempotency keys (TTL: 24 hours) ─────────────────────────
    await db.idempotency_keys.create_index("created_at", expireAfterSeconds=86400)
    await db.idempotency_keys.create_index("key", unique=True)

    logger.info("MongoDB indexes created/verified")
