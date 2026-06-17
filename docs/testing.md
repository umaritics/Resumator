# Testing Guide

Central runbook for all automated test suites. Update this file whenever a new suite or
mock pattern is introduced.

---

## Quick reference

| Suite | Command | Environment |
|---|---|---|
| Frontend (Vitest) | `npm test` | Node + jsdom |
| Frontend watch | `npx vitest` | Node + jsdom |
| Backend (pytest) | `cd backend && pytest` | Python 3.12+ |
| Backend verbose | `cd backend && pytest -v` | Python 3.12+ |
| All (local) | `npm test && cd backend && pytest` | Both |

---

## Frontend — Vitest (`src/**/*.test.ts`)

### Purpose

Unit-test **client-side state** that must not require a running browser or Supabase
project. Phase 1 covers `useResumeStore` list mutations, persistence, and wizard step
transitions. Phase 5 adds generation API helpers and optional pipeline output fields on
the store.

### Configuration

- Config: `vitest.config.ts` (path alias `@/` → `src/`)
- Environment: `jsdom` (provides `localStorage` for Zustand persist)

### Running

```bash
npm test              # single run (CI mode)
npx vitest            # watch mode during development
npx vitest src/store/useResumeStore.test.ts   # single file
npx vitest src/lib/api/generation.test.ts     # Phase 5 payload + polling helpers
```

### Interpreting results

| Test area | Pass means | Fail often indicates |
|---|---|---|
| `updateResumeData` | Partial patches merge without clobbering siblings | Spread/regression in store reducer |
| `updateListItem` / `addListItem` | Nested `additional.*` lists mutate correctly | Wrong field routing between top-level vs `additional` |
| `persists ... localStorage` | `partialize` + storage key write async | Missing `await` on persist tick; wrong storage key |
| Hydration (manual QA) | Resume maker shows content after refresh | `onFinishHydration` not awaited in page |

### Phase 5 — generation client (`src/lib/api/generation.test.ts`)

| Test | Pass means | Fail often indicates |
|---|---|---|
| `buildGeneratePayload` | JD mapped to `job_description`; File field stripped | Forgot to omit frontend-only keys |
| `mergeTailoredResume` | Pipeline output preserves `targetJobDescription` | Spread order clobbering wizard fields |
| `jobPollIntervalMs` | Returns `false` on terminal status | Polling never stops on `done` |

TanStack Query hook (`useGenerationJob`) is covered indirectly via the pure helpers above;
component-level polling is validated manually against a running FastAPI dev server.

### Mocking external dependencies (frontend)

**Supabase auth** — not mocked in Phase 1 store tests (store has zero Supabase
imports). Component tests in later phases should mock `@/lib/supabase/client`:

```typescript
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },
  }),
}));
```

---

## Backend — pytest (`backend/tests/`)

> **Phase 2+.** Run after `pip install -r backend/requirements.txt`.

### Purpose

Integration-test the FastAPI **security boundary**: JWT enforcement on protected routes,
Pydantic validation (422), and placeholder route wiring — without live Supabase, Redis,
or LLM calls.

### Configuration

- Dependencies: `backend/requirements.txt`
- Fixtures: `backend/tests/conftest.py`
- Default env: test overrides inject dummy `SUPABASE_URL`, `UPSTASH_REDIS_*`

### Running

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
pytest
pytest tests/test_api_auth.py -v
```

### Interpreting results

| Test | Pass means | Fail often indicates |
|---|---|---|
| `test_resumes_unauthenticated_returns_401` | Protected router rejects missing Bearer | Auth dependency not attached |
| `test_generate_invalid_body_returns_422` | Pydantic rejects malformed generate payload | Schema too permissive |
| `test_generate_valid_body_no_longer_returns_501` | Route reached; returns 202 job id | Router prefix or validation order bug |

### Phase 3 — engine (`tests/test_provider_router.py`, `tests/test_document_parser.py`)

```bash
cd backend
pytest tests/test_provider_router.py -v    # LLM failover + FakeRedis
pytest tests/test_document_parser.py -v    # PDF/DOCX extraction
```

| Test | Pass means | Fail often indicates |
|---|---|---|
| `test_router_fails_over_on_429` | Gemini 429 → cooldown → Groq success | Failover order or cooldown key typo |
| `test_router_skips_provider_at_sliding_window_limit` | Quota-full key bypassed | Usage key bucket math (`time.time() // 60`) |
| `test_extract_docx_returns_paragraph_text` | python-docx path works | Normalization stripping all text |
| `test_extract_pdf_returns_text` | pdfplumber reads `tests/fixtures/minimal.pdf` | Corrupt fixture PDF |

#### Mocking Redis for ProviderRouter

Use `tests.fakes.redis.FakeRedis` — implements `get`, `set`, `incr`, `expire`:

```python
from tests.fakes.redis import FakeRedis
from app.providers.fake import FakeLLMProvider
from app.providers.router import ProviderCandidate, ProviderRouter

router = ProviderRouter(candidates=[...], redis=FakeRedis())
```

Do **not** point unit tests at real Upstash — keep CI at zero external I/O.

#### FakeLLMProvider scripting

```python
from app.providers.exceptions import ProviderRateLimitError

primary = FakeLLMProvider([ProviderRateLimitError("quota")], name="gemini")
secondary = FakeLLMProvider(["success-json"], name="groq")
```

Queue order is FIFO; exceptions propagate to the router failover loop.

### Phase 4 — LangGraph pipeline (`tests/test_pipeline_graph.py`)

```bash
cd backend
pytest tests/test_pipeline_graph.py -v
```

| Test | Pass means | Fail often indicates |
|---|---|---|
| `test_full_pipeline_runs_all_agents_and_records_latencies` | All 5 agents run; `meta.latencies` populated | FakeLLM response queue out of order |
| `test_pipeline_skips_parser_when_resume_already_parsed` | Preloaded `parsed_resume` bypasses parser | Skip predicate not checking state |
| `test_pipeline_skips_jd_analyzer_on_cache_hit` | Cached JD skips analyzer node | `cache_hits.jd_analysis` ignored |
| `test_pipeline_omits_optional_agents_when_not_requested` | ATS/cover letter skipped when flags false | Postprocess always invoking agents |

#### FakeLLMProvider response queue ordering

When running the **full** pipeline with both optional agents enabled, queue responses
in call order:

1. `parser_agent` → ResumeData JSON
2. `jd_analyzer_agent` → JDAnalysis JSON
3. `tailoring_agent` → ResumeData JSON
4. `ats_scoring_agent` → ATSScore JSON
5. `cover_letter_agent` → plain text

Use helpers in `tests/fixtures/pipeline_responses.py` for canonical sample payloads.

---

## Mocking JWT (backend)

Protected routes expect `Authorization: Bearer <supabase_access_token>`.

### In tests — dependency override

`conftest.py` provides `authenticated_client` by overriding `require_user_id`:

```python
app.dependency_overrides[require_user_id] = lambda: "00000000-0000-0000-0000-000000000001"
```

### Generating a local test token (optional integration)

For manual Swagger testing against a real Supabase project:

1. Sign in via the Next.js app.
2. DevTools → Application → Cookies → copy access token fragment, **or**
   `supabase.auth.getSession()` in browser console.
3. Paste as Bearer token in `/docs` Try it out.

**Do not commit real tokens.** CI uses dependency overrides, not live JWKS.

### JWKS verification (production path)

`backend/app/dependencies/auth.py` fetches
`{SUPABASE_URL}/auth/v1/.well-known/jwks.json` and validates RS256 signatures with
audience `authenticated`. Tests mock the verifier to avoid network calls.

---

## Mocking Upstash Redis (backend)

### In tests

`conftest.py` sets:

```python
os.environ.setdefault("UPSTASH_REDIS_REST_URL", "https://mock.upstash.io")
os.environ.setdefault("UPSTASH_REDIS_REST_TOKEN", "mock-token")
```

The Redis client module lazy-initializes; Phase 2 API tests do not call Redis. Phase 3+
router tests use `tests.fakes.redis.FakeRedis`. Phase 5 adds an **autouse** fixture in
`conftest.py` that clears `get_redis_client` LRU cache and returns `FakeRedis` for all
tests — no per-file patch required for job routes.

Integration tests that need custom Redis state should use the shared `fake_redis`
fixture. Legacy pattern (still valid for one-off patches):

```python
from unittest.mock import MagicMock, patch

@pytest.fixture
def mock_redis():
    client = MagicMock()
    client.get.return_value = None
    client.set.return_value = True
    client.incr.return_value = 1
    with patch("app.services.redis.get_redis_client", return_value=client):
        yield client
```

### Phase 5 — async jobs (`tests/test_api_jobs.py`)

```bash
cd backend
pytest tests/test_api_jobs.py -v
```

| Test | Pass means | Fail often indicates |
|---|---|---|
| `test_start_generation_returns_job_id` | POST returns 202 + UUID | Route still 501 or Redis not mocked |
| `test_poll_job_until_done` | Background task completes; result has tailored name | FakeLLM queue too short; BackgroundTasks not finishing in TestClient |
| `test_get_unknown_job_returns_404` | Missing Redis key → 404 | JobStore not wired to router |

`job_client` fixture patches `create_router_for_pipeline` to inject `FakeLLMProvider`
(two responses: JD analysis + tailored resume — parser skipped when form data preloads
`parsed_resume`).

### Local development

Set real values in `.env.local` (already present for Upstash). Backend reads the same
variable names via environment at Cloud Run deploy time — never from frontend bundles.

---

## CI alignment (Phase 6 preview)

Planned GitHub Actions jobs:

```yaml
# frontend
npm ci && npm test

# backend
pip install -r backend/requirements.txt && pytest
```

Both suites must pass with **zero external API calls**.
