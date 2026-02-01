# Changelog

All notable changes to elastiq will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Query + Aggregations Integration**: Combine queries with aggregations using `.aggs()` method
  - `query<T>().match(...).aggs(agg => agg.terms(...)).build()` - query with aggregations
  - `query<T>(false).aggs(...).build()` - standalone aggregations (no query field)
- 4 new tests for query + aggregations integration (147 total)

## [0.1.0-beta.0] - 2026-01-30

### Added

#### Core Query Types

- **Full-text queries**: `match()`, `multiMatch()`, `matchPhrase()`, `matchPhrasePrefix()`
- **Term-level queries**: `term()`, `terms()`, `range()`, `exists()`, `prefix()`, `wildcard()`, `fuzzy()`
- **ID queries**: `ids()` for querying by document IDs
- **Nested queries**: `nested()` for querying nested objects with type safety
- **Boolean queries**: `bool()` with `must()`, `filter()`, `should()`, `mustNot()`, and `minimumShouldMatch()`
- **Conditional building**: `when()` method for runtime-based query construction

#### Query Parameters

- Pagination: `from()`, `size()`, `to()`
- Sorting: `sort(field, direction)`
- Field selection: `_source(fields)`
- Performance: `timeout()`, `trackScores()`, `explain()`, `minScore()`, `trackTotalHits()`
- Document info: `version()`, `seqNoPrimaryTerm()`

#### Aggregations Framework

- **Bucket aggregations**: `terms()`, `dateHistogram()`, `range()`, `histogram()`
- **Metric aggregations**: `avg()`, `sum()`, `min()`, `max()`, `cardinality()`, `percentiles()`, `stats()`, `valueCount()`
- **Sub-aggregations**: `subAgg()` for nested aggregation composition
- Separate fluent API via `aggregations<T>()` builder

#### Geospatial Queries

- `geoDistance()` - Find documents within a distance from a point
- `geoBoundingBox()` - Query documents within a geographic bounding box
- `geoPolygon()` - Query documents within a polygon

#### Advanced Query Types

- `regexp()` - Regular expression pattern matching with flags
- `constantScore()` - Constant scoring queries for efficient filtering

#### Results Enhancement

- Highlighting: `highlight(fields, options)` with custom tags and fragment configuration

#### Developer Experience

- Full TypeScript support with generics for type-safe field names
- Fluent, chainable API for intuitive query building
- Comprehensive inline documentation
- 143+ passing tests with good coverage

### Infrastructure

- ESLint and Prettier setup for code quality
- Jest configuration with verbose test output
- TypeScript strict mode enabled
- Pre-publish hooks for build, test, and lint validation

---

## Versioning

- **0.1.0-beta.x**: Beta releases for early feedback
- **Stable**: Future release when APIs finalized

## Future Releases

### Planned Features

- KNN (k-nearest neighbors) queries for vector search
- Semantic search with vector embeddings
- Dense vector field support
- Script queries
- Percolate queries
- Multi-search API
- Index management utilities
- Bulk operations
- Query suggestions/completions

## Contributing

We welcome bug reports, feature requests, and PRs. See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.
