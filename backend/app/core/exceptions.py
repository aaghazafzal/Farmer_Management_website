"""
KisanSetu Backend — Custom HTTP Exceptions
All errors use consistent JSON with a stable error code the frontend can key on.
"""
from __future__ import annotations

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


# ─── Error code catalogue ────────────────────────────────────────────────────

class AppError:
    # Auth
    AUTH_REQUIRED = "AUTH_REQUIRED"
    AUTH_INVALID = "AUTH_INVALID"
    AUTH_EXPIRED = "AUTH_EXPIRED"
    FORBIDDEN = "FORBIDDEN"
    INACTIVE_USER = "INACTIVE_USER"
    RATE_LIMITED = "RATE_LIMITED"

    # Centres
    CENTRE_NOT_FOUND = "CENTRE_NOT_FOUND"
    CENTRE_CLOSED = "CENTRE_CLOSED"
    CENTRE_ACCESS_DENIED = "CENTRE_ACCESS_DENIED"

    # Slots
    SLOT_NOT_FOUND = "SLOT_NOT_FOUND"
    SLOT_FULL = "SLOT_FULL"
    SLOT_CLOSED = "SLOT_CLOSED"
    SLOT_EXPIRED = "SLOT_EXPIRED"
    SLOT_OVERLAP = "SLOT_OVERLAP"
    SLOT_CAPACITY_CONFLICT = "SLOT_CAPACITY_CONFLICT"

    # Bookings
    BOOKING_NOT_FOUND = "BOOKING_NOT_FOUND"
    BOOKING_CONFLICT = "BOOKING_CONFLICT"
    BOOKING_NOT_CANCELLABLE = "BOOKING_NOT_CANCELLABLE"
    BOOKING_NOT_RESCHEDULABLE = "BOOKING_NOT_RESCHEDULABLE"
    BOOKING_DUPLICATE = "BOOKING_DUPLICATE"

    # Queue
    QUEUE_NOT_FOUND = "QUEUE_NOT_FOUND"
    INVALID_QUEUE_TRANSITION = "INVALID_QUEUE_TRANSITION"
    QUEUE_ALREADY_PROCESSING = "QUEUE_ALREADY_PROCESSING"
    QUEUE_EMPTY = "QUEUE_EMPTY"

    # Procurement
    PROCUREMENT_NOT_FOUND = "PROCUREMENT_NOT_FOUND"
    INVALID_PROCUREMENT_TRANSITION = "INVALID_PROCUREMENT_TRANSITION"

    # Farmers / Users
    FARMER_NOT_FOUND = "FARMER_NOT_FOUND"
    USER_NOT_FOUND = "USER_NOT_FOUND"
    STAFF_NOT_FOUND = "STAFF_NOT_FOUND"

    # Notifications / Alerts
    NOTIFICATION_NOT_FOUND = "NOTIFICATION_NOT_FOUND"
    ALERT_NOT_FOUND = "ALERT_NOT_FOUND"

    # Generic
    VALIDATION_ERROR = "VALIDATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    SERVER_ERROR = "SERVER_ERROR"


# ─── Exception class ─────────────────────────────────────────────────────────

class KisanSetuException(HTTPException):
    """
    Application exception with a stable error code and human-readable message.
    Never exposes stack traces or raw DB errors.
    """

    def __init__(
        self,
        status_code: int,
        code: str,
        message: str,
        detail: str | None = None,
    ) -> None:
        self.code = code
        self.message = message
        self.detail = detail
        super().__init__(status_code=status_code, detail=message)


# ─── FastAPI exception handler ────────────────────────────────────────────────

async def kisansetu_exception_handler(
    request: Request, exc: KisanSetuException
) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": exc.code,
                "message": exc.message,
            },
        },
    )


async def http_exception_handler(
    request: Request, exc: HTTPException
) -> JSONResponse:
    """Catch all other FastAPI HTTPExceptions and normalise them."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "code": "HTTP_ERROR",
                "message": str(exc.detail),
            },
        },
    )


async def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Pydantic request validation errors — never expose raw schema errors."""
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "code": AppError.VALIDATION_ERROR,
                "message": "Request validation failed. Please check your input.",
            },
        },
    )


async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Catch-all for unhandled exceptions. Never exposes stack traces."""
    import logging
    logging.getLogger(__name__).exception("Unhandled error on %s", request.url)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": {
                "code": AppError.SERVER_ERROR,
                "message": "An internal server error occurred.",
            },
        },
    )


# ─── Shorthand constructors ───────────────────────────────────────────────────

def not_found(resource: str, code: str = AppError.NOT_FOUND) -> KisanSetuException:
    return KisanSetuException(404, code, f"{resource} was not found.")

def forbidden(msg: str = "You do not have permission to perform this action.") -> KisanSetuException:
    return KisanSetuException(403, AppError.FORBIDDEN, msg)

def auth_required() -> KisanSetuException:
    return KisanSetuException(401, AppError.AUTH_REQUIRED, "Authentication required.")

def auth_invalid() -> KisanSetuException:
    return KisanSetuException(401, AppError.AUTH_INVALID, "Invalid or expired authentication token.")

def slot_full() -> KisanSetuException:
    return KisanSetuException(409, AppError.SLOT_FULL, "This procurement slot is already full.")

def slot_closed() -> KisanSetuException:
    return KisanSetuException(409, AppError.SLOT_CLOSED, "This procurement slot is closed.")

def invalid_queue_transition(from_s: str, to_s: str) -> KisanSetuException:
    return KisanSetuException(
        409, AppError.INVALID_QUEUE_TRANSITION,
        f"Cannot transition queue from '{from_s}' to '{to_s}'."
    )

def invalid_procurement_transition(from_s: str, to_s: str) -> KisanSetuException:
    return KisanSetuException(
        409, AppError.INVALID_PROCUREMENT_TRANSITION,
        f"Cannot transition procurement from '{from_s}' to '{to_s}'."
    )
