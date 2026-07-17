import type { Metadata } from "next";

import { ApiError } from "@/lib/fetcher";
import { fetchOpenings } from "@/services/api/openings";
import { GameForm } from "@/features/games/GameForm";
import { ErrorState } from "@/components/ui/error-state";
import { getApiErrorMessage } from "@/lib/errorMessages";
import type { Opening } from "@/types/opening";

export const metadata: Metadata = {
  title: "対局登録 | ShogiLog",
};

type NewGamePageData =
  | { ok: true; openings: Opening[] }
  | { ok: false; message: string };

async function loadNewGamePageData(): Promise<NewGamePageData> {
  try {
    const openings = await fetchOpenings();
    return { ok: true, openings };
  } catch (error) {
    const message =
      error instanceof ApiError
        ? getApiErrorMessage(error, "対局情報の取得に失敗しました。")
        : "対局情報の取得に失敗しました。";
    return { ok: false, message };
  }
}

export default async function NewGamePage() {
  const data = await loadNewGamePageData();

  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-4 py-12">
      <h1 className="mb-6 text-xl font-semibold">対局を登録</h1>
      {!data.ok ? <ErrorState message={data.message} /> : <GameForm openings={data.openings} />}
    </div>
  );
}
