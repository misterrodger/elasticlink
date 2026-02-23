import {
  query,
  aggregations,
  suggest,
  msearch,
  bulk,
  indexBuilder,
  mappings,
  text,
  keyword,
  integer,
  float,
  long,
  date,
  scaledFloat,
  halfFloat,
  denseVector,
  geoPoint,
  nested,
  completion
} from '..';

/**
 * Real-world usage examples demonstrating elasticlink's capabilities.
 * These tests showcase common search patterns and can serve as documentation.
 */

// ---------------------------------------------------------------------------
// Mappings schemas — each defines field names and their ES types
// ---------------------------------------------------------------------------

const instrumentMappings = mappings({
  isin: keyword(),
  name: text(),
  description: text(),
  market_cap: long(),
  asset_class: keyword(),
  tags: keyword(),
  listed_date: date(),
  credit_rating: float()
});
const articleMappings = mappings({
  id: keyword(),
  title: text(),
  content: text(),
  author: keyword(),
  published_date: date(),
  updated_date: date(),
  tags: keyword(),
  comments: nested()
});
const documentMappings = mappings({
  id: keyword(),
  content: text(),
  title: text(),
  tags: keyword(),
  published_date: date()
});
const restaurantMappings = mappings({
  id: keyword(),
  name: text(),
  cuisine: keyword(),
  location: geoPoint(),
  rating: float()
});
const storeMappings = mappings({
  id: keyword(),
  name: text(),
  coordinates: geoPoint(),
  district: keyword(),
  rating: float(),
  item_count: integer()
});
const instrumentWithEmbeddingMappings = mappings({
  isin: keyword(),
  name: text(),
  description: text(),
  market_cap: long(),
  asset_class: keyword(),
  prospectus_url: keyword(),
  embedding: denseVector({ dims: 384 })
});
const contentDocumentMappings = mappings({
  id: keyword(),
  title: text(),
  content: text(),
  author: keyword(),
  published_date: date(),
  tags: keyword(),
  embedding: denseVector({ dims: 384 })
});
describe('Real-world Usage Examples', () => {
  describe('E-commerce Product Search', () => {
    it('should build a basic product search query', () => {
      const searchTerm = 'equity';

      const result = query(instrumentMappings)
        .match('name', searchTerm, { operator: 'and', boost: 2 })
        .from(0)
        .size(20)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "query": {
            "match": {
              "name": {
                "boost": 2,
                "operator": "and",
                "query": "equity",
              },
            },
          },
          "size": 20,
        }
      `);
    });

    it('should build an advanced product search with filters and highlighting', () => {
      const searchTerm = 'large-cap tech';
      const category = 'technology';
      const minPrice = 1_000_000_000;
      const maxPrice = 5_000_000_000;

      const result = query(instrumentMappings)
        .bool()
        .must((q) => q.match('name', searchTerm, { operator: 'and', boost: 2 }))
        .should((q) =>
          q.fuzzy('description', searchTerm, { fuzziness: 'AUTO' })
        )
        .filter((q) => q.term('asset_class', category))
        .filter((q) =>
          q.range('market_cap', {
            gte: minPrice,
            lte: maxPrice
          })
        )
        .minimumShouldMatch(0)
        .highlight(['name', 'description'], {
          fragment_size: 150,
          number_of_fragments: 2,
          pre_tags: ['<mark>'],
          post_tags: ['</mark>']
        })
        .timeout('5s')
        .trackScores(true)
        .from(0)
        .size(20)
        .sort('market_cap', 'asc')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "highlight": {
            "fields": {
              "description": {
                "fragment_size": 150,
                "number_of_fragments": 2,
              },
              "name": {
                "fragment_size": 150,
                "number_of_fragments": 2,
              },
            },
            "post_tags": [
              "</mark>",
            ],
            "pre_tags": [
              "<mark>",
            ],
          },
          "query": {
            "bool": {
              "filter": [
                {
                  "term": {
                    "asset_class": "technology",
                  },
                },
                {
                  "range": {
                    "market_cap": {
                      "gte": 1000000000,
                      "lte": 5000000000,
                    },
                  },
                },
              ],
              "minimum_should_match": 0,
              "must": [
                {
                  "match": {
                    "name": {
                      "boost": 2,
                      "operator": "and",
                      "query": "large-cap tech",
                    },
                  },
                },
              ],
              "should": [
                {
                  "fuzzy": {
                    "description": {
                      "fuzziness": "AUTO",
                      "value": "large-cap tech",
                    },
                  },
                },
              ],
            },
          },
          "size": 20,
          "sort": [
            {
              "market_cap": "asc",
            },
          ],
          "timeout": "5s",
          "track_scores": true,
        }
      `);
    });

    it('should build a dynamic product search with conditional filters', () => {
      const searchTerm = 'equity';
      const selectedCategory = 'technology';
      const minPrice = undefined;
      const maxPrice = undefined;
      const selectedTags = ['large-cap', 'sp500'];

      const result = query(instrumentMappings)
        .bool()
        .must(
          (q) =>
            q.when(searchTerm, (q2) =>
              q2.match('name', searchTerm, {
                operator: 'and',
                boost: 2
              })
            ) || q.matchAll()
        )
        .filter(
          (q) =>
            q.when(selectedCategory, (q2) =>
              q2.term('asset_class', selectedCategory)
            ) || q.matchAll()
        )
        .filter(
          (q) =>
            q.when(minPrice && maxPrice, (q2) =>
              q2.range('market_cap', {
                gte: minPrice!,
                lte: maxPrice!
              })
            ) || q.matchAll()
        )
        .filter(
          (q) =>
            q.when(selectedTags && selectedTags.length > 0, (q2) =>
              q2.terms('tags', selectedTags!)
            ) || q.matchAll()
        )
        .timeout('5s')
        .from(0)
        .size(20)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "query": {
            "bool": {
              "filter": [
                {
                  "term": {
                    "asset_class": "technology",
                  },
                },
                {
                  "match_all": {},
                },
                {
                  "terms": {
                    "tags": [
                      "large-cap",
                      "sp500",
                    ],
                  },
                },
              ],
              "must": [
                {
                  "match": {
                    "name": {
                      "boost": 2,
                      "operator": "and",
                      "query": "equity",
                    },
                  },
                },
              ],
            },
          },
          "size": 20,
          "timeout": "5s",
        }
      `);
    });

    it('should build an autocomplete-style product search', () => {
      const userInput = 'equ';

      const result = query(instrumentMappings)
        .bool()
        .must((q) =>
          q.matchPhrasePrefix('name', userInput, { max_expansions: 20 })
        )
        .highlight(['name'], { fragment_size: 100 })
        .trackTotalHits(true)
        .from(0)
        .size(10)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "highlight": {
            "fields": {
              "name": {
                "fragment_size": 100,
              },
            },
          },
          "query": {
            "bool": {
              "must": [
                {
                  "match_phrase_prefix": {
                    "name": {
                      "max_expansions": 20,
                      "query": "equ",
                    },
                  },
                },
              ],
            },
          },
          "size": 10,
          "track_total_hits": true,
        }
      `);
    });
  });

  describe('Content/Article Search', () => {
    it('should build a blog article search with full-text and meta filters', () => {
      const searchTerm = 'elasticsearch performance';
      const authorName = 'john';
      const startDate = '2024-01-01';

      const result = query(articleMappings)
        .bool()
        .must((q) =>
          q.multiMatch(['title', 'content'], searchTerm, {
            type: 'best_fields',
            operator: 'and'
          })
        )
        .should((q) =>
          q.fuzzy('author', authorName, { fuzziness: 'AUTO', boost: 2 })
        )
        .filter((q) =>
          q.range('published_date', {
            gte: startDate
          })
        )
        .minimumShouldMatch(0)
        .highlight(['title', 'content'], {
          fragment_size: 200,
          number_of_fragments: 3,
          pre_tags: ['<em>'],
          post_tags: ['</em>']
        })
        .timeout('10s')
        .trackTotalHits(10000)
        .from(0)
        .size(15)
        .sort('published_date', 'desc')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "highlight": {
            "fields": {
              "content": {
                "fragment_size": 200,
                "number_of_fragments": 3,
              },
              "title": {
                "fragment_size": 200,
                "number_of_fragments": 3,
              },
            },
            "post_tags": [
              "</em>",
            ],
            "pre_tags": [
              "<em>",
            ],
          },
          "query": {
            "bool": {
              "filter": [
                {
                  "range": {
                    "published_date": {
                      "gte": "2024-01-01",
                    },
                  },
                },
              ],
              "minimum_should_match": 0,
              "must": [
                {
                  "multi_match": {
                    "fields": [
                      "title",
                      "content",
                    ],
                    "operator": "and",
                    "query": "elasticsearch performance",
                    "type": "best_fields",
                  },
                },
              ],
              "should": [
                {
                  "fuzzy": {
                    "author": {
                      "boost": 2,
                      "fuzziness": "AUTO",
                      "value": "john",
                    },
                  },
                },
              ],
            },
          },
          "size": 15,
          "sort": [
            {
              "published_date": "desc",
            },
          ],
          "timeout": "10s",
          "track_total_hits": 10000,
        }
      `);
    });

    it('should build a search for articles with a specific author', () => {
      const authorName = 'jane';

      const result = query(articleMappings)
        .bool()
        .must((q) => q.term('author', authorName))
        .filter((q) =>
          q.range('published_date', {
            gte: '2024-01-01'
          })
        )
        .highlight(['title'], {
          fragment_size: 150,
          pre_tags: ['<strong>'],
          post_tags: ['</strong>']
        })
        .from(0)
        .size(20)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "highlight": {
            "fields": {
              "title": {
                "fragment_size": 150,
              },
            },
            "post_tags": [
              "</strong>",
            ],
            "pre_tags": [
              "<strong>",
            ],
          },
          "query": {
            "bool": {
              "filter": [
                {
                  "range": {
                    "published_date": {
                      "gte": "2024-01-01",
                    },
                  },
                },
              ],
              "must": [
                {
                  "term": {
                    "author": "jane",
                  },
                },
              ],
            },
          },
          "size": 20,
        }
      `);
    });
  });

  describe('Document Management Search', () => {
    it('should build a document search with ID-based filtering', () => {
      const documentIds = ['doc-123', 'doc-456', 'doc-789'];
      const searchTerm = 'meeting notes';

      const result = query(documentMappings)
        .bool()
        .must((q) => q.ids(documentIds))
        .should(
          (q) =>
            q.when(searchTerm, (q2) =>
              q2.multiMatch(['title', 'content'], searchTerm, {
                operator: 'and'
              })
            ) || q.matchAll()
        )
        .minimumShouldMatch(0)
        .highlight(['title', 'content'], {
          fragment_size: 100,
          number_of_fragments: 2
        })
        .from(0)
        .size(50)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "highlight": {
            "fields": {
              "content": {
                "fragment_size": 100,
                "number_of_fragments": 2,
              },
              "title": {
                "fragment_size": 100,
                "number_of_fragments": 2,
              },
            },
          },
          "query": {
            "bool": {
              "minimum_should_match": 0,
              "must": [
                {
                  "ids": {
                    "values": [
                      "doc-123",
                      "doc-456",
                      "doc-789",
                    ],
                  },
                },
              ],
              "should": [
                {
                  "multi_match": {
                    "fields": [
                      "title",
                      "content",
                    ],
                    "operator": "and",
                    "query": "meeting notes",
                  },
                },
              ],
            },
          },
          "size": 50,
        }
      `);
    });

    it('should build a dynamic document search with multiple conditional filters', () => {
      const searchTerm = 'quarterly report';
      const startDate: string | undefined = '2024-01-01';
      const endDate: string | undefined = undefined;

      const result = query(documentMappings)
        .bool()
        .must(
          (q) =>
            q.when(searchTerm, (q2) =>
              q2.match('content', searchTerm, {
                operator: 'and'
              })
            ) || q.matchAll()
        )
        .filter(
          (q) =>
            q.when(true, (q2) => q2.terms('tags', ['finance'])) || q.matchAll()
        )
        .filter(
          (q) =>
            q.when(startDate && endDate, (q2) =>
              q2.range('published_date', {
                gte: startDate,
                lte: endDate
              })
            ) || q.matchAll()
        )
        .filter((q) => q.matchAll())
        .explain(true)
        .trackTotalHits(true)
        .from(0)
        .size(25)
        .sort('published_date', 'desc')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "explain": true,
          "from": 0,
          "query": {
            "bool": {
              "filter": [
                {
                  "terms": {
                    "tags": [
                      "finance",
                    ],
                  },
                },
                {
                  "match_all": {},
                },
                {
                  "match_all": {},
                },
              ],
              "must": [
                {
                  "match": {
                    "content": {
                      "operator": "and",
                      "query": "quarterly report",
                    },
                  },
                },
              ],
            },
          },
          "size": 25,
          "sort": [
            {
              "published_date": "desc",
            },
          ],
          "track_total_hits": true,
        }
      `);
    });
  });

  describe('Search UX Patterns', () => {
    it('should build a search-as-you-type query', () => {
      const userTypedPrefix = 'ela';

      const result = query(instrumentMappings)
        .matchPhrasePrefix('name', userTypedPrefix, { max_expansions: 50 })
        .highlight(['name'], {
          fragment_size: 80,
          pre_tags: ['<em>'],
          post_tags: ['</em>']
        })
        .from(0)
        .size(5)
        .timeout('2s')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "highlight": {
            "fields": {
              "name": {
                "fragment_size": 80,
              },
            },
            "post_tags": [
              "</em>",
            ],
            "pre_tags": [
              "<em>",
            ],
          },
          "query": {
            "match_phrase_prefix": {
              "name": {
                "max_expansions": 50,
                "query": "ela",
              },
            },
          },
          "size": 5,
          "timeout": "2s",
        }
      `);
    });

    it('should build a faceted search query', () => {
      const searchTerm = 'gaming';
      const facetFilters = {
        categories: ['technology', 'computing'],
        priceRange: { min: 500, max: 3000 },
        minRating: 4
      };

      const result = query(instrumentMappings)
        .bool()
        .must((q) => q.match('name', searchTerm, { boost: 2, operator: 'and' }))
        .filter((q) => q.term('asset_class', facetFilters.categories[0]))
        .filter((q) =>
          q.range('market_cap', {
            gte: facetFilters.priceRange.min,
            lte: facetFilters.priceRange.max
          })
        )
        .filter((q) =>
          q.range('credit_rating', { gte: facetFilters.minRating })
        )
        .highlight(['name'], { fragment_size: 100 })
        .timeout('5s')
        .from(0)
        .size(20)
        .sort('market_cap', 'asc')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "highlight": {
            "fields": {
              "name": {
                "fragment_size": 100,
              },
            },
          },
          "query": {
            "bool": {
              "filter": [
                {
                  "term": {
                    "asset_class": "technology",
                  },
                },
                {
                  "range": {
                    "market_cap": {
                      "gte": 500,
                      "lte": 3000,
                    },
                  },
                },
                {
                  "range": {
                    "credit_rating": {
                      "gte": 4,
                    },
                  },
                },
              ],
              "must": [
                {
                  "match": {
                    "name": {
                      "boost": 2,
                      "operator": "and",
                      "query": "gaming",
                    },
                  },
                },
              ],
            },
          },
          "size": 20,
          "sort": [
            {
              "market_cap": "asc",
            },
          ],
          "timeout": "5s",
        }
      `);
    });

    it('should build an error-resilient search with typo tolerance', () => {
      const userQuery = 'laptpo'; // Intentional typo

      const result = query(instrumentMappings)
        .bool()
        .must((q) =>
          q.fuzzy('name', userQuery, {
            fuzziness: 'AUTO',
            boost: 2
          })
        )
        .should((q) => q.fuzzy('description', userQuery, { fuzziness: 'AUTO' }))
        .minimumShouldMatch(1)
        .highlight(['name', 'description'])
        .explain(true)
        .from(0)
        .size(10)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "explain": true,
          "from": 0,
          "highlight": {
            "fields": {
              "description": {},
              "name": {},
            },
          },
          "query": {
            "bool": {
              "minimum_should_match": 1,
              "must": [
                {
                  "fuzzy": {
                    "name": {
                      "boost": 2,
                      "fuzziness": "AUTO",
                      "value": "laptpo",
                    },
                  },
                },
              ],
              "should": [
                {
                  "fuzzy": {
                    "description": {
                      "fuzziness": "AUTO",
                      "value": "laptpo",
                    },
                  },
                },
              ],
            },
          },
          "size": 10,
        }
      `);
    });
  });

  describe('Aggregations & Geo Queries', () => {
    it('should aggregate products by category with price statistics', () => {
      const agg = aggregations(instrumentMappings)
        .terms('by_category', 'asset_class', { size: 10 })
        .subAgg((sub) =>
          sub
            .avg('average_price', 'market_cap')
            .max('highest_price', 'market_cap')
            .min('lowest_price', 'market_cap')
        )
        .build();

      expect(agg).toMatchInlineSnapshot(`
        {
          "by_category": {
            "aggs": {
              "average_price": {
                "avg": {
                  "field": "market_cap",
                },
              },
              "highest_price": {
                "max": {
                  "field": "market_cap",
                },
              },
              "lowest_price": {
                "min": {
                  "field": "market_cap",
                },
              },
            },
            "terms": {
              "field": "asset_class",
              "size": 10,
            },
          },
        }
      `);
    });

    it('should analyze products sold over time with daily breakdown', () => {
      const agg = aggregations(instrumentMappings)
        .dateHistogram('sales_timeline', 'listed_date', {
          interval: 'day',
          min_doc_count: 1
        })
        .subAgg((sub) =>
          sub
            .sum('daily_revenue', 'market_cap')
            .cardinality('unique_categories', 'asset_class', {
              precision_threshold: 100
            })
        )
        .build();

      expect(agg).toMatchInlineSnapshot(`
        {
          "sales_timeline": {
            "aggs": {
              "daily_revenue": {
                "sum": {
                  "field": "market_cap",
                },
              },
              "unique_categories": {
                "cardinality": {
                  "field": "asset_class",
                  "precision_threshold": 100,
                },
              },
            },
            "date_histogram": {
              "field": "listed_date",
              "interval": "day",
              "min_doc_count": 1,
            },
          },
        }
      `);
    });

    it('should find restaurants near a location', () => {
      const result = query(restaurantMappings)
        .geoDistance(
          'location',
          { lat: 40.7128, lon: -74.006 },
          { distance: '5km' }
        )
        .size(20)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "geo_distance": {
              "distance": "5km",
              "location": {
                "lat": 40.7128,
                "lon": -74.006,
              },
            },
          },
          "size": 20,
        }
      `);
    });

    it('should search in a geographic bounding box', () => {
      const result = query(restaurantMappings)
        .geoBoundingBox('location', {
          top_left: { lat: 40.8, lon: -74.1 },
          bottom_right: { lat: 40.7, lon: -74.0 }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "geo_bounding_box": {
              "location": {
                "bottom_right": {
                  "lat": 40.7,
                  "lon": -74,
                },
                "top_left": {
                  "lat": 40.8,
                  "lon": -74.1,
                },
              },
            },
          },
        }
      `);
    });

    it('should find products matching a pattern', () => {
      const result = query(instrumentMappings)
        .regexp('asset_class', 'elec.*', { flags: 'CASE_INSENSITIVE' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "regexp": {
              "asset_class": {
                "flags": "CASE_INSENSITIVE",
                "value": "elec.*",
              },
            },
          },
        }
      `);
    });

    it('should use constant_score for efficient filtering', () => {
      const result = query(instrumentMappings)
        .constantScore((q) => q.term('asset_class', 'technology'), {
          boost: 1.2
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "constant_score": {
              "boost": 1.2,
              "filter": {
                "term": {
                  "asset_class": "technology",
                },
              },
            },
          },
        }
      `);
    });

    it('should combine geo search with aggregations for store analytics', () => {
      const queryResult = query(storeMappings)
        .geoDistance(
          'coordinates',
          { lat: 40.7128, lon: -74.006 },
          { distance: '10km' }
        )
        .build();

      const agg = aggregations(storeMappings)
        .terms('by_district', 'district', { size: 5 })
        .subAgg((sub) =>
          sub
            .avg('avg_rating', 'rating')
            .valueCount('total_items', 'item_count')
        )
        .build();

      expect(queryResult.query?.geo_distance).toBeDefined();
      expect(agg.by_district).toBeDefined();
    });
  });

  describe('Vector Search & Semantic Search', () => {
    it('should build a basic semantic product search', () => {
      // Simulated embedding vector for "wireless headphones"
      const searchEmbedding = [0.23, 0.45, 0.67, 0.12, 0.89, 0.34, 0.56, 0.78];

      const result = query(instrumentWithEmbeddingMappings)
        .knn('embedding', searchEmbedding, {
          k: 10,
          num_candidates: 100
        })
        .size(10)
        ._source(['name', 'description', 'market_cap', 'prospectus_url'])
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "_source": [
            "name",
            "description",
            "market_cap",
            "prospectus_url",
          ],
          "knn": {
            "field": "embedding",
            "k": 10,
            "num_candidates": 100,
            "query_vector": [
              0.23,
              0.45,
              0.67,
              0.12,
              0.89,
              0.34,
              0.56,
              0.78,
            ],
          },
          "size": 10,
        }
      `);
    });

    it('should build semantic search with category filtering', () => {
      const queryVector = [0.1, 0.2, 0.3, 0.4, 0.5];

      const result = query(instrumentWithEmbeddingMappings)
        .knn('embedding', queryVector, {
          k: 20,
          num_candidates: 200,
          filter: {
            bool: {
              must: [{ term: { category: 'technology' } }],
              filter: [{ range: { price: { gte: 100, lte: 1000 } } }]
            }
          }
        })
        .size(20)
        .build();

      expect(result.knn?.filter).toBeDefined();
      expect(result.knn?.filter.bool.must).toHaveLength(1);
      expect(result.knn?.filter.bool.filter).toHaveLength(1);
    });

    it('should build image similarity search', () => {
      // Simulated 512-dimensional image embedding (e.g., from ResNet)
      const imageEmbedding = new Array(512)
        .fill(0)
        .map((_, i) => Math.sin(i / 100));

      const result = query(instrumentWithEmbeddingMappings)
        .knn('embedding', imageEmbedding, {
          k: 50,
          num_candidates: 500,
          similarity: 0.7,
          boost: 1.2
        })
        .size(50)
        ._source(['isin', 'name', 'prospectus_url'])
        .build();

      expect(result.knn?.query_vector).toHaveLength(512);
      expect(result.knn?.similarity).toBe(0.7);
      expect(result.knn?.boost).toBe(1.2);
    });

    it('should build product recommendation engine query', () => {
      // Current product's embedding
      const currentProductEmbedding = [0.45, 0.23, 0.67, 0.89, 0.12];

      const result = query(instrumentWithEmbeddingMappings)
        .knn('embedding', currentProductEmbedding, {
          k: 10,
          num_candidates: 100,
          filter: {
            bool: {
              must_not: [{ term: { id: 'current-product-123' } }],
              must: [{ term: { category: 'technology' } }]
            }
          }
        })
        .size(10)
        ._source(['isin', 'name', 'market_cap', 'prospectus_url'])
        .build();

      expect(result.knn?.filter?.bool?.must_not).toBeDefined();
      expect(result.size).toBe(10);
    });

    it('should build semantic document search with aggregations', () => {
      // Search embedding for "machine learning best practices"
      const queryEmbedding = new Array(384).fill(0).map((_, i) => i / 384);

      const result = query(contentDocumentMappings)
        .knn('embedding', queryEmbedding, {
          k: 50,
          num_candidates: 500,
          filter: {
            range: {
              published_date: { gte: '2023-01-01' }
            }
          }
        })
        .aggs((agg) =>
          agg
            .terms('top_authors', 'author', { size: 10 })
            .terms('popular_tags', 'tags', { size: 20 })
        )
        .size(20)
        .build();

      expect(result.knn?.query_vector).toHaveLength(384);
      expect(result.aggs?.top_authors).toBeDefined();
      expect(result.aggs?.popular_tags).toBeDefined();
    });

    it('should build multilingual semantic search', () => {
      // Embedding from multilingual model (e.g., multilingual-E5)
      const multilingualEmbedding = new Array(768)
        .fill(0)
        .map(() => Math.random());

      const result = query(contentDocumentMappings)
        .knn('embedding', multilingualEmbedding, {
          k: 30,
          num_candidates: 300,
          boost: 1.5
        })
        .size(30)
        ._source(['title', 'content', 'author'])
        .highlight(['title', 'content'], {
          fragment_size: 150,
          number_of_fragments: 3
        })
        .build();

      expect(result.knn?.query_vector).toHaveLength(768);
      expect(result.highlight).toBeDefined();
    });

    it('should build OpenAI embedding search (1536 dimensions)', () => {
      // OpenAI text-embedding-ada-002 produces 1536-dimensional vectors
      const openaiEmbedding = new Array(1536).fill(0).map(() => Math.random());

      const result = query(contentDocumentMappings)
        .knn('embedding', openaiEmbedding, {
          k: 10,
          num_candidates: 100,
          filter: {
            bool: {
              must: [{ term: { author: 'john-doe' } }]
            }
          }
        })
        .size(10)
        .from(0)
        .build();

      expect(result.knn?.query_vector).toHaveLength(1536);
      expect(result.knn?.filter).toBeDefined();
    });

    it('should build hybrid semantic + price ranking', () => {
      const productEmbedding = [0.5, 0.3, 0.8, 0.2, 0.6];

      const result = query(instrumentWithEmbeddingMappings)
        .knn('embedding', productEmbedding, {
          k: 100,
          num_candidates: 1000,
          filter: {
            bool: {
              filter: [
                { range: { price: { gte: 50 } } },
                { term: { category: 'technology' } }
              ]
            }
          }
        })
        .size(20)
        .sort('market_cap', 'asc')
        ._source(['isin', 'name', 'market_cap'])
        .build();

      expect(result.knn?.filter).toBeDefined();
      expect(result.sort).toMatchInlineSnapshot(`
        [
          {
            "market_cap": "asc",
          },
        ]
      `);
    });

    it('should build semantic search with quality thresholding', () => {
      const queryVector = [0.7, 0.2, 0.5, 0.9, 0.1];

      const result = query(instrumentWithEmbeddingMappings)
        .knn('embedding', queryVector, {
          k: 20,
          num_candidates: 200,
          similarity: 0.85 // Only return highly similar results
        })
        .size(20)
        .minScore(0.8) // Additional relevance threshold
        .build();

      expect(result.knn?.similarity).toBe(0.85);
      expect(result.min_score).toBe(0.8);
    });

    it('should build "more like this" recommendation query', () => {
      // Reference item's embedding
      const referenceEmbedding = [0.33, 0.66, 0.22, 0.88, 0.44];
      const excludeIds = ['ref-item-1', 'ref-item-2', 'ref-item-3'];

      const result = query(instrumentWithEmbeddingMappings)
        .knn('embedding', referenceEmbedding, {
          k: 15,
          num_candidates: 150,
          filter: {
            bool: {
              must_not: excludeIds.map((id) => ({ term: { id } }))
            }
          }
        })
        .size(15)
        ._source(['isin', 'name', 'description', 'market_cap', 'asset_class'])
        .build();

      expect(result.knn?.filter?.bool?.must_not).toHaveLength(3);
      expect(result.size).toBe(15);
    });
  });

  describe('Script Queries & Custom Scoring', () => {
    const scoredProductMappings = mappings({
      id: keyword(),
      name: text(),
      price: long(),
      popularity: long(),
      quality_score: float(),
      rating: float(),
      views: long()
    });

    it('should build dynamic price filter with script', () => {
      const result = query(scoredProductMappings)
        .bool()
        .must((q) => q.match('name', 'laptop'))
        .filter((q) =>
          q.script({
            source: "doc['price'].value > params.threshold",
            params: { threshold: 500 }
          })
        )
        .build();

      expect(result.query?.bool?.filter).toHaveLength(1);
      expect(result.query?.bool?.filter[0].script).toBeDefined();
    });

    it('should build custom popularity scoring', () => {
      const result = query(scoredProductMappings)
        .scriptScore((q) => q.match('name', 'smartphone'), {
          source: "_score * Math.log(2 + doc['popularity'].value)"
        })
        .size(20)
        .build();

      expect(result.query?.script_score?.query?.match).toBeDefined();
      expect(result.query?.script_score?.script?.source).toContain(
        'popularity'
      );
    });

    it('should build weighted quality + popularity score', () => {
      const result = query(scoredProductMappings)
        .scriptScore(
          (q) =>
            q.multiMatch(['name'], 'premium headphones', {
              type: 'best_fields'
            }),
          {
            source: `
              double quality = doc['quality_score'].value;
              double popularity = doc['popularity'].value;
              return _score * (quality * 0.7 + popularity * 0.3);
            `.trim(),
            params: {}
          },
          { min_score: 5.0 }
        )
        .size(10)
        .build();

      expect(result.query?.script_score?.min_score).toBe(5.0);
    });

    it('should build personalized recommendation scoring', () => {
      const userPreferences = {
        price_weight: 0.3,
        quality_weight: 0.5,
        popularity_weight: 0.2
      };

      const result = query(scoredProductMappings)
        .scriptScore((q) => q.term('id', 'prod-123'), {
          source: `
              double price_score = 1.0 / (1.0 + doc['price'].value / 1000);
              double quality_score = doc['quality_score'].value / 10.0;
              double popularity_score = Math.log(1 + doc['popularity'].value) / 10.0;

              return _score * (
                price_score * params.price_weight +
                quality_score * params.quality_weight +
                popularity_score * params.popularity_weight
              );
            `.trim(),
          params: userPreferences
        })
        .size(50)
        .build();

      expect(result.query?.script_score?.script?.params).toEqual(
        userPreferences
      );
    });

    it('should build time-decay scoring for trending products', () => {
      const result = query(scoredProductMappings)
        .scriptScore(
          (q) => q.matchAll(),
          {
            source: `
              double views = doc['views'].value;
              double rating = doc['rating'].value;
              return Math.log(1 + views) * rating;
            `.trim()
          },
          { min_score: 1.0, boost: 1.5 }
        )
        .sort('popularity', 'desc')
        .size(20)
        .build();

      expect(result.query?.script_score?.boost).toBe(1.5);
      expect(result.sort).toEqual([{ popularity: 'desc' }]);
    });
  });

  describe('Percolate Queries & Alert Matching', () => {
    const alertRuleMappings = mappings({
      query: keyword(), // percolator field, but using keyword as placeholder
      name: text(),
      severity: keyword(),
      category: keyword()
    });

    it('should match log entry against saved alert rules', () => {
      const logEntry = {
        level: 'ERROR',
        message: 'Database connection failed',
        timestamp: '2024-01-15T10:30:00Z',
        source: 'api-server'
      };

      const result = query(alertRuleMappings)
        .percolate({
          field: 'query',
          document: logEntry
        })
        .size(100)
        .build();

      expect(result.query?.percolate?.document).toEqual(logEntry);
    });

    it('should classify multiple documents', () => {
      const articles = [
        { title: 'AI Breakthrough', content: 'Machine learning advances' },
        { title: 'Market Update', content: 'Stock prices surge' },
        { title: 'Sports News', content: 'Team wins championship' }
      ];

      const result = query(alertRuleMappings)
        .percolate({
          field: 'query',
          documents: articles
        })
        ._source(['name', 'category'])
        .size(50)
        .build();

      expect(result.query?.percolate?.documents).toHaveLength(3);
      expect(result._source).toContain('category');
    });

    it('should match against stored document', () => {
      const result = query(alertRuleMappings)
        .percolate({
          field: 'query',
          index: 'user_content',
          id: 'content-789',
          routing: 'user-123'
        })
        .size(20)
        .build();

      expect(result.query?.percolate?.index).toBe('user_content');
      expect(result.query?.percolate?.routing).toBe('user-123');
    });

    it('should build security alert system', () => {
      const securityEvent = {
        event_type: 'unauthorized_access',
        severity: 'high',
        ip_address: '192.168.1.100',
        user_id: 'unknown',
        timestamp: '2024-01-15T14:00:00Z',
        attempted_resource: '/admin/users'
      };

      const result = query(alertRuleMappings)
        .percolate({
          field: 'query',
          document: securityEvent,
          name: 'security_event_check'
        })
        ._source(['name', 'severity'])
        .sort('severity', 'desc')
        .size(100)
        .build();

      expect(result.query?.percolate?.name).toBe('security_event_check');
      expect(result.query?.percolate?.document?.severity).toBe('high');
    });

    it('should build content recommendation engine', () => {
      const userPreferences = {
        interests: ['technology', 'science', 'programming'],
        reading_level: 'advanced',
        preferred_length: 'medium'
      };

      const result = query(alertRuleMappings)
        .percolate({
          field: 'query',
          document: userPreferences
        })
        ._source(['name', 'category'])
        .size(50)
        .build();

      expect(result.query?.percolate?.document?.interests).toHaveLength(3);
    });

    it('should build real-time monitoring system', () => {
      const metrics = {
        cpu_usage: 85,
        memory_usage: 92,
        disk_usage: 78,
        response_time_ms: 1500,
        error_rate: 0.05,
        timestamp: '2024-01-15T15:00:00Z'
      };

      const result = query(alertRuleMappings)
        .percolate({
          field: 'query',
          document: metrics,
          preference: '_local'
        })
        .sort('severity', 'desc')
        .size(100)
        .build();

      expect(result.query?.percolate?.document?.cpu_usage).toBe(85);
      expect(result.query?.percolate?.preference).toBe('_local');
    });
  });

  describe('Multi-Search', () => {
    it('should build dashboard with multiple product searches', () => {
      const dashboardProductMappings = mappings({
        id: keyword(),
        name: text(),
        category: keyword(),
        price: long(),
        sales_count: long(),
        created_at: date()
      });
      // Top selling products query
      const topSelling = query(dashboardProductMappings)
        .bool()
        .filter((q) => q.range('created_at', { gte: 'now-30d' }))
        .sort('sales_count', 'desc')
        .size(10)
        .build();

      // New arrivals query
      const newArrivals = query(dashboardProductMappings)
        .matchAll()
        .sort('created_at', 'desc')
        .size(10)
        .build();

      // Electronics deals query
      const electronicsDeals = query(dashboardProductMappings)
        .bool()
        .filter((q) => q.term('category', 'technology'))
        .filter((q) => q.range('price', { lte: 500 }))
        .sort('price', 'asc')
        .size(5)
        .build();

      const ndjson = msearch(dashboardProductMappings)
        .addQuery(topSelling, { index: 'instruments' })
        .addQuery(newArrivals, { index: 'instruments' })
        .addQuery(electronicsDeals, { index: 'instruments' })
        .build();

      expect(ndjson).toMatchInlineSnapshot(`
        "{"index":"instruments"}
        {"query":{"bool":{"filter":[{"range":{"created_at":{"gte":"now-30d"}}}]}},"sort":[{"sales_count":"desc"}],"size":10}
        {"index":"instruments"}
        {"query":{"match_all":{}},"sort":[{"created_at":"desc"}],"size":10}
        {"index":"instruments"}
        {"query":{"bool":{"filter":[{"term":{"category":"technology"}},{"range":{"price":{"lte":500}}}]}},"sort":[{"price":"asc"}],"size":5}
        "
      `);
    });

    it('should search across multiple tenant indices', () => {
      const tenantDocMappings = mappings({
        id: keyword(),
        content: text(),
        tenant_id: keyword()
      });
      const searchQuery = query(tenantDocMappings)
        .match('content', 'important')
        .size(20)
        .build();

      const result = msearch(tenantDocMappings)
        .addQuery(searchQuery, { index: 'tenant-001-docs' })
        .addQuery(searchQuery, { index: 'tenant-002-docs' })
        .addQuery(searchQuery, { index: 'tenant-003-docs' })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": "tenant-001-docs",
          },
          {
            "query": {
              "match": {
                "content": "important",
              },
            },
            "size": 20,
          },
          {
            "index": "tenant-002-docs",
          },
          {
            "query": {
              "match": {
                "content": "important",
              },
            },
            "size": 20,
          },
          {
            "index": "tenant-003-docs",
          },
          {
            "query": {
              "match": {
                "content": "important",
              },
            },
            "size": 20,
          },
        ]
      `);
    });
  });

  describe('Bulk Operations', () => {
    it('should build product catalog import', () => {
      const catalogProductMappings = mappings({
        sku: keyword(),
        name: text(),
        price: long(),
        category: keyword(),
        stock: integer()
      });

      const products = [
        {
          sku: 'LAP-001',
          name: 'Gaming Laptop',
          price: 1299,
          category: 'technology',
          stock: 15
        },
        {
          sku: 'MOU-002',
          name: 'Wireless Mouse',
          price: 29,
          category: 'accessories',
          stock: 50
        },
        {
          sku: 'KEY-003',
          name: 'Mechanical Keyboard',
          price: 149,
          category: 'accessories',
          stock: 30
        }
      ];

      let bulkBuilder = bulk(catalogProductMappings);
      for (const product of products) {
        bulkBuilder = bulkBuilder.index(product, {
          _index: 'instruments',
          _id: product.sku
        });
      }

      const ndjson = bulkBuilder.build();

      expect(ndjson).toMatchInlineSnapshot(`
        "{"index":{"_index":"instruments","_id":"LAP-001"}}
        {"sku":"LAP-001","name":"Gaming Laptop","price":1299,"category":"technology","stock":15}
        {"index":{"_index":"instruments","_id":"MOU-002"}}
        {"sku":"MOU-002","name":"Wireless Mouse","price":29,"category":"accessories","stock":50}
        {"index":{"_index":"instruments","_id":"KEY-003"}}
        {"sku":"KEY-003","name":"Mechanical Keyboard","price":149,"category":"accessories","stock":30}
        "
      `);
    });

    it('should build price update batch with script', () => {
      const pricedProductMappings = mappings({
        id: keyword(),
        price: long()
      });

      // Apply 10% discount to specific products
      const productIds = ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'];

      let bulkBuilder = bulk(pricedProductMappings);
      for (const id of productIds) {
        bulkBuilder = bulkBuilder.update({
          _index: 'instruments',
          _id: id,
          script: {
            source: 'ctx._source.price *= params.discount',
            params: { discount: 0.9 }
          }
        });
      }

      const ndjson = bulkBuilder.build();

      expect(ndjson).toMatchInlineSnapshot(`
        "{"update":{"_index":"instruments","_id":"prod-1"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        {"update":{"_index":"instruments","_id":"prod-2"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        {"update":{"_index":"instruments","_id":"prod-3"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        {"update":{"_index":"instruments","_id":"prod-4"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        {"update":{"_index":"instruments","_id":"prod-5"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        "
      `);
    });

    it('should build mixed CRUD operations', () => {
      const inventoryItemMappings = mappings({
        id: keyword(),
        name: text(),
        quantity: integer()
      });

      const bulkOp = bulk(inventoryItemMappings)
        // Add new items
        .create(
          { id: 'new-1', name: 'New Product', quantity: 100 },
          { _index: 'inventory', _id: 'new-1' }
        )
        // Update stock levels
        .update({
          _index: 'inventory',
          _id: 'existing-1',
          doc: { quantity: 50 }
        })
        // Replace item entirely
        .index(
          { id: 'replace-1', name: 'Replaced Product', quantity: 25 },
          { _index: 'inventory', _id: 'replace-1' }
        )
        // Remove discontinued items
        .delete({ _index: 'inventory', _id: 'discontinued-1' })
        .build();

      expect(bulkOp).toMatchInlineSnapshot(`
        "{"create":{"_index":"inventory","_id":"new-1"}}
        {"id":"new-1","name":"New Product","quantity":100}
        {"update":{"_index":"inventory","_id":"existing-1"}}
        {"doc":{"quantity":50}}
        {"index":{"_index":"inventory","_id":"replace-1"}}
        {"id":"replace-1","name":"Replaced Product","quantity":25}
        {"delete":{"_index":"inventory","_id":"discontinued-1"}}
        "
      `);
    });

    it('should build upsert operations for sync', () => {
      const syncedDocumentMappings = mappings({
        id: keyword(),
        data: text(),
        updated_at: date()
      });

      const updates = [
        { id: 'doc-1', data: 'Updated content', updated_at: '2024-01-15' },
        { id: 'doc-2', data: 'New content', updated_at: '2024-01-15' }
      ];

      let bulkBuilder = bulk(syncedDocumentMappings);
      for (const update of updates) {
        bulkBuilder = bulkBuilder.update({
          _index: 'documents',
          _id: update.id,
          doc: update,
          upsert: update // Insert if doesn't exist
        });
      }

      const ndjson = bulkBuilder.build();

      expect(ndjson).toMatchInlineSnapshot(`
        "{"update":{"_index":"documents","_id":"doc-1"}}
        {"doc":{"id":"doc-1","data":"Updated content","updated_at":"2024-01-15"},"upsert":{"id":"doc-1","data":"Updated content","updated_at":"2024-01-15"}}
        {"update":{"_index":"documents","_id":"doc-2"}}
        {"doc":{"id":"doc-2","data":"New content","updated_at":"2024-01-15"},"upsert":{"id":"doc-2","data":"New content","updated_at":"2024-01-15"}}
        "
      `);
    });
  });

  describe('Index Management', () => {
    it('should build e-commerce product index', () => {
      const ecommerceProductMappings = mappings({
        sku: keyword(),
        name: text({
          analyzer: 'standard',
          fields: { keyword: { type: 'keyword' } }
        }),
        description: text({ analyzer: 'english' }),
        price: scaledFloat({ scaling_factor: 100 }),
        category: keyword(),
        brand: keyword(),
        tags: keyword(),
        rating: halfFloat(),
        reviewCount: integer(),
        inStock: keyword(), // boolean mapped as keyword for index builder compatibility
        createdAt: date()
      });

      const indexConfig = indexBuilder()
        .mappings(ecommerceProductMappings)
        .settings({
          number_of_shards: 3,
          number_of_replicas: 2,
          refresh_interval: '1s'
        })
        .alias('instruments')
        .build();

      expect(indexConfig).toMatchInlineSnapshot(`
        {
          "aliases": {
            "instruments": {},
          },
          "mappings": {
            "properties": {
              "brand": {
                "type": "keyword",
              },
              "category": {
                "type": "keyword",
              },
              "createdAt": {
                "type": "date",
              },
              "description": {
                "analyzer": "english",
                "type": "text",
              },
              "inStock": {
                "type": "keyword",
              },
              "name": {
                "analyzer": "standard",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                  },
                },
                "type": "text",
              },
              "price": {
                "scaling_factor": 100,
                "type": "scaled_float",
              },
              "rating": {
                "type": "half_float",
              },
              "reviewCount": {
                "type": "integer",
              },
              "sku": {
                "type": "keyword",
              },
              "tags": {
                "type": "keyword",
              },
            },
          },
          "settings": {
            "number_of_replicas": 2,
            "number_of_shards": 3,
            "refresh_interval": "1s",
          },
        }
      `);
    });

    it('should build vector search index with HNSW', () => {
      const vectorDocumentMappings = mappings({
        title: text(),
        content: text(),
        embedding: denseVector({
          dims: 768,
          index: true,
          similarity: 'cosine',
          index_options: {
            type: 'hnsw',
            m: 16,
            ef_construction: 100
          }
        }),
        category: keyword()
      });

      const indexConfig = indexBuilder()
        .mappings(vectorDocumentMappings)
        .settings({
          number_of_shards: 1,
          number_of_replicas: 0
        })
        .build();

      expect(indexConfig).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "category": {
                "type": "keyword",
              },
              "content": {
                "type": "text",
              },
              "embedding": {
                "dims": 768,
                "index": true,
                "index_options": {
                  "ef_construction": 100,
                  "m": 16,
                  "type": "hnsw",
                },
                "similarity": "cosine",
                "type": "dense_vector",
              },
              "title": {
                "type": "text",
              },
            },
          },
          "settings": {
            "number_of_replicas": 0,
            "number_of_shards": 1,
          },
        }
      `);
    });

    it('should build time-series index with aliases', () => {
      const logEntryMappings = mappings({
        timestamp: date(),
        level: keyword(),
        message: text({ analyzer: 'standard' }),
        service: keyword(),
        trace_id: keyword()
      });

      const indexConfig = indexBuilder()
        .mappings(logEntryMappings)
        .settings({
          number_of_shards: 1,
          number_of_replicas: 1,
          refresh_interval: '5s'
        })
        .alias('logs-current', { is_write_index: true })
        .alias('logs-all')
        .build();

      expect(indexConfig).toMatchInlineSnapshot(`
        {
          "aliases": {
            "logs-all": {},
            "logs-current": {
              "is_write_index": true,
            },
          },
          "mappings": {
            "properties": {
              "level": {
                "type": "keyword",
              },
              "message": {
                "analyzer": "standard",
                "type": "text",
              },
              "service": {
                "type": "keyword",
              },
              "timestamp": {
                "type": "date",
              },
              "trace_id": {
                "type": "keyword",
              },
            },
          },
          "settings": {
            "number_of_replicas": 1,
            "number_of_shards": 1,
            "refresh_interval": "5s",
          },
        }
      `);
    });

    it('should build multi-field text index for search', () => {
      const articleIndexMappings = mappings({
        title: text({
          analyzer: 'english',
          fields: {
            exact: { type: 'keyword' },
            raw: { type: 'text', analyzer: 'standard' }
          }
        }),
        author: keyword(),
        content: text({ analyzer: 'english' }),
        publishedAt: date()
      });

      const indexConfig = indexBuilder()
        .mappings(articleIndexMappings)
        .settings({
          number_of_shards: 2,
          number_of_replicas: 1
        })
        .build();

      expect(indexConfig).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "author": {
                "type": "keyword",
              },
              "content": {
                "analyzer": "english",
                "type": "text",
              },
              "publishedAt": {
                "type": "date",
              },
              "title": {
                "analyzer": "english",
                "fields": {
                  "exact": {
                    "type": "keyword",
                  },
                  "raw": {
                    "analyzer": "standard",
                    "type": "text",
                  },
                },
                "type": "text",
              },
            },
          },
          "settings": {
            "number_of_replicas": 1,
            "number_of_shards": 2,
          },
        }
      `);
    });

    it('should build a professional domain index using field helpers', () => {
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

      expect(indexConfig).toMatchInlineSnapshot(`
        {
          "aliases": {
            "matters-all": {},
            "matters-current": {
              "is_write_index": true,
            },
          },
          "mappings": {
            "properties": {
              "billing_rate": {
                "type": "integer",
              },
              "opened_at": {
                "type": "date",
              },
              "practice_area": {
                "type": "keyword",
              },
              "risk_score": {
                "type": "float",
              },
              "title": {
                "analyzer": "english",
                "type": "text",
              },
            },
          },
          "settings": {
            "number_of_replicas": 1,
            "number_of_shards": 2,
            "refresh_interval": "5s",
          },
        }
      `);
    });
  });

  describe('Aggregations — Portfolio Analytics', () => {
    const portfolioMappings = mappings({
      name: text(),
      asset_class: keyword(),
      sector: keyword(),
      price: long(),
      yield_rate: float(),
      listed_date: date()
    });
    it('should aggregate fixed-income instruments by sector with yield metrics', () => {
      const result = query(portfolioMappings)
        .bool()
        .filter((q) => q.term('asset_class', 'fixed-income'))
        .filter((q) => q.range('yield_rate', { gte: 3.0 }))
        .aggs((agg) =>
          agg
            .terms('by_sector', 'sector', { size: 10 })
            .subAgg((sub) =>
              sub.avg('avg_yield', 'yield_rate').max('max_price', 'price')
            )
        )
        .size(0)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aggs": {
            "by_sector": {
              "aggs": {
                "avg_yield": {
                  "avg": {
                    "field": "yield_rate",
                  },
                },
                "max_price": {
                  "max": {
                    "field": "price",
                  },
                },
              },
              "terms": {
                "field": "sector",
                "size": 10,
              },
            },
          },
          "query": {
            "bool": {
              "filter": [
                {
                  "term": {
                    "asset_class": "fixed-income",
                  },
                },
                {
                  "range": {
                    "yield_rate": {
                      "gte": 3,
                    },
                  },
                },
              ],
            },
          },
          "size": 0,
        }
      `);
    });

    it('should build a date histogram with percentile sub-aggregation', () => {
      const result = aggregations(portfolioMappings)
        .dateHistogram('listings_over_time', 'listed_date', {
          interval: 'quarter',
          min_doc_count: 1
        })
        .subAgg((sub) =>
          sub.percentiles('yield_percentiles', 'yield_rate', {
            percents: [25, 50, 75, 95]
          })
        )
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "listings_over_time": {
            "aggs": {
              "yield_percentiles": {
                "percentiles": {
                  "field": "yield_rate",
                  "percents": [
                    25,
                    50,
                    75,
                    95,
                  ],
                },
              },
            },
            "date_histogram": {
              "field": "listed_date",
              "interval": "quarter",
              "min_doc_count": 1,
            },
          },
        }
      `);
    });

    it('should build a price histogram with stats sub-aggregation', () => {
      const result = aggregations(portfolioMappings)
        .histogram('price_buckets', 'price', {
          interval: 100,
          min_doc_count: 1
        })
        .subAgg((sub) => sub.stats('yield_stats', 'yield_rate'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "price_buckets": {
            "aggs": {
              "yield_stats": {
                "stats": {
                  "field": "yield_rate",
                },
              },
            },
            "histogram": {
              "field": "price",
              "interval": 100,
              "min_doc_count": 1,
            },
          },
        }
      `);
    });
  });

  describe('Multi-Search with Per-Query Aggregations', () => {
    it('should batch two aggregation queries in one request', () => {
      const listingMappings = mappings({
        address: text(),
        property_class: keyword(),
        list_price: long()
      });
      const condoSearch = query(listingMappings)
        .bool()
        .filter((q) => q.term('property_class', 'condo'))
        .filter((q) => q.range('list_price', { lte: 2_000_000 }))
        .aggs((agg) => agg.avg('avg_price', 'list_price'))
        .size(0)
        .build();

      const townhouseSearch = query(listingMappings)
        .bool()
        .filter((q) => q.term('property_class', 'townhouse'))
        .aggs((agg) =>
          agg.avg('avg_price', 'list_price').min('min_price', 'list_price')
        )
        .size(0)
        .build();

      const ndjson = msearch(listingMappings)
        .addQuery(condoSearch, { index: 'listings' })
        .addQuery(townhouseSearch, { index: 'listings' })
        .build();

      expect(ndjson).toMatchInlineSnapshot(`
        "{"index":"listings"}
        {"query":{"bool":{"filter":[{"term":{"property_class":"condo"}},{"range":{"list_price":{"lte":2000000}}}]}},"aggs":{"avg_price":{"avg":{"field":"list_price"}}},"size":0}
        {"index":"listings"}
        {"query":{"bool":{"filter":[{"term":{"property_class":"townhouse"}}]}},"aggs":{"avg_price":{"avg":{"field":"list_price"}},"min_price":{"min":{"field":"list_price"}}},"size":0}
        "
      `);
    });
  });

  describe('Suggest — Standalone Builder', () => {
    const attorneyMappings = mappings({
      name: text(),
      practice_area: keyword(),
      name_suggest: completion()
    });
    it('should build a completion autocomplete request', () => {
      const result = suggest(attorneyMappings)
        .completion('autocomplete', 'kap', {
          field: 'name_suggest',
          size: 5,
          skip_duplicates: true
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "autocomplete": {
              "completion": {
                "field": "name_suggest",
                "size": 5,
                "skip_duplicates": true,
              },
              "prefix": "kap",
            },
          },
        }
      `);
    });

    it('should build a term spell-check request', () => {
      const result = suggest(attorneyMappings)
        .term('spelling', 'wiliams', {
          field: 'name',
          size: 3,
          suggest_mode: 'popular'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "spelling": {
              "term": {
                "field": "name",
                "size": 3,
                "suggest_mode": "popular",
              },
              "text": "wiliams",
            },
          },
        }
      `);
    });

    it('should build a combined autocomplete and spell-check request', () => {
      const result = suggest(attorneyMappings)
        .completion('autocomplete', 'kap', { field: 'name_suggest', size: 5 })
        .term('spelling', 'wiliams', { field: 'name', size: 3 })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "autocomplete": {
              "completion": {
                "field": "name_suggest",
                "size": 5,
              },
              "prefix": "kap",
            },
            "spelling": {
              "term": {
                "field": "name",
                "size": 3,
              },
              "text": "wiliams",
            },
          },
        }
      `);
    });
  });
});
