import uuid

from pydantic import BaseModel, EmailStr

from app.schemas.gift import GiftCreateRequest, GiftResponse, GiftUpdateRequest
from app.schemas.gift_list import (
    GiftListCreateRequest,
    GiftListResponse,
    GiftListUpdateRequest,
)
from app.schemas.pix import PixQrCodeResponse
from app.schemas.reservation import (
    GiftListPublicResponse,
    GiftPublicResponse,
    ReservationResponse,
    ReserveGiftRequest,
)


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class CoupleUpdateRequest(BaseModel):
    name: str | None = None
    pix_key: str | None = None
    pix_key_type: str | None = None
    email_notifications_enabled: bool | None = None


class CouplePublicResponse(BaseModel):
    id: uuid.UUID
    name: str
    email: str
    pix_key: str | None = None
    pix_key_type: str | None = None
    email_notifications_enabled: bool = True

    model_config = {"from_attributes": True}


__all__ = [
    "RegisterRequest",
    "LoginRequest",
    "TokenResponse",
    "RefreshRequest",
    "CouplePublicResponse",
    "CoupleUpdateRequest",
    "GiftCreateRequest",
    "GiftUpdateRequest",
    "GiftResponse",
    "GiftListCreateRequest",
    "GiftListUpdateRequest",
    "GiftListResponse",
    "ReserveGiftRequest",
    "ReservationResponse",
    "GiftPublicResponse",
    "GiftListPublicResponse",
    "PixQrCodeResponse",
]
