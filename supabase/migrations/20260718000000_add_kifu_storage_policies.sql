-- ==========================================================
-- Migration: Add RLS policies for kifu storage bucket
-- Description: Scope read/write access on storage.objects for
--              the private `kifu` bucket to the owning user,
--              matching the `{user_id}/...` path convention
--              enforced by games.kifu_path validation.
-- ==========================================================

create policy "Users can select their own kifu objects"
on storage.objects for select
to authenticated
using (
  bucket_id = 'kifu'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can insert their own kifu objects"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'kifu'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can update their own kifu objects"
on storage.objects for update
to authenticated
using (
  bucket_id = 'kifu'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'kifu'
  and (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete their own kifu objects"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'kifu'
  and (storage.foldername(name))[1] = auth.uid()::text
);
