"""Tests for public guest endpoints: viewing lists and atomically reserving gifts.

No authentication is required for these endpoints. Sensitive couple information
(e.g., email, password hash, pix keys) must never be leaked.
"""

import uuid
from collections.abc import Generator
from datetime import date
from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.exceptions import ConflictError, NotFoundError
from app.main import app
from app.models import Couple, Gift, GiftList
from app.schemas.reservation import ReserveGiftRequest
from app.services.reservation_service import ReservationService
from app.utils.security import hash_password

# ── SQLite in-memory setup ───────────────────────────────────────────────────

SQLITE_URL = "sqlite:///file::memory:?cache=shared&uri=true"
_engine = create_engine(SQLITE_URL, connect_args={"check_same_thread": False})
_TestingSession = sessionmaker(autocommit=False, autoflush=False, bind=_engine)

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
    """Reset database state between tests."""
    Base.metadata.drop_all(bind=_engine)
    Base.metadata.create_all(bind=_engine)
    yield


def _seed_couple_with_list_and_gifts(
    db: Session,
) -> tuple[Couple, GiftList, list[Gift]]:
    couple = Couple(
        name="Mariana & Leonardo",
        email="mariana.leonardo@example.com",
        hashed_password=hash_password("segredo123"),
        pix_key="12345678901",
        pix_key_type="CPF",
    )
    db.add(couple)
    db.commit()
    db.refresh(couple)

    gift_list = GiftList(
        couple_id=couple.id,
        title="Casamento Mariana e Leonardo",
        wedding_date=date(2026, 11, 28),
        public_token=uuid.uuid4(),
    )
    db.add(gift_list)
    db.commit()
    db.refresh(gift_list)

    g1 = Gift(
        gift_list_id=gift_list.id,
        name="Jogo de Panelas Cerâmica",
        description="Conjunto 5 peças antiaderente",
        price=Decimal("499.90"),
        image_url="https://images.example.com/panelas.jpg",
        store_link="https://loja.com/panelas",
        is_reserved=False,
    )
    g2 = Gift(
        gift_list_id=gift_list.id,
        name="Aspirador Robô",
        description="Aspirador inteligente com mapeamento",
        price=Decimal("1299.00"),
        image_url="https://images.example.com/robo.jpg",
        store_link="https://loja.com/aspirador",
        is_reserved=False,
    )
    db.add_all([g1, g2])
    db.commit()
    db.refresh(g1)
    db.refresh(g2)

    return couple, gift_list, [g1, g2]


# ── Public List View Tests ───────────────────────────────────────────────────


def test_get_public_list_success() -> None:
    db = _TestingSession()
    _, gift_list, gifts = _seed_couple_with_list_and_gifts(db)
    public_token = gift_list.public_token
    db.close()

    response = client.get(f"/public/{public_token}")
    assert response.status_code == 200
    data = response.json()

    assert data["title"] == "Casamento Mariana e Leonardo"
    assert data["wedding_date"] == "2026-11-28"
    assert data["couple_name"] == "Mariana & Leonardo"
    assert data["public_token"] == str(public_token)
    assert len(data["gifts"]) == 2

    # Verify sensitive data is NOT exposed
    assert "email" not in data
    assert "hashed_password" not in data
    assert "pix_key" not in data
    assert "couple_id" not in data

    gift_names = {g["name"] for g in data["gifts"]}
    assert gift_names == {"Jogo de Panelas Cerâmica", "Aspirador Robô"}
    assert all(not g["is_reserved"] for g in data["gifts"])


def test_get_public_list_not_found() -> None:
    random_token = uuid.uuid4()
    response = client.get(f"/public/{random_token}")
    assert response.status_code == 404
    assert response.json()["detail"] == "Gift list not found"


def test_get_public_list_invalid_uuid() -> None:
    response = client.get("/public/not-a-valid-uuid")
    assert response.status_code == 422


# ── Gift Reservation Tests ───────────────────────────────────────────────────


def test_reserve_gift_success() -> None:
    db = _TestingSession()
    _, gift_list, gifts = _seed_couple_with_list_and_gifts(db)
    public_token = gift_list.public_token
    gift_to_reserve = gifts[0]
    db.close()

    payload = {
        "guest_name": "Juliana Silveira",
        "guest_email": "juliana@example.com",
    }
    response = client.post(
        f"/public/{public_token}/gifts/{gift_to_reserve.id}/reserve",
        json=payload,
    )
    assert response.status_code == 201
    res_data = response.json()
    assert res_data["gift_id"] == str(gift_to_reserve.id)
    assert res_data["guest_name"] == "Juliana Silveira"
    assert res_data["guest_email"] == "juliana@example.com"
    assert "reserved_at" in res_data
    assert "id" in res_data

    # Now verify the list reflects is_reserved = True for that gift
    list_res = client.get(f"/public/{public_token}")
    assert list_res.status_code == 200
    updated_gifts = list_res.json()["gifts"]
    reserved_item = next(g for g in updated_gifts if g["id"] == str(gift_to_reserve.id))
    unreserved_item = next(g for g in updated_gifts if g["id"] == str(gifts[1].id))
    assert reserved_item["is_reserved"] is True
    assert unreserved_item["is_reserved"] is False


def test_reserve_already_reserved_gift_returns_conflict() -> None:
    db = _TestingSession()
    _, gift_list, gifts = _seed_couple_with_list_and_gifts(db)
    public_token = gift_list.public_token
    gift_id = gifts[0].id
    db.close()

    # First reservation succeeds
    res1 = client.post(
        f"/public/{public_token}/gifts/{gift_id}/reserve",
        json={"guest_name": "Convidado 1", "guest_email": "convidado1@example.com"},
    )
    assert res1.status_code == 201

    # Second reservation attempt returns 409 Conflict
    res2 = client.post(
        f"/public/{public_token}/gifts/{gift_id}/reserve",
        json={"guest_name": "Convidado 2", "guest_email": "convidado2@example.com"},
    )
    assert res2.status_code == 409
    assert "already been reserved" in res2.json()["detail"]


def test_reserve_gift_nonexistent_token() -> None:
    random_token = uuid.uuid4()
    random_gift = uuid.uuid4()
    response = client.post(
        f"/public/{random_token}/gifts/{random_gift}/reserve",
        json={"guest_name": "Visitante", "guest_email": "visitante@example.com"},
    )
    assert response.status_code == 404
    assert response.json()["detail"] == "Gift list not found"


def test_reserve_gift_nonexistent_gift_in_list() -> None:
    db = _TestingSession()
    _, gift_list, _ = _seed_couple_with_list_and_gifts(db)
    public_token = gift_list.public_token
    db.close()

    random_gift = uuid.uuid4()
    response = client.post(
        f"/public/{public_token}/gifts/{random_gift}/reserve",
        json={"guest_name": "Visitante", "guest_email": "visitante@example.com"},
    )
    assert response.status_code == 404
    assert "Gift not found in this list" in response.json()["detail"]


def test_reserve_gift_from_other_list_rejected() -> None:
    """A gift belonging to List A cannot be reserved using List B's public token."""
    db = _TestingSession()
    _, list_a, gifts_a = _seed_couple_with_list_and_gifts(db)

    # Create a second couple and list
    couple_b = Couple(
        name="Outro Casal",
        email="outro@example.com",
        hashed_password=hash_password("senha123"),
    )
    db.add(couple_b)
    db.commit()

    list_b = GiftList(
        couple_id=couple_b.id,
        title="Lista B",
        public_token=uuid.uuid4(),
    )
    db.add(list_b)
    db.commit()
    db.refresh(list_b)

    token_b = list_b.public_token
    gift_a_id = gifts_a[0].id
    db.close()

    # Attempting to reserve gift from List A via List B's token should return 404
    response = client.post(
        f"/public/{token_b}/gifts/{gift_a_id}/reserve",
        json={"guest_name": "Intruso", "guest_email": "intruso@example.com"},
    )
    assert response.status_code == 404


def test_reserve_gift_validation_errors() -> None:
    db = _TestingSession()
    _, gift_list, gifts = _seed_couple_with_list_and_gifts(db)
    public_token = gift_list.public_token
    gift_id = gifts[0].id
    db.close()

    # Invalid email format -> 422
    res_bad_email = client.post(
        f"/public/{public_token}/gifts/{gift_id}/reserve",
        json={"guest_name": "Carlos", "guest_email": "not-an-email"},
    )
    assert res_bad_email.status_code == 422

    # Empty name -> 422
    res_empty_name = client.post(
        f"/public/{public_token}/gifts/{gift_id}/reserve",
        json={"guest_name": "", "guest_email": "carlos@example.com"},
    )
    assert res_empty_name.status_code == 422


def test_service_reserve_gift_integrity_error_handled_as_conflict() -> None:
    """Verifies that race condition DB IntegrityError is converted to ConflictError."""
    db = _TestingSession()
    try:
        _, gift_list, gifts = _seed_couple_with_list_and_gifts(db)
        service = ReservationService(db)

        # Mock db.commit to raise IntegrityError simulating a simultaneous duplicate insert
        with patch.object(
            db, "commit", side_effect=IntegrityError("duplicate key", None, MagicMock())
        ):
            with pytest.raises(ConflictError) as exc_info:
                service.reserve_gift(
                    gift_list.public_token,
                    gifts[0].id,
                    ReserveGiftRequest(guest_name="Ana", guest_email="ana@example.com"),
                )
            assert "already been reserved" in str(exc_info.value)
    finally:
        db.close()


def test_service_get_public_list_not_found() -> None:
    db = _TestingSession()
    try:
        service = ReservationService(db)
        with pytest.raises(NotFoundError):
            service.get_public_list(uuid.uuid4())
    finally:
        db.close()
