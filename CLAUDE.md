# Architecture

High-level notes for anyone (human or agent) working on elasticlink's internals. For the design
*rules* — the per-method rubric, `any`-triage, testing strategy — see [CONTRIBUTING.md](CONTRIBUTING.md).
For scope decisions (what belongs in which version), see [ROADMAP.md](ROADMAP.md).

## Core pattern: mapping-aware generics

Everything is generic over a mapping schema `M extends Record<string, FieldTypeString>`. You define
your fields once with `mappings({ ... })`, and that `M` flows through every builder.

Field-name parameters are constrained by **projections over `M`** — `TextFields<M>`,
`KeywordFields<M>`, `NumericFields<M>`, `DenseVectorFields<M>`, and friends — defined in
[src/mapping.types.ts](src/mapping.types.ts) and re-exported from [src/index.ts](src/index.ts). This
is where the library earns its keep: `match()` only accepts text fields, `term()` only
keyword/numeric, `knn()` only dense-vector fields, and a field-name typo fails at **compile time**.
There is zero runtime cost — `.build()` emits plain Elasticsearch DSL.

## "Own the shape, borrow the options"

The one guiding principle. We hand-roll the **structural** types (what methods exist, what fields
they accept given `M`, how clauses compose) and pass through the **leaf option bags** from
`@elastic/elasticsearch` (`QueryDslMatchQuery`, `IndicesIndexSettings`, `AnalysisAnalyzer`, …). This
keeps us in lockstep with Elasticsearch minor releases with minimal churn. See CONTRIBUTING.md for
the full rubric and the `any`-triage buckets before adding either.

The one documented exception is **field helpers** (`text()`, `keyword()`, …), which expose curated
option interfaces rather than raw `Omit<>` passthroughs — because they're the most user-facing API
and a tidy tooltip matters. Again, see CONTRIBUTING.md.

## Module layout

Each area is a pair: `X.builder.ts` (the fluent, immutable API) + `X.types.ts` (its types).

| Area | Files | Entry |
| --- | --- | --- |
| Search / query | `query.builder.ts`, `query.types.ts`, `vector.types.ts` | `queryBuilder(schema)` |
| Aggregations | `aggregation.builder.ts`, `aggregation.types.ts` | `aggregations(schema)` |
| Mappings | `mapping.builder.ts`, `mapping.types.ts` | `mappings({ ... })` |
| Field helpers | `field.helpers.ts`, `field.types.ts` | `text()`, `keyword()`, … |
| Index management | `index-management.builder.ts`, `index-management.types.ts` | `indexBuilder()` |
| Bulk | `bulk.builder.ts`, `bulk.types.ts` | `bulk(schema)` |
| Multi-search | `multi-search.builder.ts`, `multi-search.types.ts` | `msearch(schema)` |
| Suggesters | `suggester.builder.ts`, `suggester.types.ts` | `suggest(schema)` |
| Settings presets | `settings.presets.ts` | `productionSearchSettings()`, … |

[src/index.ts](src/index.ts) is the **single public entry point** — every export the package ships
lives there. If it isn't exported from `index.ts`, it isn't public.

## The shared `createClauseMethods` factory

The clause methods (`match`, `term`, `range`, `geoDistance`, …) are defined **once** in
[src/query.builder.ts](src/query.builder.ts) (`createClauseMethods`, ~line 53) and reused in two
contexts via a `wrap` callback and an optional `qualifyField`:

- **Top-level `QueryBuilder`** passes `wrap = dsl => createQueryBuilder({ ...state, query: dsl })`
  (~line 241) — each clause returns a **new builder** so the chain continues.
- **`ClauseBuilder`** inside `.bool()` / `.nested()` passes `wrap = dsl => dsl` (~line 173) — each
  clause returns **raw DSL** for the bool/nested container to collect. Nested contexts also pass a
  `qualifyField` that prefixes the nested path, so inner field names are written relative
  (`'color'`, not `'variants.color'`).

The generic `R` captures the differing return type at each call site. `wrap`'s parameter is the
codebase's canonical **Bucket-1 `any`** (variance escape hatch) — a union there would make every
method signature unreadable. It's internal and commented; don't add new ones without justification.

## Immutability & style

Every chain method **spreads the current state and returns a fresh builder** — no mutation, ever.
The library is written in a strict functional style enforced by `eslint-plugin-functional`: no
classes, no `this`, no `let`, no `if`/`else`/`switch`/loops, no `throw` in library code, ESM with
explicit `.js` imports. These rules apply to `src/**/*.ts` but not to `src/__tests__/**`. The full
list and rationale are in CONTRIBUTING.md § Code Style.
