# Contributing to elasticlink

Thank you for considering a contribution. This document describes the design principles that shape elasticlink and the workflow for submitting changes. For scope questions ("should this land in v1 or v1.1?"), see [ROADMAP.md](ROADMAP.md).

## Guiding Principle

**Own the shape. Borrow the options.**

elasticlink's value is a type-safe, mapping-aware fluent API over Elasticsearch DSL. To deliver that value without drowning in maintenance, we follow a strict rule about *what* we hand-roll and *what* we pass through from `@elastic/elasticsearch`.

- **Own** (hand-roll): the **structural** types — what methods exist, what fields they accept given the user's mapping schema, how clauses compose. Field-name parameters must be constrained by the mapping generic `M` via projections like `TextFields<M>`, `KeywordFields<M>`, `DenseVectorFields<M>`, etc. This is where we add value — a typo in a field name should fail at compile time.
- **Borrow** (passthrough): the **leaf option bags** from `@elastic/elasticsearch` — `QueryDslMatchQuery`, `IndicesIndexSettings`, `AnalysisAnalyzer`, `BulkUpdateAction`, and so on. Use `Omit<ElasticType, 'fieldsBuilderOwns'>` when the builder controls certain fields; otherwise re-export the full type.

The test for "should I hand-roll this?" is: **can a field-name typo slip through here?** If yes, own it. If no, pass through. Every hand-redeclared field that duplicates an Elastic type is a maintenance liability that drifts on every ES minor release.

### The three axes

We balance three concerns — none can dominate:

1. **Type fidelity** — how closely our types track `@elastic/elasticsearch`
2. **Ergonomics** — chaining, autocomplete, mapping-aware narrowing
3. **Maintainability** — how little churn we absorb when ES ships a new minor

Resist the urge to wrap everything. Divergence from Elastic's types is a tax you pay every release.

## The Per-Method Rubric

Every builder method should pass three questions:

1. **Field names** — are field-name parameters constrained by `M` via the correct `FieldsOfType` projection?
2. **Options bag** — is the `options?` parameter `Omit<ElasticOptionType, 'fieldsBuilderOwns'>` or an equivalent passthrough? No hand-redeclared fields that already exist on the Elastic type.
3. **Return type** — does the method return the correct builder (`QueryBuilder<M>` vs `ClauseBuilder<M>` vs a specialized sub-builder) so chaining stays sound?

If a PR adds or changes a builder method, the description should state how the method answers each of these.

## `any` Triage

Every `any` in the codebase falls into one of three buckets. Classify yours before adding it, and comment the bucket in the code:

- **Bucket 1 — Variance escape hatch.** Internal factory patterns where a union type would make every method signature unreadable (see `createClauseMethods` in [src/query.builder.ts](src/query.builder.ts) around line 32). These are acceptable if internal and commented. Don't add new ones without justification.
- **Bucket 2 — Missing Elastic type.** "I couldn't find the Elastic type." **Not acceptable.** Find the real `QueryDsl*` / `Mapping*` / `Analysis*` type and use it.
- **Bucket 3 — Elastic type too loose.** Elastic's type is wider than what our ergonomics need. **Wrap, don't replace** — keep the Elastic type as an upper bound and intersect a stricter shape on top. Don't hand-redeclare from scratch.

## The Field Helper Exception

Field helpers (`text()`, `keyword()`, `date()`, etc.) are the single documented exception to "borrow the options." They expose curated option interfaces rather than `Omit<MappingXxxProperty, 'type'>`.

**Why:** field helpers are the most user-facing API in the library. A curated IDE tooltip showing 10 commonly-used options reads better than a sprawling union of 25 options, half of which are edge cases. The exception is justified per-helper in the curated interface definitions.

**What this means for contributors:**

- When extending a field helper's options, add each option explicitly to the curated interface with a brief comment explaining what it does.
- Do not replace the curated interfaces with raw `Omit<>` of Elastic types.
- If you find a commonly-used option missing from a helper, add it — that's a bug in the curation, not a justification for replacing the approach.

## Testing Strategy

Tests follow the `test-code-quality` philosophy: **test at the right level; raise up when unit tests would just duplicate integration coverage.**

### Unit tests ([src/__tests__/](src/__tests__/))

Prefer **broad-swathe** tests over many tiny ones. For each builder method, we want one "kitchen-sink" test that exercises every supported option in a single snapshot.

Rationale: "DRY is negotiable" — the *behavior* under test is "builder method X correctly passes through every supported option." That's one behavior, even with 15 options. A single well-named test (`passesAllMatchQueryOptions`) with one snapshot is more scannable, fails more loudly, and costs less to maintain than 15 separate tests.

Reserve small focused tests for **correctness bugs**, where each fix should have a test that fails loudly and obviously if the bug regresses.

**Type tests** live alongside behavioral tests. Use `@ts-expect-error` for negative cases. Match the style already in the repo.

### Integration tests ([src/__tests__/integration/](src/__tests__/integration/))

**Major functionality only.** One integration test per feature *area* touched, not per option. Verify the built DSL round-trips through a real ES 9.x instance and returns sensible results.

**Do not** re-cover every option at integration level — unit snapshots are the contract for options; integration proves the contract holds against real ES.

Integration tests run serially against a single ES instance (see `vitest.integration.config.ts` — `fileParallelism: false`). Run the compose file first: `docker compose up -d`.

### Shared rules

- Realistic test data — use fixtures from [src/__tests__/fixtures/](src/__tests__/fixtures/) where possible, not `foo`/`bar`.
- Test naming as behavior: `passesAllMatchQueryOptions`, not `testMatch`.
- Fail-loud assertions; expected errors mocked to quiet noise.
- Snapshots inline for small outputs (< ~20 lines); separate snapshot files for large DSL dumps.

## Code Style

The library enforces a strict functional style via `eslint-plugin-functional`. See [CLAUDE.md](CLAUDE.md) for the full list, but the highlights:

- No classes, no `this`, no inheritance
- No `let`, no mutation, no `if`/`else` statements, no `switch`, no loops
- No `throw` / `try`-`catch` in library code
- Immutable state: every chain method spreads and returns a fresh state object
- ESM with explicit `.js` imports (Node's ESM resolution requirement)

These rules apply to `src/**/*.ts` but **not** to `src/__tests__/**`, which uses a vitest-specific ruleset.

## Development Workflow

### Quick start

```bash
npm install
npm run type-check    # tsc --noEmit
npm run lint          # eslint src --ext .ts
npm test              # vitest run (unit only)
npm run format:check  # prettier
```

Single test file or filter by name:

```bash
npx vitest run src/__tests__/query-builder.test.ts
npx vitest run -t "passesAllMatchQueryOptions"
```

### Integration tests

```bash
docker compose up -d        # ES 9.3.0 on localhost:9200
npm run test:integration
```

### Before opening a PR

```bash
npm run type-check && npm run lint && npm test && npm run format:check
```

For changes that touch builders in Phases 1, 2, 5, or 7 (see [ROADMAP.md](ROADMAP.md)), also run `npm run test:integration`.

## PR Checklist

Before requesting review, confirm:

- [ ] Every new or changed builder method passes the three rubric questions (field names constrained / options bag is passthrough / return type correct).
- [ ] No new Bucket-2 `any`s. Any new `any` is classified in a code comment with the bucket number.
- [ ] Option types use `Omit<ElasticType, '...'>` rather than hand-redeclared fields — unless this is a field helper (see exception above).
- [ ] Broad-swathe unit tests cover all new options in a single test per method.
- [ ] Integration test added only if the change affects runtime behavior against real ES.
- [ ] `CHANGELOG.md` updated with an entry under `Unreleased` in Keep-a-Changelog format.
- [ ] `ROADMAP.md` updated if scope decisions change (e.g. a deferred feature is now landing, or a new deferral is added).
- [ ] `npm run type-check && npm run lint && npm test && npm run format:check` all pass.

## Scope Questions

If you're unsure whether a feature belongs in the current version, belongs in a future version, or belongs in the library at all, read [ROADMAP.md](ROADMAP.md) first. It documents what's planned, what's deferred (and why), and what we've decided not to implement (and why). If your feature isn't covered there, open an issue before sending a PR.

## Architecture Reference

See [CLAUDE.md](CLAUDE.md) for high-level architecture notes — the core pattern (mapping-aware generics), the builder module layout, and the shared `createClauseMethods` factory. It is the best starting point for understanding the codebase.
