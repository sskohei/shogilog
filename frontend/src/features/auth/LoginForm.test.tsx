import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { LoginForm } from "@/features/auth/LoginForm";

describe("LoginForm", () => {
  it("メールアドレスの形式が不正な場合はバリデーションエラーを表示する", async () => {
    const user = userEvent.setup();
    render(<LoginForm />);

    // ブラウザのネイティブ制約検証(required, type=email)は通過するが、
    // アプリ側のカスタム検証(TLD必須)では弾かれる値を入力する。
    await user.type(screen.getByLabelText("メールアドレス"), "user@localhost");
    await user.type(screen.getByLabelText("パスワード"), "password123");
    await user.click(screen.getByRole("button", { name: "ログイン" }));

    expect(
      await screen.findByText("メールアドレスの形式が正しくありません")
    ).toBeInTheDocument();
  });
});
