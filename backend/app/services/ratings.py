from uuid import UUID

from fastapi import HTTPException, status

from app.repositories.ratings import RatingRepository
from app.schemas.rating import RatingCreate


class RatingService:
    """
    Business logic for rating history.
    """

    def __init__(self, repository: RatingRepository | None = None) -> None:
        self.repository = repository or RatingRepository()

    def list_ratings(self, user_id: UUID) -> list[dict]:
        return self.repository.list_by_user(user_id)

    def create_rating(self, user_id: UUID, payload: RatingCreate) -> dict:
        if payload.game_id is not None and not self.repository.game_exists_for_user(
            user_id, payload.game_id
        ):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found.",
            )

        data = payload.model_dump(mode="json")
        return self.repository.create(user_id, data)
