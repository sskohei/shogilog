import { GameRow } from "@/features/games/GameRow";
import type { Game } from "@/types/game";

const HEADERS = [
  "対局日時",
  "対局場",
  "結果",
  "手番",
  "対戦相手",
  "自分の戦法",
  "相手の戦法",
  "メモ",
];

export function GamesTable({
  games,
  openingsById,
}: {
  games: Game[];
  openingsById: Map<number, string>;
}) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 text-muted-foreground">
          <tr>
            {HEADERS.map((header) => (
              <th key={header} className="px-3 py-2 font-medium whitespace-nowrap">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {games.map((game) => (
            <GameRow key={game.id} game={game} openingsById={openingsById} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
