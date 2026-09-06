"""Notification schemas."""
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional


class NotificationOut(BaseModel):
    id: str
    title: str
    message: str
    type: str
    read: bool = False
    created_at: str
    action_url: Optional[str] = None
