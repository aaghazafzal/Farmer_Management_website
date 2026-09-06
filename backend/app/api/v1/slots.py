"""
KisanSetu Backend — Slots Router (staff operations)
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.config import settings
from app.core.database import get_db
from app.core.permissions import require_staff, require_manager, get_staff_centre_id
from app.schemas import ok
from app.schemas.slot import SlotCreateRequest, SlotUpdateCapacityRequest
from app.services import slot_service
from app.services.audit_service import add_audit_log
from app.utils.datetime_utils import today_str_ist

limiter = Limiter(key_func=get_remote_address)
router = APIRouter(prefix="/slots", tags=["Slots"])


@router.get("/{slot_id}", summary="Get slot detail")
async def get_slot(
    slot_id: str,
    _=Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    slot = await slot_service.get_slot_by_id(db, slot_id)
    return ok(slot)


@router.post("/centre/{centre_id}", summary="Create a new slot (manager)")
async def create_slot(
    centre_id: str,
    body: SlotCreateRequest,
    current_user: dict = Depends(require_manager),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    slot = await slot_service.create_slot(
        db,
        centre_id=centre_id,
        date=body.date,
        start_time=body.start_time,
        end_time=body.end_time,
        capacity=body.capacity,
        commodity=body.commodity,
        note=body.note,
    )
    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Staff"),
        centre_id, f"Created slot {body.start_time}–{body.end_time} (cap {body.capacity})",
        entity_type="slot", entity_id=slot["id"],
    )
    return ok(slot, "Slot created.")


@router.patch("/{slot_id}/capacity", summary="Adjust slot capacity")
async def update_capacity(
    slot_id: str,
    body: SlotUpdateCapacityRequest,
    current_user: dict = Depends(require_manager),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    slot = await slot_service.update_slot_capacity(db, slot_id, body.capacity)
    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Staff"),
        slot["centre_id"], f"Updated slot capacity to {body.capacity}",
        entity_type="slot", entity_id=slot_id,
    )
    return ok(slot, "Capacity updated.")


@router.post("/{slot_id}/close", summary="Close a slot")
async def close_slot(
    slot_id: str,
    current_user: dict = Depends(require_manager),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    slot = await slot_service.close_slot(db, slot_id)
    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Staff"),
        slot["centre_id"], "Closed slot",
        entity_type="slot", entity_id=slot_id,
    )
    return ok(slot, "Slot closed.")


@router.post("/{slot_id}/reopen", summary="Reopen a closed slot")
async def reopen_slot(
    slot_id: str,
    current_user: dict = Depends(require_manager),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    slot = await slot_service.reopen_slot(db, slot_id)
    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Staff"),
        slot["centre_id"], "Reopened slot",
        entity_type="slot", entity_id=slot_id,
    )
    return ok(slot, "Slot reopened.")
