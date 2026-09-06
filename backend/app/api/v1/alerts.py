"""
KisanSetu Backend — Alerts Router (staff-facing)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.permissions import require_staff, get_staff_centre_id
from app.schemas import ok
from app.schemas.alert import AlertCreateRequest
from app.services import alert_service
from app.services.audit_service import add_audit_log

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/alerts", tags=["Alerts"])


@router.get("", summary="Get centre broadcast alerts")
@limiter.limit(settings.API_RATE_LIMIT)
async def get_alerts(
    request: Request,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    centre_id = await get_staff_centre_id(current_user, db)
    alerts = await alert_service.get_alerts(db, centre_id)
    return ok(alerts)


@router.post("", summary="Create and broadcast a new alert")
@limiter.limit(settings.ALERT_RATE_LIMIT)
async def create_alert(
    request: Request,
    body: AlertCreateRequest,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    centre_id = await get_staff_centre_id(current_user, db)
    alert = await alert_service.create_alert(
        db, centre_id,
        alert_type=body.type.value,
        title=body.title,
        message=body.message,
        audience=body.audience,
        created_by_name=current_user.get("display_name", "Staff"),
        actor_id=str(current_user["_id"]),
    )
    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Staff"),
        centre_id, f"Broadcast alert: {body.title}",
        entity_type="alert", entity_id=alert["id"],
    )
    return ok(alert, "Alert broadcast to active farmers.")


@router.patch("/{alert_id}/cancel", summary="Cancel an alert")
async def cancel_alert(
    alert_id: str,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    centre_id = await get_staff_centre_id(current_user, db)
    alert = await alert_service.cancel_alert(db, alert_id, centre_id)
    return ok(alert, "Alert cancelled.")
