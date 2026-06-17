# Phase 5 — Architectural Context Ledger

**Objective:** Async generation jobs in FastAPI + TanStack Query polling on the resume
maker wizard.

**Status:** Complete

---

## 1. Backend async job flow

| Step | Component | Behavior |
|---|---|---|
| 1 | `POST /api/v1/generate` | `JobStore.create()` writes `pending` to Redis key `job:{uuid}` (TTL 3600s), returns **202** + `job_id` |
| 2 | `BackgroundTasks` | `execute_generation_job()` runs compiled LangGraph graph |
| 3 | `on_progress` callback | Updates Redis `stage` + `progress_message` per graph node |
| 4 | Completion | `mark_done` stores JSON `result` (tailored resume, optional ATS/cover letter, meta) |
| 5 | `GET /api/v1/jobs/{id}` | TanStack Query polls until `status` is `done` or `failed` |

### Key modules

- `app/services/job_store.py` — Redis CRUD for job records
- `app/services/generation_service.py` — maps `GenerateRequest` → `PipelineState`, runs graph
- `app/pipeline/constants.py` — `STAGE_MESSAGES` (decoupled from service to avoid circular imports)
- `app/pipeline/graph.py` — optional `on_progress(stage, message)` hook

### Why FastAPI BackgroundTasks (not Celery)

- Phase 5 scope: single Cloud Run instance (`max-instances=1` in Phase 6)
- Jobs are short-lived LLM pipelines; Redis already holds durable status for reconnects
- **Alternatives rejected** — Celery/Cloud Tasks add infra before CI/CD (Phase 6)

---

## 2. Frontend polling architecture

```
resume-maker form submit
  → startGeneration() POST /api/v1/generate
  → set activeJobId
  → useGenerationJob(jobId) refetchInterval 1500ms
  → on done: mergeTailoredResume + setGenerationResult + setStep("preview")
```

| Module | Role |
|---|---|
| `src/lib/api/generation.ts` | Pure payload mappers + fetch helpers |
| `src/hooks/useGenerationJob.ts` | TanStack Query polling hook |
| `src/components/QueryProvider.tsx` | App-wide `QueryClientProvider` |
| `src/store/useResumeStore.ts` | `atsScore`, `coverLetter`, `generationMeta` (not persisted) |

### Field mapping

- Wizard `targetJobDescription` → API `job_description` (not stored inside `resume_data`)
- `profilePic` (File) stripped before POST — re-upload required after refresh (unchanged Phase 1 rule)
- Pipeline result merged back with `mergeTailoredResume()` to preserve frontend-only fields

### Why TanStack Query for jobs but Zustand for draft

- Job status is **server-owned ephemeral state** — Query handles polling, cache keys, and stop conditions
- Resume draft remains **device-local** until explicit save (Phase 7 dashboard)
- **Alternatives rejected** — manual `setInterval` in the page (no shared stop/retry semantics)

---

## 3. Test coverage

| Suite | File | What it proves |
|---|---|---|
| pytest | `tests/test_api_jobs.py` | 202 + job id, poll until done, 404 unknown job |
| pytest | `tests/conftest.py` | autouse `FakeRedis` patches `get_redis_client` (+ cache clear) |
| vitest | `src/lib/api/generation.test.ts` | Payload mapping, poll interval helpers |
| vitest | `src/store/useResumeStore.test.ts` | Generation result actions |

---

## 4. Environment

| Variable | Consumer |
|---|---|
| `NEXT_PUBLIC_API_URL` | Frontend FastAPI base (default `http://localhost:8000`) |
| `UPSTASH_REDIS_*` | Backend job store + provider router |

---

## 5. Deferred to later phases

- Rate limiting on `/generate` (architecture §12 — Redis sliding window by IP/user)
- Dashboard history UI for `generationMeta.latencies` (Phase 7)
- Replacing legacy `/api/enhance-resume` Next.js route (can remove once backend is deployed everywhere)
