from uuid import UUID

from fastapi import APIRouter, Depends, status

from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.common import MessageResponse
from app.schemas.tag import TagCreate, TagId, TagIdResponse, TagListResponse, TagUpdate
from app.services.tags import TagService

router = APIRouter(prefix="/tags")


def get_tag_service() -> TagService:
    return TagService()


@router.get("", response_model=TagListResponse)
async def list_tags(
    current_user: AuthUser = Depends(get_current_user),
    service: TagService = Depends(get_tag_service),
) -> TagListResponse:
    tags = service.list_tags(current_user.id)
    return TagListResponse(data=tags)


@router.post(
    "",
    response_model=TagIdResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_tag(
    payload: TagCreate,
    current_user: AuthUser = Depends(get_current_user),
    service: TagService = Depends(get_tag_service),
) -> TagIdResponse:
    tag = service.create_tag(current_user.id, payload)
    return TagIdResponse(data=TagId(id=tag["id"]))


@router.put("/{tag_id}", response_model=MessageResponse)
async def update_tag(
    tag_id: UUID,
    payload: TagUpdate,
    current_user: AuthUser = Depends(get_current_user),
    service: TagService = Depends(get_tag_service),
) -> MessageResponse:
    service.update_tag(current_user.id, tag_id, payload)
    return MessageResponse(message="Tag updated successfully.")


@router.delete("/{tag_id}", response_model=MessageResponse)
async def delete_tag(
    tag_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    service: TagService = Depends(get_tag_service),
) -> MessageResponse:
    service.delete_tag(current_user.id, tag_id)
    return MessageResponse(message="Tag deleted successfully.")