import { apiFetch } from "@/lib/fetcher";
import type {
  Game,
  GameDataResponse,
  GameKifuUrlResponse,
  GameListQueryParams,
  GameListResponse,
} from "@/types/game";

export async function fetchGames(
  params: GameListQueryParams
): Promise<GameListResponse> {
  const searchParams = new URLSearchParams();

  if (params.page !== undefined) searchParams.set("page", String(params.page));
  if (params.limit !== undefined) searchParams.set("limit", String(params.limit));
  if (params.platformId !== undefined)
    searchParams.set("platform_id", String(params.platformId));
  if (params.result !== undefined) searchParams.set("result", params.result);
  if (params.side !== undefined) searchParams.set("side", params.side);
  if (params.openingId !== undefined)
    searchParams.set("opening_id", String(params.openingId));
  if (params.fromDate !== undefined) searchParams.set("from", params.fromDate);
  if (params.toDate !== undefined) searchParams.set("to", params.toDate);
  if (params.search !== undefined) searchParams.set("search", params.search);
  if (params.sort !== undefined) searchParams.set("sort", params.sort);
  if (params.order !== undefined) searchParams.set("order", params.order);

  return apiFetch<GameListResponse>(`/games?${searchParams.toString()}`);
}

export async function fetchGame(id: string): Promise<Game> {
  const response = await apiFetch<GameDataResponse>(`/games/${id}`);
  return response.data;
}

export async function fetchGameKifuUrl(id: string): Promise<string | null> {
  const response = await apiFetch<GameKifuUrlResponse>(`/games/${id}/kifu-url`);
  return response.data.url;
}

export async function updateGameMemo(id: string, memo: string): Promise<void> {
  await apiFetch(`/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memo }),
  });
}
