# Phase 3 — Architectural Context Ledger

**Objective:** Resilient LLM routing and deterministic document text extraction — no
LangGraph assembly yet.

**Status:** Complete

---

## 1. ProviderRouter (`app/providers/router.py`)

### Structural assumptions

- Agents never call Gemini/Groq directly — all LLM I/O goes through `ProviderRouter.generate()`.
- Each **candidate** is a tuple of `(provider_name, key_id, LLMProvider, limit_per_minute)`.
- Redis is the source of truth for **sliding-window usage** and **post-429 cooldowns**.

### Redis key patterns

| Key | TTL | Purpose |
|---|---|---|
| `provider_usage:{name}:{key_id}:{minute_bucket}` | 60s | Incremented on each attempt; skip when `>= limit_per_minute` |
| `provider_cooldown:{name}:{key_id}` | 60s | Set after 429 or timeout; candidate excluded until expiry |

`minute_bucket = int(time.time()) // 60` — cheap sliding window without sorted sets.

### Failover algorithm

1. Filter candidates **not in cooldown**.
2. Rotate eligible list from round-robin cursor.
3. Skip candidates at quota (`usage >= limit`).
4. Increment usage → call `provider.generate()`.
5. On success → advance round-robin, return `(text, provider_name)`.
6. On `ProviderRateLimitError` / `ProviderTimeoutError` → set cooldown, try next.
7. If none succeed → raise `AllProvidersExhaustedError`.

### Expected side-effects

- A failed primary leaves a **60s cooldown** key even when secondary succeeds.
- Usage counters increment on **attempt**, not only success — prevents hammering a dying key.
- Round-robin advances only after **success** (failed attempts do not skew rotation).

### Why this design

- **Redis counters vs in-process** — Cloud Run may scale (capped at 1 instance for MVP, but
  counters still survive process restarts and align with architecture §8).
- **Cooldown separate from usage** — 429 means “stop trying this key now”; usage limit means
  “spread free-tier quota evenly”.
- **Alternatives rejected** — single provider with retry backoff (burns quota on one platform);
  Celery priority queues (overkill per §19).

---

## 2. LLM provider adapters

| Module | Role |
|---|---|
| `gemini.py` | `gemini-2.5-flash` via Generative Language API |
| `groq.py` | `llama-3.3-70b-versatile` via OpenAI-compatible endpoint |
| `fake.py` | Queue-driven double for pytest / Phase 4 graph tests |
| `factory.py` | Builds production router from `Settings` + Upstash client |

HTTP **429** and **timeouts** map to router-visible exceptions; other HTTP errors bubble as
`httpx` errors (hard failure for that attempt, no cooldown unless wrapped).

### Why Gemini primary, Groq secondary

Matches existing Next.js integration and architecture cost strategy: Gemini for structured
JSON quality; Groq separate free quota for failover.

---

## 3. Document parser (`app/services/document_parser.py`)

### Purpose

Replace client-side `pdf-parse` (PDF-only) with server-side **pdfplumber + python-docx** so
both advertised upload formats extract reliably before `parser_agent` (Phase 4).

### Behavior

- Extension from filename (`.pdf`, `.docx` only).
- Returns normalized plain text (blank lines stripped).
- Raises `UnsupportedDocumentError` for other extensions.
- Raises `ValueError` when parser runs but text is empty.

### Why not Gemini native PDF input

Architecture §5 — burns tokens on every upload; deterministic extraction is free and
cacheable by file hash (`resume_parse:{sha256}` in Phase 5).

---

## 4. Configuration

| Env var | Default | Purpose |
|---|---|---|
| `GEMINI_API_KEY` | — | Enables Gemini candidate |
| `GROQ_API_KEY` | — | Enables Groq candidate |
| `GEMINI_RPM_LIMIT` | 15 | Per-minute cap (tune to free tier) |
| `GROQ_RPM_LIMIT` | 30 | Per-minute cap |

At least one LLM key required when calling `build_provider_router()`.

---

## 5. Test fixtures

| Asset | Location |
|---|---|
| `FakeRedis` | `tests/fakes/redis.py` — in-memory Upstash subset |
| `minimal.pdf` | `tests/fixtures/minimal.pdf` — valid one-page PDF for pdfplumber |
| DOCX samples | Built inline in `test_document_parser.py` via python-docx |

---

## 6. Handoff to Phase 4

Next: LangGraph `PipelineState`, agent nodes calling `ProviderRouter.generate()`, and
`FakeLLMProvider` wired into end-to-end graph tests — still no live API in CI.

See [Testing Guide](../testing.md) § Phase 3 suites.
