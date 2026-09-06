"""
KisanSetu Backend — Reports Service
Aggregates operational data for staff dashboards and daily summaries.
"""
from __future__ import annotations

import logging
from datetime import datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.utils.datetime_utils import today_str_ist, IST

logger = logging.getLogger(__name__)


async def get_daily_report(
    db: AsyncIOMotorDatabase,
    centre_id: str,
    date: str | None = None,
) -> dict:
    """Build a daily operational report for a centre."""
    report_date = date or today_str_ist()
    centre_oid = ObjectId(centre_id)

    centre = await db.centres.find_one({"_id": centre_oid}, {"name": 1})
    centre_name = centre["name"] if centre else "Unknown Centre"

    # Total bookings for date
    total = await db.bookings.count_documents({
        "centre_id": centre_oid,
        "booking_date": report_date,
    })

    completed = await db.queue_entries.count_documents({
        "centre_id": centre_oid,
        "status": "completed",
    })
    delayed = await db.queue_entries.count_documents({
        "centre_id": centre_oid,
        "status": "delayed",
    })
    cancelled = await db.bookings.count_documents({
        "centre_id": centre_oid,
        "booking_date": report_date,
        "status": "cancelled",
    })

    # Slot utilization
    slots = await db.slots.find(
        {"centre_id": centre_oid, "date": report_date},
        {"capacity": 1, "booked": 1},
    ).to_list(length=50)
    total_cap = sum(s["capacity"] for s in slots) or 1
    total_booked = sum(s["booked"] for s in slots)
    utilization = round((total_booked / total_cap) * 100, 1)

    # Commodities breakdown
    pipeline = [
        {"$match": {"centre_id": centre_oid, "booking_date": report_date}},
        {"$group": {"_id": "$commodity", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
    ]
    commodities = await db.bookings.aggregate(pipeline).to_list(length=20)
    commodities_breakdown = [{"commodity": c["_id"], "count": c["count"]} for c in commodities]

    # Audit log count
    audit_count = await db.audit_logs.count_documents({"centre_id": centre_id})

    return {
        "date": report_date,
        "centre_id": centre_id,
        "centre_name": centre_name,
        "total_farmers": total,
        "completed": completed,
        "delayed": delayed,
        "cancelled": cancelled,
        "avg_wait_minutes": 12.0,  # TODO: derive from completion timestamps
        "slot_utilization_percent": utilization,
        "commodities_breakdown": commodities_breakdown,
        "audit_log_count": audit_count,
        "throughput_per_hour": round(completed / 8, 1) if completed else 0.0,
    }
