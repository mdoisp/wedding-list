from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.controllers.auth import get_current_couple
from app.database import get_db
from app.models.couple import Couple
from app.schemas import (
    CouplePublicResponse,
    CoupleUpdateRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=CouplePublicResponse, status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, db: Session = Depends(get_db)) -> Couple:
    service = AuthService(db)
    try:
        return service.register(data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    service = AuthService(db)
    try:
        couple = service.authenticate(data)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc
    return service.create_tokens(couple)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, db: Session = Depends(get_db)) -> TokenResponse:
    service = AuthService(db)
    try:
        return service.refresh_token(data.refresh_token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sua sessão é inválida ou expirou. Entre novamente.",
        ) from exc


@router.get("/me", response_model=CouplePublicResponse)
def me(current_couple: Couple = Depends(get_current_couple)) -> Couple:
    return current_couple


@router.put("/me", response_model=CouplePublicResponse)
def update_me(
    data: CoupleUpdateRequest,
    current_couple: Couple = Depends(get_current_couple),
    db: Session = Depends(get_db),
) -> Couple:
    if data.name is not None:
        current_couple.name = data.name.strip()
    if data.pix_key is not None:
        current_couple.pix_key = data.pix_key.strip() or None
    if data.pix_key_type is not None:
        current_couple.pix_key_type = data.pix_key_type.strip() or None
    if data.email_notifications_enabled is not None:
        current_couple.email_notifications_enabled = data.email_notifications_enabled

    db.commit()
    db.refresh(current_couple)
    return current_couple
