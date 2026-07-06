-- ==========================================================
-- Migration: Create platforms table
-- Description: Supported shogi platforms master table
-- ==========================================================

-- ----------------------------------------------------------
-- Create table
-- ----------------------------------------------------------

create table public.platforms (
    id smallint primary key,
    name text not null unique,
    slug text not null unique,
    created_at timestamptz not null default now()
);

comment on table public.platforms is
'Supported shogi platforms';

comment on column public.platforms.id is
'Platform ID';

comment on column public.platforms.name is
'Display name';

comment on column public.platforms.slug is
'Unique identifier used in URLs and APIs';

-- ----------------------------------------------------------
-- Seed data
-- ----------------------------------------------------------

insert into public.platforms (id, name, slug)
values
    (1, '将棋ウォーズ', 'shogiwars'),
    (2, '将棋クエスト', 'shogiquest'),
    (3, '棋桜', 'kiou'),
    (4, '81道場', '81dojo');

-- ----------------------------------------------------------
-- Enable Row Level Security
-- ----------------------------------------------------------

alter table public.platforms
enable row level security;

-- ----------------------------------------------------------
-- Policies
-- ----------------------------------------------------------

create policy "Authenticated users can read platforms"
on public.platforms
for select
to authenticated
using (true);

-- No INSERT policy
-- No UPDATE policy
-- No DELETE policy