"""Tests for slot creation, overlap check, and capacity management."""
from __future__ import annotations

import pytest
from bson import ObjectId
from app.services.slot_service import (
    create_slot,
    update_slot_capacity,
    close_slot,
    reopen_slot,
    get_slots_for_centre,
)
from app.core.exceptions import KisanSetuException


@pytest.mark.asyncio
async def test_create_slot_success(test_db, seed_centre):
    centre_id = str(seed_centre["_id"])
    slot = await create_slot(
        test_db,
        centre_id=centre_id,
        date="2026-09-15",
        start_time="08:00",
        end_time="09:00",
        capacity=20,
        commodity="Paddy",
    )
    assert slot["centre_id"] == centre_id
    assert slot["capacity"] == 20
    assert slot["available"] == 20
    assert slot["status"] == "available"


@pytest.mark.asyncio
async def test_create_slot_overlap_rejected(test_db, seed_centre):
    centre_id = str(seed_centre["_id"])
    await create_slot(
        test_db,
        centre_id=centre_id,
        date="2026-09-16",
        start_time="10:00",
        end_time="11:00",
        capacity=15,
        commodity="Wheat",
    )
    # Overlapping slot on same centre and date
    with pytest.raises(KisanSetuException) as exc_info:
        await create_slot(
            test_db,
            centre_id=centre_id,
            date="2026-09-16",
            start_time="10:30",
            end_time="11:30",
            capacity=15,
            commodity="Wheat",
        )
    assert exc_info.value.code == "SLOT_OVERLAP"


@pytest.mark.asyncio
async def test_update_capacity_conflict(test_db, seed_centre):
    centre_id = str(seed_centre["_id"])
    slot = await create_slot(
        test_db,
        centre_id=centre_id,
        date="2026-09-17",
        start_time="09:00",
        end_time="10:00",
        capacity=10,
        commodity="Mustard",
    )
    # Manually simulate 5 bookings
    await test_db.slots.update_one({"_id": ObjectId(slot["id"])}, {"$set": {"booked": 5}})

    # Setting capacity to 3 (< 5 booked) should fail
    with pytest.raises(KisanSetuException) as exc_info:
        await update_slot_capacity(test_db, slot["id"], new_capacity=3)
    assert exc_info.value.code == "SLOT_CAPACITY_CONFLICT"

    # Setting capacity to 12 should succeed
    updated = await update_slot_capacity(test_db, slot["id"], new_capacity=12)
    assert updated["capacity"] == 12


@pytest.mark.asyncio
async def test_close_and_reopen_slot(test_db, seed_centre):
    centre_id = str(seed_centre["_id"])
    slot = await create_slot(
        test_db,
        centre_id=centre_id,
        date="2026-09-18",
        start_time="11:00",
        end_time="12:00",
        capacity=10,
        commodity="Wheat",
    )
    closed = await close_slot(test_db, slot["id"])
    assert closed["status"] == "closed"

    reopened = await reopen_slot(test_db, slot["id"])
    assert reopened["status"] == "available"
