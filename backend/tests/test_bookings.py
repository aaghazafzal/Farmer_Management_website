"""Tests for booking creation atomicity and business rules."""
from __future__ import annotations

import asyncio
import pytest
import pytest_asyncio
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.services.booking_service import create_booking
from app.core.exceptions import KisanSetuException


@pytest.mark.asyncio
async def test_booking_creates_successfully(test_db, seed_centre, seed_slot, seed_user_farmer):
    user, farmer = seed_user_farmer
    booking = await create_booking(
        test_db,
        farmer_id=str(farmer["_id"]),
        user_id=str(user["_id"]),
        centre_id=str(seed_centre["_id"]),
        slot_id=str(seed_slot["_id"]),
        commodity="Wheat",
        quantity_quintals=50.0,
    )
    assert booking["booking_reference"].startswith("KS-")
    assert booking["status"] == "upcoming"
    assert booking["commodity"] == "Wheat"

    # Slot booked count incremented
    updated_slot = await test_db.slots.find_one({"_id": seed_slot["_id"]})
    assert updated_slot["booked"] == 1


@pytest.mark.asyncio
async def test_booking_blocks_second_active_booking(test_db, seed_centre, seed_slot, seed_user_farmer):
    """A farmer cannot have two active bookings."""
    user, farmer = seed_user_farmer

    # First booking succeeds
    await create_booking(
        test_db,
        farmer_id=str(farmer["_id"]),
        user_id=str(user["_id"]),
        centre_id=str(seed_centre["_id"]),
        slot_id=str(seed_slot["_id"]),
        commodity="Wheat",
        quantity_quintals=25.0,
    )

    with pytest.raises(KisanSetuException) as exc_info:
        # Second active booking must fail with BOOKING_CONFLICT
        await create_booking(
            test_db,
            farmer_id=str(farmer["_id"]),
            user_id=str(user["_id"]),
            centre_id=str(seed_centre["_id"]),
            slot_id=str(seed_slot["_id"]),
            commodity="Wheat",
            quantity_quintals=30.0,
        )
    assert exc_info.value.code == "BOOKING_CONFLICT"


@pytest.mark.asyncio
async def test_full_slot_rejects_booking(test_db, seed_centre):
    """Booking a full slot returns SLOT_FULL."""
    from app.utils.datetime_utils import today_str_ist
    # Create a full slot
    full_slot = {
        "_id": ObjectId(),
        "centre_id": seed_centre["_id"],
        "date": today_str_ist(),
        "start_time": "14:00",
        "end_time": "15:00",
        "capacity": 1,
        "booked": 1,
        "status": "full",
        "is_closed": False,
        "commodity": "Wheat",
    }
    await test_db.slots.insert_one(full_slot)

    # New farmer for clean state
    new_user = {
        "_id": ObjectId(),
        "firebase_uid": "uid-full-test",
        "role": "FARMER",
        "is_active": True,
    }
    new_farmer = {
        "_id": ObjectId(),
        "user_id": str(new_user["_id"]),
        "farmer_reference": "F-88001",
    }
    await test_db.users.insert_one(new_user)
    await test_db.farmers.insert_one(new_farmer)

    with pytest.raises(KisanSetuException) as exc_info:
        await create_booking(
            test_db,
            farmer_id=str(new_farmer["_id"]),
            user_id=str(new_user["_id"]),
            centre_id=str(seed_centre["_id"]),
            slot_id=str(full_slot["_id"]),
            commodity="Wheat",
            quantity_quintals=20.0,
        )
    assert exc_info.value.code == "SLOT_FULL"


@pytest.mark.asyncio
async def test_idempotent_booking(test_db, seed_centre, seed_slot):
    """Duplicate request with same idempotency key returns original booking."""
    new_user = {"_id": ObjectId(), "firebase_uid": "uid-idem-test", "role": "FARMER", "is_active": True}
    new_farmer = {"_id": ObjectId(), "user_id": str(new_user["_id"]), "farmer_reference": "F-77001"}
    await test_db.users.insert_one(new_user)
    await test_db.farmers.insert_one(new_farmer)

    idem_key = "test-idem-key-abc123"
    b1 = await create_booking(
        test_db,
        farmer_id=str(new_farmer["_id"]),
        user_id=str(new_user["_id"]),
        centre_id=str(seed_centre["_id"]),
        slot_id=str(seed_slot["_id"]),
        commodity="Wheat",
        quantity_quintals=40.0,
        idempotency_key=idem_key,
    )
    b2 = await create_booking(
        test_db,
        farmer_id=str(new_farmer["_id"]),
        user_id=str(new_user["_id"]),
        centre_id=str(seed_centre["_id"]),
        slot_id=str(seed_slot["_id"]),
        commodity="Wheat",
        quantity_quintals=40.0,
        idempotency_key=idem_key,
    )
    # Same booking reference returned
    assert b1["booking_reference"] == b2["booking_reference"]
    # Slot booked count not incremented twice
    slot = await test_db.slots.find_one({"_id": seed_slot["_id"]})
    assert slot["booked"] == 1
