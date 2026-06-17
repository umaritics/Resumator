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
transitions.

### Configuration

- Config: `vitest.config.ts` (path alias `@/` → `src/`)
- Environment: `jsdom` (provides `localStorage` for Zustand persist)

### Running

```bash
npm test              # single run (CI mode)
npx vitest            # watch mode during development
npx vitest src/store/useResumeStore.test.ts   # single file
```

### Interpreting results

| Test area | Pass means | Fail often indicates |
|---|---|---|
| `updateResumeData` | Partial patches merge without clobbering siblings | Spread/regression in store reducer |
| `updateListItem` / `addListItem` | Nested `additional.*` lists mutate correctly | Wrong field routing between top-level vs `additional` |
| `persists ... localStorage` | `partialize` + storage key write async | Missing `await` on persist tick; wrong storage key |
| Hydration (manual QA) | Resume maker shows content after refresh | `onFinishHydration` not awaited in page |

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
| `test_generate_valid_body_returns_not_implemented` | Route reached; business logic still placeholder | Router prefix or validation order bug |

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

The Redis client module lazy-initializes; Phase 2 tests do not call Redis yet. Phase 3+
should use `unittest.mock.patch` on `app.services.redis.get_redis` or a fakeredis
HTTP shim:

```python
from unittest.mock import MagicMock, patch

@pytest.fixture
def mock_redis():
    client = MagicMock()
    client.get.return_value = None
    client.set.return_value = True
    with patch("app.services.redis.get_redis", return_value=client):
        yield client
```

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
