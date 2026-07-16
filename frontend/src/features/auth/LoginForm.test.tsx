import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LoginForm } from "@/features/auth/LoginForm";
import { loginAction } from "@/features/auth/actions";

vi.mock("@/features/auth/actions", () => ({
  loginAction: vi.fn(),
}));

const mockedLoginAction = vi.mocked(loginAction);

describe("LoginForm", () => {
  afterEach(() => {
    mockedLoginAction.mockReset();
  });

  it("メールアドレスの形式が不正な場合はバリデーションエラーを表示する", async () => {
    // loginAction のスタブでも、フィールドバリデーションと同じ挙動を再現する。
    mockedLoginAction.mockResolvedValue({
      errors: { email: ["メールアドレスの形式が正しくありません"] },
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "user@localhost");
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText("メールアドレスの形式が正しくありません")
    ).toBeInTheDocument();
  });

  it("認証に失敗した場合はエラーメッセージを表示する", async () => {
    mockedLoginAction.mockResolvedValue({
      errors: {},
      message: "メールアドレスまたはパスワードが正しくありません",
    });

    const user = userEvent.setup();
    render(<LoginForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "user@example.com");
    await user.type(screen.getByLabelText("パスワード"), "wrong-password");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText("メールアドレスまたはパスワードが正しくありません")
    ).toBeInTheDocument();
  });
});
