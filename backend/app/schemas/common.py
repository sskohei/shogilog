from pydantic import BaseModel, Field


class MessageResponse(BaseModel):
    message: str


class Pagination(BaseModel):
    page: int = Field(..., ge=1)
    limit: int = Field(..., ge=1)
    total: int = Field(..., ge=0)
    total_pages: int = Field(..., ge=0)
