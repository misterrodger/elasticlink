# Changelog

All notable changes to elasticlink will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

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

This project is currently in **beta**. The API may change, including breaking changes, as we gather feedback and refine the design.

- **0.x.x-beta**: Beta releases - API may change
- **Future stable release**: When ready, based on real-world usage and feedback
