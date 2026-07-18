import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiError } from "@/lib/fetcher";
import { fetchGame, fetchGameTags } from "@/services/api/games";
import { fetchOpenings } from "@/services/api/openings";
import { fetchTags } from "@/services/api/tags";
import { GameForm } from "@/features/games/GameForm";
import { ErrorState } from "@/components/ui/error-state";
import { getApiErrorMessage } from "@/lib/errorMessages";
import type { Game } from "@/types/game";
import type { Opening } from "@/types/opening";
import type { Tag } from "@/types/tag";

export const metadata: Metadata = {
  title: "対局編集 | ShogiLog",
};

type EditGamePageData =
  | { ok: true; game: Game; openings: Opening[]; gameTags: Tag[]; allTags: Tag[] }
  | { ok: false; message: string };

async function loadEditGamePageData(id: string): Promise<EditGamePageData> {
  try {
    const [game, openings, gameTags, allTags] = await Promise.all([
      fetchGame(id),
      fetchOpenings(),
      fetchGameTags(id),
      fetchTags(),
    ]);
    return { ok: true, game, openings, gameTags, allTags };
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

export default async function EditGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await loadEditGamePageData(id);

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="mb-6 text-xl font-semibold">対局を編集</h1>
      {!data.ok ? (
        <ErrorState message={data.message} />
      ) : (
        <GameForm
          mode="edit"
          game={data.game}
          openings={data.openings}
          gameTags={data.gameTags}
          allTags={data.allTags}
        />
      )}
    </div>
  );
}
