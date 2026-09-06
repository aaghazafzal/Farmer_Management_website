"""
KisanSetu Backend — Slot Recommendation Service
Rule-based ranker. Returns top 3 recommended slots for a farmer.
Architecture accepts future ML model replacement.

Scoring formula:
  score = (availability_ratio * 0.5) - (queue_pressure * 0.3) - (time_proximity_penalty * 0.2)

Labels:
  score >= 0.7  → "Recommended"
  score >= 0.4  → "Good Alternative"
  score >= 0.0  → "Limited"
"""
from __future__ import annotations

import logging
from datetime import datetime

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.utils.datetime_utils import IST

logger = logging.getLogger(__name__)


def _score_slot(slot: dict, avg_queue_pressure: float) -> tuple[float, str, str]:
    capacity = slot["capacity"]
    booked = slot["booked"]
    available = max(0, capacity - booked)

    if capacity == 0 or available == 0:
        return -1.0, "Full", "This slot is already at capacity."

    availability_ratio = available / capacity
    queue_pressure = min(avg_queue_pressure, 1.0)

    # Time proximity: prefer slots not too close (within 1h) or too far (>6h)
    try:
        now_ist = datetime.now(IST)
        slot_hour = int(slot["start_time"].split(":")[0])
        current_hour = now_ist.hour
        hours_away = abs(slot_hour - current_hour)
        time_penalty = max(0.0, 1.0 - hours_away / 3.0) if hours_away < 1 else 0.0
    except Exception:
        time_penalty = 0.0

    score = (availability_ratio * 0.5) - (queue_pressure * 0.3) - (time_penalty * 0.2)
    score = round(score, 4)

    if score >= 0.7:
        label = "Recommended"
        why = f"{available} spots available · Low queue pressure"
    elif score >= 0.4:
        label = "Good Alternative"
        why = f"{available} spots available · Moderate occupancy"
    else:
        label = "Limited"
        why = f"Only {available} spot(s) available · High demand"

    return score, label, why


async def get_recommended_slots(
    db: AsyncIOMotorDatabase,
    centre_id: str,
    date: str,
    top_n: int = 3,
) -> list[dict]:
    """Return top_n scored slot recommendations for a centre on a given date."""
    # Fetch available/limited slots only
    cursor = db.slots.find({
        "centre_id": ObjectId(centre_id),
        "date": date,
        "status": {"$nin": ["full", "closed"]},
    }).sort("start_time", 1)
    slots = await cursor.to_list(length=100)

    if not slots:
        return []

    # Estimate queue pressure: active queue / daily capacity
    active_queue = await db.queue_entries.count_documents({
        "centre_id": ObjectId(centre_id),
        "status": {"$in": ["waiting", "arrived", "processing"]},
    })
    centre = await db.centres.find_one({"_id": ObjectId(centre_id)}, {"max_daily_capacity": 1})
    max_cap = centre.get("max_daily_capacity", 140) if centre else 140
    avg_queue_pressure = min(active_queue / max(max_cap, 1), 1.0)

    scored: list[tuple[float, dict, str, str]] = []
    for slot in slots:
        score, label, why = _score_slot(slot, avg_queue_pressure)
        if score >= 0:
            scored.append((score, slot, label, why))

    # Sort by score descending
    scored.sort(key=lambda x: x[0], reverse=True)

    results = []
    for score, slot, label, why in scored[:top_n]:
        slot_out = {
            "id": str(slot["_id"]),
            "centre_id": str(slot["centre_id"]),
            "date": slot["date"],
            "start_time": slot["start_time"],
            "end_time": slot["end_time"],
            "time": f"{slot['start_time']}–{slot['end_time']}",
            "capacity": slot["capacity"],
            "booked": slot["booked"],
            "available": max(0, slot["capacity"] - slot["booked"]),
            "status": slot["status"],
            "commodity": slot["commodity"],
            "note": slot.get("note"),
        }
        results.append({
            "slot": slot_out,
            "label": label,
            "why": why,
            "score": score,
        })

    return results
