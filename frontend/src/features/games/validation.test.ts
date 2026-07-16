import { describe, expect, it } from "vitest";

import {
  toOptionalInt,
  toOptionalString,
  validateGameInput,
  type GameFormInput,
} from "@/features/games/validation";

function makeValidInput(overrides: Partial<GameFormInput> = {}): GameFormInput {
  return {
    platform_id: "1",
    played_at: "2026-07-05T10:00",
    result: "win",
    side: "sente",
    my_opening_id: null,
    opponent_opening_id: null,
    rating_before: null,
    rating_after: null,
    opponent_name: null,
    opponent_rating: null,
    ...overrides,
  };
}

describe("validateGameInput", () => {
  it("必須項目が揃っていればエラーが無い", () => {
    const errors = validateGameInput(makeValidInput());

    expect(errors).toEqual({});
  });

  it("未知の platform_id はエラーになる", () => {
    const errors = validateGameInput(makeValidInput({ platform_id: "999" }));

    expect(errors.platform_id).toBeDefined();
  });

  it("played_at が空・不正な日時の場合はエラーになる", () => {
    const errors = validateGameInput(makeValidInput({ played_at: "" }));

    expect(errors.played_at).toBeDefined();
  });

  it("result / side が未選択の場合はエラーになる", () => {
    const errors = validateGameInput(
      makeValidInput({ result: "", side: "" })
    );

    expect(errors.result).toBeDefined();
    expect(errors.side).toBeDefined();
  });

  it("my_opening_id が正の整数でない場合はエラーになる", () => {
    const errors = validateGameInput(makeValidInput({ my_opening_id: "0" }));

    expect(errors.my_opening_id).toBeDefined();
  });

  it("rating_before が整数でない場合はエラーになる", () => {
    const errors = validateGameInput(
      makeValidInput({ rating_before: "abc" })
    );

    expect(errors.rating_before).toBeDefined();
  });

  it("opponent_name が255文字を超える場合はエラーになる", () => {
    const errors = validateGameInput(
      makeValidInput({ opponent_name: "a".repeat(256) })
    );

    expect(errors.opponent_name).toBeDefined();
  });

  it("任意項目が空文字の場合はエラーにならない", () => {
    const errors = validateGameInput(
      makeValidInput({
        my_opening_id: "",
        opponent_opening_id: "",
        rating_before: "",
        rating_after: "",
        opponent_rating: "",
        opponent_name: "",
      })
    );

    expect(errors).toEqual({});
  });
});

describe("toOptionalInt", () => {
  it("空文字は null を返す", () => {
    expect(toOptionalInt("")).toBeNull();
  });

  it("数値文字列は数値を返す", () => {
    expect(toOptionalInt("42")).toBe(42);
  });

  it("整数でない場合は null を返す", () => {
    expect(toOptionalInt("abc")).toBeNull();
  });
});

describe("toOptionalString", () => {
  it("空文字は null を返す", () => {
    expect(toOptionalString("")).toBeNull();
  });

  it("前後の空白を除去して返す", () => {
    expect(toOptionalString("  player123  ")).toBe("player123");
  });
});
