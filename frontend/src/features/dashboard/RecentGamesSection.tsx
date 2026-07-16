import Link from "next/link";

import { GamesTable } from "@/features/games/GamesTable";
import type { Game } from "@/types/game";

export function RecentGamesSection({
  games,
  openingsById,
}: {
  games: Game[];
  openingsById: Map<number, string>;
}) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">直近の対局</h2>
        <Link href="/games" className="text-sm text-primary hover:underline">
          対局一覧へ
        </Link>
      </div>
      {games.length === 0 ? (
        <p className="text-sm text-muted-foreground">まだ対局が記録されていません</p>
      ) : (
        <GamesTable games={games} openingsById={openingsById} />
      )}
    </div>
  );
}
