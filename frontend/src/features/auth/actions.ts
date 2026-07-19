"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { validateLoginInput, validateSignupInput } from "@/features/auth/validation";
import type { LoginFormState, SignupFormState } from "@/features/auth/types";
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

export async function signupAction(
  _prevState: SignupFormState,
  formData: FormData
): Promise<SignupFormState> {
  const email = formData.get("email");
  const password = formData.get("password");

  const errors = validateSignupInput({ email, password });

  if (Object.keys(errors).length > 0) {
    return { errors };
  }

  const supabase = await createClient();
  const headersList = await headers();
  const origin = `${headersList.get("x-forwarded-proto") ?? "http"}://${headersList.get("host")}`;

  const { data, error } = await supabase.auth.signUp({
    email: email as string,
    password: password as string,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    const message =
      error.message === "User already registered"
        ? "このメールアドレスは既に登録されています"
        : "アカウント登録に失敗しました。時間をおいて再度お試しください";
    return { errors: {}, message };
  }

  // メール確認が無効な環境ではsignUp直後にセッションが発行される。
  if (data.session) {
    redirect("/games");
  }

  // メール確認が必要な環境ではセッションが発行されないため、確認メールの案内を表示する。
  return {
    errors: {},
    notice: "確認メールを送信しました。メール内のリンクから登録を完了してください。",
  };
}
