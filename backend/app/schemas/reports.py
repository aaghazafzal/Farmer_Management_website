"""Reports schemas."""
from __future__ import annotations
from pydantic import BaseModel
from typing import List, Optional


class DailyReportOut(BaseModel):
    date: str
    centre_id: str
    centre_name: str
    total_farmers: int
    completed: int
    delayed: int
    cancelled: int
    avg_wait_minutes: float
    peak_hour: Optional[str] = None
    commodities_breakdown: List[dict] = []
    slot_utilization_percent: float = 0.0
    throughput_per_hour: float = 0.0
    audit_log_count: int = 0


class AuditLogEntry(BaseModel):
    id: str
    time: str
    staff_name: str
    action: str
    details: Optional[str] = None
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None


class CentreSettingsOut(BaseModel):
    centre_id: str
    name: str
    address: str
    location: str
    operating_hours: str
    default_slot_capacity: int
    max_daily_capacity: int
    weighbridge_count: int
    status: str
    notification_sms_enabled: bool = True
    notification_queue_alerts: bool = True
    notification_slot_alerts: bool = True


class CentreSettingsUpdateRequest(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    operating_hours: Optional[str] = None
    default_slot_capacity: Optional[int] = None
    max_daily_capacity: Optional[int] = None
    notification_sms_enabled: Optional[bool] = None
    notification_queue_alerts: Optional[bool] = None
    notification_slot_alerts: Optional[bool] = None
