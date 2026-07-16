import { beforeEach, describe, expect, it, vi } from "vitest";

const { redirectMock, signInWithPasswordMock, signOutMock, createClientMock } =
  vi.hoisted(() => ({
    redirectMock: vi.fn(),
    signInWithPasswordMock: vi.fn(),
    signOutMock: vi.fn(),
    createClientMock: vi.fn(),
  }));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/lib/supabase/server", () => ({
  createClient: createClientMock,
}));

import { initialLoginFormState } from "@/features/auth/types";
import { loginAction, logoutAction } from "@/features/auth/actions";

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
