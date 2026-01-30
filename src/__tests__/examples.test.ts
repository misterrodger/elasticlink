import { query } from '..';

/**
 * Real-world usage examples demonstrating elastiq's capabilities.
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
});
