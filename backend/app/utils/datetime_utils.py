"""
KisanSetu Backend — Date / Time Utilities
All times stored as UTC in DB. Displayed in IST (Asia/Kolkata, UTC+5:30) to users.
"""
from datetime import datetime, timezone, timedelta, date

try:
    from zoneinfo import ZoneInfo
    IST = ZoneInfo("Asia/Kolkata")
except Exception:
    IST = timezone(timedelta(hours=5, minutes=30), name="Asia/Kolkata")

UTC = timezone.utc
IST_OFFSET = timedelta(hours=5, minutes=30)


def utc_now() -> datetime:
    """Return current UTC datetime (timezone-aware)."""
    return datetime.now(UTC)


def ist_now() -> datetime:
    """Return current IST datetime (timezone-aware)."""
    return datetime.now(IST)


def to_ist(dt: datetime) -> datetime:
    """Convert any timezone-aware datetime to IST."""
    return dt.astimezone(IST)


def to_utc(dt: datetime) -> datetime:
    """Convert any timezone-aware datetime to UTC."""
    return dt.astimezone(UTC)


def format_ist(dt: datetime, fmt: str = "%d %b · %I:%M %p") -> str:
    """Format a datetime in IST for display."""
    return to_ist(dt).strftime(fmt)


def today_date_ist() -> date:
    """Return today's date in IST."""
    return ist_now().date()


def today_str_ist() -> str:
    """Return today's date as YYYY-MM-DD string in IST."""
    return today_date_ist().isoformat()


def parse_slot_time(date_str: str, time_str: str) -> datetime:
    """
    Parse a slot start/end time into a timezone-aware UTC datetime.
    date_str: "YYYY-MM-DD"
    time_str: "HH:MM"
    """
    naive = datetime.strptime(f"{date_str} {time_str}", "%Y-%m-%d %H:%M")
    ist_dt = naive.replace(tzinfo=IST)
    return ist_dt.astimezone(UTC)


def slot_time_label(start: str, end: str) -> str:
    """Format slot time range for display: '09:00–10:00 AM'"""
    def _fmt(t: str) -> str:
        h, m = map(int, t.split(":"))
        suffix = "AM" if h < 12 else "PM"
        h12 = h % 12 or 12
        return f"{h12}:{m:02d} {suffix}"
    return f"{_fmt(start)}–{_fmt(end)}"
