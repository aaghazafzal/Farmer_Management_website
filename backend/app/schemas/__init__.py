"""Shared Pydantic base models and helpers."""
from __future__ import annotations
from pydantic import BaseModel, ConfigDict, Field
from typing import Any, Optional


class APIResponse(BaseModel):
    """Standard success envelope."""
    success: bool = True
    data: Any = None
    message: Optional[str] = None


def ok(data: Any = None, message: str | None = None) -> dict:
    return {"success": True, "data": data, "message": message}
