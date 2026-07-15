import { apiFetch } from "@/lib/fetcher";
import type { Opening, OpeningListResponse } from "@/types/opening";

export async function fetchOpenings(): Promise<Opening[]> {
  const response = await apiFetch<OpeningListResponse>("/openings");
  return response.data;
}
