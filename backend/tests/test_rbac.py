"""Tests for RBAC — cross-farmer and cross-centre access prevention."""
from __future__ import annotations

import pytest
from bson import ObjectId
from app.services.booking_service import get_booking_by_id, cancel_booking
from app.core.exceptions import KisanSetuException


@pytest.mark.asyncio
async def test_farmer_cannot_view_other_booking(test_db, seed_centre, seed_slot):
    """Farmer A cannot retrieve Farmer B's booking."""
    farmer_a = {"_id": ObjectId(), "user_id": "ua", "farmer_reference": "F-A001"}
    farmer_b = {"_id": ObjectId(), "user_id": "ub", "farmer_reference": "F-B001"}
    await test_db.farmers.insert_many([farmer_a, farmer_b])

    booking_b = {
        "_id": ObjectId(),
        "farmer_id": farmer_b["_id"],
        "user_id": "ub",
        "booking_reference": "KS-TEST-B",
        "centre_id": seed_centre["_id"],
        "slot_id": seed_slot["_id"],
        "status": "upcoming",
        "commodity": "Wheat",
        "quantity_quintals": 40.0,
        "centre_name": "Test Centre",
        "slot_time": "10:00–11:00",
        "booking_date": "2026-09-07",
    }
    await test_db.bookings.insert_one(booking_b)

    # Farmer A tries to fetch Farmer B's booking — should raise NOT FOUND
    with pytest.raises(KisanSetuException) as exc_info:
        await get_booking_by_id(
            test_db, str(booking_b["_id"]),
            farmer_id=str(farmer_a["_id"])  # Farmer A's ID
        )
    assert exc_info.value.code == "BOOKING_NOT_FOUND"


@pytest.mark.asyncio
async def test_farmer_cannot_cancel_other_booking(test_db, seed_centre, seed_slot):
    """Farmer A cannot cancel Farmer B's booking."""
    farmer_a = {"_id": ObjectId(), "user_id": "ux", "farmer_reference": "F-X001"}
    farmer_b = {"_id": ObjectId(), "user_id": "uy", "farmer_reference": "F-Y001"}
    await test_db.farmers.insert_many([farmer_a, farmer_b])

    booking_b = {
        "_id": ObjectId(),
        "farmer_id": farmer_b["_id"],
        "user_id": "uy",
        "booking_reference": "KS-TEST-C",
        "centre_id": seed_centre["_id"],
        "slot_id": seed_slot["_id"],
        "status": "upcoming",
        "commodity": "Wheat",
        "quantity_quintals": 30.0,
        "centre_name": "Test Centre",
        "slot_time": "10:00–11:00",
        "booking_date": "2026-09-07",
    }
    await test_db.bookings.insert_one(booking_b)

    with pytest.raises(KisanSetuException) as exc_info:
        await cancel_booking(
            test_db, str(booking_b["_id"]),
            farmer_id=str(farmer_a["_id"]),  # Farmer A tries to cancel
        )
    assert exc_info.value.code == "BOOKING_NOT_FOUND"
