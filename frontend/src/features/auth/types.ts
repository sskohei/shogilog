import type { LoginFieldErrors } from "@/features/auth/validation";

export type LoginFormState = {
  errors: LoginFieldErrors;
  message?: string;
};

export const initialLoginFormState: LoginFormState = {
  errors: {},
};
