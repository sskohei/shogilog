from math import ceil
from uuid import UUID, uuid4

from fastapi import HTTPException, status
from storage3.exceptions import StorageApiError

from app.core.platforms import is_valid_rank, is_valid_rating_value
from app.repositories.games import GameRepository
from app.repositories.openings import OpeningRepository
from app.repositories.platforms import PlatformRepository
from app.repositories.ratings import RatingRepository
from app.schemas.common import Pagination
from app.schemas.game import GameCreate, GameListFilters, GameUpdate

RATING_FIELDS = ("rating_before", "rating_after", "opponent_rating")
RANK_FIELDS = ("rank_before", "rank_after", "opponent_rank")
OPENING_FIELDS = ("my_opening_id", "opponent_opening_id")


class GameService:
    """
    Business logic for game records.
    """

    def __init__(
        self,
        repository: GameRepository | None = None,
        rating_repository: RatingRepository | None = None,
        platform_repository: PlatformRepository | None = None,
        opening_repository: OpeningRepository | None = None,
    ) -> None:
        self.repository = repository or GameRepository()
        self.rating_repository = rating_repository or RatingRepository()
        self.platform_repository = platform_repository or PlatformRepository()
        self.opening_repository = opening_repository or OpeningRepository()

    def list_games(
        self,
        user_id: UUID,
        filters: GameListFilters,
    ) -> tuple[list[dict], Pagination]:
        games, total = self.repository.list_by_user(user_id, filters)
        total_pages = ceil(total / filters.limit) if total else 0

        return games, Pagination(
            page=filters.page,
            limit=filters.limit,
            total=total,
            total_pages=total_pages,
        )

    def get_game(self, user_id: UUID, game_id: UUID) -> dict:
        game = self.repository.get_by_id(user_id, game_id)

        if game is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found.",
            )

        return game

    def get_kifu_url(self, user_id: UUID, game_id: UUID) -> str | None:
        game = self.get_game(user_id, game_id)
        kifu_path = game.get("kifu_path")

        if not kifu_path:
            return None

        played_at = str(game.get("played_at") or "")[:10]
        filename: str | bool = f"kifu_{played_at}.kif" if played_at else True

        return self.repository.create_signed_kifu_url(kifu_path, download=filename)

    def upload_kifu(self, user_id: UUID, content: str) -> str:
        path = f"{user_id}/{uuid4()}.kif"
        try:
            self.repository.upload_kifu_text(path, content)
        except StorageApiError as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to upload kifu.",
            ) from exc

        return path

    def _validate_kifu_path(self, user_id: UUID, kifu_path: str | None) -> None:
        if kifu_path is not None and not kifu_path.startswith(f"{user_id}/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="kifu_path must be scoped to the authenticated user.",
            )

    def create_game(self, user_id: UUID, payload: GameCreate) -> dict:
        if self.platform_repository.get_by_id(payload.platform_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Platform not found.",
            )

        for opening_id in (payload.my_opening_id, payload.opponent_opening_id):
            if opening_id is not None and self.opening_repository.get_by_id(opening_id) is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Opening not found.",
                )

        self._validate_kifu_path(user_id, payload.kifu_path)

        data = payload.model_dump(mode="json")
        game = self.repository.create(user_id, data)

        if payload.rating_after is not None:
            self.rating_repository.create(
                user_id,
                {
                    "platform_id": payload.platform_id,
                    "rating": payload.rating_after,
                    "rank": payload.rank_after,
                    "game_id": game["id"],
                    "recorded_at": data["played_at"],
                },
            )

        return game

    def update_game(
        self,
        user_id: UUID,
        game_id: UUID,
        payload: GameUpdate,
    ) -> dict:
        data = payload.model_dump(exclude_unset=True, mode="json")

        if not data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields were provided for update.",
            )

        existing = self.repository.get_by_id(user_id, game_id)

        if existing is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found.",
            )

        platform_id = data.get("platform_id", existing["platform_id"])

        if "platform_id" in data and self.platform_repository.get_by_id(platform_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Platform not found.",
            )

        for field in OPENING_FIELDS:
            if field in data and data[field] is not None:
                if self.opening_repository.get_by_id(data[field]) is None:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="Opening not found.",
                    )

        for field in RATING_FIELDS:
            value = data[field] if field in data else existing.get(field)
            if value is not None and not is_valid_rating_value(platform_id, value):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Rating value is out of range for this platform.",
                )

        for field in RANK_FIELDS:
            value = data[field] if field in data else existing.get(field)
            if not is_valid_rank(platform_id, value):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Rank value is not valid for this platform.",
                )

        if "kifu_path" in data:
            self._validate_kifu_path(user_id, data["kifu_path"])

        game = self.repository.update(user_id, game_id, data)

        if game is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found.",
            )

        return game

    def delete_game(self, user_id: UUID, game_id: UUID) -> None:
        deleted = self.repository.delete(user_id, game_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found.",
            )
