# elastiq-ts Beta Release Guide

**Status**: ✅ Ready for npm beta publication
**Version**: 0.1.0-beta
**Package Size**: ~22 KB (gzipped)

## What's Included

elastiq-ts is a **type-safe, lightweight Elasticsearch query builder** with:

- ✅ **Many features implemented**: Core query types, vector search, scripts, percolate, multi-search, bulk, index management, suggestions and autocomplete, etc
- ✅ **430+ tests passing** with 98%+ coverage
- ✅ **Production-quality code** with TypeScript strict mode
- ✅ **Comprehensive documentation** with examples
- ✅ **Zero external dependencies** (lightweight)

## Publishing the Beta

### Manual Publish (Recommended for First Release)

```bash
# Ensure you're logged in to npm
npm login

# Verify everything is ready
npm run test
npm run type-check
npm run build

# Publish as beta
npm publish --tag beta

# Verify publication
npm view elastiq-ts@0.1.0-beta
```

This publishes with the `beta` tag, so users must explicitly install the beta version.

## Installation

Beta users can install:

```bash
# Latest beta
npm install elastiq-ts@beta

# Specific version
npm install elastiq-ts@0.1.0-beta
```

## Quick Start for Beta Testers

```typescript
import { query } from 'elastiq-ts';

type Product = {
  id: string;
  name: string;
  price: number;
  embedding?: number[];
};

// Type-safe query building with vector search
const q = query<Product>()
  .bool()
  .must(q => q.match('name', 'laptop'))
  .filter(q => q.range('price', { gte: 500, lte: 2000 }))
  .knn('embedding', [0.1, 0.2, ...], { k: 10, num_candidates: 100 })
  .suggest(s => s.completion('name-suggestions', 'lap', { field: 'name' }))
  .from(0)
  .size(20)
  .build();

// Send to Elasticsearch
client.search({ index: 'products', ...q });
```

## Beta Features

### Core Query Types

- Full-text: match, multiMatch, matchPhrase, matchPhrasePrefix
- Term-level: term, terms, range, exists, prefix, wildcard, fuzzy, ids
- Boolean: must, filter, should, mustNot, minimumShouldMatch
- Advanced: nested, regexp, constantScore
- Geo: geoDistance, geoBoundingBox, geoPolygon

### Vector Search

- KNN queries with filtering and boosting
- Dense vector field support
- HNSW and flat index configurations

### Advanced Queries

- Script queries (Painless/Expression/Mustache)
- Script score queries for custom ranking
- Percolate queries for reverse search

### API Operations

- Multi-search API for batching requests
- Bulk operations (index, create, update, delete)
- Index management (mappings, settings, aliases)

### Suggestions

- Term suggester (spelling corrections)
- Phrase suggester (phrase corrections)
- Completion suggester (autocomplete)

### Aggregations

- Bucket: terms, dateHistogram, range, histogram
- Metric: avg, sum, min, max, cardinality, percentiles, stats, valueCount
- Sub-aggregations with fluent chaining

### Other Features

- Conditional query building with when()
- Highlighting with custom tags
- Full TypeScript generics for type safety
- Query parameters (pagination, sorting, field selection, etc.)

## Pre-release Checklist

Before publishing:

- [ ] All tests passing: `npm test`
- [ ] Coverage meets threshold: `npm run test:coverage` (98%+)
- [ ] Type checking passes: `npm run type-check`
- [ ] Build succeeds: `npm run build`
- [ ] Linting passes: `npm run lint`
- [ ] CHANGELOG.md updated
- [ ] Version bumped in package.json
- [ ] README.md reflects current features
- [ ] Commit and tag created

## Feedback Channels

- **Issues**: https://github.com/misterrodger/elastiq-ts/issues
- **Discussions**: https://github.com/misterrodger/elastiq-ts/discussions
- **Bugs**: Create issue with version and reproduction steps

## What "Beta" Means

This library is in **beta**, which means:

- **The API may change** - We're gathering feedback and refining the design based on real-world usage
- **Breaking changes are possible** - Between beta versions as we discover better patterns
- **Use with caution** - Well-tested, but still evolving
- **Feedback is essential** - Help shape the final API by reporting what works and what doesn't

## Version Bumping

For subsequent beta releases:

```bash
# In package.json, increment the beta number or minor version
"version": "0.1.1-beta"  # For bug fixes
"version": "0.2.0-beta"  # For new features

# Publish
npm publish --tag beta
```

## Next Steps After Publishing

1. **Verify** the package on npm: https://www.npmjs.com/package/elastiq-ts
2. **Test** installation in a fresh project
3. **Create** a GitHub release with changelog
4. **Gather** feedback from users
5. **Iterate** based on real-world usage

## Questions?

This is a first public library release. The process and timeline will evolve based on feedback. See README.md and CHANGELOG.md for more detailed feature documentation.

---

**Ready to release! 🚀**

