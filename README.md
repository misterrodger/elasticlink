# elasticlink

[![npm version](https://img.shields.io/npm/v/elasticlink.svg)](https://www.npmjs.com/package/elasticlink)
[![Build Status](https://github.com/misterrodger/elasticlink/actions/workflows/ci.yml/badge.svg)](https://github.com/misterrodger/elasticlink/actions)
[![codecov](https://codecov.io/gh/misterrodger/elasticlink/branch/main/graph/badge.svg)](https://codecov.io/gh/misterrodger/elasticlink)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **Type-safe, fluent API for Elasticsearch queries and index management**

Define your Elasticsearch mappings once, then build queries with full IntelliSense and compile-time safety. `match()` only accepts text fields, `term()` only keyword fields, etc. Compiles to standard Elasticsearch DSL with no runtime overhead.

## Features

- **Mapping-Aware Type Safety**: define your ES mappings once with `mappings()`, and every query method constrains its field arguments to the correct type.
- **Types from the source**: autocomplete for field names, query options, and aggregation methods. Structural types are hand-rolled, leaf option types are derived from `@elastic/elasticsearch` types, so they stay current.
- **Fluent Chainable API**: readable query building with boolean logic, conditional branches (using `.when()`), aggregations, and pagination in a single chain.
- **No Runtime Overhead or Lock-In**: builds plain Elasticsearch DSL objects. Pass them to the official `@elastic/elasticsearch` client or any HTTP client.
- **Production-Ready Settings Presets**: helpers for production search, fast ingest, and index sort presets for common lifecycle stages, with full type support.
- **40+ Field Helpers**: `text()`, `keyword()`, `denseVector()`, `nested()`, and more with options for IDE tooltips.

## Installation

```bash
npm install elasticlink @elastic/elasticsearch
```

Requires Node.js 20+ and `@elastic/elasticsearch` 9.x as a peer dependency.

> **Note:** elasticlink derives its types directly from the official `@elastic/elasticsearch` package for accuracy, completeness, and automatic alignment with Elasticsearch updates. This is a **compile-time only** dependency — it adds zero runtime overhead. If you're already using the Elasticsearch client, you're all set. If not, install it as a dev dependency: `npm install -D @elastic/elasticsearch`.

## Quick Start

```typescript
import { queryBuilder, mappings, text, keyword, float, type Infer } from 'elasticlink';

// Define field types once — this is the single source of truth
const productMappings = mappings({
  name: text(),
  description: text(),
  price: float(),
  category: keyword()
});

// Derive a TS type from mappings (optional, for use elsewhere in your application)
type Product = Infer<typeof productMappings>;

// Build a type-safe query — field constraints are enforced at compile time
const elasticQuery = queryBuilder(productMappings)
  .match('name', 'laptop') // ✅ 'name' is a text field
  .range('price', { gte: 500, lte: 2000 })
  .sort('price', 'asc')
  .from(0)
  .size(20)
  .build();

// Send to Elasticsearch
const response = await client.search({ index: 'products', ...elasticQuery });
```

Boolean queries with aggregations:

```typescript
const facetedSearch = queryBuilder(productMappings)
  .bool()
  .must((q) => q.match('name', 'gaming laptop', { operator: 'and' }))
  .filter((q) => q.term('category', 'electronics'))
  .filter((q) => q.range('price', { gte: 800, lte: 2000 }))
  .aggs((agg) => agg.terms('by_category', 'category', { size: 10 }).avg('avg_price', 'price'))
  .highlight(['name', 'description'])
  .size(20)
  .build();
```

Type safety in action — wrong field types are caught at compile time:

```typescript
queryBuilder(productMappings).match('category', 'electronics');
//                           ^^^^^^^^^^
// TypeScript error: 'category' is a keyword field — use term(), not match()

queryBuilder(productMappings).term('category', 'electronics'); // ✅ Correct
```

## Examples

More examples available in [src/\_\_tests\_\_/examples.test.ts](src/__tests__/examples.test.ts).

### E-commerce Product Search

A complete search request: boolean query with must/filter/should, aggregations for facets and price ranges, highlights, `_source` filtering, and pagination.

```typescript
const ecommerceMappings = mappings({
  name: text(),
  description: text(),
  category: keyword(),
  price: float(),
  tags: keyword(),
  in_stock: boolean()
});

const searchTerm = 'gaming laptop';
const category = 'electronics';
const minPrice = 800;
const maxPrice = 2000;

const result = queryBuilder(ecommerceMappings)
  .bool()
  .must((q) => q.match('name', searchTerm, { operator: 'and', boost: 2 }))
  .should((q) => q.fuzzy('description', searchTerm, { fuzziness: 'AUTO' }))
  .filter((q) => q.term('category', category))
  .filter((q) => q.range('price', { gte: minPrice, lte: maxPrice }))
  .filter((q) => q.term('in_stock', true))
  .minimumShouldMatch(1)
  .aggs((agg) =>
    agg.terms('by_category', 'category', { size: 10 }).range('price_ranges', 'price', {
      ranges: [{ to: 800 }, { from: 800, to: 1500 }, { from: 1500 }]
    })
  )
  .highlight(['name', 'description'], {
    fragment_size: 150,
    pre_tags: ['<mark>'],
    post_tags: ['</mark>']
  })
  ._source(['name', 'price', 'category', 'tags'])
  .timeout('5s')
  .from(0)
  .size(20)
  .sort('_score', 'desc')
  .build();
```

<details>
<summary><b>Produced DSL</b> (click to expand)</summary>

```json
{
  "query": {
    "bool": {
      "must": [{ "match": { "name": { "query": "gaming laptop", "operator": "and", "boost": 2 } } }],
      "should": [{ "fuzzy": { "description": { "value": "gaming laptop", "fuzziness": "AUTO" } } }],
      "filter": [
        { "term": { "category": "electronics" } },
        { "range": { "price": { "gte": 800, "lte": 2000 } } },
        { "term": { "in_stock": true } }
      ],
      "minimum_should_match": 1
    }
  },
  "aggs": {
    "by_category": { "terms": { "field": "category", "size": 10 } },
    "price_ranges": {
      "range": {
        "field": "price",
        "ranges": [{ "to": 800 }, { "from": 800, "to": 1500 }, { "from": 1500 }]
      }
    }
  },
  "highlight": {
    "fields": { "name": { "fragment_size": 150 }, "description": { "fragment_size": 150 } },
    "pre_tags": ["<mark>"],
    "post_tags": ["</mark>"]
  },
  "_source": ["name", "price", "category", "tags"],
  "timeout": "5s",
  "from": 0,
  "size": 20,
  "sort": [{ "_score": "desc" }]
}
```

</details>

### Dynamic Search with Conditional Filters

Build queries dynamically based on runtime values. `.when(condition, fn)` — when the condition is falsy, the builder is returned unchanged.

```typescript
const buildDynamicQuery = (filters: SearchFilters) => {
  return queryBuilder(productMappings)
    .bool()
    .when(filters.searchTerm, (q) => q.must((q2) => q2.match('name', filters.searchTerm!, { boost: 2 })))
    .when(filters.category, (q) => q.filter((q2) => q2.term('category', filters.category!)))
    .when(filters.minPrice != null && filters.maxPrice != null, (q) =>
      q.filter((q2) => q2.range('price', { gte: filters.minPrice!, lte: filters.maxPrice! }))
    )
    .from(filters.offset || 0)
    .size(filters.limit || 20)
    .build();
};
```

### Aggregations — Portfolio Analytics

Terms + sub-aggregation + date histogram in one request.

```typescript
const instrumentMappings = mappings({
  name: text(),
  asset_class: keyword(),
  sector: keyword(),
  price: float(),
  yield_rate: float(),
  listed_date: date()
});

const result = queryBuilder(instrumentMappings)
  .bool()
  .filter((q) => q.term('asset_class', 'fixed-income'))
  .filter((q) => q.range('yield_rate', { gte: 3.0 }))
  .aggs((agg) =>
    agg
      .terms('by_sector', 'sector', { size: 10 })
      .subAgg((sub) => sub.avg('avg_yield', 'yield_rate').max('max_price', 'price'))
      .dateHistogram('listings_over_time', 'listed_date', {
        interval: 'quarter',
        min_doc_count: 1
      })
      .subAgg((sub) => sub.percentiles('yield_percentiles', 'yield_rate', { percents: [25, 50, 75, 95] }))
  )
  .size(0)
  .build();
```

<details>
<summary><b>Produced DSL</b> (click to expand)</summary>

```json
{
  "query": {
    "bool": {
      "filter": [{ "term": { "asset_class": "fixed-income" } }, { "range": { "yield_rate": { "gte": 3.0 } } }]
    }
  },
  "aggs": {
    "by_sector": {
      "terms": { "field": "sector", "size": 10 },
      "aggs": {
        "avg_yield": { "avg": { "field": "yield_rate" } },
        "max_price": { "max": { "field": "price" } }
      }
    },
    "listings_over_time": {
      "date_histogram": { "field": "listed_date", "interval": "quarter", "min_doc_count": 1 },
      "aggs": {
        "yield_percentiles": { "percentiles": { "field": "yield_rate", "percents": [25, 50, 75, 95] } }
      }
    }
  },
  "size": 0
}
```

</details>

### Geospatial Search

```typescript
const restaurantMappings = mappings({
  name: text(),
  cuisine: keyword(),
  location: geoPoint(),
  rating: float()
});

const result = queryBuilder(restaurantMappings)
  .bool()
  .filter((q) => q.term('cuisine', 'italian'))
  .filter((q) => q.geoDistance('location', { lat: 40.7128, lon: -74.006 }, { distance: '5km' }))
  .sort('rating', 'desc')
  .size(20)
  .build();
```

## TypeScript Support

elasticlink provides mapping-aware TypeScript safety:

- **Field-Type Constraints**: enforced at compile time across all methods — `match()` only accepts text fields, `term()` only keyword/numeric fields, `sort()` only sortable fields (keyword, numeric, date, boolean, ip), `collapse()` only keyword/numeric fields, `highlight()` only text/keyword fields
- **Field Autocomplete**: IntelliSense knows your field names and their types
- **`Infer<S>`**: Derive TS document types from your mappings schema for use elsewhere in your application
- **Exported Field Group Types**: `TextFields<M>`, `KeywordFields<M>`, `NumericFields<M>`, `DateFields<M>`, `BooleanFields<M>`, `GeoPointFields<M>`, `GeoShapeFields<M>`, `VectorFields<M>`, `DenseVectorFields<M>`, `SparseVectorFields<M>`, `RankFeatureFields<M>`, `CompletionFields<M>`, `IpFields<M>`, `FieldsOfType<M, T>`, and others are exported for use in your own typed utilities
- **Exported Builder Types**: `QueryBuilder<M>`, `ClauseBuilder<M>`, `RootAggregationBuilder<M>`, `NestedAggregationBuilder<M>`, `NestedEntryBuilder<M>`, `MSearchBuilder<M>`, `BulkBuilder<T>`, `SuggesterBuilder<M>`, `IndexBuilder<M>`, `AnalysisConfig`, `IndexSortFieldSpec`, `MSearchHeader`, `MSearchRequestParams`

```typescript
import { queryBuilder, mappings, text, keyword, integer, type Infer } from 'elasticlink';

const userMappings = mappings({
  name: text(),
  email: keyword(),
  age: integer()
});

type User = Infer<typeof userMappings>;
// => { name: string; email: string; age: number }

// ✅ 'name' is a text field — match() accepts it
const q1 = queryBuilder(userMappings).match('name', 'John').build();

// ❌ TypeScript error: 'email' is keyword, not text — use term() instead
const q2 = queryBuilder(userMappings).match('email', 'john@example.com').build();

// ✅ Correct: use term() for keyword fields
const q3 = queryBuilder(userMappings).term('email', 'john@example.com').build();
```

## Vanilla JavaScript

elasticlink works in vanilla JavaScript with full IntelliSense — no TypeScript required. The library ships both ESM and CommonJS builds, so `import` and `require()` both work.

### Setup

For project-wide type checking, add a `jsconfig.json` to your project root:

```json
{
  "compilerOptions": {
    "checkJs": true,
    "strict": true,
    "module": "commonjs",
    "moduleResolution": "node10",
    "target": "ES2022"
  }
}
```

Or enable per-file with `// @ts-check` at the top of any `.js` file.

### Usage

Query builder methods provide field-name autocomplete and type constraints in VS Code even without any configuration:

```js
const { mappings, text, keyword, float, queryBuilder } = require('elasticlink');

const productSchema = mappings({
  name: text(),
  price: float(),
  category: keyword()
});

// Field names autocomplete, and are constrained by type:
const query = queryBuilder(productSchema)
  .match('name', 'laptop')           // 'name' is text — allowed in match()
  .range('price', { gte: 500 })      // 'price' is numeric — allowed in range()
  .term('category', 'electronics')   // 'category' is keyword — allowed in term()
  .build();
```

### Deriving Document Types

In TypeScript you'd use `type Product = Infer<typeof schema>`. In JavaScript, use the `inferType()` helper:

> ⚠️ **Type-only helper.** `inferType()` always returns `undefined`. It exists so you can write `typeof _Product` in a JSDoc `@type` annotation. Never use the returned value at runtime — accessing a property on it (e.g. `_Product.name`) will throw `TypeError`.

```js
const { mappings, text, keyword, float, inferType } = require('elasticlink');

const schema = mappings({ name: text(), price: float(), category: keyword() });

const _Product = inferType(schema); // undefined at runtime; only the type matters

/** @type {typeof _Product} */
const doc = { name: 'Laptop', price: 999, category: 'electronics' };
// ^ full autocomplete on all properties
```

Alternatively, use the JSDoc import syntax directly:

```js
/** @type {import('elasticlink').Infer<typeof schema>} */
const doc = { name: 'Laptop', price: 999, category: 'electronics' };
```

See [`examples/vanilla-js/`](examples/vanilla-js/) for a complete working example.

## Settings Presets

Ready-made index settings for common lifecycle stages. Use with `.settings()` on `indexBuilder()` or pass directly to the ES `_settings` API.

```typescript
import { indexBuilder, productionSearchSettings, indexSortSettings, fastIngestSettings } from 'elasticlink';

// Create index with production settings
const indexConfig = indexBuilder().mappings(myMappings).settings(productionSearchSettings()).build();

// Index-time sort for compression and early termination
const sortedConfig = indexBuilder()
  .mappings(myMappings)
  .settings({
    ...productionSearchSettings(),
    index: indexSortSettings({ timestamp: 'desc', status: 'asc' })
  })
  .build();

// Before bulk ingest — disables refresh, removes replicas, async translog
await client.indices.putSettings({ index: 'my-index', body: fastIngestSettings() });

// Perform bulk ingest...

// Restore production settings afterward
await client.indices.putSettings({ index: 'my-index', body: productionSearchSettings() });
await client.indices.refresh({ index: 'my-index' });
```

| Preset                                 | Purpose                                                                     |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `productionSearchSettings(overrides?)` | Balanced production defaults — 1 replica, 5s refresh                        |
| `indexSortSettings(fields)`            | Configure index-time sort order for disk compression and early termination  |
| `fastIngestSettings(overrides?)`       | Maximum indexing throughput — async translog, no replicas, refresh disabled |

All presets accept an optional `overrides` argument typed as `Partial<IndicesIndexSettings>`. `fastIngestSettings` deep-merges the `translog` key so individual translog overrides don't clobber the other defaults.

## API Overview

### Query Builder

`queryBuilder(schema, includeQuery?)` creates a fluent, immutable query builder. Every chain method returns a new builder instance.

```typescript
queryBuilder(productMappings)
  .bool()
  .must((q) => q.match('name', 'laptop'))
  .filter((q) => q.range('price', { gte: 500 }))
  .should((q) => q.term('category', 'featured'))
  .mustNot((q) => q.term('category', 'discontinued'))
  .minimumShouldMatch(1)
  .build();
```

#### Query Methods

| Category                   | Methods                                                                                           | Description                                                                      |
| -------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Full-text**              | `match`, `multiMatch`, `matchPhrase`, `matchPhrasePrefix`, `matchBoolPrefix`, `combinedFields`    | Analyzed text search — field must be a text field                                |
| **Term-level**             | `term`, `terms`, `prefix`, `wildcard`, `exists`, `ids`, `matchAll`, `matchNone`                   | Exact value matching — field must be keyword, numeric, date, boolean, or ip      |
| **Range**                  | `range`                                                                                           | Range queries (`gte`, `lte`, `gt`, `lt`) on numeric, date, keyword, or ip fields |
| **Fuzzy & Pattern**        | `fuzzy`, `regexp`, `queryString`, `simpleQueryString`, `moreLikeThis`                             | Typo tolerance, regex, Lucene syntax, and similarity search                      |
| **Boolean**                | `bool` → `must`, `mustNot`, `should`, `filter`, `minimumShouldMatch`                              | Combine clauses with AND/OR/NOT/filter logic                                     |
| **Conditional**            | `when(condition, fn)`                                                                             | Dynamic query building — skips the branch when condition is falsy                |
| **Geo**                    | `geoDistance`, `geoBoundingBox`, `geoPolygon`, `geoShape`                                         | Spatial queries — field must be geo_point or geo_shape                           |
| **Vector & Relevance**     | `knn`, `sparseVector`, `rankFeature`, `distanceFeature`                                           | Semantic/vector search, rank features, and decay functions                       |
| **Nested & Structure**     | `nested`, `constantScore`, `hasChild`, `hasParent`, `parentId`                                    | Query nested objects, parent/child joins, or wrap in constant-score filter       |
| **Sorting & Pagination**   | `from`, `size`, `sort`, `searchAfter`, `collapse`                                                 | Result ordering, pagination, and field collapsing                                |
| **Source & Fields**        | `_source`, `sourceIncludes`, `sourceExcludes`, `fields`, `docValueFields`, `storedFields`         | Control which fields are returned                                                |
| **Highlighting & Scoring** | `highlight`, `rescore`, `indicesBoost`, `minScore`, `trackScores`, `explain`                      | Result highlighting, rescoring, and relevance tuning                             |
| **Positional**             | `intervals`, `spanTerm`, `spanNear`, `spanOr`, `spanNot`, `spanFirst`, `spanContaining`, `spanWithin`, `spanMultiTerm`, `spanFieldMasking` | Term proximity and ordering queries |
| **Advanced**               | `postFilter`, `scriptFields`, `runtimeMappings`, `script`, `scriptScore`, `functionScore`, `percolate` | Post-query filtering, computed fields, and custom scoring                   |
| **Configuration**          | `timeout`, `preference`, `pit`, `terminateAfter`, `version`, `seqNoPrimaryTerm`, `trackTotalHits` | Search execution options                                                         |
| **Inline builders**        | `aggs(fn)`, `suggest(fn)`                                                                         | Attach aggregations or suggesters to the query                                   |
| **Output**                 | `build()`                                                                                         | Returns the final Elasticsearch DSL object                                       |

All query methods accept options from their corresponding `@elastic/elasticsearch` type. See [`query.types.ts`](src/query.types.ts) for complete signatures.

#### Conditional Building

`.when(condition, fn)` — the chain is never broken. When the condition is falsy, the builder is returned unchanged. `condition` resolves as: functions are called, booleans are used as-is, and any other value uses a nullish check (`!= null`) — so numeric `0` and empty string `''` are treated as truthy.

```typescript
const searchTerm: string | undefined = param.searchTerm;
const minPrice: number | undefined = param.minPrice;

queryBuilder(productMappings)
  .bool()
  .when(searchTerm, (q) => q.must((q2) => q2.match('name', searchTerm!)))
  .when(minPrice, (q) => q.filter((q2) => q2.range('price', { gte: minPrice! })))
  .build();
```

> **Note:** TypeScript cannot narrow closure variables inside callbacks. Even though `.when(searchTerm, fn)` guarantees the value is defined inside `fn`, you still need a non-null assertion (`!`).

#### Query Parameters

```typescript
queryBuilder(productMappings)
  .match('name', 'laptop')
  .from(0) // Pagination offset
  .size(20) // Results per page
  .sort('price', 'asc') // Sort by field
  ._source(['name', 'price']) // Which fields to return
  .timeout('5s') // Query timeout
  .trackScores(true) // Enable scoring in filter context
  .trackTotalHits(true) // Track total hit count (or pass a number threshold)
  .explain(true) // Return scoring explanation
  .minScore(10) // Minimum relevance score
  .version(true) // Include document version in results
  .seqNoPrimaryTerm(true) // Include seq_no and primary_term for optimistic concurrency
  .highlight(['name', 'description'], {
    fragment_size: 150,
    pre_tags: ['<mark>'],
    post_tags: ['</mark>']
  })
  .build();
```

### Aggregations

Aggregations can be combined with queries via `.aggs()` or used standalone with the `aggregations()` builder.

```typescript
import { queryBuilder, aggregations } from 'elasticlink';

// Inline aggregations (most common)
const result = queryBuilder(productMappings)
  .term('category', 'electronics')
  .aggs((agg) =>
    agg
      .terms('by_category', 'category', { size: 10 })
      .subAgg((sub) => sub.avg('avg_price', 'price').max('max_price', 'price'))
  )
  .size(20)
  .build();

// Aggregations-only (no query) — use queryBuilder(mappings, false)
const aggsOnly = queryBuilder(productMappings, false)
  .aggs((agg) => agg.terms('by_category', 'category'))
  .size(0)
  .build();

// Standalone aggregation builder (for manual composition)
const standaloneAgg = aggregations(productMappings)
  .avg('avg_price', 'price')
  .terms('by_category', 'category', { size: 10 })
  .build();
```

#### Aggregation Methods

| Category      | Methods                                                                                                                                                                    | Description                                                          |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| **Bucket**    | `terms`, `dateHistogram`, `histogram`, `range`, `dateRange`, `filters`, `significantTerms`, `rareTerms`, `multiTerms`, `autoDateHistogram`, `composite`, `filter`, `missing`, `geoDistance`, `geohashGrid`, `geotileGrid` | Group documents into buckets |
| **Metric**    | `avg`, `sum`, `min`, `max`, `cardinality`, `percentiles`, `stats`, `valueCount`, `extendedStats`, `topHits`, `topMetrics`, `weightedAvg`, `geoBounds`, `geoCentroid`       | Compute metrics over documents                                       |
| **Pipeline**  | `derivative`, `cumulativeSum`, `bucketScript`, `bucketSelector`                                                                                                            | Compute over other aggregation results                               |
| **Structure** | `subAgg`, `nested`, `reverseNested`, `global`                                                                                                                              | Nest aggregations, navigate nested fields, or escape to global scope |

`subAgg()` attaches sub-aggregations to the **last** aggregation defined before the call — chain order matters. See [`aggregation.types.ts`](src/aggregation.types.ts) for complete option types.

### Index Management

Configure index mappings, settings, and aliases declaratively with `indexBuilder()`.

```typescript
import { indexBuilder, mappings, keyword, integer, float, date, text } from 'elasticlink';

const matterMappings = mappings({
  title: text({ analyzer: 'english' }),
  practice_area: keyword(),
  billing_rate: integer(),
  risk_score: float(),
  opened_at: date()
});

const indexConfig = indexBuilder()
  .mappings(matterMappings)
  .settings({
    number_of_shards: 2,
    number_of_replicas: 1,
    refresh_interval: '5s'
  })
  .alias('matters-current', { is_write_index: true })
  .alias('matters-all')
  .build();

// PUT /matters-v1
await client.indices.create({ index: 'matters-v1', ...indexConfig });
```

<details>
<summary><b>Produced DSL</b> (click to expand)</summary>

```json
{
  "mappings": {
    "properties": {
      "title": { "type": "text", "analyzer": "english" },
      "practice_area": { "type": "keyword" },
      "billing_rate": { "type": "integer" },
      "risk_score": { "type": "float" },
      "opened_at": { "type": "date" }
    }
  },
  "settings": {
    "number_of_shards": 2,
    "number_of_replicas": 1,
    "refresh_interval": "5s"
  },
  "aliases": {
    "matters-current": { "is_write_index": true },
    "matters-all": {}
  }
}
```

</details>

#### IndexBuilder Methods

| Method                               | Description                                                                    |
| ------------------------------------ | ------------------------------------------------------------------------------ |
| `mappings(schemaOrFields, options?)` | Set index mappings from a `MappingsSchema` or raw field definitions            |
| `settings(settings)`                 | Set index settings (`IndicesIndexSettings` from `@elastic/elasticsearch`)      |
| `analysis(config)`                   | Configure custom analyzers, tokenizers, filters, char filters, and normalizers |
| `alias(name, options?)`              | Add an index alias with optional filter, routing, and write index settings     |
| `build()`                            | Returns the final `CreateIndexOptions` object                                  |

#### Object and Nested Fields

Use `object()` for structured sub-documents queried with dot-notation. Use `nested()` for arrays of objects where cross-field queries within the same element must be accurate.

```typescript
import { mappings, text, keyword, float, integer, boolean, object, nested, type Infer } from 'elasticlink';

const productMappings = mappings({
  name: text(),
  in_stock: boolean(),
  address: object({
    // Single structured value — queried with dot-notation
    street: text(),
    city: keyword(),
    country: keyword()
  }),
  variants: nested({
    // Array of objects — cross-field accuracy preserved
    sku: keyword(),
    color: keyword(),
    price: float(),
    stock: integer()
  })
});

type Product = Infer<typeof productMappings>;
// { name: string; in_stock: boolean;
//   address: { street: string; city: string; country: string };
//   variants: Array<{ sku: string; color: string; price: number; stock: number }> }

// object sub-fields — query with dot-notation directly
queryBuilder(productMappings)
  .bool()
  .filter((q) => q.term('address.country', 'US'))
  .filter((q) => q.match('address.street', 'Main'))
  .build();

// nested sub-fields — must use .nested() wrapper; field names are relative
queryBuilder(productMappings)
  .nested('variants', (q) => q.term('color', 'black'))
  .build();

queryBuilder(productMappings)
  .nested('variants', (q) => q.range('price', { lte: 150 }), { score_mode: 'min' })
  .build();
```

> **Inner field names are relative.** Inside a `.nested()` callback, you write field names relative to the nested path (e.g. `'color'`, not `'variants.color'`). The library automatically qualifies them in the generated DSL.

#### Field Helpers

| Category   | Helpers                                                                                           |
| ---------- | ------------------------------------------------------------------------------------------------- |
| Text       | `text`, `keyword`, `constantKeyword`, `matchOnlyText`, `searchAsYouType`, `wildcardField`         |
| Numeric    | `long`, `integer`, `short`, `byte`, `double`, `float`, `halfFloat`, `scaledFloat`, `unsignedLong` |
| Date       | `date`, `dateNanos`                                                                               |
| Boolean    | `boolean`                                                                                         |
| Binary     | `binary`                                                                                          |
| IP         | `ip`                                                                                              |
| Range      | `integerRange`, `floatRange`, `longRange`, `doubleRange`, `dateRange`, `ipRange`                  |
| Objects    | `object`, `nested`, `flattened`                                                                   |
| Spatial    | `geoPoint`, `geoShape`                                                                            |
| Vector     | `denseVector`, `quantizedDenseVector`, `sparseVector`                                             |
| Rank       | `rankFeature`, `rankFeatures`                                                                     |
| Semantic   | `semanticText`                                                                                    |
| Completion | `completion`                                                                                      |
| Special    | `percolator`, `alias`, `tokenCount`, `murmur3Hash`, `join`                                        |

```typescript
// Shorthand — pass options or use defaults
keyword(); // { type: 'keyword' }
integer(); // { type: 'integer' }
text({ analyzer: 'english' }); // { type: 'text', analyzer: 'english' }
denseVector({ dims: 384, index: true, similarity: 'cosine' });

// Multi-fields carry type info — dot-notation paths work in queries
const m = mappings({
  name: text({ fields: { raw: keyword() } }),
  price: float({ fields: { string: keyword() } }),
});
const qb = queryBuilder(m);
qb.term('name.raw', 'exact match'); // ✓ name.raw is a KeywordFields<M> path
qb.match('name', 'full text');      // ✓ name is a TextFields<M> path
```

See [`field.types.ts`](src/field.types.ts) for all field helper option types.

<details>
<summary><b>Mapping Properties Reference</b> (click to expand)</summary>

| Option                         | Types                  | Description                                                                          |
| ------------------------------ | ---------------------- | ------------------------------------------------------------------------------------ |
| `analyzer`                     | `text`                 | Index-time analyzer                                                                  |
| `search_analyzer`              | `text`                 | Query-time analyzer (overrides `analyzer`)                                           |
| `normalizer`                   | `keyword`              | Keyword normalizer (e.g. lowercase)                                                  |
| `index`                        | most types             | Whether to index the field (default: `true`)                                         |
| `store`                        | most types             | Store field value separately (default: `false`)                                      |
| `doc_values`                   | most types             | Enable doc values for sorting/aggregations                                           |
| `boost`                        | text, keyword, numeric | Index-time boost factor                                                              |
| `coerce`                       | numeric, range         | Convert strings to numbers (default: `true`)                                         |
| `format`                       | `date`                 | Date format string (e.g. `"yyyy-MM-dd"`)                                             |
| `scaling_factor`               | `scaledFloat`          | Required multiplier for scaled floats                                                |
| `dims`                         | `denseVector`          | Number of dimensions (required for KNN indexing)                                     |
| `similarity`                   | `denseVector`          | Similarity function: `'cosine'`, `'dot_product'`, `'l2_norm'`, `'max_inner_product'` |
| `element_type`                 | `denseVector`          | Element type: `'float'` (default), `'byte'`, `'bit'`                                 |
| `fields`                       | text, keyword, numeric, date | Multi-fields — type-safe dot-notation paths (e.g. `name.raw`) in query constraints |
| `properties`                   | object, nested         | Sub-field mappings                                                                   |
| `enabled`                      | `object`               | Disable indexing of object fields                                                    |
| `path`                         | `alias`                | Path to the target field                                                             |
| `max_input_length`             | `completion`           | Max input length for completion suggestions                                          |
| `preserve_separators`          | `completion`           | Preserve separator characters                                                        |
| `preserve_position_increments` | `completion`           | Preserve position increments                                                         |
| `orientation`                  | `geoShape`             | Default orientation for polygons                                                     |

</details>

<details>
<summary><b>Index Settings Reference</b> (click to expand)</summary>

The `.settings()` method accepts the full `IndicesIndexSettings` type from `@elastic/elasticsearch`. Common options:

| Setting              | Type     | Description                                       |
| -------------------- | -------- | ------------------------------------------------- |
| `number_of_shards`   | `number` | Primary shard count (set at creation, immutable)  |
| `number_of_replicas` | `number` | Replica count (can be changed after creation)     |
| `refresh_interval`   | `string` | How often to refresh (`'1s'`, `'-1s'` to disable) |
| `max_result_window`  | `number` | Max `from + size` (default: 10000)                |
| `analysis`           | `object` | Custom analyzers, tokenizers, filters             |
| `codec`              | `string` | Compression codec (`'best_compression'`)          |

</details>

<details>
<summary><b>Alias Options Reference</b> (click to expand)</summary>

The `.alias()` method accepts an optional `IndicesAlias` object:

| Option           | Type      | Description                                                  |
| ---------------- | --------- | ------------------------------------------------------------ |
| `filter`         | `object`  | Query filter — only matching documents visible through alias |
| `is_write_index` | `boolean` | Designate this index as the write target for the alias       |
| `routing`        | `string`  | Custom routing value for alias operations                    |
| `index_routing`  | `string`  | Routing value for index operations only                      |
| `search_routing` | `string`  | Routing value for search operations only                     |
| `is_hidden`      | `boolean` | Hide alias from wildcard expressions                         |

</details>

### Suggesters & Autocomplete

`suggest(schema)` creates a standalone suggester builder. Suggesters can also be attached inline via `queryBuilder().suggest(fn)`.

```typescript
import { queryBuilder, suggest, mappings, text, keyword, completion } from 'elasticlink';

const searchableMappings = mappings({
  name: text(),
  description: text(),
  suggest_field: completion()
});

// Standalone suggest
const autocomplete = suggest(searchableMappings)
  .completion('autocomplete', 'lap', {
    field: 'suggest_field',
    size: 10,
    skip_duplicates: true,
    fuzzy: { fuzziness: 'AUTO', min_length: 3, prefix_length: 1 }
  })
  .build();

// Inline with query — search + spell-check in one request
const searchWithSuggestions = queryBuilder(searchableMappings)
  .match('name', 'laptpo')
  .suggest((s) =>
    s
      .completion('autocomplete', 'lap', { field: 'suggest_field', size: 5 })
      .term('spelling', 'laptpo', { field: 'name', size: 3, suggest_mode: 'popular' })
  )
  .size(20)
  .build();
```

| Method                              | Description                                                         |
| ----------------------------------- | ------------------------------------------------------------------- |
| `term(name, text, options)`         | Suggest corrections for individual terms based on edit distance     |
| `phrase(name, text, options)`       | Suggest corrections for entire phrases using n-gram language models |
| `completion(name, prefix, options)` | Fast prefix-based autocomplete (requires `completion` field type)   |
| `build()`                           | Returns `{ suggest: ... }` object                                   |

See [`suggester.types.ts`](src/suggester.types.ts) for complete option types (`TermSuggesterOptions`, `PhraseSuggesterOptions`, `CompletionSuggesterOptions`).

### Multi-Search

`msearch(schema)` batches multiple search requests into a single API call using NDJSON format.

```typescript
import { queryBuilder, msearch } from 'elasticlink';

const laptopQuery = queryBuilder(productMappings).match('name', 'laptop').range('price', { gte: 500, lte: 2000 }).build();

const phoneQuery = queryBuilder(productMappings).match('name', 'smartphone').range('price', { gte: 300, lte: 1000 }).build();

// NDJSON string for Elasticsearch _msearch endpoint
const ndjson = msearch(productMappings)
  .addQuery(laptopQuery, { index: 'products', preference: '_local' })
  .addQuery(phoneQuery, { index: 'products', preference: '_local' })
  .build();

// Or as an array of objects
const array = msearch(productMappings)
  .addQuery(laptopQuery, { index: 'products' })
  .addQuery(phoneQuery, { index: 'products' })
  .buildArray();
```

| Method                         | Description                            |
| ------------------------------ | -------------------------------------- |
| `add(request)`                 | Add a raw request (header + body)      |
| `addQuery(body, header?)`      | Add a built query with optional header |
| `addQueryBuilder(qb, header?)` | Add a QueryBuilder instance directly   |
| `withParams(params)`           | Set shared request parameters          |
| `build()`                      | Returns NDJSON string                  |
| `buildArray()`                 | Returns array of header/body pairs     |
| `buildParams()`                | Returns shared request parameters      |

Header options: `index`, `routing`, `preference`, `search_type`. See [`multi-search.types.ts`](src/multi-search.types.ts) for full types.

### Bulk Operations

`bulk(schema)` batches create, index, update, and delete operations efficiently.

```typescript
import { bulk, mappings, keyword, text, float } from 'elasticlink';

const productMappings = mappings({
  id: keyword(),
  name: text(),
  price: float(),
  category: keyword()
});

const bulkOp = bulk(productMappings)
  .index({ id: '1', name: 'Laptop Pro', price: 1299, category: 'electronics' }, { _index: 'products', _id: '1' })
  .create({ id: '2', name: 'Wireless Mouse', price: 29, category: 'accessories' }, { _index: 'products', _id: '2' })
  .update({ _index: 'products', _id: '3', doc: { price: 999 } })
  .delete({ _index: 'products', _id: '4' })
  .build();

// POST /_bulk with Content-Type: application/x-ndjson
```

| Method               | Description                                                                    |
| -------------------- | ------------------------------------------------------------------------------ |
| `index(doc, meta?)`  | Index a document (create or replace)                                           |
| `create(doc, meta?)` | Create a document (fail if exists)                                             |
| `update(meta)`       | Update with `doc`, `script`, `upsert`, `doc_as_upsert`, or `retry_on_conflict` |
| `delete(meta)`       | Delete a document                                                              |
| `build()`            | Returns NDJSON string                                                          |
| `buildArray()`       | Returns array of action/document pairs                                         |

### Vector Search & Semantic Search

KNN (k-nearest neighbors) queries enable semantic search using vector embeddings.

```typescript
import { queryBuilder, mappings, text, keyword, float, denseVector } from 'elasticlink';

const productWithEmbeddingMappings = mappings({
  name: text(),
  description: text(),
  price: float(),
  category: keyword(),
  embedding: denseVector({ dims: 384 })
});

const searchEmbedding = [0.23, 0.45, 0.67, 0.12, 0.89]; // From your ML model

// Basic semantic search
const result = queryBuilder(productWithEmbeddingMappings)
  .knn('embedding', searchEmbedding, {
    k: 10,
    num_candidates: 100
  })
  .size(10)
  .build();

// Hybrid search — KNN + filters + aggregations
const hybridSearch = queryBuilder(productWithEmbeddingMappings)
  .knn('embedding', searchEmbedding, {
    k: 100,
    num_candidates: 1000,
    filter: { term: { category: 'electronics' } },
    boost: 1.2,
    similarity: 0.7
  })
  .aggs((agg) => agg.terms('categories', 'category', { size: 10 }))
  .size(20)
  .build();
```

Additional vector and relevance methods: `sparseVector(field, options)` for learned sparse retrieval, `rankFeature(field, options?)` for rank feature scoring, and `distanceFeature(field, options)` for recency/proximity decay functions.

### Script Queries & Custom Scoring

Script-based filtering and custom scoring for advanced relevance tuning.

```typescript
import { queryBuilder, mappings, text, float, long } from 'elasticlink';

const scoredProductMappings = mappings({
  name: text(),
  price: float(),
  popularity: long()
});

// Script-based filtering
const filtered = queryBuilder(scoredProductMappings)
  .bool()
  .must((q) => q.match('name', 'laptop'))
  .filter((q) =>
    q.script({
      source: "doc['price'].value > params.threshold",
      params: { threshold: 500 }
    })
  )
  .build();

// Custom scoring with script_score
const customScored = queryBuilder(scoredProductMappings)
  .scriptScore((q) => q.match('name', 'smartphone'), {
    source: "_score * Math.log(2 + doc['popularity'].value)",
    lang: 'painless'
  })
  .size(20)
  .build();
```

### Percolate Queries

Percolate queries enable reverse search — match documents against stored queries.

```typescript
import { queryBuilder, mappings, keyword, percolator } from 'elasticlink';

const alertRuleMappings = mappings({
  query: percolator(),
  name: keyword(),
  severity: keyword()
});

const alerts = queryBuilder(alertRuleMappings)
  .percolate({
    field: 'query',
    document: {
      level: 'ERROR',
      message: 'Database connection failed',
      timestamp: '2024-01-15T10:30:00Z'
    }
  })
  .size(100)
  .build();
```

**Common use cases:** alerting (match events against rules), content classification, saved search notifications, and metric threshold monitoring.

## Compatibility

| elasticlink  | Node.js    | Elasticsearch |
| ------------ | ---------- | ------------- |
| 1.0.0-beta.2 | 20, 22, 24 | 9.x (≥9.0.0) |

Tested against the versions listed. Peer dependency is `@elastic/elasticsearch >=9.0.0`.

## Development

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup, design principles, and code style.

## License

MIT © 2026 misterrodger

## Support

- [Documentation](https://github.com/misterrodger/elasticlink#readme)
- [Report Issues](https://github.com/misterrodger/elasticlink/issues)
