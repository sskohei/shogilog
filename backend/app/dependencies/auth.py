from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError

from app.core.security import decode_access_token
from app.schemas.auth import AuthUser

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    request: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(
        bearer_scheme
    ),
) -> AuthUser:
    """
    Return the currently authenticated user.
    """

    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
        )

    try:
        payload = decode_access_token(credentials.credentials)

        user = AuthUser(
            id=payload["sub"],
            email=payload.get("email"),
            role=payload["role"],
        )
        # Stashed on request.state (backed by the shared ASGI scope) so the
        # access-log middleware can read it after the request completes.
        # A ContextVar would not work here: BaseHTTPMiddleware's call_next
        # runs the downstream app in a separate task, and sync dependencies
        # run in a thread pool, both of which get their own copy of the
        # context instead of mutating the caller's.
        request.state.user_id = str(user.id)

        return user

    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload.",
        ) from exc

    except JWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials.",
        ) from exc
