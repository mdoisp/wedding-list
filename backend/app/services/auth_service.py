import uuid

from sqlalchemy.orm import Session

from app.models.couple import Couple
from app.schemas import LoginRequest, RegisterRequest, TokenResponse
from app.utils.jwt import create_access_token, create_refresh_token, decode_refresh_token
from app.utils.security import hash_password, verify_password


class AuthService:
    def __init__(self, db: Session) -> None:
        self.db = db

    def register(self, data: RegisterRequest) -> Couple:
        existing = self.db.query(Couple).filter(Couple.email == data.email).first()
        if existing:
            raise ValueError("E-mail já cadastrado")

        couple = Couple(
            name=data.name,
            email=data.email,
            hashed_password=hash_password(data.password),
        )
        self.db.add(couple)
        self.db.commit()
        self.db.refresh(couple)
        return couple

    def authenticate(self, data: LoginRequest) -> Couple:
        couple = self.db.query(Couple).filter(Couple.email == data.email).first()
        if not couple or not verify_password(data.password, couple.hashed_password):
            raise ValueError("E-mail ou senha inválidos")
        return couple

    def create_tokens(self, couple: Couple) -> TokenResponse:
        subject = str(couple.id)
        return TokenResponse(
            access_token=create_access_token({"sub": subject}),
            refresh_token=create_refresh_token({"sub": subject}),
        )

    def refresh_token(self, token: str) -> TokenResponse:
        payload = decode_refresh_token(token)
        couple_id = payload.get("sub")
        if not couple_id:
            raise ValueError("Dados de autenticação inválidos")
        try:
            couple_uuid = uuid.UUID(couple_id)
        except (ValueError, TypeError) as exc:
            raise ValueError("Dados de autenticação inválidos") from exc
        couple = self.db.get(Couple, couple_uuid)
        if not couple:
            raise ValueError("Casal não encontrado")
        return self.create_tokens(couple)
