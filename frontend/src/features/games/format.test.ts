import { describe, expect, it } from "vitest";

import { formatPlayedAt } from "@/features/games/format";

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
