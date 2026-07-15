import { describe, expect, it } from "vitest";

import { validateLoginInput } from "@/features/auth/validation";

describe("validateLoginInput", () => {
  it("エラーなしの場合は空オブジェクトを返す", () => {
    const errors = validateLoginInput({
      email: "user@example.com",
      password: "password123",
    });

    expect(errors).toEqual({});
  });

  it("メールアドレスが未入力の場合はエラーを返す", () => {
    const errors = validateLoginInput({ email: "", password: "password123" });

    expect(errors.email).toEqual(["メールアドレスを入力してください"]);
  });

  it("メールアドレスの形式が不正な場合はエラーを返す", () => {
    const errors = validateLoginInput({
      email: "invalid-email",
      password: "password123",
    });

    expect(errors.email).toEqual(["メールアドレスの形式が正しくありません"]);
  });

  it("メールアドレスが長すぎる場合はエラーを返す", () => {
    const longEmail = `${"a".repeat(255)}@example.com`;

    const errors = validateLoginInput({
      email: longEmail,
      password: "password123",
    });

    expect(errors.email).toEqual(["メールアドレスが長すぎます"]);
  });

  it("パスワードが未入力の場合はエラーを返す", () => {
    const errors = validateLoginInput({
      email: "user@example.com",
      password: "",
    });

    expect(errors.password).toEqual(["パスワードを入力してください"]);
  });

  it("パスワードが長すぎる場合はエラーを返す", () => {
    const errors = validateLoginInput({
      email: "user@example.com",
      password: "a".repeat(129),
    });

    expect(errors.password).toEqual(["パスワードが長すぎます"]);
  });
});
