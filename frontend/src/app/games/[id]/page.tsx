import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/fetcher";
import { fetchGame, fetchGameKifuUrl, fetchGameTags } from "@/services/api/games";
import { fetchOpenings } from "@/services/api/openings";
import { fetchTags } from "@/services/api/tags";
import { DeleteGameButton } from "@/features/games/DeleteGameButton";
import { GameDetailHeader } from "@/features/games/GameDetailHeader";
import { ErrorState } from "@/components/ui/error-state";
import { getApiErrorMessage } from "@/lib/errorMessages";
import { GameTagsSection } from "@/features/games/GameTagsSection";
import { KifuSection } from "@/features/games/KifuSection";
import { MemoSection } from "@/features/games/MemoSection";
import type { Game } from "@/types/game";
import type { Tag } from "@/types/tag";

export const metadata: Metadata = {
  title: "対局詳細 | ShogiLog",
};

type GameDetailPageData =
  | {
      ok: true;
      game: Game;
      kifuUrl: string | null;
      openingsById: Map<number, string>;
      gameTags: Tag[];
      allTags: Tag[];
    }
  | { ok: false; message: string };

async function loadGameDetailPageData(id: string): Promise<GameDetailPageData> {
  try {
    const [game, kifuUrl, openings, gameTags, allTags] = await Promise.all([
      fetchGame(id),
      fetchGameKifuUrl(id),
      fetchOpenings(),
      fetchGameTags(id),
      fetchTags(),
    ]);
    const openingsById = new Map(openings.map((opening) => [opening.id, opening.name]));
    return { ok: true, game, kifuUrl, openingsById, gameTags, allTags };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    const message =
      error instanceof ApiError
        ? getApiErrorMessage(error, "対局情報の取得に失敗しました。")
        : "対局情報の取得に失敗しました。";
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
          <GameTagsSection
            gameId={data.game.id}
            gameTags={data.gameTags}
            allTags={data.allTags}
          />
          <KifuSection kifuUrl={data.kifuUrl} />
          <MemoSection gameId={data.game.id} memo={data.game.memo} />
        </>
      )}
    </div>
  );
}
