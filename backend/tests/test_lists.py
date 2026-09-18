"""Tests for GiftList and Gift CRUD endpoints and services.

Verifies authorization boundaries: Couple A cannot access, modify,
or delete Couple B's list or gifts.
"""

import uuid
from collections.abc import Generator
from datetime import date
from decimal import Decimal

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.exceptions import ConflictError, ForbiddenError, NotFoundError
from app.main import app
from app.models import Couple
from app.schemas.gift import GiftCreateRequest, GiftUpdateRequest
from app.schemas.gift_list import GiftListCreateRequest, GiftListUpdateRequest
from app.services.gift_list_service import GiftListService
from app.services.gift_service import GiftService
from app.utils.jwt import create_access_token
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


def _create_couple(
    db: Session, name: str = "Casal Teste", email: str = "casal@example.com"
) -> Couple:
    couple = Couple(
        name=name,
        email=email,
        hashed_password=hash_password("senha123"),
    )
    db.add(couple)
    db.commit()
    db.refresh(couple)
    return couple


def _auth_headers(couple: Couple) -> dict[str, str]:
    token = create_access_token({"sub": str(couple.id)})
    return {"Authorization": f"Bearer {token}"}


# ── GiftListService Unit Tests ───────────────────────────────────────────────


def test_service_create_list_generates_public_token() -> None:
    db = _TestingSession()
    try:
        couple = _create_couple(db)
        service = GiftListService(db)
        gift_list = service.create_list(
            couple.id,
            GiftListCreateRequest(
                title="Casamento Ana e Bruno",
                wedding_date=date(2026, 12, 1),
            ),
        )
        assert gift_list.id is not None
        assert isinstance(gift_list.public_token, uuid.UUID)
        assert gift_list.title == "Casamento Ana e Bruno"
        assert gift_list.couple_id == couple.id
        assert gift_list.wedding_date == date(2026, 12, 1)
    finally:
        db.close()


def test_service_create_list_single_active_constraint() -> None:
    db = _TestingSession()
    try:
        couple = _create_couple(db)
        service = GiftListService(db)
        service.create_list(
            couple.id,
            GiftListCreateRequest(title="Lista 1"),
        )
        with pytest.raises(ConflictError):
            service.create_list(
                couple.id,
                GiftListCreateRequest(title="Lista 2"),
            )
    finally:
        db.close()


def test_service_get_list_by_couple() -> None:
    db = _TestingSession()
    try:
        couple = _create_couple(db)
        service = GiftListService(db)
        assert service.get_list_by_couple(couple.id) is None

        created = service.create_list(
            couple.id,
            GiftListCreateRequest(title="Lista Casal"),
        )
        found = service.get_list_by_couple(couple.id)
        assert found is not None
        assert found.id == created.id
    finally:
        db.close()


def test_service_get_list_by_id_authorization() -> None:
    db = _TestingSession()
    try:
        couple_a = _create_couple(db, "Casal A", "a@example.com")
        couple_b = _create_couple(db, "Casal B", "b@example.com")
        service = GiftListService(db)

        list_a = service.create_list(couple_a.id, GiftListCreateRequest(title="Lista A"))

        # Owner succeeds
        assert service.get_list_by_id(list_a.id, couple_a.id).id == list_a.id

        # Non-owner forbidden
        with pytest.raises(ForbiddenError):
            service.get_list_by_id(list_a.id, couple_b.id)

        # Non-existent list not found
        with pytest.raises(NotFoundError):
            service.get_list_by_id(uuid.uuid4(), couple_a.id)
    finally:
        db.close()


def test_service_update_list() -> None:
    db = _TestingSession()
    try:
        couple = _create_couple(db)
        service = GiftListService(db)
        gift_list = service.create_list(couple.id, GiftListCreateRequest(title="Título Original"))

        updated = service.update_list(
            gift_list.id,
            couple.id,
            GiftListUpdateRequest(title="Título Atualizado", wedding_date=date(2026, 6, 15)),
        )
        assert updated.title == "Título Atualizado"
        assert updated.wedding_date == date(2026, 6, 15)
    finally:
        db.close()


def test_service_delete_list() -> None:
    db = _TestingSession()
    try:
        couple = _create_couple(db)
        service = GiftListService(db)
        gift_list = service.create_list(
            couple.id, GiftListCreateRequest(title="Lista Para Deletar")
        )
        service.delete_list(gift_list.id, couple.id)
        assert service.get_list_by_couple(couple.id) is None
    finally:
        db.close()


# ── GiftService Unit Tests ───────────────────────────────────────────────────


def test_service_gift_crud_and_authorization() -> None:
    db = _TestingSession()
    try:
        couple_a = _create_couple(db, "Casal A", "a@example.com")
        couple_b = _create_couple(db, "Casal B", "b@example.com")
        list_service = GiftListService(db)
        gift_service = GiftService(db)

        list_a = list_service.create_list(couple_a.id, GiftListCreateRequest(title="Lista A"))

        # Couple A adds gift
        gift = gift_service.add_gift(
            list_a.id,
            couple_a.id,
            GiftCreateRequest(
                name="Cafeteira",
                description="Cafeteira Nespresso",
                price=Decimal("450.00"),
                image_url="https://example.com/cafeteira.jpg",
                store_link="https://loja.com/cafeteira",
            ),
        )
        assert gift.name == "Cafeteira"
        assert gift.is_reserved is False

        # Couple B cannot add gift to Couple A's list
        with pytest.raises(ForbiddenError):
            gift_service.add_gift(
                list_a.id,
                couple_b.id,
                GiftCreateRequest(name="Item Intruso"),
            )

        # Couple B cannot list gifts of Couple A's list
        with pytest.raises(ForbiddenError):
            gift_service.list_gifts(list_a.id, couple_b.id)

        # Couple A can list gifts
        gifts = gift_service.list_gifts(list_a.id, couple_a.id)
        assert len(gifts) == 1
        assert gifts[0].id == gift.id

        # Couple B cannot update Couple A's gift
        with pytest.raises(ForbiddenError):
            gift_service.update_gift(
                list_a.id,
                gift.id,
                couple_b.id,
                GiftUpdateRequest(price=Decimal("10.00")),
            )

        # Couple A updates gift
        updated_gift = gift_service.update_gift(
            list_a.id,
            gift.id,
            couple_a.id,
            GiftUpdateRequest(price=Decimal("500.00"), name="Cafeteira Pro"),
        )
        assert updated_gift.price == Decimal("500.00")
        assert updated_gift.name == "Cafeteira Pro"

        # Couple B cannot delete Couple A's gift
        with pytest.raises(ForbiddenError):
            gift_service.delete_gift(list_a.id, gift.id, couple_b.id)

        # Couple A deletes gift
        gift_service.delete_gift(list_a.id, gift.id, couple_a.id)
        assert len(gift_service.list_gifts(list_a.id, couple_a.id)) == 0
    finally:
        db.close()


# ── API Endpoint Integration Tests ───────────────────────────────────────────


def test_endpoints_require_authentication() -> None:
    fake_id = uuid.uuid4()
    assert client.post("/lists", json={"title": "Test"}).status_code == 401
    assert client.get("/lists").status_code == 401
    assert client.get(f"/lists/{fake_id}").status_code == 401
    assert client.put(f"/lists/{fake_id}", json={"title": "Test"}).status_code == 401
    assert client.delete(f"/lists/{fake_id}").status_code == 401
    assert client.post(f"/lists/{fake_id}/gifts", json={"name": "Item"}).status_code == 401
    assert client.get(f"/lists/{fake_id}/gifts").status_code == 401
    assert client.get(f"/lists/{fake_id}/gifts/{fake_id}").status_code == 401
    assert client.put(f"/lists/{fake_id}/gifts/{fake_id}", json={"name": "New"}).status_code == 401
    assert client.delete(f"/lists/{fake_id}/gifts/{fake_id}").status_code == 401


def test_create_list_endpoint() -> None:
    db = _TestingSession()
    couple = _create_couple(db)
    headers = _auth_headers(couple)
    db.close()

    payload = {
        "title": "Casamento Juliana e Rodrigo",
        "wedding_date": "2026-11-20",
    }
    response = client.post("/lists", json=payload, headers=headers)
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == payload["title"]
    assert data["wedding_date"] == payload["wedding_date"]
    assert data["couple_id"] == str(couple.id)
    assert "public_token" in data
    # Verify public_token is a valid UUID
    uuid.UUID(data["public_token"])


def test_create_list_endpoint_with_trailing_slash() -> None:
    db = _TestingSession()
    couple = _create_couple(db)
    headers = _auth_headers(couple)
    db.close()

    payload = {"title": "Casamento com Barra"}
    response = client.post("/lists/", json=payload, headers=headers)
    assert response.status_code == 201


def test_create_second_list_conflict() -> None:
    db = _TestingSession()
    couple = _create_couple(db)
    headers = _auth_headers(couple)
    db.close()

    # First list
    res1 = client.post("/lists", json={"title": "Primeira Lista"}, headers=headers)
    assert res1.status_code == 201

    # Second list for same couple -> Conflict 409
    res2 = client.post("/lists", json={"title": "Segunda Lista"}, headers=headers)
    assert res2.status_code == 409
    assert "active gift list" in res2.json()["detail"]


def test_get_lists_endpoint_separation() -> None:
    db = _TestingSession()
    couple_a = _create_couple(db, "Casal A", "a@example.com")
    couple_b = _create_couple(db, "Casal B", "b@example.com")
    headers_a = _auth_headers(couple_a)
    headers_b = _auth_headers(couple_b)
    db.close()

    # A creates list
    client.post("/lists", json={"title": "Lista A"}, headers=headers_a)

    # A sees 1 list
    res_a = client.get("/lists", headers=headers_a)
    assert res_a.status_code == 200
    assert len(res_a.json()) == 1
    assert res_a.json()[0]["title"] == "Lista A"

    # B sees 0 lists
    res_b = client.get("/lists", headers=headers_b)
    assert res_b.status_code == 200
    assert len(res_b.json()) == 0


def test_get_list_by_id_and_authorization() -> None:
    db = _TestingSession()
    couple_a = _create_couple(db, "Casal A", "a@example.com")
    couple_b = _create_couple(db, "Casal B", "b@example.com")
    headers_a = _auth_headers(couple_a)
    headers_b = _auth_headers(couple_b)
    db.close()

    res_create = client.post("/lists", json={"title": "Lista A"}, headers=headers_a)
    list_id = res_create.json()["id"]

    # Couple A can view
    res_view = client.get(f"/lists/{list_id}", headers=headers_a)
    assert res_view.status_code == 200
    assert res_view.json()["id"] == list_id

    # Couple B is forbidden (403)
    res_forbidden = client.get(f"/lists/{list_id}", headers=headers_b)
    assert res_forbidden.status_code == 403

    # Non-existent list is 404
    res_not_found = client.get(f"/lists/{uuid.uuid4()}", headers=headers_a)
    assert res_not_found.status_code == 404


def test_update_list_endpoint() -> None:
    db = _TestingSession()
    couple_a = _create_couple(db, "Casal A", "a@example.com")
    couple_b = _create_couple(db, "Casal B", "b@example.com")
    headers_a = _auth_headers(couple_a)
    headers_b = _auth_headers(couple_b)
    db.close()

    res_create = client.post("/lists", json={"title": "Lista Original"}, headers=headers_a)
    list_id = res_create.json()["id"]

    # Couple B cannot update Couple A's list
    res_forbidden = client.put(
        f"/lists/{list_id}",
        json={"title": "Tentativa Invasão"},
        headers=headers_b,
    )
    assert res_forbidden.status_code == 403

    # Couple A updates successfully
    res_update = client.put(
        f"/lists/{list_id}",
        json={"title": "Lista Atualizada", "wedding_date": "2026-12-25"},
        headers=headers_a,
    )
    assert res_update.status_code == 200
    assert res_update.json()["title"] == "Lista Atualizada"
    assert res_update.json()["wedding_date"] == "2026-12-25"


def test_delete_list_endpoint() -> None:
    db = _TestingSession()
    couple_a = _create_couple(db, "Casal A", "a@example.com")
    couple_b = _create_couple(db, "Casal B", "b@example.com")
    headers_a = _auth_headers(couple_a)
    headers_b = _auth_headers(couple_b)
    db.close()

    res_create = client.post("/lists", json={"title": "Para Deletar"}, headers=headers_a)
    list_id = res_create.json()["id"]

    # Couple B cannot delete Couple A's list
    res_forbidden = client.delete(f"/lists/{list_id}", headers=headers_b)
    assert res_forbidden.status_code == 403

    # Couple A deletes
    res_del = client.delete(f"/lists/{list_id}", headers=headers_a)
    assert res_del.status_code == 204

    # Getting deleted list is 404
    assert client.get(f"/lists/{list_id}", headers=headers_a).status_code == 404

    # Now Couple A can create a new list
    res_new = client.post("/lists", json={"title": "Nova Lista"}, headers=headers_a)
    assert res_new.status_code == 201


def test_gift_crud_flow_and_authorization() -> None:
    db = _TestingSession()
    couple_a = _create_couple(db, "Casal A", "a@example.com")
    couple_b = _create_couple(db, "Casal B", "b@example.com")
    headers_a = _auth_headers(couple_a)
    headers_b = _auth_headers(couple_b)
    db.close()

    res_list = client.post("/lists", json={"title": "Lista A"}, headers=headers_a)
    list_id = res_list.json()["id"]

    # 1. Add gift as Couple A
    gift_payload = {
        "name": "Faqueiro Inox 24 Peças",
        "description": "Faqueiro Tramontina",
        "price": 199.90,
        "image_url": "https://example.com/faqueiro.jpg",
        "store_link": "https://shop.com/faqueiro",
    }
    res_add = client.post(f"/lists/{list_id}/gifts", json=gift_payload, headers=headers_a)
    assert res_add.status_code == 201
    gift_data = res_add.json()
    assert gift_data["name"] == gift_payload["name"]
    assert float(gift_data["price"]) == 199.90
    assert gift_data["is_reserved"] is False
    gift_id = gift_data["id"]

    # 2. Couple B cannot add gift to Couple A's list
    res_b_add = client.post(f"/lists/{list_id}/gifts", json={"name": "Intruso"}, headers=headers_b)
    assert res_b_add.status_code == 403

    # 3. Validation: negative price rejected
    res_bad = client.post(
        f"/lists/{list_id}/gifts",
        json={"name": "Item Inválido", "price": -10.0},
        headers=headers_a,
    )
    assert res_bad.status_code == 422

    # 4. List gifts
    res_list_gifts = client.get(f"/lists/{list_id}/gifts", headers=headers_a)
    assert res_list_gifts.status_code == 200
    assert len(res_list_gifts.json()) == 1

    # Couple B cannot list gifts
    assert client.get(f"/lists/{list_id}/gifts", headers=headers_b).status_code == 403

    # 5. Get gift by ID
    res_get_gift = client.get(f"/lists/{list_id}/gifts/{gift_id}", headers=headers_a)
    assert res_get_gift.status_code == 200
    assert res_get_gift.json()["name"] == gift_payload["name"]

    # Couple B cannot get gift
    assert client.get(f"/lists/{list_id}/gifts/{gift_id}", headers=headers_b).status_code == 403

    # 6. Update gift
    res_update_gift = client.put(
        f"/lists/{list_id}/gifts/{gift_id}",
        json={"price": 249.90, "name": "Faqueiro Inox 36 Peças"},
        headers=headers_a,
    )
    assert res_update_gift.status_code == 200
    assert float(res_update_gift.json()["price"]) == 249.90
    assert res_update_gift.json()["name"] == "Faqueiro Inox 36 Peças"

    # Couple B cannot update gift
    assert (
        client.put(
            f"/lists/{list_id}/gifts/{gift_id}",
            json={"price": 1.0},
            headers=headers_b,
        ).status_code
        == 403
    )

    # 7. Delete gift
    # Couple B cannot delete gift
    assert client.delete(f"/lists/{list_id}/gifts/{gift_id}", headers=headers_b).status_code == 403

    # Couple A deletes gift
    res_del_gift = client.delete(f"/lists/{list_id}/gifts/{gift_id}", headers=headers_a)
    assert res_del_gift.status_code == 204

    # Now gift is not found
    assert client.get(f"/lists/{list_id}/gifts/{gift_id}", headers=headers_a).status_code == 404
    assert client.delete(f"/lists/{list_id}/gifts/{gift_id}", headers=headers_a).status_code == 404


def test_gift_list_response_includes_gifts() -> None:
    db = _TestingSession()
    couple = _create_couple(db)
    headers = _auth_headers(couple)
    db.close()

    res_list = client.post("/lists", json={"title": "Lista com Presentes"}, headers=headers)
    list_id = res_list.json()["id"]

    client.post(
        f"/lists/{list_id}/gifts",
        json={"name": "Item 1", "price": 100.0},
        headers=headers,
    )
    client.post(
        f"/lists/{list_id}/gifts",
        json={"name": "Item 2", "price": 200.0},
        headers=headers,
    )

    res_get = client.get(f"/lists/{list_id}", headers=headers)
    assert res_get.status_code == 200
    gifts = res_get.json()["gifts"]
    assert len(gifts) == 2
    names = {g["name"] for g in gifts}
    assert names == {"Item 1", "Item 2"}


def test_nonexistent_resource_endpoints_return_404() -> None:
    db = _TestingSession()
    couple = _create_couple(db)
    headers = _auth_headers(couple)
    db.close()

    random_id = uuid.uuid4()
    # Update non-existent list -> 404
    assert (
        client.put(f"/lists/{random_id}", json={"title": "Novo"}, headers=headers).status_code
        == 404
    )
    # Delete non-existent list -> 404
    assert client.delete(f"/lists/{random_id}", headers=headers).status_code == 404
    # Add gift to non-existent list -> 404
    assert (
        client.post(f"/lists/{random_id}/gifts", json={"name": "Item"}, headers=headers).status_code
        == 404
    )
    # List gifts for non-existent list -> 404
    assert client.get(f"/lists/{random_id}/gifts", headers=headers).status_code == 404

    # Create real list
    res_list = client.post("/lists", json={"title": "Minha Lista"}, headers=headers)
    list_id = res_list.json()["id"]

    # Update non-existent gift in existing list -> 404
    assert (
        client.put(
            f"/lists/{list_id}/gifts/{random_id}",
            json={"name": "Não Existe"},
            headers=headers,
        ).status_code
        == 404
    )


def test_service_gift_on_nonexistent_list_raises_not_found() -> None:
    db = _TestingSession()
    try:
        couple = _create_couple(db)
        gift_service = GiftService(db)
        with pytest.raises(NotFoundError):
            gift_service.list_gifts(uuid.uuid4(), couple.id)
    finally:
        db.close()
