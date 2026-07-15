import type { Metadata } from "next";

import { ApiError } from "@/lib/fetcher";
import { fetchGames } from "@/services/api/games";
import { fetchOpenings } from "@/services/api/openings";
import { EmptyState } from "@/features/games/EmptyState";
import { ErrorState } from "@/features/games/ErrorState";
import { GamesPagination } from "@/features/games/GamesPagination";
import { GamesTable } from "@/features/games/GamesTable";
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

function errorMessage(error: ApiError): string {
  if (error.kind === "config") {
    return error.message;
  }
  if (error.kind === "network") {
    return "バックエンドに接続できませんでした。バックエンドが起動しているか確認してください。";
  }
  if (error.status === 401) {
    return "認証に失敗しました。DEV_AUTH_TOKEN が正しく設定されているか確認してください。";
  }
  if (error.status !== undefined && error.status >= 500) {
    return "バックエンドでエラーが発生しました。バックエンドが起動しているか確認してください。";
  }
  return "対局情報の取得に失敗しました。";
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
    const message = error instanceof ApiError ? errorMessage(error) : "対局情報の取得に失敗しました。";
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
      <h1 className="mb-6 text-xl font-semibold">対局一覧</h1>
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
