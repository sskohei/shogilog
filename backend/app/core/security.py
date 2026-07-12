from jose import JWTError, jwt

from app.core.config import get_settings


def decode_access_token(token: str) -> dict:
    """
    Decode a Supabase Auth JWT.
    """
    settings = get_settings()

    if settings.jwt_secret is None:
        raise JWTError("JWT_SECRET is not configured.")

    return jwt.decode(
        token,
        settings.jwt_secret,
        algorithms=["HS256"],
        options={"verify_aud": False},
    )
