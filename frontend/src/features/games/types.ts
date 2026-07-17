import type { GameFormFieldErrors } from "@/features/games/validation";

export type GameFormState = {
  errors: GameFormFieldErrors;
  message?: string;
};

export const initialGameFormState: GameFormState = { errors: {} };
