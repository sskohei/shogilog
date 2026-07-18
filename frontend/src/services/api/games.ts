import { apiFetch } from "@/lib/fetcher";
import type {
  Game,
  GameCreatePayload,
  GameDataResponse,
  GameIdResponse,
  GameKifuUrlResponse,
  GameListQueryParams,
  GameListResponse,
  KifuUploadResponse,
} from "@/types/game";
import type { Tag, TagListResponse } from "@/types/tag";

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

export async function uploadKifu(content: string): Promise<string> {
  const response = await apiFetch<KifuUploadResponse>("/games/kifu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
  return response.data.kifu_path;
}

export async function updateGameMemo(id: string, memo: string): Promise<void> {
  await apiFetch(`/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memo }),
  });
}

export async function createGame(payload: GameCreatePayload): Promise<string> {
  const response = await apiFetch<GameIdResponse>("/games", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.data.id;
}

export async function updateGame(
  id: string,
  payload: GameCreatePayload
): Promise<void> {
  await apiFetch(`/games/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteGame(id: string): Promise<void> {
  await apiFetch(`/games/${id}`, { method: "DELETE" });
}

export async function fetchGameTags(gameId: string): Promise<Tag[]> {
  const response = await apiFetch<TagListResponse>(`/games/${gameId}/tags`);
  return response.data;
}

export async function linkGameTag(gameId: string, tagId: string): Promise<void> {
  await apiFetch(`/games/${gameId}/tags`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tag_id: tagId }),
  });
}

export async function unlinkGameTag(gameId: string, tagId: string): Promise<void> {
  await apiFetch(`/games/${gameId}/tags/${tagId}`, { method: "DELETE" });
}
