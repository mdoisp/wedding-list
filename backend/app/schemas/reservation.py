import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class ReserveGiftRequest(BaseModel):
    guest_name: str = Field(..., min_length=1, max_length=200)
    guest_email: EmailStr


class ReservationResponse(BaseModel):
    id: uuid.UUID
    gift_id: uuid.UUID
    guest_name: str
    guest_email: str
    reserved_at: datetime

    model_config = ConfigDict(from_attributes=True)


class GiftPublicResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None = None
    image_url: str | None = None
    price: Decimal | None = None
    store_link: str | None = None
    is_reserved: bool = False

    model_config = ConfigDict(from_attributes=True)


class GiftListPublicResponse(BaseModel):
    id: uuid.UUID
    public_token: uuid.UUID
    title: str
    wedding_date: date | None = None
    couple_name: str
    gifts: list[GiftPublicResponse] = []

    model_config = ConfigDict(from_attributes=True)
