import type { ProfileFormFieldErrors } from "@/features/profile/validation";

export type SimpleActionState = {
  error?: string;
};

export const initialSimpleActionState: SimpleActionState = {};

export type ProfileFormState = {
  errors: ProfileFormFieldErrors;
  message?: string;
};

export const initialProfileFormState: ProfileFormState = { errors: {} };
