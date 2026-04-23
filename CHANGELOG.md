# Changelog

All notable changes to elasticlink will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [1.0.0-beta.2] - 2026-04-23

Additive release on top of `1.0.0-beta.1` — no breaking changes. Adds a CommonJS build alongside the existing ESM build and a small ergonomics helper for vanilla-JS consumers. ESM users are unaffected; `require('elasticlink')` now works without interop shims.

### Added

- **CommonJS build** — the package now ships both ESM (`dist/index.js`) and CJS (`dist/index.cjs`) entry points with matching `.d.ts` / `.d.cts` declarations via conditional `exports`. Build is a single `tsdown` invocation (Rolldown + Oxc) emitting both formats and matching declaration files. `require('elasticlink')` and `import 'elasticlink'` both resolve to the correct build with full type support.
- **`inferType(schema)` helper** — a runtime-noop function (returns `undefined`) whose return type is `Infer<typeof schema>`. Lets vanilla-JS users capture a document type via `/** @type {typeof _Product} */` without a TS-only `type` declaration. TypeScript users should continue to use `type Product = Infer<typeof schema>`.
- **Vanilla-JS example** — `examples/vanilla-js/` demonstrates `require()`-based usage, JSDoc type annotations, and the `inferType()` helper, with a `jsconfig.json` for project-wide `checkJs`.
- **README "Vanilla JavaScript" section** — setup guidance (`jsconfig.json` / `// @ts-check`), `require()` usage, and two patterns for deriving document types (`inferType()` helper and JSDoc `import()` syntax).

### Changed

- **Build pipeline** — `tsdown` (Rolldown-based) emits dual ESM/CJS runtime bundles with sourcemaps and matching `.d.ts` / `.d.cts` declarations in a single step; the `clean` flag handles `dist/` between builds. `@elastic/elasticsearch` is held out of the bundle via `deps.neverBundle`.

## [1.0.0-beta.1] - 2026-04-06

First release candidate for v1.0.0. The earlier beta phases (`0.1.0-beta` → `0.8.0-beta`) iterated on the public shape; `1.0.0-beta.1` closes the type-fidelity gaps identified by a full audit of every builder module against `@elastic/elasticsearch` 9.x.

### Migration from 0.8.0-beta (applies to 1.0.0 stable as well)

Two phases in this release contain breaking changes. All others are additive.

**Phase 1 — Geo / regexp inside `.nested()` (behavioural fix):** `regexp`, `geoDistance`, `geoBoundingBox`, `geoPolygon`, and `geoShape` previously emitted unqualified field names inside a `.nested()` callback, producing queries that silently matched nothing. They now correctly prefix the nested path. If you had a workaround that pre-qualified field names manually (e.g. passing `'variants.sku'` instead of `'sku'`), remove it — the builder now does this for you.

**Phase 2 — Analyzer config + `IndexBuilder<M>` + `indexSortSettings()`:**

- *Analyzer/tokenizer/filter types* are now passthroughs to `@elastic/elasticsearch` (`AnalysisAnalyzer`, `AnalysisTokenizer`, `AnalysisTokenFilter`, `AnalysisCharFilter`, `AnalysisNormalizer`). Loosely-typed configs relying on `[key: string]: unknown` may surface new type errors. Fix by setting `type` to a valid discriminator literal — your IDE will then offer the correct option bag. You gain 45+ analyzers, 18 tokenizers, and 80+ token filters for free.
- *`IndexBuilder` is now generic over the mapping schema* (`IndexBuilder<M>`). Almost all usage is inference-driven and needs no changes; explicit type references must supply the generic. The default `Record<string, FieldTypeString>` keeps untyped references working.
- *`indexSortSettings()` return shape corrected*: it now returns `{ sort: IndicesIndexSegmentSort }` instead of an incorrectly nested shape. Spread the result directly into your settings object; see the updated JSDoc and README example. Per-field `mode` and `missing` are now supported.
- *`AnalysisComponentConfig` removed* — use one of the more specific `AnalysisXxxConfig` aliases.

Phases 3–8 are purely additive or internal type tightening; no source changes should be required.

**`query()` renamed to `queryBuilder()`:** The main search entry point is now `queryBuilder(schema)` instead of `query(schema)`. This better describes the return value (a builder) and parallels `indexBuilder()`. Update your imports: `import { queryBuilder } from 'elasticlink'`.

### Fixed

- **`regexp`, `geoDistance`, `geoBoundingBox`, `geoPolygon`, `geoShape` inside `.nested()`** — these clauses are now available on `ClauseBuilder` and correctly qualify field names with the nested path prefix. Previously they were only exposed on the top-level `QueryBuilder`, so they could not be used inside nested contexts at all.

### Changed

- **`.knn()` field constraint** — explicitly narrowed to `DenseVectorFields<M>` (a dedicated alias of the current dense-vector projection). Behaviourally unchanged — the constraint makes the rule visible and keeps `VectorFields<M>` free to broaden to other vector types in future releases.
- **`QueryState.knn` internal shape** — expanded to mirror `KnnSearch` from `@elastic/elasticsearch`. `filter` is now `QueryDslQueryContainer | QueryDslQueryContainer[]` (was `any`), and the state now carries `query_vector_builder`, `inner_hits`, `rescore_vector`, and `visit_percentage`.
- **Analyzer / tokenizer / token filter / char filter / normalizer types are now passthroughs** to `@elastic/elasticsearch`'s `AnalysisAnalyzer`, `AnalysisTokenizer`, `AnalysisTokenFilter`, `AnalysisCharFilter`, and `AnalysisNormalizer`. This unlocks every built-in and plugin component (45+ analyzers, 18 tokenizers, 80+ token filters) without further code changes and keeps elasticlink in lockstep with Elasticsearch releases. **Breaking:** loosely-typed analysis configs (`[key: string]: unknown`) may now see type errors where the discriminated `type` literal is wrong. Migration: set `type` to a valid discriminator — the IDE will then offer the correct option bag.
- **`IndexBuilder` is now generic over the mapping schema (`IndexBuilder<M>`)**. `.mappings(schema)` rebinds `M` to the incoming schema's field-type map. Usage is inference-driven, so most callers need no changes; explicit `IndexBuilder` references now require the generic (defaults to `Record<string, FieldTypeString>` for backwards compatibility).
- **`indexSortSettings()`** now returns `{ sort: IndicesIndexSegmentSort }` (the Elastic type) and supports full per-field specs with `mode` and `missing` alongside the existing `'asc' | 'desc'` shorthand. **Breaking:** the previous example that wrapped the result under an `index` key was incorrect — spread the return value directly into your settings object. See the updated JSDoc for the new pattern.
- **`IndexMappings.dynamic_templates`** is now typed as `Partial<Record<string, MappingDynamicTemplate>>[]` (was `any[]`).
- **`QueryState.query`** narrowed from `any` to `QueryDslQueryContainer`.
- **`QueryState.search_after`** narrowed from `unknown[]` to `SortResults`, and the `.searchAfter()` method signature updated to match.
- **`QueryState.collapse.inner_hits`** narrowed from `any` to `SearchInnerHits`; `.collapse()` options updated to match.
- **`QueryState.rescore.query.rescore_query`** narrowed from `any` to `QueryDslQueryContainer`.
- **`DenseVectorFieldOptions.index_options`** narrowed from `any` to `MappingDenseVectorIndexOptions`.
- **`VectorFields<M>` broadened** to cover both `dense_vector` and `sparse_vector` field types. The narrower `DenseVectorFields<M>` alias (used by `.knn()`) is unchanged.
- **`BulkBuilder.buildArray()`** now returns `Array<BulkOperationContainer | T | Partial<T>>` instead of `any[]`.
- **Aggregation field constraints tightened** — `cardinality` and `valueCount` now restrict `field` to `KeywordFields<M> | TextFields<M> | NumericFields<M> | DateFields<M> | BooleanFields<M> | IpFields<M>`. Non-aggregatable field types (e.g. `dense_vector`, `sparse_vector`, `geo_point`) are now rejected at compile time.
- **Suggester option types are now `Omit<SearchXxxSuggester, 'field' | 'text' | 'prefix'> & { field: <projection> }`**. `text` / `prefix` are supplied as explicit method arguments, and `field` is narrowed to the mapping schema: `term`/`phrase` require text/keyword fields, `completion` requires a `completion()` field. Previously `field` on a completion suggester was unchecked, so typos or wrong-type fields were silently sent to Elasticsearch. **Breaking:** calls passing a non-completion field to `.completion()` no longer compile. Migration: map the target field as `completion()` or switch to `.term()` / `.phrase()`.

### Added

- **Field helper option gaps filled** (Phase 8):
  - `text()` — `position_increment_gap`, `norms`, `search_quote_analyzer`, `index_options` (typed as `MappingIndexOptions`: `'docs' | 'freqs' | 'positions' | 'offsets'`). Multi-field `fields` property now carries literal type info (see multi-field expansion below).
  - `keyword()` — `split_queries_on_whitespace`, `script`, `on_script_error`.
  - `date()` — `locale`, `script`, `on_script_error`.
  - `geoPoint()` — `ignore_z_value`, `null_value`, `copy_to`, `script`, `on_script_error`.
  - `completion()` — `contexts` (typed as `MappingSuggestContext[]`).
  - `searchAsYouType()` — `search_quote_analyzer`, `store`, `doc_values`, `norms`, `term_vector`; `max_shingle_size` narrowed to `2 | 3 | 4`.
  - `nested()` now accepts a second `NestedFieldOptions` argument (`enabled`, `dynamic`, `include_in_parent`, `include_in_root`).
  - `object()` `ObjectFieldOptions` now includes `dynamic`.
- **`dateNanos()` field helper** — mirrors `date()` but stores timestamps at nanosecond precision. `DateFields<M>` projection broadened to include `date_nanos`, so every agg/query that accepts a date field also accepts `date_nanos`. New `DateNanosFieldOptions`, `DateNanosFieldMapping` types; `date_nanos` added to `FieldTypeString` and `Infer<>`.
- **`ipRange()` field helper** — range-typed IPv4/IPv6 field. New `IpRangeFieldOptions`, `IpRangeFieldMapping` types; `ip_range` added to `FieldTypeString` and `Infer<>` (range object or CIDR string).
- **Aggregation must-haves**:
  - `.dateRange(name, field, options)` — date-bucket complement to `.range()`, constrained to `DateFields<M>`. Supports date-math expressions in `ranges[].from`/`to`.
  - `.filters(name, filters, options?)` — multi-filter bucket aggregation distinct from the existing single-query `.filter(name, query)`. Accepts a `Record<string, QueryDslQueryContainer>` and supports `other_bucket`, `other_bucket_key`, `keyed`.
  - `.significantTerms(name, field, options?)` — statistically significant terms relative to the background set, constrained to `KeywordFields<M> | TextFields<M>`.
  - Corresponding `DateRangeAggOptions`, `FiltersAggOptions`, `SignificantTermsAggOptions` types.
- **Long-tail aggregations** (14 new methods):
  - **Bucket:** `.rareTerms(name, field, options?)`, `.multiTerms(name, options)`, `.geoDistance(name, field, options)`, `.geohashGrid(name, field, options?)`, `.geotileGrid(name, field, options?)`, `.missing(name, field, options?)`.
  - **Metric:** `.geoBounds(name, field, options?)`, `.geoCentroid(name, field, options?)`, `.topMetrics(name, options)`, `.weightedAvg(name, options)`.
  - **Pipeline:** `.derivative(name, options)`, `.cumulativeSum(name, options)`, `.bucketScript(name, options)`, `.bucketSelector(name, options)`.
  - Geo aggs constrained to `GeoPointFields<M>`; `rareTerms` constrained to `KeywordFields<M> | NumericFields<M> | IpFields<M>`. Pipeline aggs use `buckets_path` references (no field parameter).
  - Corresponding option types exported: `RareTermsAggOptions`, `MultiTermsAggOptions`, `GeoDistanceAggOptions`, `GeohashGridAggOptions`, `GeotileGridAggOptions`, `GeoBoundsAggOptions`, `GeoCentroidAggOptions`, `MissingAggOptions`, `TopMetricsAggOptions`, `WeightedAvgAggOptions`, `BucketScriptAggOptions`, `BucketSelectorAggOptions`, `DerivativeAggOptions`, `CumulativeSumAggOptions`.
- **Field helpers** — `tokenCount()`, `murmur3Hash()`, `join()`:
  - `tokenCount(options?)` — counts the number of tokens produced by an analyzer. Options: `analyzer`, `boost`, `index`, `store`, `doc_values`, `null_value`, `enable_position_increments`. `Infer<>` maps to `number`.
  - `murmur3Hash()` — computes a murmur3 hash at index time (requires `mapper-murmur3` plugin). No options. `Infer<>` maps to `string`.
  - `join(options)` — defines parent/child relationships within a single index. Options: `relations` (required), `eager_global_ordinals`. `Infer<>` maps to `string`.
  - New types: `TokenCountFieldOptions`, `JoinFieldOptions`, `TokenCountFieldMapping`, `Murmur3FieldMapping`, `JoinFieldMapping`.
  - `token_count`, `murmur3`, `join` added to `FieldTypeString` and `ESTypeToTS`.
- **`functionScore` query** — wraps an inner query and applies scoring functions (`field_value_factor`, decay functions, `random_score`, `script_score`, `weight`). Available on both `QueryBuilder` and `ClauseBuilder` (usable inside `bool` contexts). Options type `FunctionScoreOptions` is `Omit<QueryDslFunctionScoreQuery, 'query'>` — full passthrough to the Elastic type.
- **`hasChild` / `hasParent` / `parentId` queries** — parent/child join queries for use with `join()` field mappings. `hasChild(type, queryFn, options?)` returns parent documents whose children match; `hasParent(type, queryFn, options?)` returns children whose parent matches; `parentId(type, id, options?)` returns children of a specific parent document. Available on both `QueryBuilder` and `ClauseBuilder`. Options types: `HasChildOptions`, `HasParentOptions`, `ParentIdOptions`.
- **`intervals` query** — positional proximity query returning documents where terms appear in a specified order and proximity. Field constrained to `TextFields<M>`. Full passthrough to `QueryDslIntervalsQuery` — supports `match`, `prefix`, `wildcard`, `fuzzy`, `range`, `regexp`, `all_of`, `any_of` rules with optional `filter` (before/after/containing/overlapping). Options type: `IntervalsOptions`.
- **Span queries** — 9 span query methods for advanced positional matching: `spanTerm(field, value)`, `spanNear(clauses, options?)`, `spanOr(clauses)`, `spanNot(include, exclude, options?)`, `spanFirst(match, end)`, `spanContaining(big, little)`, `spanWithin(big, little)`, `spanMultiTerm(query)`, `spanFieldMasking(field, query)`. All available on both `QueryBuilder` and `ClauseBuilder`. Span queries compose naturally — use `q.spanTerm()` from the `ClauseBuilder` to build inner clauses for `spanNear`, `spanFirst`, etc. Options types: `SpanNearOptions`, `SpanNotOptions`, `SpanQuery`.
- **Multi-field sub-field expansion** — field helpers that accept `fields` (`text`, `keyword`, numeric types, `date`, `dateNanos`, `matchOnlyText`) now carry multi-field type information at compile time. Dot-notation paths like `name.raw` are automatically expanded into the field map, so `term('name.raw', ...)` compiles when `name` is `text({ fields: { raw: keyword() } })`. Multi-fields appear in query field constraints (`KeywordFields<M>`, `TextFields<M>`, etc.) but do **not** appear in `Infer<>` — they are indexing sub-fields, not document properties. All field option types (`TextFieldOptions`, `KeywordFieldOptions`, `NumericFieldOptions`, `DateFieldOptions`, `MatchOnlyTextFieldOptions`, and derived types) are now generic over the multi-field record `MF`; defaults are backwards-compatible.
- **SearchRequest surface completion**:
  - `.runtimeMappings(mappings)` — attach script-computed fields (`Record<string, MappingRuntimeField>`) visible to queries, sorts, and aggs.
  - `.docValueFields(fields)` — set `docvalue_fields` (`Array<QueryDslFieldAndFormat | string>`) for efficient hit-time value retrieval.
  - `.fields(fields)` — set `fields` (`Array<QueryDslFieldAndFormat | string>`) to pull values via the fields API (supports runtime + standard with format).
  - `.postFilter(fn)` — clause-builder callback for `post_filter`, applied after aggregations so aggs see the unfiltered result set. Field constraints come from the mapping schema.
  - `.scriptFields(fields)` — set `script_fields` (`Record<string, ScriptField>`) for per-hit Painless-computed values.
  - `.sourceIncludes(paths)` / `.sourceExcludes(paths)` — complement to the existing `.source()` / `._source()` methods, setting `_source_includes` and `_source_excludes`.
- **`.distanceFeature(field, options)`** — query clause that boosts relevance by proximity of a `date` or `geo_point` field to a given origin. Constrained to `DateFields<M> | GeoPointFields<M>`.
- **`.rankFeature(field, options?)`** — query clause that boosts relevance using a numeric feature stored in a `rank_feature` or `rank_features` field. Options mirror `QueryDslRankFeatureQuery` (saturation, log, linear, sigmoid). Constrained to `RankFeatureFields<M>`.
- **`.sparseVector(field, options)`** — query clause for learned sparse retrieval (e.g. ELSER). Supports both the `inference_id`/`query` form and the precomputed `query_vector` form, plus `prune` and `pruning_config`. Constrained to `SparseVectorFields<M>`.
- **`rankFeature()` and `rankFeatures()` field helpers** with `positive_score_impact` option. Corresponding `RankFeatureFieldMapping`, `RankFeaturesFieldMapping`, `RankFeatureFieldOptions`, and `RankFeaturesFieldOptions` types.
- **`RankFeatureFields<M>`** — new mapping projection for the query-clause field constraint.
- **`rank_feature` and `rank_features`** added to `FieldTypeString`.
- **`KnnOptions` now exposes `query_vector_builder`, `inner_hits`, `rescore_vector`, and `visit_percentage`** via the existing `Omit<KnnSearch, 'field' | 'query_vector'>` passthrough — these were already structurally available but are now covered by explicit tests (including an ELSER-style `query_vector_builder` call).
- **Bulk `update` body now forwards `detect_noop`, `scripted_upsert`, and `_source`** alongside the existing `doc`, `doc_as_upsert`, `upsert`, and `script` fields. Header-level `require_alias` and `dynamic_templates` continue to flow through the header spread — they are now covered by tests to prevent regression.
- **`MultiSearchBuilder.addQueryBuilder(qb, header?)`** — convenience method that accepts a `QueryBuilder` directly, equivalent to `.addQuery(qb.build(), header)` but without the manual `.build()` call.
- **`MultiSearchBuilder.withParams(params)` and `.buildParams()`** — set request-level msearch params (`max_concurrent_searches`, `max_concurrent_shard_requests`, `pre_filter_shard_size`, `rest_total_hits_as_int`, `typed_keys`, `ccs_minimize_roundtrips`, `search_type`, `routing`) separately from the NDJSON body, so callers can spread them into `client.msearch({ ...ms.buildParams(), body: ms.build() })`. New `MSearchRequestParams` type re-exported from the package root.
- **`MSearchHeader`** — re-exported from the package root for typed header construction.
- **Suggester helper type re-exports** — `TermSuggesterOptions`, `PhraseSuggesterOptions`, `CompletionSuggesterOptions`, plus the leaf helper types `PhraseSuggestDirectGenerator`, `PhraseSuggestCollate`, `PhraseSuggestSmoothingModel`, and `CompletionSuggestContext` (all passthroughs from `@elastic/elasticsearch`).
- **`DenseVectorFields<M>`** — new mapping projection, exported alongside `VectorFields<M>`.
- **`SparseVectorFields<M>`** — new mapping projection for `sparse_vector` fields (needed by upcoming `.sparseVector()` query and ELSER support).
- **`CompletionFields<M>`** — new mapping projection used by the completion suggester constraint.
- **`IndexSortFieldSpec`** — per-field sort spec type for `indexSortSettings()` allowing `mode` and `missing` per field.
- Re-exported analysis component type aliases: `AnalysisTokenizerConfig`, `AnalysisTokenFilterConfig`, `AnalysisCharFilterConfig`, `AnalysisNormalizerConfig`.

### Removed

- **`AnalysisComponentConfig`** — replaced by the five more specific passthrough aliases above. If you imported this directly, migrate to the matching `AnalysisXxxConfig` type.

## [0.8.0-beta] - 2026-03-21

### Added

- **`NestedOptions` type** — `Omit<QueryDslNestedQuery, 'path' | 'query'>` replaces the previous inline `{ score_mode?: ... }` on `nested()`, giving access to all Elasticsearch nested query options (e.g. `score_mode`, `ignore_unmapped`)

### Changed

- **Typed clause builder options** — `match()`, `multiMatch()`, `matchPhrasePrefix()`, `fuzzy()`, `combinedFields()`, `knn()`, `nested()` in `ClauseBuilder` now use specific ES-derived option types instead of `Record<string, unknown>`, providing full IntelliSense and compile-time validation for all query options
- **Typed aggregation `filter()`** — accepts `QueryDslQueryContainer` instead of `Record<string, any>`, enabling type-safe filter aggregation queries
- **`completion` field inferred type** — `Infer<>` now maps `completion` to `string | { input: string[]; weight?: number }` (was `string`), matching Elasticsearch's accepted input formats

## [0.7.0-beta] - 2026-03-14

### Added

- **ES 9.x field types**: `sparseVector()`, `semanticText()`, `unsignedLong()` field helpers
- **Nested aggregation builders**: `RootAggregationBuilder`, `NestedAggregationBuilder`, `NestedEntryBuilder` — type-safe aggregation builders that constrain field access based on nested context
- **New aggregation types**: `extendedStats()`, `topHits()`, `autoDateHistogram()`, `composite()`, `filter()`, `reverseNested()`, `global()`
- **`geoShape` query**: `geoShape()` query method for spatial filtering with GeoJSON geometries
- **`script` query**: `scriptQuery()` for custom Painless-based filtering
- **Index analysis configuration**: `.analysis()` method on `indexBuilder()` for custom analyzers, tokenizers, and filters
- **PIT pagination**: `pitId()` and `searchAfter()` methods on the query builder for stateful pagination
- **CI quality checks**: `depcheck`, `jscpd`, and `license-checker` added to CI pipeline

### Changed

- **`reverseNested` type safety**: `reverseNested()` now correctly returns a builder typed to root-level fields instead of remaining in the nested sub-field context
- **`unsigned_long` inferred type**: `Infer<>` now maps `unsigned_long` to `number | string` (ES returns strings for values exceeding `Number.MAX_SAFE_INTEGER`)

## [0.6.0-beta] - 2026-03-10

### Fixed

- **Query field-type narrowing for `object`/`nested` parent fields** — `sort()`, `collapse()`, `highlight()`, and `moreLikeThis()` previously accepted `object` and `nested` parent field names (e.g. `address`, `tags`) via the broad `string & keyof M` signature, producing invalid Elasticsearch requests at runtime. These methods are now constrained to semantically valid field types via new exported helper types: `SortableFields<M>`, `CollapsibleFields<M>`, and `HighlightableFields<M>`. Object sub-fields (e.g. `address.city`) remain valid wherever they were before.

## [0.5.0-beta] - 2026-03-10

### Added

- **Typed `object()` and `nested()` sub-fields** — pass a typed field map to `object()` or `nested()` and the type system now sees the full sub-field tree. Sub-field names and value types are checked at compile time throughout the query builder.

  ```ts
  const m = mappings({
    address: object({
      street: text(),
      city:   keyword(),
      zip:    keyword(),
    }),
    tags: nested({
      label:  keyword(),
      weight: float(),
    }),
  });

  // dot-notation on object fields — no wrapper needed
  query(m).term('address.city', 'Portland').build();

  // typed inner ClauseBuilder on nested fields
  query(m).nested('tags', q => q.term('label', 'sale')).build();
  //                            ^^^^^^^^^^^^^^^^^^^^^^^^^^
  //                            'label' and its value type are checked at compile time
  ```

- **`Infer<>` now produces nested TypeScript types** — `object()` fields infer as plain nested objects, `nested()` fields infer as `Array<{...}>` (matching Elasticsearch semantics).

  ```ts
  type Product = Infer<typeof m>;
  // {
  //   address: { street: string; city: string; zip: string };
  //   tags: Array<{ label: string; weight: number }>;
  // }
  ```

- **New exported types**: `NestedPathFields<M>`, `SubFieldsOf<M, Path>`, `FieldValueType<T>`, `FieldMappingWithLiteralType`, `TypedNestedFieldMapping<F>`, `TypedObjectFieldMapping<F>`.

### Changed

- **`QueryBuilder.when()` no longer breaks the chain** — previously returned `R | undefined`, requiring `?.build()` or `!.build()` at the call site. It now always returns `QueryBuilder<M>`: the `thenFn` result when the condition is truthy, or the current builder unchanged when falsy.
- **`QueryBuilder.when()` drops `elseFn`** — the optional third argument has been removed. Use two `.when()` calls for if/else behaviour.
- **`ClauseBuilder.when()` drops `elseFn`** — aligned with the QueryBuilder change.
- **Bool methods no longer emit empty arrays** — when a `ClauseBuilder.when()` returns `undefined` (falsy condition), the parent `must()` / `filter()` / `should()` / `mustNot()` call is a no-op: it returns the current builder unchanged instead of appending an empty array to the DSL.

### Fixed

- **Nested query field qualification** — inner field names in `.nested()` callbacks are now automatically prefixed with the nested path in the generated DSL. For example, `q.term('color', 'black')` inside a `variants` nested callback now emits `"variants.color"` instead of `"color"`, which is required by Elasticsearch. The callback API is unchanged — you still write relative field names, and the library qualifies them.

- **Deep `object()` and `nested()` nesting** — mappings with two levels of sub-fields (e.g. `address: object({ billing: object({ city: keyword() }) })`) now work correctly end-to-end. Dot-notation paths like `address.billing.city` are accepted by all query methods, and `nested()` inner builders correctly expose and qualify 2-level paths such as `address.city` within the callback.

### Note

TypeScript cannot narrow closure variables inside callbacks. Even when `.when(value, fn)` guarantees `value` is defined inside `fn`, a non-null assertion (`!`) is still required at the call site:

```ts
query(m).bool()
  .when(searchTerm, q => q.must(q2 => q2.match('name', searchTerm!)))
  .build()
```

## [0.4.1-beta] - 2026-02-28

### Fixed

- Removed `.npmignore` — when present alongside `"files"` in `package.json`, npm ignores the allowlist and falls back to the denylist, which caused test files and other non-dist artifacts to be included in the published package. The `"files": ["dist"]` allowlist in `package.json` now exclusively controls what is published, reducing bundle size and removing test files from the npm tarball.

## [0.4.0-beta] - 2026-02-28

### Added

- **Settings presets** — three ready-made `IndicesIndexSettings` helpers for common lifecycle stages:
  - `productionSearchSettings(overrides?)` — balanced production defaults (1 replica, 5s refresh)
  - `indexSortSettings(fields)` — configure index-time sort order for disk compression and early query termination
  - `fastIngestSettings(overrides?)` — async translog, no replicas, refresh disabled; optimized for bulk ingest throughput; use `productionSearchSettings()` to restore afterward
- **New field helpers**: `matchOnlyText()`, `searchAsYouType()`, `constantKeyword()`, `wildcardField()`, `flattened()`, `quantizedDenseVector()` — all exported from the main entry point
- **New query methods**: `combinedFields()`, `matchBoolPrefix()`, `queryString()`, `simpleQueryString()`, `moreLikeThis()`
- **Strict mapping default** — `mappings()` now sets `dynamic: 'strict'` by default, preventing unmapped fields from being silently indexed

### Fixed

- `when()` returning `undefined` in `must()`/`filter()`/`should()`/`mustNot()` clauses no longer produces `null` entries in the serialized DSL array — undefined results are now filtered out before building
- `doc_as_upsert: false` in bulk `update()` is now correctly included in the output (was silently dropped by a truthy guard)
- `dynamic: false` and `_source: false` in index mappings are now correctly included in the output (same truthy guard issue)
- `script()` and `scriptScore()` no longer drop explicit `boost: 0` or `params: {}` values
- `fastIngestSettings()` now deep-merges the `translog` key so partial overrides (e.g. only `durability`) do not clobber the `sync_interval` default
- `MatchOnlyTextFieldOptions` removed unsupported `analyzer` and `search_analyzer` params (the `match_only_text` field type does not allow configuring the analyzer)

## [0.3.0-beta] - 2026-02-25

### Added

- **`mappings()` builder** — define Elasticsearch field types using helper functions (`text()`, `keyword()`, `float()`, etc.) and get compile-time field-type safety across the entire builder chain
- **`Infer<S>` utility type** — derive TypeScript document types from a `MappingsSchema`, eliminating the need to maintain separate type definitions
- **Field-type-aware query constraints** — `match()` only accepts text fields, `term()` only keyword fields, `range()` only numeric/date fields, etc. Invalid field-type combinations are compile-time errors
- **Field group filter types**: `TextFields<M>`, `KeywordFields<M>`, `NumericFields<M>`, `DateFields<M>`, `BooleanFields<M>`, `GeoPointFields<M>`, `VectorFields<M>` — extract field subsets by Elasticsearch type
- **Field helper functions**: `text()`, `keyword()`, `long()`, `integer()`, `short()`, `byte()`, `double()`, `float()`, `halfFloat()`, `scaledFloat()`, `date()`, `boolean()`, `binary()`, `ip()`, `denseVector()`, `geoPoint()`, `geoShape()`, `completion()`, `nested()`, `object()`, `alias()`, `percolator()`, `integerRange()`, `floatRange()`, `longRange()`, `doubleRange()`, `dateRange()` — typed field definition helpers for use with `mappings()`

### Changed

- `query()` now accepts a runtime `MappingsSchema` argument: `query(myMappings)` instead of `query<MyType>()`
- `aggregations()` now accepts a runtime `MappingsSchema` argument: `aggregations(myMappings)` instead of `aggregations<MyType>()`
- `suggest()` now accepts a runtime `MappingsSchema` argument: `suggest(myMappings)` instead of `suggest<MyType>()`
- `msearch()` now accepts a runtime `MappingsSchema` argument: `msearch(myMappings)` instead of `msearch<MyType>()`
- `bulk()` now accepts a runtime `MappingsSchema` argument: `bulk(myMappings)` instead of `bulk<MyType>()`
- `indexBuilder()` no longer takes a type parameter; `.mappings()` accepts either a `MappingsSchema` or inline field definitions

### Breaking Changes

- **All builder entry points now require a runtime mappings argument**:
  - `query<T>()` → `query(mappingsSchema)`
  - `aggregations<T>()` → `aggregations(mappingsSchema)`
  - `suggest<T>()` → `suggest(mappingsSchema)`
  - `msearch<T>()` → `msearch(mappingsSchema)`
  - `bulk<T>()` → `bulk(mappingsSchema)`
- `indexBuilder<T>()` → `indexBuilder()` — type parameter removed, use `.mappings()` to pass schema
- Field helper shorthand strings (e.g. `'text'`, `'keyword'`) removed — use typed helper functions (`text()`, `keyword()`, etc.)

## [0.2.0-beta] - 2026-02-09

### Added

- `@elastic/elasticsearch` as a peer dependency (`>=9.0.0`) — required for type derivation (compile-time only, zero runtime cost)
- Comprehensive integration test suite (`src/__tests__/integration/`) covering all 6 builder areas (query, aggregations, multi-search, bulk, index management, suggesters) against live Elasticsearch 9.x
- Integration test fixtures using professional domains: finance (`Instrument`, `Trade`), legal (`Matter`, `Attorney`), real estate (`Listing`)

### Changed

#### Types Aligned with Official `@elastic/elasticsearch`

All input types are now derived directly from the official `@elastic/elasticsearch` package (v9.x) using utility types like `Omit<>` and intersection types. This ensures completeness, accuracy, JSDoc documentation, and automatic alignment when Elasticsearch updates.

- **Query types** (`query.types.ts`): `MatchOptions`, `MultiMatchOptions`, `FuzzyOptions`, `RegexpOptions`, `ConstantScoreOptions`, `HighlightOptions`, `ScriptOptions`, `ScriptQueryOptions`, `ScriptScoreOptions`, `PercolateOptions` — all now derived from official types
- **Aggregation types** (`aggregation.types.ts`): `TermsAggOptions`, `DateHistogramAggOptions`, `RangeAggOptions`, `HistogramAggOptions`, `AvgAggOptions`, `SumAggOptions`, `MinAggOptions`, `MaxAggOptions`, `CardinalityAggOptions`, `PercentilesAggOptions`, `StatsAggOptions`, `ValueCountAggOptions` — all now `Omit<OfficialType, 'field'>`
- **Suggester types** (`suggester.types.ts`): `TermSuggesterOptions`, `PhraseSuggesterOptions`, `CompletionSuggesterOptions` — now re-exported directly from official types
- **Vector types** (`vector.types.ts`): `KnnOptions`, `DenseVectorOptions` — now derived from official `KnnSearch` and `MappingDenseVectorProperty`
- **Bulk types** (`bulk.types.ts`): `BulkIndexMeta`, `BulkCreateMeta`, `BulkUpdateMeta`, `BulkDeleteMeta` — now derived from official types
- **Multi-search types** (`multi-search.types.ts`): `MSearchHeader` — now `MsearchMultisearchHeader` from official types
- **Index management types** (`index-management.types.ts`): `IndexSettings` now `IndicesIndexSettings`; aliases now use `IndicesAlias`

#### ESM Module Output

- Package is now ESM-first (`"type": "module"` in package.json)
- Added `"exports"` field for modern module resolution
- All internal imports use explicit `.js` extensions per ESM spec
- TypeScript compiles to ESM (`import`/`export`) instead of CommonJS (`require`/`module.exports`)

### Breaking Changes

- **ESM output**: Package output is now ESM instead of CommonJS. CJS consumers should use dynamic `import()` or switch to ESM.
- **Phrase suggester highlighting**: `pre_tag` and `post_tag` are now nested under `highlight: { pre_tag, post_tag }` (aligned with official `SearchPhraseSuggester` type)
- **Phrase suggester collate**: Collate query `source` is now a string template, not an object (aligned with official `ScriptSource` type)
- **KNN options**: `k` and `num_candidates` are now optional (aligned with official `KnnSearch` type)

### Removed

- Duplicate types from `aggregation.types.ts`: `GeoDistance`, `GeoBoundingBox`, `GeoPolygon`, `RegexpOptions`, `ConstantScoreOptions` (these were unused duplicates of types in `query.types.ts`)

## [0.1.0-beta] - 2026-02-02

### Added

#### Core Query Features

- **Full-text queries**: `match()`, `multiMatch()`, `matchPhrase()`, `matchPhrasePrefix()`
- **Term-level queries**: `term()`, `terms()`, `range()`, `exists()`, `prefix()`, `wildcard()`, `fuzzy()`, `ids()`
- **Boolean queries**: `bool()` with `must()`, `filter()`, `should()`, `mustNot()`, `minimumShouldMatch()`
- **Nested queries**: `nested()` for querying nested objects with type safety
- **Conditional building**: `when()` method for runtime-based query construction

#### Vector Search

- **KNN (k-nearest neighbors) queries**: Vector similarity search for ML/AI applications
  - `knn()` method on QueryBuilder and ClauseBuilder
  - Support for filtering, boosting, and similarity configuration
  - Type-safe vector field references
- **Dense vector field support**: First-class support for vector embeddings
  - `DenseVectorOptions` type with HNSW and flat index configurations
  - Integration with index management for vector field mappings

#### Advanced Query Types

- **Script queries**: Custom query logic using Painless/Expression/Mustache
  - `script()` - Script-based queries with parameters
  - `scriptScore()` - Custom scoring with scripts
  - Support for multiple script languages and parameters
- **Percolate queries**: Reverse search (match documents against stored queries)
  - `percolate()` method with document/documents/id support
  - Integration with percolator field mappings

#### Aggregations

- **Bucket aggregations**: `terms()`, `dateHistogram()`, `range()`, `histogram()`
- **Metric aggregations**: `avg()`, `sum()`, `min()`, `max()`, `cardinality()`, `percentiles()`, `stats()`, `valueCount()`
- **Sub-aggregations**: `subAgg()` for nested aggregation composition
- **Integration**: `aggs()` method on QueryBuilder or standalone `aggregations<T>()` builder

#### API Operations & Utilities

- **Multi-search API**: Batch multiple search requests efficiently
  - `msearch<T>()` builder with `.add()` and `.addQuery()` methods
  - NDJSON format generation with `.build()` and `.buildArray()`
  - Type-safe query composition
- **Bulk operations**: Efficient bulk indexing, updates, and deletes
  - `bulk<T>()` builder with `.index()`, `.create()`, `.update()`, `.delete()`
  - NDJSON format generation
  - Metadata support for routing, versioning, etc.
- **Index management utilities**: Fluent API for index configuration
  - `indexBuilder<T>()` for mappings, settings, and aliases
  - Type-safe field mappings with analyzer support
  - Dense vector field configuration
  - Multi-field and nested object support

#### Query Suggestions & Autocomplete

- **Query suggestions**: Term corrections, phrase suggestions, and autocomplete
  - `suggest()` method on QueryBuilder for integrated suggestions
  - `suggest<T>()` standalone builder for suggestion-only requests
  - **Term suggester**: Spelling corrections for individual terms
  - **Phrase suggester**: Multi-word phrase corrections with collate support
  - **Completion suggester**: Fast autocomplete with fuzzy matching and context filtering

#### Geospatial Queries

- `geoDistance()` - Find documents within a distance from a point
- `geoBoundingBox()` - Query documents within a geographic bounding box
- `geoPolygon()` - Query documents within a polygon

#### Advanced Patterns

- `regexp()` - Regular expression pattern matching with flags
- `constantScore()` - Constant scoring queries for efficient filtering

#### Results Enhancement

- **Highlighting**: `highlight(fields, options)` with custom tags and fragment configuration

#### Query Parameters

- **Pagination**: `from()`, `size()`, `to()`
- **Sorting**: `sort(field, direction)`
- **Field selection**: `_source(fields)`
- **Performance**: `timeout()`, `trackScores()`, `explain()`, `minScore()`, `trackTotalHits()`
- **Document info**: `version()`, `seqNoPrimaryTerm()`

### Infrastructure

- ESLint and Prettier setup for code quality
- TypeScript strict mode enabled
- Pre-publish hooks for build, test, and lint validation

## Versioning

elasticlink follows [Semantic Versioning](https://semver.org/). Breaking changes to the public API will only ship in a major release once `1.0.0` stable lands. The `1.0.0-beta.x` series is feature-complete and intended for validation; the `0.x.x-beta` series pre-dates v1 and is no longer maintained.
