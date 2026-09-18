import uuid
from decimal import Decimal

from pydantic import BaseModel, ConfigDict


class PixQrCodeResponse(BaseModel):
    public_token: uuid.UUID
    pix_key: str
    pix_key_type: str | None = None
    merchant_name: str
    merchant_city: str
    amount: Decimal | None = None
    pix_copy_paste: str
    qr_code_base64: str

    model_config = ConfigDict(from_attributes=True)
