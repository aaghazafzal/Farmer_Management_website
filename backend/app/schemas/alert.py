"""Alert schemas."""
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional
from enum import Enum


class AlertType(str, Enum):
    queue = "queue"
    slot = "slot"
    centre = "centre"
    procurement = "procurement"
    general = "general"


class AlertStatus(str, Enum):
    active = "active"
    scheduled = "scheduled"
    sent = "sent"
    expired = "expired"
    cancelled = "cancelled"


class AlertCreateRequest(BaseModel):
    type: AlertType
    title: str
    message: str
    audience: str = "All active farmers in queue"


class AlertOut(BaseModel):
    id: str
    centre_id: str
    type: AlertType
    title: str
    message: str
    audience: str
    status: AlertStatus
    reach: int = 0
    created_by: str
    timestamp: str
    created_at: str
