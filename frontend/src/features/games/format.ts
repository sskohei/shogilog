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
