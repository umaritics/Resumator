# Phase 1 — Architectural Context Ledger

**Objective:** Secure foundation (Postgres + RLS + auth + client state) before any AI
business logic.

**Status:** Complete  
**Remote project:** `auihdtpgodjaprgbiwks` (Supabase, `ap-southeast-2`)

---

## 1. Postgres schema (`supabase/migrations/`)

### Structural assumptions

| Table | Scope | Assumption |
|---|---|---|
| `profiles` | 1:1 with `auth.users` | Profile row is created by trigger, not client INSERT |
| `resumes` | Per-user JSON documents | `data` column stores full `ResumeData`; template id is denormalized |
| `generations` | Append-only run history | Metrics columns (`latencies_ms`, `providers_used`, `cache_hits`) populated by LangGraph in Phase 4 |
| `jd_analysis_cache` | Global, content-addressed | Cold fallback; hot path is Upstash Redis (Phase 2) |

### Expected side-effects

- **`handle_new_user` trigger** — fires on every `auth.users` INSERT; inserts into
  `profiles` with `display_name` from OAuth metadata (`full_name` or `name`).
- **`resumes_set_updated_at` trigger** — mutates `updated_at` on every UPDATE to
  `resumes`.
- **Cascade deletes** — deleting an auth user removes profiles, resumes, and
  generations; `generations.resume_id` SET NULL on resume delete.

### Why this design

- **JSONB for resume payload** — wizard/form shape evolves faster than normalized
  tables; matches existing Next.js state model and FastAPI `ResumeData` schema (Phase 2).
- **Separate `generations` table** — decouples editable drafts from immutable run
  metrics (portfolio artifact for latency/cache analytics).
- **Alternatives rejected** — normalized resume sections (too much migration friction);
  storing everything only in Redis (no durable user history on free Supabase tier).

---

## 2. Row-Level Security (RLS)

### Policy model

```
profiles     → id = auth.uid()
resumes      → user_id = auth.uid()  (SELECT, INSERT, UPDATE, DELETE)
generations  → user_id = auth.uid()  (SELECT, INSERT, UPDATE, DELETE)
jd_analysis_cache → RLS enabled, NO client policies; REVOKE ALL from anon/authenticated
```

### Expected side-effects

- **Authenticated Supabase JS client** can only read/write own rows when using the
  anon/publishable key + user JWT.
- **`jd_analysis_cache`** is reachable only via `service_role` (FastAPI backend) or
  direct SQL — never from the browser.
- **UPDATE requires SELECT** — each user table has explicit SELECT policies so UPDATE
  does not silently affect zero rows.

### Why this design

- **Defense in depth** — even if FastAPI mis-buckets a request, Postgres blocks
  cross-tenant access.
- **No RLS on shared cache** — JD analysis is identical across users; Redis + service
  role access avoids duplicating cache rows per tenant.
- **Alternatives rejected** — application-only filtering (single bug = data leak);
  RLS on `jd_analysis_cache` with a synthetic `user_id` (wastes storage, no security
  benefit for identical JD hashes).

### Security hardening (`20250617000002`)

- `set_updated_at()` — `SET search_path = public` prevents search-path hijacking.
- `handle_new_user()` — `REVOKE EXECUTE` from `anon`/`authenticated`; only the auth
  trigger invokes it, not `/rest/v1/rpc`.

---

## 3. Supabase Auth (Next.js SSR)

### Components

| Module | Role |
|---|---|
| `src/lib/supabase/client.ts` | Browser client for interactive auth (OAuth redirect, sign-in forms) |
| `src/lib/supabase/server.ts` | Server Components / Route Handlers; reads/writes httpOnly session cookies |
| `src/lib/supabase/middleware.ts` | Refreshes session on every matched request via `getUser()` |
| `src/middleware.ts` | Next.js entry; excludes static assets |
| `src/app/auth/callback/route.ts` | PKCE code exchange after Google OAuth |

### Expected side-effects

- **Session refresh** — middleware calls `getUser()` (not legacy `getSession()`) so
  expired access tokens refresh before Server Components render.
- **Cookie mutation** — `setAll` in Server Components may throw; middleware is the
  authoritative refresher (Supabase SSR documented pattern).
- **OAuth redirect** — Google sign-in returns to `/auth/callback`, then redirects to
  `/` or `?next=` target.

### Why this design

- **`@supabase/ssr` over `@supabase/auth-helpers-nextjs`** — auth-helpers is
  deprecated; SSR package aligns with httpOnly cookies and App Router.
- **Middleware at `src/middleware.ts`** — must live beside `src/app/`, not inside it
  (Next.js convention); previous misplaced file was removed.
- **Alternatives rejected** — NextAuth (second identity provider, no native RLS);
  client-only session in `localStorage` (XSS exposure).

### External dependencies

- `NEXT_PUBLIC_SUPABASE_URL` — HTTPS project URL (`https://<ref>.supabase.co`), **not**
  a Postgres connection string.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — publishable/anon key only; never service role.
- Google OAuth provider enabled in Supabase Dashboard with redirect URL
  `http://localhost:3000/auth/callback` (and production URL at deploy time).

---

## 4. Zustand store (`useResumeStore`)

### State boundaries

| Stored in Zustand (persisted) | Kept in component `useState` |
|---|---|
| Wizard step, template id, full `ResumeData` | Upload spinner, selected file, AI generating flag |

**Rule (from architecture):** if it can be refetched from the server → TanStack Query
(Phase 5). If it only exists on-device until submit → Zustand.

### Expected side-effects

- **Persistence key** — `localStorage["resumator-resume-store"]`; Zustand `partialize`
  strips `profilePic` (non-serializable `File`).
- **Legacy migration** — `resume-maker/page.tsx` one-time reads old keys
  (`resumeData`, `currentStep`) and merges into the store, then deletes them.
- **Hydration gate** — UI renders loading shell until
  `useResumeStore.persist.onFinishHydration` fires (prevents SSR/client mismatch).

### Why this design

- **Zustand + persist** — replaces dual `useEffect` localStorage sync with one
  middleware; fewer re-render bugs on nested list edits.
- **Imperative list handlers in store** — experiences/education/projects share object-list
  shape; certifications/awards live under `additional`; centralizing avoids 150+ lines
  of duplicated setter logic in the page.
- **Alternatives rejected** — React Context (verbose for deep list mutations); Redux
  (overkill for single wizard); TanStack Query for draft form (wrong abstraction — no
  server source yet).

### Mutation contract

All store actions are **synchronous** and **pure relative to store state** — no network
I/O. Errors from AI upload/enhance remain in page-level try/catch calling store
setters on success only.

---

## 5. Phase 1 file map

```
supabase/migrations/          SQL schema, RLS, hardening
src/lib/supabase/             SSR auth clients
src/lib/types/resume.ts       Shared ResumeData types (frontend; mirrored in FastAPI Phase 2)
src/store/useResumeStore.ts   Persisted wizard state
src/store/useResumeStore.test.ts
src/middleware.ts             Session refresh
src/app/auth/                 Login UI + OAuth callback
```

---

## 6. Handoff to Phase 2

Phase 1 establishes **identity and isolation**. Phase 2 adds the FastAPI boundary that:

- Verifies the same Supabase JWT via JWKS (backend trust, independent of RLS).
- Introduces Upstash Redis for job status and rate limits.
- Exposes OpenAPI-documented placeholders for `/api/v1/generate` and `/api/v1/jobs/{id}`.

See [Testing Guide](../testing.md) for Vitest coverage of the store and pytest patterns
for the backend (Phase 2).
