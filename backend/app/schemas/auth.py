"""Auth schemas."""
from __future__ import annotations
from pydantic import BaseModel
from typing import Optional


class VerifyTokenRequest(BaseModel):
    firebase_token: str

class UserOut(BaseModel):
    id: str
    firebase_uid: str
    phone: Optional[str] = None
    display_name: Optional[str] = None
    role: str
    is_active: bool = True
    created_at: Optional[str] = None

class AuthResponse(BaseModel):
    success: bool = True
    user: UserOut
    is_new_user: bool = False
