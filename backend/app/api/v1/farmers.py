"""
KisanSetu Backend — Farmers Router
Farmer self-profile and booking history.
"""
from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, Query, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import not_found, AppError
from app.core.permissions import require_farmer, require_staff
from app.schemas import ok
from app.services import booking_service
from app.utils.pagination import PaginatedResponse

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/farmers", tags=["Farmers"])


async def _get_farmer(user_id: str, db: AsyncIOMotorDatabase) -> dict:
    farmer = await db.farmers.find_one({"user_id": user_id})
    if not farmer:
        raise not_found("Farmer profile", AppError.FARMER_NOT_FOUND)
    farmer["id"] = str(farmer.pop("_id"))
    return farmer


@router.get("/me", summary="Get own farmer profile")
@limiter.limit(settings.API_RATE_LIMIT)
async def get_my_profile(
    request: Request,
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    farmer = await _get_farmer(str(current_user["_id"]), db)
    return ok(farmer)


@router.get("/me/bookings", summary="Get own booking history")
@limiter.limit(settings.API_RATE_LIMIT)
async def get_my_bookings(
    request: Request,
    status: Optional[str] = Query(None, description="upcoming | completed | cancelled"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    farmer = await _get_farmer(str(current_user["_id"]), db)
    bookings, total = await booking_service.get_farmer_bookings(
        db, farmer["id"], status_filter=status, page=page, page_size=page_size
    )
    return ok(PaginatedResponse.build(bookings, total, page, page_size))


@router.get("/me/procurements", summary="Get own procurement history")
@limiter.limit(settings.API_RATE_LIMIT)
async def get_my_procurements(
    request: Request,
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    farmer = await _get_farmer(str(current_user["_id"]), db)
    from bson import ObjectId
    cursor = db.procurements.find(
        {"farmer_id": ObjectId(farmer["id"])}
    ).sort("created_at", -1).limit(50)
    docs = await cursor.to_list(length=50)
    for d in docs:
        d["id"] = str(d.pop("_id"))
        d["farmer_id"] = str(d["farmer_id"])
        d["centre_id"] = str(d["centre_id"])
        d["booking_id"] = str(d["booking_id"])
    return ok(docs)
