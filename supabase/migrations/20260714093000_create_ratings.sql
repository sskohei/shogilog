-- ==========================================================
-- Migration: Create ratings table
-- Description: Store rating history per platform
-- ==========================================================

-- ----------------------------------------------------------
-- Table
-- ----------------------------------------------------------

create table public.ratings (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    platform_id smallint not null
        references public.platforms(id),

    game_id uuid
        references public.games(id)
        on delete set null,

    rating integer not null,

    recorded_at timestamptz not null default now(),

    created_at timestamptz not null default now()
);

-- ----------------------------------------------------------
-- Comments
-- ----------------------------------------------------------

comment on table public.ratings is
'Rating history per platform';

comment on column public.ratings.id is
'Rating ID';

comment on column public.ratings.user_id is
'Owner user';

comment on column public.ratings.platform_id is
'Platform';

comment on column public.ratings.game_id is
'Related game';

comment on column public.ratings.rating is
'Rating value';

comment on column public.ratings.recorded_at is
'Timestamp the rating was recorded';

comment on column public.ratings.created_at is
'Created timestamp';

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------

create index idx_ratings_user_id
on public.ratings(user_id);

create index idx_ratings_platform_id
on public.ratings(platform_id);

create index idx_ratings_game_id
on public.ratings(game_id);

create index idx_ratings_user_recorded_at
on public.ratings(user_id, recorded_at);

-- ----------------------------------------------------------
-- Enable Row Level Security
-- ----------------------------------------------------------

alter table public.ratings
enable row level security;

-- ----------------------------------------------------------
-- Policies
-- ----------------------------------------------------------

create policy "Users can view own ratings"
on public.ratings
for select
to authenticated
using (
    auth.uid() = user_id
);

create policy "Users can insert own ratings"
on public.ratings
for insert
to authenticated
with check (
    auth.uid() = user_id
);
