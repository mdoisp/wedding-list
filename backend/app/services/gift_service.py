import uuid

from sqlalchemy.orm import Session

from app.exceptions import ForbiddenError, NotFoundError
from app.models.gift import Gift
from app.models.gift_list import GiftList
from app.schemas.gift import GiftCreateRequest, GiftUpdateRequest


class GiftService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _verify_list_ownership(self, list_id: uuid.UUID, couple_id: uuid.UUID) -> GiftList:
        gift_list = self.db.get(GiftList, list_id)
        if not gift_list:
            raise NotFoundError("Gift list not found")
        if gift_list.couple_id != couple_id:
            raise ForbiddenError("Not authorized to access this gift list")
        return gift_list

    def add_gift(self, list_id: uuid.UUID, couple_id: uuid.UUID, data: GiftCreateRequest) -> Gift:
        self._verify_list_ownership(list_id, couple_id)
        gift = Gift(
            gift_list_id=list_id,
            name=data.name,
            description=data.description,
            image_url=data.image_url,
            price=data.price,
            store_link=data.store_link,
            is_reserved=False,
        )
        self.db.add(gift)
        self.db.commit()
        self.db.refresh(gift)
        return gift

    def list_gifts(self, list_id: uuid.UUID, couple_id: uuid.UUID) -> list[Gift]:
        self._verify_list_ownership(list_id, couple_id)
        return (
            self.db.query(Gift)
            .filter(Gift.gift_list_id == list_id)
            .order_by(Gift.created_at.asc())
            .all()
        )

    def get_gift(self, list_id: uuid.UUID, gift_id: uuid.UUID, couple_id: uuid.UUID) -> Gift:
        self._verify_list_ownership(list_id, couple_id)
        gift = self.db.get(Gift, gift_id)
        if not gift or gift.gift_list_id != list_id:
            raise NotFoundError("Gift not found")
        return gift

    def update_gift(
        self,
        list_id: uuid.UUID,
        gift_id: uuid.UUID,
        couple_id: uuid.UUID,
        data: GiftUpdateRequest,
    ) -> Gift:
        gift = self.get_gift(list_id, gift_id, couple_id)

        update_data = data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(gift, field, value)

        self.db.commit()
        self.db.refresh(gift)
        return gift

    def delete_gift(self, list_id: uuid.UUID, gift_id: uuid.UUID, couple_id: uuid.UUID) -> None:
        gift = self.get_gift(list_id, gift_id, couple_id)
        self.db.delete(gift)
        self.db.commit()
