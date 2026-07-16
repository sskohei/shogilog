from uuid import UUID

from storage3.exceptions import StorageApiError
from supabase import Client

from app.repositories.base import SupabaseRepository
from app.schemas.game import GameListFilters

KIFU_BUCKET = "kifu"


class GameRepository(SupabaseRepository):
    """
    Repository for the games table.
    """

    table_name = "games"

    def __init__(self, client: Client | None = None) -> None:
        super().__init__(client=client)

    def list_by_user(
        self,
        user_id: UUID,
        filters: GameListFilters,
    ) -> tuple[list[dict], int]:
        start = (filters.page - 1) * filters.limit
        end = start + filters.limit - 1

        query = (
            self.table(self.table_name)
            .select("*", count="exact")
            .eq("user_id", str(user_id))
        )

        query = self._apply_filters(query, filters)
        query = query.order(
            filters.sort,
            desc=filters.order == "desc",
        ).range(start, end)

        response = query.execute()

        return response.data or [], response.count or 0

    def list_stats_by_user(self, user_id: UUID) -> list[dict]:
        response = (
            self.table(self.table_name)
            .select("result, platform_id, my_opening_id, side, played_at")
            .eq("user_id", str(user_id))
            .execute()
        )

        return response.data or []

    def get_by_id(self, user_id: UUID, game_id: UUID) -> dict | None:
        response = (
            self.table(self.table_name)
            .select("*")
            .eq("id", str(game_id))
            .eq("user_id", str(user_id))
            .maybe_single()
            .execute()
        )

        return response.data

    def create(self, user_id: UUID, data: dict) -> dict:
        response = (
            self.table(self.table_name)
            .insert({**data, "user_id": str(user_id)})
            .execute()
        )

        return response.data[0]

    def update(self, user_id: UUID, game_id: UUID, data: dict) -> dict | None:
        response = (
            self.table(self.table_name)
            .update(data)
            .eq("id", str(game_id))
            .eq("user_id", str(user_id))
            .execute()
        )

        if not response.data:
            return None

        return response.data[0]

    def create_signed_kifu_url(self, path: str, expires_in: int = 300) -> str | None:
        try:
            result = self.client.storage.from_(KIFU_BUCKET).create_signed_url(
                path, expires_in
            )
        except StorageApiError:
            return None

        return result.get("signedUrl")

    def delete(self, user_id: UUID, game_id: UUID) -> bool:
        response = (
            self.table(self.table_name)
            .delete()
            .eq("id", str(game_id))
            .eq("user_id", str(user_id))
            .execute()
        )

        return bool(response.data)

    def _apply_filters(self, query, filters: GameListFilters):
        if filters.platform_id is not None:
            query = query.eq("platform_id", filters.platform_id)

        if filters.result is not None:
            query = query.eq("result", filters.result.value)

        if filters.side is not None:
            query = query.eq("side", filters.side.value)

        if filters.opening_id is not None:
            query = query.or_(
                "my_opening_id.eq."
                f"{filters.opening_id},opponent_opening_id.eq."
                f"{filters.opening_id}"
            )

        if filters.from_date is not None:
            query = query.gte("played_at", filters.from_date.isoformat())

        if filters.to_date is not None:
            query = query.lte("played_at", filters.to_date.isoformat())

        if filters.search is not None:
            escaped = filters.search.replace("%", "\\%").replace("_", "\\_")
            query = query.or_(
                f"opponent_name.ilike.%{escaped}%,memo.ilike.%{escaped}%"
            )

        return query
