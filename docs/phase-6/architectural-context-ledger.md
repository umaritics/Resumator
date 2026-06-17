# Phase 6 — Architectural Context Ledger

**Objective:** CI/CD automation, Cloud Run deployment scaffolding, and infrastructure cost caps.

**Status:** Complete (GCP secrets + billing kill switch are manual one-time setup)

---

## 1. GitHub Actions — `ci.yml`

Runs on every pull request and push to `main`:

| Job | Steps |
|---|---|
| `frontend` | `npm ci` → `npm run lint` → `npm test` (Vitest) |
| `backend` | `pip install` → `ruff check` → `pytest` |

Backend job injects dummy env vars (same pattern as `tests/conftest.py`) so Settings
validation passes with zero external I/O.

---

## 2. GitHub Actions — `deploy-backend.yml`

Triggers on push to `main` when `backend/**` changes (or manual `workflow_dispatch`).

| Step | Detail |
|---|---|
| Auth | Workload Identity Federation — no long-lived GCP JSON key in GitHub |
| Build | `backend/Dockerfile` → Artifact Registry |
| Deploy | `gcloud run deploy` with `--min-instances=0 --max-instances=1` |

### Required GitHub secrets

| Secret | Example |
|---|---|
| `GCP_PROJECT_ID` | `my-gcp-project` |
| `GCP_SERVICE_ACCOUNT` | `github-deploy@my-gcp-project.iam.gserviceaccount.com` |
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | `projects/123/locations/global/workloadIdentityPools/github/providers/github` |

After first deploy, set Cloud Run env vars (`SUPABASE_URL`, `UPSTASH_*`, `GEMINI_API_KEY`,
`GROQ_API_KEY`, `CORS_ORIGINS`) via console or `gcloud run services update`.

Frontend deploy remains Vercel Git integration — no extra workflow.

---

## 3. Docker image (`backend/Dockerfile`)

- Python 3.12 slim base
- Listens on port **8080** (Cloud Run default)
- Copies only `app/` + `requirements.txt` — tests excluded via `.dockerignore`

---

## 4. Cost caps (manual GCP console)

Structural cap: `--max-instances=1` on Cloud Run (enforced in deploy workflow).

Automated kill switch (ARCHITECTURE.md §15.3):

1. Billing → Budgets → $1 project budget with Pub/Sub notifications
2. Cloud Function subscribed to 100% alert → sets Cloud Run `max-instances=0`

Document exact console steps in GCP docs when implementing — UI labels change over time.

---

## 5. UX hardening (pre-Phase-6 fixes)

| Issue | Fix |
|---|---|
| Raw Pydantic/API errors shown in form | `userMessages.ts` + generic copy only; details logged to console |
| Preview “Change Template” sent user to form | `templateReturnStep` returns to `preview` after template pick |

---

## 6. Deferred

- Secret Manager migration (Phase 8 in architecture)
- Vercel preview env wiring for `NEXT_PUBLIC_API_URL` pointing at Cloud Run URL
- Billing Cloud Function source code in-repo (optional infra module)
