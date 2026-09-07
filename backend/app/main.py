"""
KisanSetu Backend — FastAPI Application Factory
================================================================
Entry point: uvicorn app.main:app --reload --port 8000

Security layers (applied globally):
  1. CORS — strict origin whitelist from FRONTEND_ORIGINS env var
  2. Rate limiting — slowapi per-IP, strictest on auth (5/min)
  3. RBAC — role-checked on every protected route via Depends()
  4. Exception normalisation — no stack traces or raw errors exposed
  5. Health check — /health endpoint for uptime monitoring
================================================================
"""
from __future__ import annotations

import asyncio
import logging
import time
from contextlib import asynccontextmanager

import httpx

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from slowapi.util import get_remote_address
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.v1 import auth, centres, bookings, farmers, slots, queue, procurement
from app.api.v1 import notifications, alerts, reports, dashboard, staff, websocket
from app.core.config import settings
from app.core.database import connect_db, disconnect_db, ping_db
from app.core.exceptions import (
    KisanSetuException,
    kisansetu_exception_handler,
    http_exception_handler,
    validation_exception_handler,
    generic_exception_handler,
)
from app.core.security import init_firebase

# ── Logging ───────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger(__name__)

# ── Rate limiter (global) ─────────────────────────────────────────────────────
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[settings.API_RATE_LIMIT],
    storage_uri="memory://",  # Switch to "redis://..." in production for multi-process
)


# ── Lifespan (startup / shutdown) ─────────────────────────────────────────────
async def self_ping():
    """Background task to ping the service every 6 minutes to prevent sleep on free tiers."""
    while True:
        try:
            await asyncio.sleep(360)  # 6 minutes
            port = settings.PORT
            url = f"http://127.0.0.1:{port}/health"
            async with httpx.AsyncClient() as client:
                await client.get(url, timeout=10.0)
                logger.info("Self-ping executed to prevent sleep")
        except asyncio.CancelledError:
            break
        except Exception as e:
            logger.error(f"Self-ping failed: {e}")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown lifecycle."""
    logger.info("KisanSetu backend starting (env=%s)", settings.ENVIRONMENT)
    init_firebase()
    await connect_db()
    logger.info("KisanSetu backend ready on port %d", settings.PORT)
    
    # Start self-ping task
    ping_task = asyncio.create_task(self_ping())
    
    yield
    
    ping_task.cancel()
    await disconnect_db()
    logger.info("KisanSetu backend shut down cleanly")


# ── FastAPI app ───────────────────────────────────────────────────────────────
def create_app() -> FastAPI:
    app = FastAPI(
        title="KisanSetu API",
        description=(
            "Backend API powering KisanSetu — the procurement-centre coordination platform "
            "for farmers in Punjab. Provides slot booking, live queue tracking, and procurement "
            "status for both farmers and centre staff."
        ),
        version=settings.APP_VERSION,
        lifespan=lifespan,
        # Hide docs in production for security
        docs_url="/docs" if not settings.is_production else None,
        redoc_url="/redoc" if not settings.is_production else None,
        openapi_url="/openapi.json" if not settings.is_production else None,
    )

    # ── State for rate limiter ─────────────────────────────────────────────
    app.state.limiter = limiter

    # ── CORS ─────────────────────────────────────────────────────────────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["*"],
    )

    # ── Rate limiting middleware ──────────────────────────────────────────────
    app.add_middleware(SlowAPIMiddleware)

    # ── Request timing middleware (dev only) ─────────────────────────────────
    if settings.is_development:
        @app.middleware("http")
        async def add_process_time_header(request: Request, call_next):
            start = time.perf_counter()
            response = await call_next(request)
            elapsed = round((time.perf_counter() - start) * 1000, 2)
            response.headers["X-Process-Time-Ms"] = str(elapsed)
            return response

    # ── Exception handlers ────────────────────────────────────────────────────
    app.add_exception_handler(KisanSetuException, kisansetu_exception_handler)
    app.add_exception_handler(StarletteHTTPException, http_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_exception_handler(Exception, generic_exception_handler)

    # ── API Routers ───────────────────────────────────────────────────────────
    api_prefix = "/api/v1"
    app.include_router(auth.router, prefix=api_prefix)
    app.include_router(centres.router, prefix=api_prefix)
    app.include_router(bookings.router, prefix=api_prefix)
    app.include_router(farmers.router, prefix=api_prefix)
    app.include_router(slots.router, prefix=api_prefix)
    app.include_router(queue.router, prefix=api_prefix)
    app.include_router(procurement.router, prefix=api_prefix)
    app.include_router(notifications.router, prefix=api_prefix)
    app.include_router(alerts.router, prefix=api_prefix)
    app.include_router(reports.router, prefix=api_prefix)
    app.include_router(dashboard.router, prefix=api_prefix)
    app.include_router(staff.router, prefix=api_prefix)
    app.include_router(websocket.router, prefix=api_prefix)

    # ── Health & Config Routes ────────────────────────────────────────────────

    @app.get("/health", tags=["Health"], summary="Service health check")
    async def health():
        db_ok = await ping_db()
        return {
            "status": "ok" if db_ok else "degraded",
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "database": "connected" if db_ok else "unreachable",
        }

    @app.get("/api/v1/config/maps", tags=["Config"], summary="Serve Google Maps API key securely")
    async def get_maps_key():
        """
        Returns the Google Maps API key to the frontend.
        The key is never hardcoded in frontend code — fetched at runtime from this endpoint.
        """
        if not settings.GOOGLE_MAPS_API_KEY:
            return JSONResponse(status_code=503, content={"success": False, "error": {"code": "CONFIG_MISSING", "message": "Maps API key not configured."}})
        return {"success": True, "key": settings.GOOGLE_MAPS_API_KEY}

    return app


app = create_app()
