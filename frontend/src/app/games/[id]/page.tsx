import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/fetcher";
import { fetchGame, fetchGameKifuUrl } from "@/services/api/games";
import { fetchOpenings } from "@/services/api/openings";
import { DeleteGameButton } from "@/features/games/DeleteGameButton";
import { ErrorState } from "@/features/games/ErrorState";
import { getGamesErrorMessage } from "@/features/games/errors";
import { GameDetailHeader } from "@/features/games/GameDetailHeader";
import { KifuSection } from "@/features/games/KifuSection";
import { MemoSection } from "@/features/games/MemoSection";
import type { Game } from "@/types/game";

export const metadata: Metadata = {
  title: "対局詳細 | ShogiLog",
};

type GameDetailPageData =
  | {
      ok: true;
      game: Game;
      kifuUrl: string | null;
      openingsById: Map<number, string>;
    }
  | { ok: false; message: string };

async function loadGameDetailPageData(id: string): Promise<GameDetailPageData> {
  try {
    const [game, kifuUrl, openings] = await Promise.all([
      fetchGame(id),
      fetchGameKifuUrl(id),
      fetchOpenings(),
    ]);
    const openingsById = new Map(openings.map((opening) => [opening.id, opening.name]));
    return { ok: true, game, kifuUrl, openingsById };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    const message =
      error instanceof ApiError ? getGamesErrorMessage(error) : "対局情報の取得に失敗しました。";
    return { ok: false, message };
  }
}

export default async function GameDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadGameDetailPageData(id);

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 space-y-4 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">対局詳細</h1>
        {data.ok && (
          <div className="flex gap-2">
            <Button
              render={<Link href={`/games/${data.game.id}/edit`}>編集</Link>}
              nativeButton={false}
              variant="outline"
              size="sm"
            />
            <DeleteGameButton gameId={data.game.id} />
          </div>
        )}
      </div>
      {!data.ok ? (
        <ErrorState message={data.message} />
      ) : (
        <>
          <GameDetailHeader game={data.game} openingsById={data.openingsById} />
          <KifuSection kifuUrl={data.kifuUrl} />
          <MemoSection gameId={data.game.id} memo={data.game.memo} />
        </>
      )}
    </div>
  );
}
