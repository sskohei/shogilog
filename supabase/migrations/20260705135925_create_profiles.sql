-- ==========================================================
-- Migration: Create profiles table
-- Description: User profile table for ShogiLog
-- ==========================================================

-- ----------------------------------------------------------
-- Create profiles table
-- ----------------------------------------------------------

create table public.profiles (
    id uuid primary key
        references auth.users(id)
        on delete cascade,

    display_name text,

    avatar_url text,

    bio text,

    created_at timestamptz not null default now(),

    updated_at timestamptz not null default now()
);

-- ----------------------------------------------------------
-- Enable Row Level Security
-- ----------------------------------------------------------

alter table public.profiles
enable row level security;

-- ----------------------------------------------------------
-- Trigger function: update updated_at
-- ----------------------------------------------------------

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

create trigger update_profiles_updated_at
before update
on public.profiles
for each row
execute function public.update_updated_at_column();

-- ----------------------------------------------------------
-- Trigger function: create profile after sign up
-- ----------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    insert into public.profiles (id)
    values (new.id);

    return new;
end;
$$;

create trigger on_auth_user_created
after insert
on auth.users
for each row
execute function public.handle_new_user();

-- ----------------------------------------------------------
-- Policies
-- ----------------------------------------------------------

create policy "Users can view their own profile"
on public.profiles
for select
using (
    auth.uid() = id
);

create policy "Users can insert their own profile"
on public.profiles
for insert
with check (
    auth.uid() = id
);

create policy "Users can update their own profile"
on public.profiles
for update
using (
    auth.uid() = id
)
with check (
    auth.uid() = id
);
