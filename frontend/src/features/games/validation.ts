import {
  getPlatformRatingMetric,
  getRankOptions,
  isKnownPlatformId,
  usesRankRating,
} from "@/features/games/platforms";
import type { GameResult, PlayerSide } from "@/types/game";

const OPPONENT_NAME_MAX_LENGTH = 255;
const MEMO_MAX_LENGTH = 2000;
const RESULTS: GameResult[] = ["win", "lose", "draw"];
const SIDES: PlayerSide[] = ["sente", "gote"];
const PERCENTAGE_MIN = 0;
export const PERCENTAGE_MAX = 100;

export type GameFormFieldErrors = {
  platform_id?: string[];
  played_at?: string[];
  result?: string[];
  side?: string[];
  my_opening_id?: string[];
  opponent_opening_id?: string[];
  rating_before?: string[];
  rating_after?: string[];
  opponent_name?: string[];
  opponent_rating?: string[];
  rank_before?: string[];
  rank_after?: string[];
  opponent_rank?: string[];
  memo?: string[];
};

export type GameFormInput = {
  platform_id: FormDataEntryValue | null;
  played_at: FormDataEntryValue | null;
  result: FormDataEntryValue | null;
  side: FormDataEntryValue | null;
  my_opening_id: FormDataEntryValue | null;
  opponent_opening_id: FormDataEntryValue | null;
  rating_before: FormDataEntryValue | null;
  rating_after: FormDataEntryValue | null;
  opponent_name: FormDataEntryValue | null;
  opponent_rating: FormDataEntryValue | null;
  rank_before: FormDataEntryValue | null;
  rank_after: FormDataEntryValue | null;
  opponent_rank: FormDataEntryValue | null;
  memo: FormDataEntryValue | null;
};

export function toOptionalInt(value: FormDataEntryValue | null): number | null {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isInteger(parsed) ? parsed : null;
}

export function toOptionalString(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw ? raw : null;
}

function isValidOptionalPositiveInt(value: FormDataEntryValue | null): boolean {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return true;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1;
}

export function isValidRatingValue(
  value: FormDataEntryValue | null,
  metric: "rating" | "percentage" | "point"
): boolean {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return true;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed)) return false;
  if (metric === "percentage") {
    return parsed >= PERCENTAGE_MIN && parsed <= PERCENTAGE_MAX;
  }
  return true;
}

export function isValidRank(
  value: FormDataEntryValue | null,
  platformId: number
): boolean {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return true;
  return getRankOptions(platformId).includes(raw);
}

export function validateGameInput(input: GameFormInput): GameFormFieldErrors {
  const errors: GameFormFieldErrors = {};

  const platformId = Number(
    typeof input.platform_id === "string" ? input.platform_id : ""
  );
  const isValidPlatform = Number.isInteger(platformId) && isKnownPlatformId(platformId);
  if (!isValidPlatform) {
    errors.platform_id = ["対局サービスを選択してください"];
  }

  const playedAt = typeof input.played_at === "string" ? input.played_at : "";
  if (!playedAt || Number.isNaN(new Date(playedAt).getTime())) {
    errors.played_at = ["対局日時を入力してください"];
  }

  if (!RESULTS.includes(input.result as GameResult)) {
    errors.result = ["結果を選択してください"];
  }

  if (!SIDES.includes(input.side as PlayerSide)) {
    errors.side = ["手番を選択してください"];
  }

  if (!isValidOptionalPositiveInt(input.my_opening_id)) {
    errors.my_opening_id = ["戦法の指定が正しくありません"];
  }

  if (!isValidOptionalPositiveInt(input.opponent_opening_id)) {
    errors.opponent_opening_id = ["戦法の指定が正しくありません"];
  }

  const opponentName = toOptionalString(input.opponent_name) ?? "";
  if (opponentName.length > OPPONENT_NAME_MAX_LENGTH) {
    errors.opponent_name = ["対戦相手名が長すぎます"];
  }

  const memo = toOptionalString(input.memo) ?? "";
  if (memo.length > MEMO_MAX_LENGTH) {
    errors.memo = ["メモが長すぎます"];
  }

  if (!isValidPlatform) {
    // プラットフォーム未選択時はレーティング/段位の意味が決まらないため、整数チェックのみに留める。
    if (!isValidRatingValue(input.rating_before, "rating")) {
      errors.rating_before = ["数値を入力してください"];
    }
    if (!isValidRatingValue(input.rating_after, "rating")) {
      errors.rating_after = ["数値を入力してください"];
    }
    if (!isValidRatingValue(input.opponent_rating, "rating")) {
      errors.opponent_rating = ["数値を入力してください"];
    }
    return errors;
  }

  const metric = getPlatformRatingMetric(platformId);
  const ratingErrorMessage =
    metric === "percentage"
      ? [`0〜${PERCENTAGE_MAX}の整数で入力してください`]
      : ["数値を入力してください"];

  if (!isValidRatingValue(input.rating_before, metric)) {
    errors.rating_before = ratingErrorMessage;
  }
  if (!isValidRatingValue(input.rating_after, metric)) {
    errors.rating_after = ratingErrorMessage;
  }
  if (!isValidRatingValue(input.opponent_rating, metric)) {
    errors.opponent_rating = ratingErrorMessage;
  }

  if (usesRankRating(platformId)) {
    if (!isValidRank(input.rank_before, platformId)) {
      errors.rank_before = ["段位の指定が正しくありません"];
    }
    if (!isValidRank(input.rank_after, platformId)) {
      errors.rank_after = ["段位の指定が正しくありません"];
    }
    if (!isValidRank(input.opponent_rank, platformId)) {
      errors.opponent_rank = ["段位の指定が正しくありません"];
    }
  }

  return errors;
}
