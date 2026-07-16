// supabase/migrations/20260706000539_create_platforms.sql のシードデータ (id 1〜4) を参照。
// Platforms API が実装されたら、この静的マップではなく API 経由の解決に差し替える。
const PLATFORM_NAMES: Record<number, string> = {
  1: "将棋ウォーズ",
  2: "将棋クエスト",
  3: "棋桜",
  4: "81道場",
};

export function getPlatformName(platformId: number): string {
  return PLATFORM_NAMES[platformId] ?? `不明 (id: ${platformId})`;
}

export const PLATFORM_OPTIONS: { id: number; name: string }[] = Object.entries(
  PLATFORM_NAMES
).map(([id, name]) => ({ id: Number(id), name }));

export function isKnownPlatformId(platformId: number): boolean {
  return platformId in PLATFORM_NAMES;
}

export type RatingMetric = "rating" | "percentage" | "point";

// プラットフォームごとにレーティング欄の意味が異なる。
// 将棋ウォーズ: 段位+昇段/降段進捗(%)、棋桜: 段位+ポイント、それ以外: 数値レーティング。
const PLATFORM_RATING_METRICS: Record<number, RatingMetric> = {
  1: "percentage",
  2: "rating",
  3: "point",
  4: "rating",
};

export function getPlatformRatingMetric(platformId: number): RatingMetric {
  return PLATFORM_RATING_METRICS[platformId] ?? "rating";
}

export function usesRankRating(platformId: number): boolean {
  return getPlatformRatingMetric(platformId) !== "rating";
}

export function getRatingMetricLabel(metric: RatingMetric): string {
  if (metric === "percentage") return "%";
  if (metric === "point") return "ポイント";
  return "レーティング";
}

// 段位ラダー: 将棋ウォーズ(30級〜9段)、棋桜(10級〜5段)。
const PLATFORM_RANK_LADDERS: Partial<Record<number, { maxKyu: number; maxDan: number }>> = {
  1: { maxKyu: 30, maxDan: 9 },
  3: { maxKyu: 10, maxDan: 5 },
};

const DAN_KANJI: Record<number, string> = {
  1: "初段",
  2: "二段",
  3: "三段",
  4: "四段",
  5: "五段",
  6: "六段",
  7: "七段",
  8: "八段",
  9: "九段",
};

export function getRankOptions(platformId: number): string[] {
  const ladder = PLATFORM_RANK_LADDERS[platformId];
  if (!ladder) return [];

  const kyuOptions = Array.from(
    { length: ladder.maxKyu },
    (_, index) => `${ladder.maxKyu - index}級`
  );
  const danOptions = Array.from(
    { length: ladder.maxDan },
    (_, index) => DAN_KANJI[index + 1]
  );

  return [...kyuOptions, ...danOptions];
}
