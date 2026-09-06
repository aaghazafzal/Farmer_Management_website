"""
KisanSetu Backend — Queue Router
Staff-facing queue management endpoints.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_db
from app.core.permissions import require_staff, get_staff_centre_id
from app.schemas import ok
from app.schemas.queue import QueueStatusUpdateRequest, QueueDelayRequest
from app.services import queue_service
from app.services.audit_service import add_audit_log

router = APIRouter(prefix="/queue", tags=["Queue"])


@router.get("/{centre_id}", summary="Get full live queue state for a centre")
async def get_queue(
    centre_id: str,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    state = await queue_service.get_queue_state(db, centre_id)
    return ok(state)


@router.get("/entry/{entry_id}", summary="Get single queue entry")
async def get_queue_entry(
    entry_id: str,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    from bson import ObjectId
    from app.core.exceptions import not_found, AppError
    entry = await db.queue_entries.find_one({"_id": ObjectId(entry_id)})
    if not entry:
        raise not_found("Queue entry", AppError.QUEUE_NOT_FOUND)
    entry["id"] = str(entry.pop("_id"))
    return ok(entry)


@router.post("/{centre_id}/call-next", summary="Call next token in queue")
async def call_next(
    centre_id: str,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    """Advances queue to the next WAITING or ARRIVED entry → PROCESSING."""
    entry = await queue_service.call_next_token(
        db, centre_id,
        actor_id=str(current_user["_id"]),
        actor_name=current_user.get("display_name", "Staff"),
    )
    if not entry:
        return ok(None, "Queue is empty — no farmers waiting.")

    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Staff"),
        centre_id, f"Called Token {entry['token']} to processing",
        entity_type="queue_entry", entity_id=entry["id"],
    )
    return ok(entry, f"Token {entry['token']} called to processing.")


@router.patch("/entry/{entry_id}/status", summary="Update queue entry status")
async def update_status(
    entry_id: str,
    body: QueueStatusUpdateRequest,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    from bson import ObjectId
    entry = await db.queue_entries.find_one({"_id": ObjectId(entry_id)})
    centre_id = str(entry["centre_id"]) if entry else ""

    updated = await queue_service.update_queue_status(
        db, entry_id, body.status.value,
        actor_id=str(current_user["_id"]),
        actor_name=current_user.get("display_name", "Staff"),
        centre_id=centre_id,
        weighbridge_bay=body.weighbridge_bay,
    )
    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Staff"),
        centre_id, f"Updated Token {updated['token']} → {body.status.value}",
        details=f"Bay: {body.weighbridge_bay}" if body.weighbridge_bay else None,
        entity_type="queue_entry", entity_id=entry_id,
    )
    return ok(updated)


@router.patch("/entry/{entry_id}/delay", summary="Mark queue entry as delayed")
async def delay_entry(
    entry_id: str,
    body: QueueDelayRequest,
    current_user: dict = Depends(require_staff),
    db: AsyncIOMotorDatabase = Depends(get_db),
):
    from bson import ObjectId
    entry = await db.queue_entries.find_one({"_id": ObjectId(entry_id)})
    centre_id = str(entry["centre_id"]) if entry else ""

    updated = await queue_service.mark_delayed(
        db, entry_id, body.reason,
        actor_id=str(current_user["_id"]),
        actor_name=current_user.get("display_name", "Staff"),
        centre_id=centre_id,
    )
    await add_audit_log(
        db, str(current_user["_id"]), current_user.get("display_name", "Staff"),
        centre_id,
        f"Flagged delay for Token {updated['token']}",
        details=body.reason,
        entity_type="queue_entry", entity_id=entry_id,
    )
    return ok(updated)
