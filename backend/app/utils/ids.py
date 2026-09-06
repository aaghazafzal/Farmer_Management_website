"""
KisanSetu Backend — ID Generation Utilities
"""
from __future__ import annotations

import random
import string
from datetime import datetime
from app.utils.datetime_utils import IST


def generate_booking_reference() -> str:
    """
    Generate a unique booking reference in the format: KS-YYMMDD-NNNN
    Example: KS-240912-0811
    Matches the format used in the frontend mock data.
    """
    now = datetime.now(IST)
    date_part = now.strftime("%y%m%d")
    seq = random.randint(1000, 9999)
    return f"KS-{date_part}-{seq:04d}"


def generate_farmer_reference() -> str:
    """
    Generate a farmer reference ID: F-NNNNN
    Example: F-10482
    """
    n = random.randint(10000, 99999)
    return f"F-{n}"


def generate_queue_token(number: int) -> str:
    """Format a queue number as a token string: '#08'"""
    return f"#{number:02d}"


def generate_alert_id() -> str:
    """Generate a short alert ID: ALT-XXXX"""
    suffix = "".join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f"ALT-{suffix}"


def generate_short_id(prefix: str = "", length: int = 8) -> str:
    """Generic short ID for audit logs, notifications, etc."""
    chars = string.ascii_uppercase + string.digits
    suffix = "".join(random.choices(chars, k=length))
    return f"{prefix}{suffix}" if prefix else suffix
