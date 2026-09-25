import uuid

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.couple import Couple
from app.utils.jwt import decode_access_token

_bearer = HTTPBearer()


def get_current_couple(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> Couple:
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        couple_id: str | None = payload.get("sub")
        if not couple_id:
            raise JWTError("Missing sub")
        couple_uuid = uuid.UUID(couple_id)
    except (JWTError, ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar suas credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc

    couple = db.get(Couple, couple_uuid)
    if not couple:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Não foi possível validar suas credenciais",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return couple
