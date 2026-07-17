const DISPLAY_NAME_MAX_LENGTH = 30;
const BIO_MAX_LENGTH = 500;

export type ProfileFormFieldErrors = {
  display_name?: string[];
  bio?: string[];
};

export type ProfileFormInput = {
  display_name: FormDataEntryValue | null;
  bio: FormDataEntryValue | null;
};

export function toOptionalString(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw ? raw : null;
}

export function validateProfileInput(input: ProfileFormInput): ProfileFormFieldErrors {
  const errors: ProfileFormFieldErrors = {};

  const displayName = toOptionalString(input.display_name);
  if (displayName !== null && displayName.length > DISPLAY_NAME_MAX_LENGTH) {
    errors.display_name = ["表示名が長すぎます"];
  }

  const bio = toOptionalString(input.bio);
  if (bio !== null && bio.length > BIO_MAX_LENGTH) {
    errors.bio = ["自己紹介が長すぎます"];
  }

  return errors;
}
