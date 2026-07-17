"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/fetcher";
import { updatePlatformRating, updateProfile } from "@/services/api/profile";
import type {
  PlatformRatingActionState,
  ProfileFormState,
} from "@/features/profile/types";
import {
  toOptionalString,
  validatePlatformRatingInput,
  validateProfileInput,
  type PlatformRatingFieldErrors,
  type ProfileFormFieldErrors,
} from "@/features/profile/validation";
import { getApiErrorFieldNames } from "@/lib/apiFieldErrors";
import { getApiErrorMessage } from "@/lib/errorMessages";
import type {
  PlatformRatingUpsertPayload,
  ProfileUpdatePayload,
} from "@/types/profile";

const PROFILE_FIELD_ERROR_MESSAGES: Record<keyof ProfileFormFieldErrors, string> = {
  display_name: "表示名が長すぎます",
  bio: "自己紹介が長すぎます",
};

function mapProfileFieldErrors(error: ApiError): ProfileFormFieldErrors {
  const fieldNames = getApiErrorFieldNames(error);
  const errors: ProfileFormFieldErrors = {};

  for (const [field, message] of Object.entries(PROFILE_FIELD_ERROR_MESSAGES) as [
    keyof ProfileFormFieldErrors,
    string,
  ][]) {
    if (fieldNames.has(field)) {
      errors[field] = [message];
    }
  }

  return errors;
}

const PLATFORM_RATING_FIELD_ERROR_MESSAGES: Record<
  keyof PlatformRatingFieldErrors,
  string
> = {
  rating: "レーティングの値が正しくありません",
  rank: "段位の指定が正しくありません",
};

function mapPlatformRatingFieldErrors(error: ApiError): PlatformRatingFieldErrors {
  const fieldNames = getApiErrorFieldNames(error);
  const errors: PlatformRatingFieldErrors = {};

  for (const [field, message] of Object.entries(
    PLATFORM_RATING_FIELD_ERROR_MESSAGES
  ) as [keyof PlatformRatingFieldErrors, string][]) {
    if (fieldNames.has(field)) {
      errors[field] = [message];
    }
  }

  return errors;
}

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
    if (error instanceof ApiError && error.status === 422) {
      const fieldErrors = mapProfileFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        return { errors: fieldErrors, message: "入力内容を確認してください。" };
      }
    }
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
  _prevState: PlatformRatingActionState,
  formData: FormData
): Promise<PlatformRatingActionState> {
  const hasPlayed = formData.get("has_played") === "played";
  const ratingRaw = formData.get("rating");
  const rankRaw = formData.get("rank");

  const errors = validatePlatformRatingInput(platformId, hasPlayed, ratingRaw, rankRaw);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

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
    if (error instanceof ApiError && error.status === 422) {
      const fieldErrors = mapPlatformRatingFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        return { errors: fieldErrors, message: "入力内容を確認してください。" };
      }
    }
    return {
      errors: {},
      message: error instanceof ApiError
        ? getApiErrorMessage(error, "レートの更新に失敗しました。")
        : "レートの更新に失敗しました。",
    };
  }

  revalidatePath("/profile");
  return { errors: {} };
}
