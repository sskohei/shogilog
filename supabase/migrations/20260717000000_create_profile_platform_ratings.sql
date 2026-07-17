-- ==========================================================
-- Migration: Create profile_platform_ratings table
-- Description: User-managed current rating/rank per platform,
--              independent from the per-game ratings history.
-- ==========================================================

-- ----------------------------------------------------------
-- Table
-- ----------------------------------------------------------

create table public.profile_platform_ratings (

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    platform_id smallint not null
        references public.platforms(id),

    has_played boolean not null default false,

    rating integer,

    rank text,

    updated_at timestamptz not null default now(),

    primary key (user_id, platform_id)
);

-- ----------------------------------------------------------
-- Comments
-- ----------------------------------------------------------

comment on table public.profile_platform_ratings is
'User-managed current rating/rank per platform, independent from per-game ratings history';

comment on column public.profile_platform_ratings.user_id is
'Owner user';

comment on column public.profile_platform_ratings.platform_id is
'Platform this rating belongs to';

comment on column public.profile_platform_ratings.has_played is
'Whether the user has played on this platform';

comment on column public.profile_platform_ratings.rating is
'Current numeric rating, for rating-based platforms';

comment on column public.profile_platform_ratings.rank is
'Current dan/kyu rank, for rank-based platforms';

-- ----------------------------------------------------------
-- Enable Row Level Security
-- ----------------------------------------------------------

alter table public.profile_platform_ratings
enable row level security;

-- ----------------------------------------------------------
-- Trigger: reuse public.set_updated_at() defined in
-- 20260706044129_create_games.sql
-- ----------------------------------------------------------

create trigger set_profile_platform_ratings_updated_at
before update
on public.profile_platform_ratings
for each row
execute function public.set_updated_at();

-- ----------------------------------------------------------
-- Policies
-- ----------------------------------------------------------

create policy "Users can view own platform ratings"
on public.profile_platform_ratings
for select
to authenticated
using (
    auth.uid() = user_id
);

create policy "Users can insert own platform ratings"
on public.profile_platform_ratings
for insert
to authenticated
with check (
    auth.uid() = user_id
);

create policy "Users can update own platform ratings"
on public.profile_platform_ratings
for update
to authenticated
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);
