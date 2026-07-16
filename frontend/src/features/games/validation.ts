import { isKnownPlatformId } from "@/features/games/platforms";
import type { GameResult, PlayerSide } from "@/types/game";

const OPPONENT_NAME_MAX_LENGTH = 255;
const RESULTS: GameResult[] = ["win", "lose", "draw"];
const SIDES: PlayerSide[] = ["sente", "gote"];

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

function isValidOptionalInt(value: FormDataEntryValue | null): boolean {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return true;
  return Number.isInteger(Number(raw));
}

function isValidOptionalPositiveInt(value: FormDataEntryValue | null): boolean {
  const raw = typeof value === "string" ? value.trim() : "";
  if (!raw) return true;
  const parsed = Number(raw);
  return Number.isInteger(parsed) && parsed >= 1;
}

export function validateGameInput(input: GameFormInput): GameFormFieldErrors {
  const errors: GameFormFieldErrors = {};

  const platformId = Number(
    typeof input.platform_id === "string" ? input.platform_id : ""
  );
  if (!Number.isInteger(platformId) || !isKnownPlatformId(platformId)) {
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

  if (!isValidOptionalInt(input.rating_before)) {
    errors.rating_before = ["レーティングは整数で入力してください"];
  }

  if (!isValidOptionalInt(input.rating_after)) {
    errors.rating_after = ["レーティングは整数で入力してください"];
  }

  const opponentName = toOptionalString(input.opponent_name) ?? "";
  if (opponentName.length > OPPONENT_NAME_MAX_LENGTH) {
    errors.opponent_name = ["対戦相手名が長すぎます"];
  }

  if (!isValidOptionalInt(input.opponent_rating)) {
    errors.opponent_rating = ["レーティングは整数で入力してください"];
  }

  return errors;
}
