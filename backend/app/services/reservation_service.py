import uuid

from fastapi import BackgroundTasks
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload, selectinload

from app.exceptions import ConflictError, NotFoundError
from app.models.gift import Gift
from app.models.gift_list import GiftList
from app.models.reservation import Reservation
from app.schemas.reservation import ReserveGiftRequest
from app.services.email_service import EmailService


class ReservationService:
    def __init__(self, db: Session, email_service: EmailService | None = None) -> None:
        self.db = db
        self.email_service = email_service or EmailService()

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
        self,
        public_token: uuid.UUID,
        gift_id: uuid.UUID,
        data: ReserveGiftRequest,
        background_tasks: BackgroundTasks | None = None,
    ) -> Reservation:
        gift_list = (
            self.db.query(GiftList)
            .options(joinedload(GiftList.couple))
            .filter(GiftList.public_token == public_token)
            .first()
        )
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

        if background_tasks is not None and gift_list.couple:
            background_tasks.add_task(
                self.email_service.send_reservation_confirmation_to_guest,
                guest_name=reservation.guest_name,
                guest_email=reservation.guest_email,
                couple_name=gift_list.couple.name,
                gift_name=gift.name,
                gift_price=gift.price,
                store_link=gift.store_link,
            )

            if gift_list.couple.email_notifications_enabled:
                background_tasks.add_task(
                    self.email_service.send_reservation_notification_to_couple,
                    couple_email=gift_list.couple.email,
                    couple_name=gift_list.couple.name,
                    guest_name=reservation.guest_name,
                    guest_email=reservation.guest_email,
                    gift_name=gift.name,
                )

        return reservation
