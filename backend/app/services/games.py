from math import ceil
from uuid import UUID

from fastapi import HTTPException, status

from app.repositories.games import GameRepository
from app.schemas.common import Pagination
from app.schemas.game import GameCreate, GameListFilters, GameUpdate


class GameService:
    """
    Business logic for game records.
    """

    def __init__(self, repository: GameRepository | None = None) -> None:
        self.repository = repository or GameRepository()

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

    def create_game(self, user_id: UUID, payload: GameCreate) -> dict:
        data = payload.model_dump(mode="json")
        return self.repository.create(user_id, data)

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
