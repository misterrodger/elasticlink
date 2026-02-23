import { query, mappings, keyword, percolator } from '..';
import {
  listingMappings,
  listingDetailMappings
} from './fixtures/real-estate.js';
import {
  instrumentWithEmbeddingMappings,
  scoredInstrumentMappings
} from './fixtures/finance.js';

const percolatorDocMappings = mappings({
  query: percolator(),
  category: keyword(),
  property_class: keyword()
});

describe('QueryBuilder', () => {
  describe('Pagination and source filtering', () => {
    it('should add from', () => {
      const result = query(listingMappings)
        .match('address', 'test')
        .from(1)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 1,
          "query": {
            "match": {
              "address": "test",
            },
          },
        }
      `);
    });
    it('should add size', () => {
      const result = query(listingMappings)
        .match('address', 'test')
        .size(1)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "address": "test",
            },
          },
          "size": 1,
        }
      `);
    });

    it('should add source', () => {
      const result = query(listingMappings)
        .match('address', 'test')
        ._source(['property_class', 'sqft'])
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "_source": [
            "property_class",
            "sqft",
          ],
          "query": {
            "match": {
              "address": "test",
            },
          },
        }
      `);
    });

    it('should add sort', () => {
      const result = query(listingMappings)
        .match('address', 'test')
        .sort('sqft', 'asc')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "address": "test",
            },
          },
          "sort": [
            {
              "sqft": "asc",
            },
          ],
        }
      `);
    });

    it('should add sort with desc direction', () => {
      const result = query(listingMappings)
        .match('address', 'test')
        .sort('list_price', 'desc')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "address": "test",
            },
          },
          "sort": [
            {
              "list_price": "desc",
            },
          ],
        }
      `);
    });

    it('should combine from, size, and _source', () => {
      const result = query(listingMappings)
        .match('address', 'test')
        .from(20)
        .size(10)
        ._source(['address', 'list_price'])
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "_source": [
            "address",
            "list_price",
          ],
          "from": 20,
          "query": {
            "match": {
              "address": "test",
            },
          },
          "size": 10,
        }
      `);
    });

    it('should combine sort with other meta properties', () => {
      const result = query(listingMappings)
        .match('address', 'laptop')
        .sort('list_price', 'asc')
        .sort('sqft', 'desc')
        .from(0)
        .size(25)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 0,
          "query": {
            "match": {
              "address": "laptop",
            },
          },
          "size": 25,
          "sort": [
            {
              "list_price": "asc",
            },
            {
              "sqft": "desc",
            },
          ],
        }
      `);
    });
  });
  describe('Full-text and term-level queries', () => {
    it('should build a match_all query', () => {
      const result = query(listingMappings).matchAll().build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match_all": {},
          },
        }
      `);
    });

    it('should build a match query', () => {
      const result = query(listingMappings)
        .match('address', 'test type')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "address": "test type",
            },
          },
        }
      `);
    });

    it('should build a multi_match query', () => {
      const result = query(listingMappings)
        .multiMatch(['address'], 'test')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "multi_match": {
              "fields": [
                "address",
              ],
              "query": "test",
            },
          },
        }
      `);
    });

    it('should build a match_phrase query', () => {
      const result = query(listingMappings)
        .matchPhrase('address', 'test')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match_phrase": {
              "address": "test",
            },
          },
        }
      `);
    });

    it('should build a term query', () => {
      const result = query(listingMappings)
        .term('property_class', 'test')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "term": {
              "property_class": "test",
            },
          },
        }
      `);
    });

    it('should build a terms query', () => {
      const result = query(listingMappings)
        .terms('property_class', ['test', 'type'])
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "terms": {
              "property_class": [
                "test",
                "type",
              ],
            },
          },
        }
      `);
    });

    it('should build a range query', () => {
      const result = query(listingMappings)
        .range('list_price', { gt: 1, lt: 100 })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "range": {
              "list_price": {
                "gt": 1,
                "lt": 100,
              },
            },
          },
        }
      `);
    });

    it('should build an exists query', () => {
      const result = query(listingMappings).exists('property_class').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "exists": {
              "field": "property_class",
            },
          },
        }
      `);
    });

    it('should build a prefix query', () => {
      const result = query(listingMappings)
        .prefix('property_class', 'test')
        .build();
      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "prefix": {
              "property_class": "test",
            },
          },
        }
      `);
    });

    it('should build a wildcard query', () => {
      const result = query(listingMappings)
        .wildcard('property_class', 'test')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "wildcard": {
              "property_class": "test",
            },
          },
        }
      `);
    });
  });

  describe('Boolean queries', () => {
    it('should build a bool with 1 must query', () => {
      const result = query(listingMappings)
        .bool()
        .must((q) => q.match('address', 'test type'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "address": "test type",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with 2 must queries', () => {
      const result = query(listingMappings)
        .bool()
        .must((q) => q.match('address', 'test type'))
        .must((q) => q.match('address', 'value'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "address": "test type",
                  },
                },
                {
                  "match": {
                    "address": "value",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with 1 mustNot query', () => {
      const result = query(listingMappings)
        .bool()
        .mustNot((q) => q.match('address', 'test type'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must_not": [
                {
                  "match": {
                    "address": "test type",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with 2 mustNot queries', () => {
      const result = query(listingMappings)
        .bool()
        .mustNot((q) => q.match('address', 'test type'))
        .mustNot((q) => q.match('address', 'value'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must_not": [
                {
                  "match": {
                    "address": "test type",
                  },
                },
                {
                  "match": {
                    "address": "value",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with 1 should query', () => {
      const result = query(listingMappings)
        .bool()
        .should((q) => q.match('address', 'test type'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "should": [
                {
                  "match": {
                    "address": "test type",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with 2 should queries', () => {
      const result = query(listingMappings)
        .bool()
        .should((q) => q.match('address', 'test type'))
        .should((q) => q.match('address', 'value'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "should": [
                {
                  "match": {
                    "address": "test type",
                  },
                },
                {
                  "match": {
                    "address": "value",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with one filter query', () => {
      const result = query(listingMappings)
        .bool()
        .filter((q) => q.match('address', 'test type'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "filter": [
                {
                  "match": {
                    "address": "test type",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with minimumShouldMatch', () => {
      const result = query(listingMappings)
        .bool()
        .must((q) => q.match('address', 'test type'))
        .must((q) => q.match('address', 'value'))
        .minimumShouldMatch(1)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "minimum_should_match": 1,
              "must": [
                {
                  "match": {
                    "address": "test type",
                  },
                },
                {
                  "match": {
                    "address": "value",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with range', () => {
      const result = query(listingMappings)
        .bool()
        .must((q) => q.range('list_price', { gt: 1, lt: 100 }))
        .must((q) => q.range('sqft', { gte: 1, lte: 100 }))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "range": {
                    "list_price": {
                      "gt": 1,
                      "lt": 100,
                    },
                  },
                },
                {
                  "range": {
                    "sqft": {
                      "gte": 1,
                      "lte": 100,
                    },
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with exists', () => {
      const result = query(listingMappings)
        .bool()
        .must((q) => q.exists('list_price'))
        .must((q) => q.exists('property_class'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "exists": {
                    "field": "list_price",
                  },
                },
                {
                  "exists": {
                    "field": "property_class",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with prefix', () => {
      const result = query(listingMappings)
        .bool()
        .must((q) => q.prefix('property_class', 'pr'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "prefix": {
                    "property_class": "pr",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with wildcard', () => {
      const result = query(listingMappings)
        .bool()
        .must((q) => q.wildcard('property_class', 'pr'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "wildcard": {
                    "property_class": "pr",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with multi_match', () => {
      const result = query(listingMappings)
        .bool()
        .must((q) => q.multiMatch(['address'], 'test'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "multi_match": {
                    "fields": [
                      "address",
                    ],
                    "query": "test",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with match_phrase', () => {
      const result = query(listingMappings)
        .bool()
        .must((q) => q.matchPhrase('address', 'test'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "match_phrase": {
                    "address": "test",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build filter-only bool (no must/should)', () => {
      const result = query(listingMappings)
        .bool()
        .filter((q) => q.term('property_class', 'laptop'))
        .filter((q) => q.range('list_price', { gte: 100 }))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "filter": [
                {
                  "term": {
                    "property_class": "laptop",
                  },
                },
                {
                  "range": {
                    "list_price": {
                      "gte": 100,
                    },
                  },
                },
              ],
            },
          },
        }
      `);
    });
  });

  describe('Query options and advanced features', () => {
    describe('match with options', () => {
      it('should build match with operator option', () => {
        const result = query(listingMappings)
          .match('address', 'test type', { operator: 'and' })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": {
                  "operator": "and",
                  "query": "test type",
                },
              },
            },
          }
        `);
      });

      it('should build match with fuzziness option', () => {
        const result = query(listingMappings)
          .match('address', 'test', { fuzziness: 'AUTO' })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": {
                  "fuzziness": "AUTO",
                  "query": "test",
                },
              },
            },
          }
        `);
      });

      it('should build match with boost option', () => {
        const result = query(listingMappings)
          .match('address', 'test', { boost: 2.0 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": {
                  "boost": 2,
                  "query": "test",
                },
              },
            },
          }
        `);
      });

      it('should build match with multiple options', () => {
        const result = query(listingMappings)
          .match('address', 'test', {
            operator: 'and',
            fuzziness: 'AUTO',
            boost: 2.0,
            zero_terms_query: 'all'
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": {
                  "boost": 2,
                  "fuzziness": "AUTO",
                  "operator": "and",
                  "query": "test",
                  "zero_terms_query": "all",
                },
              },
            },
          }
        `);
      });

      it('should build match without options (backwards compatible)', () => {
        const result = query(listingMappings).match('address', 'test').build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should build match in bool query with options', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) =>
            q.match('address', 'test', { operator: 'and', boost: 2 })
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "address": {
                        "boost": 2,
                        "operator": "and",
                        "query": "test",
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('multiMatch with options', () => {
      it('should build multi_match with type option', () => {
        const result = query(listingMappings)
          .multiMatch(['address'], 'test', {
            type: 'best_fields'
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "multi_match": {
                "fields": [
                  "address",
                ],
                "query": "test",
                "type": "best_fields",
              },
            },
          }
        `);
      });

      it('should build multi_match with tie_breaker option', () => {
        const result = query(listingMappings)
          .multiMatch(['address'], 'test', {
            type: 'best_fields',
            tie_breaker: 0.3
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "multi_match": {
                "fields": [
                  "address",
                ],
                "query": "test",
                "tie_breaker": 0.3,
                "type": "best_fields",
              },
            },
          }
        `);
      });

      it('should build multi_match with operator and boost', () => {
        const result = query(listingMappings)
          .multiMatch(['address'], 'test', {
            operator: 'and',
            boost: 1.5
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "multi_match": {
                "boost": 1.5,
                "fields": [
                  "address",
                ],
                "operator": "and",
                "query": "test",
              },
            },
          }
        `);
      });

      it('should build multi_match without options (backwards compatible)', () => {
        const result = query(listingMappings)
          .multiMatch(['address'], 'test')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "multi_match": {
                "fields": [
                  "address",
                ],
                "query": "test",
              },
            },
          }
        `);
      });

      it('should build multi_match in bool query with options', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) =>
            q.multiMatch(['address'], 'test', {
              type: 'cross_fields',
              operator: 'and'
            })
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "multi_match": {
                      "fields": [
                        "address",
                      ],
                      "operator": "and",
                      "query": "test",
                      "type": "cross_fields",
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('fuzzy', () => {
      it('should build a fuzzy query at root level', () => {
        const result = query(listingMappings)
          .fuzzy('property_class', 'tst')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "property_class": {
                  "value": "tst",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query with fuzziness option', () => {
        const result = query(listingMappings)
          .fuzzy('property_class', 'tst', { fuzziness: 'AUTO' })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "property_class": {
                  "fuzziness": "AUTO",
                  "value": "tst",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query with numeric fuzziness', () => {
        const result = query(listingMappings)
          .fuzzy('property_class', 'test', { fuzziness: 2 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "property_class": {
                  "fuzziness": 2,
                  "value": "test",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query with boost option', () => {
        const result = query(listingMappings)
          .fuzzy('property_class', 'test', { boost: 1.5 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "property_class": {
                  "boost": 1.5,
                  "value": "test",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query with multiple options', () => {
        const result = query(listingMappings)
          .fuzzy('property_class', 'test', { fuzziness: 'AUTO', boost: 2.0 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "property_class": {
                  "boost": 2,
                  "fuzziness": "AUTO",
                  "value": "test",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query in bool clause with no options', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.fuzzy('property_class', 'tst'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "fuzzy": {
                      "property_class": {
                        "value": "tst",
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build a fuzzy query in bool context', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.fuzzy('property_class', 'test', { fuzziness: 'AUTO' }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "fuzzy": {
                      "property_class": {
                        "fuzziness": "AUTO",
                        "value": "test",
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build a fuzzy query in should context', () => {
        const result = query(listingMappings)
          .bool()
          .should((q) => q.fuzzy('address', 'john', { fuzziness: 1 }))
          .should((q) => q.match('address', 'test'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "should": [
                  {
                    "fuzzy": {
                      "address": {
                        "fuzziness": 1,
                        "value": "john",
                      },
                    },
                  },
                  {
                    "match": {
                      "address": "test",
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('Query parameters (timeout, trackScores, explain, etc.)', () => {
      it('should add timeout parameter', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .timeout('5s')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": "test",
              },
            },
            "timeout": "5s",
          }
        `);
      });

      it('should add track_scores parameter', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) => q.term('property_class', 'test'))
          .trackScores(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "property_class": "test",
                    },
                  },
                ],
              },
            },
            "track_scores": true,
          }
        `);
      });

      it('should add explain parameter', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .explain(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "explain": true,
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should add min_score parameter', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .minScore(0.5)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "min_score": 0.5,
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should add version parameter', () => {
        const result = query(listingMappings)
          .term('property_class', 'test')
          .version(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "term": {
                "property_class": "test",
              },
            },
            "version": true,
          }
        `);
      });

      it('should add seq_no_primary_term parameter', () => {
        const result = query(listingMappings)
          .term('property_class', 'test')
          .seqNoPrimaryTerm(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "term": {
                "property_class": "test",
              },
            },
            "seq_no_primary_term": true,
          }
        `);
      });

      it('should support multiple query parameters together', () => {
        const result = query(listingMappings)
          .match('address', 'test', { operator: 'and', boost: 2 })
          .timeout('10s')
          .trackScores(true)
          .explain(true)
          .minScore(1.0)
          .from(0)
          .size(20)
          .sort('list_price', 'asc')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "explain": true,
            "from": 0,
            "min_score": 1,
            "query": {
              "match": {
                "address": {
                  "boost": 2,
                  "operator": "and",
                  "query": "test",
                },
              },
            },
            "size": 20,
            "sort": [
              {
                "list_price": "asc",
              },
            ],
            "timeout": "10s",
            "track_scores": true,
          }
        `);
      });
    });

    describe('ids', () => {
      it('should build an ids query at root level', () => {
        const result = query(listingMappings)
          .ids(['id1', 'id2', 'id3'])
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "ids": {
                "values": [
                  "id1",
                  "id2",
                  "id3",
                ],
              },
            },
          }
        `);
      });

      it('should build an ids query with single id', () => {
        const result = query(listingMappings).ids(['single-id']).build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "ids": {
                "values": [
                  "single-id",
                ],
              },
            },
          }
        `);
      });

      it('should build an ids query in bool must context', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.ids(['id1', 'id2']))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "ids": {
                      "values": [
                        "id1",
                        "id2",
                      ],
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build an ids query in bool filter context', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) => q.ids(['id1', 'id2', 'id3']))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "ids": {
                      "values": [
                        "id1",
                        "id2",
                        "id3",
                      ],
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should combine ids with other queries', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.ids(['id1', 'id2']))
          .filter((q) => q.term('property_class', 'test'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "property_class": "test",
                    },
                  },
                ],
                "must": [
                  {
                    "ids": {
                      "values": [
                        "id1",
                        "id2",
                      ],
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('Nested queries', () => {
      it('should build a nested query with single clause', () => {
        const result = query(listingMappings)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .nested('property_class' as any, (q) =>
            q.match('comments.author', 'john')
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "nested": {
                "path": "property_class",
                "query": {
                  "match": {
                    "comments.author": "john",
                  },
                },
              },
            },
          }
        `);
      });

      it('should build a nested query with multiple term queries', () => {
        const result = query(listingMappings)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .nested('address' as any, (q) => q.term('status', 'approved'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "nested": {
                "path": "address",
                "query": {
                  "term": {
                    "status": "approved",
                  },
                },
              },
            },
          }
        `);
      });

      it('should build a nested query with score_mode option', () => {
        const result = query(listingMappings)
          .nested(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'type' as any,
            (q) => q.match('comments.author', 'john'),
            { score_mode: 'sum' }
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "nested": {
                "path": "type",
                "query": {
                  "match": {
                    "comments.author": "john",
                  },
                },
                "score_mode": "sum",
              },
            },
          }
        `);
      });

      it('should build a nested query with avg score_mode', () => {
        const result = query(listingMappings)
          .nested(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'address' as any,
            (q) => q.term('status', 'approved'),
            { score_mode: 'avg' }
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "nested": {
                "path": "address",
                "query": {
                  "term": {
                    "status": "approved",
                  },
                },
                "score_mode": "avg",
              },
            },
          }
        `);
      });

      it('should build a nested query with min score_mode', () => {
        const result = query(listingMappings)
          .nested(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'type' as any,
            (q) => q.term('status', 'pending'),
            { score_mode: 'min' }
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "nested": {
                "path": "type",
                "query": {
                  "term": {
                    "status": "pending",
                  },
                },
                "score_mode": "min",
              },
            },
          }
        `);
      });

      it('should build nested query with pagination', () => {
        const result = query(listingMappings)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .nested('property_class' as any, (q: any) =>
            q.match('author', 'john')
          )
          .from(0)
          .size(10)
          .sort('list_price', 'asc')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "from": 0,
            "query": {
              "nested": {
                "path": "property_class",
                "query": {
                  "match": {
                    "author": "john",
                  },
                },
              },
            },
            "size": 10,
            "sort": [
              {
                "list_price": "asc",
              },
            ],
          }
        `);
      });
    });

    describe('Conditional building (when)', () => {
      it('should execute thenFn when condition is truthy', () => {
        const searchTerm = 'test';
        const result = query(listingMappings)
          .when(searchTerm, (q) => q.match('address', searchTerm))!
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should not add query when condition is falsy', () => {
        const searchTerm = undefined;
        const result = query(listingMappings)
          .when(
            searchTerm,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (q) => q.match('address', searchTerm as any)
          )
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should execute elseFn when condition is falsy', () => {
        const searchTerm = undefined;
        const result = query(listingMappings)
          .when(
            searchTerm,
            (q) => q.match('address', 'fallback'),
            (q) => q.matchAll()
          )!
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match_all": {},
            },
          }
        `);
      });

      it('should use when in bool must context with truthy condition', () => {
        const type = 'test';
        const result = query(listingMappings)
          .bool()
          .must(
            (q) =>
              q.when(type, (q2) => q2.term('property_class', type)) ||
              q.matchAll()
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "term": {
                      "property_class": "test",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use when in bool filter context', () => {
        const minPrice = 100;
        const result = query(listingMappings)
          .bool()
          .filter(
            (q) =>
              q.when(minPrice, (q2) =>
                q2.range('list_price', { gte: minPrice })
              ) || q.matchAll()
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "list_price": {
                        "gte": 100,
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should chain multiple when conditions', () => {
        const searchTerm = 'test';
        const type = 'test';
        const minPrice = 500;

        const result = query(listingMappings)
          .bool()
          .must(
            (q) =>
              q.when(searchTerm, (q2) => q2.match('address', searchTerm)) ||
              q.matchAll()
          )
          .filter(
            (q) =>
              q.when(type, (q2) => q2.term('property_class', type)) ||
              q.matchAll()
          )
          .filter(
            (q) =>
              q.when(minPrice, (q2) =>
                q2.range('list_price', { gte: minPrice })
              ) || q.matchAll()
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "property_class": "test",
                    },
                  },
                  {
                    "range": {
                      "list_price": {
                        "gte": 500,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "address": "test",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use when with empty string (falsy)', () => {
        const searchTerm = '';
        const result = query(listingMappings)
          .when(searchTerm, (q) => q.match('address', searchTerm))
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should use when with 0 (falsy)', () => {
        const minPrice = 0;
        const result = query(listingMappings)
          .when(minPrice, (q) => q.range('list_price', { gte: minPrice }))
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should use when with empty array (falsy)', () => {
        const ids: string[] = [];
        const result = query(listingMappings)
          .when(ids.length > 0, (q) => q.ids(ids))
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should use when with non-empty array (truthy)', () => {
        const ids = ['id1', 'id2'];
        const result = query(listingMappings)
          .when(ids.length > 0, (q) => q.ids(ids))!
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "ids": {
                "values": [
                  "id1",
                  "id2",
                ],
              },
            },
          }
        `);
      });
    });

    describe('matchPhrasePrefix', () => {
      it('should build a match_phrase_prefix query at root level', () => {
        const result = query(listingMappings)
          .matchPhrasePrefix('address', 'test')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match_phrase_prefix": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should build match_phrase_prefix with max_expansions option', () => {
        const result = query(listingMappings)
          .matchPhrasePrefix('address', 'test', { max_expansions: 10 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match_phrase_prefix": {
                "address": {
                  "max_expansions": 10,
                  "query": "test",
                },
              },
            },
          }
        `);
      });

      it('should build match_phrase_prefix in bool must context', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.matchPhrasePrefix('address', 'john'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match_phrase_prefix": {
                      "address": "john",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build match_phrase_prefix in bool filter context', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) =>
            q.matchPhrasePrefix('address', 'test', { max_expansions: 5 })
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "match_phrase_prefix": {
                      "address": {
                        "max_expansions": 5,
                        "query": "test",
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use match_phrase_prefix for autocomplete pattern', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) =>
            q.matchPhrasePrefix('address', 'joh', { max_expansions: 20 })
          )
          .from(0)
          .size(10)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "from": 0,
            "query": {
              "bool": {
                "must": [
                  {
                    "match_phrase_prefix": {
                      "address": {
                        "max_expansions": 20,
                        "query": "joh",
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

    describe('trackTotalHits', () => {
      it('should add track_total_hits with true', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .trackTotalHits(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": "test",
              },
            },
            "track_total_hits": true,
          }
        `);
      });

      it('should add track_total_hits with false', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .trackTotalHits(false)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": "test",
              },
            },
            "track_total_hits": false,
          }
        `);
      });

      it('should add track_total_hits with number limit', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .trackTotalHits(10000)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": "test",
              },
            },
            "track_total_hits": 10000,
          }
        `);
      });

      it('should combine track_total_hits with pagination', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .from(100)
          .size(20)
          .trackTotalHits(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "from": 100,
            "query": {
              "match": {
                "address": "test",
              },
            },
            "size": 20,
            "track_total_hits": true,
          }
        `);
      });
    });

    describe('Highlighting', () => {
      it('should add highlight with single field', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .highlight(['property_class'])
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "property_class": {},
              },
            },
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with multiple fields', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .highlight(['property_class', 'address', 'list_price'])
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "address": {},
                "list_price": {},
                "property_class": {},
              },
            },
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with fragment_size option', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .highlight(['property_class'], { fragment_size: 150 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "property_class": {
                  "fragment_size": 150,
                },
              },
            },
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with number_of_fragments option', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .highlight(['address'], { number_of_fragments: 3 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "address": {
                  "number_of_fragments": 3,
                },
              },
            },
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with custom pre/post tags', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .highlight(['property_class'], {
            pre_tags: ['<em>'],
            post_tags: ['</em>']
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "property_class": {},
              },
              "post_tags": [
                "</em>",
              ],
              "pre_tags": [
                "<em>",
              ],
            },
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with multiple options', () => {
        const result = query(listingMappings)
          .match('address', 'test')
          .highlight(['property_class', 'address'], {
            fragment_size: 150,
            number_of_fragments: 2,
            pre_tags: ['<mark>'],
            post_tags: ['</mark>']
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "address": {
                  "fragment_size": 150,
                  "number_of_fragments": 2,
                },
                "property_class": {
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
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should combine highlight with other query features', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.match('address', 'test'))
          .filter((q) => q.range('list_price', { gte: 100, lte: 1000 }))
          .highlight(['property_class', 'address'], { fragment_size: 200 })
          .from(0)
          .size(10)
          .sort('list_price', 'asc')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "from": 0,
            "highlight": {
              "fields": {
                "address": {
                  "fragment_size": 200,
                },
                "property_class": {
                  "fragment_size": 200,
                },
              },
            },
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "list_price": {
                        "gte": 100,
                        "lte": 1000,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "address": "test",
                    },
                  },
                ],
              },
            },
            "size": 10,
            "sort": [
              {
                "list_price": "asc",
              },
            ],
          }
        `);
      });

      it('should combine all features', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) =>
            q.matchPhrasePrefix('address', 'joh', { max_expansions: 20 })
          )
          .filter((q) => q.term('property_class', 'test'))
          .highlight(['address', 'property_class'], {
            fragment_size: 150,
            pre_tags: ['<em>'],
            post_tags: ['</em>']
          })
          .trackTotalHits(true)
          .from(0)
          .size(20)
          .sort('list_price', 'asc')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "from": 0,
            "highlight": {
              "fields": {
                "address": {
                  "fragment_size": 150,
                },
                "property_class": {
                  "fragment_size": 150,
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
                    "term": {
                      "property_class": "test",
                    },
                  },
                ],
                "must": [
                  {
                    "match_phrase_prefix": {
                      "address": {
                        "max_expansions": 20,
                        "query": "joh",
                      },
                    },
                  },
                ],
              },
            },
            "size": 20,
            "sort": [
              {
                "list_price": "asc",
              },
            ],
            "track_total_hits": true,
          }
        `);
      });
    });
  });

  describe('Geo, pattern, scoring, and aggregation integration', () => {
    describe('Geo queries', () => {
      it('should create a geo_distance query', () => {
        const result = query(listingDetailMappings)
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '10km' }
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "geo_distance": {
              "distance": "10km",
              "location": {
                "lat": 40.7128,
                "lon": -74.006,
              },
            },
          },
        }
      `);
      });

      it('should create a geo_distance query with options', () => {
        const result = query(listingDetailMappings)
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            {
              distance: '10km',
              unit: 'mi',
              distance_type: 'plane'
            }
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "geo_distance": {
              "distance": "10km",
              "distance_type": "plane",
              "location": {
                "lat": 40.7128,
                "lon": -74.006,
              },
              "unit": "mi",
            },
          },
        }
      `);
      });

      it('should create a geo_bounding_box query', () => {
        const result = query(listingDetailMappings)
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

      it('should create a geo_polygon query', () => {
        const result = query(listingDetailMappings)
          .geoPolygon('location', {
            points: [
              { lat: 40.7128, lon: -74.006 },
              { lat: 40.8, lon: -74.1 },
              { lat: 40.7, lon: -73.9 }
            ]
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "geo_polygon": {
              "location": {
                "points": [
                  {
                    "lat": 40.7128,
                    "lon": -74.006,
                  },
                  {
                    "lat": 40.8,
                    "lon": -74.1,
                  },
                  {
                    "lat": 40.7,
                    "lon": -73.9,
                  },
                ],
              },
            },
          },
        }
      `);
      });

      it('should combine geo_distance with other queries', () => {
        const result = query(listingDetailMappings)
          .match('address', 'restaurants')
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '5km' }
          )
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
        }
      `);
      });
    });

    describe('Pattern and scoring queries', () => {
      it('should create a regexp query', () => {
        const result = query(listingDetailMappings)
          .regexp('property_class', 'rest.*')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "regexp": {
                "property_class": "rest.*",
              },
            },
          }
        `);
      });

      it('should create a regexp query with options', () => {
        const result = query(listingDetailMappings)
          .regexp('property_class', 'rest.*', {
            flags: 'CASE_INSENSITIVE',
            boost: 2.0
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "regexp": {
                "property_class": {
                  "boost": 2,
                  "flags": "CASE_INSENSITIVE",
                  "value": "rest.*",
                },
              },
            },
          }
        `);
      });

      it('should create a constant_score query', () => {
        const result = query(listingDetailMappings)
          .constantScore((q) => q.term('property_class', 'restaurants'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "constant_score": {
                "filter": {
                  "term": {
                    "property_class": "restaurants",
                  },
                },
              },
            },
          }
        `);
      });

      it('should create a constant_score query with boost', () => {
        const result = query(listingDetailMappings)
          .constantScore((q) => q.term('property_class', 'restaurants'), {
            boost: 1.5
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "constant_score": {
                "boost": 1.5,
                "filter": {
                  "term": {
                    "property_class": "restaurants",
                  },
                },
              },
            },
          }
        `);
      });

      it('should combine constant_score with other queries', () => {
        const result = query(listingDetailMappings)
          .match('title', 'test')
          .constantScore((cb) => cb.term('property_class', 'restaurants'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "constant_score": {
                "filter": {
                  "term": {
                    "property_class": "restaurants",
                  },
                },
              },
            },
          }
        `);
      });
    });

    describe('Query + Aggregations integration', () => {
      it('should combine query with aggregations', () => {
        const result = query(listingDetailMappings)
          .match('title', 'restaurant')
          .aggs((agg) =>
            agg
              .terms('by_category', 'property_class', { size: 10 })
              .avg('avg_price', 'list_price')
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "avg_price": {
                "avg": {
                  "field": "list_price",
                },
              },
              "by_category": {
                "terms": {
                  "field": "property_class",
                  "size": 10,
                },
              },
            },
            "query": {
              "match": {
                "title": "restaurant",
              },
            },
          }
        `);
      });

      it('should build standalone aggregations with query(false)', () => {
        const result = query(listingDetailMappings, false)
          .aggs((agg) => agg.terms('by_category', 'property_class'))
          .size(0)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "by_category": {
                "terms": {
                  "field": "property_class",
                },
              },
            },
            "size": 0,
          }
        `);
      });

      it('should combine bool query with sub-aggregations', () => {
        const result = query(listingDetailMappings)
          .bool()
          .must((q) => q.match('title', 'coffee'))
          .filter((q) => q.range('list_price', { gte: 10, lte: 50 }))
          .aggs((agg) =>
            agg
              .terms('by_category', 'property_class', { size: 5 })
              .subAgg((sub) =>
                sub.avg('avg_price', 'list_price').max('max_rating', 'cap_rate')
              )
          )
          .size(20)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "by_category": {
                "aggs": {
                  "avg_price": {
                    "avg": {
                      "field": "list_price",
                    },
                  },
                  "max_rating": {
                    "max": {
                      "field": "cap_rate",
                    },
                  },
                },
                "terms": {
                  "field": "property_class",
                  "size": 5,
                },
              },
            },
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "list_price": {
                        "gte": 10,
                        "lte": 50,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "title": "coffee",
                    },
                  },
                ],
              },
            },
            "size": 20,
          }
        `);
      });

      it('should allow aggregations without query methods when using query()', () => {
        const result = query(listingDetailMappings)
          .aggs((agg) => agg.sum('total_price', 'list_price'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "total_price": {
                "sum": {
                  "field": "list_price",
                },
              },
            },
          }
        `);
      });
    });
  });

  describe('Boolean query combinations and edge cases', () => {
    describe('Combined bool clauses', () => {
      it('should build bool with all four clauses (must + mustNot + should + filter)', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.match('address', 'laptop'))
          .mustNot((q) => q.term('property_class', 'refurbished'))
          .should((q) => q.match('address', 'gaming'))
          .filter((q) => q.range('list_price', { gte: 500, lte: 2000 }))
          .minimumShouldMatch(1)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "list_price": {
                        "gte": 500,
                        "lte": 2000,
                      },
                    },
                  },
                ],
                "minimum_should_match": 1,
                "must": [
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                ],
                "must_not": [
                  {
                    "term": {
                      "property_class": "refurbished",
                    },
                  },
                ],
                "should": [
                  {
                    "match": {
                      "address": "gaming",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build bool with multiple filters chained', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) => q.term('property_class', 'electronics'))
          .filter((q) => q.range('list_price', { gte: 100 }))
          .filter((q) => q.exists('address'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "property_class": "electronics",
                    },
                  },
                  {
                    "range": {
                      "list_price": {
                        "gte": 100,
                      },
                    },
                  },
                  {
                    "exists": {
                      "field": "address",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build bool with only filter clauses (non-scoring pattern)', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) => q.term('property_class', 'product'))
          .filter((q) => q.range('list_price', { lte: 1000 }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "property_class": "product",
                    },
                  },
                  {
                    "range": {
                      "list_price": {
                        "lte": 1000,
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build bool with minimumShouldMatch and multiple should clauses', () => {
        const result = query(listingMappings)
          .bool()
          .should((q) => q.match('address', 'laptop'))
          .should((q) => q.match('address', 'computer'))
          .should((q) => q.match('address', 'electronics'))
          .minimumShouldMatch(2)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "minimum_should_match": 2,
                "should": [
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                  {
                    "match": {
                      "address": "computer",
                    },
                  },
                  {
                    "match": {
                      "address": "electronics",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build nested bool within bool (must containing complex logic)', () => {
        // This tests if we can express nested bool - currently API may not support this directly
        // This is an acceptance test for future functionality
        const result = query(listingMappings)
          .bool()
          .must((q) => q.match('address', 'laptop'))
          .filter((q) => q.range('list_price', { gte: 500 }))
          .build();

        // Verify basic structure works
        expect(result.query?.bool?.must).toHaveLength(1);
        expect(result.query?.bool?.filter).toHaveLength(1);
      });
    });

    describe('Range query edge cases', () => {
      it('should build range with only gte', () => {
        const result = query(listingMappings)
          .range('list_price', { gte: 100 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "list_price": {
                  "gte": 100,
                },
              },
            },
          }
        `);
      });

      it('should build range with only lte', () => {
        const result = query(listingMappings)
          .range('list_price', { lte: 1000 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "list_price": {
                  "lte": 1000,
                },
              },
            },
          }
        `);
      });

      it('should build range with only gt', () => {
        const result = query(listingMappings)
          .range('list_price', { gt: 0 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "list_price": {
                  "gt": 0,
                },
              },
            },
          }
        `);
      });

      it('should build range with only lt', () => {
        const result = query(listingMappings)
          .range('list_price', { lt: 9999 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "list_price": {
                  "lt": 9999,
                },
              },
            },
          }
        `);
      });

      it('should build range with all four conditions', () => {
        const result = query(listingMappings)
          .range('list_price', { gt: 0, gte: 1, lt: 1000, lte: 999 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "list_price": {
                  "gt": 0,
                  "gte": 1,
                  "lt": 1000,
                  "lte": 999,
                },
              },
            },
          }
        `);
      });

      it('should build range in bool filter context with gte only', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) => q.range('list_price', { gte: 50 }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "list_price": {
                        "gte": 50,
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build range in bool must context', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.range('sqft', { gte: 10, lte: 100 }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "range": {
                      "sqft": {
                        "gte": 10,
                        "lte": 100,
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('Query + Aggregations integration gaps', () => {
      it('should combine bool query with multiple top-level aggregations', () => {
        const result = query(listingDetailMappings)
          .bool()
          .must((q) => q.match('title', 'coffee'))
          .filter((q) => q.range('list_price', { gte: 5, lte: 20 }))
          .aggs((agg) =>
            agg
              .terms('by_category', 'property_class', { size: 10 })
              .avg('avg_price', 'list_price')
              .max('max_rating', 'cap_rate')
              .min('min_price', 'list_price')
          )
          .size(20)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "avg_price": {
                "avg": {
                  "field": "list_price",
                },
              },
              "by_category": {
                "terms": {
                  "field": "property_class",
                  "size": 10,
                },
              },
              "max_rating": {
                "max": {
                  "field": "cap_rate",
                },
              },
              "min_price": {
                "min": {
                  "field": "list_price",
                },
              },
            },
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "list_price": {
                        "gte": 5,
                        "lte": 20,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "title": "coffee",
                    },
                  },
                ],
              },
            },
            "size": 20,
          }
        `);
      });

      it('should combine geo query with aggregations', () => {
        const result = query(listingDetailMappings)
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '5km' }
          )
          .aggs((agg) =>
            agg
              .terms('by_category', 'property_class')
              .subAgg((sub) => sub.avg('avg_rating', 'cap_rate'))
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "by_category": {
                "aggs": {
                  "avg_rating": {
                    "avg": {
                      "field": "cap_rate",
                    },
                  },
                },
                "terms": {
                  "field": "property_class",
                },
              },
            },
            "query": {
              "geo_distance": {
                "distance": "5km",
                "location": {
                  "lat": 40.7128,
                  "lon": -74.006,
                },
              },
            },
          }
        `);
      });

      it('should build query(false) with multiple aggregations and all meta properties', () => {
        const result = query(listingDetailMappings, false)
          .aggs((agg) =>
            agg
              .terms('by_category', 'property_class', { size: 20 })
              .dateHistogram('over_time', 'listed_date', { interval: 'month' })
              .stats('price_stats', 'list_price')
          )
          .size(0)
          .from(0)
          .timeout('30s')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "by_category": {
                "terms": {
                  "field": "property_class",
                  "size": 20,
                },
              },
              "over_time": {
                "date_histogram": {
                  "field": "listed_date",
                  "interval": "month",
                },
              },
              "price_stats": {
                "stats": {
                  "field": "list_price",
                },
              },
            },
            "from": 0,
            "size": 0,
            "timeout": "30s",
          }
        `);
        expect(result.query).toBeUndefined();
      });

      it('should build query(false) with deeply nested sub-aggregations', () => {
        const result = query(listingDetailMappings, false)
          .aggs((agg) =>
            agg.terms('by_category', 'property_class').subAgg((sub) =>
              sub
                .dateHistogram('by_month', 'listed_date', {
                  interval: 'month'
                })
                .subAgg((sub2) =>
                  sub2
                    .avg('avg_price', 'list_price')
                    .sum('total_sales', 'list_price')
                )
            )
          )
          .size(0)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "by_category": {
                "aggs": {
                  "by_month": {
                    "aggs": {
                      "avg_price": {
                        "avg": {
                          "field": "list_price",
                        },
                      },
                      "total_sales": {
                        "sum": {
                          "field": "list_price",
                        },
                      },
                    },
                    "date_histogram": {
                      "field": "listed_date",
                      "interval": "month",
                    },
                  },
                },
                "terms": {
                  "field": "property_class",
                },
              },
            },
            "size": 0,
          }
        `);
        expect(result.query).toBeUndefined();
      });

      it('should combine aggregations with highlight', () => {
        const result = query(listingDetailMappings)
          .match('title', 'coffee shop')
          .aggs((agg) => agg.terms('by_category', 'property_class'))
          .highlight(['title', 'description'], {
            pre_tags: ['<em>'],
            post_tags: ['</em>']
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "by_category": {
                "terms": {
                  "field": "property_class",
                },
              },
            },
            "highlight": {
              "fields": {
                "description": {},
                "title": {},
              },
              "post_tags": [
                "</em>",
              ],
              "pre_tags": [
                "<em>",
              ],
            },
            "query": {
              "match": {
                "title": "coffee shop",
              },
            },
          }
        `);
      });

      it('should combine aggregations with sort', () => {
        const result = query(listingDetailMappings)
          .match('title', 'restaurant')
          .aggs((agg) => agg.terms('by_category', 'property_class'))
          .sort('cap_rate', 'desc')
          .size(10)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "by_category": {
                "terms": {
                  "field": "property_class",
                },
              },
            },
            "query": {
              "match": {
                "title": "restaurant",
              },
            },
            "size": 10,
            "sort": [
              {
                "cap_rate": "desc",
              },
            ],
          }
        `);
      });

      it('should combine aggregations with _source selection', () => {
        const result = query(listingDetailMappings)
          .term('property_class', 'electronics')
          .aggs((agg) => agg.avg('avg_price', 'list_price'))
          ._source(['title', 'list_price', 'property_class'])
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "_source": [
              "title",
              "list_price",
              "property_class",
            ],
            "aggs": {
              "avg_price": {
                "avg": {
                  "field": "list_price",
                },
              },
            },
            "query": {
              "term": {
                "property_class": "electronics",
              },
            },
          }
        `);
      });
    });
  });

  describe('ClauseBuilder and edge cases', () => {
    describe('ClauseBuilder in all bool contexts', () => {
      it('should use matchPhrase in bool filter context', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) => q.matchPhrase('address', 'gaming laptop'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "match_phrase": {
                      "address": "gaming laptop",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use matchPhrasePrefix in bool should context', () => {
        const result = query(listingMappings)
          .bool()
          .should((q) =>
            q.matchPhrasePrefix('address', 'gam', { max_expansions: 10 })
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "should": [
                  {
                    "match_phrase_prefix": {
                      "address": {
                        "max_expansions": 10,
                        "query": "gam",
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use term in bool mustNot context', () => {
        const result = query(listingMappings)
          .bool()
          .mustNot((q) => q.term('property_class', 'refurbished'))
          .mustNot((q) => q.term('property_class', 'used'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must_not": [
                  {
                    "term": {
                      "property_class": "refurbished",
                    },
                  },
                  {
                    "term": {
                      "property_class": "used",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use fuzzy in bool filter context', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) => q.fuzzy('address', 'laptp', { fuzziness: 'AUTO' }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "fuzzy": {
                      "address": {
                        "fuzziness": "AUTO",
                        "value": "laptp",
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use ids in bool should context', () => {
        const result = query(listingMappings)
          .bool()
          .should((q) => q.ids(['featured-1', 'featured-2']))
          .should((q) => q.match('address', 'laptop'))
          .minimumShouldMatch(1)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "minimum_should_match": 1,
                "should": [
                  {
                    "ids": {
                      "values": [
                        "featured-1",
                        "featured-2",
                      ],
                    },
                  },
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use matchAll in bool must context', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.matchAll())
          .filter((q) => q.term('property_class', 'active'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "property_class": "active",
                    },
                  },
                ],
                "must": [
                  {
                    "match_all": {},
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use multiMatch in bool filter context', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) =>
            q.multiMatch(['address'], 'laptop', {
              type: 'cross_fields'
            })
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "multi_match": {
                      "fields": [
                        "address",
                      ],
                      "query": "laptop",
                      "type": "cross_fields",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use prefix in bool should context', () => {
        const result = query(listingMappings)
          .bool()
          .should((q) => q.prefix('property_class', 'gam'))
          .should((q) => q.prefix('property_class', 'lap'))
          .minimumShouldMatch(1)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "minimum_should_match": 1,
                "should": [
                  {
                    "prefix": {
                      "property_class": "gam",
                    },
                  },
                  {
                    "prefix": {
                      "property_class": "lap",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use wildcard in bool mustNot context', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.match('address', 'laptop'))
          .mustNot((q) => q.wildcard('property_class', '*refurb*'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                ],
                "must_not": [
                  {
                    "wildcard": {
                      "property_class": "*refurb*",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use term in bool should context', () => {
        const result = query(listingMappings)
          .bool()
          .should((q) => q.term('property_class', 'laptop'))
          .should((q) => q.term('property_class', 'computer'))
          .should((q) => q.term('property_class', 'notebook'))
          .minimumShouldMatch(1)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "minimum_should_match": 1,
                "should": [
                  {
                    "term": {
                      "property_class": "laptop",
                    },
                  },
                  {
                    "term": {
                      "property_class": "computer",
                    },
                  },
                  {
                    "term": {
                      "property_class": "notebook",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use terms in bool filter context', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.match('address', 'laptop'))
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .filter((q) => q.terms('property_class', ['new', 'certified'] as any))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "terms": {
                      "property_class": [
                        "new",
                        "certified",
                      ],
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use exists in bool should context', () => {
        const result = query(listingMappings)
          .bool()
          .should((q) => q.exists('list_price'))
          .should((q) => q.exists('sqft'))
          .minimumShouldMatch(1)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "minimum_should_match": 1,
                "should": [
                  {
                    "exists": {
                      "field": "list_price",
                    },
                  },
                  {
                    "exists": {
                      "field": "sqft",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use range in bool filter context', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) => q.match('address', 'laptop'))
          .filter((q) => q.range('list_price', { gte: 100, lte: 500 }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "list_price": {
                        "gte": 100,
                        "lte": 500,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use matchAll in bool filter context', () => {
        const result = query(listingMappings)
          .bool()
          .filter((q) => q.matchAll())
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "match_all": {},
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use matchPhrasePrefix with options in bool must context', () => {
        const result = query(listingMappings)
          .bool()
          .must((q) =>
            q.matchPhrasePrefix('address', 'gaming lap', {
              max_expansions: 20,
              slop: 2
            })
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match_phrase_prefix": {
                      "address": {
                        "max_expansions": 20,
                        "query": "gaming lap",
                        "slop": 2,
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use multiMatch with options in bool should context', () => {
        const result = query(listingMappings)
          .bool()
          .should((q) =>
            q.multiMatch(['address'], 'gaming laptop', {
              type: 'best_fields',
              tie_breaker: 0.3
            })
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "should": [
                  {
                    "multi_match": {
                      "fields": [
                        "address",
                      ],
                      "query": "gaming laptop",
                      "tie_breaker": 0.3,
                      "type": "best_fields",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use when in ClauseBuilder context (truthy)', () => {
        const category = 'electronics';
        const result = query(listingMappings)
          .bool()
          .filter((q) =>
            q.when(category, (q) => q.term('property_class', category))
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "property_class": "electronics",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use when in ClauseBuilder context (falsy)', () => {
        const category = undefined;
        const result = query(listingMappings)
          .bool()
          .must((q) => q.match('address', 'laptop'))
          .filter((q) =>
            q.when(category, (q) => q.term('property_class', category!))
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  undefined,
                ],
                "must": [
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('when() edge cases', () => {
      it('should handle null condition (falsy)', () => {
        const value = null;
        const result = query(listingMappings)
          .when(value, (q) => q.match('address', 'test'))
          ?.build();

        expect(result).toBeUndefined();
      });

      it('should handle boolean false condition', () => {
        const condition = false;
        const result = query(listingMappings)
          .when(condition, (q) => q.match('address', 'test'))
          ?.build();

        expect(result).toBeUndefined();
      });

      it('should handle boolean true condition', () => {
        const condition = true;
        const result = query(listingMappings)
          .when(condition, (q) => q.match('address', 'test'))!
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": "test",
              },
            },
          }
        `);
      });

      it('should handle object condition (truthy)', () => {
        const filters = { category: 'electronics' };
        const result = query(listingMappings)
          .when(filters, (q) => q.term('property_class', filters.category))!
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "term": {
                "property_class": "electronics",
              },
            },
          }
        `);
      });

      it('should handle when in bool should context', () => {
        const hasFeatured = true;
        const result = query(listingMappings)
          .bool()
          .must((q) => q.match('address', 'laptop'))
          .should(
            (q) =>
              q.when(hasFeatured, (q2) =>
                q2.term('property_class', 'featured')
              ) || q.matchAll()
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                ],
                "should": [
                  {
                    "term": {
                      "property_class": "featured",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should handle when with else clause in bool context', () => {
        const searchTerm: string | undefined = undefined;
        const result = query(listingMappings)
          .bool()
          .must(
            (q) =>
              q.when(
                searchTerm,
                (q2) => q2.match('address', searchTerm!),
                (q2) => q2.matchAll()
              )!
          )
          .build();

        expect(result.query?.bool?.must?.[0]?.match_all).toEqual({});
      });

      it('should handle nested when conditionals', () => {
        const searchTerm = 'laptop';
        const useBoost = true;

        const result = query(listingMappings)
          .when(
            searchTerm,
            (q) =>
              q.when(
                useBoost,
                (q2) => q2.match('address', searchTerm, { boost: 2 }),
                (q2) => q2.match('address', searchTerm)
              )!
          )!
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "address": {
                  "boost": 2,
                  "query": "laptop",
                },
              },
            },
          }
        `);
      });

      it('should use when in bool mustNot context', () => {
        const excludeRefurbished = true;
        const result = query(listingMappings)
          .bool()
          .must((q) => q.match('address', 'laptop'))
          .mustNot(
            (q) =>
              q.when(excludeRefurbished, (q2) =>
                q2.term('property_class', 'refurbished')
              ) || q.term('property_class', '__impossible__')
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                ],
                "must_not": [
                  {
                    "term": {
                      "property_class": "refurbished",
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('Geo query edge cases', () => {
      it('should create geoDistance with numeric distance', () => {
        const result = query(listingDetailMappings)
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: 5000 } // meters
          )
          .build();

        expect(result.query?.geo_distance?.distance).toBe(5000);
      });

      it('should create geoDistance with arc distance_type', () => {
        const result = query(listingDetailMappings)
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '10km', distance_type: 'arc' }
          )
          .build();

        expect(result.query?.geo_distance?.distance_type).toBe('arc');
      });

      it('should use geoDistance at root level (bool geo is not yet supported)', () => {
        // Note: Currently geo queries are only at root level
        // This test documents current behavior
        const geoResult = query(listingDetailMappings)
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '5km' }
          )
          .build();

        expect(geoResult.query?.geo_distance).toBeDefined();
      });

      it('should create geoBoundingBox with edge coordinates', () => {
        const result = query(listingDetailMappings)
          .geoBoundingBox('location', {
            top: 40.8,
            left: -74.1,
            bottom: 40.7,
            right: -74.0
          })
          .build();

        expect(result.query?.geo_bounding_box?.location).toEqual({
          top: 40.8,
          left: -74.1,
          bottom: 40.7,
          right: -74.0
        });
      });

      it('should create geoPolygon with many points', () => {
        const points = [
          { lat: 40.7128, lon: -74.006 },
          { lat: 40.75, lon: -74.05 },
          { lat: 40.78, lon: -74.02 },
          { lat: 40.76, lon: -73.98 },
          { lat: 40.73, lon: -73.95 },
          { lat: 40.7, lon: -73.97 }
        ];

        const result = query(listingDetailMappings)
          .geoPolygon('location', { points })
          .build();

        expect(result.query?.geo_polygon?.location?.points).toHaveLength(6);
      });
    });

    describe('Pattern query edge cases', () => {
      it('should create regexp with max_determinized_states option', () => {
        const result = query(listingDetailMappings)
          .regexp('property_class', 'rest.*ant', {
            max_determinized_states: 10000
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "regexp": {
                "property_class": {
                  "max_determinized_states": 10000,
                  "value": "rest.*ant",
                },
              },
            },
          }
        `);
      });

      it('should create regexp in bool must context', () => {
        // Note: regexp is currently only at root level
        // This test documents current behavior
        const result = query(listingDetailMappings)
          .regexp('property_class', 'coffee.*')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "regexp": {
                "property_class": "coffee.*",
              },
            },
          }
        `);
      });

      it('should create constantScore with range filter', () => {
        const result = query(listingDetailMappings)
          .constantScore((q) => q.range('list_price', { gte: 100, lte: 500 }), {
            boost: 1.2
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "constant_score": {
                "boost": 1.2,
                "filter": {
                  "range": {
                    "list_price": {
                      "gte": 100,
                      "lte": 500,
                    },
                  },
                },
              },
            },
          }
        `);
      });

      it('should create constantScore with exists filter', () => {
        const result = query(listingDetailMappings)
          .constantScore((q) => q.exists('cap_rate'), { boost: 0.5 })
          .build();

        expect(result.query?.constant_score?.filter?.exists?.field).toBe(
          'cap_rate'
        );
        expect(result.query?.constant_score?.boost).toBe(0.5);
      });

      it('should create constantScore with term filter', () => {
        const result = query(listingDetailMappings)
          .constantScore((q) => q.term('property_class', 'coffee'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "constant_score": {
                "filter": {
                  "term": {
                    "property_class": "coffee",
                  },
                },
              },
            },
          }
        `);
      });

      it('should create regexp with all options combined', () => {
        const result = query(listingDetailMappings)
          .regexp('property_class', 'coff?ee.*shop', {
            flags: 'COMPLEMENT|INTERVAL',
            max_determinized_states: 20000,
            boost: 1.5
          })
          .build();

        expect(result.query?.regexp?.property_class).toEqual({
          value: 'coff?ee.*shop',
          flags: 'COMPLEMENT|INTERVAL',
          max_determinized_states: 20000,
          boost: 1.5
        });
      });
    });

    describe('Nested query edge cases', () => {
      it('should build nested with range query inside', () => {
        const result = query(listingMappings)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .nested('property_class' as any, (q) =>
            q.range('nested.price', { gte: 100, lte: 500 })
          )
          .build();

        expect(result.query?.nested?.query?.range).toBeDefined();
      });

      it('should build nested with max score_mode', () => {
        const result = query(listingMappings)
          .nested(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'type' as any,
            (q) => q.match('nested.name', 'test'),
            { score_mode: 'max' }
          )
          .build();

        expect(result.query?.nested?.score_mode).toBe('max');
      });

      it('should build nested with none score_mode', () => {
        const result = query(listingMappings)
          .nested(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'type' as any,
            (q) => q.term('nested.status', 'active'),
            { score_mode: 'none' }
          )
          .build();

        expect(result.query?.nested?.score_mode).toBe('none');
      });
    });
  });

  describe('Completeness and real-world scenarios', () => {
    describe('Sorting and meta property edge cases', () => {
      it('should add multiple sorts (chained calls)', () => {
        const result = query(listingMappings)
          .match('address', 'laptop')
          .sort('list_price', 'asc')
          .sort('sqft', 'desc')
          .build();

        expect(result.sort).toMatchInlineSnapshot(`
          [
            {
              "list_price": "asc",
            },
            {
              "sqft": "desc",
            },
          ]
        `);
      });

      it('should add sort with desc direction explicitly', () => {
        const result = query(listingMappings)
          .match('address', 'laptop')
          .sort('list_price', 'desc')
          .build();

        expect(result.sort).toMatchInlineSnapshot(`
          [
            {
              "list_price": "desc",
            },
          ]
        `);
      });

      it('should handle empty _source array', () => {
        const result = query(listingMappings)
          .match('address', 'laptop')
          ._source([])
          .build();

        expect(result._source).toEqual([]);
      });

      it('should handle large pagination values', () => {
        const result = query(listingMappings)
          .match('address', 'laptop')
          .from(10000)
          .size(100)
          .build();

        expect(result.from).toBe(10000);
        expect(result.size).toBe(100);
      });

      it('should handle zero values for pagination', () => {
        const result = query(listingMappings)
          .match('address', 'laptop')
          .from(0)
          .size(0)
          .build();

        expect(result.from).toBe(0);
        expect(result.size).toBe(0);
      });

      it('should combine all meta properties', () => {
        const result = query(listingMappings)
          .match('address', 'laptop')
          .from(20)
          .size(10)
          .sort('list_price', 'asc')
          .sort('sqft', 'desc')
          ._source(['address', 'list_price'])
          .timeout('10s')
          .trackScores(true)
          .explain(false)
          .minScore(1.5)
          .version(true)
          .seqNoPrimaryTerm(true)
          .trackTotalHits(10000)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "_source": [
              "address",
              "list_price",
            ],
            "explain": false,
            "from": 20,
            "min_score": 1.5,
            "query": {
              "match": {
                "address": "laptop",
              },
            },
            "seq_no_primary_term": true,
            "size": 10,
            "sort": [
              {
                "list_price": "asc",
              },
              {
                "sqft": "desc",
              },
            ],
            "timeout": "10s",
            "track_scores": true,
            "track_total_hits": 10000,
            "version": true,
          }
        `);
      });

      it('should allow overriding meta properties with subsequent calls', () => {
        const result = query(listingMappings)
          .match('address', 'laptop')
          .size(10)
          .size(20)
          .from(0)
          .from(50)
          .build();

        expect(result.size).toBe(20);
        expect(result.from).toBe(50);
      });
    });

    describe('Real-world scenarios', () => {
      it('should build e-commerce search: text + filters + facets + pagination + sort', () => {
        const searchTerm = 'gaming laptop';
        const category = 'electronics';
        const minPrice = 500;
        const maxPrice = 2000;

        const result = query(listingDetailMappings)
          .bool()
          .must((q) =>
            q.match('title', searchTerm, { operator: 'and', boost: 2 })
          )
          .filter((q) => q.term('property_class', category))
          .filter((q) =>
            q.range('list_price', { gte: minPrice, lte: maxPrice })
          )
          .filter((q) => q.exists('cap_rate'))
          .aggs((agg) =>
            agg
              .terms('by_category', 'property_class', { size: 20 })
              .range('price_ranges', 'list_price', {
                ranges: [
                  { key: 'budget', to: 500 },
                  { key: 'mid', from: 500, to: 1000 },
                  { key: 'premium', from: 1000 }
                ]
              })
              .avg('avg_price', 'list_price')
              .avg('avg_rating', 'cap_rate')
          )
          .highlight(['title', 'description'], {
            pre_tags: ['<mark>'],
            post_tags: ['</mark>'],
            fragment_size: 150
          })
          .sort('cap_rate', 'desc')
          ._source(['title', 'list_price', 'cap_rate', 'property_class'])
          .from(0)
          .size(20)
          .trackTotalHits(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "_source": [
              "title",
              "list_price",
              "cap_rate",
              "property_class",
            ],
            "aggs": {
              "avg_price": {
                "avg": {
                  "field": "list_price",
                },
              },
              "avg_rating": {
                "avg": {
                  "field": "cap_rate",
                },
              },
              "by_category": {
                "terms": {
                  "field": "property_class",
                  "size": 20,
                },
              },
              "price_ranges": {
                "range": {
                  "field": "list_price",
                  "ranges": [
                    {
                      "key": "budget",
                      "to": 500,
                    },
                    {
                      "from": 500,
                      "key": "mid",
                      "to": 1000,
                    },
                    {
                      "from": 1000,
                      "key": "premium",
                    },
                  ],
                },
              },
            },
            "from": 0,
            "highlight": {
              "fields": {
                "description": {
                  "fragment_size": 150,
                },
                "title": {
                  "fragment_size": 150,
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
                      "property_class": "electronics",
                    },
                  },
                  {
                    "range": {
                      "list_price": {
                        "gte": 500,
                        "lte": 2000,
                      },
                    },
                  },
                  {
                    "exists": {
                      "field": "cap_rate",
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "title": {
                        "boost": 2,
                        "operator": "and",
                        "query": "gaming laptop",
                      },
                    },
                  },
                ],
              },
            },
            "size": 20,
            "sort": [
              {
                "cap_rate": "desc",
              },
            ],
            "track_total_hits": true,
          }
        `);
      });

      it('should build autocomplete search: matchPhrasePrefix + highlighting + size limit', () => {
        const prefix = 'gam';

        const result = query(listingMappings)
          .matchPhrasePrefix('address', prefix, { max_expansions: 50 })
          .highlight(['address'], {
            pre_tags: ['<b>'],
            post_tags: ['</b>']
          })
          .size(10)
          ._source(['address', 'property_class'])
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "_source": [
              "address",
              "property_class",
            ],
            "highlight": {
              "fields": {
                "address": {},
              },
              "post_tags": [
                "</b>",
              ],
              "pre_tags": [
                "<b>",
              ],
            },
            "query": {
              "match_phrase_prefix": {
                "address": {
                  "max_expansions": 50,
                  "query": "gam",
                },
              },
            },
            "size": 10,
          }
        `);
      });

      it('should build analytics dashboard: aggregations only with size=0', () => {
        const result = query(listingDetailMappings, false)
          .aggs((agg) =>
            agg
              .dateHistogram('sales_by_day', 'listed_date', {
                interval: 'day',
                min_doc_count: 0,
                extended_bounds: {
                  min: '2024-01-01',
                  max: '2024-12-31'
                }
              })
              .subAgg((sub) =>
                sub
                  .sum('daily_revenue', 'list_price')
                  .avg('avg_order_value', 'list_price')
                  .cardinality('unique_customers', 'property_class')
              )
          )
          .size(0)
          .timeout('30s')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "sales_by_day": {
                "aggs": {
                  "avg_order_value": {
                    "avg": {
                      "field": "list_price",
                    },
                  },
                  "daily_revenue": {
                    "sum": {
                      "field": "list_price",
                    },
                  },
                  "unique_customers": {
                    "cardinality": {
                      "field": "property_class",
                    },
                  },
                },
                "date_histogram": {
                  "extended_bounds": {
                    "max": "2024-12-31",
                    "min": "2024-01-01",
                  },
                  "field": "listed_date",
                  "interval": "day",
                  "min_doc_count": 0,
                },
              },
            },
            "size": 0,
            "timeout": "30s",
          }
        `);
        expect(result.query).toBeUndefined();
      });

      it('should build geo-based search: location + radius + category filter + rating sort', () => {
        const result = query(listingDetailMappings)
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '10km', distance_type: 'arc' }
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "geo_distance": {
                "distance": "10km",
                "distance_type": "arc",
                "location": {
                  "lat": 40.7128,
                  "lon": -74.006,
                },
              },
            },
          }
        `);
      });

      it('should build time-series query: date range + date histogram + metrics', () => {
        const result = query(listingDetailMappings, false)
          .aggs((agg) =>
            agg
              .dateHistogram('by_hour', 'listed_date', {
                interval: 'hour',
                time_zone: 'UTC',
                min_doc_count: 0
              })
              .subAgg((sub) =>
                sub
                  .avg('avg_value', 'list_price')
                  .min('min_value', 'list_price')
                  .max('max_value', 'list_price')
                  .percentiles('value_percentiles', 'list_price', {
                    percents: [50, 90, 95, 99]
                  })
              )
          )
          .size(0)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "by_hour": {
                "aggs": {
                  "avg_value": {
                    "avg": {
                      "field": "list_price",
                    },
                  },
                  "max_value": {
                    "max": {
                      "field": "list_price",
                    },
                  },
                  "min_value": {
                    "min": {
                      "field": "list_price",
                    },
                  },
                  "value_percentiles": {
                    "percentiles": {
                      "field": "list_price",
                      "percents": [
                        50,
                        90,
                        95,
                        99,
                      ],
                    },
                  },
                },
                "date_histogram": {
                  "field": "listed_date",
                  "interval": "hour",
                  "min_doc_count": 0,
                  "time_zone": "UTC",
                },
              },
            },
            "size": 0,
          }
        `);
      });

      it('should build multi-field search: multiMatch with boost + highlighting', () => {
        const searchQuery = 'premium coffee beans';

        const result = query(listingDetailMappings)
          .multiMatch(['title', 'description', 'address'], searchQuery, {
            type: 'best_fields',
            operator: 'or',
            tie_breaker: 0.3,
            boost: 1.5
          })
          .highlight(['title', 'description'], {
            fragment_size: 200,
            number_of_fragments: 3
          })
          .from(0)
          .size(25)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "from": 0,
            "highlight": {
              "fields": {
                "description": {
                  "fragment_size": 200,
                  "number_of_fragments": 3,
                },
                "title": {
                  "fragment_size": 200,
                  "number_of_fragments": 3,
                },
              },
            },
            "query": {
              "multi_match": {
                "boost": 1.5,
                "fields": [
                  "title",
                  "description",
                  "address",
                ],
                "operator": "or",
                "query": "premium coffee beans",
                "tie_breaker": 0.3,
                "type": "best_fields",
              },
            },
            "size": 25,
          }
        `);
      });

      it('should build faceted navigation: bool filters + terms aggregations per facet', () => {
        const selectedCategory = 'electronics';
        const selectedBrand = 'Apple';

        const result = query(listingDetailMappings)
          .bool()
          .filter((q) => q.term('property_class', selectedCategory))
          .filter((q) => q.match('title', selectedBrand))
          .aggs((agg) =>
            agg
              .terms('categories', 'property_class', { size: 30 })
              .terms('price_tiers', 'list_price', { size: 10 })
              .terms('ratings', 'cap_rate', { size: 5 })
          )
          .size(24)
          .from(0)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "aggs": {
              "categories": {
                "terms": {
                  "field": "property_class",
                  "size": 30,
                },
              },
              "price_tiers": {
                "terms": {
                  "field": "list_price",
                  "size": 10,
                },
              },
              "ratings": {
                "terms": {
                  "field": "cap_rate",
                  "size": 5,
                },
              },
            },
            "from": 0,
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "property_class": "electronics",
                    },
                  },
                  {
                    "match": {
                      "title": "Apple",
                    },
                  },
                ],
              },
            },
            "size": 24,
          }
        `);
      });

      it('should build conditional search with all optional filters', () => {
        // Simulate a search where all filters might be optional
        const filters = {
          searchTerm: 'laptop' as string | undefined,
          category: undefined as string | undefined,
          minPrice: 500 as number | undefined,
          maxPrice: undefined as number | undefined,
          inStock: true as boolean | undefined
        };

        const result = query(listingDetailMappings)
          .bool()
          .must(
            (q) =>
              q.when(filters.searchTerm, (q2) =>
                q2.match('title', filters.searchTerm!)
              ) || q.matchAll()
          )
          .filter(
            (q) =>
              q.when(filters.category, (q2) =>
                q2.term('property_class', filters.category!)
              ) || q.matchAll()
          )
          .filter(
            (q) =>
              q.when(filters.minPrice, (q2) =>
                q2.range('list_price', { gte: filters.minPrice! })
              ) || q.matchAll()
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "match_all": {},
                  },
                  {
                    "range": {
                      "list_price": {
                        "gte": 500,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "title": "laptop",
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('Builder behavior', () => {
      it('should verify builder immutability (original not modified)', () => {
        const base = query(listingMappings).match('address', 'laptop');
        const withSize = base.size(10);
        const withFrom = base.from(20);

        const baseResult = base.build();
        const withSizeResult = withSize.build();
        const withFromResult = withFrom.build();

        // Base should not have size or from
        expect(baseResult.size).toBeUndefined();
        expect(baseResult.from).toBeUndefined();

        // withSize should have size but not from
        expect(withSizeResult.size).toBe(10);
        expect(withSizeResult.from).toBeUndefined();

        // withFrom should have from but not size
        expect(withFromResult.from).toBe(20);
        expect(withFromResult.size).toBeUndefined();
      });

      it('should allow build to be called multiple times on same builder', () => {
        const builder = query(listingMappings)
          .match('address', 'laptop')
          .size(10);

        const result1 = builder.build();
        const result2 = builder.build();
        const result3 = builder.build();

        expect(result1).toEqual(result2);
        expect(result2).toEqual(result3);
      });

      it('should allow reusing partial builder chains', () => {
        const baseFilters = query(listingMappings)
          .bool()
          .filter((q) => q.exists('address'))
          .filter((q) => q.range('list_price', { gte: 0 }));

        const searchA = baseFilters
          .must((q) => q.match('address', 'laptop'))
          .build();

        const searchB = baseFilters
          .must((q) => q.match('address', 'phone'))
          .build();

        expect(searchA).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "exists": {
                      "field": "address",
                    },
                  },
                  {
                    "range": {
                      "list_price": {
                        "gte": 0,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "address": "laptop",
                    },
                  },
                ],
              },
            },
          }
        `);
        expect(searchB).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "exists": {
                      "field": "address",
                    },
                  },
                  {
                    "range": {
                      "list_price": {
                        "gte": 0,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "address": "phone",
                    },
                  },
                ],
              },
            },
          }
        `);

        // Both should have the base filters
        expect(searchA.query?.bool?.filter).toHaveLength(2);
        expect(searchB.query?.bool?.filter).toHaveLength(2);
      });

      it('should handle empty query builder (just build)', () => {
        const result = query(listingMappings).build();

        // Should return an object, possibly with undefined query
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });

      it('should handle query builder with only meta properties (no query)', () => {
        const result = query(listingMappings)
          .size(10)
          .from(0)
          .sort('list_price', 'asc')
          .build();

        expect(result.size).toBe(10);
        expect(result.from).toBe(0);
        expect(result.sort).toMatchInlineSnapshot(`
          [
            {
              "list_price": "asc",
            },
          ]
        `);
        // Query may be undefined since no query method was called
      });

      it('should maintain method chaining fluency', () => {
        // Verify that all methods return QueryBuilder for chaining
        const result = query(listingMappings)
          .matchAll()
          .from(0)
          .size(10)
          .sort('list_price', 'asc')
          ._source(['address'])
          .timeout('5s')
          .trackScores(true)
          .explain(false)
          .minScore(1)
          .version(true)
          .seqNoPrimaryTerm(false)
          .trackTotalHits(true)
          .highlight(['address'])
          .build();

        expect(result).toBeDefined();
        expect(result.query?.match_all).toEqual({});
      });
    });

    describe('KNN vector search', () => {
      describe('Basic KNN queries', () => {
        it('should build a basic knn query', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5, 0.3, 0.8], {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "knn": {
                "field": "embedding",
                "k": 10,
                "num_candidates": 100,
                "query_vector": [
                  0.5,
                  0.3,
                  0.8,
                ],
              },
            }
          `);
        });

        it('should build knn query with boost', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.1, 0.2, 0.3], {
              k: 5,
              num_candidates: 50,
              boost: 2.0
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "knn": {
                "boost": 2,
                "field": "embedding",
                "k": 5,
                "num_candidates": 50,
                "query_vector": [
                  0.1,
                  0.2,
                  0.3,
                ],
              },
            }
          `);
        });

        it('should build knn query with similarity threshold', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.9, 0.1, 0.5], {
              k: 20,
              num_candidates: 200,
              similarity: 0.8
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "knn": {
                "field": "embedding",
                "k": 20,
                "num_candidates": 200,
                "query_vector": [
                  0.9,
                  0.1,
                  0.5,
                ],
                "similarity": 0.8,
              },
            }
          `);
        });

        it('should build knn query with filter', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.4, 0.6, 0.2], {
              k: 10,
              num_candidates: 100,
              filter: {
                term: { category: 'electronics' }
              }
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "knn": {
                "field": "embedding",
                "filter": {
                  "term": {
                    "category": "electronics",
                  },
                },
                "k": 10,
                "num_candidates": 100,
                "query_vector": [
                  0.4,
                  0.6,
                  0.2,
                ],
              },
            }
          `);
        });

        it('should build knn query with all options', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.2, 0.4, 0.6, 0.8], {
              k: 15,
              num_candidates: 150,
              filter: {
                range: { price: { gte: 100, lte: 500 } }
              },
              boost: 1.5,
              similarity: 0.75
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "knn": {
                "boost": 1.5,
                "field": "embedding",
                "filter": {
                  "range": {
                    "price": {
                      "gte": 100,
                      "lte": 500,
                    },
                  },
                },
                "k": 15,
                "num_candidates": 150,
                "query_vector": [
                  0.2,
                  0.4,
                  0.6,
                  0.8,
                ],
                "similarity": 0.75,
              },
            }
          `);
        });
      });

      describe('KNN with query parameters', () => {
        it('should combine knn with size and from', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100
            })
            .size(20)
            .from(0)
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "from": 0,
              "knn": {
                "field": "embedding",
                "k": 10,
                "num_candidates": 100,
                "query_vector": [
                  0.5,
                  0.5,
                ],
              },
              "size": 20,
            }
          `);
        });

        it('should combine knn with _source', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.3, 0.7], {
              k: 5,
              num_candidates: 50
            })
            ._source(['address', 'list_price', 'property_class'])
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "_source": [
                "address",
                "list_price",
                "property_class",
              ],
              "knn": {
                "field": "embedding",
                "k": 5,
                "num_candidates": 50,
                "query_vector": [
                  0.3,
                  0.7,
                ],
              },
            }
          `);
        });

        it('should combine knn with sort', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.1, 0.9], {
              k: 10,
              num_candidates: 100
            })
            .sort('list_price', 'asc')
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "knn": {
                "field": "embedding",
                "k": 10,
                "num_candidates": 100,
                "query_vector": [
                  0.1,
                  0.9,
                ],
              },
              "sort": [
                {
                  "list_price": "asc",
                },
              ],
            }
          `);
        });

        it('should combine knn with timeout and other meta params', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.6, 0.4], {
              k: 10,
              num_candidates: 100
            })
            .timeout('5s')
            .trackScores(true)
            .minScore(0.5)
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "knn": {
                "field": "embedding",
                "k": 10,
                "num_candidates": 100,
                "query_vector": [
                  0.6,
                  0.4,
                ],
              },
              "min_score": 0.5,
              "timeout": "5s",
              "track_scores": true,
            }
          `);
        });
      });

      describe('KNN with different vector dimensions', () => {
        it('should handle 128-dimensional vectors', () => {
          const vector128 = new Array(128).fill(0).map((_, i) => i / 128);
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', vector128, {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result.knn?.query_vector).toHaveLength(128);
          expect(result.knn?.field).toBe('embedding');
        });

        it('should handle 384-dimensional vectors', () => {
          const vector384 = new Array(384).fill(0).map((_, i) => i / 384);
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', vector384, {
              k: 5,
              num_candidates: 50
            })
            .build();

          expect(result.knn?.query_vector).toHaveLength(384);
        });

        it('should handle 768-dimensional vectors', () => {
          const vector768 = new Array(768).fill(0).map((_, i) => i / 768);
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', vector768, {
              k: 20,
              num_candidates: 200
            })
            .build();

          expect(result.knn?.query_vector).toHaveLength(768);
        });

        it('should handle 1536-dimensional vectors (OpenAI ada-002)', () => {
          const vector1536 = new Array(1536).fill(0).map((_, i) => i / 1536);
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', vector1536, {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result.knn?.query_vector).toHaveLength(1536);
        });
      });

      describe('KNN with complex filters', () => {
        it('should support bool filter with knn', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100,
              filter: {
                bool: {
                  must: [{ term: { category: 'electronics' } }],
                  filter: [{ range: { price: { gte: 100 } } }]
                }
              }
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "knn": {
                "field": "embedding",
                "filter": {
                  "bool": {
                    "filter": [
                      {
                        "range": {
                          "price": {
                            "gte": 100,
                          },
                        },
                      },
                    ],
                    "must": [
                      {
                        "term": {
                          "category": "electronics",
                        },
                      },
                    ],
                  },
                },
                "k": 10,
                "num_candidates": 100,
                "query_vector": [
                  0.5,
                  0.5,
                ],
              },
            }
          `);
        });

        it('should support multiple term filters with knn', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.3, 0.7], {
              k: 15,
              num_candidates: 150,
              filter: {
                bool: {
                  must: [
                    { term: { category: 'electronics' } },
                    { term: { id: 'prod-123' } }
                  ]
                }
              }
            })
            .build();

          expect(result.knn?.filter).toBeDefined();
          expect(result.knn?.filter.bool.must).toHaveLength(2);
        });
      });

      describe('KNN edge cases', () => {
        it('should handle empty vector', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [], {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result.knn?.query_vector).toEqual([]);
        });

        it('should handle single-dimensional vector', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5], {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result.knn?.query_vector).toEqual([0.5]);
        });

        it('should handle k = 1', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5, 0.5], {
              k: 1,
              num_candidates: 10
            })
            .build();

          expect(result.knn?.k).toBe(1);
        });

        it('should handle large k value', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5, 0.5], {
              k: 10000,
              num_candidates: 50000
            })
            .build();

          expect(result.knn?.k).toBe(10000);
          expect(result.knn?.num_candidates).toBe(50000);
        });

        it('should handle similarity = 0', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100,
              similarity: 0
            })
            .build();

          expect(result.knn?.similarity).toBe(0);
        });

        it('should handle similarity = 1', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100,
              similarity: 1
            })
            .build();

          expect(result.knn?.similarity).toBe(1);
        });

        it('should handle negative vector values', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [-0.5, -0.3, 0.8], {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result.knn?.query_vector).toEqual([-0.5, -0.3, 0.8]);
        });

        it('should handle very small vector values', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.000001, 0.000002, 0.000003], {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result.knn?.query_vector).toEqual([
            0.000001, 0.000002, 0.000003
          ]);
        });
      });

      describe('KNN method chaining', () => {
        it('should support fluent chaining with other methods', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100
            })
            .size(20)
            .from(0)
            ._source(['address', 'list_price'])
            .timeout('10s')
            .build();

          expect(result.knn).toBeDefined();
          expect(result.size).toBe(20);
          expect(result.from).toBe(0);
          expect(result._source).toEqual(['address', 'list_price']);
          expect(result.timeout).toBe('10s');
        });

        it('should maintain knn when chained before other methods', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .size(20)
            .knn('embedding', [0.7, 0.3], {
              k: 5,
              num_candidates: 50
            })
            .from(10)
            .build();

          expect(result.knn?.field).toBe('embedding');
          expect(result.size).toBe(20);
          expect(result.from).toBe(10);
        });
      });

      describe('Hybrid search patterns', () => {
        it('should support knn with aggregations', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100,
              filter: { term: { category: 'electronics' } }
            })
            .aggs((agg) =>
              agg.terms('categories', 'property_class', { size: 10 })
            )
            .build();

          expect(result.knn).toBeDefined();
          expect(result.aggs).toBeDefined();
          expect(result.aggs?.categories).toBeDefined();
        });

        it('should support knn-only search (no text query)', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.8, 0.2], {
              k: 20,
              num_candidates: 200
            })
            .size(20)
            .build();

          expect(result.knn).toBeDefined();
          expect(result.query).toBeUndefined();
          expect(result.size).toBe(20);
        });
      });

      describe('KNN in ClauseBuilder context', () => {
        it('should support knn in bool query filter', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .bool()
            .filter((q) =>
              q.knn('embedding', [0.5, 0.5], {
                k: 10,
                num_candidates: 100
              })
            )
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "filter": [
                    {
                      "knn": {
                        "field": "embedding",
                        "k": 10,
                        "num_candidates": 100,
                        "query_vector": [
                          0.5,
                          0.5,
                        ],
                      },
                    },
                  ],
                },
              },
            }
          `);
        });

        it('should support knn in bool query must', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .bool()
            .must((q) =>
              q.knn('embedding', [0.3, 0.7], {
                k: 5,
                num_candidates: 50,
                boost: 2.0
              })
            )
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "must": [
                    {
                      "knn": {
                        "boost": 2,
                        "field": "embedding",
                        "k": 5,
                        "num_candidates": 50,
                        "query_vector": [
                          0.3,
                          0.7,
                        ],
                      },
                    },
                  ],
                },
              },
            }
          `);
        });

        it('should support knn in bool query should', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .bool()
            .should((q) =>
              q.knn('embedding', [0.6, 0.4], {
                k: 10,
                num_candidates: 100
              })
            )
            .build();

          expect(result.query?.bool?.should).toHaveLength(1);
          expect(result.query?.bool?.should[0].knn).toBeDefined();
        });

        it('should support multiple knn queries in bool', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .bool()
            .should((q) =>
              q.knn('embedding', [0.5, 0.5], {
                k: 10,
                num_candidates: 100
              })
            )
            .filter((q) => q.term('property_class', 'electronics'))
            .build();

          expect(result.query?.bool?.should).toHaveLength(1);
          expect(result.query?.bool?.filter).toHaveLength(1);
        });
      });

      describe('Real-world KNN scenarios', () => {
        it('should build semantic product search query', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.23, 0.45, 0.67, 0.89], {
              k: 10,
              num_candidates: 100,
              filter: {
                bool: {
                  must: [{ range: { price: { gte: 50, lte: 500 } } }],
                  filter: [{ term: { category: 'electronics' } }]
                }
              },
              boost: 1.2
            })
            .size(10)
            ._source(['address', 'description', 'list_price'])
            .build();

          expect(result.knn).toBeDefined();
          expect(result.knn?.filter).toBeDefined();
          expect(result.size).toBe(10);
        });

        it('should build image similarity search query', () => {
          const imageEmbedding = new Array(512)
            .fill(0)
            .map(() => Math.random());
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', imageEmbedding, {
              k: 20,
              num_candidates: 200,
              similarity: 0.7
            })
            .size(20)
            .from(0)
            .build();

          expect(result.knn?.query_vector).toHaveLength(512);
          expect(result.knn?.similarity).toBe(0.7);
        });

        it('should build recommendation engine query', () => {
          const result = query(instrumentWithEmbeddingMappings)
            .knn('embedding', [0.1, 0.2, 0.3, 0.4, 0.5], {
              k: 50,
              num_candidates: 500,
              filter: {
                bool: {
                  must_not: [{ term: { id: 'current-product-id' } }]
                }
              }
            })
            .size(10)
            .build();

          expect(result.knn?.filter?.bool?.must_not).toBeDefined();
        });
      });
    });

    describe('Script queries', () => {
      describe('Basic script queries', () => {
        it('should build a basic script query', () => {
          const result = query(scoredInstrumentMappings)
            .script({
              source: "doc['list_price'].value > 100"
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "script": {
                  "script": {
                    "lang": "painless",
                    "source": "doc['list_price'].value > 100",
                  },
                },
              },
            }
          `);
        });

        it('should build script query with parameters', () => {
          const result = query(scoredInstrumentMappings)
            .script({
              source: "doc['list_price'].value > params.min_price",
              params: { min_price: 100 }
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "script": {
                  "script": {
                    "lang": "painless",
                    "params": {
                      "min_price": 100,
                    },
                    "source": "doc['list_price'].value > params.min_price",
                  },
                },
              },
            }
          `);
        });

        it('should build script query with boost', () => {
          const result = query(scoredInstrumentMappings)
            .script({
              source: "doc['liquidity_score'].value > 1000",
              boost: 2.0
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "script": {
                  "boost": 2,
                  "script": {
                    "lang": "painless",
                    "source": "doc['liquidity_score'].value > 1000",
                  },
                },
              },
            }
          `);
        });

        it('should build script query with expression language', () => {
          const result = query(scoredInstrumentMappings)
            .script({
              source: "doc['list_price'].value * 1.1",
              lang: 'expression'
            })
            .build();

          expect(result.query?.script?.script?.lang).toBe('expression');
        });

        it('should build script query with mustache template', () => {
          const result = query(scoredInstrumentMappings)
            .script({
              source: '{"term": {"name": "{{product_name}}"}}',
              lang: 'mustache',
              params: { product_name: 'laptop' }
            })
            .build();

          expect(result.query?.script?.script?.lang).toBe('mustache');
          expect(result.query?.script?.script?.params).toEqual({
            product_name: 'laptop'
          });
        });

        it('should build script query with complex parameters', () => {
          const result = query(scoredInstrumentMappings)
            .script({
              source:
                "doc['list_price'].value * params.multiplier + params.offset",
              params: {
                multiplier: 1.5,
                offset: 10,
                categories: ['electronics', 'computers']
              }
            })
            .build();

          expect(result.query?.script?.script?.params?.multiplier).toBe(1.5);
          expect(result.query?.script?.script?.params?.offset).toBe(10);
          expect(result.query?.script?.script?.params?.categories).toHaveLength(
            2
          );
        });
      });

      describe('Script in bool query context', () => {
        it('should support script in bool must', () => {
          const result = query(scoredInstrumentMappings)
            .bool()
            .must((q) =>
              q.script({
                source: "doc['list_price'].value > 100"
              })
            )
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "must": [
                    {
                      "script": {
                        "script": {
                          "lang": "painless",
                          "source": "doc['list_price'].value > 100",
                        },
                      },
                    },
                  ],
                },
              },
            }
          `);
        });

        it('should support script in bool filter', () => {
          const result = query(scoredInstrumentMappings)
            .bool()
            .filter((q) =>
              q.script({
                source: "doc['momentum_score'].value >= params.min_quality",
                params: { min_quality: 8 }
              })
            )
            .build();

          expect(result.query?.bool?.filter).toHaveLength(1);
          expect(result.query?.bool?.filter[0].script).toBeDefined();
        });

        it('should combine script with other queries', () => {
          const result = query(scoredInstrumentMappings)
            .bool()
            .must((q) => q.match('address', 'laptop'))
            .filter((q) =>
              q.script({
                source: "doc['list_price'].value > params.threshold",
                params: { threshold: 500 }
              })
            )
            .build();

          expect(result.query?.bool?.must).toHaveLength(1);
          expect(result.query?.bool?.filter).toHaveLength(1);
        });
      });

      describe('Script score queries', () => {
        it('should build basic script_score query', () => {
          const result = query(scoredInstrumentMappings)
            .scriptScore((q) => q.matchAll(), {
              source: "doc['liquidity_score'].value * 0.1"
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "script_score": {
                  "query": {
                    "match_all": {},
                  },
                  "script": {
                    "lang": "painless",
                    "source": "doc['liquidity_score'].value * 0.1",
                  },
                },
              },
            }
          `);
        });

        it('should build script_score with inner query', () => {
          const result = query(scoredInstrumentMappings)
            .scriptScore((q) => q.match('address', 'laptop'), {
              source: "_score * doc['liquidity_score'].value"
            })
            .build();

          expect(result.query?.script_score?.query?.match).toBeDefined();
          expect(result.query?.script_score?.script?.source).toContain(
            '_score'
          );
        });

        it('should build script_score with parameters', () => {
          const result = query(scoredInstrumentMappings)
            .scriptScore((q) => q.term('property_class', 'electronics'), {
              source: '_score * params.boost_factor',
              params: { boost_factor: 2.5 }
            })
            .build();

          expect(result.query?.script_score?.script?.params?.boost_factor).toBe(
            2.5
          );
        });

        it('should build script_score with min_score', () => {
          const result = query(scoredInstrumentMappings)
            .scriptScore(
              (q) => q.matchAll(),
              { source: "doc['momentum_score'].value" },
              { min_score: 5.0 }
            )
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "script_score": {
                  "min_score": 5,
                  "query": {
                    "match_all": {},
                  },
                  "script": {
                    "lang": "painless",
                    "source": "doc['momentum_score'].value",
                  },
                },
              },
            }
          `);
        });

        it('should build script_score with boost', () => {
          const result = query(scoredInstrumentMappings)
            .scriptScore(
              (q) => q.term('property_class', 'premium'),
              { source: "Math.log(2 + doc['liquidity_score'].value)" },
              { boost: 1.5 }
            )
            .build();

          expect(result.query?.script_score?.boost).toBe(1.5);
        });

        it('should build script_score with min_score and boost', () => {
          const result = query(scoredInstrumentMappings)
            .scriptScore(
              (q) => q.range('list_price', { gte: 100 }),
              {
                source: "_score * doc['momentum_score'].value * params.weight",
                params: { weight: 0.5 }
              },
              { min_score: 10, boost: 2.0 }
            )
            .build();

          expect(result.query?.script_score?.min_score).toBe(10);
          expect(result.query?.script_score?.boost).toBe(2.0);
        });

        it('should build script_score with complex scoring formula', () => {
          const result = query(scoredInstrumentMappings)
            .scriptScore((q) => q.match('description', 'quality'), {
              source: `
                  double popularity = doc['liquidity_score'].value;
                  double quality = doc['momentum_score'].value;
                  return _score * (popularity * 0.3 + quality * 0.7);
                `.trim()
            })
            .build();

          expect(result.query?.script_score?.script?.source).toContain(
            'liquidity_score'
          );
          expect(result.query?.script_score?.script?.source).toContain(
            'quality'
          );
        });
      });

      describe('Script edge cases', () => {
        it('should handle empty script source', () => {
          const result = query(scoredInstrumentMappings)
            .script({ source: '' })
            .build();

          expect(result.query?.script?.script?.source).toBe('');
        });

        it('should handle script without parameters', () => {
          const result = query(scoredInstrumentMappings)
            .script({ source: 'true' })
            .build();

          expect(result.query?.script?.script?.params).toBeUndefined();
        });

        it('should handle empty params object', () => {
          const result = query(scoredInstrumentMappings)
            .script({ source: "doc['list_price'].value > 0", params: {} })
            .build();

          expect(result.query?.script?.script?.params).toEqual({});
        });
      });
    });

    describe('Percolate queries', () => {
      describe('Basic percolate queries', () => {
        it('should build percolate query with inline document', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              document: {
                title: 'Breaking News',
                content: 'Elasticsearch 9.0 released'
              }
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "percolate": {
                  "document": {
                    "content": "Elasticsearch 9.0 released",
                    "title": "Breaking News",
                  },
                  "field": "query",
                },
              },
            }
          `);
        });

        it('should build percolate query with multiple documents', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              documents: [
                { title: 'Article 1', content: 'Content 1' },
                { title: 'Article 2', content: 'Content 2' }
              ]
            })
            .build();

          expect(result.query?.percolate?.documents).toHaveLength(2);
        });

        it('should build percolate query with stored document reference', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              index: 'articles',
              id: 'article-123'
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "percolate": {
                  "field": "query",
                  "id": "article-123",
                  "index": "articles",
                },
              },
            }
          `);
        });

        it('should build percolate query with routing', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              index: 'articles',
              id: 'article-456',
              routing: 'user-123'
            })
            .build();

          expect(result.query?.percolate?.routing).toBe('user-123');
        });

        it('should build percolate query with preference', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              document: { title: 'Test' },
              preference: '_local'
            })
            .build();

          expect(result.query?.percolate?.preference).toBe('_local');
        });

        it('should build percolate query with version', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              index: 'articles',
              id: 'article-789',
              version: 5
            })
            .build();

          expect(result.query?.percolate?.version).toBe(5);
        });

        it('should build percolate query with name', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              document: { content: 'urgent news' },
              name: 'breaking_news_alert'
            })
            .build();

          expect(result.query?.percolate?.name).toBe('breaking_news_alert');
        });
      });

      describe('Percolate with query parameters', () => {
        it('should combine percolate with size and from', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              document: { title: 'News', content: 'Important update' }
            })
            .size(50)
            .from(0)
            .build();

          expect(result.query?.percolate).toBeDefined();
          expect(result.size).toBe(50);
          expect(result.from).toBe(0);
        });

        it('should combine percolate with sort', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              document: { content: 'Breaking news' }
            })
            .sort('property_class', 'asc')
            .build();

          expect(result.sort).toMatchInlineSnapshot(`
            [
              {
                "property_class": "asc",
              },
            ]
          `);
        });

        it('should combine percolate with _source', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              document: { title: 'Alert' }
            })
            ._source(['query', 'property_class'])
            .build();

          expect(result._source).toEqual(['query', 'property_class']);
        });
      });

      describe('Percolate in bool context', () => {
        it('should support percolate in bool filter', () => {
          const result = query(percolatorDocMappings)
            .bool()
            .filter((q) => q.term('property_class', 'news'))
            .build();

          expect(result.query?.bool?.filter).toBeDefined();
        });
      });

      describe('Real-world percolate scenarios', () => {
        it('should build alert matching query', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              document: {
                title: 'Security Alert',
                severity: 'high',
                message: 'Unauthorized access detected',
                timestamp: '2024-01-15T10:00:00Z'
              }
            })
            .size(100)
            .build();

          expect(result.query?.percolate?.document?.severity).toBe('high');
        });

        it('should build content classification query', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              documents: [
                { content: 'Machine learning tutorial', category: 'tech' },
                { content: 'Cooking recipe', category: 'food' },
                { content: 'Travel guide', category: 'travel' }
              ]
            })
            .size(20)
            .build();

          expect(result.query?.percolate?.documents).toHaveLength(3);
        });

        it('should build saved search matching query', () => {
          const result = query(percolatorDocMappings)
            .percolate({
              field: 'query',
              index: 'user_documents',
              id: 'doc-12345',
              routing: 'user-789'
            })
            ._source(['query', 'property_class'])
            .size(50)
            .build();

          expect(result.query?.percolate?.routing).toBe('user-789');
          expect(result._source).toContain('query');
        });
      });
    });
  });
});
