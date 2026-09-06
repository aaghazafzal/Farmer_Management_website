"""Queue schemas."""
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class QueueStatus(str, Enum):
    waiting = "waiting"
    arrived = "arrived"
    processing = "processing"
    delayed = "delayed"
    completed = "completed"
    cancelled = "cancelled"


class QueueEntryOut(BaseModel):
    id: str
    centre_id: str
    queue_number: int
    token: str           # e.g. "#08"
    booking_id: str
    booking_reference: str
    farmer_name: str
    phone_masked: str
    slot_time: str
    arrived_at: Optional[str] = None
    status: QueueStatus
    commodity: str
    quantity: str
    estimated_wait: Optional[str] = None
    delay_reason: Optional[str] = None
    weighbridge_bay: Optional[str] = None


class QueueStatusUpdateRequest(BaseModel):
    status: QueueStatus
    weighbridge_bay: Optional[str] = None


class QueueDelayRequest(BaseModel):
    reason: str


class QueueStateOut(BaseModel):
    centre_id: str
    entries: List[QueueEntryOut]
    active_count: int
    processing_count: int
    delayed_count: int
    completed_today: int
    now_serving_token: Optional[str] = None
    last_updated: str
