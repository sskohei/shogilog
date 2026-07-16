import {
  getPlatformRatingMetric,
  getRatingMetricLabel,
} from "@/features/games/platforms";
import type { Game } from "@/types/game";

export function formatPlayedAt(playedAt: string): string {
  const date = new Date(playedAt);
  if (Number.isNaN(date.getTime())) {
    return playedAt;
  }
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatRankAndValue(
  rank: string | null,
  value: number | null,
  label: string
): string {
  const rankText = rank ?? "—";
  return value !== null ? `${rankText} (${value}${label})` : rankText;
}

export function formatRatingTransition(game: Game): string {
  const metric = getPlatformRatingMetric(game.platform_id);

  if (metric === "rating") {
    return `${game.rating_before ?? "—"} → ${game.rating_after ?? "—"}`;
  }

  const label = getRatingMetricLabel(metric);
  const before = formatRankAndValue(game.rank_before, game.rating_before, label);
  const after = formatRankAndValue(game.rank_after, game.rating_after, label);
  return `${before} → ${after}`;
}

export function formatOpponentRating(game: Game): string | null {
  const metric = getPlatformRatingMetric(game.platform_id);

  if (metric === "rating") {
    return game.opponent_rating !== null ? `${game.opponent_rating}` : null;
  }

  if (game.opponent_rank === null && game.opponent_rating === null) {
    return null;
  }

  const label = getRatingMetricLabel(metric);
  return formatRankAndValue(game.opponent_rank, game.opponent_rating, label);
}
