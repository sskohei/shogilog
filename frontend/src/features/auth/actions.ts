"use server";

import { redirect } from "next/navigation";

import { validateLoginInput } from "@/features/auth/validation";
import type { LoginFormState } from "@/features/auth/types";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const errors = validateLoginInput({ email, password });

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: email as string,
    password: password as string,
  });

  if (error) {
    return {
      errors: {},
      message: "メールアドレスまたはパスワードが正しくありません",
    };
  }

  redirect("/games");
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/auth/login");
}
