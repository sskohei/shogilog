import type { Metadata } from "next";

import { ApiError } from "@/lib/fetcher";
import { fetchFavoriteOpeningIds, fetchOpenings } from "@/services/api/openings";
import { ErrorState } from "@/features/openings/ErrorState";
import { getOpeningsErrorMessage } from "@/features/openings/errors";
import { OpeningList } from "@/features/openings/OpeningList";
import type { Opening } from "@/types/opening";

export const metadata: Metadata = {
  title: "戦法 | ShogiLog",
};

type OpeningsPageData =
  | { ok: true; openings: Opening[]; favoriteOpeningIds: number[] }
  | { ok: false; message: string };

async function loadOpeningsPageData(): Promise<OpeningsPageData> {
  try {
    const [openings, favoriteOpeningIds] = await Promise.all([
      fetchOpenings(),
      fetchFavoriteOpeningIds(),
    ]);
    return { ok: true, openings, favoriteOpeningIds };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? getOpeningsErrorMessage(error)
        : "戦法情報の取得に失敗しました。";
    return { ok: false, message };
  }
}

export default async function OpeningsPage() {
  const data = await loadOpeningsPageData();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-4 py-12">
      <h1 className="text-xl font-semibold">戦法</h1>
      {!data.ok ? (
        <ErrorState message={data.message} />
      ) : (
        <OpeningList
          openings={data.openings}
          favoriteOpeningIds={data.favoriteOpeningIds}
        />
      )}
    </div>
  );
}
