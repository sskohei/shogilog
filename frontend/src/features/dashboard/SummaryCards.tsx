function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold">{value}</p>
    </div>
  );
}

export function SummaryCards({
  totalGames,
  winRate,
}: {
  totalGames: number;
  winRate: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-2">
      <SummaryCard label="総対局数" value={`${totalGames}局`} />
      <SummaryCard label="勝率" value={`${Math.round(winRate * 100)}%`} />
    </div>
  );
}
