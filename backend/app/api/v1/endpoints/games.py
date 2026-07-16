from datetime import datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.dependencies.auth import get_current_user
from app.schemas.auth import AuthUser
from app.schemas.common import MessageResponse
from app.schemas.game import (
    GameCreate,
    GameDataResponse,
    GameId,
    GameIdResponse,
    GameKifuUrl,
    GameKifuUrlResponse,
    GameListFilters,
    GameListResponse,
    GameResult,
    GameUpdate,
    PlayerSide,
)
from app.schemas.tag import GameTagLinkRequest, TagListResponse
from app.services.games import GameService
from app.services.tags import TagService

router = APIRouter(prefix="/games")


def get_game_service() -> GameService:
    return GameService()


def get_tag_service() -> TagService:
    return TagService()


@router.get("", response_model=GameListResponse)
async def list_games(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=20, ge=1, le=100),
    platform_id: int | None = Query(default=None, ge=1),
    result: GameResult | None = None,
    side: PlayerSide | None = None,
    opening_id: int | None = Query(default=None, ge=1),
    from_date: datetime | None = Query(default=None, alias="from"),
    to_date: datetime | None = Query(default=None, alias="to"),
    search: str | None = Query(default=None, min_length=1, max_length=255),
    sort: str = Query(default="played_at", pattern="^(played_at|created_at|result)$"),
    order: str = Query(default="desc", pattern="^(asc|desc)$"),
    current_user: AuthUser = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
) -> GameListResponse:
    filters = GameListFilters(
        page=page,
        limit=limit,
        platform_id=platform_id,
        result=result,
        side=side,
        opening_id=opening_id,
        from_date=from_date,
        to_date=to_date,
        search=search,
        sort=sort,
        order=order,
    )
    games, pagination = service.list_games(current_user.id, filters)

    return GameListResponse(data=games, pagination=pagination)


@router.post(
    "",
    response_model=GameIdResponse,
    status_code=status.HTTP_201_CREATED,
)
async def create_game(
    payload: GameCreate,
    current_user: AuthUser = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
) -> GameIdResponse:
    game = service.create_game(current_user.id, payload)

    return GameIdResponse(data=GameId(id=game["id"]))


@router.get("/{game_id}", response_model=GameDataResponse)
async def get_game(
    game_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
) -> GameDataResponse:
    game = service.get_game(current_user.id, game_id)

    return GameDataResponse(data=game)


@router.get("/{game_id}/kifu-url", response_model=GameKifuUrlResponse)
async def get_game_kifu_url(
    game_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
) -> GameKifuUrlResponse:
    url = service.get_kifu_url(current_user.id, game_id)

    return GameKifuUrlResponse(data=GameKifuUrl(url=url))


@router.put("/{game_id}", response_model=MessageResponse)
async def update_game(
    game_id: UUID,
    payload: GameUpdate,
    current_user: AuthUser = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
) -> MessageResponse:
    service.update_game(current_user.id, game_id, payload)

    return MessageResponse(message="Game updated successfully.")


@router.delete(
    "/{game_id}",
    response_model=MessageResponse,
)
async def delete_game(
    game_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    service: GameService = Depends(get_game_service),
) -> MessageResponse:
    service.delete_game(current_user.id, game_id)

    return MessageResponse(message="Game deleted successfully.")


@router.get("/{game_id}/tags", response_model=TagListResponse)
async def list_game_tags(
    game_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    service: TagService = Depends(get_tag_service),
) -> TagListResponse:
    tags = service.get_tags_for_game(current_user.id, game_id)

    return TagListResponse(data=tags)


@router.post("/{game_id}/tags", response_model=MessageResponse)
async def link_tag_to_game(
    game_id: UUID,
    payload: GameTagLinkRequest,
    current_user: AuthUser = Depends(get_current_user),
    service: TagService = Depends(get_tag_service),
) -> MessageResponse:
    service.link_tag_to_game(current_user.id, game_id, payload.tag_id)

    return MessageResponse(message="Tag added to game successfully.")


@router.delete("/{game_id}/tags/{tag_id}", response_model=MessageResponse)
async def unlink_tag_from_game(
    game_id: UUID,
    tag_id: UUID,
    current_user: AuthUser = Depends(get_current_user),
    service: TagService = Depends(get_tag_service),
) -> MessageResponse:
    service.unlink_tag_from_game(current_user.id, game_id, tag_id)

    return MessageResponse(message="Tag removed from game successfully.")
