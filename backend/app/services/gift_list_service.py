import uuid

from sqlalchemy.orm import Session

from app.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.models.gift_list import GiftList
from app.schemas.gift_list import GiftListCreateRequest, GiftListUpdateRequest


class GiftListService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create_list(self, couple_id: uuid.UUID, data: GiftListCreateRequest) -> GiftList:
        existing = self.get_list_by_couple(couple_id)
        if existing:
            raise ConflictError("O casal já possui uma lista de presentes ativa")

        gift_list = GiftList(
            couple_id=couple_id,
            title=data.title,
            wedding_date=data.wedding_date,
            public_token=uuid.uuid4(),
        )
        self.db.add(gift_list)
        self.db.commit()
        self.db.refresh(gift_list)
        return gift_list

    def get_list_by_couple(self, couple_id: uuid.UUID) -> GiftList | None:
        return self.db.query(GiftList).filter(GiftList.couple_id == couple_id).first()

    def get_lists_by_couple(self, couple_id: uuid.UUID) -> list[GiftList]:
        return self.db.query(GiftList).filter(GiftList.couple_id == couple_id).all()

    def get_list_by_id(self, list_id: uuid.UUID, couple_id: uuid.UUID) -> GiftList:
        gift_list = self.db.get(GiftList, list_id)
        if not gift_list:
            raise NotFoundError("Lista de presentes não encontrada")
        if gift_list.couple_id != couple_id:
            raise ForbiddenError("Você não tem permissão para acessar esta lista de presentes")
        return gift_list

    def update_list(
        self, list_id: uuid.UUID, couple_id: uuid.UUID, data: GiftListUpdateRequest
    ) -> GiftList:
        gift_list = self.get_list_by_id(list_id, couple_id)

        update_data = data.model_dump(exclude_unset=True)
        if "title" in update_data and update_data["title"] is not None:
            gift_list.title = update_data["title"]
        if "wedding_date" in update_data:
            gift_list.wedding_date = update_data["wedding_date"]

        self.db.commit()
        self.db.refresh(gift_list)
        return gift_list

    def delete_list(self, list_id: uuid.UUID, couple_id: uuid.UUID) -> None:
        gift_list = self.get_list_by_id(list_id, couple_id)
        self.db.delete(gift_list)
        self.db.commit()
