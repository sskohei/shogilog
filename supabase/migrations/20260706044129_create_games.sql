-- ==========================================================
-- Migration: Create games table
-- Description: Store shogi game records
-- ==========================================================

-- ----------------------------------------------------------
-- ENUM
-- ----------------------------------------------------------

create type public.game_result as enum (
    'win',
    'lose',
    'draw'
);

create type public.player_side as enum (
    'sente',
    'gote'
);

-- ----------------------------------------------------------
-- Table
-- ----------------------------------------------------------

create table public.games (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    platform_id smallint not null
        references public.platforms(id),

    played_at timestamptz not null,

    result public.game_result not null,

    side public.player_side not null,

    my_opening_id smallint
        references public.openings(id),

    opponent_opening_id smallint
        references public.openings(id),

    rating_before integer,

    rating_after integer,

    opponent_name text,

    opponent_rating integer,

    memo text,

    kifu_path text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------
-- Comments
-- ----------------------------------------------------------

comment on table public.games is
'User shogi game records';

comment on column public.games.id is
'Game ID';

comment on column public.games.user_id is
'Owner user';

comment on column public.games.platform_id is
'Platform';

comment on column public.games.played_at is
'Date and time of the game';

comment on column public.games.result is
'Game result';

comment on column public.games.side is
'Player side';

comment on column public.games.my_opening_id is
'Player opening';

comment on column public.games.opponent_opening_id is
'Opponent opening';

comment on column public.games.rating_before is
'Rating before the game';

comment on column public.games.rating_after is
'Rating after the game';

comment on column public.games.opponent_name is
'Opponent username';

comment on column public.games.opponent_rating is
'Opponent rating';

comment on column public.games.memo is
'User memo';

comment on column public.games.kifu_path is
'Path of the kifu file stored in Supabase Storage';

-- ----------------------------------------------------------
-- Trigger
-- ----------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

comment on function public.set_updated_at() is
'Automatically updates the updated_at column before update.';


create trigger set_games_updated_at
before update on public.games
for each row
execute function public.set_updated_at();

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------

create index idx_games_user_id
on public.games(user_id);

create index idx_games_played_at
on public.games(played_at desc);

create index idx_games_platform_id
on public.games(platform_id);

create index idx_games_my_opening_id
on public.games(my_opening_id);

create index idx_games_opponent_opening_id
on public.games(opponent_opening_id);

create index idx_games_user_played_at
on public.games(user_id, played_at desc);

-- ----------------------------------------------------------
-- Enable Row Level Security
-- ----------------------------------------------------------

alter table public.games
enable row level security;

-- ----------------------------------------------------------
-- Policies
-- ----------------------------------------------------------

create policy "Users can view own games"
on public.games
for select
to authenticated
using (
    auth.uid() = user_id
);

create policy "Users can insert own games"
on public.games
for insert
to authenticated
with check (
    auth.uid() = user_id
);

create policy "Users can update own games"
on public.games
for update
to authenticated
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);

create policy "Users can delete own games"
on public.games
for delete
to authenticated
using (
    auth.uid() = user_id
);

