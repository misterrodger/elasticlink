# elastiq-ts

> **⚠️ Pre-Beta Status**: elastiq-ts is still in active development. APIs may change before first stable release.

[![npm version](https://img.shields.io/npm/v/elastiq-ts.svg)](https://www.npmjs.com/package/elastiq-ts)
[![Build Status](https://github.com/misterrodger/elastiq-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/misterrodger/elastiq-ts/actions)
[![Coverage Status](https://img.shields.io/badge/coverage-98%25-brightgreen)](https://github.com/misterrodger/elastiq-ts)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **Type-safe, lightweight Elasticsearch query builder with a fluent, chainable API**

elastiq-ts simplifies building Elasticsearch queries in TypeScript. Write type-checked queries that compile to valid Elasticsearch DSL with zero runtime overhead.

## Features

- ✨ **Type-Safe**: Full TypeScript generics for field autocomplete and type checking
- 🔗 **Fluent API**: Chainable query builder with intuitive method names
- 🎯 **Zero Runtime Overhead**: Compiles directly to Elasticsearch DSL objects
- 🧪 **Well-Tested**: 430+ passing tests with 98%+ coverage
- 📦 **Lightweight**: ~22KB uncompressed, no external dependencies
- 🎓 **Great DX**: Excellent IntelliSense and error messages
- 🚀 **Ready to Use**: Core query features working and tested

## Installation

```bash
npm install elastiq-ts@latest
```

Requires Node.js 20+

## Quick Start

```typescript
import { query } from 'elastiq-ts';

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
  .from(0)                    // Pagination offset
  .size(20)                   // Results per page
  .sort('price', 'asc')       // Sort by field
  ._source(['name', 'price']) // Which fields to return
  .timeout('5s')              // Query timeout
  .trackScores(true)          // Enable scoring in filter context
  .explain(true)              // Return scoring explanation
  .minScore(10)               // Minimum relevance score
  .highlight(['name', 'description'], {
    fragment_size: 150,
    pre_tags: ['<mark>'],
    post_tags: ['</mark>']
  })
  .build();
```

### Aggregations

Aggregations can be combined with queries or used standalone:

```typescript
import { query, aggregations } from 'elastiq-ts';

type Product = {
  category: string;
  price: number;
  created_at: string;
};

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
import { query } from 'elastiq-ts';

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

// Product recommendations ("more like this")
const recommendations = query<Product>()
  .knn('embedding', currentProductEmbedding, {
    k: 10,
    num_candidates: 100,
    filter: {
      bool: {
        must_not: [{ term: { id: 'current-product-id' } }],
        must: [{ term: { category: 'electronics' } }]
      }
    }
  })
  .size(10)
  ._source(['id', 'name', 'price'])
  .build();

// Image similarity search
const imageEmbedding = new Array(512).fill(0); // 512-dim vector from ResNet

const imageSimilarity = query<Product>()
  .knn('embedding', imageEmbedding, {
    k: 50,
    num_candidates: 500,
    similarity: 0.8 // High similarity threshold
  })
  .size(50)
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
import type { DenseVectorOptions } from 'elastiq-ts';

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
import { query } from 'elastiq-ts';

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

// Weighted multi-factor scoring
const weightedScore = query<Product>()
  .scriptScore(
    (q) => q.multiMatch(['name', 'description'], 'premium', { type: 'best_fields' }),
    {
      source: `
        double quality = doc['quality_score'].value;
        double popularity = doc['popularity'].value;
        return _score * (quality * 0.7 + popularity * 0.3);
      `,
      params: {}
    },
    { min_score: 5.0, boost: 1.2 }
  )
  .build();

// Personalized scoring
const personalizedScore = query<Product>()
  .scriptScore(
    (q) => q.matchAll(),
    {
      source: `
        double price_score = 1.0 / (1.0 + doc['price'].value / 1000);
        double quality = doc['quality_score'].value / 10.0;
        return _score * (price_score * params.price_weight + quality * params.quality_weight);
      `,
      params: {
        price_weight: 0.3,
        quality_weight: 0.7
      }
    }
  )
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

// Classify multiple documents
const classifications = query<AlertRule>()
  .percolate({
    field: 'query',
    documents: [
      { title: 'AI Breakthrough', content: 'Machine learning advances' },
      { title: 'Market Update', content: 'Stock prices surge' }
    ]
  })
  ._source(['name', 'category'])
  .build();

// Match against stored document
const savedSearch = query<AlertRule>()
  .percolate({
    field: 'query',
    index: 'user_content',
    id: 'doc-123',
    routing: 'user-456'
  })
  .size(20)
  .build();

// Security alert system
const securityAlerts = query<AlertRule>()
  .percolate({
    field: 'query',
    document: {
      event_type: 'unauthorized_access',
      severity: 'high',
      ip_address: '192.168.1.100',
      timestamp: '2024-01-15T14:00:00Z'
    },
    name: 'security_event_check'
  })
  .sort('severity', 'desc')
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
import { query, suggest } from 'elastiq-ts';

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

// Phrase suggester - Fix entire phrases
const phraseSuggestions = suggest<Product>()
  .phrase('description-suggestions', 'powerfull laptop', {
    field: 'description',
    size: 3,
    confidence: 2.0,
    max_errors: 1,
    pre_tag: '<em>',
    post_tag: '</em>',
    direct_generator: [
      {
        field: 'description',
        suggest_mode: 'always',
        max_edits: 2,
        min_word_length: 3
      }
    ]
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

// Multiple suggesters
const multiSuggest = suggest<Product>()
  .term('name-term', 'laptpo', { field: 'name', size: 3 })
  .completion('name-complete', 'lap', { field: 'suggest_field', size: 5 })
  .build();

// Search-as-you-type with context filtering
const contextual = query<Product>()
  .bool()
  .filter((q) => q.term('category', 'electronics'))
  .suggest((s) =>
    s.completion('product-autocomplete', 'lapt', {
      field: 'suggest_field',
      size: 10,
      contexts: {
        category: 'electronics'
      },
      fuzzy: {
        fuzziness: 'AUTO'
      }
    })
  )
  .size(0) // Only want suggestions, not search results
  .build();

// Phrase correction with highlighting
const correction = suggest<Product>()
  .phrase('phrase-fix', 'powerfull gaming laptop', {
    field: 'description',
    size: 3,
    confidence: 1.5,
    pre_tag: '<strong>',
    post_tag: '</strong>',
    collate: {
      query: {
        source: { match: { description: '{{suggestion}}' } }
      },
      prune: true
    }
  })
  .build();
```

**Suggester Types:**

- **Term:** Suggests corrections for individual terms based on edit distance
- **Phrase:** Suggests corrections for entire phrases using n-gram language models
- **Completion:** Fast prefix-based autocomplete (requires `completion` field type)

**Common Use Cases:**

- **Autocomplete:** Search-as-you-type suggestions for product names, categories
- **Spell Check:** Fix typos in search queries ("laptpo" → "laptop")
- **Did You Mean:** Suggest alternative queries when searches return few results
- **Phrase Correction:** Fix grammatical errors in multi-word queries

**Completion Field Mapping:**

```typescript
import { indexBuilder } from 'elastiq-ts';

const index = indexBuilder<Product>()
  .mappings({
    properties: {
      suggest_field: {
        type: 'completion',
        analyzer: 'simple',
        search_analyzer: 'simple'
      }
    }
  })
  .build();
```

### Multi-Search API

Batch multiple search requests in a single API call using the NDJSON format.

```typescript
import { query, msearch } from 'elastiq-ts';

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

**Common Use Cases:**

- **Batch Search:** Execute multiple searches in one request
- **Cross-Index Search:** Query different indices simultaneously
- **Performance Optimization:** Reduce HTTP overhead for multiple queries
- **Dashboard Queries:** Load multiple widgets/charts in parallel

### Bulk Operations

Batch create, index, update, and delete operations efficiently.

```typescript
import { bulk } from 'elastiq-ts';

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
  // Update with script
  .update({
    _index: 'products',
    _id: '4',
    script: {
      source: 'ctx._source.price *= params.multiplier',
      params: { multiplier: 0.9 }
    }
  })
  // Update with upsert
  .update({
    _index: 'products',
    _id: '5',
    doc: { price: 499 },
    upsert: { id: '5', name: 'New Product', price: 499, category: 'electronics' }
  })
  // Delete
  .delete({ _index: 'products', _id: '6' })
  .build();

// Send to Elasticsearch /_bulk endpoint
// POST /_bulk
// Content-Type: application/x-ndjson
// Body: bulkOp
```

**NDJSON Format:**

```ndjson
{"index":{"_index":"products","_id":"1"}}
{"id":"1","name":"Laptop Pro","price":1299,"category":"electronics"}
{"create":{"_index":"products","_id":"2"}}
{"id":"2","name":"Wireless Mouse","price":29,"category":"accessories"}
{"update":{"_index":"products","_id":"3"}}
{"doc":{"price":999}}
{"update":{"_index":"products","_id":"4"}}
{"script":{"source":"ctx._source.price *= params.multiplier","params":{"multiplier":0.9}}}
{"update":{"_index":"products","_id":"5"}}
{"doc":{"price":499},"upsert":{"id":"5","name":"New Product","price":499,"category":"electronics"}}
{"delete":{"_index":"products","_id":"6"}}

```

**Operation Types:**

- `index`: Create or replace document
- `create`: Create new document (fails if exists)
- `update`: Partial update with doc, script, or upsert
- `delete`: Remove document

**Update Options:**

- `doc`: Partial document merge
- `script`: Script-based update (Painless)
- `upsert`: Document to insert if not exists
- `doc_as_upsert`: Use doc as upsert document
- `retry_on_conflict`: Retry count for version conflicts

**Common Use Cases:**

- **Data Import:** Batch insert large datasets
- **Sync Operations:** Keep indices in sync with external systems
- **Price Updates:** Update multiple products efficiently
- **Batch Deletes:** Remove outdated documents in bulk

### Index Management

Configure index mappings, settings, and aliases declaratively.

```typescript
import { indexBuilder } from 'elastiq-ts';

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  inStock: boolean;
  embedding: number[];
};

const indexConfig = indexBuilder<Product>()
  .mappings({
    properties: {
      id: { type: 'keyword' },
      name: { type: 'text', analyzer: 'standard' },
      description: { type: 'text', analyzer: 'english' },
      price: { type: 'float' },
      category: { type: 'keyword' },
      tags: { type: 'keyword' },
      inStock: { type: 'boolean' },
      embedding: {
        type: 'dense_vector',
        dims: 384,
        index: true,
        similarity: 'cosine'
      }
    }
  })
  .settings({
    number_of_shards: 2,
    number_of_replicas: 1,
    refresh_interval: '5s',
    'index.max_result_window': 10000
  })
  .alias('products_current')
  .alias('products_search', { is_write_index: true })
  .build();

// Use with Elasticsearch Create Index API
// PUT /products
// Content-Type: application/json
// Body: JSON.stringify(indexConfig)
```

**Field Types (20+ supported):**

- **Text:** `text`, `keyword`, `constant_keyword`
- **Numeric:** `long`, `integer`, `short`, `byte`, `double`, `float`, `half_float`, `scaled_float`
- **Date:** `date`, `date_nanos`
- **Boolean:** `boolean`
- **Binary:** `binary`
- **Range:** `integer_range`, `float_range`, `long_range`, `double_range`, `date_range`
- **Objects:** `object`, `nested`, `flattened`
- **Spatial:** `geo_point`, `geo_shape`
- **Specialized:** `ip`, `completion`, `token_count`, `dense_vector`, `rank_feature`, `rank_features`

**Mapping Properties:**

- `type`: Field type
- `analyzer`: Text analyzer (standard, english, etc.)
- `index`: Enable/disable indexing
- `store`: Store field separately
- `fields`: Multi-field mappings
- `null_value`: Default for null values
- `copy_to`: Copy field to another field
- `eager_global_ordinals`: Optimize aggregations

**Settings Options:**

- `number_of_shards`: Shard count (set at creation)
- `number_of_replicas`: Replica count
- `refresh_interval`: Auto-refresh interval
- `max_result_window`: Maximum result window size
- `analysis`: Custom analyzers, tokenizers, filters

**Alias Options:**

- `is_write_index`: Designate write target for alias
- `routing`: Default routing value
- `filter`: Filter documents visible through alias

**Real-World Examples:**

**E-commerce Index:**

```typescript
const ecommerceIndex = indexBuilder<Product>()
  .mappings({
    properties: {
      sku: { type: 'keyword' },
      name: { type: 'text', analyzer: 'standard', fields: { keyword: { type: 'keyword' } } },
      description: { type: 'text', analyzer: 'english' },
      price: { type: 'scaled_float', scaling_factor: 100 },
      category: { type: 'keyword' },
      brand: { type: 'keyword' },
      tags: { type: 'keyword' },
      rating: { type: 'half_float' },
      reviewCount: { type: 'integer' },
      inStock: { type: 'boolean' },
      createdAt: { type: 'date' }
    }
  })
  .settings({
    number_of_shards: 3,
    number_of_replicas: 2,
    refresh_interval: '1s'
  })
  .alias('products')
  .build();
```

**Vector Search Index:**

```typescript
const vectorIndex = indexBuilder<Article>()
  .mappings({
    properties: {
      title: { type: 'text' },
      content: { type: 'text' },
      embedding: {
        type: 'dense_vector',
        dims: 768,
        index: true,
        similarity: 'cosine',
        index_options: {
          type: 'hnsw',
          m: 16,
          ef_construction: 100
        }
      }
    }
  })
  .settings({
    number_of_shards: 1,
    number_of_replicas: 0
  })
  .build();
```

**Common Use Cases:**

- **Index Creation:** Define schema before indexing data
- **Schema Migration:** Version indices with aliases
- **Multi-Tenancy:** Create per-tenant indices programmatically
- **Vector Search Setup:** Configure dense_vector fields with HNSW

## Examples

More examples available in [src/__tests__/examples.test.ts](src/__tests__/examples.test.ts).

### E-commerce Product Search

```typescript
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
  .minimumShouldMatch(1)
  .highlight(['name', 'description'])
  .timeout('5s')
  .from(0)
  .size(20)
  .sort('price', 'asc')
  .build();
```

Produces:

```json
{
  "query": {
    "bool": {
      "must": [
        {
          "match": {
            "name": {
              "query": "gaming laptop",
              "operator": "and",
              "boost": 2
            }
          }
        }
      ],
      "should": [
        {
          "fuzzy": {
            "description": {
              "value": "gaming laptop",
              "fuzziness": "AUTO"
            }
          }
        }
      ],
      "filter": [
        { "term": { "category": "electronics" } },
        {
          "range": {
            "price": { "gte": 800, "lte": 2000 }
          }
        }
      ],
      "minimum_should_match": 1
    }
  },
  "highlight": {
    "fields": {
      "name": {},
      "description": {}
    }
  },
  "timeout": "5s",
  "from": 0,
  "size": 20,
  "sort": [{ "price": "asc" }]
}
```

### Content Search with Filtering

```typescript
type Article = {
  title: string;
  content: string;
  author: string;
  published_date: string;
};

const result = query<Article>()
  .bool()
  .must(q => q.multiMatch(['title', 'content'], 'elasticsearch', { type: 'best_fields' }))
  .filter(q => q.range('published_date', { gte: '2024-01-01' }))
  .should(q => q.match('author', 'jane', { boost: 2 }))
  .minimumShouldMatch(1)
  .highlight(['title', 'content'])
  .timeout('10s')
  .trackTotalHits(10000)
  .from(0)
  .size(20)
  .build();
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
    { lat: 40.7128, lon: -74.006 },  // The Big 🍎
    { distance: '5km' }
  )
  .from(0)
  .size(20)
  .build();
```

## TypeScript Support

elastiq-ts provides excellent TypeScript support with:

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

// ❌ TypeScript error: age is number, not string
const q3 = query<User>().match('age', 'should be a number').build();
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

All queries are tested against the Elasticsearch DSL specification with 147+ passing tests.

## Version Support

- **Node.js**: 20/22
- **Elasticsearch**: 9.2.4

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
- [x] Full test coverage (388+ tests)

### Planned for Future Releases

- [ ] Query suggestions/completions (term, phrase, completion)

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © 2026 misterrodger

## Support

- 📖 [Documentation](https://github.com/misterrodger/elastiq-ts#readme)
- 🐛 [Report Issues](https://github.com/misterrodger/elastiq-ts/issues)
- 💬 [Discussions](https://github.com/misterrodger/elastiq-ts/discussions)
