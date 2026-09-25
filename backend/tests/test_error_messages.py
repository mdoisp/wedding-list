"""Check the user-facing messages produced by framework error paths."""

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_missing_authentication_preserves_challenge() -> None:
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert response.headers["www-authenticate"] == "Bearer"
    assert response.json()["detail"] == "É necessário entrar na sua conta para continuar."


def test_unknown_route_and_wrong_method() -> None:
    response = client.get("/nonexistent")
    assert response.status_code == 404
    assert response.json()["detail"] == "Recurso não encontrado."
    response = client.get("/auth/login")
    assert response.status_code == 405
    assert response.json()["detail"] == "Esta operação não é permitida."


def test_validation_preserves_field_locations_and_error_types() -> None:
    response = client.post("/auth/register", json={"email": "invalid", "password": "pw"})
    assert response.status_code == 422
    errors = {tuple(error["loc"]): error for error in response.json()["detail"]}
    assert errors[("body", "name")]["type"] == "missing"
    assert errors[("body", "name")]["msg"] == "Este campo é obrigatório."
    assert errors[("body", "email")]["msg"] == "Informe um endereço de e-mail válido."


def test_malformed_json() -> None:
    response = client.post(
        "/auth/register", content="{", headers={"Content-Type": "application/json"}
    )
    assert response.status_code == 422
    assert response.json()["detail"][0]["msg"] == (
        "Os dados enviados não estão em um formato JSON válido."
    )


def test_invalid_refresh_token_does_not_expose_library_error() -> None:
    response = client.post("/auth/refresh", json={"refresh_token": "invalid"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Sua sessão é inválida ou expirou. Entre novamente."
