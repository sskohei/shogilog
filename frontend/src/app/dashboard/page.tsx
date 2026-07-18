import type { Metadata } from "next";

import { ApiError } from "@/lib/fetcher";
import { fetchDashboard } from "@/services/api/dashboard";
import { fetchOpenings } from "@/services/api/openings";
import { getApiErrorMessage } from "@/lib/errorMessages";
import { ErrorState } from "@/components/ui/error-state";
import { GamesCountChart } from "@/features/dashboard/GamesCountChart";
import { OpeningDistributionPieChart } from "@/features/dashboard/OpeningDistributionPieChart";
import { RatingHistoryChart } from "@/features/dashboard/RatingHistoryChart";
import { RecentGamesSection } from "@/features/dashboard/RecentGamesSection";
import { SummaryCards } from "@/features/dashboard/SummaryCards";
import { getPlatformName } from "@/features/games/platforms";
import { WinRateBarChart } from "@/features/dashboard/WinRateBarChart";
import type { DashboardData } from "@/types/dashboard";

export const metadata: Metadata = {
  title: "統計 | ShogiLog",
};

const SIDE_LABELS: Record<string, string> = {
  sente: "先手",
  gote: "後手",
};

type DashboardPageData =
  | { ok: true; dashboard: DashboardData; openingsById: Map<number, string> }
  | { ok: false; message: string };

async function loadDashboardPageData(): Promise<DashboardPageData> {
  try {
    const [dashboard, openings] = await Promise.all([fetchDashboard(), fetchOpenings()]);
    const openingsById = new Map(openings.map((opening) => [opening.id, opening.name]));
    return { ok: true, dashboard, openingsById };
  } catch (error) {
    const message = error instanceof ApiError
      ? getApiErrorMessage(error, "統計情報の取得に失敗しました。")
      : "統計情報の取得に失敗しました。";
    return { ok: false, message };
  }
}

export default async function DashboardPage() {
  const data = await loadDashboardPageData();

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
      <h1 className="mb-6 text-xl font-semibold">統計</h1>
      {!data.ok ? (
        <ErrorState message={data.message} />
      ) : data.dashboard.total_games === 0 ? (
        <p className="rounded-lg border border-dashed border-border py-16 text-center text-muted-foreground">
          まだ対局が記録されていません
        </p>
      ) : (
        <div className="space-y-8">
          <SummaryCards
            totalGames={data.dashboard.total_games}
            winRate={data.dashboard.win_rate}
          />
          <div className="grid gap-4 md:grid-cols-3">
            <WinRateBarChart
              title="プラットフォーム別勝率"
              colorByCategory
              data={data.dashboard.platform_stats.map((stat) => ({
                label: getPlatformName(stat.platform_id),
                winRate: stat.win_rate,
              }))}
            />
            <WinRateBarChart
              title="戦法別勝率"
              data={data.dashboard.opening_stats.map((stat) => ({
                label: stat.opening_name,
                winRate: stat.win_rate,
              }))}
            />
            <WinRateBarChart
              title="先手・後手別勝率"
              colorByCategory
              data={data.dashboard.side_stats.map((stat) => ({
                label: SIDE_LABELS[stat.side] ?? stat.side,
                winRate: stat.win_rate,
              }))}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <OpeningDistributionPieChart
              title="自分の戦型"
              data={data.dashboard.my_opening_distribution.map((stat) => ({
                label: stat.opening_name,
                value: stat.game_count,
              }))}
            />
            <OpeningDistributionPieChart
              title="相手の戦型"
              data={data.dashboard.opponent_opening_distribution.map((stat) => ({
                label: stat.opening_name,
                value: stat.game_count,
              }))}
            />
          </div>
          <GamesCountChart
            daily={data.dashboard.daily_stats}
            weekly={data.dashboard.weekly_stats}
            monthly={data.dashboard.monthly_stats}
            yearly={data.dashboard.yearly_stats}
          />
          <RatingHistoryChart data={data.dashboard.rating_history} />
          <RecentGamesSection
            games={data.dashboard.recent_games}
            openingsById={data.openingsById}
          />
        </div>
      )}
    </div>
  );
}
