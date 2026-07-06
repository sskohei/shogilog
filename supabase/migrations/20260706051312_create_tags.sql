-- ==========================================================
-- Migration: Create tags and game_tags tables
-- Description: User-defined tags for games
-- ==========================================================

-- ----------------------------------------------------------
-- tags
-- ----------------------------------------------------------

create table public.tags (

    id uuid primary key default gen_random_uuid(),

    user_id uuid not null
        references public.profiles(id)
        on delete cascade,

    name text not null,

    color text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now(),

    constraint uq_tags_user_name
        unique (user_id, name)
);

comment on table public.tags is
'User-defined tags';

comment on column public.tags.id is
'Tag ID';

comment on column public.tags.user_id is
'Owner user';

comment on column public.tags.name is
'Tag name';

comment on column public.tags.color is
'Tag color (HEX)';

comment on column public.tags.created_at is
'Created timestamp';

comment on column public.tags.updated_at is
'Updated timestamp';

-- ----------------------------------------------------------
-- game_tags
-- ----------------------------------------------------------

create table public.game_tags (

    game_id uuid not null
        references public.games(id)
        on delete cascade,

    tag_id uuid not null
        references public.tags(id)
        on delete cascade,

    created_at timestamptz not null default now(),

    primary key (game_id, tag_id)
);

comment on table public.game_tags is
'Many-to-many relationship between games and tags';

comment on column public.game_tags.game_id is
'Game ID';

comment on column public.game_tags.tag_id is
'Tag ID';

comment on column public.game_tags.created_at is
'Created timestamp';

-- ==========================================================
-- Trigger
-- ==========================================================

create trigger set_tags_updated_at
before update on public.tags
for each row
execute function public.set_updated_at();

-- ==========================================================
-- Indexes
-- ==========================================================

create index idx_tags_user_id
on public.tags(user_id);

create index idx_game_tags_game_id
on public.game_tags(game_id);

create index idx_game_tags_tag_id
on public.game_tags(tag_id);

-- ==========================================================
-- Enable Row Level Security
-- ==========================================================

alter table public.tags
enable row level security;

alter table public.game_tags
enable row level security;

-- ==========================================================
-- tags Policies
-- ==========================================================

create policy "Users can view own tags"
on public.tags
for select
to authenticated
using (
    auth.uid() = user_id
);

create policy "Users can insert own tags"
on public.tags
for insert
to authenticated
with check (
    auth.uid() = user_id
);

create policy "Users can update own tags"
on public.tags
for update
to authenticated
using (
    auth.uid() = user_id
)
with check (
    auth.uid() = user_id
);

create policy "Users can delete own tags"
on public.tags
for delete
to authenticated
using (
    auth.uid() = user_id
);

-- ==========================================================
-- game_tags Policies
-- ==========================================================

create policy "Users can view own game tags"
on public.game_tags
for select
to authenticated
using (
    exists (
        select 1
        from public.games g
        where g.id = game_tags.game_id
          and g.user_id = auth.uid()
    )
);

create policy "Users can insert own game tags"
on public.game_tags
for insert
to authenticated
with check (
    exists (
        select 1
        from public.games g
        where g.id = game_tags.game_id
          and g.user_id = auth.uid()
    )
    and exists (
        select 1
        from public.tags t
        where t.id = game_tags.tag_id
          and t.user_id = auth.uid()
    )
);

create policy "Users can delete own game tags"
on public.game_tags
for delete
to authenticated
using (
    exists (
        select 1
        from public.games g
        where g.id = game_tags.game_id
          and g.user_id = auth.uid()
    )
);
