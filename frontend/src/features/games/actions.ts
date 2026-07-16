"use server";

import { revalidatePath } from "next/cache";

import { ApiError } from "@/lib/fetcher";
import { updateGameMemo } from "@/services/api/games";
import type { MemoFormState } from "@/features/games/types";

export async function updateMemoAction(
  gameId: string,
  _prevState: MemoFormState,
  formData: FormData
): Promise<MemoFormState> {
  const memo = formData.get("memo");

  try {
    await updateGameMemo(gameId, typeof memo === "string" ? memo : "");
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "メモの保存に失敗しました。",
    };
  }

  revalidatePath(`/games/${gameId}`);
  return {};
}
