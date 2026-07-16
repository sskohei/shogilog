"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/fetcher";
import {
  createGame,
  deleteGame,
  updateGame,
  updateGameMemo,
} from "@/services/api/games";
import type {
  GameFormState,
  SimpleActionState,
} from "@/features/games/types";
import {
  toOptionalInt,
  toOptionalString,
  validateGameInput,
  type GameFormInput,
} from "@/features/games/validation";
import type { GameCreatePayload, GameResult, PlayerSide } from "@/types/game";

export async function updateMemoAction(
  gameId: string,
  _prevState: SimpleActionState,
  formData: FormData
): Promise<SimpleActionState> {
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

function readGameFormInput(formData: FormData): GameFormInput {
  return {
    platform_id: formData.get("platform_id"),
    played_at: formData.get("played_at"),
    result: formData.get("result"),
    side: formData.get("side"),
    my_opening_id: formData.get("my_opening_id"),
    opponent_opening_id: formData.get("opponent_opening_id"),
    rating_before: formData.get("rating_before"),
    rating_after: formData.get("rating_after"),
    opponent_name: formData.get("opponent_name"),
    opponent_rating: formData.get("opponent_rating"),
    rank_before: formData.get("rank_before"),
    rank_after: formData.get("rank_after"),
    opponent_rank: formData.get("opponent_rank"),
  };
}

function buildGameCreatePayload(
  input: GameFormInput,
  formData: FormData
): GameCreatePayload {
  return {
    platform_id: Number(input.platform_id),
    played_at: new Date(input.played_at as string).toISOString(),
    result: input.result as GameResult,
    side: input.side as PlayerSide,
    my_opening_id: toOptionalInt(input.my_opening_id),
    opponent_opening_id: toOptionalInt(input.opponent_opening_id),
    rating_before: toOptionalInt(input.rating_before),
    rating_after: toOptionalInt(input.rating_after),
    opponent_name: toOptionalString(input.opponent_name),
    opponent_rating: toOptionalInt(input.opponent_rating),
    rank_before: toOptionalString(input.rank_before),
    rank_after: toOptionalString(input.rank_after),
    opponent_rank: toOptionalString(input.opponent_rank),
    memo: toOptionalString(formData.get("memo")),
  };
}

export async function createGameAction(
  _prevState: GameFormState,
  formData: FormData
): Promise<GameFormState> {
  const input = readGameFormInput(formData);
  const errors = validateGameInput(input);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const payload = buildGameCreatePayload(input, formData);

  let id: string;
  try {
    id = await createGame(payload);
  } catch (error) {
    return {
      errors: {},
      message:
        error instanceof ApiError ? error.message : "対局の登録に失敗しました。",
    };
  }

  redirect(`/games/${id}`);
}

export async function updateGameAction(
  gameId: string,
  _prevState: GameFormState,
  formData: FormData
): Promise<GameFormState> {
  const input = readGameFormInput(formData);
  const errors = validateGameInput(input);

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const payload = buildGameCreatePayload(input, formData);

  try {
    await updateGame(gameId, payload);
  } catch (error) {
    return {
      errors: {},
      message:
        error instanceof ApiError ? error.message : "対局の更新に失敗しました。",
    };
  }

  revalidatePath(`/games/${gameId}`);
  redirect(`/games/${gameId}`);
}

export async function deleteGameAction(
  gameId: string,
  _prevState: SimpleActionState,
  _formData: FormData
): Promise<SimpleActionState> {
  try {
    await deleteGame(gameId);
  } catch (error) {
    return {
      error:
        error instanceof ApiError ? error.message : "対局の削除に失敗しました。",
    };
  }

  redirect("/games");
}
