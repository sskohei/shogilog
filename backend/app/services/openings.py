from uuid import UUID

from fastapi import HTTPException, status

from app.repositories.openings import OpeningRepository


class OpeningService:
    """
    Business logic for the opening master data.
    """

    def __init__(self, repository: OpeningRepository | None = None) -> None:
        self.repository = repository or OpeningRepository()

    def list_openings(self) -> list[dict]:
        return self.repository.list_all()

    def get_opening(self, opening_id: int) -> dict:
        opening = self.repository.get_by_id(opening_id)

        if opening is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opening not found.",
            )

        return opening

    def list_favorite_ids(self, user_id: UUID) -> list[int]:
        return self.repository.list_favorite_ids(user_id)

    def add_favorite(self, user_id: UUID, opening_id: int) -> None:
        if self.repository.get_by_id(opening_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opening not found.",
            )

        if self.repository.favorite_exists(user_id, opening_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Opening is already a favorite.",
            )

        self.repository.create_favorite(user_id, opening_id)

    def remove_favorite(self, user_id: UUID, opening_id: int) -> None:
        if self.repository.get_by_id(opening_id) is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opening not found.",
            )

        deleted = self.repository.delete_favorite(user_id, opening_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Opening is not a favorite.",
            )
