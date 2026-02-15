# elasticlink

> **Beta**: elasticlink is in active beta. APIs may change before the first stable release.

[![npm version](https://img.shields.io/npm/v/elasticlink.svg)](https://www.npmjs.com/package/elasticlink)
[![Build Status](https://github.com/misterrodger/elasticlink/actions/workflows/ci.yml/badge.svg)](https://github.com/misterrodger/elasticlink/actions)
[![codecov](https://codecov.io/gh/misterrodger/elasticlink/branch/main/graph/badge.svg)](https://codecov.io/gh/misterrodger/elasticlink)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **Type-safe, fluent API for Elasticsearch queries and index management**

elasticlink simplifies building Elasticsearch queries and index management in TypeScript. Write type-checked queries that compile to valid Elasticsearch DSL with zero runtime overhead.

## Features

- **Type-Safe**: Full TypeScript generics for field autocomplete and type checking
- **Fluent API**: Chainable query builder with intuitive method names
- **Zero Runtime Overhead**: Compiles directly to Elasticsearch DSL objects
- **Well-Tested**: Comprehensive unit and integration test suite against live Elasticsearch
- **Great DX**: Excellent IntelliSense and error messages
- **Types from the source**: Types derived directly from `@elastic/elasticsearch` for accuracy and automatic alignment with Elasticsearch updates

## Compatibility

| elasticlink | Node.js | Elasticsearch |
|-------------|---------|---------------|
| 0.2.0-beta  | 20, 22  | 9.x (≥9.0.0)  |
| 0.1.0-beta  | 20, 22  | 9.x (≥9.0.0)  |

Tested against the versions listed. Peer dependency is `@elastic/elasticsearch >=9.0.0`. Open an issue if you need support for a different version.

## Installation

```bash
npm install elasticlink @elastic/elasticsearch
```

Requires Node.js 20+ and `@elastic/elasticsearch` 9.x as a peer dependency.

> **Note:** elasticlink derives its types directly from the official `@elastic/elasticsearch` package for accuracy, completeness, and automatic alignment with Elasticsearch updates. This is a **compile-time only** dependency — it adds zero runtime overhead. If you're already using the Elasticsearch client, you're all set. If not, install it as a dev dependency: `npm install -D @elastic/elasticsearch`.

## Quick Start

```typescript
import { query } from 'elasticlink';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

// Build a type-safe query
const q = query<Product>()
  .match('name', 'laptop', { operator: 'and', boost: 2 })
  .range('price', { gte: 500, lte: 2000 })
  .from(0)
  .size(20)
  .build();

// Send to Elasticsearch
const response = await client.search({ index: 'products', ...q });
```

## API Overview

### Core Query Methods

#### Basic Queries

- `match(field, value, options?)` - Full-text search
- `multiMatch(fields, query, options?)` - Search multiple fields
- `matchPhrase(field, query)` - Exact phrase matching
- `matchPhrasePrefix(field, query, options?)` - Prefix phrase matching (search-as-you-type)
- `term(field, value)` - Exact term matching
- `terms(field, values)` - Multiple exact values
- `range(field, conditions)` - Range queries (gte, lte, gt, lt)
- `exists(field)` - Field existence check
- `wildcard(field, pattern)` - Wildcard pattern matching
- `prefix(field, value)` - Prefix matching
- `fuzzy(field, value, options?)` - Typo tolerance
- `ids(values)` - Match by document IDs
- `matchAll()` - Match all documents

#### Geo Queries

- `geoDistance(field, center, options)` - Distance-based search
- `geoBoundingBox(field, options)` - Bounding box search
- `geoPolygon(field, options)` - Polygon search

#### Vector Search (KNN)

- `knn(field, queryVector, options)` - K-nearest neighbors semantic search

#### Advanced Queries

- `nested(path, fn, options?)` - Nested object queries
- `regexp(field, pattern, options?)` - Regular expression matching
- `constantScore(fn, options?)` - Constant scoring for filters
- `script(options)` - Script-based filtering
- `scriptScore(query, script, options?)` - Custom scoring with scripts
- `percolate(options)` - Match documents against stored queries

#### Suggestions & Autocomplete

- `suggest(fn)` - Add query suggestions (term, phrase, completion)
- `term(name, text, options)` - Term-level spell checking
- `phrase(name, text, options)` - Phrase-level corrections
- `completion(name, prefix, options)` - Fast autocomplete

### Boolean Logic

```typescript
query<Product>()
  .bool()
  .must(q => q.match('name', 'laptop'))      // AND
  .filter(q => q.range('price', { gte: 500 }))
  .should(q => q.term('featured', true))     // OR
  .mustNot(q => q.term('discontinued', true)) // NOT
  .minimumShouldMatch(1)
  .build();
```

### Conditional Building

Build queries dynamically based on runtime values:

```typescript
const searchTerm = getUserInput();
const minPrice = getMinPrice();

query<Product>()
  .bool()
  .must(q =>
    q.when(searchTerm, q => q.match('name', searchTerm)) || q.matchAll()
  )
  .filter(q =>
    q.when(minPrice, q => q.range('price', { gte: minPrice })) || q.matchAll()
  )
  .build();
```

### Query Parameters

```typescript
query<Product>()
  .match('name', 'laptop')
  .from(0)                          // Pagination offset
  .size(20)                         // Results per page
  .sort('price', 'asc')             // Sort by field
  ._source(['name', 'price'])       // Which fields to return
  .timeout('5s')                    // Query timeout
  .trackScores(true)                // Enable scoring in filter context
  .trackTotalHits(true)             // Track total hit count (or pass a number threshold)
  .explain(true)                    // Return scoring explanation
  .minScore(10)                     // Minimum relevance score
  .version(true)                    // Include document version in results
  .seqNoPrimaryTerm(true)           // Include seq_no and primary_term for optimistic concurrency
  .highlight(['name', 'description'], {
    fragment_size: 150,             // Per-field options (fragment_size, number_of_fragments, etc.)
    pre_tags: ['<mark>'],           // Top-level highlight options
    post_tags: ['</mark>']
  })
  .build();
```

### Aggregations

Aggregations can be combined with queries or used standalone:

- **Bucket**: `terms()`, `dateHistogram()`, `histogram()`, `range()`
- **Metric**: `avg()`, `sum()`, `min()`, `max()`, `cardinality()`, `percentiles()`, `stats()`, `valueCount()`
- **Composition**: `subAgg()` for nested aggregations

```typescript
import { query, aggregations } from 'elasticlink';

// Combined query + aggregations
const result = query<Product>()
  .match('category', 'electronics')
  .aggs(agg =>
    agg
      .terms('by_category', 'category', { size: 10 })
      .avg('avg_price', 'price')
  )
  .size(20)
  .build();

// Standalone aggregations (no query) - use query(false)
const aggsOnly = query<Product>(false)
  .aggs(agg =>
    agg
      .terms('by_category', 'category')
      .subAgg(sub =>
        sub.avg('avg_price', 'price').max('max_price', 'price')
      )
  )
  .size(0)  // Common pattern: size=0 when only wanting agg results
  .build();

// Standalone aggregation builder (for manual composition)
const standaloneAgg = aggregations<Product>()
  .dateHistogram('sales_timeline', 'created_at', { interval: 'day' })
  .subAgg(sub =>
    sub.sum('daily_revenue', 'price')
       .cardinality('unique_categories', 'category')
  )
  .build();
```

### Vector Search & Semantic Search

**Requires Elasticsearch 8.0+**

KNN (k-nearest neighbors) queries enable semantic search using vector embeddings from machine learning models.

```typescript
import { query } from 'elasticlink';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  embedding: number[]; // Vector field
};

// Basic semantic search
const searchEmbedding = [0.23, 0.45, 0.67, 0.12, 0.89]; // From your ML model

const result = query<Product>()
  .knn('embedding', searchEmbedding, {
    k: 10,              // Return top 10 nearest neighbors
    num_candidates: 100 // Consider 100 candidates per shard
  })
  .size(10)
  .build();

// Semantic search with filters
const filtered = query<Product>()
  .knn('embedding', searchEmbedding, {
    k: 20,
    num_candidates: 200,
    filter: {
      bool: {
        must: [{ term: { category: 'electronics' } }],
        filter: [{ range: { price: { gte: 100, lte: 1000 } } }]
      }
    },
    boost: 1.2,       // Boost relevance scores
    similarity: 0.7   // Minimum similarity threshold
  })
  .size(20)
  .build();

// Hybrid search with aggregations
const hybridSearch = query<Product>()
  .knn('embedding', searchEmbedding, {
    k: 100,
    num_candidates: 1000,
    filter: { term: { category: 'electronics' } }
  })
  .aggs(agg =>
    agg
      .terms('categories', 'category', { size: 10 })
      .range('price_ranges', 'price', {
        ranges: [
          { to: 100 },
          { from: 100, to: 500 },
          { from: 500 }
        ]
      })
  )
  .size(20)
  .build();
```

**Common Vector Dimensions:**
- **384-768**: Sentence transformers (all-MiniLM, all-mpnet)
- **512**: Image embeddings (ResNet, ViT)
- **1536**: OpenAI text-embedding-ada-002
- **3072**: OpenAI text-embedding-3-large

**Dense Vector Field Mapping Example:**
```typescript
import type { DenseVectorOptions } from 'elasticlink';

const mapping: DenseVectorOptions = {
  dims: 384,
  index: true,
  similarity: 'cosine', // 'l2_norm', 'dot_product', or 'cosine'
  index_options: {
    type: 'hnsw',
    m: 16,
    ef_construction: 100
  }
};
```

### Script Queries & Custom Scoring

**Note:** Scripts must be enabled in Elasticsearch configuration. Use with caution as they can impact performance.

```typescript
import { query } from 'elasticlink';

type Product = {
  id: string;
  name: string;
  price: number;
  popularity: number;
  quality_score: number;
};

// Script-based filtering
const filtered = query<Product>()
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
const customScored = query<Product>()
  .scriptScore(
    (q) => q.match('name', 'smartphone'),
    {
      source: "_score * Math.log(2 + doc['popularity'].value)",
      lang: 'painless'
    }
  )
  .size(20)
  .build();
```

**Script Languages:**
- **painless** (default): Elasticsearch's primary scripting language
- **expression**: Fast, limited expression language
- **mustache**: Template-based scripting

### Percolate Queries

Percolate queries enable reverse search - match documents against stored queries. Perfect for alerting, content classification, and saved searches.

```typescript
type AlertRule = {
  query: any;
  name: string;
  severity: string;
};

// Match document against stored queries
const alerts = query<AlertRule>()
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

**Common Use Cases:**

- **Alerting:** Match events against alert rules
- **Content Classification:** Categorize documents in real-time
- **Saved Searches:** Notify users when new content matches their searches
- **Monitoring:** Trigger actions based on metric thresholds

### Query Suggestions & Autocomplete

Elasticsearch Suggesters provide spell-checking, phrase correction, and autocomplete functionality. Perfect for search-as-you-type experiences and fixing user typos.

```typescript
import { query, suggest } from 'elasticlink';

type Product = {
  name: string;
  description: string;
  suggest_field: string; // Must be type: completion
};

// Term suggester - Fix typos in individual terms
const termSuggestions = suggest<Product>()
  .term('name-suggestions', 'laptpo', {
    field: 'name',
    size: 5,
    suggest_mode: 'popular', // 'missing' | 'popular' | 'always'
    string_distance: 'levenshtein',
    max_edits: 2
  })
  .build();

// Completion suggester - Fast autocomplete
const autocomplete = suggest<Product>()
  .completion('autocomplete', 'lap', {
    field: 'suggest_field',
    size: 10,
    skip_duplicates: true,
    fuzzy: {
      fuzziness: 'AUTO',
      transpositions: true,
      min_length: 3,
      prefix_length: 1
    }
  })
  .build();

// Combine with query - Search with autocomplete
const searchWithSuggestions = query<Product>()
  .match('name', 'laptpo')
  .suggest((s) =>
    s.term('spelling-correction', 'laptpo', {
      field: 'name',
      size: 3,
      suggest_mode: 'popular'
    })
  )
  .size(20)
  .build();
```

**Suggester Types:**

- **Term:** Suggests corrections for individual terms based on edit distance
- **Phrase:** Suggests corrections for entire phrases using n-gram language models
- **Completion:** Fast prefix-based autocomplete (requires `completion` field type)

### Multi-Search API

Batch multiple search requests in a single API call using the NDJSON format.

```typescript
import { query, msearch } from 'elasticlink';

const laptopQuery = query<Product>()
  .match('name', 'laptop')
  .range('price', { gte: 500, lte: 2000 })
  .build();

const phoneQuery = query<Product>()
  .match('name', 'smartphone')
  .range('price', { gte: 300, lte: 1000 })
  .build();

// Build as NDJSON string for Elasticsearch API
const ndjson = msearch<Product>()
  .addQuery(laptopQuery, { index: 'products', preference: '_local' })
  .addQuery(phoneQuery, { index: 'products', preference: '_local' })
  .build();

// Or build as array of objects
const array = msearch<Product>()
  .addQuery(laptopQuery, { index: 'products' })
  .addQuery(phoneQuery, { index: 'products' })
  .buildArray();
```

**NDJSON Format (for Elasticsearch `_msearch` endpoint):**

```ndjson
{"index":"products","preference":"_local"}
{"query":{"bool":{"must":[{"match":{"name":"laptop"}},{"range":{"price":{"gte":500,"lte":2000}}}]}}}
{"index":"products","preference":"_local"}
{"query":{"bool":{"must":[{"match":{"name":"smartphone"}},{"range":{"price":{"gte":300,"lte":1000}}}]}}}

```

**Header Options:**

- `index`: Target index/indices (string or array)
- `routing`: Routing value for sharding
- `preference`: Node preference (\_local, \_primary, etc.)
- `search_type`: Search type (dfs_query_then_fetch, etc.)

### Bulk Operations

Batch create, index, update, and delete operations efficiently.

```typescript
import { bulk } from 'elasticlink';

type Product = {
  id: string;
  name: string;
  price: number;
  category: string;
};

const bulkOp = bulk<Product>()
  // Index (create or replace)
  .index(
    { id: '1', name: 'Laptop Pro', price: 1299, category: 'electronics' },
    { _index: 'products', _id: '1' }
  )
  // Create (fail if exists)
  .create(
    { id: '2', name: 'Wireless Mouse', price: 29, category: 'accessories' },
    { _index: 'products', _id: '2' }
  )
  // Update (partial document)
  .update({
    _index: 'products',
    _id: '3',
    doc: { price: 999 }
  })
  // Delete
  .delete({ _index: 'products', _id: '4' })
  .build();

// POST /_bulk with Content-Type: application/x-ndjson
```

**NDJSON Format:**

```ndjson
{"index":{"_index":"products","_id":"1"}}
{"id":"1","name":"Laptop Pro","price":1299,"category":"electronics"}
{"create":{"_index":"products","_id":"2"}}
{"id":"2","name":"Wireless Mouse","price":29,"category":"accessories"}
{"update":{"_index":"products","_id":"3"}}
{"doc":{"price":999}}
{"delete":{"_index":"products","_id":"4"}}

```

**Update Options:**

- `doc`: Partial document merge
- `script`: Script-based update (Painless)
- `upsert`: Document to insert if not exists
- `doc_as_upsert`: Use doc as upsert document
- `retry_on_conflict`: Retry count for version conflicts

### Index Management

Configure index mappings, settings, and aliases declaratively.

```typescript
import { indexBuilder, keyword, integer, float, date, text } from 'elasticlink';

type Matter = {
  title: string;
  practice_area: string;
  billing_rate: number;
  risk_score: number;
  opened_at: string;
};

const indexConfig = indexBuilder<Matter>()
  .mappings({
    title: text({ analyzer: 'english' }),
    practice_area: keyword(),
    billing_rate: integer(),
    risk_score: float(),
    opened_at: date()
  })
  .settings({
    number_of_shards: 2,
    number_of_replicas: 1,
    refresh_interval: '5s'
  })
  .alias('matters-current', { is_write_index: true })
  .alias('matters-all')
  .build();

// PUT /matters-v1
// Content-Type: application/json
// Body: JSON.stringify(indexConfig)
```

Produces:

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

**Field Helpers** (shorthand for common field types):

```typescript
import { text, keyword, integer, float, double, date, boolean, denseVector, scaledFloat, halfFloat } from 'elasticlink';

// Shorthand — pass options or use defaults
keyword()                        // { type: 'keyword' }
integer()                        // { type: 'integer' }
float()                          // { type: 'float' }
date()                           // { type: 'date' }
text({ analyzer: 'english' })    // { type: 'text', analyzer: 'english' }
denseVector({ dims: 384, index: true, similarity: 'cosine' })
```

#### Field Types (25+ supported)

| Category    | Helpers                                                                                                 |
| ----------- | ------------------------------------------------------------------------------------------------------- |
| Text        | `text`, `keyword`, `constantKeyword`                                                                    |
| Numeric     | `long`, `integer`, `short`, `byte`, `double`, `float`, `halfFloat`, `scaledFloat`                       |
| Date        | `date`, `dateNanos`                                                                                     |
| Boolean     | `boolean`                                                                                               |
| Range       | `integerRange`, `floatRange`, `longRange`, `doubleRange`, `dateRange`                                   |
| Objects     | `object`, `nested`, `flattened`                                                                         |
| Spatial     | `geoPoint`, `geoShape`                                                                                  |
| Specialized | `ip`, `completion`, `tokenCount`, `denseVector`, `rankFeature`, `rankFeatures`, `binary`, `percolator`  |
| Alias       | `alias`                                                                                                 |

#### Mapping Properties

All field helpers accept an optional options object. Common options across types:

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
| `fields`                       | text, keyword          | Multi-fields for indexing the same value in multiple ways                            |
| `properties`                   | object, nested         | Sub-field mappings                                                                   |
| `enabled`                      | `object`               | Disable indexing of object fields                                                    |
| `path`                         | `alias`                | Path to the target field                                                             |
| `max_input_length`             | `completion`           | Max input length for completion suggestions                                          |
| `preserve_separators`          | `completion`           | Preserve separator characters                                                        |
| `preserve_position_increments` | `completion`           | Preserve position increments                                                         |
| `orientation`                  | `geoShape`             | Default orientation for polygons                                                     |

#### Index Settings

The `.settings()` method accepts the full `IndicesIndexSettings` type from `@elastic/elasticsearch`. Common options:

| Setting              | Type     | Description                                        |
| -------------------- | -------- | -------------------------------------------------- |
| `number_of_shards`   | `number` | Primary shard count (set at creation, immutable)   |
| `number_of_replicas` | `number` | Replica count (can be changed after creation)      |
| `refresh_interval`   | `string` | How often to refresh (`'1s'`, `'-1s'` to disable)  |
| `max_result_window`  | `number` | Max `from + size` (default: 10000)                 |
| `analysis`           | `object` | Custom analyzers, tokenizers, filters              |
| `codec`              | `string` | Compression codec (`'best_compression'`)           |

#### Alias Options

The `.alias()` method accepts an optional `IndicesAlias` object:

| Option            | Type      | Description                                                       |
| ----------------- | --------- | ----------------------------------------------------------------- |
| `filter`          | `object`  | Query filter — only matching documents visible through alias      |
| `is_write_index`  | `boolean` | Designate this index as the write target for the alias            |
| `routing`         | `string`  | Custom routing value for alias operations                         |
| `index_routing`   | `string`  | Routing value for index operations only                           |
| `search_routing`  | `string`  | Routing value for search operations only                          |
| `is_hidden`       | `boolean` | Hide alias from wildcard expressions                              |

## Examples

More examples available in [src/\_\_tests\_\_/examples.test.ts](src/__tests__/examples.test.ts).

### E-commerce Product Search

A complete search request: boolean query with must/filter/should, aggregations for facets and price ranges, highlights, `_source` filtering, and pagination.

```typescript
type Product = {
  name: string;
  description: string;
  category: string;
  price: number;
  tags: string[];
  in_stock: boolean;
};

const searchTerm = 'gaming laptop';
const category = 'electronics';
const minPrice = 800;
const maxPrice = 2000;

const result = query<Product>()
  .bool()
  .must(q => q.match('name', searchTerm, { operator: 'and', boost: 2 }))
  .should(q => q.fuzzy('description', searchTerm, { fuzziness: 'AUTO' }))
  .filter(q => q.term('category', category))
  .filter(q => q.range('price', { gte: minPrice, lte: maxPrice }))
  .filter(q => q.term('in_stock', true))
  .minimumShouldMatch(1)
  .aggs(agg =>
    agg
      .terms('by_category', 'category', { size: 10 })
      .range('price_ranges', 'price', {
        ranges: [
          { to: 800 },
          { from: 800, to: 1500 },
          { from: 1500 }
        ]
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

Produces:

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

### Aggregations — Portfolio Analytics

Terms + sub-aggregation + date histogram in one request.

```typescript
type Instrument = {
  name: string;
  asset_class: string;
  sector: string;
  price: number;
  yield_rate: number;
  listed_date: string;
};

const result = query<Instrument>()
  .bool()
  .filter(q => q.term('asset_class', 'fixed-income'))
  .filter(q => q.range('yield_rate', { gte: 3.0 }))
  .aggs(agg =>
    agg
      .terms('by_sector', 'sector', { size: 10 })
      .subAgg(sub => sub.avg('avg_yield', 'yield_rate').max('max_price', 'price'))
      .dateHistogram('listings_over_time', 'listed_date', {
        interval: 'quarter',
        min_doc_count: 1
      })
      .subAgg(sub => sub.percentiles('yield_percentiles', 'yield_rate', { percents: [25, 50, 75, 95] }))
  )
  .size(0)
  .build();
```

Produces:

```json
{
  "query": {
    "bool": {
      "filter": [
        { "term": { "asset_class": "fixed-income" } },
        { "range": { "yield_rate": { "gte": 3.0 } } }
      ]
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

### Multi-Search — Parallel Queries

Batch multiple independent searches into a single HTTP request.

```typescript
type Listing = {
  address: string;
  property_class: string;
  list_price: number;
};

const condoSearch = query<Listing>()
  .bool()
  .filter(q => q.term('property_class', 'condo'))
  .filter(q => q.range('list_price', { lte: 2_000_000 }))
  .aggs(agg => agg.avg('avg_price', 'list_price'))
  .size(0)
  .build();

const townhouseSearch = query<Listing>()
  .bool()
  .filter(q => q.term('property_class', 'townhouse'))
  .aggs(agg => agg.avg('avg_price', 'list_price').min('min_price', 'list_price'))
  .size(0)
  .build();

const ndjson = msearch<Listing>()
  .addQuery(condoSearch, { index: 'listings' })
  .addQuery(townhouseSearch, { index: 'listings' })
  .build();
```

Produces:

```ndjson
{"index":"listings"}
{"query":{"bool":{"filter":[{"term":{"property_class":"condo"}},{"range":{"list_price":{"lte":2000000}}}]}},"aggs":{"avg_price":{"avg":{"field":"list_price"}}},"size":0}
{"index":"listings"}
{"query":{"bool":{"filter":[{"term":{"property_class":"townhouse"}}]}},"aggs":{"avg_price":{"avg":{"field":"list_price"}},"min_price":{"min":{"field":"list_price"}}},"size":0}

```

### Suggesters — Autocomplete & Spell Check

```typescript
type Attorney = {
  name: string;
  practice_area: string;
  name_suggest: string; // completion field
};

// Standalone suggest request
const suggestions = query<Attorney>()
  .suggest(s =>
    s
      .completion('autocomplete', 'kap', { field: 'name_suggest', size: 5 })
      .term('spelling', 'wiliams', { field: 'name', size: 3 })
  )
  .size(0)
  .build();
```

Produces:

```json
{
  "suggest": {
    "autocomplete": {
      "prefix": "kap",
      "completion": { "field": "name_suggest", "size": 5 }
    },
    "spelling": {
      "text": "wiliams",
      "term": { "field": "name", "size": 3 }
    }
  },
  "size": 0
}
```

### Dynamic Search with Conditional Filters

```typescript
const buildDynamicQuery = (filters: SearchFilters) => {
  return query<Product>()
    .bool()
    .must(q =>
      q.when(filters.searchTerm,
        q => q.match('name', filters.searchTerm, { boost: 2 })
      ) || q.matchAll()
    )
    .filter(q =>
      q.when(filters.minPrice && filters.maxPrice,
        q => q.range('price', { gte: filters.minPrice, lte: filters.maxPrice })
      ) || q.matchAll()
    )
    .filter(q =>
      q.when(filters.category,
        q => q.term('category', filters.category)
      ) || q.matchAll()
    )
    .from(filters.offset || 0)
    .size(filters.limit || 20)
    .build();
};
```

### Geospatial Search

```typescript
type Restaurant = {
  name: string;
  cuisine: string;
  location: { lat: number; lon: number };
  rating: number;
};

const result = query<Restaurant>()
  .match('cuisine', 'italian')
  .geoDistance(
    'location',
    { lat: 40.7128, lon: -74.006 },
    { distance: '5km' }
  )
  .from(0)
  .size(20)
  .build();
```

## TypeScript Support

elasticlink provides excellent TypeScript support with:

- **Field Autocomplete**: Type-safe field names with IntelliSense
- **Type Validation**: Compile-time checking for query structure
- **Generic Parameters**: Full type inference across builder chains

```typescript
type User = {
  id: string;
  name: string;
  email: string;
  age: number;
};

// ✅ Type-safe field names
const q1 = query<User>().match('name', 'John').build();

// ❌ TypeScript error: 'unknown_field' is not a valid field
const q2 = query<User>().match('unknown_field', 'value').build();
```

## Testing

```bash
# Run tests
npm test

# Watch mode
npm test:watch

# Coverage report
npm test:coverage

# Type check
npm run type-check
```

## Roadmap

### Current Release ✅

- [x] Core query types (match, term, range, bool, etc.)
- [x] Fuzzy queries for typo tolerance
- [x] Query parameters (from, size, sort, timeout, etc.)
- [x] Conditional query building
- [x] Highlight support
- [x] Aggregations (bucket and metric)
- [x] Geo queries (distance, bounding box, polygon)
- [x] Advanced patterns (regexp, constant_score)
- [x] Sub-aggregation support
- [x] Query + aggregations integration
- [x] KNN (k-nearest neighbors) queries for vector search
- [x] Semantic search with vector embeddings
- [x] Dense vector field support
- [x] Script queries and custom scoring
- [x] Percolate queries for reverse search
- [x] Multi-search API (NDJSON batched queries)
- [x] Bulk operations (create, index, update, delete)
- [x] Index management (mappings, settings, aliases)
- [x] Query suggestions/completions (term, phrase, completion)
- [x] Integration test suite against live Elasticsearch 9.x
- [x] Types derived from official `@elastic/elasticsearch` for accuracy and completeness

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © 2026 misterrodger

## Support

- 📖 [Documentation](https://github.com/misterrodger/elasticlink#readme)
- 🐛 [Report Issues](https://github.com/misterrodger/elasticlink/issues)
- 💬 [Discussions](https://github.com/misterrodger/elasticlink/discussions)
