import type {
  PlatformRatingFieldErrors,
  ProfileFormFieldErrors,
} from "@/features/profile/validation";

export type ProfileFormState = {
  errors: ProfileFormFieldErrors;
  message?: string;
};

export const initialProfileFormState: ProfileFormState = { errors: {} };

export type PlatformRatingActionState = {
  errors: PlatformRatingFieldErrors;
  message?: string;
};

export const initialPlatformRatingActionState: PlatformRatingActionState = {
  errors: {},
};
