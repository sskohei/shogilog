from uuid import UUID

from supabase import Client

from app.repositories.base import SupabaseRepository


class TagRepository(SupabaseRepository):
    table_name = "tags"

    def __init__(self, client: Client | None = None) -> None:
        super().__init__(client=client)

    def list_by_user(self, user_id: UUID) -> list[dict]:
        response = (
            self.table(self.table_name)
            .select("*")
            .eq("user_id", str(user_id))
            .order("created_at", desc=True)
            .execute()
        )

        return response.data or []

    def get_by_id(self, user_id: UUID, tag_id: UUID) -> dict | None:
        response = (
            self.table(self.table_name)
            .select("*")
            .eq("id", str(tag_id))
            .eq("user_id", str(user_id))
            .maybe_single()
            .execute()
        )

        # maybe_single().execute() は該当行が無い場合、data=None のレスポンスではなく
        # None そのものを返す(postgrest-py の仕様)。
        return response.data if response is not None else None

    def get_by_name(self, user_id: UUID, name: str) -> dict | None:
        response = (
            self.table(self.table_name)
            .select("*")
            .eq("user_id", str(user_id))
            .eq("name", name)
            .maybe_single()
            .execute()
        )

        return response.data if response is not None else None

    def create(self, user_id: UUID, data: dict) -> dict:
        response = (
            self.table(self.table_name)
            .insert({**data, "user_id": str(user_id)})
            .execute()
        )

        return response.data[0]

    def update(self, user_id: UUID, tag_id: UUID, data: dict) -> dict | None:
        response = (
            self.table(self.table_name)
            .update(data)
            .eq("id", str(tag_id))
            .eq("user_id", str(user_id))
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    def delete(self, user_id: UUID, tag_id: UUID) -> bool:
        response = (
            self.table(self.table_name)
            .delete()
            .eq("id", str(tag_id))
            .eq("user_id", str(user_id))
            .execute()
        )

        return bool(response.data)

    def game_exists_for_user(self, user_id: UUID, game_id: UUID) -> bool:
        response = (
            self.table("games")
            .select("id")
            .eq("id", str(game_id))
            .eq("user_id", str(user_id))
            .maybe_single()
            .execute()
        )

        return response is not None

    def tag_exists_for_user(self, user_id: UUID, tag_id: UUID) -> bool:
        return self.get_by_id(user_id, tag_id) is not None

    def game_tag_exists(self, game_id: UUID, tag_id: UUID) -> bool:
        response = (
            self.table("game_tags")
            .select("game_id")
            .eq("game_id", str(game_id))
            .eq("tag_id", str(tag_id))
            .maybe_single()
            .execute()
        )

        return response is not None

    def create_game_tag(self, game_id: UUID, tag_id: UUID) -> None:
        (
            self.table("game_tags")
            .insert(
                {
                    "game_id": str(game_id),
                    "tag_id": str(tag_id),
                }
            )
            .execute()
        )

    def delete_game_tag(self, game_id: UUID, tag_id: UUID) -> bool:
        response = (
            self.table("game_tags")
            .delete()
            .eq("game_id", str(game_id))
            .eq("tag_id", str(tag_id))
            .execute()
        )

        return bool(response.data)

    def list_for_game(self, game_id: UUID) -> list[dict]:
        response = (
            self.table("game_tags")
            .select("tags(*)")
            .eq("game_id", str(game_id))
            .execute()
        )

        return [row["tags"] for row in response.data or [] if row.get("tags")]
