"""
KisanSetu Backend — Notifications Router (farmer-facing)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Query, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.permissions import require_farmer
from app.schemas import ok
from app.services import notification_service
from app.utils.pagination import PaginatedResponse

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", summary="Get farmer notifications (paginated)")
@limiter.limit(settings.API_RATE_LIMIT)
async def get_notifications(
    request: Request,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    notifs, total = await notification_service.get_notifications(
        db, str(current_user["_id"]), page=page, page_size=page_size
    )
    for n in notifs:
        n["id"] = str(n.pop("_id"))
        from app.utils.datetime_utils import format_ist
        import datetime
        if isinstance(n.get("created_at"), datetime.datetime):
            n["created_at"] = format_ist(n["created_at"])
    return ok(PaginatedResponse.build(notifs, total, page, page_size))


@router.patch("/{notif_id}/read", summary="Mark notification as read")
async def mark_read(
    notif_id: str,
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    await notification_service.mark_read(db, notif_id, str(current_user["_id"]))
    return ok(message="Notification marked as read.")


@router.post("/read-all", summary="Mark all notifications as read")
async def mark_all_read(
    current_user: dict = Depends(require_farmer),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    count = await notification_service.mark_all_read(db, str(current_user["_id"]))
    return ok({"updated": count}, f"{count} notifications marked as read.")
