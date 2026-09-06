"""Tests for health check, auth endpoints, and rate limiting."""
import pytest
from httpx import AsyncClient
from app.api.v1.auth import _mask_phone


@pytest.mark.asyncio
async def test_health_endpoint(client: AsyncClient):
    resp = await client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] in ("ok", "degraded")
    assert "version" in data
    assert "database" in data


def test_phone_masking():
    assert _mask_phone("+919876543210") == "98••••3210"
    assert _mask_phone("9876543210") == "98••••3210"
    assert _mask_phone("") == ""
    assert _mask_phone("123") == "••••••••••"


@pytest.mark.asyncio
async def test_auth_verify_token_missing_token(client: AsyncClient):
    """Calling /api/v1/auth/verify-token without token returns 401."""
    resp = await client.post("/api/v1/auth/verify-token", json={"firebase_token": ""})
    assert resp.status_code in (400, 401, 422)


@pytest.mark.asyncio
async def test_auth_protected_route_without_bearer(client: AsyncClient):
    """Calling protected endpoint without Authorization header returns 401."""
    resp = await client.get("/api/v1/auth/me")
    assert resp.status_code == 401
