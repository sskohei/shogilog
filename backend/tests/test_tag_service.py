from uuid import UUID, uuid4

import pytest
from fastapi import HTTPException

from app.schemas.tag import TagCreate, TagUpdate
from app.services.tags import TagService


class FakeTagRepository:
    def __init__(self) -> None:
        self.user_id = uuid4()
        self.other_user_id = uuid4()
        self.tag_id = uuid4()
        self.game_id = uuid4()
        self.tags = {
            self.tag_id: {
                "id": str(self.tag_id),
                "user_id": str(self.user_id),
                "name": "研究",
                "color": "#ff0000",
                "created_at": "2026-07-05T10:00:00+00:00",
                "updated_at": "2026-07-05T10:00:00+00:00",
            }
        }
        self.user_games = {self.game_id}
        self.game_tags = set[tuple[UUID, UUID]]()
        self.other_game_id = uuid4()

    def list_by_user(self, user_id: UUID) -> list[dict]:
        return [
            tag
            for tag in self.tags.values()
            if tag["user_id"] == str(user_id)
        ]

    def get_by_id(self, user_id: UUID, tag_id: UUID) -> dict | None:
        tag = self.tags.get(tag_id)

        if tag is None or tag["user_id"] != str(user_id):
            return None

        return tag

    def get_by_name(self, user_id: UUID, name: str) -> dict | None:
        for tag in self.tags.values():
            if tag["user_id"] == str(user_id) and tag["name"] == name:
                return tag

        return None

    def create(self, user_id: UUID, data: dict) -> dict:
        new_tag_id = uuid4()
        tag = {
            "id": str(new_tag_id),
            "user_id": str(user_id),
            **data,
            "created_at": "2026-07-05T10:00:00+00:00",
            "updated_at": "2026-07-05T10:00:00+00:00",
        }
        self.tags[new_tag_id] = tag
        return tag

    def update(self, user_id: UUID, tag_id: UUID, data: dict) -> dict | None:
        tag = self.get_by_id(user_id, tag_id)

        if tag is None:
            return None

        tag.update(data)
        return tag

    def delete(self, user_id: UUID, tag_id: UUID) -> bool:
        tag = self.get_by_id(user_id, tag_id)

        if tag is None:
            return False

        del self.tags[tag_id]
        return True

    def game_exists_for_user(self, user_id: UUID, game_id: UUID) -> bool:
        return user_id == self.user_id and game_id in self.user_games

    def tag_exists_for_user(self, user_id: UUID, tag_id: UUID) -> bool:
        return self.get_by_id(user_id, tag_id) is not None

    def game_tag_exists(self, game_id: UUID, tag_id: UUID) -> bool:
        return (game_id, tag_id) in self.game_tags

    def create_game_tag(self, game_id: UUID, tag_id: UUID) -> None:
        self.game_tags.add((game_id, tag_id))

    def delete_game_tag(self, game_id: UUID, tag_id: UUID) -> bool:
        key = (game_id, tag_id)

        if key not in self.game_tags:
            return False

        self.game_tags.remove(key)
        return True

    def list_for_game(self, game_id: UUID) -> list[dict]:
        return [
            self.tags[tag_id]
            for (linked_game_id, tag_id) in self.game_tags
            if linked_game_id == game_id
        ]


def test_create_tag_rejects_duplicate_name():
    repository = FakeTagRepository()
    service = TagService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.create_tag(
            repository.user_id,
            TagCreate(name="研究", color="#ffffff"),
        )

    assert exc.value.status_code == 409


def test_update_tag_rejects_empty_payload():
    repository = FakeTagRepository()
    service = TagService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.update_tag(repository.user_id, repository.tag_id, TagUpdate())

    assert exc.value.status_code == 400


def test_delete_tag_raises_404_for_missing_tag():
    repository = FakeTagRepository()
    service = TagService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.delete_tag(repository.user_id, uuid4())

    assert exc.value.status_code == 404


def test_link_tag_to_game_raises_404_for_missing_game():
    repository = FakeTagRepository()
    service = TagService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.link_tag_to_game(repository.user_id, uuid4(), repository.tag_id)

    assert exc.value.status_code == 404


def test_link_tag_to_game_raises_404_for_missing_tag():
    repository = FakeTagRepository()
    service = TagService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.link_tag_to_game(repository.user_id, repository.game_id, uuid4())

    assert exc.value.status_code == 404


def test_link_tag_to_game_rejects_duplicate_link():
    repository = FakeTagRepository()
    service = TagService(repository=repository)

    service.link_tag_to_game(repository.user_id, repository.game_id, repository.tag_id)

    with pytest.raises(HTTPException) as exc:
        service.link_tag_to_game(repository.user_id, repository.game_id, repository.tag_id)

    assert exc.value.status_code == 409


def test_unlink_tag_from_game_raises_404_for_missing_link():
    repository = FakeTagRepository()
    service = TagService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.unlink_tag_from_game(repository.user_id, repository.game_id, repository.tag_id)

    assert exc.value.status_code == 404


def test_get_tags_for_game_returns_linked_tags():
    repository = FakeTagRepository()
    service = TagService(repository=repository)
    service.link_tag_to_game(repository.user_id, repository.game_id, repository.tag_id)

    tags = service.get_tags_for_game(repository.user_id, repository.game_id)

    assert [tag["id"] for tag in tags] == [str(repository.tag_id)]


def test_get_tags_for_game_raises_404_for_game_not_owned():
    repository = FakeTagRepository()
    service = TagService(repository=repository)

    with pytest.raises(HTTPException) as exc:
        service.get_tags_for_game(repository.user_id, repository.other_game_id)

    assert exc.value.status_code == 404
