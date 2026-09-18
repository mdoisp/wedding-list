import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.controllers.auth import get_current_couple
from app.database import get_db
from app.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.models.couple import Couple
from app.models.gift import Gift
from app.models.gift_list import GiftList
from app.schemas.gift import GiftCreateRequest, GiftResponse, GiftUpdateRequest
from app.schemas.gift_list import (
    GiftListCreateRequest,
    GiftListResponse,
    GiftListUpdateRequest,
)
from app.services.gift_list_service import GiftListService
from app.services.gift_service import GiftService

router = APIRouter(prefix="/lists", tags=["Gift Lists"])


@router.post("", response_model=GiftListResponse, status_code=status.HTTP_201_CREATED)
@router.post(
    "/",
    response_model=GiftListResponse,
    status_code=status.HTTP_201_CREATED,
    include_in_schema=False,
)
def create_list(
    data: GiftListCreateRequest,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> GiftList:
    service = GiftListService(db)
    try:
        return service.create_list(current_couple.id, data)
    except (ConflictError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("", response_model=list[GiftListResponse])
@router.get("/", response_model=list[GiftListResponse], include_in_schema=False)
def get_lists(
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> list[GiftList]:
    service = GiftListService(db)
    return service.get_lists_by_couple(current_couple.id)


@router.get("/{id}", response_model=GiftListResponse)
def get_list(
    id: uuid.UUID,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> GiftList:
    service = GiftListService(db)
    try:
        return service.get_list_by_id(id, current_couple.id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.put("/{id}", response_model=GiftListResponse)
def update_list(
    id: uuid.UUID,
    data: GiftListUpdateRequest,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> GiftList:
    service = GiftListService(db)
    try:
        return service.update_list(id, current_couple.id, data)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_list(
    id: uuid.UUID,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> None:
    service = GiftListService(db)
    try:
        service.delete_list(id, current_couple.id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.post(
    "/{id}/gifts",
    response_model=GiftResponse,
    status_code=status.HTTP_201_CREATED,
)
def add_gift(
    id: uuid.UUID,
    data: GiftCreateRequest,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> Gift:
    service = GiftService(db)
    try:
        return service.add_gift(id, current_couple.id, data)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.get("/{id}/gifts", response_model=list[GiftResponse])
def list_gifts(
    id: uuid.UUID,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> list[Gift]:
    service = GiftService(db)
    try:
        return service.list_gifts(id, current_couple.id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.get("/{id}/gifts/{gift_id}", response_model=GiftResponse)
def get_gift(
    id: uuid.UUID,
    gift_id: uuid.UUID,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> Gift:
    service = GiftService(db)
    try:
        return service.get_gift(id, gift_id, current_couple.id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.put("/{id}/gifts/{gift_id}", response_model=GiftResponse)
def update_gift(
    id: uuid.UUID,
    gift_id: uuid.UUID,
    data: GiftUpdateRequest,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> Gift:
    service = GiftService(db)
    try:
        return service.update_gift(id, gift_id, current_couple.id, data)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc


@router.delete("/{id}/gifts/{gift_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_gift(
    id: uuid.UUID,
    gift_id: uuid.UUID,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> None:
    service = GiftService(db)
    try:
        service.delete_gift(id, gift_id, current_couple.id)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ForbiddenError as exc:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(exc)) from exc
