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
