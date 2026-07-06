-- ==========================================================
-- Function: set_updated_at
-- Description: Automatically update updated_at timestamp
-- ==========================================================

create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();
