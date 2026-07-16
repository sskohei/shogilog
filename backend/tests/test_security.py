from datetime import datetime, timedelta, timezone

import pytest
from jose import JWTError, jwt

from app.core import security


@pytest.fixture(autouse=True)
def reset_jwks_cache():
    security._jwks_cache = None
    security._jwks_cache_expires_at = 0.0
    yield
    security._jwks_cache = None
    security._jwks_cache_expires_at = 0.0


def _make_token(private_pem: str, kid: str, expired: bool = False) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": "user-123",
        "role": "authenticated",
        "email": "test@example.com",
        "iat": now,
        "exp": now - timedelta(minutes=5) if expired else now + timedelta(hours=1),
    }
    return jwt.encode(payload, private_pem, algorithm="ES256", headers={"kid": kid})


def test_decode_access_token_valid(monkeypatch, ec_key_pair):
    monkeypatch.setattr(
        security, "_fetch_jwks", lambda: {"keys": [ec_key_pair["public_jwk"]]}
    )

    token = _make_token(ec_key_pair["private_pem"], ec_key_pair["kid"])

    payload = security.decode_access_token(token)

    assert payload["sub"] == "user-123"
    assert payload["role"] == "authenticated"


def test_decode_access_token_unknown_kid(monkeypatch, ec_key_pair):
    monkeypatch.setattr(
        security, "_fetch_jwks", lambda: {"keys": [ec_key_pair["public_jwk"]]}
    )

    token = _make_token(ec_key_pair["private_pem"], "unknown-kid")

    with pytest.raises(JWTError):
        security.decode_access_token(token)


def test_decode_access_token_expired(monkeypatch, ec_key_pair):
    monkeypatch.setattr(
        security, "_fetch_jwks", lambda: {"keys": [ec_key_pair["public_jwk"]]}
    )

    token = _make_token(ec_key_pair["private_pem"], ec_key_pair["kid"], expired=True)

    with pytest.raises(JWTError):
        security.decode_access_token(token)


def test_decode_access_token_jwks_fetch_failure(monkeypatch, ec_key_pair):
    def _raise():
        raise JWTError("Failed to fetch JWKS.")

    monkeypatch.setattr(security, "_fetch_jwks", _raise)

    token = _make_token(ec_key_pair["private_pem"], ec_key_pair["kid"])

    with pytest.raises(JWTError):
        security.decode_access_token(token)


def test_decode_access_token_malformed_token():
    with pytest.raises(JWTError):
        security.decode_access_token("not-a-valid-token")
