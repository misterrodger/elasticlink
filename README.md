# elastiq

> **⚠️ Pre-Beta Status**: elastiq is still in active development. APIs may change before first stable release.

[![npm version](https://img.shields.io/npm/v/elastiq.svg)](https://www.npmjs.com/package/elastiq)
[![Build Status](https://github.com/misterrodger/elastiq/actions/workflows/ci.yml/badge.svg)](https://github.com/misterrodger/elastiq/actions)
[![Coverage Status](https://img.shields.io/badge/coverage-80%25-brightgreen)](https://github.com/misterrodger/elastiq)
[![MIT License](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

> **Type-safe, lightweight Elasticsearch query builder with a fluent, chainable API**

elastiq simplifies building Elasticsearch queries in TypeScript. Write type-checked queries that compile to valid Elasticsearch DSL with zero runtime overhead.

## Features

- ✨ **Type-Safe**: Full TypeScript generics for field autocomplete and type checking
- 🔗 **Fluent API**: Chainable query builder with intuitive method names
- 🎯 **Zero Runtime Overhead**: Compiles directly to Elasticsearch DSL objects
- 🧪 **Well-Tested**: 147+ passing tests with comprehensive coverage
- 📦 **Lightweight**: ~15KB uncompressed, no external dependencies
- 🎓 **Great DX**: Excellent IntelliSense and error messages
- 🚀 **Ready to Use**: Core query features working and tested

## Installation

```bash
npm install elastiq@latest
```

Requires Node.js 20+

## Quick Start

```typescript
import { query } from 'elastiq';

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

#### Advanced Queries

- `nested(path, fn, options?)` - Nested object queries
- `regexp(field, pattern, options?)` - Regular expression matching
- `constantScore(fn, options?)` - Constant scoring for filters

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
import { query, aggregations } from 'elastiq';

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

elastiq provides excellent TypeScript support with:

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
- [x] Full test coverage (147+ tests)

### Planned for Future Releases

- [ ] KNN (k-nearest neighbors) queries for vector search
- [ ] Semantic search with vector embeddings
- [ ] Dense vector field support
- [ ] Script queries
- [ ] Percolate queries
- [ ] Multi-search API
- [ ] Index management utilities
- [ ] Bulk operations
- [ ] Query suggestions/completions

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

MIT © 2026 misterrodger

## Support

- 📖 [Documentation](https://github.com/misterrodger/elastiq#readme)
- 🐛 [Report Issues](https://github.com/misterrodger/elastiq/issues)
- 💬 [Discussions](https://github.com/misterrodger/elastiq/discussions)
