-- Resumator V2 — Row-Level Security policies (Phase 1)
-- Ensures user_id = auth.uid() isolation on user-scoped tables.

-- ---------------------------------------------------------------------------
-- Enable RLS
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.resumes enable row level security;
alter table public.generations enable row level security;
alter table public.jd_analysis_cache enable row level security;

-- jd_analysis_cache is not user-scoped; block direct client access.
-- Backend service_role bypasses RLS for read/write.
revoke all on public.jd_analysis_cache from anon, authenticated;

-- ---------------------------------------------------------------------------
-- profiles — own row only
-- ---------------------------------------------------------------------------
create policy "profiles_select_own"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "profiles_insert_own"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "profiles_update_own"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "profiles_delete_own"
on public.profiles
for delete
to authenticated
using (id = auth.uid());

-- ---------------------------------------------------------------------------
-- resumes — user_id = auth.uid()
-- ---------------------------------------------------------------------------
create policy "resumes_select_own"
on public.resumes
for select
to authenticated
using (user_id = auth.uid());

create policy "resumes_insert_own"
on public.resumes
for insert
to authenticated
with check (user_id = auth.uid());

create policy "resumes_update_own"
on public.resumes
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "resumes_delete_own"
on public.resumes
for delete
to authenticated
using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- generations — user_id = auth.uid()
-- ---------------------------------------------------------------------------
create policy "generations_select_own"
on public.generations
for select
to authenticated
using (user_id = auth.uid());

create policy "generations_insert_own"
on public.generations
for insert
to authenticated
with check (user_id = auth.uid());

create policy "generations_update_own"
on public.generations
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "generations_delete_own"
on public.generations
for delete
to authenticated
using (user_id = auth.uid());
