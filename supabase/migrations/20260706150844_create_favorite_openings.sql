-- ==========================================================
-- Migration: Create favorite_openings table
-- Description: User favorite shogi openings
-- ==========================================================

-- ----------------------------------------------------------
-- Table
-- ----------------------------------------------------------

create table public.favorite_openings (

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    opening_id smallint not null
        references public.openings(id),

    created_at timestamptz not null default now(),

    primary key (user_id, opening_id)
);

-- ----------------------------------------------------------
-- Comments
-- ----------------------------------------------------------

comment on table public.favorite_openings is
'User favorite shogi openings';

comment on column public.favorite_openings.user_id is
'Owner user';

comment on column public.favorite_openings.opening_id is
'Favorite opening';

comment on column public.favorite_openings.created_at is
'Created timestamp';

-- ----------------------------------------------------------
-- Indexes
-- ----------------------------------------------------------

create index idx_favorite_openings_opening_id
on public.favorite_openings(opening_id);

-- ----------------------------------------------------------
-- Enable Row Level Security
-- ----------------------------------------------------------

alter table public.favorite_openings
enable row level security;

-- ----------------------------------------------------------
-- Policies
-- ----------------------------------------------------------

create policy "Users can view own favorite openings"
on public.favorite_openings
for select
to authenticated
using (
    auth.uid() = user_id
);

create policy "Users can insert own favorite openings"
on public.favorite_openings
for insert
to authenticated
with check (
    auth.uid() = user_id
);

create policy "Users can delete own favorite openings"
on public.favorite_openings
for delete
to authenticated
using (
    auth.uid() = user_id
);
