from uuid import UUID

from pydantic import BaseModel


class AuthUser(BaseModel):
    """
    Authenticated user extracted from a JWT.
    """

    id: UUID
    email: str | None = None
    role: str
