-- ==========================================================
-- Migration: Create kifu storage bucket
-- Description: Private Supabase Storage bucket for kifu files
--              referenced by games.kifu_path
-- ==========================================================

insert into storage.buckets (id, name, public)
values ('kifu', 'kifu', false)
on conflict (id) do nothing;
