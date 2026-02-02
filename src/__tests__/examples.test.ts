import { query, aggregations, msearch, bulk, indexBuilder } from '..';

/**
 * Real-world usage examples demonstrating elastiq-ts's capabilities.
 * These tests showcase common search patterns and can serve as documentation.
 */

type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  created_at: string;
  rating: number;
};

type Article = {
  id: string;
  title: string;
  content: string;
  author: string;
  published_date: string;
  updated_date: string;
  tags: string[];
  comments: {
    author: string;
    text: string;
    created_at: string;
    rating: number;
  }[];
};

type Document = {
  id: string;
  content: string;
  title: string;
  tags: string[];
  published_date: string;
};

type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  location: { lat: number; lon: number };
  rating: number;
};

type Store = {
  id: string;
  name: string;
  coordinates: { lat: number; lon: number };
  district: string;
  rating: number;
  item_count: number;
};

type ProductWithVector = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  embedding: number[];
};

type ContentDocument = {
  id: string;
  title: string;
  content: string;
  author: string;
  published_date: string;
  tags: string[];
  embedding: number[];
};

describe('Real-world Usage Examples', () => {
  describe('E-commerce Product Search', () => {
    it('should build a basic product search query', () => {
      const searchTerm = 'laptop';

      const result = query<Product>()
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
                "query": "laptop",
              },
            },
          },
          "size": 20,
        }
      `);
    });

    it('should build an advanced product search with filters and highlighting', () => {
      const searchTerm = 'gaming laptop';
      const category = 'electronics';
      const minPrice = 800;
      const maxPrice = 2000;

      const result = query<Product>()
        .bool()
        .must((q) => q.match('name', searchTerm, { operator: 'and', boost: 2 }))
        .should((q) =>
          q.fuzzy('description', searchTerm, { fuzziness: 'AUTO' })
        )
        .filter((q) => q.term('category', category))
        .filter((q) =>
          q.range('price', {
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
        .sort('price', 'asc')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "highlight": {
            "fields": {
              "description": {
                "fragment_size": 150,
                "number_of_fragments": 2,
                "post_tags": [
                  "</mark>",
                ],
                "pre_tags": [
                  "<mark>",
                ],
              },
              "name": {
                "fragment_size": 150,
                "number_of_fragments": 2,
                "post_tags": [
                  "</mark>",
                ],
                "pre_tags": [
                  "<mark>",
                ],
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
                    "category": "electronics",
                  },
                },
                {
                  "range": {
                    "price": {
                      "gte": 800,
                      "lte": 2000,
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
                      "query": "gaming laptop",
                    },
                  },
                },
              ],
              "should": [
                {
                  "fuzzy": {
                    "description": {
                      "fuzziness": "AUTO",
                      "value": "gaming laptop",
                    },
                  },
                },
              ],
            },
          },
          "size": 20,
          "sort": [
            {
              "price": "asc",
            },
          ],
          "timeout": "5s",
          "track_scores": true,
        }
      `);
    });

    it('should build a dynamic product search with conditional filters', () => {
      const searchTerm = 'laptop';
      const selectedCategory = 'electronics';
      const minPrice = undefined;
      const maxPrice = undefined;
      const selectedTags = ['gaming', 'portable'];

      const result = query<Product>()
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
              q2.term('category', selectedCategory)
            ) || q.matchAll()
        )
        .filter(
          (q) =>
            q.when(minPrice && maxPrice, (q2) =>
              q2.range('price', {
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
                    "category": "electronics",
                  },
                },
                {
                  "match_all": {},
                },
                {
                  "terms": {
                    "tags": [
                      "gaming",
                      "portable",
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
                      "query": "laptop",
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
      const userInput = 'gam';

      const result = query<Product>()
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
                      "query": "gam",
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

      const result = query<Article>()
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
                "post_tags": [
                  "</em>",
                ],
                "pre_tags": [
                  "<em>",
                ],
              },
              "title": {
                "fragment_size": 200,
                "number_of_fragments": 3,
                "post_tags": [
                  "</em>",
                ],
                "pre_tags": [
                  "<em>",
                ],
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

      const result = query<Article>()
        .bool()
        .must((q) => q.match('author', authorName))
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
                "post_tags": [
                  "</strong>",
                ],
                "pre_tags": [
                  "<strong>",
                ],
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
                  "match": {
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

      const result = query<Document>()
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

      const result = query<Document>()
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

      const result = query<Product>()
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
                "post_tags": [
                  "</em>",
                ],
                "pre_tags": [
                  "<em>",
                ],
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
        categories: ['electronics', 'computing'],
        priceRange: { min: 500, max: 3000 },
        minRating: 4
      };

      const result = query<Product>()
        .bool()
        .must((q) => q.match('name', searchTerm, { boost: 2, operator: 'and' }))
        .filter((q) => q.term('category', facetFilters.categories[0]))
        .filter((q) =>
          q.range('price', {
            gte: facetFilters.priceRange.min,
            lte: facetFilters.priceRange.max
          })
        )
        .filter((q) => q.range('rating', { gte: facetFilters.minRating }))
        .highlight(['name'], { fragment_size: 100 })
        .timeout('5s')
        .from(0)
        .size(20)
        .sort('price', 'asc')
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
                    "category": "electronics",
                  },
                },
                {
                  "range": {
                    "price": {
                      "gte": 500,
                      "lte": 3000,
                    },
                  },
                },
                {
                  "range": {
                    "rating": {
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
              "price": "asc",
            },
          ],
          "timeout": "5s",
        }
      `);
    });

    it('should build an error-resilient search with typo tolerance', () => {
      const userQuery = 'laptpo'; // Intentional typo

      const result = query<Product>()
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

  describe('Further features TBC: Aggregations & Geo Queries', () => {
    it('should aggregate products by category with price statistics', () => {
      query<Product>()
        .match('description', 'electronics')
        .range('price', { gte: 100 })
        .build();

      const agg = aggregations<Product>()
        .terms('by_category', 'category', { size: 10 })
        .subAgg((sub) =>
          sub
            .avg('average_price', 'price')
            .max('highest_price', 'price')
            .min('lowest_price', 'price')
        )
        .build();

      expect(agg).toMatchInlineSnapshot(`
        {
          "by_category": {
            "aggs": {
              "average_price": {
                "avg": {
                  "field": "price",
                },
              },
              "highest_price": {
                "max": {
                  "field": "price",
                },
              },
              "lowest_price": {
                "min": {
                  "field": "price",
                },
              },
            },
            "terms": {
              "field": "category",
              "size": 10,
            },
          },
        }
      `);
    });

    it('should analyze products sold over time with daily breakdown', () => {
      const agg = aggregations<Product>()
        .dateHistogram('sales_timeline', 'created_at', {
          interval: 'day',
          min_doc_count: 1
        })
        .subAgg((sub) =>
          sub
            .sum('daily_revenue', 'price')
            .cardinality('unique_categories', 'category', {
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
                  "field": "price",
                },
              },
              "unique_categories": {
                "cardinality": {
                  "field": "category",
                  "precision_threshold": 100,
                },
              },
            },
            "date_histogram": {
              "field": "created_at",
              "interval": "day",
              "min_doc_count": 1,
            },
          },
        }
      `);
    });

    it('should find restaurants near a location', () => {
      const result = query<Restaurant>()
        .match('cuisine', 'italian')
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
      const result = query<Restaurant>()
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
      const result = query<Product>()
        .regexp('category', 'elec.*', { flags: 'CASE_INSENSITIVE' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "regexp": {
              "category": {
                "flags": "CASE_INSENSITIVE",
                "value": "elec.*",
              },
            },
          },
        }
      `);
    });

    it('should use constant_score for efficient filtering', () => {
      const result = query<Product>()
        .constantScore((q) => q.term('category', 'electronics'), { boost: 1.2 })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "constant_score": {
              "boost": 1.2,
              "filter": {
                "term": {
                  "category": "electronics",
                },
              },
            },
          },
        }
      `);
    });

    it('should combine geo search with aggregations for store analytics', () => {
      const queryResult = query<Store>()
        .match('name', 'convenience')
        .geoDistance(
          'coordinates',
          { lat: 40.7128, lon: -74.006 },
          { distance: '10km' }
        )
        .build();

      const agg = aggregations<Store>()
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

      const result = query<ProductWithVector>()
        .knn('embedding', searchEmbedding, {
          k: 10,
          num_candidates: 100
        })
        .size(10)
        ._source(['name', 'description', 'price', 'image_url'])
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "_source": [
            "name",
            "description",
            "price",
            "image_url",
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

      const result = query<ProductWithVector>()
        .knn('embedding', queryVector, {
          k: 20,
          num_candidates: 200,
          filter: {
            bool: {
              must: [{ term: { category: 'electronics' } }],
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

      const result = query<ProductWithVector>()
        .knn('embedding', imageEmbedding, {
          k: 50,
          num_candidates: 500,
          similarity: 0.7,
          boost: 1.2
        })
        .size(50)
        ._source(['id', 'name', 'image_url'])
        .build();

      expect(result.knn?.query_vector).toHaveLength(512);
      expect(result.knn?.similarity).toBe(0.7);
      expect(result.knn?.boost).toBe(1.2);
    });

    it('should build product recommendation engine query', () => {
      // Current product's embedding
      const currentProductEmbedding = [0.45, 0.23, 0.67, 0.89, 0.12];

      const result = query<ProductWithVector>()
        .knn('embedding', currentProductEmbedding, {
          k: 10,
          num_candidates: 100,
          filter: {
            bool: {
              must_not: [{ term: { id: 'current-product-123' } }],
              must: [{ term: { category: 'electronics' } }]
            }
          }
        })
        .size(10)
        ._source(['id', 'name', 'price', 'image_url'])
        .build();

      expect(result.knn?.filter?.bool?.must_not).toBeDefined();
      expect(result.size).toBe(10);
    });

    it('should build semantic document search with aggregations', () => {
      // Search embedding for "machine learning best practices"
      const queryEmbedding = new Array(384).fill(0).map((_, i) => i / 384);

      const result = query<ContentDocument>()
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

      const result = query<ContentDocument>()
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

      const result = query<ContentDocument>()
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

      const result = query<ProductWithVector>()
        .knn('embedding', productEmbedding, {
          k: 100,
          num_candidates: 1000,
          filter: {
            bool: {
              filter: [
                { range: { price: { gte: 50 } } },
                { term: { category: 'electronics' } }
              ]
            }
          }
        })
        .size(20)
        .sort('price', 'asc')
        ._source(['id', 'name', 'price'])
        .build();

      expect(result.knn?.filter).toBeDefined();
      expect(result.sort).toEqual([{ price: 'asc' }]);
    });

    it('should build semantic search with quality thresholding', () => {
      const queryVector = [0.7, 0.2, 0.5, 0.9, 0.1];

      const result = query<ProductWithVector>()
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

      const result = query<ProductWithVector>()
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
        ._source(['id', 'name', 'description', 'price', 'category'])
        .build();

      expect(result.knn?.filter?.bool?.must_not).toHaveLength(3);
      expect(result.size).toBe(15);
    });
  });

  describe('Script Queries & Custom Scoring', () => {
    type ScoredProduct = {
      id: string;
      name: string;
      price: number;
      popularity: number;
      quality_score: number;
      rating: number;
      views: number;
    };

    it('should build dynamic price filter with script', () => {
      const result = query<ScoredProduct>()
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
      const result = query<ScoredProduct>()
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
      const result = query<ScoredProduct>()
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

      const result = query<ScoredProduct>()
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
      const result = query<ScoredProduct>()
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
    type AlertRule = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      query: any;
      name: string;
      severity: string;
      category: string;
    };

    type LogEntry = {
      level: string;
      message: string;
      timestamp: string;
      source: string;
    };

    it('should match log entry against saved alert rules', () => {
      const logEntry: LogEntry = {
        level: 'ERROR',
        message: 'Database connection failed',
        timestamp: '2024-01-15T10:30:00Z',
        source: 'api-server'
      };

      const result = query<AlertRule>()
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

      const result = query<AlertRule>()
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
      const result = query<AlertRule>()
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

      const result = query<AlertRule>()
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

      const result = query<AlertRule>()
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

      const result = query<AlertRule>()
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

  describe('Real-World Multi-Search Examples', () => {
    it('should build dashboard with multiple product searches', () => {
      type DashboardProduct = {
        id: string;
        name: string;
        category: string;
        price: number;
        sales_count: number;
        created_at: string;
      };

      // Top selling products query
      const topSelling = query<DashboardProduct>()
        .bool()
        .filter((q) => q.range('created_at', { gte: 'now-30d' }))
        .sort('sales_count', 'desc')
        .size(10)
        .build();

      // New arrivals query
      const newArrivals = query<DashboardProduct>()
        .matchAll()
        .sort('created_at', 'desc')
        .size(10)
        .build();

      // Electronics deals query
      const electronicsDeals = query<DashboardProduct>()
        .bool()
        .filter((q) => q.term('category', 'electronics'))
        .filter((q) => q.range('price', { lte: 500 }))
        .sort('price', 'asc')
        .size(5)
        .build();

      const ndjson = msearch<DashboardProduct>()
        .addQuery(topSelling, { index: 'products' })
        .addQuery(newArrivals, { index: 'products' })
        .addQuery(electronicsDeals, { index: 'products' })
        .build();

      expect(ndjson).toMatchInlineSnapshot(`
        "{"index":"products"}
        {"query":{"bool":{"filter":[{"range":{"created_at":{"gte":"now-30d"}}}]}},"sort":[{"sales_count":"desc"}],"size":10}
        {"index":"products"}
        {"query":{"match_all":{}},"sort":[{"created_at":"desc"}],"size":10}
        {"index":"products"}
        {"query":{"bool":{"filter":[{"term":{"category":"electronics"}},{"range":{"price":{"lte":500}}}]}},"sort":[{"price":"asc"}],"size":5}
        "
      `);
    });

    it('should search across multiple tenant indices', () => {
      type TenantDocument = {
        id: string;
        content: string;
        tenant_id: string;
      };

      const searchQuery = query<TenantDocument>()
        .match('content', 'important')
        .size(20)
        .build();

      const result = msearch<TenantDocument>()
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

  describe('Real-World Bulk Operations Examples', () => {
    it('should build product catalog import', () => {
      type CatalogProduct = {
        sku: string;
        name: string;
        price: number;
        category: string;
        stock: number;
      };

      const products: CatalogProduct[] = [
        {
          sku: 'LAP-001',
          name: 'Gaming Laptop',
          price: 1299,
          category: 'electronics',
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

      let bulkBuilder = bulk<CatalogProduct>();
      for (const product of products) {
        bulkBuilder = bulkBuilder.index(product, {
          _index: 'products',
          _id: product.sku
        });
      }

      const ndjson = bulkBuilder.build();

      expect(ndjson).toMatchInlineSnapshot(`
        "{"index":{"_index":"products","_id":"LAP-001"}}
        {"sku":"LAP-001","name":"Gaming Laptop","price":1299,"category":"electronics","stock":15}
        {"index":{"_index":"products","_id":"MOU-002"}}
        {"sku":"MOU-002","name":"Wireless Mouse","price":29,"category":"accessories","stock":50}
        {"index":{"_index":"products","_id":"KEY-003"}}
        {"sku":"KEY-003","name":"Mechanical Keyboard","price":149,"category":"accessories","stock":30}
        "
      `);
    });

    it('should build price update batch with script', () => {
      type PricedProduct = {
        id: string;
        price: number;
      };

      // Apply 10% discount to specific products
      const productIds = ['prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5'];

      let bulkBuilder = bulk<PricedProduct>();
      for (const id of productIds) {
        bulkBuilder = bulkBuilder.update({
          _index: 'products',
          _id: id,
          script: {
            source: 'ctx._source.price *= params.discount',
            params: { discount: 0.9 }
          }
        });
      }

      const ndjson = bulkBuilder.build();

      expect(ndjson).toMatchInlineSnapshot(`
        "{"update":{"_index":"products","_id":"prod-1"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        {"update":{"_index":"products","_id":"prod-2"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        {"update":{"_index":"products","_id":"prod-3"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        {"update":{"_index":"products","_id":"prod-4"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        {"update":{"_index":"products","_id":"prod-5"}}
        {"script":{"source":"ctx._source.price *= params.discount","params":{"discount":0.9}}}
        "
      `);
    });

    it('should build mixed CRUD operations', () => {
      type InventoryItem = {
        id: string;
        name: string;
        quantity: number;
      };

      const bulkOp = bulk<InventoryItem>()
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
      type SyncedDocument = {
        id: string;
        data: string;
        updated_at: string;
      };

      const updates = [
        { id: 'doc-1', data: 'Updated content', updated_at: '2024-01-15' },
        { id: 'doc-2', data: 'New content', updated_at: '2024-01-15' }
      ];

      let bulkBuilder = bulk<SyncedDocument>();
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

  describe('Real-World Index Management Examples', () => {
    it('should build e-commerce product index', () => {
      type EcommerceProduct = {
        sku: string;
        name: string;
        description: string;
        price: number;
        category: string;
        brand: string;
        tags: string[];
        rating: number;
        reviewCount: number;
        inStock: boolean;
        createdAt: string;
      };

      const indexConfig = indexBuilder<EcommerceProduct>()
        .mappings({
          properties: {
            sku: { type: 'keyword' },
            name: {
              type: 'text',
              analyzer: 'standard',
              fields: { keyword: { type: 'keyword' } }
            },
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

      expect(indexConfig).toMatchInlineSnapshot(`
        {
          "aliases": {
            "products": {},
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
                "type": "boolean",
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
      type VectorDocument = {
        title: string;
        content: string;
        embedding: number[];
        category: string;
      };

      const indexConfig = indexBuilder<VectorDocument>()
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
            },
            category: { type: 'keyword' }
          }
        })
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
      type LogEntry = {
        timestamp: string;
        level: string;
        message: string;
        service: string;
        trace_id: string;
      };

      const indexConfig = indexBuilder<LogEntry>()
        .mappings({
          properties: {
            timestamp: { type: 'date' },
            level: { type: 'keyword' },
            message: { type: 'text', analyzer: 'standard' },
            service: { type: 'keyword' },
            trace_id: { type: 'keyword' }
          }
        })
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
      type Article = {
        title: string;
        author: string;
        content: string;
        publishedAt: string;
      };

      const indexConfig = indexBuilder<Article>()
        .mappings({
          properties: {
            title: {
              type: 'text',
              analyzer: 'english',
              fields: {
                exact: { type: 'keyword' },
                raw: { type: 'text', analyzer: 'standard' }
              }
            },
            author: { type: 'keyword' },
            content: {
              type: 'text',
              analyzer: 'english'
            },
            publishedAt: { type: 'date' }
          }
        })
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
  });
});
