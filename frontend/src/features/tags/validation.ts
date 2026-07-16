const NAME_MAX_LENGTH = 255;
const COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

export type TagFormFieldErrors = {
  name?: string[];
  color?: string[];
};

export type TagFormInput = {
  name: FormDataEntryValue | null;
  color: FormDataEntryValue | null;
};

export function toOptionalColor(value: FormDataEntryValue | null): string | null {
  const raw = typeof value === "string" ? value.trim() : "";
  return raw ? raw : null;
}

export function validateTagInput(input: TagFormInput): TagFormFieldErrors {
  const errors: TagFormFieldErrors = {};

  const name = typeof input.name === "string" ? input.name.trim() : "";
  if (!name) {
    errors.name = ["タグ名を入力してください"];
  } else if (name.length > NAME_MAX_LENGTH) {
    errors.name = ["タグ名が長すぎます"];
  }

  const color = toOptionalColor(input.color);
  if (color !== null && !COLOR_PATTERN.test(color)) {
    errors.color = ["色の形式が正しくありません"];
  }

  return errors;
}
