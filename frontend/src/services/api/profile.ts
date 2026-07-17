import { apiFetch } from "@/lib/fetcher";
import type {
  PlatformRating,
  PlatformRatingListResponse,
  PlatformRatingUpsertPayload,
  Profile,
  ProfileDataResponse,
  ProfileUpdatePayload,
} from "@/types/profile";

export async function fetchProfile(): Promise<Profile> {
  const response = await apiFetch<ProfileDataResponse>("/profile");
  return response.data;
}

export async function updateProfile(payload: ProfileUpdatePayload): Promise<void> {
  await apiFetch("/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export async function fetchPlatformRatings(): Promise<PlatformRating[]> {
  const response = await apiFetch<PlatformRatingListResponse>(
    "/profile/platform-ratings"
  );
  return response.data;
}

export async function updatePlatformRating(
  platformId: number,
  payload: PlatformRatingUpsertPayload
): Promise<void> {
  await apiFetch(`/profile/platform-ratings/${platformId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
