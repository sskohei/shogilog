import { Badge } from "@/components/ui/badge";
import type { GameResult, PlayerSide } from "@/types/game";

const RESULT_LABELS: Record<GameResult, string> = {
  win: "勝ち",
  lose: "負け",
  draw: "引き分け",
};

const RESULT_VARIANTS: Record<
  GameResult,
  "default" | "destructive" | "secondary"
> = {
  win: "default",
  lose: "destructive",
  draw: "secondary",
};

export function ResultBadge({ result }: { result: GameResult }) {
  return <Badge variant={RESULT_VARIANTS[result]}>{RESULT_LABELS[result]}</Badge>;
}

const SIDE_LABELS: Record<PlayerSide, string> = {
  sente: "先手",
  gote: "後手",
};

export function SideBadge({ side }: { side: PlayerSide }) {
  return <Badge variant="outline">{SIDE_LABELS[side]}</Badge>;
}
