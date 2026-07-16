import { describe, expect, it } from "vitest";

import { toOptionalString, validateProfileInput } from "@/features/profile/validation";

describe("validateProfileInput", () => {
  it("表示名・自己紹介が未入力でもエラーにしない", () => {
    const errors = validateProfileInput({ display_name: null, bio: null });

    expect(errors).toEqual({});
  });

  it("表示名が30文字を超える場合はエラーを返す", () => {
    const errors = validateProfileInput({
      display_name: "a".repeat(31),
      bio: null,
    });

    expect(errors.display_name).toBeDefined();
  });

  it("自己紹介が500文字を超える場合はエラーを返す", () => {
    const errors = validateProfileInput({
      display_name: null,
      bio: "a".repeat(501),
    });

    expect(errors.bio).toBeDefined();
  });
});

describe("toOptionalString", () => {
  it("空文字や空白のみの場合は null を返す", () => {
    expect(toOptionalString("  ")).toBeNull();
    expect(toOptionalString(null)).toBeNull();
  });

  it("値がある場合はトリムして返す", () => {
    expect(toOptionalString(" 太郎 ")).toBe("太郎");
  });
});
