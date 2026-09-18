from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Date, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.sql import func

from app.database import Base

if TYPE_CHECKING:
    from app.models.couple import Couple
    from app.models.gift import Gift


class GiftList(Base):
    __tablename__ = "gift_lists"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    couple_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("couples.id", ondelete="CASCADE"), nullable=False
    )
    public_token: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), unique=True, nullable=False, default=uuid.uuid4, index=True
    )
    title: Mapped[str] = mapped_column(String(300), nullable=False)
    wedding_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    couple: Mapped[Couple] = relationship("Couple", back_populates="gift_lists")
    gifts: Mapped[list[Gift]] = relationship(
        "Gift", back_populates="gift_list", cascade="all, delete-orphan"
    )

    @property
    def couple_name(self) -> str:
        return self.couple.name if self.couple else ""
