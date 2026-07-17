import Link from "next/link";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/fetcher";
import { fetchGames } from "@/services/api/games";
import { fetchOpenings } from "@/services/api/openings";
import { EmptyState } from "@/features/games/EmptyState";
import { GamesPagination } from "@/features/games/GamesPagination";
import { GamesTable } from "@/features/games/GamesTable";
import { ErrorState } from "@/components/ui/error-state";
import { getApiErrorMessage } from "@/lib/errorMessages";
import type { GameListResponse } from "@/types/game";

export const metadata: Metadata = {
  title: "対局一覧 | ShogiLog",
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(value: string | string[] | undefined, fallback: number): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = raw !== undefined ? Number.parseInt(raw, 10) : NaN;
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

type GamesPageData =
  | { ok: true; games: GameListResponse; openingsById: Map<number, string> }
  | { ok: false; message: string };

async function loadGamesPageData(page: number, limit: number): Promise<GamesPageData> {
  try {
    const [games, openings] = await Promise.all([
      fetchGames({ page, limit }),
      fetchOpenings(),
    ]);
    const openingsById = new Map(openings.map((opening) => [opening.id, opening.name]));
    return { ok: true, games, openingsById };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? getApiErrorMessage(error, "対局情報の取得に失敗しました。")
        : "対局情報の取得に失敗しました。";
    return { ok: false, message };
  }
}

export default async function GamesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const page = parsePositiveInt(params.page, DEFAULT_PAGE);
  const limit = Math.min(parsePositiveInt(params.limit, DEFAULT_LIMIT), MAX_LIMIT);

  const data = await loadGamesPageData(page, limit);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">対局一覧</h1>
        <Button
          render={<Link href="/games/new">対局を登録</Link>}
          nativeButton={false}
          size="sm"
        />
      </div>
      {!data.ok ? (
        <ErrorState message={data.message} />
      ) : data.games.data.length > 0 ? (
        <div className="space-y-4">
          <GamesTable games={data.games.data} openingsById={data.openingsById} />
          <GamesPagination pagination={data.games.pagination} />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
