export type GameResult = "win" | "lose" | "draw";

export type PlayerSide = "sente" | "gote";

export type Game = {
  id: string;
  user_id: string;
  platform_id: number;
  played_at: string;
  result: GameResult;
  side: PlayerSide;
  my_opening_id: number | null;
  opponent_opening_id: number | null;
  rating_before: number | null;
  rating_after: number | null;
  opponent_name: string | null;
  opponent_rating: number | null;
  memo: string | null;
  kifu_path: string | null;
  created_at: string;
  updated_at: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type GameListResponse = {
  data: Game[];
  pagination: Pagination;
};

export type GameDataResponse = {
  data: Game;
};

export type GameKifuUrlResponse = {
  data: {
    url: string | null;
  };
};

export type GameIdResponse = {
  data: {
    id: string;
  };
};

export type GameCreatePayload = {
  platform_id: number;
  played_at: string;
  result: GameResult;
  side: PlayerSide;
  my_opening_id?: number | null;
  opponent_opening_id?: number | null;
  rating_before?: number | null;
  rating_after?: number | null;
  opponent_name?: string | null;
  opponent_rating?: number | null;
  memo?: string | null;
};

// backend/app/schemas/game.py の GameListFilters をミラー。
// 今回のスコープでは page/limit のみ使用し、その他はフィルタ UI 追加時（FE-5 相当）に利用する。
export type GameListQueryParams = {
  page?: number;
  limit?: number;
  platformId?: number;
  result?: GameResult;
  side?: PlayerSide;
  openingId?: number;
  fromDate?: string;
  toDate?: string;
  search?: string;
  sort?: "played_at" | "created_at" | "result";
  order?: "asc" | "desc";
};
