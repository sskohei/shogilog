import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ResultBadge, SideBadge } from "@/features/games/Badges";
import { formatPlayedAt } from "@/features/games/format";
import { getPlatformName } from "@/features/games/platforms";
import type { Game } from "@/types/game";

export function GameRow({
  game,
  openingsById,
}: {
  game: Game;
  openingsById: Map<number, string>;
}) {
  const myOpeningName =
    game.my_opening_id !== null ? openingsById.get(game.my_opening_id) ?? "—" : "—";
  const opponentOpeningName =
    game.opponent_opening_id !== null
      ? openingsById.get(game.opponent_opening_id) ?? "—"
      : "—";

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-2 whitespace-nowrap">{formatPlayedAt(game.played_at)}</td>
      <td className="px-3 py-2 whitespace-nowrap">{getPlatformName(game.platform_id)}</td>
      <td className="px-3 py-2">
        <ResultBadge result={game.result} />
      </td>
      <td className="px-3 py-2">
        <SideBadge side={game.side} />
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        {game.opponent_name ?? "—"}
        {game.opponent_rating !== null && (
          <span className="text-muted-foreground"> ({game.opponent_rating})</span>
        )}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">{myOpeningName}</td>
      <td className="px-3 py-2 whitespace-nowrap">{opponentOpeningName}</td>
      <td className="max-w-xs truncate px-3 py-2 text-muted-foreground">
        {game.memo ?? ""}
      </td>
      <td className="px-3 py-2 whitespace-nowrap">
        <Button
          render={<Link href={`/games/${game.id}`}>詳細</Link>}
          nativeButton={false}
          variant="outline"
          size="sm"
        />
      </td>
    </tr>
  );
}
