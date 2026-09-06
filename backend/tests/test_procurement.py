"""Tests for procurement state transitions and workflow."""
from __future__ import annotations

import pytest
from bson import ObjectId
from app.services.procurement_service import (
    update_procurement_status,
    update_procurement_details,
    get_procurement_by_id,
)
from app.core.exceptions import KisanSetuException


async def _make_procurement(db, centre_id, booking_id, farmer_id, status="waiting"):
    doc = {
        "_id": ObjectId(),
        "booking_id": ObjectId(booking_id),
        "farmer_id": ObjectId(farmer_id),
        "centre_id": ObjectId(centre_id),
        "status": status,
        "token": "#05",
        "commodity": "Wheat",
        "quantity": "50 quintals",
    }
    await db.procurements.insert_one(doc)
    return doc


@pytest.mark.asyncio
async def test_procurement_happy_path(test_db, seed_centre):
    b_id = ObjectId()
    f_id = ObjectId()
    await test_db.bookings.insert_one({"_id": b_id, "status": "in_centre"})

    p = await _make_procurement(test_db, str(seed_centre["_id"]), str(b_id), str(f_id), status="waiting")
    p_id = str(p["_id"])

    # 1. waiting -> in_progress
    p1 = await update_procurement_status(
        test_db, p_id, "in_progress", staff_name="Ramesh", actor_id="s1", weighbridge_bay="Bay 2"
    )
    assert p1["status"] == "in_progress"
    assert p1.get("weighbridge_bay") == "Bay 2"

    # 2. in_progress -> verification
    p2 = await update_procurement_status(
        test_db, p_id, "verification", staff_name="Ramesh", actor_id="s1"
    )
    assert p2["status"] == "verification"

    # 3. verification -> completed
    p3 = await update_procurement_status(
        test_db, p_id, "completed", staff_name="Ramesh", actor_id="s1"
    )
    assert p3["status"] == "completed"

    # Verify linked booking updated to completed
    booking = await test_db.bookings.find_one({"_id": b_id})
    assert booking["status"] == "completed"


@pytest.mark.asyncio
async def test_invalid_procurement_transition(test_db, seed_centre):
    b_id = ObjectId()
    f_id = ObjectId()
    p = await _make_procurement(test_db, str(seed_centre["_id"]), str(b_id), str(f_id), status="waiting")
    p_id = str(p["_id"])

    # Waiting -> completed directly is illegal
    with pytest.raises(KisanSetuException) as exc_info:
        await update_procurement_status(
            test_db, p_id, "completed", staff_name="Ramesh", actor_id="s1"
        )
    assert exc_info.value.code == "INVALID_PROCUREMENT_TRANSITION"


@pytest.mark.asyncio
async def test_procurement_delay_and_resume(test_db, seed_centre):
    b_id = ObjectId()
    f_id = ObjectId()
    p = await _make_procurement(test_db, str(seed_centre["_id"]), str(b_id), str(f_id), status="in_progress")
    p_id = str(p["_id"])

    # in_progress -> delayed
    p1 = await update_procurement_status(
        test_db, p_id, "delayed", staff_name="Ramesh", actor_id="s1", note="Weighbridge calibration"
    )
    assert p1["status"] == "delayed"

    # delayed -> in_progress
    p2 = await update_procurement_status(
        test_db, p_id, "in_progress", staff_name="Ramesh", actor_id="s1"
    )
    assert p2["status"] == "in_progress"
