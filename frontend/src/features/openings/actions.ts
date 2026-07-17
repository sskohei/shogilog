"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/fetcher";
import { addFavoriteOpening, removeFavoriteOpening } from "@/services/api/openings";
import type { SimpleActionState } from "@/features/openings/types";

export async function addFavoriteOpeningAction(
  openingId: number,
  _prevState: SimpleActionState,
  _formData: FormData
): Promise<SimpleActionState> {
  try {
    await addFavoriteOpening(openingId);
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "お気に入りの登録に失敗しました。",
    };
  }

  revalidatePath("/openings");
  return {};
}

export async function removeFavoriteOpeningAction(
  openingId: number,
  _prevState: SimpleActionState,
  _formData: FormData
): Promise<SimpleActionState> {
  try {
    await removeFavoriteOpening(openingId);
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "お気に入りの解除に失敗しました。",
    };
  }

  revalidatePath("/openings");
  return {};
}
