import type { LoginFieldErrors, SignupFieldErrors } from "@/features/auth/validation";

export type LoginFormState = {
  errors: LoginFieldErrors;
  message?: string;
};

export const initialLoginFormState: LoginFormState = {
  errors: {},
};

export type SignupFormState = {
  errors: SignupFieldErrors;
  message?: string;
  notice?: string;
};

export const initialSignupFormState: SignupFormState = {
  errors: {},
};
