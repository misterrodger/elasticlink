import { query } from '..';
import { instrumentMappings, scoredInstrumentMappings } from './fixtures/finance';

describe('QueryBuilder Extensions', () => {
  describe('Search parameters', () => {
    it('should build searchAfter', () => {
      const result = query(instrumentMappings)
        .sort('listed_date', 'desc')
        .size(10)
        .searchAfter(['2004-08-19', 'US38259P5089'])
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "search_after": [
            "2004-08-19",
            "US38259P5089",
          ],
          "size": 10,
          "sort": [
            {
              "listed_date": "desc",
            },
          ],
        }
      `);
    });

    it('should build preference', () => {
      const result = query(instrumentMappings).matchAll().preference('session-abc-123').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "preference": "session-abc-123",
          "query": {
            "match_all": {},
          },
        }
      `);
    });

    it('should build collapse with field only', () => {
      const result = query(instrumentMappings).matchAll().collapse('sector').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "collapse": {
            "field": "sector",
          },
          "query": {
            "match_all": {},
          },
        }
      `);
    });

    it('should build collapse with options', () => {
      const result = query(instrumentMappings)
        .matchAll()
        .collapse('sector', {
          inner_hits: { name: 'by_sector', size: 3 },
          max_concurrent_group_searches: 4
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "collapse": {
            "field": "sector",
            "inner_hits": {
              "name": "by_sector",
              "size": 3,
            },
            "max_concurrent_group_searches": 4,
          },
          "query": {
            "match_all": {},
          },
        }
      `);
    });

    it('should build rescore', () => {
      const result = query(instrumentMappings)
        .match('name', 'Apple')
        .rescore((q) => q.matchPhrase('name', 'Apple Inc'), 100, {
          rescore_query_weight: 2,
          score_mode: 'multiply'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "name": "Apple",
            },
          },
          "rescore": {
            "query": {
              "rescore_query": {
                "match_phrase": {
                  "name": "Apple Inc",
                },
              },
              "rescore_query_weight": 2,
              "score_mode": "multiply",
            },
            "window_size": 100,
          },
        }
      `);
    });

    it('should build rescore with minimal options', () => {
      const result = query(instrumentMappings)
        .matchAll()
        .rescore((q) => q.match('name', 'tech'), 50)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match_all": {},
          },
          "rescore": {
            "query": {
              "rescore_query": {
                "match": {
                  "name": "tech",
                },
              },
            },
            "window_size": 50,
          },
        }
      `);
    });

    it('should build storedFields', () => {
      const result = query(instrumentMappings).matchAll().storedFields(['_none_']).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match_all": {},
          },
          "stored_fields": [
            "_none_",
          ],
        }
      `);
    });

    it('should build terminateAfter', () => {
      const result = query(instrumentMappings).term('asset_class', 'equity').terminateAfter(1).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "term": {
              "asset_class": "equity",
            },
          },
          "terminate_after": 1,
        }
      `);
    });

    it('should build indicesBoost', () => {
      const result = query(instrumentMappings)
        .matchAll()
        .indicesBoost([{ 'instruments-2024': 1.5 }, { 'instruments-2023': 1.0 }])
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "indices_boost": [
            {
              "instruments-2024": 1.5,
            },
            {
              "instruments-2023": 1,
            },
          ],
          "query": {
            "match_all": {},
          },
        }
      `);
    });

    it('should chain multiple search parameters', () => {
      const result = query(instrumentMappings)
        .match('name', 'Apple')
        .sort('listed_date', 'desc')
        .size(10)
        .searchAfter(['2004-08-19'])
        .preference('session-123')
        .trackTotalHits(false)
        .terminateAfter(100)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "preference": "session-123",
          "query": {
            "match": {
              "name": "Apple",
            },
          },
          "search_after": [
            "2004-08-19",
          ],
          "size": 10,
          "sort": [
            {
              "listed_date": "desc",
            },
          ],
          "terminate_after": 100,
          "track_total_hits": false,
        }
      `);
    });
  });

  describe('New query types', () => {
    it('should build combinedFields query', () => {
      const result = query(scoredInstrumentMappings).combinedFields(['name', 'address'], 'technology company').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "combined_fields": {
              "fields": [
                "name",
                "address",
              ],
              "query": "technology company",
            },
          },
        }
      `);
    });

    it('should build combinedFields query with options', () => {
      const result = query(scoredInstrumentMappings)
        .combinedFields(['name', 'address'], 'tech', { operator: 'and' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "combined_fields": {
              "fields": [
                "name",
                "address",
              ],
              "operator": "and",
              "query": "tech",
            },
          },
        }
      `);
    });

    it('should build queryString query', () => {
      const result = query(instrumentMappings).queryString('name:Apple AND sector:technology').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "query_string": {
              "query": "name:Apple AND sector:technology",
            },
          },
        }
      `);
    });

    it('should build queryString query with options', () => {
      const result = query(instrumentMappings).queryString('Apple OR Google', { default_field: 'name' }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "query_string": {
              "default_field": "name",
              "query": "Apple OR Google",
            },
          },
        }
      `);
    });

    it('should build simpleQueryString query', () => {
      const result = query(instrumentMappings).simpleQueryString('"Apple Inc" +technology').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "simple_query_string": {
              "query": ""Apple Inc" +technology",
            },
          },
        }
      `);
    });

    it('should build simpleQueryString query with options', () => {
      const result = query(instrumentMappings)
        .simpleQueryString('Apple Google', {
          fields: ['name'],
          default_operator: 'and'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "simple_query_string": {
              "default_operator": "and",
              "fields": [
                "name",
              ],
              "query": "Apple Google",
            },
          },
        }
      `);
    });

    it('should build moreLikeThis query with text', () => {
      const result = query(instrumentMappings).moreLikeThis(['name'], 'Apple Inc technology company').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "more_like_this": {
              "fields": [
                "name",
              ],
              "like": [
                "Apple Inc technology company",
              ],
            },
          },
        }
      `);
    });

    it('should build moreLikeThis query with doc reference', () => {
      const result = query(instrumentMappings)
        .moreLikeThis(['name'], [{ _index: 'instruments', _id: '1' }], {
          min_term_freq: 1,
          max_query_terms: 12
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "more_like_this": {
              "fields": [
                "name",
              ],
              "like": [
                {
                  "_id": "1",
                  "_index": "instruments",
                },
              ],
              "max_query_terms": 12,
              "min_term_freq": 1,
            },
          },
        }
      `);
    });

    it('should build matchBoolPrefix query', () => {
      const result = query(instrumentMappings).matchBoolPrefix('name', 'Apple I').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match_bool_prefix": {
              "name": "Apple I",
            },
          },
        }
      `);
    });

    it('should build matchBoolPrefix query with options', () => {
      const result = query(instrumentMappings).matchBoolPrefix('name', 'Apple I', { analyzer: 'standard' }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match_bool_prefix": {
              "name": {
                "analyzer": "standard",
                "query": "Apple I",
              },
            },
          },
        }
      `);
    });

    it('should use new query types inside bool clauses', () => {
      const result = query(instrumentMappings)
        .bool()
        .must((q) => q.simpleQueryString('Apple'))
        .must((q) => q.combinedFields(['name'], 'tech'))
        .must((q) => q.queryString('name:Apple'))
        .must((q) => q.moreLikeThis(['name'], 'Apple Inc'))
        .filter((q) => q.term('asset_class', 'equity'))
        .should((q) => q.matchBoolPrefix('name', 'App'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "filter": [
                {
                  "term": {
                    "asset_class": "equity",
                  },
                },
              ],
              "must": [
                {
                  "simple_query_string": {
                    "query": "Apple",
                  },
                },
                {
                  "combined_fields": {
                    "fields": [
                      "name",
                    ],
                    "query": "tech",
                  },
                },
                {
                  "query_string": {
                    "query": "name:Apple",
                  },
                },
                {
                  "more_like_this": {
                    "fields": [
                      "name",
                    ],
                    "like": [
                      "Apple Inc",
                    ],
                  },
                },
              ],
              "should": [
                {
                  "match_bool_prefix": {
                    "name": "App",
                  },
                },
              ],
            },
          },
        }
      `);
    });
  });
});
