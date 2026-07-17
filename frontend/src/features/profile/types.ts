import type { ProfileFormFieldErrors } from "@/features/profile/validation";

export type ProfileFormState = {
  errors: ProfileFormFieldErrors;
  message?: string;
};

export const initialProfileFormState: ProfileFormState = { errors: {} };
