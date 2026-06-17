# Phase 2 — Architectural Context Ledger

**Objective:** FastAPI security boundary with validated contracts, JWT verification, and
Redis client — no LangGraph business logic yet.

**Status:** Complete (placeholders return HTTP 501)

---

## 1. FastAPI application layout

```
backend/app/
  main.py                 App factory, CORS, router mounting, /health
  config.py               pydantic-settings env validation
  dependencies/auth.py    Supabase JWT (JWKS + test HS256)
  schemas/                ResumeData, JDAnalysis, ATSScore, job DTOs
  routers/v1/             OpenAPI-documented route placeholders
  services/redis.py       Upstash singleton
backend/tests/            pytest security + validation suite
```

### Why FastAPI over extending Next.js API routes

- LangGraph and agent tooling are Python-first; co-locating agents with Pydantic state
  avoids cross-language schema drift.
- Supabase JWT verification via JWKS belongs on a dedicated backend trust boundary, not
  in edge functions mixed with Gemini keys.
- **Rejected:** Node LangGraph (immature), monolithic Next.js API routes (no provider
  router isolation, harder Cloud Run agent scaling story).

---

## 2. JWT authentication layer

### Two verification modes (same dependency interface)

| Mode | When | Mechanism |
|---|---|---|
| **Production** | `SUPABASE_JWT_SECRET` unset | RS256 against `{SUPABASE_URL}/auth/v1/.well-known/jwks.json` |
| **Test / CI** | `SUPABASE_JWT_SECRET` set | HS256 with shared secret via `create_test_access_token()` |

### Dependencies

| Dependency | Behavior | Routes |
|---|---|---|
| `require_user_id` | 401 if missing/invalid Bearer | `/resumes`, `/generations` |
| `optional_user_id` | `None` if anonymous; validates token if present | `/generate`, `/jobs/{id}` |

### Expected side-effects

- Invalid Bearer on optional routes → **401** (strict validation when header supplied).
- Missing Bearer on optional routes → handler receives `user_id=None` (anonymous try flow).
- JWKS client cached in-process (`PyJWKClient`) — first RS256 request may fetch keys.

### Why not custom crypto or service-role JWT

- Supabase documents JWKS as the supported verification path for third-party APIs.
- Service role key must never appear in Authorization headers from browsers.
- **Rejected:** decoding JWT without signature verification (debug anti-pattern).

See module docstring: `backend/app/dependencies/auth.py`

---

## 3. Pydantic schemas & OpenAPI

Every v1 router declares explicit `responses={200|401|422|501|500}` so Swagger UI at
`/docs` stays synchronized with pytest expectations.

| Model | Purpose |
|---|---|
| `ResumeData` | Wizard + Postgres `resumes.data` JSONB |
| `JDAnalysis` | JD agent output + Redis cache value |
| `ATSScore` | ATS agent composite score |
| `GenerateRequest` | POST `/generate` body with `requested` flags |
| `JobResponse` | GET `/jobs/{id}` polling shape (Phase 5) |

Field descriptions on models propagate to OpenAPI schema components automatically.

---

## 4. Upstash Redis client

`services/redis.py` exposes `get_redis_client()` — lazy HTTP client, no connection pool
required (serverless-friendly).

**Phase 2 scope:** client wired + env validated; **no keys read/written** until Phase 3
(rate limits) and Phase 5 (job status).

Key prefixes (from architecture):

- `job:{uuid}` — async polling
- `ratelimit:{user_or_ip}:{minute}` — sliding window
- `jd_analysis:{sha256}` — exact-match JD cache

---

## 5. Placeholder route policy

Routes raise `HTTPException(501)` instead of `NotImplementedError` so:

- OpenAPI documents failure explicitly.
- pytest asserts stable status codes without try/except handlers.
- Cloud Run health checks remain independent (`GET /health` → 200).

Implementation phases:

| Route | Implemented in |
|---|---|
| POST `/generate` | Phase 4 (LangGraph) + Phase 5 (background task) |
| GET `/jobs/{id}` | Phase 5 (Redis job hash) |
| `/resumes`, `/generations` | Phase 5–7 (Supabase service role or user JWT + RLS) |

---

## 6. Running locally

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill Supabase + Upstash values
uvicorn app.main:app --reload --port 8000
# Swagger UI → http://localhost:8000/docs
pytest -v
```

---

## 7. Handoff to Phase 3

Next: `ProviderRouter` with Redis-backed rate windows, file extraction utilities, and
`FakeLLMProvider` — still no LangGraph graph assembly.

See [Testing Guide](../testing.md) for JWT and Redis mock patterns.
