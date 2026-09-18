import uuid

from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, selectinload

from app.exceptions import ConflictError, NotFoundError
from app.models.gift import Gift
from app.models.gift_list import GiftList
from app.models.reservation import Reservation
from app.schemas.reservation import ReserveGiftRequest


class ReservationService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def get_public_list(self, public_token: uuid.UUID) -> GiftList:
        gift_list = (
            self.db.query(GiftList)
            .options(joinedload(GiftList.couple), selectinload(GiftList.gifts))
            .filter(GiftList.public_token == public_token)
            .first()
        )
        if not gift_list:
            raise NotFoundError("Gift list not found")
        return gift_list

    def reserve_gift(
        self, public_token: uuid.UUID, gift_id: uuid.UUID, data: ReserveGiftRequest
    ) -> Reservation:
        gift_list = self.db.query(GiftList).filter(GiftList.public_token == public_token).first()
        if not gift_list:
            raise NotFoundError("Gift list not found")

        gift = (
            self.db.query(Gift)
            .filter(Gift.id == gift_id, Gift.gift_list_id == gift_list.id)
            .with_for_update()
            .first()
        )
        if not gift:
            raise NotFoundError("Gift not found in this list")

        if gift.is_reserved:
            raise ConflictError("This gift has already been reserved")

        gift.is_reserved = True
        reservation = Reservation(
            gift_id=gift.id,
            guest_name=data.guest_name.strip(),
            guest_email=data.guest_email.lower().strip(),
        )
        self.db.add(reservation)

        try:
            self.db.commit()
        except IntegrityError as exc:
            self.db.rollback()
            raise ConflictError("This gift has already been reserved") from exc

        self.db.refresh(reservation)
        return reservation
