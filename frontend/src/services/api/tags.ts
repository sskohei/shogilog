import { apiFetch } from "@/lib/fetcher";
import type {
  Tag,
  TagCreatePayload,
  TagIdResponse,
  TagListResponse,
} from "@/types/tag";

export async function fetchTags(): Promise<Tag[]> {
  const response = await apiFetch<TagListResponse>("/tags");
  return response.data;
}

export async function createTag(payload: TagCreatePayload): Promise<string> {
  const response = await apiFetch<TagIdResponse>("/tags", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return response.data.id;
}

export async function updateTag(
  id: string,
  payload: TagCreatePayload
): Promise<void> {
  await apiFetch(`/tags/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function deleteTag(id: string): Promise<void> {
  await apiFetch(`/tags/${id}`, { method: "DELETE" });
}
