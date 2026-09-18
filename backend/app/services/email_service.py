import logging
from decimal import Decimal
from pathlib import Path
from string import Template
from typing import Any

import resend

from app.config import settings

logger = logging.getLogger(__name__)

TEMPLATES_DIR = Path(__file__).resolve().parent.parent / "templates"


class EmailService:
    def __init__(
        self,
        api_key: str | None = None,
        from_email: str | None = None,
    ) -> None:
        self.api_key: str = api_key if api_key is not None else settings.resend_api_key
        self.from_email: str = from_email or settings.email_from
        if self.api_key:
            resend.api_key = self.api_key

    def send_email(
        self,
        to: str,
        subject: str,
        html_body: str,
    ) -> dict[str, Any] | None:
        """Send an email using Resend SDK.

        If api_key is not configured, logs a message and returns a mock response
        to prevent errors in environments where Resend credentials are not set.
        """
        if not self.api_key:
            logger.info("Resend API key not configured. Mocking email send to %s", to)
            return {"id": "mock-email-id", "to": to, "subject": subject}

        try:
            params: resend.Emails.SendParams = {
                "from": self.from_email,
                "to": [to],
                "subject": subject,
                "html": html_body,
            }
            response = resend.Emails.send(params)
            return (
                dict(response)
                if hasattr(response, "items") or isinstance(response, dict)
                else {"id": str(response)}
            )
        except Exception as exc:
            logger.error("Failed to send email via Resend to %s: %s", to, exc)
            return None

    def render_template(self, template_name: str, context: dict[str, str]) -> str:
        template_path = TEMPLATES_DIR / template_name
        with open(template_path, encoding="utf-8") as f:
            template_content = f.read()
        return Template(template_content).safe_substitute(context)

    def send_reservation_confirmation_to_guest(
        self,
        guest_name: str,
        guest_email: str,
        couple_name: str,
        gift_name: str,
        gift_price: Decimal | None = None,
        store_link: str | None = None,
    ) -> dict[str, Any] | None:
        price_html = (
            f'<div class="gift-info"><strong>Valor sugerido:</strong> R$ {gift_price:.2f}</div>'
            if gift_price is not None
            else ""
        )
        link_html = (
            f'<a href="{store_link}" target="_blank" class="store-link">Ver na loja</a>'
            if store_link
            else ""
        )

        context = {
            "guest_name": guest_name,
            "couple_name": couple_name,
            "gift_name": gift_name,
            "gift_price_section": price_html,
            "store_link_section": link_html,
        }
        html_body = self.render_template("reservation_guest.html", context)
        subject = f"Reserva Confirmada: {gift_name} — Casamento de {couple_name}"
        return self.send_email(to=guest_email, subject=subject, html_body=html_body)

    def send_reservation_notification_to_couple(
        self,
        couple_email: str,
        couple_name: str,
        guest_name: str,
        guest_email: str,
        gift_name: str,
    ) -> dict[str, Any] | None:
        context = {
            "couple_name": couple_name,
            "guest_name": guest_name,
            "guest_email": guest_email,
            "gift_name": gift_name,
        }
        html_body = self.render_template("reservation_couple.html", context)
        subject = f"Novo presente reservado: {gift_name} por {guest_name}!"
        return self.send_email(to=couple_email, subject=subject, html_body=html_body)
