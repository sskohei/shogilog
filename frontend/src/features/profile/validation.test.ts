import { describe, expect, it } from "vitest";

import {
  toOptionalString,
  validatePlatformRatingInput,
  validateProfileInput,
} from "@/features/profile/validation";

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

describe("validatePlatformRatingInput", () => {
  it("未プレイの場合は検証しない", () => {
    const errors = validatePlatformRatingInput(1, false, "101", "十段");

    expect(errors).toEqual({});
  });

  it("段位制プラットフォームでラダーに無い段位を指定するとエラーになる", () => {
    const errors = validatePlatformRatingInput(1, true, null, "十段");

    expect(errors.rank).toBeDefined();
  });

  it("段位制プラットフォームで有効な段位を指定するとエラーにならない", () => {
    const errors = validatePlatformRatingInput(1, true, null, "初段");

    expect(errors).toEqual({});
  });

  it("数値レーティング制プラットフォームでは整数でないレーティングはエラーになる", () => {
    const errors = validatePlatformRatingInput(2, true, "abc", null);

    expect(errors.rating).toBeDefined();
  });

  it("数値レーティング制プラットフォームでは上限なく受け付ける", () => {
    const errors = validatePlatformRatingInput(2, true, "3000", null);

    expect(errors).toEqual({});
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
