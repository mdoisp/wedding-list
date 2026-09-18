import base64
import io
import unicodedata
from decimal import Decimal

import qrcode


def crc16_ccitt(data: str) -> str:
    """Calculate the CRC-16/CCITT-FALSE checksum for EMV/BR Code payload.

    Polynomial: 0x1021, Initial value: 0xFFFF, No reflection, Final XOR: 0x0000.
    """
    crc = 0xFFFF
    for char in data.encode("utf-8"):
        crc ^= char << 8
        for _ in range(8):
            if crc & 0x8000:
                crc = ((crc << 1) ^ 0x1021) & 0xFFFF
            else:
                crc = (crc << 1) & 0xFFFF
    return f"{crc:04X}"


def clean_ascii_text(text: str, max_length: int) -> str:
    """Normalize unicode text to ASCII uppercase without accents, limited to max_length."""
    normalized = unicodedata.normalize("NFKD", text)
    ascii_only = normalized.encode("ASCII", "ignore").decode("ASCII")
    return ascii_only.upper()[:max_length]


def clean_pix_key(key: str, key_type: str | None = None) -> str:
    """Format and normalize a Pix key based on its type or content."""
    cleaned = key.strip()
    ktype = key_type.upper() if key_type else ""

    if ktype in ("CPF", "CNPJ"):
        return "".join(c for c in cleaned if c.isdigit())
    if ktype == "EMAIL":
        return cleaned.lower()
    if ktype == "PHONE":
        digits = "".join(c for c in cleaned if c.isdigit())
        if not cleaned.startswith("+"):
            return f"+55{digits}" if len(digits) in (10, 11) else f"+{digits}"
        return f"+{digits}"
    if ktype == "RANDOM":
        return cleaned.lower()

    # Auto-detection
    if "@" in cleaned:
        return cleaned.lower()
    digits = "".join(c for c in cleaned if c.isdigit())
    if len(digits) in (11, 14) and not cleaned.startswith("+"):
        return digits
    return cleaned


def format_tlv(tag: str, value: str) -> str:
    """Format a single Tag-Length-Value entry for EMV BR Code."""
    return f"{tag}{len(value):02d}{value}"


def generate_pix_payload(
    pix_key: str,
    merchant_name: str,
    merchant_city: str = "BRASILIA",
    txid: str = "***",
    amount: Decimal | float | None = None,
    description: str | None = None,
    pix_key_type: str | None = None,
) -> str:
    """Generate a standard static Pix (BR Code / EMV) payload compliant with BACEN.

    Follows the Manual de Padroes para Iniciacao do Pix (Banco Central do Brasil).
    """
    key = clean_pix_key(pix_key, pix_key_type)
    name = clean_ascii_text(merchant_name, 25) or "RECEBEDOR"
    city = clean_ascii_text(merchant_city, 15) or "BRASILIA"

    # Tag 26: Merchant Account Information
    account_info = format_tlv("00", "br.gov.bcb.pix") + format_tlv("01", key)
    if description:
        account_info += format_tlv("02", clean_ascii_text(description, 25))

    payload = (
        format_tlv("00", "01")  # Payload Format Indicator
        + format_tlv("26", account_info)  # Merchant Account Information
        + format_tlv("52", "0000")  # Merchant Category Code
        + format_tlv("53", "986")  # Transaction Currency (986 = BRL)
    )

    if amount is not None and amount > 0:
        payload += format_tlv("54", f"{amount:.2f}")

    payload += (
        format_tlv("58", "BR")  # Country Code
        + format_tlv("59", name)  # Merchant Name
        + format_tlv("60", city)  # Merchant City
        + format_tlv("62", format_tlv("05", txid[:25]))  # Additional Data Field (txid)
        + "6304"  # CRC16 ID and Length
    )

    crc = crc16_ccitt(payload)
    return payload + crc


def verify_pix_crc(payload: str) -> bool:
    """Verify if a Pix payload has a valid CRC16."""
    if len(payload) < 8 or not payload[-8:-4] == "6304":
        return False
    expected_crc = crc16_ccitt(payload[:-4])
    return expected_crc == payload[-4:].upper()


def generate_pix_qr_code_png(payload: str, box_size: int = 10, border: int = 4) -> bytes:
    """Generate a PNG image stream of the QR Code from a Pix payload."""
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=box_size,
        border=border,
    )
    qr.add_data(payload)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")

    buffer = io.BytesIO()
    img.save(buffer, format="PNG")
    return buffer.getvalue()


def generate_pix_qr_code_base64(payload: str, box_size: int = 10, border: int = 4) -> str:
    """Generate a base64 Data URI for a Pix QR Code PNG."""
    png_bytes = generate_pix_qr_code_png(payload, box_size=box_size, border=border)
    b64 = base64.b64encode(png_bytes).decode("utf-8")
    return f"data:image/png;base64,{b64}"
