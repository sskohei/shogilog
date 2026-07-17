import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/supabase/server", () => ({
  getAccessToken: vi.fn(),
}));

import { getApiErrorFieldNames } from "@/lib/apiFieldErrors";
import { ApiError } from "@/lib/fetcher";

describe("getApiErrorFieldNames", () => {
  it("locの末尾要素からフィールド名を抽出する", () => {
    const error = new ApiError("http", "リクエストに失敗しました (status: 422)", 422, [
      { loc: ["body", "rating_after"], msg: "...", type: "value_error" },
      { loc: ["body", "rank_after"], msg: "...", type: "value_error" },
    ]);

    expect(getApiErrorFieldNames(error)).toEqual(new Set(["rating_after", "rank_after"]));
  });

  it("fieldErrorsが無い場合は空集合を返す", () => {
    const error = new ApiError("http", "対局の登録に失敗しました。", 400);

    expect(getApiErrorFieldNames(error)).toEqual(new Set());
  });

  it("locの末尾が文字列でない要素は無視する", () => {
    const error = new ApiError("http", "リクエストに失敗しました (status: 422)", 422, [
      { loc: ["body", "items", 0], msg: "...", type: "value_error" },
    ]);

    expect(getApiErrorFieldNames(error)).toEqual(new Set());
  });
});
