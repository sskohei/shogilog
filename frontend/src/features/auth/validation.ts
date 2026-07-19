const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 128;
const PASSWORD_MIN_LENGTH = 6;

export type LoginFieldErrors = {
  email?: string[];
  password?: string[];
};

export type SignupFieldErrors = {
  email?: string[];
  password?: string[];
};

function validateEmail(email: string): string[] | undefined {
  if (!email) {
    return ["メールアドレスを入力してください"];
  } else if (email.length > EMAIL_MAX_LENGTH) {
    return ["メールアドレスが長すぎます"];
  } else if (!EMAIL_PATTERN.test(email)) {
    return ["メールアドレスの形式が正しくありません"];
  }
  return undefined;
}

export function validateLoginInput(input: {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}): LoginFieldErrors {
  const errors: LoginFieldErrors = {};

  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!password) {
    errors.password = ["パスワードを入力してください"];
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = ["パスワードが長すぎます"];
  }

  return errors;
}

export function validateSignupInput(input: {
  email: FormDataEntryValue | null;
  password: FormDataEntryValue | null;
}): SignupFieldErrors {
  const errors: SignupFieldErrors = {};

  const email = typeof input.email === "string" ? input.email.trim() : "";
  const password = typeof input.password === "string" ? input.password : "";

  const emailError = validateEmail(email);
  if (emailError) errors.email = emailError;

  if (!password) {
    errors.password = ["パスワードを入力してください"];
  } else if (password.length < PASSWORD_MIN_LENGTH) {
    errors.password = [`パスワードは${PASSWORD_MIN_LENGTH}文字以上で入力してください`];
  } else if (password.length > PASSWORD_MAX_LENGTH) {
    errors.password = ["パスワードが長すぎます"];
  }

  return errors;
}
