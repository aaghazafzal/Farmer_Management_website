"""
KisanSetu Backend — Test Configuration & Fixtures
"""
from __future__ import annotations

import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.core.database import connect_db, disconnect_db, get_db
from app.core.config import settings

# Use a dedicated test database
TEST_DB_NAME = "kisansetu_test"


@pytest_asyncio.fixture(scope="function", autouse=True)
async def test_db():
    """Connect to test database for each test function."""
    import app.core.database as db_module
    from motor.motor_asyncio import AsyncIOMotorClient
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[TEST_DB_NAME]
    db_module._client = client
    db_module._db = db

    # Clean state
    for coll in ["users", "farmers", "staff", "centres", "slots", "bookings",
                  "queue_entries", "procurements", "notifications", "alerts", "audit_logs"]:
        await db.drop_collection(coll)

    from app.core.database import _create_indexes
    await _create_indexes()

    yield db

    # Teardown
    await client.drop_database(TEST_DB_NAME)
    client.close()



@pytest_asyncio.fixture
async def client():
    """Async HTTP test client for the FastAPI app."""
    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as c:
        yield c


@pytest_asyncio.fixture
async def seed_centre(test_db):
    """Insert a test centre into the database."""
    from bson import ObjectId
    centre = {
        "_id": ObjectId(),
        "code": "TEST-CENTRE-01",
        "name": "Test Procurement Centre",
        "address": "Test Village, Amritsar",
        "location": "Amritsar",
        "district": "Amritsar",
        "state": "Punjab",
        "status": "open",
        "operating_hours": "08:00–17:00",
        "manager": "Test Manager",
        "default_slot_capacity": 20,
        "max_daily_capacity": 140,
        "weighbridge_count": 2,
        "coordinates": {"lat": 31.634, "lng": 74.872},
        "commodities": ["Wheat", "Paddy"],
    }
    await test_db.centres.insert_one(centre)
    return centre


@pytest_asyncio.fixture
async def seed_slot(test_db, seed_centre):
    """Insert a test slot with available capacity."""
    from bson import ObjectId
    from app.utils.datetime_utils import today_str_ist
    slot = {
        "_id": ObjectId(),
        "centre_id": seed_centre["_id"],
        "date": today_str_ist(),
        "start_time": "10:00",
        "end_time": "11:00",
        "capacity": 5,
        "booked": 0,
        "status": "available",
        "commodity": "Wheat",
        "is_closed": False,
    }
    await test_db.slots.insert_one(slot)
    return slot


@pytest_asyncio.fixture
async def seed_user_farmer(test_db):
    """Insert a test farmer user."""
    from bson import ObjectId
    from app.utils.datetime_utils import utc_now
    user = {
        "_id": ObjectId(),
        "firebase_uid": "test-farmer-uid-001",
        "phone": "+919876543210",
        "display_name": "Test Farmer",
        "role": "FARMER",
        "is_active": True,
        "created_at": utc_now(),
    }
    await test_db.users.insert_one(user)
    farmer = {
        "_id": ObjectId(),
        "user_id": str(user["_id"]),
        "firebase_uid": user["firebase_uid"],
        "farmer_reference": "F-99001",
        "name": "Test Farmer",
        "phone": "+919876543210",
        "phone_masked": "98••••3210",
        "village": "Test Village",
        "district": "Amritsar",
        "state": "Punjab",
        "land_area": "5.0 Acres",
        "total_deliveries": 3,
    }
    await test_db.farmers.insert_one(farmer)
    return user, farmer


@pytest_asyncio.fixture
async def seed_user_staff(test_db, seed_centre):
    """Insert a test staff user."""
    from bson import ObjectId
    from app.utils.datetime_utils import utc_now
    user = {
        "_id": ObjectId(),
        "firebase_uid": "test-staff-uid-001",
        "phone": "+919988776655",
        "display_name": "Test Staff",
        "role": "CENTRE_STAFF",
        "is_active": True,
        "created_at": utc_now(),
    }
    await test_db.users.insert_one(user)
    staff_doc = {
        "_id": ObjectId(),
        "user_id": str(user["_id"]),
        "centre_id": str(seed_centre["_id"]),
        "role": "CENTRE_STAFF",
        "staff_id": "S-TEST-001",
        "is_active": True,
    }
    await test_db.staff.insert_one(staff_doc)
    return user, staff_doc
