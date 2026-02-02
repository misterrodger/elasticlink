# Changelog

All notable changes to elastiq-ts will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [Unreleased]

### Changed

- Nothing yet

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

### Developer Experience

- 430+ passing tests with 98%+ coverage
- Comprehensive JSDoc documentation across all modules
- Real-world usage examples in test suite
- Type-safe field references throughout
- Full TypeScript support with generics
- Fluent, chainable API for intuitive query building
- ~22KB bundle size (zero dependencies)

### Infrastructure

- ESLint and Prettier setup for code quality
- Jest configuration with verbose test output
- TypeScript strict mode enabled
- Pre-publish hooks for build, test, and lint validation

## Versioning

This project is currently in **beta**. The API may change, including breaking changes, as we gather feedback and refine the design.

- **0.x.x-beta**: Beta releases - API may change
- **Future stable release**: When ready, based on real-world usage and feedback
