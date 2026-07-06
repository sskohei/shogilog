-- ==========================================================
-- Migration: Create platforms table
-- Description: Supported shogi platforms
-- ==========================================================

create table public.platforms (

    id smallint generated always as identity primary key,

    name text not null unique,

    slug text not null unique,

    created_at timestamptz not null default now()
);

comment on table public.platforms
is 'Supported shogi platforms';

insert into public.platforms (name, slug)
values
('将棋ウォーズ', 'shogiwars'),
('将棋クエスト', 'shogiquest'),
('棋桜', 'kiou'),
('81道場', '81dojo');