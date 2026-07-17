import { apiFetch } from "@/lib/fetcher";
import type {
  FavoriteOpeningIdsResponse,
  Opening,
  OpeningListResponse,
} from "@/types/opening";

export async function fetchOpenings(): Promise<Opening[]> {
  const response = await apiFetch<OpeningListResponse>("/openings");
  return response.data;
}

export async function fetchFavoriteOpeningIds(): Promise<number[]> {
  const response = await apiFetch<FavoriteOpeningIdsResponse>("/openings/favorites");
  return response.data;
}

export async function addFavoriteOpening(openingId: number): Promise<void> {
  await apiFetch(`/openings/${openingId}/favorite`, { method: "POST" });
}

export async function removeFavoriteOpening(openingId: number): Promise<void> {
  await apiFetch(`/openings/${openingId}/favorite`, { method: "DELETE" });
}
