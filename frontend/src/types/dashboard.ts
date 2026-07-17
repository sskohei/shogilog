import type { Game } from "@/types/game";

export type PlatformStat = {
  platform_id: number;
  win_rate: number;
};

export type OpeningStat = {
  opening_name: string;
  win_rate: number;
};

export type SideStat = {
  side: "sente" | "gote";
  win_rate: number;
};

export type MonthlyStat = {
  month: string;
  game_count: number;
};

export type RatingHistoryPoint = {
  platform_id: number;
  rating: number;
  rank: string | null;
  recorded_at: string;
};

export type DashboardData = {
  total_games: number;
  win_rate: number;
  recent_games: Game[];
  platform_stats: PlatformStat[];
  opening_stats: OpeningStat[];
  side_stats: SideStat[];
  monthly_stats: MonthlyStat[];
  rating_history: RatingHistoryPoint[];
};

export type DashboardResponse = {
  data: DashboardData;
};
