"""Tests for authentication endpoints and JWT utilities.

Uses an in-memory SQLite database so no live Postgres is required.
"""

import uuid
from collections.abc import Generator
from datetime import UTC, datetime, timedelta

import pytest
from fastapi.testclient import TestClient
from jose import JWTError, jwt
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.config import settings
from app.database import Base, get_db
from app.main import app
from app.utils.jwt import (
    ALGORITHM,
    create_access_token,
    create_refresh_token,
    decode_access_token,
    decode_refresh_token,
)
from app.utils.security import hash_password, verify_password

# ── In-memory SQLite setup ───────────────────────────────────────────────────
# Use a named in-memory DB with shared cache so all connections see the same data.

SQLITE_URL = "sqlite:///file::memory:?cache=shared&uri=true"

_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
_TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

# Create tables once at module load
Base.metadata.create_all(bind=_engine)


def _get_test_db() -> Generator[Session, None, None]:
    db = _TestingSession()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = _get_test_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_db() -> Generator[None, None, None]:
    """Truncate all tables before each test to ensure isolation."""
    Base.metadata.drop_all(bind=_engine)
    Base.metadata.create_all(bind=_engine)
    yield


# ── Security utils ───────────────────────────────────────────────────────────


def test_hash_and_verify_password() -> None:
    hashed = hash_password("secret")
    assert verify_password("secret", hashed)
    assert not verify_password("wrong", hashed)


def test_hash_is_not_plaintext() -> None:
    assert hash_password("secret") != "secret"


# ── JWT utils ────────────────────────────────────────────────────────────────


def test_access_token_round_trip() -> None:
    token = create_access_token({"sub": "uuid-123"})
    payload = decode_access_token(token)
    assert payload["sub"] == "uuid-123"
    assert payload["type"] == "access"


def test_refresh_token_round_trip() -> None:
    token = create_refresh_token({"sub": "uuid-123"})
    payload = decode_refresh_token(token)
    assert payload["sub"] == "uuid-123"
    assert payload["type"] == "refresh"


def test_access_token_rejected_as_refresh() -> None:
    token = create_access_token({"sub": "uuid-123"})
    with pytest.raises(JWTError):
        decode_refresh_token(token)


def test_refresh_token_rejected_as_access() -> None:
    token = create_refresh_token({"sub": "uuid-123"})
    with pytest.raises(JWTError):
        decode_access_token(token)


def test_access_token_expired() -> None:
    expired_payload = {
        "sub": "uuid-123",
        "type": "access",
        "exp": datetime.now(UTC) - timedelta(minutes=5),
    }
    expired_token = jwt.encode(expired_payload, settings.secret_key, algorithm=ALGORITHM)
    with pytest.raises(JWTError):
        decode_access_token(expired_token)


def test_refresh_token_expired() -> None:
    expired_payload = {
        "sub": "uuid-123",
        "type": "refresh",
        "exp": datetime.now(UTC) - timedelta(days=1),
    }
    expired_token = jwt.encode(expired_payload, settings.secret_key, algorithm=ALGORITHM)
    with pytest.raises(JWTError):
        decode_refresh_token(expired_token)


# ── Auth endpoints ───────────────────────────────────────────────────────────


def test_register_success() -> None:
    resp = client.post(
        "/auth/register",
        json={"name": "Ana & Bruno", "email": "register@example.com", "password": "pw123456"},
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["email"] == "register@example.com"
    assert "id" in body
    assert "hashed_password" not in body


def test_register_duplicate_email() -> None:
    email = "dup@example.com"
    client.post("/auth/register", json={"name": "A", "email": email, "password": "pw"})
    resp = client.post("/auth/register", json={"name": "B", "email": email, "password": "pw"})
    assert resp.status_code == 409


def test_login_success() -> None:
    email, pw = "login_ok@example.com", "pw123456"
    client.post("/auth/register", json={"name": "Test", "email": email, "password": pw})
    resp = client.post("/auth/login", json={"email": email, "password": pw})
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body
    assert "refresh_token" in body
    assert body["token_type"] == "bearer"


def test_login_invalid_password() -> None:
    email = "login_bad@example.com"
    client.post("/auth/register", json={"name": "Test", "email": email, "password": "correct"})
    resp = client.post("/auth/login", json={"email": email, "password": "wrong"})
    assert resp.status_code == 401


def test_login_unknown_email() -> None:
    resp = client.post("/auth/login", json={"email": "nobody@example.com", "password": "pw"})
    assert resp.status_code == 401


def test_me_returns_couple() -> None:
    email, pw = "me@example.com", "pw123456"
    client.post("/auth/register", json={"name": "Test", "email": email, "password": pw})
    login_resp = client.post("/auth/login", json={"email": email, "password": pw})
    access_token = login_resp.json()["access_token"]
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert resp.status_code == 200
    assert resp.json()["email"] == email


def test_me_rejects_missing_token() -> None:
    resp = client.get("/auth/me")
    assert resp.status_code == 401  # HTTPBearer returns 401 when no credentials


def test_me_rejects_invalid_token() -> None:
    resp = client.get("/auth/me", headers={"Authorization": "Bearer invalidtoken"})
    assert resp.status_code == 401


def test_refresh_returns_new_tokens() -> None:
    email, pw = "refresh@example.com", "pw123456"
    client.post("/auth/register", json={"name": "Test", "email": email, "password": pw})
    login_resp = client.post("/auth/login", json={"email": email, "password": pw})
    refresh_token = login_resp.json()["refresh_token"]
    resp = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.json()


def test_refresh_rejects_access_token_as_refresh() -> None:
    email, pw = "badrefresh@example.com", "pw123456"
    client.post("/auth/register", json={"name": "Test", "email": email, "password": pw})
    login_resp = client.post("/auth/login", json={"email": email, "password": pw})
    access_token = login_resp.json()["access_token"]  # wrong token type
    resp = client.post("/auth/refresh", json={"refresh_token": access_token})
    assert resp.status_code == 401


def test_me_rejects_expired_token() -> None:
    expired_token = jwt.encode(
        {
            "sub": str(uuid.uuid4()),
            "type": "access",
            "exp": datetime.now(UTC) - timedelta(minutes=5),
        },
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {expired_token}"})
    assert resp.status_code == 401


def test_me_rejects_missing_sub_claim() -> None:
    token = jwt.encode(
        {"type": "access", "exp": datetime.now(UTC) + timedelta(minutes=15)},
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


def test_me_rejects_nonexistent_couple() -> None:
    token = jwt.encode(
        {
            "sub": str(uuid.uuid4()),
            "type": "access",
            "exp": datetime.now(UTC) + timedelta(minutes=15),
        },
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


def test_refresh_rejects_expired_token() -> None:
    expired_token = jwt.encode(
        {"sub": str(uuid.uuid4()), "type": "refresh", "exp": datetime.now(UTC) - timedelta(days=1)},
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    resp = client.post("/auth/refresh", json={"refresh_token": expired_token})
    assert resp.status_code == 401


def test_refresh_rejects_missing_sub_claim() -> None:
    token = jwt.encode(
        {"type": "refresh", "exp": datetime.now(UTC) + timedelta(days=1)},
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    resp = client.post("/auth/refresh", json={"refresh_token": token})
    assert resp.status_code == 401


def test_refresh_rejects_nonexistent_couple() -> None:
    token = jwt.encode(
        {"sub": str(uuid.uuid4()), "type": "refresh", "exp": datetime.now(UTC) + timedelta(days=1)},
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    resp = client.post("/auth/refresh", json={"refresh_token": token})
    assert resp.status_code == 401


def test_me_rejects_malformed_uuid_sub() -> None:
    token = jwt.encode(
        {
            "sub": "not-a-valid-uuid",
            "type": "access",
            "exp": datetime.now(UTC) + timedelta(minutes=15),
        },
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    resp = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert resp.status_code == 401


def test_refresh_rejects_malformed_uuid_sub() -> None:
    token = jwt.encode(
        {
            "sub": "not-a-valid-uuid",
            "type": "refresh",
            "exp": datetime.now(UTC) + timedelta(days=1),
        },
        settings.secret_key,
        algorithm=ALGORITHM,
    )
    resp = client.post("/auth/refresh", json={"refresh_token": token})
    assert resp.status_code == 401


def test_update_me_settings() -> None:
    email, pw = "update_me@example.com", "pw123456"
    client.post("/auth/register", json={"name": "Original Name", "email": email, "password": pw})
    login_resp = client.post("/auth/login", json={"email": email, "password": pw})
    access_token = login_resp.json()["access_token"]

    update_payload = {
        "name": "Updated Name",
        "pix_key": "12345678909",
        "pix_key_type": "CPF",
        "email_notifications_enabled": False,
    }
    resp = client.put(
        "/auth/me",
        json=update_payload,
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["name"] == "Updated Name"
    assert body["pix_key"] == "12345678909"
    assert body["pix_key_type"] == "CPF"
    assert body["email_notifications_enabled"] is False

    # Check that GET /auth/me also returns the updated values
    me_resp = client.get("/auth/me", headers={"Authorization": f"Bearer {access_token}"})
    assert me_resp.status_code == 200
    me_body = me_resp.json()
    assert me_body["pix_key"] == "12345678909"
    assert me_body["pix_key_type"] == "CPF"

