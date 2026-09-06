"""
KisanSetu Backend — Centres Router
Public centre discovery + protected centre detail routes.
"""
from __future__ import annotations

import logging
from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, Query, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import not_found, AppError
from app.core.permissions import get_current_user, require_staff, get_staff_centre_id
from app.schemas import ok
from app.services.recommendation_service import get_recommended_slots
from app.services.slot_service import get_slots_for_centre
from app.utils.datetime_utils import today_str_ist

logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

router = APIRouter(prefix="/centres", tags=["Centres"])


def _serialize_centre(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc


@router.get("", summary="List all procurement centres")
@limiter.limit(settings.API_RATE_LIMIT)
async def list_centres(
    request: Request,
    search: Optional[str] = Query(None),
    district: Optional[str] = Query(None),
    status: Optional[str] = Query(None),
    sort: Optional[str] = Query("name"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Public endpoint — returns centre list for farmer discovery."""
    filt: dict = {}
    if status:
        filt["status"] = status
    if district:
        filt["district"] = {"$regex": district, "$options": "i"}
    if search:
        filt["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"address": {"$regex": search, "$options": "i"}},
            {"district": {"$regex": search, "$options": "i"}},
        ]

    sort_field = "name" if sort not in ("name", "district", "wait_time_min") else sort
    cursor = db.centres.find(filt).sort(sort_field, 1).limit(100)
    docs = await cursor.to_list(length=100)

    # Augment with live queue and slot counts
    centres = []
    today = today_str_ist()
    for doc in docs:
        cid = doc["_id"]
        doc["id"] = str(doc.pop("_id"))
        doc["queue_count"] = await db.queue_entries.count_documents(
            {"centre_id": cid, "status": {"$in": ["waiting", "arrived", "processing"]}}
        )
        slots_today = await db.slots.count_documents(
            {"centre_id": cid, "date": today, "status": {"$in": ["available", "limited"]}}
        )
        doc["available_slots_today"] = slots_today
        centres.append(doc)

    return ok(centres)


@router.get("/map", summary="Lightweight map data for all centres")
@limiter.limit(settings.API_RATE_LIMIT)
async def centres_map(
    request: Request,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Returns minimal data needed to render map pins — fast endpoint."""
    cursor = db.centres.find(
        {},
        {"name": 1, "status": 1, "coordinates": 1, "district": 1},
    )
    docs = await cursor.to_list(length=200)
    result = []
    for doc in docs:
        cid = doc["_id"]
        qc = await db.queue_entries.count_documents(
            {"centre_id": cid, "status": {"$in": ["waiting", "arrived", "processing"]}}
        )
        result.append({
            "id": str(cid),
            "name": doc["name"],
            "status": doc["status"],
            "coordinates": doc.get("coordinates", {}),
            "district": doc.get("district", ""),
            "queue_count": qc,
        })
    return ok(result)


@router.get("/{centre_id}", summary="Centre detail with today's slots")
@limiter.limit(settings.API_RATE_LIMIT)
async def get_centre(
    request: Request,
    centre_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    doc = await db.centres.find_one({"_id": ObjectId(centre_id)})
    if not doc:
        raise not_found("Centre", AppError.CENTRE_NOT_FOUND)

    cid = doc["_id"]
    doc["id"] = str(doc.pop("_id"))

    # Today's slots
    today = today_str_ist()
    slots = await get_slots_for_centre(db, centre_id, date=today)
    doc["today_slots"] = slots
    doc["queue_count"] = await db.queue_entries.count_documents(
        {"centre_id": cid, "status": {"$in": ["waiting", "arrived", "processing"]}}
    )
    doc["completed_today"] = await db.queue_entries.count_documents(
        {"centre_id": cid, "status": "completed"}
    )
    return ok(doc)


@router.get("/{centre_id}/slots", summary="All slots for a centre on a date")
@limiter.limit(settings.API_RATE_LIMIT)
async def get_centre_slots(
    request: Request,
    centre_id: str,
    date: Optional[str] = Query(None, description="YYYY-MM-DD, defaults to today"),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    slots = await get_slots_for_centre(db, centre_id, date=date or today_str_ist())
    return ok(slots)


@router.get("/{centre_id}/recommended-slots", summary="Smart slot recommendations")
@limiter.limit(settings.API_RATE_LIMIT)
async def get_recommended(
    request: Request,
    centre_id: str,
    date: Optional[str] = Query(None),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    recommendations = await get_recommended_slots(
        db, centre_id, date=date or today_str_ist()
    )
    return ok(recommendations)
