-- Resumator V2 — initial Postgres schema (Phase 1)
-- Tables: profiles, resumes, generations, jd_analysis_cache

-- ---------------------------------------------------------------------------
-- profiles — mirrors auth.users with optional display metadata
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile metadata linked 1:1 with auth.users';

-- ---------------------------------------------------------------------------
-- resumes — persisted resume form data + template choice
-- ---------------------------------------------------------------------------
create table public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null default 'Untitled Resume',
  template text not null default 'classic',
  data jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index resumes_user_id_idx on public.resumes (user_id);
create index resumes_updated_at_idx on public.resumes (updated_at desc);

comment on table public.resumes is 'User-owned resume documents (ResumeData JSON + template id)';

-- Auto-update updated_at on row changes
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger resumes_set_updated_at
before update on public.resumes
for each row
execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- generations — one row per AI generate run (metrics + history)
-- ---------------------------------------------------------------------------
create table public.generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  resume_id uuid references public.resumes (id) on delete set null,
  job_description text,
  tailored_data jsonb,
  ats_score jsonb,
  cover_letter text,
  latencies_ms jsonb,
  providers_used jsonb,
  cache_hits jsonb,
  created_at timestamptz not null default now()
);

create index generations_user_id_idx on public.generations (user_id);
create index generations_created_at_idx on public.generations (created_at desc);
create index generations_resume_id_idx on public.generations (resume_id);

comment on table public.generations is 'History of AI tailoring runs with latency and provider metadata';

-- ---------------------------------------------------------------------------
-- jd_analysis_cache — shared cold cache (not user-scoped)
-- ---------------------------------------------------------------------------
create table public.jd_analysis_cache (
  jd_hash text primary key,
  analysis jsonb not null,
  created_at timestamptz not null default now()
);

comment on table public.jd_analysis_cache is 'Durable JD analysis cache keyed by content hash';

-- ---------------------------------------------------------------------------
-- Auto-create profile row when a new auth user signs up
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute function public.handle_new_user();
