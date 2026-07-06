-- ==========================================================
-- Migration: Create openings table
-- Description: Shogi opening master table
-- ==========================================================

-- ----------------------------------------------------------
-- ENUM
-- ----------------------------------------------------------

create type public.opening_category as enum (
    'static_rook',
    'ranging_rook',
    'other'
);

-- ----------------------------------------------------------
-- Table
-- ----------------------------------------------------------

create table public.openings (

    id smallint primary key,

    name text not null unique,

    slug text not null unique,

    category public.opening_category not null,

    description text,

    is_active boolean not null default true,

    created_at timestamptz not null default now()
);

comment on table public.openings is
'Shogi opening master table';

comment on column public.openings.id is
'Opening ID';

comment on column public.openings.name is
'Display name';

comment on column public.openings.slug is
'Unique identifier';

comment on column public.openings.category is
'Opening category';

comment on column public.openings.description is
'Description';

comment on column public.openings.is_active is
'Whether the opening is selectable';

-- ----------------------------------------------------------
-- Seed
-- ----------------------------------------------------------

insert into public.openings (
    id,
    name,
    slug,
    category,
    description
)
values
(1,'矢倉','yagura','static_rook','代表的な相居飛車戦法'),
(2,'角換わり','kakugawari','static_rook','角交換から始まる戦法'),
(3,'相掛かり','aigakari','static_rook','飛車先を交換する戦法'),
(4,'横歩取り','yokofudori','static_rook','横歩を取る戦法'),
(5,'雁木','gangi','static_rook','近年人気の居飛車戦法'),

(6,'四間飛車','shikenbisha','ranging_rook','代表的な振り飛車'),
(7,'三間飛車','sangenbisha','ranging_rook','軽快な振り飛車'),
(8,'中飛車','nakabisha','ranging_rook','中央に飛車を振る戦法'),
(9,'向かい飛車','mukaibisha','ranging_rook','飛車を向かい側へ振る戦法'),

(99,'その他','other','other','分類されない戦法');

-- ----------------------------------------------------------
-- Enable RLS
-- ----------------------------------------------------------

alter table public.openings
enable row level security;

-- ----------------------------------------------------------
-- Policies
-- ----------------------------------------------------------

create policy "Authenticated users can read openings"
on public.openings
for select
to authenticated
using (true);

-- INSERT / UPDATE / DELETE は許可しない