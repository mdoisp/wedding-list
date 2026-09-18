import uuid
from decimal import Decimal

from fastapi import (
    APIRouter,
    BackgroundTasks,
    Depends,
    HTTPException,
    Query,
    Response,
    status,
)
from fastapi.responses import JSONResponse
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
from app.utils.pix import (
    generate_pix_payload,
    generate_pix_qr_code_base64,
    generate_pix_qr_code_png,
)

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
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
) -> Reservation:
    service = ReservationService(db)
    try:
        return service.reserve_gift(public_token, gift_id, data, background_tasks=background_tasks)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except ConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get("/{public_token}/pix-qrcode")
def get_pix_qrcode(
    public_token: uuid.UUID,
    amount: Decimal | None = Query(
        default=None, ge=0, description="Valor da contribuição Pix (opcional)"
    ),
    format: str = Query(
        default="png",
        pattern="^(png|base64|json)$",
        description="Formato de retorno (png, base64 ou json)",
    ),
    db: Session = Depends(get_db),
) -> Response:
    service = ReservationService(db)
    try:
        gift_list = service.get_public_list(public_token)
    except NotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc

    couple = gift_list.couple
    if not couple or not couple.pix_key:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Couple has not configured a Pix key",
        )

    pix_payload = generate_pix_payload(
        pix_key=couple.pix_key,
        merchant_name=couple.name,
        merchant_city="BRASILIA",
        amount=amount,
        pix_key_type=couple.pix_key_type,
    )
    png_bytes = generate_pix_qr_code_png(pix_payload)
    base64_data = generate_pix_qr_code_base64(pix_payload)

    if format == "json":
        return JSONResponse(
            content={
                "public_token": str(public_token),
                "pix_key": couple.pix_key,
                "pix_key_type": couple.pix_key_type,
                "merchant_name": couple.name,
                "merchant_city": "BRASILIA",
                "amount": float(amount) if amount is not None else None,
                "pix_copy_paste": pix_payload,
                "qr_code_base64": base64_data,
            }
        )

    if format == "base64":
        return Response(content=base64_data, media_type="text/plain")

    return Response(
        content=png_bytes,
        media_type="image/png",
        headers={
            "X-Pix-Payload": pix_payload,
            "X-Pix-Key": couple.pix_key,
        },
    )
