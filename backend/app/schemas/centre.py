"""Centre schemas — request and response models."""
from __future__ import annotations
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum


class CentreStatus(str, Enum):
    open = "open"
    closed = "closed"
    maintenance = "maintenance"


class SlotSummary(BaseModel):
    id: str
    time: str
    status: str
    available: int
    capacity: int
    commodity: str


class CentreListItem(BaseModel):
    id: str
    name: str
    address: str
    location: str
    district: str
    state: str
    status: CentreStatus
    operating_hours: str
    distance_km: Optional[float] = None
    wait_time_min: Optional[int] = None
    queue_count: int = 0
    available_slots_today: int = 0
    commodities: List[str] = []
    coordinates: Optional[dict] = None


class CentreDetail(CentreListItem):
    manager: Optional[str] = None
    phone: Optional[str] = None
    default_slot_capacity: int = 20
    max_daily_capacity: int = 140
    weighbridge_count: int = 2
    today_slots: List[SlotSummary] = []
    completed_today: int = 0
    active_queue: int = 0


class CentreMapItem(BaseModel):
    id: str
    name: str
    status: CentreStatus
    coordinates: dict
    queue_count: int = 0
    available_slots: int = 0
