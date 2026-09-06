"""Booking schemas."""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class BookingStatus(str, Enum):
    upcoming = "upcoming"
    arrived = "arrived"
    processing = "processing"
    completed = "completed"
    cancelled = "cancelled"
    no_show = "no_show"


class BookingCreateRequest(BaseModel):
    centre_id: str
    slot_id: str
    commodity: str
    quantity_quintals: float = Field(..., gt=0, le=2000)
    notes: Optional[str] = None


class BookingCancelRequest(BaseModel):
    reason: Optional[str] = None


class BookingRescheduleRequest(BaseModel):
    new_slot_id: str


class BookingOut(BaseModel):
    id: str
    booking_reference: str
    farmer_id: str
    centre_id: str
    centre_name: str
    slot_id: str
    slot_time: str
    booking_date: str
    commodity: str
    quantity_quintals: float
    status: BookingStatus
    queue_position: Optional[str] = None
    queue_number: Optional[int] = None
    created_at: str
    updated_at: Optional[str] = None
    cancelled_at: Optional[str] = None
    cancel_reason: Optional[str] = None
    # Realtime augmented fields
    weighbridge_bay: Optional[str] = None
    estimated_wait: Optional[str] = None
    now_serving: Optional[str] = None
    last_updated: Optional[str] = None
    delay_reason: Optional[str] = None
    serving_started: Optional[str] = None
