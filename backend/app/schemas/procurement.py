"""Procurement schemas."""
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class ProcurementStatus(str, Enum):
    waiting = "waiting"
    in_progress = "in_progress"
    verification = "verification"
    delayed = "delayed"
    completed = "completed"
    rejected = "rejected"


class ProcurementHistoryEntry(BaseModel):
    timestamp: str
    status: ProcurementStatus
    staff_name: str
    note: Optional[str] = None


class ProcurementOut(BaseModel):
    id: str
    booking_id: str
    booking_reference: str
    farmer_id: str
    farmer_name: str
    centre_id: str
    centre_name: str
    status: ProcurementStatus
    commodity: str
    quantity_quintals: float
    weighbridge_bay: Optional[str] = None
    weight_measured: Optional[float] = None
    moisture_percent: Optional[float] = None
    grade: Optional[str] = None
    delay_reason: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    history: List[ProcurementHistoryEntry] = []


class ProcurementStatusUpdateRequest(BaseModel):
    status: ProcurementStatus
    note: Optional[str] = None
    weighbridge_bay: Optional[str] = None


class ProcurementDetailsUpdateRequest(BaseModel):
    weight_measured: Optional[float] = None
    moisture_percent: Optional[float] = None
    grade: Optional[str] = None
    delay_reason: Optional[str] = None
