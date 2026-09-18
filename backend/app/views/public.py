import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.exceptions import ConflictError, NotFoundError
from app.models.gift_list import GiftList
from app.models.reservation import Reservation
from app.schemas.reservation import (
    GiftListPublicResponse,
    ReservationResponse,
    ReserveGiftRequest,
)
from app.services.reservation_service import ReservationService

router = APIRouter(prefix="/public", tags=["Public"])


@router.get("/{public_token}", response_model=GiftListPublicResponse)
def get_public_list(
    public_token: uuid.UUID,
    db: Session = Depends(get_db),
) -> GiftList:
    service = ReservationService(db)
    try:
        return service.get_public_list(public_token)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post(
    "/{public_token}/gifts/{gift_id}/reserve",
    response_model=ReservationResponse,
    status_code=status.HTTP_201_CREATED,
)
def reserve_gift(
    public_token: uuid.UUID,
    gift_id: uuid.UUID,
    data: ReserveGiftRequest,
    db: Session = Depends(get_db),
) -> Reservation:
    service = ReservationService(db)
    try:
        return service.reserve_gift(public_token, gift_id, data)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
