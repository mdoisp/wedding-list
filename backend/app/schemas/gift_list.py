import uuid
from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.gift import GiftResponse


class GiftListCreateRequest(BaseModel):
    title: str = Field(..., min_length=1, max_length=300)
    wedding_date: date | None = Field(default=None)


class GiftListUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=300)
    wedding_date: date | None = Field(default=None)


class GiftListResponse(BaseModel):
    id: uuid.UUID
    couple_id: uuid.UUID
    public_token: uuid.UUID
    title: str
    wedding_date: date | None = None
    created_at: datetime
    gifts: list[GiftResponse] = []

    model_config = ConfigDict(from_attributes=True)
