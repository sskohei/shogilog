import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  redirectMock,
  signInWithPasswordMock,
  signOutMock,
  signUpMock,
  createClientMock,
  headersMock,
} = vi.hoisted(() => ({
  redirectMock: vi.fn(),
  signInWithPasswordMock: vi.fn(),
  signOutMock: vi.fn(),
  signUpMock: vi.fn(),
  createClientMock: vi.fn(),
  headersMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("next/headers", () => ({
  headers: headersMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { initialLoginFormState, initialSignupFormState } from "@/features/auth/types";
import { loginAction, logoutAction, signupAction } from "@/features/auth/actions";

describe("loginAction", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    signInWithPasswordMock.mockClear();
    createClientMock.mockReset();
    createClientMock.mockResolvedValue({
      auth: { signInWithPassword: signInWithPasswordMock },
    });
  });

  it("入力が不正な場合はフィールドエラーを返し、Supabaseを呼び出さない", async () => {
    const formData = new FormData();
    formData.set("email", "");
    formData.set("password", "");

    const state = await loginAction(initialLoginFormState, formData);

    expect(state.errors.email).toBeDefined();
    expect(signInWithPasswordMock).not.toHaveBeenCalled();
  });

  it("Supabaseが認証エラーを返した場合はエラーメッセージを返す", async () => {
    signInWithPasswordMock.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password123");

    const state = await loginAction(initialLoginFormState, formData);

    expect(signInWithPasswordMock).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
    });
    expect(state.message).toBe("メールアドレスまたはパスワードが正しくありません");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("ログイン成功時は /games へリダイレクトする", async () => {
    signInWithPasswordMock.mockResolvedValue({ error: null });

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password123");

    await loginAction(initialLoginFormState, formData);

    expect(redirectMock).toHaveBeenCalledWith("/games");
  });
});

describe("logoutAction", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    signOutMock.mockClear();
    createClientMock.mockReset();
    createClientMock.mockResolvedValue({ auth: { signOut: signOutMock } });
  });

  it("サインアウト後 /auth/login へリダイレクトする", async () => {
    signOutMock.mockResolvedValue({ error: null });

    await logoutAction();

    expect(signOutMock).toHaveBeenCalled();
    expect(redirectMock).toHaveBeenCalledWith("/auth/login");
  });
});

describe("signupAction", () => {
  beforeEach(() => {
    redirectMock.mockClear();
    signUpMock.mockClear();
    createClientMock.mockReset();
    createClientMock.mockResolvedValue({ auth: { signUp: signUpMock } });
    headersMock.mockReset();
    headersMock.mockResolvedValue(
      new Map([
        ["x-forwarded-proto", "https"],
        ["host", "shogilog.example.com"],
      ])
    );
  });

  it("入力が不正な場合はフィールドエラーを返し、Supabaseを呼び出さない", async () => {
    const formData = new FormData();
    formData.set("email", "");
    formData.set("password", "");

    const state = await signupAction(initialSignupFormState, formData);

    expect(state.errors.email).toBeDefined();
    expect(signUpMock).not.toHaveBeenCalled();
  });

  it("メールアドレスが既に登録済みの場合は専用のエラーメッセージを返す", async () => {
    signUpMock.mockResolvedValue({
      data: { session: null },
      error: { message: "User already registered", code: "user_already_exists" },
    });

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password123");

    const state = await signupAction(initialSignupFormState, formData);

    expect(signUpMock).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "password123",
      options: { emailRedirectTo: "https://shogilog.example.com/auth/callback" },
    });
    expect(state.message).toBe("このメールアドレスは既に登録されています");
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("メール送信のレート制限に達した場合は専用のエラーメッセージを返す", async () => {
    signUpMock.mockResolvedValue({
      data: { session: null },
      error: {
        message: "email rate limit exceeded",
        code: "over_email_send_rate_limit",
        status: 429,
      },
    });

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password123");

    const state = await signupAction(initialSignupFormState, formData);

    expect(state.message).toBe(
      "確認メールの送信回数が上限に達しました。しばらく時間をおいてから再度お試しください"
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("それ以外のSupabaseエラーの場合は汎用のエラーメッセージを返す", async () => {
    signUpMock.mockResolvedValue({
      data: { session: null },
      error: { message: "redirect_to not allowed", code: "validation_failed" },
    });

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password123");

    const state = await signupAction(initialSignupFormState, formData);

    expect(state.message).toBe(
      "アカウント登録に失敗しました。時間をおいて再度お試しください"
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("登録直後にセッションが発行された場合は /games へリダイレクトする", async () => {
    signUpMock.mockResolvedValue({
      data: { session: { access_token: "token" } },
      error: null,
    });

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password123");

    await signupAction(initialSignupFormState, formData);

    expect(redirectMock).toHaveBeenCalledWith("/games");
  });

  it("メール確認が必要な場合は案内メッセージを返す", async () => {
    signUpMock.mockResolvedValue({
      data: { session: null },
      error: null,
    });

    const formData = new FormData();
    formData.set("email", "user@example.com");
    formData.set("password", "password123");

    const state = await signupAction(initialSignupFormState, formData);

    expect(state.notice).toBe(
      "確認メールを送信しました。メール内のリンクから登録を完了してください。"
    );
    expect(redirectMock).not.toHaveBeenCalled();
  });
});
