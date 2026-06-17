# Phase 4 — Architectural Context Ledger

**Objective:** LangGraph multi-agent pipeline with timed metrics, cache-aware skips, and
FakeLLMProvider end-to-end tests.

**Status:** Complete — wired to `/api/v1/generate` in Phase 5

---

## 1. Pipeline state (`app/pipeline/state.py`)

`PipelineState` TypedDict mirrors ARCHITECTURE.md §7.1:

| Field | Set by |
|---|---|
| `raw_resume_text` | Upload path (document parser, Phase 3) |
| `parsed_resume` | Form data, cache, or `parser_agent` |
| `job_description` | Frontend wizard |
| `jd_analysis` | Cache or `jd_analyzer_agent` |
| `tailored_resume` | `tailoring_agent` |
| `ats_score` | `ats_scoring_agent` (optional) |
| `cover_letter` | `cover_letter_agent` (optional) |
| `requested` | `{ats_score, cover_letter}` flags |
| `meta` | All agents — latencies, providers, cache_hits |

Pydantic models (`ResumeData`, `JDAnalysis`, `ATSScore`) live in state as objects;
LangGraph merges dict patches between nodes.

---

## 2. Agent modules (`app/pipeline/agents/`)

Each agent is a **pure async function** `(state, router) -> dict patch`:

| Agent | Skips when | LLM output shape |
|---|---|---|
| `parser_agent` | `parsed_resume` set or `cache_hits.resume_parse` | `ResumeData` JSON |
| `jd_analyzer_agent` | `jd_analysis` set or `cache_hits.jd_analysis` | `JDAnalysis` JSON |
| `tailoring_agent` | never (requires `parsed_resume`) | `ResumeData` JSON |
| `ats_scoring_agent` | `requested.ats_score` false | `ATSScore` JSON |
| `cover_letter_agent` | `requested.cover_letter` false | plain text |

All JSON agents use `run_timed_llm_call()` which:

1. Starts `time.perf_counter()`
2. Calls `ProviderRouter.generate(prompt)`
3. Parses response with Pydantic
4. Writes `meta.latencies[node_name]` and `meta.providers[node_name]`

### Why separate agent modules

- Unit-testable prompts and skip logic without compiling the graph.
- Phase 5 background job imports `build_pipeline_graph(router)` unchanged.
- **Alternatives rejected** — monolithic chain function (untestable, no skip hooks).

---

## 3. LangGraph topology (`app/pipeline/graph.py`)

```
START
  → preprocess_parallel   (asyncio.gather: parser + jd when eligible)
  → tailoring_agent
  → postprocess_parallel    (asyncio.gather: ATS + cover letter when requested)
  → END
```

### Why orchestration nodes instead of raw Send fan-out

LangGraph `Send` fan-out to a shared downstream node can invoke tailoring **twice**
(one edge per branch). Orchestration nodes preserve **architecture parallel latency**
(via `asyncio.gather`) with a **single join** before the next sequential stage.

Independent agent functions remain separate files — orchestration only batches them.

### Cache skip routing (`app/pipeline/routing.py`)

Skip predicates read populated state + `meta.cache_hits` **before** LLM calls. Phase 5
Redis/Postgres cache loaders pre-fill `parsed_resume` / `jd_analysis` and set
`cache_hits` so graph nodes become no-ops (zero tokens).

---

## 4. State merge (`app/pipeline/merge.py`)

Parallel preprocess/postprocess patches merge `meta.latencies` and `meta.providers`
dicts without clobbering sibling agent entries.

---

## 5. Dependencies

```
langgraph>=1.2.0,<1.3.0
langchain-core>=1.4.0,<2.0.0
```

Pinned for compatibility with LangGraph 1.x callback manager (avoids `langchain.debug`
AttributeError on mismatched langchain-core 0.3).

---

## 6. Testing strategy

`tests/test_pipeline_graph.py` queues JSON/text responses on a single `FakeLLMProvider`
in FIFO order matching agent invocation sequence.

See [Testing Guide](../testing.md) § Phase 4.

---

## 7. Handoff to Phase 5

Wire `build_pipeline_graph()` into `POST /api/v1/generate` background task; persist
`meta` to Redis job hash and optional `generations` row.
