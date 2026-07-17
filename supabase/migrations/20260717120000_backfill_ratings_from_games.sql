-- ==========================================================
-- Migration: Backfill ratings from existing games
-- Description: Games registered before the ratings-write-on-create fix
--   have rating_after recorded but no corresponding ratings row.
-- ==========================================================

insert into public.ratings (user_id, platform_id, game_id, rating, recorded_at)
select
    g.user_id,
    g.platform_id,
    g.id,
    g.rating_after,
    g.played_at
from public.games g
where g.rating_after is not null
  and not exists (
      select 1 from public.ratings r where r.game_id = g.id
  );
