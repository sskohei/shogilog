import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SignupForm } from "@/features/auth/SignupForm";
import { signupAction } from "@/features/auth/actions";

vi.mock("@/features/auth/actions", () => ({
  signupAction: vi.fn(),
}));

const mockedSignupAction = vi.mocked(signupAction);

describe("SignupForm", () => {
  afterEach(() => {
    mockedSignupAction.mockReset();
  });

  it("メールアドレスの形式が不正な場合はバリデーションエラーを表示する", async () => {
    mockedSignupAction.mockResolvedValue({
      errors: { email: ["メールアドレスの形式が正しくありません"] },
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "user@localhost");
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "アカウントを作成" }));

    expect(
      await screen.findByText("メールアドレスの形式が正しくありません")
    ).toBeInTheDocument();
  });

  it("登録に失敗した場合はエラーメッセージを表示する", async () => {
    mockedSignupAction.mockResolvedValue({
      errors: {},
      message: "このメールアドレスは既に登録されています",
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "user@example.com");
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "アカウントを作成" }));

    expect(
      await screen.findByText("このメールアドレスは既に登録されています")
    ).toBeInTheDocument();
  });

  it("メール確認が必要な場合は案内メッセージを表示する", async () => {
    mockedSignupAction.mockResolvedValue({
      errors: {},
      notice: "確認メールを送信しました。メール内のリンクから登録を完了してください。",
    });

    const user = userEvent.setup();
    render(<SignupForm />);

    await user.type(screen.getByLabelText("メールアドレス"), "user@example.com");
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "アカウントを作成" }));

    expect(
      await screen.findByText(
        "確認メールを送信しました。メール内のリンクから登録を完了してください。"
      )
    ).toBeInTheDocument();
  });
});
