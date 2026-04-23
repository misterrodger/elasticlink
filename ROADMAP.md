# elasticlink Roadmap

This document is the living source of truth for scope decisions. For the stable principles and rubric that govern *how* we make these decisions, see [CONTRIBUTING.md](CONTRIBUTING.md).

Sections:

1. **Planned for v1.1+** — features deferred from v1 with rationale.
2. **Won't do (and why)** — decisions *not* to implement, to prevent re-litigation.
3. **Out-of-scope by design** — architecturally outside elasticlink's value prop.

For everything shipped in v1.0, see [CHANGELOG.md](CHANGELOG.md) `[1.0.0-beta.2]`.

---

## Planned for v1.1+

Features deferred from v1. Each entry includes a brief rationale and a pointer to the relevant Elastic type/API so we don't have to re-research later.

### Retrievers API

- **`RetrieverContainer`, `KnnRetriever`, `StandardRetriever`, `RRFRetriever`, `TextSimilarityReranker`.** *Why deferred:* architectural change to the top-level query shape. Target v1.2 once the core v1 surface has stabilized.

---

## Won't do (and why)

Decisions not to implement, with reconsider-conditions. This section prevents re-litigation.

### Index management orchestration methods

**What:** `putMapping`, `putSettings`, `updateAliases`, template operations exposed as builder methods that call the client.

**Why not:** elasticlink's value is *building DSL objects*, not orchestrating client calls. Users call `client.indices.create({ ...builder.build() })` themselves. Mixing in orchestration duplicates `@elastic/elasticsearch` and blurs the library's purpose.

**Reconsider if:** a compelling ergonomic argument emerges that genuinely adds value beyond what the client already provides.

### Response parsing / result shaping

**What:** wrappers that transform `SearchResponse<T>` into user-friendly shapes.

**Why not:** Same reason — that's the client's job. elasticlink is a request builder. Response shaping is a separate concern with very different ergonomic trade-offs.

**Reconsider if:** never, under the current value prop.

### Connection management, retry policies, circuit breakers

**Why not:** Out of scope. The Elasticsearch client owns transport concerns.

### Runtime query validation

**What:** runtime assertions that built queries are well-formed.

**Why not:** Zero runtime overhead is a core value prop. Type-level validation is the commitment — if something compiles, the shape is correct.

**Reconsider if:** never, under the current value prop.

### Deprecated Elasticsearch clauses

**What:** `common_terms`, `type`, and other clauses removed from recent Elasticsearch versions.

**Why not:** Adding removed clauses would be harmful — they don't work against modern ES.

---

## Out-of-scope by design

Features that are architecturally outside elasticlink's value prop and will not be added regardless of demand:

- **Client orchestration** — elasticlink builds DSL; the client executes it.
- **Connection management** — transport is the client's domain.
- **Response parsing** — elasticlink's contract ends at `.build()`.
- **Runtime validation** — type-level safety only; zero runtime overhead is a commitment.
