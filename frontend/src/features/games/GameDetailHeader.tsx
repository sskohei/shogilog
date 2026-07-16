import type { ReactNode } from "react";

import { ResultBadge, SideBadge } from "@/features/games/Badges";
import { formatPlayedAt } from "@/features/games/format";
import { getPlatformName } from "@/features/games/platforms";
import type { Game } from "@/types/game";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

export function GameDetailHeader({
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
    <section className="space-y-4 rounded-lg border border-border p-4">
      <div className="flex flex-wrap items-center gap-2">
        <ResultBadge result={game.result} />
        <SideBadge side={game.side} />
      </div>
      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Field label="対局日時">{formatPlayedAt(game.played_at)}</Field>
        <Field label="対局場">{getPlatformName(game.platform_id)}</Field>
        <Field label="対戦相手">
          {game.opponent_name ?? "—"}
          {game.opponent_rating !== null && (
            <span className="text-muted-foreground"> ({game.opponent_rating})</span>
          )}
        </Field>
        <Field label="自分の戦法">{myOpeningName}</Field>
        <Field label="相手の戦法">{opponentOpeningName}</Field>
        <Field label="レーティング">
          {game.rating_before ?? "—"} → {game.rating_after ?? "—"}
        </Field>
      </dl>
    </section>
  );
}
