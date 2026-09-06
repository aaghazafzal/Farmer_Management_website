"""Farmer schemas."""
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional


class FarmerProfile(BaseModel):
    id: str
    farmer_reference: str
    name: str
    phone_masked: str
    village: str
    district: str
    state: str
    land_area: Optional[str] = None
    total_deliveries: int = 0
    preferred_commodity: Optional[str] = None


class FarmerRecord(BaseModel):
    """Staff view of a farmer — phone is masked."""
    id: str
    reference: str
    name: str
    phone_masked: str
    village: str
    current_booking_id: Optional[str] = None
    queue_number: Optional[str] = None
    commodity: Optional[str] = None
    quantity: Optional[str] = None
    status: Optional[str] = None
    last_updated: Optional[str] = None
    total_deliveries: int = 0
    land_area: Optional[str] = None
