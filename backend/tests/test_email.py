"""Unit and integration tests for the EmailService and reservation email notifications.

Tests verify Resend SDK integration, HTML template rendering, fallback when API key
is missing, and background task dispatching during gift reservations.
"""

import uuid
from collections.abc import Generator
from datetime import date
from decimal import Decimal
from unittest.mock import patch

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database import Base, get_db
from app.main import app
from app.models import Couple, Gift, GiftList
from app.services.email_service import EmailService
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


def _seed_couple_list_gift(
    db: Session, email_notifications_enabled: bool = True
) -> tuple[Couple, GiftList, Gift]:
    couple = Couple(
        name="Beatriz & Tiago",
        email="beatriz.tiago@example.com",
        hashed_password=hash_password("senha1234"),
        pix_key="12345678901",
        pix_key_type="CPF",
        email_notifications_enabled=email_notifications_enabled,
    )
    db.add(couple)
    db.commit()
    db.refresh(couple)

    gift_list = GiftList(
        couple_id=couple.id,
        title="Casamento Beatriz e Tiago",
        wedding_date=date(2026, 12, 20),
        public_token=uuid.uuid4(),
    )
    db.add(gift_list)
    db.commit()
    db.refresh(gift_list)

    gift = Gift(
        gift_list_id=gift_list.id,
        name="Cafeteira Nespresso",
        description="Cafeteira de cápsula automática",
        price=Decimal("599.00"),
        image_url="https://images.example.com/cafeteira.jpg",
        store_link="https://nespresso.com/cafeteira",
        is_reserved=False,
    )
    db.add(gift)
    db.commit()
    db.refresh(gift)

    return couple, gift_list, gift


# ── Unit tests for EmailService ──────────────────────────────────────────────


def test_email_service_mock_mode_when_no_api_key() -> None:
    """When no api_key is provided or configured, EmailService returns mock payload."""
    service = EmailService(api_key="")
    result = service.send_email(
        to="guest@example.com",
        subject="Test Subject",
        html_body="<p>Hello world</p>",
    )
    assert result is not None
    assert result["id"] == "mock-email-id"
    assert result["to"] == "guest@example.com"
    assert result["subject"] == "Test Subject"


def test_email_service_send_success_with_api_key() -> None:
    """When api_key is provided, EmailService calls resend.Emails.send."""
    service = EmailService(api_key="re_test_key_123", from_email="custom@example.com")

    with patch("resend.Emails.send") as mock_resend_send:
        mock_resend_send.return_value = {"id": "resend_id_999"}

        result = service.send_email(
            to="guest@example.com",
            subject="Test Subject",
            html_body="<p>Test Content</p>",
        )

        mock_resend_send.assert_called_once_with(
            {
                "from": "custom@example.com",
                "to": ["guest@example.com"],
                "subject": "Test Subject",
                "html": "<p>Test Content</p>",
            }
        )
        assert result == {"id": "resend_id_999"}


def test_email_service_handles_resend_exception() -> None:
    """When resend.Emails.send raises an exception, EmailService logs it and returns None."""
    service = EmailService(api_key="re_test_key_123")

    with patch("resend.Emails.send", side_effect=RuntimeError("Resend API error")):
        result = service.send_email(
            to="guest@example.com",
            subject="Test Subject",
            html_body="<p>Hello</p>",
        )
        assert result is None


def test_render_template_guest() -> None:
    """Test template rendering for guest confirmation email."""
    service = EmailService(api_key="")
    context = {
        "guest_name": "Carlos Mendes",
        "couple_name": "Beatriz & Tiago",
        "gift_name": "Cafeteira Nespresso",
        "gift_price_section": "<div>R$ 599.00</div>",
        "store_link_section": '<a href="https://example.com">Loja</a>',
    }
    rendered = service.render_template("reservation_guest.html", context)

    assert "Carlos Mendes" in rendered
    assert "Beatriz & Tiago" in rendered
    assert "Cafeteira Nespresso" in rendered
    assert "R$ 599.00" in rendered
    assert "https://example.com" in rendered


def test_render_template_couple() -> None:
    """Test template rendering for couple reservation notification email."""
    service = EmailService(api_key="")
    context = {
        "couple_name": "Beatriz & Tiago",
        "guest_name": "Carlos Mendes",
        "guest_email": "carlos@example.com",
        "gift_name": "Cafeteira Nespresso",
    }
    rendered = service.render_template("reservation_couple.html", context)

    assert "Beatriz & Tiago" in rendered
    assert "Carlos Mendes" in rendered
    assert "carlos@example.com" in rendered
    assert "Cafeteira Nespresso" in rendered


def test_send_reservation_confirmation_to_guest() -> None:
    """Verifies send_reservation_confirmation_to_guest formats subject and content."""
    service = EmailService(api_key="re_dummy")

    with patch("resend.Emails.send") as mock_send:
        mock_send.return_value = {"id": "email_123"}
        result = service.send_reservation_confirmation_to_guest(
            guest_name="Carlos",
            guest_email="carlos@example.com",
            couple_name="Beatriz & Tiago",
            gift_name="Cafeteira",
            gift_price=Decimal("599.00"),
            store_link="https://nespresso.com",
        )

        assert result == {"id": "email_123"}
        mock_send.assert_called_once()
        call_args = mock_send.call_args[0][0]
        assert call_args["to"] == ["carlos@example.com"]
        assert "Cafeteira" in call_args["subject"]
        assert "Beatriz & Tiago" in call_args["subject"]
        assert "R$ 599.00" in call_args["html"]
        assert "https://nespresso.com" in call_args["html"]


def test_send_reservation_notification_to_couple() -> None:
    """Verifies send_reservation_notification_to_couple formats subject and content."""
    service = EmailService(api_key="re_dummy")

    with patch("resend.Emails.send") as mock_send:
        mock_send.return_value = {"id": "email_456"}
        result = service.send_reservation_notification_to_couple(
            couple_email="couple@example.com",
            couple_name="Beatriz & Tiago",
            guest_name="Carlos",
            guest_email="carlos@example.com",
            gift_name="Cafeteira",
        )

        assert result == {"id": "email_456"}
        mock_send.assert_called_once()
        call_args = mock_send.call_args[0][0]
        assert call_args["to"] == ["couple@example.com"]
        assert "Carlos" in call_args["subject"]
        assert "Cafeteira" in call_args["subject"]
        assert "carlos@example.com" in call_args["html"]


# ── Integration tests with reservation endpoint ──────────────────────────────


def test_reserve_gift_triggers_emails_when_couple_notifications_enabled() -> None:
    """Reserving a gift should trigger email to guest and email to couple when enabled."""
    db = _TestingSession()
    couple, gift_list, gift = _seed_couple_list_gift(db, email_notifications_enabled=True)
    public_token = gift_list.public_token
    gift_id = gift.id
    db.close()

    with (
        patch.object(
            EmailService,
            "send_reservation_confirmation_to_guest",
            return_value={"id": "guest-email"},
        ) as mock_guest_email,
        patch.object(
            EmailService,
            "send_reservation_notification_to_couple",
            return_value={"id": "couple-email"},
        ) as mock_couple_email,
    ):
        response = client.post(
            f"/public/{public_token}/gifts/{gift_id}/reserve",
            json={"guest_name": "Luciana Silva", "guest_email": "luciana@example.com"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["guest_name"] == "Luciana Silva"
        assert data["guest_email"] == "luciana@example.com"

        # Check that both background tasks were dispatched
        mock_guest_email.assert_called_once_with(
            guest_name="Luciana Silva",
            guest_email="luciana@example.com",
            couple_name="Beatriz & Tiago",
            gift_name="Cafeteira Nespresso",
            gift_price=Decimal("599.00"),
            store_link="https://nespresso.com/cafeteira",
        )
        mock_couple_email.assert_called_once_with(
            couple_email="beatriz.tiago@example.com",
            couple_name="Beatriz & Tiago",
            guest_name="Luciana Silva",
            guest_email="luciana@example.com",
            gift_name="Cafeteira Nespresso",
        )


def test_reserve_gift_skips_couple_email_when_notifications_disabled() -> None:
    """Reserving a gift should NOT send email to couple if email_notifications_enabled is False."""
    db = _TestingSession()
    couple, gift_list, gift = _seed_couple_list_gift(db, email_notifications_enabled=False)
    public_token = gift_list.public_token
    gift_id = gift.id
    db.close()

    with (
        patch.object(
            EmailService,
            "send_reservation_confirmation_to_guest",
            return_value={"id": "guest-email"},
        ) as mock_guest_email,
        patch.object(
            EmailService,
            "send_reservation_notification_to_couple",
            return_value={"id": "couple-email"},
        ) as mock_couple_email,
    ):
        response = client.post(
            f"/public/{public_token}/gifts/{gift_id}/reserve",
            json={"guest_name": "Marcos Paulo", "guest_email": "marcos@example.com"},
        )

        assert response.status_code == 201
        mock_guest_email.assert_called_once_with(
            guest_name="Marcos Paulo",
            guest_email="marcos@example.com",
            couple_name="Beatriz & Tiago",
            gift_name="Cafeteira Nespresso",
            gift_price=Decimal("599.00"),
            store_link="https://nespresso.com/cafeteira",
        )
        mock_couple_email.assert_not_called()
