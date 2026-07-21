# Phase 6 — Architectural Context Ledger

**Objective:** CI automation and cloud-agnostic container deployment.

**Status:** Complete (hosting is provider-agnostic; GCP deploy path removed)

---

## 1. GitHub Actions — `ci.yml`

Runs on every pull request and push to `main`:

| Job | Steps |
|---|---|
| `frontend` | `npm ci` → `npm run lint` → `npm test` (Vitest) |
| `backend` | `pip install` → `ruff check` → `pytest` |

Backend job injects dummy env vars (same pattern as `tests/conftest.py`) so Settings
validation passes with zero external I/O.

**No deploy workflow in GitHub.** Continuous deployment is handled by the container
host (Hugging Face Spaces, Render, later Azure Container Apps).

---

## 2. Cloud-agnostic Docker image (`backend/Dockerfile`)

| Concern | Behavior |
|---|---|
| Bind address | Always `0.0.0.0` |
| Port | `$PORT` env var, default `8000` |
| Base | `python:3.12-slim` |
| Process | `uvicorn app.main:app` |

```dockerfile
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
```

Same image works on:

| Host | Typical `$PORT` | Notes |
|---|---|---|
| Local Docker | `8000` | `docker run -p 8000:8000 -e PORT=8000 ...` |
| Hugging Face Spaces | `7860` | Space type: **Docker**; set secrets in Space settings |
| Render | assigned | Web Service from Dockerfile; set env vars in dashboard |
| Azure Container Apps | assigned | Later migration — same Dockerfile + env vars |

### Required runtime env vars

| Variable | Required |
|---|---|
| `SUPABASE_URL` | Yes |
| `UPSTASH_REDIS_REST_URL` | Yes |
| `UPSTASH_REDIS_REST_TOKEN` | Yes |
| `GEMINI_API_KEY` / `GROQ_API_KEY` | At least one |
| `CORS_ORIGINS` | Yes (frontend origin(s), comma-separated) |
| `PORT` | Optional (platform sets it) |

---

## 3. Why no GCP-specific wiring

GCP Billing / Cloud Run / WIF deploy were removed so the backend stays portable.
Nothing in `app/` imports GCP SDKs. Historical mentions of Cloud Run in older phase
ledgers are narrative only.

---

## 4. Hugging Face Spaces (current target)

1. Create a Space → **Docker** SDK
2. Point it at this repo’s `backend/` (or copy `Dockerfile` + `app/` + `requirements.txt`)
3. Add the env vars above as Space secrets / variables
4. After deploy, health check: `GET https://<space>.hf.space/health`
5. Set frontend `NEXT_PUBLIC_API_URL` to that Space base URL (no trailing slash)
6. Add the Space origin and your Vercel origin to `CORS_ORIGINS`

Free Spaces may sleep when idle — first request after sleep can be slow.

---

## 5. Azure Container Apps (later)

No Dockerfile changes required. Create an ACA app from the same image, inject the
same env vars, and update `NEXT_PUBLIC_API_URL` + `CORS_ORIGINS`.

---

## 6. UX hardening (pre-Phase-6 fixes)

| Issue | Fix |
|---|---|
| Raw Pydantic/API errors shown in form | `userMessages.ts` + generic copy only |
| Preview “Change Template” sent user to form | `templateReturnStep` returns to `preview` |
