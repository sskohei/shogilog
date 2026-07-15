const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 128;

export type LoginFieldErrors = {
  email?: string[];
  password?: string[];
};

export function validateLoginInput(input: {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (!email) {
    errors.email = ["メールアドレスを入力してください"];
  } else if (email.length > EMAIL_MAX_LENGTH) {
    errors.email = ["メールアドレスが長すぎます"];
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = ["メールアドレスの形式が正しくありません"];
  }

  if (!password) {
    errors.password = ["パスワードを入力してください"];
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = ["パスワードが長すぎます"];
  }

  return errors;
}
