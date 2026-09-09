from datetime import UTC, datetime, timedelta
from typing import Any

from jose import JWTError, jwt

from app.config import settings

ALGORITHM = settings.algorithm


def create_access_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(minutes=settings.access_token_expire_minutes)
    to_encode["exp"] = expire
    to_encode["type"] = "access"
    return str(jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM))


def create_refresh_token(data: dict[str, Any]) -> str:
    to_encode = data.copy()
    expire = datetime.now(UTC) + timedelta(days=settings.refresh_token_expire_days)
    to_encode["exp"] = expire
    to_encode["type"] = "refresh"
    return str(jwt.encode(to_encode, settings.secret_key, algorithm=ALGORITHM))


def decode_token(token: str) -> dict[str, Any]:
    """Decode and validate a JWT token. Raises JWTError on failure."""
    payload: dict[str, Any] = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
    return payload


def decode_access_token(token: str) -> dict[str, Any]:
    payload = decode_token(token)
    if payload.get("type") != "access":
        raise JWTError("Not an access token")
    return payload


def decode_refresh_token(token: str) -> dict[str, Any]:
    payload = decode_token(token)
    if payload.get("type") != "refresh":
        raise JWTError("Not a refresh token")
    return payload
