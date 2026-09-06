"""
KisanSetu Backend — Reports & Settings Router (staff/manager)
"""
from __future__ import annotations

from typing import Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, Query, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.permissions import require_staff, require_manager, get_staff_centre_id
from app.schemas import ok
from app.schemas.reports import CentreSettingsUpdateRequest
from app.services import report_service
from app.services.audit_service import get_audit_logs, add_audit_log

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(tags=["Reports & Settings"])


@router.get("/reports/daily", summary="Daily operational report")
@limiter.limit(settings.API_RATE_LIMIT)
async def daily_report(
    request: Request,
    date: Optional[str] = Query(None, description="YYYY-MM-DD, defaults to today"),
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    centre_id = await get_staff_centre_id(current_user, db)
    report = await report_service.get_daily_report(db, centre_id, date=date)
    return ok(report)


@router.get("/reports/audit-log", summary="Audit log entries for centre")
@limiter.limit(settings.API_RATE_LIMIT)
async def audit_log(
    request: Request,
    limit: int = Query(50, ge=1, le=200),
    skip: int = Query(0, ge=0),
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    centre_id = await get_staff_centre_id(current_user, db)
    entries = await get_audit_logs(db, centre_id, limit=limit, skip=skip)
    return ok(entries)


@router.get("/settings/centre", summary="Get centre configuration")
async def get_centre_settings(
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    centre_id = await get_staff_centre_id(current_user, db)
    from app.core.exceptions import not_found, AppError
    centre = await db.centres.find_one({"_id": ObjectId(centre_id)})
    if not centre:
        raise not_found("Centre", AppError.CENTRE_NOT_FOUND)
    centre["id"] = str(centre.pop("_id"))
    return ok(centre)


@router.patch("/settings/centre", summary="Update centre configuration (manager)")
async def update_centre_settings(
    body: CentreSettingsUpdateRequest,
    current_user: dict = Depends(require_manager),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    centre_id = await get_staff_centre_id(current_user, db)
    from app.utils.datetime_utils import utc_now
    update_data = {k: v for k, v in body.model_dump().items() if v is not None}
    update_data["updated_at"] = utc_now()

    await db.centres.update_one(
        {"_id": ObjectId(centre_id)},
        {"$set": update_data},
    )
    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Manager"),
        centre_id, "Updated centre configuration",
        details=str(list(update_data.keys())),
    )
    updated = await db.centres.find_one({"_id": ObjectId(centre_id)})
    updated["id"] = str(updated.pop("_id"))
    return ok(updated, "Centre settings updated.")
