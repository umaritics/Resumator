# Resumator V2 — Engineering Documentation

This folder is the repository's **shared mental model**: architectural rationale, test
runbooks, and phase-by-phase implementation ledgers. It complements the high-level
`ARCHITECTURE.md` spec (local, gitignored) with **maintainer-facing context** that
stays version-controlled.

## Index

| Document | Scope |
|---|---|
| [Phase 1 — Architectural Context Ledger](./phase-1/architectural-context-ledger.md) | Supabase schema, RLS, auth SSR, Zustand store |
| [Phase 2 — Architectural Context Ledger](./phase-2/architectural-context-ledger.md) | FastAPI skeleton, JWT deps, Redis client, OpenAPI |
| [Phase 3 — Architectural Context Ledger](./phase-3/architectural-context-ledger.md) | ProviderRouter failover, document extraction, FakeLLM |
| [Phase 4 — Architectural Context Ledger](./phase-4/architectural-context-ledger.md) | LangGraph pipeline, agent nodes, timed meta metrics |
| [Phase 5 — Architectural Context Ledger](./phase-5/architectural-context-ledger.md) | Async jobs, Redis polling, TanStack Query, wizard integration |
| [Phase 6 — Architectural Context Ledger](./phase-6/architectural-context-ledger.md) | GitHub Actions CI, Cloud Run deploy, cost caps |
| [Testing Guide](./testing.md) | Vitest, pytest, JWT mocking, Redis mocking |

## Documentation protocol (all phases)

1. **Architectural Context Ledger** — append per-phase `docs/phase-N/architectural-context-ledger.md` explaining *why* non-obvious patterns were chosen.
2. **Module docstrings** — JSDoc (frontend) / PEP 257 (backend) on every module boundary; no line-by-line noise.
3. **OpenAPI contracts** — FastAPI routes declare status codes, security scopes, and Pydantic field descriptions (Phase 2+).
4. **Test mappings** — update `docs/testing.md` whenever a new suite is introduced.
