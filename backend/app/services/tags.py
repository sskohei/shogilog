from uuid import UUID

from fastapi import HTTPException, status

from app.repositories.tags import TagRepository
from app.schemas.tag import TagCreate, TagUpdate


class TagService:
    def __init__(self, repository: TagRepository | None = None) -> None:
        self.repository = repository or TagRepository()

    def list_tags(self, user_id: UUID) -> list[dict]:
        return self.repository.list_by_user(user_id)

    def create_tag(self, user_id: UUID, payload: TagCreate) -> dict:
        existing = self.repository.get_by_name(user_id, payload.name)

        if existing is not None:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tag name already exists.",
            )

        data = payload.model_dump(mode="json")
        return self.repository.create(user_id, data)

    def update_tag(self, user_id: UUID, tag_id: UUID, payload: TagUpdate) -> dict:
        current = self.repository.get_by_id(user_id, tag_id)

        if current is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found.",
            )

        data = payload.model_dump(exclude_unset=True, mode="json")

        if not data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields were provided for update.",
            )

        if "name" in data:
            existing = self.repository.get_by_name(user_id, data["name"])

            if existing is not None and existing["id"] != str(tag_id):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Tag name already exists.",
                )

        updated = self.repository.update(user_id, tag_id, data)

        if updated is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found.",
            )

        return updated

    def delete_tag(self, user_id: UUID, tag_id: UUID) -> None:
        deleted = self.repository.delete(user_id, tag_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found.",
            )

    def link_tag_to_game(self, user_id: UUID, game_id: UUID, tag_id: UUID) -> None:
        if not self.repository.game_exists_for_user(user_id, game_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found.",
            )

        if not self.repository.tag_exists_for_user(user_id, tag_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found.",
            )

        if self.repository.game_tag_exists(game_id, tag_id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Tag is already linked to this game.",
            )

        self.repository.create_game_tag(game_id, tag_id)

    def unlink_tag_from_game(
        self,
        user_id: UUID,
        game_id: UUID,
        tag_id: UUID,
    ) -> None:
        if not self.repository.game_exists_for_user(user_id, game_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found.",
            )

        if not self.repository.tag_exists_for_user(user_id, tag_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag not found.",
            )

        deleted = self.repository.delete_game_tag(game_id, tag_id)

        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Tag is not linked to this game.",
            )

    def get_tags_for_game(self, user_id: UUID, game_id: UUID) -> list[dict]:
        if not self.repository.game_exists_for_user(user_id, game_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Game not found.",
            )

        return self.repository.list_for_game(game_id)
