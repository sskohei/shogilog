"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ApiError } from "@/lib/fetcher";
import {
  createGame,
  deleteGame,
  linkGameTag,
  unlinkGameTag,
  updateGame,
  updateGameMemo,
} from "@/services/api/games";
import type { GameFormState } from "@/features/games/types";
import {
  toOptionalInt,
  toOptionalString,
  validateGameInput,
  type GameFormFieldErrors,
  type GameFormInput,
} from "@/features/games/validation";
import { getApiErrorFieldNames } from "@/lib/apiFieldErrors";
import { getApiErrorMessage } from "@/lib/errorMessages";
import type { SimpleActionState } from "@/types/actionState";
import type { GameCreatePayload, GameResult, PlayerSide } from "@/types/game";

const GAME_FIELD_ERROR_MESSAGES: Record<keyof GameFormFieldErrors, string> = {
  platform_id: "対局サービスを選択してください",
  played_at: "対局日時を入力してください",
  result: "結果を選択してください",
  side: "手番を選択してください",
  my_opening_id: "戦法の指定が正しくありません",
  opponent_opening_id: "戦法の指定が正しくありません",
  rating_before: "レーティングの値が正しくありません",
  rating_after: "レーティングの値が正しくありません",
  opponent_name: "対戦相手名が長すぎます",
  opponent_rating: "レーティングの値が正しくありません",
  rank_before: "段位の指定が正しくありません",
  rank_after: "段位の指定が正しくありません",
  opponent_rank: "段位の指定が正しくありません",
  memo: "メモが長すぎます",
};

function mapGameFieldErrors(error: ApiError): GameFormFieldErrors {
  const fieldNames = getApiErrorFieldNames(error);
  const errors: GameFormFieldErrors = {};

  for (const [field, message] of Object.entries(GAME_FIELD_ERROR_MESSAGES) as [
    keyof GameFormFieldErrors,
    string,
  ][]) {
    if (fieldNames.has(field)) {
      errors[field] = [message];
    }
  }

  return errors;
}

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
      error: error instanceof ApiError
        ? getApiErrorMessage(error, "メモの保存に失敗しました。")
        : "メモの保存に失敗しました。",
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
    memo: formData.get("memo"),
  };
}

function buildGameCreatePayload(input: GameFormInput): GameCreatePayload {
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
    memo: toOptionalString(input.memo),
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

  const payload = buildGameCreatePayload(input);

  let id: string;
  try {
    id = await createGame(payload);
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      const fieldErrors = mapGameFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        return { errors: fieldErrors, message: "入力内容を確認してください。" };
      }
    }
    return {
      errors: {},
      message: error instanceof ApiError
        ? getApiErrorMessage(error, "対局の登録に失敗しました。")
        : "対局の登録に失敗しました。",
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

  const payload = buildGameCreatePayload(input);

  try {
    await updateGame(gameId, payload);
  } catch (error) {
    if (error instanceof ApiError && error.status === 422) {
      const fieldErrors = mapGameFieldErrors(error);
      if (Object.keys(fieldErrors).length > 0) {
        return { errors: fieldErrors, message: "入力内容を確認してください。" };
      }
    }
    return {
      errors: {},
      message: error instanceof ApiError
        ? getApiErrorMessage(error, "対局の更新に失敗しました。")
        : "対局の更新に失敗しました。",
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
      error: error instanceof ApiError
        ? getApiErrorMessage(error, "対局の削除に失敗しました。")
        : "対局の削除に失敗しました。",
    };
  }

  redirect("/games");
}

export async function linkGameTagAction(
  gameId: string,
  _prevState: SimpleActionState,
  formData: FormData
): Promise<SimpleActionState> {
  const tagId = formData.get("tag_id");

  if (typeof tagId !== "string" || !tagId) {
    return { error: "タグを選択してください。" };
  }

  try {
    await linkGameTag(gameId, tagId);
  } catch (error) {
    return {
      error: error instanceof ApiError
        ? getApiErrorMessage(error, "タグの追加に失敗しました。")
        : "タグの追加に失敗しました。",
    };
  }

  revalidatePath(`/games/${gameId}`);
  return {};
}

export async function unlinkGameTagAction(
  gameId: string,
  tagId: string,
  _prevState: SimpleActionState,
  _formData: FormData
): Promise<SimpleActionState> {
  try {
    await unlinkGameTag(gameId, tagId);
  } catch (error) {
    return {
      error: error instanceof ApiError
        ? getApiErrorMessage(error, "タグの解除に失敗しました。")
        : "タグの解除に失敗しました。",
    };
  }

  revalidatePath(`/games/${gameId}`);
  return {};
}
