"""Tests for Pix BR Code / EMV payload generation and QR Code endpoints.

Verifies compliance with Banco Central do Brasil static Pix standards,
including CRC16 calculation, key formatting, and image generation.
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
from app.main import app
from app.models import Couple, GiftList
from app.utils.pix import (
    clean_ascii_text,
    clean_pix_key,
    crc16_ccitt,
    format_tlv,
    generate_pix_payload,
    generate_pix_qr_code_base64,
    generate_pix_qr_code_png,
    verify_pix_crc,
)
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


# ── Unit Tests: Pix Utils ────────────────────────────────────────────────────


def test_crc16_ccitt_known_vector() -> None:
    # CRC16 for "123456789" with CCITT-FALSE is 0x29B1
    result = crc16_ccitt("123456789")
    assert result == "29B1"


def test_format_tlv() -> None:
    assert format_tlv("00", "01") == "000201"
    assert format_tlv("58", "BR") == "5802BR"


def test_clean_ascii_text() -> None:
    raw = "João & Mariana São Paulo Á É Í Ó Ú ç"
    cleaned = clean_ascii_text(raw, 25)
    assert "JOAO & MARIANA SAO PAULO" in cleaned
    assert len(cleaned) <= 25


def test_clean_pix_key_cpf() -> None:
    assert clean_pix_key("123.456.789-00", "CPF") == "12345678900"
    assert clean_pix_key("12345678900") == "12345678900"


def test_clean_pix_key_cnpj() -> None:
    assert clean_pix_key("12.345.678/0001-90", "CNPJ") == "12345678000190"


def test_clean_pix_key_email() -> None:
    assert clean_pix_key("Casal.Feliz@Example.COM", "EMAIL") == "casal.feliz@example.com"
    assert clean_pix_key("noivos@wedding.com") == "noivos@wedding.com"


def test_clean_pix_key_phone() -> None:
    assert clean_pix_key("11999998888", "PHONE") == "+5511999998888"
    assert clean_pix_key("+5511999998888", "PHONE") == "+5511999998888"


def test_clean_pix_key_random() -> None:
    random_uuid = "123E4567-E89B-12D3-A456-426614174000"
    assert clean_pix_key(random_uuid, "RANDOM") == random_uuid.lower()
    assert clean_pix_key("custom-key-fallback") == "custom-key-fallback"


def test_generate_pix_payload_libre_amount() -> None:
    payload = generate_pix_payload(
        pix_key="12345678900",
        merchant_name="Mariana & Leonardo",
        merchant_city="São Paulo",
    )
    assert payload.startswith("000201")
    assert "br.gov.bcb.pix" in payload
    assert "12345678900" in payload
    assert "SAO PAULO" in payload
    assert "5303986" in payload  # BRL currency
    assert "5802BR" in payload  # BR country
    assert "54" not in payload  # Tag 54 omitted for valor livre
    assert verify_pix_crc(payload) is True


def test_generate_pix_payload_fixed_amount() -> None:
    payload = generate_pix_payload(
        pix_key="noivos@example.com",
        merchant_name="Ana & Bruno",
        merchant_city="Brasília",
        amount=Decimal("150.50"),
        description="Presente Casamento",
    )
    assert "5406150.50" in payload  # Tag 54 with formatted amount
    assert "PRESENTE CASAMENTO" in payload
    assert verify_pix_crc(payload) is True


def test_verify_pix_crc_tampered() -> None:
    payload = generate_pix_payload("12345678900", "Noivos", "Brasilia")
    assert verify_pix_crc(payload) is True
    # Tampering with a character should invalidate the CRC
    tampered = payload[:-5] + ("A" if payload[-5] != "A" else "B") + payload[-4:]
    assert verify_pix_crc(tampered) is False
    assert verify_pix_crc("short") is False


def test_generate_pix_qr_code_png() -> None:
    payload = generate_pix_payload("12345678900", "Noivos")
    png_bytes = generate_pix_qr_code_png(payload)
    assert len(png_bytes) > 100
    assert png_bytes[:8] == b"\x89PNG\r\n\x1a\n"


def test_generate_pix_qr_code_base64() -> None:
    payload = generate_pix_payload("12345678900", "Noivos")
    b64 = generate_pix_qr_code_base64(payload)
    assert b64.startswith("data:image/png;base64,")
    assert len(b64) > 100


# ── Integration Tests: Endpoint GET /public/{token}/pix-qrcode ───────────────


def _create_couple_with_pix(
    db: Session, pix_key: str | None = "12345678900", pix_type: str = "CPF"
) -> tuple[Couple, GiftList]:
    couple = Couple(
        name="Beatriz & Eduardo",
        email=f"couple-{uuid.uuid4()}@example.com",
        hashed_password=hash_password("senha123"),
        pix_key=pix_key,
        pix_key_type=pix_type,
    )
    db.add(couple)
    db.commit()
    db.refresh(couple)

    gift_list = GiftList(
        couple_id=couple.id,
        title="Casamento Beatriz e Eduardo",
        wedding_date=date(2026, 10, 10),
        public_token=uuid.uuid4(),
    )
    db.add(gift_list)
    db.commit()
    db.refresh(gift_list)
    return couple, gift_list


def test_get_pix_qrcode_png_default() -> None:
    db = _TestingSession()
    _, gift_list = _create_couple_with_pix(db)
    token = gift_list.public_token
    db.close()

    response = client.get(f"/public/{token}/pix-qrcode")
    assert response.status_code == 200
    assert response.headers["content-type"] == "image/png"
    assert response.content[:8] == b"\x89PNG\r\n\x1a\n"

    # Header assertions
    assert "x-pix-payload" in response.headers
    pix_payload = response.headers["x-pix-payload"]
    assert verify_pix_crc(pix_payload) is True
    assert "x-pix-key" in response.headers


def test_get_pix_qrcode_json_format() -> None:
    db = _TestingSession()
    couple, gift_list = _create_couple_with_pix(db, pix_key="contato@noivos.com", pix_type="EMAIL")
    token = gift_list.public_token
    couple_name = couple.name
    db.close()

    response = client.get(f"/public/{token}/pix-qrcode?format=json")
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]
    data = response.json()

    assert data["public_token"] == str(token)
    assert data["pix_key"] == "contato@noivos.com"
    assert data["pix_key_type"] == "EMAIL"
    assert data["merchant_name"] == couple_name
    assert "pix_copy_paste" in data
    assert verify_pix_crc(data["pix_copy_paste"]) is True
    assert data["qr_code_base64"].startswith("data:image/png;base64,")


def test_get_pix_qrcode_base64_format() -> None:
    db = _TestingSession()
    _, gift_list = _create_couple_with_pix(db)
    token = gift_list.public_token
    db.close()

    response = client.get(f"/public/{token}/pix-qrcode?format=base64")
    assert response.status_code == 200
    assert response.text.startswith("data:image/png;base64,")


def test_get_pix_qrcode_with_amount() -> None:
    db = _TestingSession()
    _, gift_list = _create_couple_with_pix(db)
    token = gift_list.public_token
    db.close()

    response = client.get(f"/public/{token}/pix-qrcode?format=json&amount=250.00")
    assert response.status_code == 200
    data = response.json()
    assert data["amount"] == 250.0
    assert "5406250.00" in data["pix_copy_paste"]
    assert verify_pix_crc(data["pix_copy_paste"]) is True


def test_get_pix_qrcode_not_found_token() -> None:
    random_token = uuid.uuid4()
    response = client.get(f"/public/{random_token}/pix-qrcode")
    assert response.status_code == 404
    assert response.json()["detail"] == "Gift list not found"


def test_get_pix_qrcode_couple_without_pix_key() -> None:
    db = _TestingSession()
    _, gift_list = _create_couple_with_pix(db, pix_key=None)
    token = gift_list.public_token
    db.close()

    response = client.get(f"/public/{token}/pix-qrcode")
    assert response.status_code == 400
    assert "not configured a Pix key" in response.json()["detail"]


def test_get_pix_qrcode_negative_amount_validation() -> None:
    db = _TestingSession()
    _, gift_list = _create_couple_with_pix(db)
    token = gift_list.public_token
    db.close()

    response = client.get(f"/public/{token}/pix-qrcode?amount=-50")
    assert response.status_code == 422


def test_public_list_includes_has_pix_field() -> None:
    db = _TestingSession()
    _, gift_list_with_pix = _create_couple_with_pix(db, pix_key="12345678900")
    _, gift_list_no_pix = _create_couple_with_pix(db, pix_key=None)
    token_with = gift_list_with_pix.public_token
    token_no = gift_list_no_pix.public_token
    db.close()

    res_with = client.get(f"/public/{token_with}")
    assert res_with.status_code == 200
    assert res_with.json()["has_pix"] is True

    res_no = client.get(f"/public/{token_no}")
    assert res_no.status_code == 200
    assert res_no.json()["has_pix"] is False
