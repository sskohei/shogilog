"use server";

import { validateLoginInput } from "@/features/auth/validation";
import type { LoginFormState } from "@/features/auth/types";

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const errors = validateLoginInput({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  // AUTH-3 (#12) が実際の Supabase sign-in をここに実装する。FE-3 では入力検証のみ行う。
  return {
    errors: {},
    message: "ログイン機能は準備中です",
  };
}
