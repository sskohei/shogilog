import type { GameFormFieldErrors } from "@/features/games/validation";

export type MemoFormState = {
  error?: string;
};

export const initialMemoFormState: MemoFormState = {};

export type GameFormState = {
  errors: GameFormFieldErrors;
  message?: string;
};

export const initialGameFormState: GameFormState = { errors: {} };
