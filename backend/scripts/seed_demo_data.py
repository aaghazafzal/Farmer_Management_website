"""
KisanSetu Backend — Demo Seed Data Script
==========================================
Populates MongoDB with data that matches the frontend mockData.ts and staffStore.tsx
exactly, so the app is immediately functional without connecting to the real Firebase.

Run:
    cd backend
    python scripts/seed_demo_data.py

Rerun safely — existing data is cleared first.
"""
from __future__ import annotations

import asyncio
import sys
import os
from datetime import datetime, timezone

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

# Allow running from backend/ directory
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

from app.core.config import settings
from app.utils.datetime_utils import IST

UTC = timezone.utc

# ── Today's date for seeding ─────────────────────────────────────────────────
TODAY = datetime.now(IST).strftime("%Y-%m-%d")
DISPLAY_DATE = datetime.now(IST).strftime("%d %b %Y")


async def seed():
    print(f"\n🌱 KisanSetu Demo Seed — date: {TODAY}\n")
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[settings.DATABASE_NAME]

    # ── Clear existing data ────────────────────────────────────────────────
    collections = [
        "users", "farmers", "staff", "centres", "slots", "bookings",
        "queue_entries", "procurements", "procurement_history",
        "notifications", "alerts", "audit_logs", "idempotency_keys",
    ]
    for coll in collections:
        await db[coll].drop()
        print(f"  🗑  Dropped: {coll}")

    # ── Re-create indexes ──────────────────────────────────────────────────
    from app.core.database import _client, _db
    import app.core.database as db_module
    db_module._client = client
    db_module._db = db
    from app.core.database import _create_indexes
    await _create_indexes()
    print("  ✅ Indexes created\n")

    now = datetime.now(UTC)

    # ════════════════════════════════════════════════════════════════════════
    # CENTRE
    # ════════════════════════════════════════════════════════════════════════
    centre_id = ObjectId()
    centre = {
        "_id": centre_id,
        "code": "ABC-AMR-01",
        "name": "ABC Procurement Centre",
        "address": "Kotla Kalan, Amritsar, Punjab 143001",
        "location": "Kotla Kalan, Amritsar",
        "district": "Amritsar",
        "state": "Punjab",
        "status": "open",
        "operating_hours": "08:00 AM – 05:00 PM",
        "phone": "0183-2200100",
        "default_slot_capacity": 20,
        "max_daily_capacity": 140,
        "weighbridge_count": 2,
        "coordinates": {"lat": 31.6250, "lng": 74.8650},
        "commodities": ["Wheat (Kanak)", "Paddy", "Mustard"],
        "created_at": now,
    }
    await db.centres.insert_one(centre)
    print("  🏢 Centre: ABC Procurement Centre")

    # ════════════════════════════════════════════════════════════════════════
    # USERS & STAFF
    # ════════════════════════════════════════════════════════════════════════
    manager_user_id = ObjectId()
    staff1_user_id = ObjectId()
    staff2_user_id = ObjectId()

    staff_users = [
        {
            "_id": manager_user_id,
            "firebase_uid": "demo-manager-uid-001",
            "phone": "+918800001111",
            "display_name": "Raj Kumar",
            "role": "CENTRE_MANAGER",
            "is_active": True,
            "created_at": now,
        },
        {
            "_id": staff1_user_id,
            "firebase_uid": "demo-staff-uid-001",
            "phone": "+918800002222",
            "display_name": "Harpreet Kaur",
            "role": "CENTRE_STAFF",
            "is_active": True,
            "created_at": now,
        },
        {
            "_id": staff2_user_id,
            "firebase_uid": "demo-staff-uid-002",
            "phone": "+918800003333",
            "display_name": "Simran Singh",
            "role": "CENTRE_STAFF",
            "is_active": True,
            "created_at": now,
        },
        {
            "_id": ObjectId(),
            "firebase_uid": "demo-admin-uid-001",
            "phone": "+918800009999",
            "display_name": "District Mandi Administrator",
            "role": "ADMIN",
            "is_active": True,
            "created_at": now,
        },
    ]
    await db.users.insert_many(staff_users)
    print("  👷 Staff & Admin users inserted (4)")

    staff_records = [
        {"_id": ObjectId(), "user_id": str(manager_user_id), "centre_id": str(centre_id), "role": "CENTRE_MANAGER", "staff_id": "S-MGR-001", "is_active": True, "joined_at": now},
        {"_id": ObjectId(), "user_id": str(staff1_user_id), "centre_id": str(centre_id), "role": "CENTRE_STAFF", "staff_id": "S-OPS-001", "is_active": True, "joined_at": now},
        {"_id": ObjectId(), "user_id": str(staff2_user_id), "centre_id": str(centre_id), "role": "CENTRE_STAFF", "staff_id": "S-VER-001", "is_active": True, "joined_at": now},
    ]
    await db.staff.insert_many(staff_records)

    # ════════════════════════════════════════════════════════════════════════
    # FARMERS — matches staffStore.tsx INITIAL_FARMERS & INITIAL_QUEUE
    # ════════════════════════════════════════════════════════════════════════
    farmers_data = [
        # (name, phone, village, ref, land, deliveries, queue_num, status, commodity, qty)
        ("Gurpreet Singh",  "+919876545512", "Majitha, Amritsar",             "F-10471", "8.5 Acres", 14, 5,  "processing", "Wheat",   65),
        ("Suresh Patel",    "+919712344421", "Focal Point Rural, Amritsar",   "F-10491", "5.0 Acres",  9, 6,  "waiting",    "Wheat",   50),
        ("Anjali Devi",     "+919912347822", "Ajnala Road, Amritsar",         "F-10503", "3.5 Acres",  5, 7,  "arrived",    "Wheat",   40),
        ("Ramesh Kumar",    "+919812343210", "Kotla Kalan, Amritsar",         "F-10482", "4.5 Acres",  6, 8,  "waiting",    "Wheat",   85),
        ("Meera Joshi",     "+919712342290", "Kot Khalsa, Amritsar",          "F-10518", "6.0 Acres", 11, 9,  "delayed",    "Wheat",   70),
        ("Arun Sharma",     "+919812346642", "Chheharta Rural, Amritsar",     "F-10527", "4.0 Acres",  8, 10, "waiting",    "Mustard", 40),
        ("Harbhajan Lal",   "+919712348831", "Kotla Kalan, Amritsar",         "F-10444", "9.0 Acres", 15, 4,  "completed",  "Wheat",   90),
    ]

    farmer_docs = []
    farmer_user_docs = []
    farmer_id_map: dict[str, ObjectId] = {}

    for name, phone, village, ref, land, deliveries, qnum, status, commodity, qty in farmers_data:
        uid = ObjectId()
        fid = ObjectId()
        masked = f"{phone[-10:-8]}••••{phone[-4:]}"
        farmer_user_docs.append({
            "_id": uid,
            "firebase_uid": f"demo-farmer-{ref.lower()}",
            "phone": phone,
            "display_name": name,
            "role": "FARMER",
            "is_active": True,
            "created_at": now,
        })
        farmer_docs.append({
            "_id": fid,
            "user_id": str(uid),
            "firebase_uid": f"demo-farmer-{ref.lower()}",
            "farmer_reference": ref,
            "name": name,
            "phone": phone,
            "phone_masked": masked,
            "village": village,
            "district": "Amritsar",
            "state": "Punjab",
            "land_area": land,
            "total_deliveries": deliveries,
            "created_at": now,
        })
        farmer_id_map[ref] = (uid, fid)

    await db.users.insert_many(farmer_user_docs)
    await db.farmers.insert_many(farmer_docs)
    print(f"  🧑‍🌾 Farmers inserted: {len(farmer_docs)}")

    # ════════════════════════════════════════════════════════════════════════
    # SLOTS — matches INITIAL_SLOTS from staffStore.tsx
    # ════════════════════════════════════════════════════════════════════════
    slots_data = [
        ("08:00", "09:00", 20, 12, "available",  "Wheat · Paddy"),
        ("09:00", "10:00", 20, 18, "limited",    "Wheat · Paddy"),
        ("10:00", "11:00", 20, 20, "full",        "Wheat"),
        ("11:00", "12:00", 20, 14, "available",  "Wheat · Mustard"),
        ("12:00", "13:00", 20,  9, "available",  "Wheat"),
        ("14:00", "15:00", 20, 16, "limited",    "Wheat · Paddy"),
        ("15:00", "16:00", 20, 11, "available",  "Wheat"),
    ]
    slot_id_map: dict[str, ObjectId] = {}
    slot_docs = []
    for start, end, cap, booked, status, commodity in slots_data:
        sid = ObjectId()
        slot_docs.append({
            "_id": sid,
            "centre_id": centre_id,
            "date": TODAY,
            "start_time": start,
            "end_time": end,
            "capacity": cap,
            "booked": booked,
            "status": status,
            "commodity": commodity,
            "is_closed": False,
            "created_at": now,
        })
        slot_id_map[start] = sid
    await db.slots.insert_many(slot_docs)
    print(f"  📅 Slots inserted: {len(slot_docs)} (for {TODAY})")

    # ════════════════════════════════════════════════════════════════════════
    # BOOKINGS + QUEUE ENTRIES — matching INITIAL_QUEUE
    # ════════════════════════════════════════════════════════════════════════
    queue_slot = slot_id_map.get("10:00") or slot_docs[2]["_id"]  # 10:00-11:00

    queue_entries_data = [
        # (ref, queue_num, status, commodity, qty, delay_reason, bay)
        ("F-10444", 4,  "completed", "Wheat",   90, None,                                          None),
        ("F-10471", 5,  "processing","Wheat",   65, None,                                          "Bay 1"),
        ("F-10491", 6,  "waiting",   "Wheat",   50, None,                                          "Bay 1"),
        ("F-10503", 7,  "arrived",   "Wheat",   40, None,                                          "Bay 2"),
        ("F-10482", 8,  "waiting",   "Wheat",   85, None,                                          "Bay 2"),
        ("F-10518", 9,  "delayed",   "Wheat",   70, "Moisture content 15.2% (>14% limit) — sun drying required", "Bay 1"),
        ("F-10527", 10, "waiting",   "Mustard", 40, None,                                          "Bay 2"),
    ]

    booking_docs = []
    queue_docs = []
    booking_id_map: dict[str, ObjectId] = {}

    for ref, qnum, status, commodity, qty, delay_reason, bay in queue_entries_data:
        uid, fid = farmer_id_map[ref]
        bid = ObjectId()
        qid = ObjectId()
        booking_ref = f"KS-240912-{(qnum * 100) + 11:04d}"

        booking_docs.append({
            "_id": bid,
            "booking_reference": booking_ref,
            "farmer_id": fid,
            "user_id": str(uid),
            "centre_id": centre_id,
            "centre_name": "ABC Procurement Centre",
            "slot_id": queue_slot,
            "slot_time": "10:00 AM–11:00 AM",
            "booking_date": TODAY,
            "commodity": commodity,
            "quantity_quintals": float(qty),
            "status": "completed" if status == "completed" else ("processing" if status == "processing" else "upcoming"),
            "created_at": now,
            "updated_at": now,
        })

        queue_docs.append({
            "_id": qid,
            "centre_id": centre_id,
            "booking_id": bid,
            "queue_number": qnum,
            "token": f"#{qnum:02d}",
            "farmer_name": next(d["name"] for d in farmer_docs if d["farmer_reference"] == ref),
            "phone_masked": next(d["phone_masked"] for d in farmer_docs if d["farmer_reference"] == ref),
            "slot_time": "10:00 AM–11:00 AM",
            "status": status,
            "commodity": commodity,
            "quantity": f"{qty} quintals",
            "weighbridge_bay": bay,
            "delay_reason": delay_reason,
            "arrived_at": now if status in ("arrived", "processing", "completed") else None,
            "processing_started_at": now if status in ("processing", "completed") else None,
            "completed_at": now if status == "completed" else None,
            "created_at": now,
            "updated_at": now,
        })
        booking_id_map[ref] = bid

    await db.bookings.insert_many(booking_docs)
    await db.queue_entries.insert_many(queue_docs)
    print(f"  📋 Bookings: {len(booking_docs)}, Queue entries: {len(queue_docs)}")

    # ════════════════════════════════════════════════════════════════════════
    # COMPLETED BOOKINGS (historical)
    # ════════════════════════════════════════════════════════════════════════
    completed_bookings = []
    for i in range(1, 4):
        completed_bookings.append({
            "_id": ObjectId(),
            "booking_reference": f"KS-240910-{9000 + i:04d}",
            "farmer_id": farmer_docs[0]["_id"],
            "user_id": str(farmer_docs[0]["_id"]),
            "centre_id": centre_id,
            "centre_name": "ABC Procurement Centre",
            "slot_id": ObjectId(),
            "slot_time": "09:00 AM–10:00 AM",
            "booking_date": "2026-09-10",
            "commodity": "Wheat",
            "quantity_quintals": 60.0,
            "status": "completed",
            "created_at": now,
            "updated_at": now,
        })
    await db.bookings.insert_many(completed_bookings)
    print(f"  ✅ Historical completed bookings: {len(completed_bookings)}")

    # ════════════════════════════════════════════════════════════════════════
    # ALERTS — matches INITIAL_ALERTS
    # ════════════════════════════════════════════════════════════════════════
    alerts = [
        {
            "_id": ObjectId(), "alert_id": "ALT-01", "centre_id": str(centre_id),
            "type": "queue", "title": "Queue #09 delayed — verification in progress",
            "message": "Queue processing is temporarily slower than expected. Estimated wait for subsequent tokens has increased by ~15 minutes.",
            "audience": "Farmers with active bookings", "status": "active", "reach": 27,
            "created_by": "Harpreet Kaur", "actor_id": str(staff1_user_id), "created_at": now,
        },
        {
            "_id": ObjectId(), "alert_id": "ALT-02", "centre_id": str(centre_id),
            "type": "slot", "title": "10:00 AM slot reached full capacity",
            "message": "The 10:00–11:00 AM procurement slot is now 100% booked (20/20). Recommend booking 11:00 or 12:00 slots.",
            "audience": "All farmers viewing centre", "status": "active", "reach": 14,
            "created_by": "Raj Kumar", "actor_id": str(manager_user_id), "created_at": now,
        },
        {
            "_id": ObjectId(), "alert_id": "ALT-03", "centre_id": str(centre_id),
            "type": "general", "title": "7 new bookings received for 14:00 slot",
            "message": "Afternoon slot bookings have been recorded and registered into queue schedule.",
            "audience": "Centre Staff", "status": "sent", "reach": 7,
            "created_by": "Raj Kumar", "actor_id": str(manager_user_id), "created_at": now,
        },
        {
            "_id": ObjectId(), "alert_id": "ALT-04", "centre_id": str(centre_id),
            "type": "procurement", "title": "84 farmers processed successfully today",
            "message": "Morning procurement target achieved with 100% electronic weighbridge verification.",
            "audience": "All Staff", "status": "sent", "reach": 84,
            "created_by": "Raj Kumar", "actor_id": str(manager_user_id), "created_at": now,
        },
        {
            "_id": ObjectId(), "alert_id": "ALT-05", "centre_id": str(centre_id),
            "type": "centre", "title": "Weighing bay routine calibration after 4:00 PM",
            "message": "Scheduled maintenance for Bay 1 weighbridge sensor. Procurement remains uninterrupted on Bay 2.",
            "audience": "All farmers & staff", "status": "scheduled", "reach": 45,
            "created_by": "Raj Kumar", "actor_id": str(manager_user_id), "created_at": now,
        },
    ]
    await db.alerts.insert_many(alerts)
    print(f"  🔔 Alerts inserted: {len(alerts)}")

    # ════════════════════════════════════════════════════════════════════════
    # AUDIT LOG — matches INITIAL_AUDIT_LOG
    # ════════════════════════════════════════════════════════════════════════
    audit_entries = [
        ("LOG-01", "Raj Kumar",      "Updated Token #05 (Gurpreet Singh)",    "Waiting → Processing (Bay 1 weighbridge)"),
        ("LOG-02", "Harpreet Kaur",  "Flagged delay for Token #09 (Meera Joshi)", "Moisture content re-test required (15.2% > 14%)"),
        ("LOG-03", "Raj Kumar",      "Updated Token #04 (Harbhajan Lal)",     "Processing → Completed"),
        ("LOG-04", "Simran Singh",   "Created alert: 10:00 AM slot full",     "Alert ALT-02 broadcast to 14 farmers"),
        ("LOG-05", "Raj Kumar",      "Updated slot 10:00-11:00 status",       "Status → Full (20/20 booked)"),
        ("LOG-06", "Harpreet Kaur",  "Updated Token #07 (Anjali Devi)",       "Waiting → Arrived"),
        ("LOG-07", "Simran Singh",   "Verified produce for Token #04",        "Weight: 90 qtl, Moisture: 12.1%, Grade A"),
        ("LOG-08", "Raj Kumar",      "Opened afternoon slot 14:00-15:00",     "Capacity: 20"),
        ("LOG-09", "Harpreet Kaur",  "Sent SMS notification to Meera Joshi",  "Re-test instruction dispatched"),
        ("LOG-10", "Raj Kumar",      "Centre session started",                f"All systems online for {DISPLAY_DATE}"),
    ]
    audit_docs = []
    for log_id, staff_name, action, details in audit_entries:
        audit_docs.append({
            "_id": ObjectId(),
            "log_id": log_id,
            "actor_id": str(manager_user_id),
            "actor_name": staff_name,
            "centre_id": str(centre_id),
            "action": action,
            "details": details,
            "entity_type": "queue_entry",
            "entity_id": None,
            "timestamp": now,
            "time_ist": datetime.now(IST).strftime("%I:%M %p"),
        })
    await db.audit_logs.insert_many(audit_docs)
    print(f"  📜 Audit log entries: {len(audit_docs)}")

    # ════════════════════════════════════════════════════════════════════════
    # NOTIFICATIONS — for Ramesh Kumar (farmer F-10482)
    # ════════════════════════════════════════════════════════════════════════
    ramesh_uid, ramesh_fid = farmer_id_map["F-10482"]
    notifications = [
        {
            "_id": ObjectId(),
            "notif_id": "N-001",
            "recipient_user_id": str(ramesh_uid),
            "title": "Booking Confirmed ✓",
            "message": f"Slot 10:00–11:00 AM at ABC Procurement Centre on {TODAY}. Ref: KS-240912-0842",
            "type": "booking",
            "read": True,
            "created_at": now,
        },
        {
            "_id": ObjectId(),
            "notif_id": "N-002",
            "recipient_user_id": str(ramesh_uid),
            "title": "Queue Update",
            "message": "Token #08 — your estimated wait time is approximately 35 minutes.",
            "type": "queue",
            "read": False,
            "created_at": now,
        },
    ]
    await db.notifications.insert_many(notifications)
    print(f"  🔔 Notifications: {len(notifications)}")

    client.close()
    print("\n✅ Seed complete! Run: uvicorn app.main:app --reload --port 8000\n")


if __name__ == "__main__":
    asyncio.run(seed())
