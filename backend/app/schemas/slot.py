"""Slot schemas."""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import Optional
from enum import Enum


class SlotStatus(str, Enum):
    available = "available"
    limited = "limited"
    full = "full"
    closed = "closed"


class SlotOut(BaseModel):
    id: str
    centre_id: str
    date: str
    time: str
    start_time: str
    end_time: str
    capacity: int
    booked: int
    available: int
    status: SlotStatus
    commodity: str
    note: Optional[str] = None


class SlotCreateRequest(BaseModel):
    date: str = Field(..., description="YYYY-MM-DD")
    start_time: str = Field(..., description="HH:MM (24h)")
    end_time: str = Field(..., description="HH:MM (24h)")
    capacity: int = Field(..., ge=1, le=500)
    commodity: str
    note: Optional[str] = None


class SlotUpdateCapacityRequest(BaseModel):
    capacity: int = Field(..., ge=1, le=500)


class RecommendedSlot(BaseModel):
    slot: SlotOut
    label: str
    why: str
    score: float
