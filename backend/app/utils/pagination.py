"""
KisanSetu Backend — Pagination helpers
Supports both page-number and cursor-based pagination.
"""
from __future__ import annotations

from typing import Any, List
from pydantic import BaseModel, Field


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)

    @property
    def skip(self) -> int:
        return (self.page - 1) * self.page_size

    @property
    def limit(self) -> int:
        return self.page_size


class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    has_next: bool
    has_prev: bool

    @classmethod
    def build(
        cls,
        items: List[Any],
        total: int,
        page: int,
        page_size: int,
    ) -> "PaginatedResponse":
        return cls(
            items=items,
            total=total,
            page=page,
            page_size=page_size,
            has_next=(page * page_size) < total,
            has_prev=page > 1,
        )


def mongo_id_str(doc: dict) -> dict:
    """Convert MongoDB ObjectId _id to a plain string 'id'."""
    if doc and "_id" in doc:
        doc["id"] = str(doc.pop("_id"))
    return doc
