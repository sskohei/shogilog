-- ==========================================================
-- Migration: Add rank column to ratings
-- Description: Store the rank (段/級) at the time a rating point was
--   recorded, for rank-based platforms. Backfills existing rows from
--   games.rank_after via the game_id link.
-- ==========================================================

alter table public.ratings
add column rank text;

comment on column public.ratings.rank is
'Rank (段/級) at the time this rating point was recorded, for rank-based platforms';

update public.ratings r
set rank = g.rank_after
from public.games g
where r.game_id = g.id
  and g.rank_after is not null
  and r.rank is null;
