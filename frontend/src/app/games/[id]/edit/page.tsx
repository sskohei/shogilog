import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApiError } from "@/lib/fetcher";
import { fetchGame } from "@/services/api/games";
import { fetchOpenings } from "@/services/api/openings";
import { ErrorState } from "@/features/games/ErrorState";
import { getGamesErrorMessage } from "@/features/games/errors";
import { GameForm } from "@/features/games/GameForm";
import type { Game } from "@/types/game";
import type { Opening } from "@/types/opening";

export const metadata: Metadata = {
  title: "対局編集 | ShogiLog",
};

type EditGamePageData =
  | { ok: true; game: Game; openings: Opening[] }
  | { ok: false; message: string };

async function loadEditGamePageData(id: string): Promise<EditGamePageData> {
  try {
    const [game, openings] = await Promise.all([fetchGame(id), fetchOpenings()]);
    return { ok: true, game, openings };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    const message =
      error instanceof ApiError ? getGamesErrorMessage(error) : "対局情報の取得に失敗しました。";
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
        <GameForm mode="edit" game={data.game} openings={data.openings} />
      )}
    </div>
  );
}
