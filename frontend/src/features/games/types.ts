import type { GameFormFieldErrors } from "@/features/games/validation";

// エラーメッセージだけを返す単純な Server Action(メモ更新・削除など)向けの共通 state。
export type SimpleActionState = {
  error?: string;
};

export const initialSimpleActionState: SimpleActionState = {};

export type GameFormState = {
  errors: GameFormFieldErrors;
  message?: string;
};

export const initialGameFormState: GameFormState = { errors: {} };
