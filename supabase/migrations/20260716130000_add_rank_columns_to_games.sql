-- ==========================================================
-- Migration: Add rank columns to games
-- Description: Store dan/kyu rank alongside rating_before/rating_after/
--              opponent_rating for platforms that report rank instead of
--              (or in addition to) a numeric rating (e.g. 将棋ウォーズ, 棋桜)
-- ==========================================================

alter table public.games
    add column rank_before text,
    add column rank_after text,
    add column opponent_rank text;

comment on column public.games.rank_before is
'Player rank before the game (dan/kyu), for rank-based platforms';

comment on column public.games.rank_after is
'Player rank after the game (dan/kyu), for rank-based platforms';

comment on column public.games.opponent_rank is
'Opponent rank (dan/kyu), for rank-based platforms';
