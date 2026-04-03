import { queryBuilder, mappings, text, keyword, join } from '..';
import { instrumentMappings } from './fixtures/finance.schema.js';
import { listingDetailMappings } from './fixtures/real-estate.schema.js';
import { searchProductMappings } from './fixtures/ecommerce.schema.js';

const qaMapping = mappings({
  title: text(),
  body: text(),
  tag: keyword(),
  relation: join({ relations: { question: ['answer', 'comment'] } })
});

describe('QueryBuilder Extensions', () => {
  describe('Search parameters', () => {
    it('should build searchAfter', () => {
      const result = queryBuilder(instrumentMappings)
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
      const result = queryBuilder(instrumentMappings).matchAll().preference('session-abc-123').build();

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
      const result = queryBuilder(instrumentMappings).matchAll().collapse('sector').build();

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
      const result = queryBuilder(instrumentMappings)
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
      const result = queryBuilder(instrumentMappings)
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
      const result = queryBuilder(instrumentMappings)
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
      const result = queryBuilder(instrumentMappings).matchAll().storedFields(['_none_']).build();

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
      const result = queryBuilder(instrumentMappings).term('asset_class', 'equity').terminateAfter(1).build();

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
      const result = queryBuilder(instrumentMappings)
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
      const result = queryBuilder(instrumentMappings)
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
      const result = queryBuilder(listingDetailMappings)
        .combinedFields(['title', 'address'], 'technology company')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "combined_fields": {
              "fields": [
                "title",
                "address",
              ],
              "query": "technology company",
            },
          },
        }
      `);
    });

    it('should build combinedFields query with options', () => {
      const result = queryBuilder(listingDetailMappings)
        .combinedFields(['title', 'address'], 'tech', { operator: 'and' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "combined_fields": {
              "fields": [
                "title",
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
      const result = queryBuilder(instrumentMappings).queryString('name:Apple AND sector:technology').build();

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
      const result = queryBuilder(instrumentMappings).queryString('Apple OR Google', { default_field: 'name' }).build();

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
      const result = queryBuilder(instrumentMappings).simpleQueryString('"Apple Inc" +technology').build();

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
      const result = queryBuilder(instrumentMappings)
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
      const result = queryBuilder(instrumentMappings).moreLikeThis(['name'], 'Apple Inc technology company').build();

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
      const result = queryBuilder(instrumentMappings)
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
      const result = queryBuilder(instrumentMappings).matchBoolPrefix('name', 'Apple I').build();

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
      const result = queryBuilder(instrumentMappings)
        .matchBoolPrefix('name', 'Apple I', { analyzer: 'standard' })
        .build();

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
      const result = queryBuilder(instrumentMappings)
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

  describe('Specialized scoring queries', () => {
    describe('distanceFeature', () => {
      it('boosts relevance by proximity of a date field to an origin', () => {
        const result = queryBuilder(searchProductMappings)
          .distanceFeature('listed_at', { origin: 'now', pivot: '7d', boost: 2.0 })
          .build();

        expect(result.query).toMatchInlineSnapshot(`
          {
            "distance_feature": {
              "boost": 2,
              "field": "listed_at",
              "origin": "now",
              "pivot": "7d",
            },
          }
        `);
      });

      it('boosts relevance by proximity of a geo_point field to an origin', () => {
        const result = queryBuilder(searchProductMappings)
          .distanceFeature('store_location', { origin: { lat: 51.5, lon: -0.12 }, pivot: '10km' })
          .build();

        expect(result.query).toMatchInlineSnapshot(`
          {
            "distance_feature": {
              "field": "store_location",
              "origin": {
                "lat": 51.5,
                "lon": -0.12,
              },
              "pivot": "10km",
            },
          }
        `);
      });
    });

    describe('rankFeature', () => {
      it('boosts relevance using a rank_feature field with every function option', () => {
        const result = queryBuilder(searchProductMappings)
          .rankFeature('popularity', {
            boost: 1.5,
            saturation: { pivot: 8 },
            log: { scaling_factor: 4 },
            linear: {},
            sigmoid: { pivot: 7, exponent: 0.6 }
          })
          .build();

        expect(result.query).toMatchInlineSnapshot(`
          {
            "rank_feature": {
              "boost": 1.5,
              "field": "popularity",
              "linear": {},
              "log": {
                "scaling_factor": 4,
              },
              "saturation": {
                "pivot": 8,
              },
              "sigmoid": {
                "exponent": 0.6,
                "pivot": 7,
              },
            },
          }
        `);
      });

      it('supports rank_features fields', () => {
        const result = queryBuilder(searchProductMappings).rankFeature('category_scores').build();

        expect(result.query).toMatchInlineSnapshot(`
          {
            "rank_feature": {
              "field": "category_scores",
            },
          }
        `);
      });
    });

    describe('sparseVector', () => {
      it('supports ELSER inference form (inference_id + query)', () => {
        const result = queryBuilder(searchProductMappings)
          .sparseVector('ml_tokens', {
            inference_id: '.elser_model_2',
            query: 'how to make sourdough',
            prune: true,
            pruning_config: {
              tokens_freq_ratio_threshold: 5,
              tokens_weight_threshold: 0.4,
              only_score_pruned_tokens: false
            }
          })
          .build();

        expect(result.query).toMatchInlineSnapshot(`
          {
            "sparse_vector": {
              "field": "ml_tokens",
              "inference_id": ".elser_model_2",
              "prune": true,
              "pruning_config": {
                "only_score_pruned_tokens": false,
                "tokens_freq_ratio_threshold": 5,
                "tokens_weight_threshold": 0.4,
              },
              "query": "how to make sourdough",
            },
          }
        `);
      });

      it('supports precomputed query_vector form', () => {
        const result = queryBuilder(searchProductMappings)
          .sparseVector('ml_tokens', { query_vector: { sourdough: 0.9, bread: 0.7 } })
          .build();

        expect(result.query).toMatchInlineSnapshot(`
          {
            "sparse_vector": {
              "field": "ml_tokens",
              "query_vector": {
                "bread": 0.7,
                "sourdough": 0.9,
              },
            },
          }
        `);
      });
    });

    describe('knn with ELSER/inference options (existing KnnSearch passthrough)', () => {
      it('forwards query_vector_builder, inner_hits, rescore_vector, visit_percentage', () => {
        const result = queryBuilder(searchProductMappings)
          .knn('embedding', [0.1, 0.2, 0.3, 0.4], {
            k: 10,
            num_candidates: 100,
            query_vector_builder: { text_embedding: { model_id: 'my-model', model_text: 'shoes' } },
            inner_hits: { size: 3, name: 'knn_hits' },
            rescore_vector: { oversample: 2.0 },
            visit_percentage: 0.25
          })
          .build();

        expect(result.knn).toMatchInlineSnapshot(`
          {
            "field": "embedding",
            "inner_hits": {
              "name": "knn_hits",
              "size": 3,
            },
            "k": 10,
            "num_candidates": 100,
            "query_vector": [
              0.1,
              0.2,
              0.3,
              0.4,
            ],
            "query_vector_builder": {
              "text_embedding": {
                "model_id": "my-model",
                "model_text": "shoes",
              },
            },
            "rescore_vector": {
              "oversample": 2,
            },
            "visit_percentage": 0.25,
          }
        `);
      });
    });

    describe('field constraints (type ratchet)', () => {
      it('distanceFeature accepts date and geo_point fields', () => {
        expect(
          queryBuilder(searchProductMappings).distanceFeature('listed_at', { origin: 'now', pivot: '1d' }).build()
        ).toBeDefined();

        expect(
          queryBuilder(searchProductMappings)
            .distanceFeature('store_location', { origin: { lat: 0, lon: 0 }, pivot: '1km' })
            .build()
        ).toBeDefined();
      });

      it('distanceFeature rejects non-date, non-geo fields', () => {
        expect(() =>
          // @ts-expect-error name is text, not valid for distance_feature
          queryBuilder(searchProductMappings).distanceFeature('name', { origin: 'now', pivot: '1d' }).build()
        ).toBeDefined();
      });

      it('rankFeature rejects non-rank-feature fields', () => {
        // @ts-expect-error slug is keyword, not rank_feature/rank_features
        expect(() => queryBuilder(searchProductMappings).rankFeature('slug').build()).toBeDefined();
      });

      it('sparseVector rejects non-sparse-vector fields', () => {
        expect(() =>
          // @ts-expect-error embedding is dense_vector, not sparse_vector
          queryBuilder(searchProductMappings).sparseVector('embedding', { query_vector: {} }).build()
        ).toBeDefined();
      });

      it('knn accepts dense_vector fields', () => {
        expect(
          queryBuilder(searchProductMappings)
            .knn('embedding', [0.1, 0.2, 0.3, 0.4], { k: 5, num_candidates: 50 })
            .build()
        ).toBeDefined();
      });

      it('knn rejects non-dense-vector fields', () => {
        expect(() =>
          queryBuilder(searchProductMappings)
            // @ts-expect-error name is text, not dense_vector
            .knn('name', [0.1, 0.2, 0.3, 0.4], { k: 5, num_candidates: 50 })
            .build()
        ).toBeDefined();
        expect(() =>
          queryBuilder(searchProductMappings)
            // @ts-expect-error ml_tokens is sparse_vector, .knn() is dense-only
            .knn('ml_tokens', [0.1, 0.2, 0.3, 0.4], { k: 5, num_candidates: 50 })
            .build()
        ).toBeDefined();
      });
    });
  });

  describe('Search response shaping', () => {
    it('composes runtime_mappings, docvalue_fields, fields, post_filter, script_fields and _source include/exclude', () => {
      const result = queryBuilder(listingDetailMappings)
        .match('title', 'real estate')
        .runtimeMappings({
          day_of_week: {
            type: 'keyword',
            script: { source: "emit(doc['listed_date'].value.dayOfWeekEnum.toString())" }
          }
        })
        .docValueFields([{ field: 'listed_date', format: 'epoch_millis' }, 'property_class'])
        .fields([{ field: 'listed_date', format: 'yyyy-MM-dd' }, 'title'])
        .postFilter((q) => q.term('property_class', 'residential'))
        .scriptFields({
          price_per_sqft: { script: { source: "doc['list_price'].value / doc['sqft'].value", lang: 'painless' } }
        })
        .sourceIncludes(['title', 'property_class'])
        .sourceExcludes(['embedding'])
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "_source_excludes": [
            "embedding",
          ],
          "_source_includes": [
            "title",
            "property_class",
          ],
          "docvalue_fields": [
            {
              "field": "listed_date",
              "format": "epoch_millis",
            },
            "property_class",
          ],
          "fields": [
            {
              "field": "listed_date",
              "format": "yyyy-MM-dd",
            },
            "title",
          ],
          "post_filter": {
            "term": {
              "property_class": "residential",
            },
          },
          "query": {
            "match": {
              "title": "real estate",
            },
          },
          "runtime_mappings": {
            "day_of_week": {
              "script": {
                "source": "emit(doc['listed_date'].value.dayOfWeekEnum.toString())",
              },
              "type": "keyword",
            },
          },
          "script_fields": {
            "price_per_sqft": {
              "script": {
                "lang": "painless",
                "source": "doc['list_price'].value / doc['sqft'].value",
              },
            },
          },
        }
      `);
    });

    it('postFilter constrains field access to the mapping schema', () => {
      expect(
        queryBuilder(listingDetailMappings)
          .matchAll()
          // @ts-expect-error nope_field is not on the mapping
          .postFilter((q) => q.term('nope_field', 'x'))
          .build()
      ).toBeDefined();
    });

    it('postFilter is a no-op when callback returns undefined', () => {
      const result = queryBuilder(listingDetailMappings)
        .matchAll()
        .postFilter(() => undefined)
        .build();

      expect(result.post_filter).toBeUndefined();
    });
  });

  describe('function_score query', () => {
    it('wraps an inner query with scoring functions', () => {
      const result = queryBuilder(instrumentMappings)
        .functionScore((q) => q.matchAll(), {
          functions: [
            { filter: { term: { sector: 'tech' } }, weight: 2 },
            { random_score: { seed: 42, field: '_seq_no' } }
          ],
          score_mode: 'sum',
          boost_mode: 'replace',
          max_boost: 10
        })
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "function_score": {
            "boost_mode": "replace",
            "functions": [
              {
                "filter": {
                  "term": {
                    "sector": "tech",
                  },
                },
                "weight": 2,
              },
              {
                "random_score": {
                  "field": "_seq_no",
                  "seed": 42,
                },
              },
            ],
            "max_boost": 10,
            "query": {
              "match_all": {},
            },
            "score_mode": "sum",
          },
        }
      `);
    });

    it('defaults inner query to match_all when callback returns undefined', () => {
      const result = queryBuilder(instrumentMappings)
        .functionScore(() => undefined, { functions: [{ weight: 5 }] })
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "function_score": {
            "functions": [
              {
                "weight": 5,
              },
            ],
            "query": {
              "match_all": {},
            },
          },
        }
      `);
    });

    it('works inside a bool clause context', () => {
      const result = queryBuilder(instrumentMappings)
        .bool()
        .must((q) =>
          q.functionScore((inner) => inner.match('name', 'apple'), {
            functions: [{ random_score: {} }],
            boost_mode: 'multiply'
          })
        )
        .build();

      expect(result.query!.bool!.must).toMatchInlineSnapshot(`
        [
          {
            "function_score": {
              "boost_mode": "multiply",
              "functions": [
                {
                  "random_score": {},
                },
              ],
              "query": {
                "match": {
                  "name": "apple",
                },
              },
            },
          },
        ]
      `);
    });

    it('chains with other builder methods', () => {
      const result = queryBuilder(instrumentMappings)
        .functionScore((q) => q.match('name', 'test'), { boost_mode: 'replace' })
        .size(10)
        .sort('listed_date', 'desc')
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "function_score": {
            "boost_mode": "replace",
            "query": {
              "match": {
                "name": "test",
              },
            },
          },
        }
      `);

      expect(result.size).toBe(10);
    });
  });

  describe('has_child / has_parent / parent_id queries', () => {
    it('hasChild builds correct DSL', () => {
      const result = queryBuilder(qaMapping)
        .hasChild('answer', (q) => q.match('body', 'elasticsearch'), {
          min_children: 1,
          max_children: 10,
          score_mode: 'max'
        })
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "has_child": {
            "max_children": 10,
            "min_children": 1,
            "query": {
              "match": {
                "body": "elasticsearch",
              },
            },
            "score_mode": "max",
            "type": "answer",
          },
        }
      `);
    });

    it('hasParent builds correct DSL', () => {
      const result = queryBuilder(qaMapping)
        .hasParent('question', (q) => q.match('title', 'elasticsearch'), {
          score: true
        })
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "has_parent": {
            "parent_type": "question",
            "query": {
              "match": {
                "title": "elasticsearch",
              },
            },
            "score": true,
          },
        }
      `);
    });

    it('parentId builds correct DSL', () => {
      const result = queryBuilder(qaMapping).parentId('answer', '42', { ignore_unmapped: true }).build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "parent_id": {
            "id": "42",
            "ignore_unmapped": true,
            "type": "answer",
          },
        }
      `);
    });

    it('hasParent defaults inner query to match_all', () => {
      const result = queryBuilder(qaMapping)
        .hasParent('question', () => undefined)
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "has_parent": {
            "parent_type": "question",
            "query": {
              "match_all": {},
            },
          },
        }
      `);
    });

    it('hasChild defaults inner query to match_all', () => {
      const result = queryBuilder(qaMapping)
        .hasChild('answer', () => undefined)
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "has_child": {
            "query": {
              "match_all": {},
            },
            "type": "answer",
          },
        }
      `);
    });

    it('hasChild works inside bool clause context', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) => q.hasChild('answer', (inner) => inner.match('body', 'search')))
        .filter((q) => q.term('tag', 'elastic'))
        .build();

      expect(result.query!.bool!.must).toMatchInlineSnapshot(`
        [
          {
            "has_child": {
              "query": {
                "match": {
                  "body": "search",
                },
              },
              "type": "answer",
            },
          },
        ]
      `);
    });

    it('hasParent works inside bool clause context', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) => q.hasParent('question', (inner) => inner.match('title', 'elasticsearch')))
        .build();

      expect(result.query!.bool!.must).toMatchInlineSnapshot(`
        [
          {
            "has_parent": {
              "parent_type": "question",
              "query": {
                "match": {
                  "title": "elasticsearch",
                },
              },
            },
          },
        ]
      `);
    });

    it('functionScore defaults to match_all inside bool clause', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) => q.functionScore(() => undefined, { boost_mode: 'replace' }))
        .build();

      expect(result.query!.bool!.must).toMatchInlineSnapshot(`
        [
          {
            "function_score": {
              "boost_mode": "replace",
              "query": {
                "match_all": {},
              },
            },
          },
        ]
      `);
    });

    it('hasChild defaults to match_all inside bool clause', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) => q.hasChild('answer', () => undefined))
        .build();

      expect(result.query!.bool!.must).toMatchInlineSnapshot(`
        [
          {
            "has_child": {
              "query": {
                "match_all": {},
              },
              "type": "answer",
            },
          },
        ]
      `);
    });

    it('hasParent defaults to match_all inside bool clause', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) => q.hasParent('question', () => undefined))
        .build();

      expect(result.query!.bool!.must).toMatchInlineSnapshot(`
        [
          {
            "has_parent": {
              "parent_type": "question",
              "query": {
                "match_all": {},
              },
            },
          },
        ]
      `);
    });

    it('parentId works inside bool clause context', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .filter((q) => q.parentId('answer', '99'))
        .build();

      expect(result.query!.bool!.filter).toMatchInlineSnapshot(`
        [
          {
            "parent_id": {
              "id": "99",
              "type": "answer",
            },
          },
        ]
      `);
    });

    it('chains with other builder methods', () => {
      const result = queryBuilder(qaMapping)
        .hasChild('answer', (q) => q.matchAll())
        .size(5)
        .sort('tag', 'asc')
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "has_child": {
            "query": {
              "match_all": {},
            },
            "type": "answer",
          },
        }
      `);

      expect(result.size).toBe(5);
    });
  });

  describe('Intervals query (ClauseBuilder context)', () => {
    it('intervals inside bool filter', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .filter((q) => q.intervals('title', { match: { query: 'hot water', ordered: true } }))
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "bool": {
            "filter": [
              {
                "intervals": {
                  "title": {
                    "match": {
                      "ordered": true,
                      "query": "hot water",
                    },
                  },
                },
              },
            ],
          },
        }
      `);
    });
  });

  describe('Span queries (ClauseBuilder context)', () => {
    it('spanTerm inside bool must', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) => q.spanTerm('title', 'quick'))
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "bool": {
            "must": [
              {
                "span_term": {
                  "title": {
                    "value": "quick",
                  },
                },
              },
            ],
          },
        }
      `);
    });

    it('spanOr inside bool should', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .should((q) => q.spanOr([q.spanTerm('title', 'quick'), q.spanTerm('title', 'fast')]))
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "bool": {
            "should": [
              {
                "span_or": {
                  "clauses": [
                    {
                      "span_term": {
                        "title": {
                          "value": "quick",
                        },
                      },
                    },
                    {
                      "span_term": {
                        "title": {
                          "value": "fast",
                        },
                      },
                    },
                  ],
                },
              },
            ],
          },
        }
      `);
    });

    it('spanNot inside bool mustNot', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .mustNot((q) => q.spanNot(q.spanTerm('title', 'quick'), q.spanTerm('title', 'lazy')))
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "bool": {
            "must_not": [
              {
                "span_not": {
                  "exclude": {
                    "span_term": {
                      "title": {
                        "value": "lazy",
                      },
                    },
                  },
                  "include": {
                    "span_term": {
                      "title": {
                        "value": "quick",
                      },
                    },
                  },
                },
              },
            ],
          },
        }
      `);
    });

    it('spanFirst inside bool filter', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .filter((q) => q.spanFirst(q.spanTerm('title', 'quick'), 3))
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "bool": {
            "filter": [
              {
                "span_first": {
                  "end": 3,
                  "match": {
                    "span_term": {
                      "title": {
                        "value": "quick",
                      },
                    },
                  },
                },
              },
            ],
          },
        }
      `);
    });

    it('spanContaining inside bool must', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) =>
          q.spanContaining(
            q.spanNear([q.spanTerm('title', 'quick'), q.spanTerm('title', 'fox')], { slop: 5, in_order: false }),
            q.spanTerm('title', 'brown')
          )
        )
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "bool": {
            "must": [
              {
                "span_containing": {
                  "big": {
                    "span_near": {
                      "clauses": [
                        {
                          "span_term": {
                            "title": {
                              "value": "quick",
                            },
                          },
                        },
                        {
                          "span_term": {
                            "title": {
                              "value": "fox",
                            },
                          },
                        },
                      ],
                      "in_order": false,
                      "slop": 5,
                    },
                  },
                  "little": {
                    "span_term": {
                      "title": {
                        "value": "brown",
                      },
                    },
                  },
                },
              },
            ],
          },
        }
      `);
    });

    it('spanWithin inside bool must', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) =>
          q.spanWithin(
            q.spanNear([q.spanTerm('title', 'quick'), q.spanTerm('title', 'fox')], { slop: 5, in_order: false }),
            q.spanTerm('title', 'brown')
          )
        )
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "bool": {
            "must": [
              {
                "span_within": {
                  "big": {
                    "span_near": {
                      "clauses": [
                        {
                          "span_term": {
                            "title": {
                              "value": "quick",
                            },
                          },
                        },
                        {
                          "span_term": {
                            "title": {
                              "value": "fox",
                            },
                          },
                        },
                      ],
                      "in_order": false,
                      "slop": 5,
                    },
                  },
                  "little": {
                    "span_term": {
                      "title": {
                        "value": "brown",
                      },
                    },
                  },
                },
              },
            ],
          },
        }
      `);
    });

    it('spanMultiTerm inside bool must', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) => q.spanMultiTerm({ prefix: { title: { value: 'qui' } } }))
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "bool": {
            "must": [
              {
                "span_multi": {
                  "match": {
                    "prefix": {
                      "title": {
                        "value": "qui",
                      },
                    },
                  },
                },
              },
            ],
          },
        }
      `);
    });

    it('spanFieldMasking inside bool must', () => {
      const result = queryBuilder(qaMapping)
        .bool()
        .must((q) => q.spanFieldMasking('body', q.spanTerm('title', 'quick')))
        .build();

      expect(result.query).toMatchInlineSnapshot(`
        {
          "bool": {
            "must": [
              {
                "span_field_masking": {
                  "field": "body",
                  "query": {
                    "span_term": {
                      "title": {
                        "value": "quick",
                      },
                    },
                  },
                },
              },
            ],
          },
        }
      `);
    });
  });
});
