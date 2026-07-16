import { describe, expect, it } from "vitest";

import {
  formatOpponentRating,
  formatPlayedAt,
  formatRatingTransition,
} from "@/features/games/format";
import type { Game } from "@/types/game";

describe("formatPlayedAt", () => {
  it("ISO日時文字列を日本語形式にフォーマットする", () => {
    const formatted = formatPlayedAt("2026-01-02T03:04:00Z");

    expect(formatted).toMatch(/2026\/01\/02/);
  });

  it("不正な日時文字列の場合は元の文字列をそのまま返す", () => {
    const invalid = "not-a-date";

    expect(formatPlayedAt(invalid)).toBe(invalid);
  });
});

function makeGame(overrides: Partial<Game> = {}): Game {
  return {
    id: "game-1",
    user_id: "user-1",
    platform_id: 2,
    played_at: "2026-07-05T10:00:00.000Z",
    result: "win",
    side: "sente",
    my_opening_id: null,
    opponent_opening_id: null,
    rating_before: 1200,
    rating_after: 1210,
    opponent_name: "player123",
    opponent_rating: 1190,
    rank_before: null,
    rank_after: null,
    opponent_rank: null,
    memo: null,
    kifu_path: null,
    created_at: "",
    updated_at: "",
    ...overrides,
  };
}

describe("formatRatingTransition", () => {
  it("数値レーティング制プラットフォームは数値をそのまま表示する", () => {
    expect(formatRatingTransition(makeGame({ platform_id: 2 }))).toBe(
      "1200 → 1210"
    );
  });

  it("段位+%制プラットフォーム(将棋ウォーズ)は段位と%を表示する", () => {
    const game = makeGame({
      platform_id: 1,
      rank_before: "二段",
      rank_after: "三段",
      rating_before: 65,
      rating_after: 10,
    });

    expect(formatRatingTransition(game)).toBe("二段 (65%) → 三段 (10%)");
  });

  it("段位+ポイント制プラットフォーム(棋桜)は段位とポイントを表示する", () => {
    const game = makeGame({
      platform_id: 3,
      rank_before: "5級",
      rank_after: "4級",
      rating_before: 80,
      rating_after: 20,
    });

    expect(formatRatingTransition(game)).toBe(
      "5級 (80ポイント) → 4級 (20ポイント)"
    );
  });
});

describe("formatOpponentRating", () => {
  it("数値レーティング制プラットフォームは数値を返す", () => {
    expect(formatOpponentRating(makeGame({ platform_id: 2 }))).toBe("1190");
  });

  it("段位制プラットフォームでは段位と%を返す", () => {
    const game = makeGame({
      platform_id: 1,
      opponent_rank: "初段",
      opponent_rating: 50,
    });

    expect(formatOpponentRating(game)).toBe("初段 (50%)");
  });

  it("段位・レーティングともに無い場合は null を返す", () => {
    const game = makeGame({
      platform_id: 1,
      opponent_rank: null,
      opponent_rating: null,
    });

    expect(formatOpponentRating(game)).toBeNull();
  });
});
