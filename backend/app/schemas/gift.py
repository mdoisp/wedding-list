import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class GiftCreateRequest(BaseModel):
    name: str = Field(..., min_length=1, max_length=300)
    description: str | None = Field(default=None)
    image_url: str | None = Field(default=None, max_length=2048)
    price: Decimal | None = Field(default=None, ge=0)
    store_link: str | None = Field(default=None, max_length=2048)


class GiftUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=300)
    description: str | None = Field(default=None)
    image_url: str | None = Field(default=None, max_length=2048)
    price: Decimal | None = Field(default=None, ge=0)
    store_link: str | None = Field(default=None, max_length=2048)


class GiftResponse(BaseModel):
    id: uuid.UUID
    gift_list_id: uuid.UUID
    name: str
    description: str | None = None
    image_url: str | None = None
    price: Decimal | None = None
    store_link: str | None = None
    is_reserved: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
