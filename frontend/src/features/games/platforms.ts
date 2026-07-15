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
