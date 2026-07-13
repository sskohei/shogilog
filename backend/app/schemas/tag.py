from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{6}$")


class TagRead(TagBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime


class TagListResponse(BaseModel):
    data: list[TagRead]


class TagId(BaseModel):
    id: UUID


class TagIdResponse(BaseModel):
    data: TagId


class GameTagLinkRequest(BaseModel):
    tag_id: UUID
