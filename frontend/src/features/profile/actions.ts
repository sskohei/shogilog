"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/fetcher";
import { updatePlatformRating, updateProfile } from "@/services/api/profile";
import type { ProfileFormState } from "@/features/profile/types";
import { toOptionalString, validateProfileInput } from "@/features/profile/validation";
import { getApiErrorMessage } from "@/lib/errorMessages";
import type { SimpleActionState } from "@/types/actionState";
import type {
  PlatformRatingUpsertPayload,
  ProfileUpdatePayload,
} from "@/types/profile";

export async function updateProfileAction(
  _prevState: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const input = {
    display_name: formData.get("display_name"),
    bio: formData.get("bio"),
  };
  const errors = validateProfileInput(input);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const payload: ProfileUpdatePayload = {
    display_name: toOptionalString(input.display_name),
    bio: toOptionalString(input.bio),
  };

  try {
    await updateProfile(payload);
  } catch (error) {
    return {
      errors: {},
      message: error instanceof ApiError
        ? getApiErrorMessage(error, "プロフィールの更新に失敗しました。")
        : "プロフィールの更新に失敗しました。",
    };
  }

  revalidatePath("/profile");
  return { errors: {} };
}

export async function updatePlatformRatingAction(
  platformId: number,
  _prevState: SimpleActionState,
  formData: FormData
): Promise<SimpleActionState> {
  const hasPlayed = formData.get("has_played") === "played";
  const ratingRaw = formData.get("rating");
  const rankRaw = formData.get("rank");

  const payload: PlatformRatingUpsertPayload = {
    has_played: hasPlayed,
    rating:
      hasPlayed && typeof ratingRaw === "string" && ratingRaw !== ""
        ? Number(ratingRaw)
        : null,
    rank:
      hasPlayed && typeof rankRaw === "string" && rankRaw !== "" ? rankRaw : null,
  };

  try {
    await updatePlatformRating(platformId, payload);
  } catch (error) {
    return {
      error: error instanceof ApiError
        ? getApiErrorMessage(error, "レートの更新に失敗しました。")
        : "レートの更新に失敗しました。",
    };
  }

  revalidatePath("/profile");
  return {};
}
