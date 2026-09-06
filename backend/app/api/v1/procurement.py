"""
KisanSetu Backend — Procurement Router
"""
from __future__ import annotations

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.core.permissions import require_staff
from app.schemas import ok
from app.schemas.procurement import ProcurementStatusUpdateRequest, ProcurementDetailsUpdateRequest
from app.services import procurement_service
from app.services.audit_service import add_audit_log

router = APIRouter(prefix="/procurements", tags=["Procurement"])


@router.get("/{procurement_id}", summary="Get procurement record with history")
async def get_procurement(
    procurement_id: str,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    proc = await procurement_service.get_procurement_by_id(db, procurement_id)
    return ok(proc)


@router.patch("/{procurement_id}/status", summary="Update procurement status")
async def update_status(
    procurement_id: str,
    body: ProcurementStatusUpdateRequest,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    proc = await procurement_service.update_procurement_status(
        db, procurement_id,
        new_status=body.status.value,
        staff_name=current_user.get("display_name", "Staff"),
        actor_id=str(current_user["_id"]),
        note=body.note,
        weighbridge_bay=body.weighbridge_bay,
    )
    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Staff"),
        proc["centre_id"],
        f"Procurement {proc['booking_reference']} → {body.status.value}",
        details=body.note,
        entity_type="procurement", entity_id=procurement_id,
    )
    return ok(proc)


@router.patch("/{procurement_id}/details", summary="Update weighment, moisture, grade")
async def update_details(
    procurement_id: str,
    body: ProcurementDetailsUpdateRequest,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    proc = await procurement_service.update_procurement_details(
        db, procurement_id,
        weight_measured=body.weight_measured,
        moisture_percent=body.moisture_percent,
        grade=body.grade,
        delay_reason=body.delay_reason,
    )
    return ok(proc)
