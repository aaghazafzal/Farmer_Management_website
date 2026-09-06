"""Tests for queue state machine transitions."""
from __future__ import annotations

import pytest
from bson import ObjectId
from app.services.queue_service import update_queue_status, mark_delayed, call_next_token
from app.core.exceptions import KisanSetuException


async def _make_queue_entry(db, centre_id, booking_id, number=1, status="waiting"):
    entry = {
        "_id": ObjectId(),
        "centre_id": ObjectId(centre_id),
        "booking_id": ObjectId(booking_id),
        "queue_number": number,
        "token": f"#{number:02d}",
        "farmer_name": "Test Farmer",
        "phone_masked": "98••••0001",
        "slot_time": "10:00–11:00",
        "commodity": "Wheat",
        "quantity": "50 quintals",
        "status": status,
    }
    await db.queue_entries.insert_one(entry)
    return entry


@pytest.mark.asyncio
async def test_waiting_to_arrived(test_db, seed_centre):
    booking = {"_id": ObjectId(), "user_id": "u1", "centre_id": seed_centre["_id"], "status": "upcoming", "booking_reference": "KS-QTEST-20"}
    await test_db.bookings.insert_one(booking)
    entry = await _make_queue_entry(test_db, str(seed_centre["_id"]), str(booking["_id"]), number=20, status="waiting")

    updated = await update_queue_status(
        test_db, str(entry["_id"]), "arrived",
        actor_id="staff1", actor_name="Staff",
        centre_id=str(seed_centre["_id"]),
    )
    assert updated["status"] == "arrived"


@pytest.mark.asyncio
async def test_invalid_transition_raises(test_db, seed_centre):
    booking = {"_id": ObjectId(), "user_id": "u2", "centre_id": seed_centre["_id"], "status": "upcoming", "booking_reference": "KS-QTEST-21"}
    await test_db.bookings.insert_one(booking)
    entry = await _make_queue_entry(test_db, str(seed_centre["_id"]), str(booking["_id"]), number=21, status="waiting")

    with pytest.raises(KisanSetuException) as exc_info:
        await update_queue_status(
            test_db, str(entry["_id"]), "completed",  # WAITING→COMPLETED is invalid
            actor_id="staff1", actor_name="Staff",
            centre_id=str(seed_centre["_id"]),
        )
    assert exc_info.value.code == "INVALID_QUEUE_TRANSITION"


@pytest.mark.asyncio
async def test_only_one_processing_at_a_time(test_db, seed_centre):
    """Cannot move a second entry to PROCESSING while one is already processing."""
    for i, num in enumerate([30, 31]):
        b = {"_id": ObjectId(), "user_id": f"u{i+10}", "centre_id": seed_centre["_id"], "status": "upcoming", "booking_reference": f"KS-QTEST-{num}"}
        await test_db.bookings.insert_one(b)
        await _make_queue_entry(test_db, str(seed_centre["_id"]), str(b["_id"]), number=num, status="waiting")

    # Transition #30 to processing
    e30 = await test_db.queue_entries.find_one({"queue_number": 30})
    await update_queue_status(
        test_db, str(e30["_id"]), "arrived",
        actor_id="s1", actor_name="S", centre_id=str(seed_centre["_id"])
    )
    await update_queue_status(
        test_db, str(e30["_id"]), "processing",
        actor_id="s1", actor_name="S", centre_id=str(seed_centre["_id"])
    )

    # Try to move #31 to processing — should fail
    e31 = await test_db.queue_entries.find_one({"queue_number": 31})
    await update_queue_status(
        test_db, str(e31["_id"]), "arrived",
        actor_id="s1", actor_name="S", centre_id=str(seed_centre["_id"])
    )
    with pytest.raises(KisanSetuException) as exc_info:
        await update_queue_status(
            test_db, str(e31["_id"]), "processing",
            actor_id="s1", actor_name="S", centre_id=str(seed_centre["_id"])
        )
    assert exc_info.value.code == "QUEUE_ALREADY_PROCESSING"


@pytest.mark.asyncio
async def test_completed_is_terminal(test_db, seed_centre):
    b = {"_id": ObjectId(), "user_id": "u99", "centre_id": seed_centre["_id"], "status": "completed", "booking_reference": "KS-QTEST-99"}
    await test_db.bookings.insert_one(b)
    entry = await _make_queue_entry(test_db, str(seed_centre["_id"]), str(b["_id"]), number=99, status="completed")

    with pytest.raises(KisanSetuException):
        await update_queue_status(
            test_db, str(entry["_id"]), "waiting",
            actor_id="s1", actor_name="S", centre_id=str(seed_centre["_id"])
        )
