import time

import httpx
from jose import JWTError, jwk, jwt

from app.core.config import get_settings

_JWKS_CACHE_TTL_SECONDS = 60 * 60

_jwks_cache: dict | None = None
_jwks_cache_expires_at: float = 0.0


def _fetch_jwks() -> dict:
    settings = get_settings()

    if settings.supabase_url is None:
        raise JWTError("SUPABASE_URL is not configured.")

    jwks_url = f"{settings.supabase_url}/auth/v1/.well-known/jwks.json"

    try:
        response = httpx.get(jwks_url, timeout=5.0)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPError as exc:
        raise JWTError("Failed to fetch JWKS.") from exc


def _get_jwks(force_refresh: bool = False) -> dict:
    global _jwks_cache, _jwks_cache_expires_at

    now = time.monotonic()

    if force_refresh or _jwks_cache is None or now >= _jwks_cache_expires_at:
        _jwks_cache = _fetch_jwks()
        _jwks_cache_expires_at = now + _JWKS_CACHE_TTL_SECONDS

    return _jwks_cache


def _find_jwk(jwks: dict, kid: str) -> dict | None:
    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            return key
    return None


def decode_access_token(token: str) -> dict:
    """
    Decode a Supabase Auth JWT verified against the project's JWKS (ES256).
    """
    try:
        kid = jwt.get_unverified_header(token)["kid"]
    except Exception as exc:
        raise JWTError("Invalid token header.") from exc

    matching_jwk = _find_jwk(_get_jwks(), kid)

    if matching_jwk is None:
        matching_jwk = _find_jwk(_get_jwks(force_refresh=True), kid)

    if matching_jwk is None:
        raise JWTError("Signing key not found for token.")

    key = jwk.construct(matching_jwk, algorithm=matching_jwk["alg"])

    return jwt.decode(
        token,
        key,
        algorithms=[matching_jwk["alg"]],
        options={"verify_aud": False},
    )
