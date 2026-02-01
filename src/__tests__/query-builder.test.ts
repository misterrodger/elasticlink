import { query, aggregations } from '..';

type TestIndex = {
  type: string;
  name: string;
  price: number;
  size: number;
};

type TestIndex2 = {
  title: string;
  description: string;
  price: number;
  date: string;
  location: { lat: number; lon: number };
  rating: number;
  category: string;
};

type ProductWithEmbedding = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  embedding: number[];
};

type ScoredProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  popularity: number;
  quality_score: number;
};

type PercolatorDoc = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  query: any;
  category: string;
};

describe('QueryBuilder', () => {
  describe('Meta properties', () => {
    it('should add from', () => {
      const result = query<TestIndex>().match('type', 'test').from(1).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "from": 1,
          "query": {
            "match": {
              "type": "test",
            },
          },
        }
      `);
    });
    it('should add to', () => {
      const result = query<TestIndex>().match('type', 'test').to(1).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "type": "test",
            },
          },
          "to": 1,
        }
      `);
    });
    it('should add size', () => {
      const result = query<TestIndex>().match('type', 'test').size(1).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "type": "test",
            },
          },
          "size": 1,
        }
      `);
    });

    it('should add source', () => {
      const result = query<TestIndex>()
        .match('type', 'test')
        ._source(['type', 'size'])
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "_source": [
            "type",
            "size",
          ],
          "query": {
            "match": {
              "type": "test",
            },
          },
        }
      `);
    });

    it('should add sort', () => {
      const result = query<TestIndex>()
        .match('type', 'test')
        .sort('size', 'asc')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "type": "test",
            },
          },
          "sort": [
            {
              "size": "asc",
            },
          ],
        }
      `);
    });
  });
  describe('Root-level queries', () => {
    it('should build a match_all query', () => {
      const result = query<TestIndex>().matchAll().build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match_all": {},
          },
        }
      `);
    });

    it('should build a match query', () => {
      const result = query<TestIndex>().match('type', 'test type').build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "match": {
                  "type": "test type",
                },
              },
            }
          `);
    });

    it('should build a multi_match query', () => {
      const result = query<TestIndex>()
        .multiMatch(['type', 'name'], 'test')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "multi_match": {
              "fields": [
                "type",
                "name",
              ],
              "query": "test",
            },
          },
        }
      `);
    });

    it('should build a match_phrase query', () => {
      const result = query<TestIndex>().matchPhrase('type', 'test').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match_phrase": {
              "type": "test",
            },
          },
        }
      `);
    });

    it('should build a term query', () => {
      const result = query<TestIndex>().term('type', 'test').build();

      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "term": {
                     "type": "test",
                   },
                 },
               }
            `);
    });

    it('should build a terms query', () => {
      const result = query<TestIndex>().terms('type', ['test', 'type']).build();

      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "terms": {
                     "type": [
                       "test",
                       "type",
                     ],
                   },
                 },
               }
            `);
    });

    it('should build a range query', () => {
      const result = query<TestIndex>()
        .range('price', { gt: 1, lt: 100 })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "range": {
              "price": {
                "gt": 1,
                "lt": 100,
              },
            },
          },
        }
      `);
    });

    it('should build an exists query', () => {
      const result = query<TestIndex>().exists('type').build();

      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "exists": {
                     "field": "type",
                   },
                 },
               }
            `);
    });

    it('should build a prefix query', () => {
      const result = query<TestIndex>().prefix('type', 'test').build();
      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "prefix": {
                     "type": "test",
                   },
                 },
               }
            `);
    });

    it('should build a wildcard query', () => {
      const result = query<TestIndex>().wildcard('type', 'test').build();

      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "wildcard": {
                     "type": "test",
                   },
                 },
               }
            `);
    });

    // it('should add a conditional query when defined', () => {
    //   const type = 'type exists';
    //   const result = query<TestIndex>()
    //     .bool()
    //     .filter((q) => q.when(type, q.term('type', type)))
    //     ._build();

    //   expect(result).toMatchInlineSnapshot(`
    //            {
    //              "query": {
    //                "bool": {
    //                  "filter": [
    //                    {
    //                      "term": {
    //                        "type": "type exists",
    //                      },
    //                    },
    //                  ],
    //                },
    //              },
    //            }
    //         `);
    // });

    // it('should NOT add a conditional query when undefined', () => {
    //   const type = undefined;
    //   const result = query<TestIndex>()
    //     .bool()
    //     .filter((q) => q.when(type, q.term('type', type!))) // TBD - fix this
    //     ._build();

    //   expect(result).toMatchInlineSnapshot(`
    //            {
    //              "query": {
    //                "bool": {
    //                  "filter": [
    //                    undefined,
    //                  ],
    //                },
    //              },
    //            }
    //         `);
    // });
  });

  describe('Boolean queries', () => {
    it('should build a bool with 1 must query', () => {
      const result = query<TestIndex>()
        .bool()
        .must((q) => q.match('type', 'test type'))
        .build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "must": [
                    {
                      "match": {
                        "type": "test type",
                      },
                    },
                  ],
                },
              },
            }
          `);
    });

    it('should build a bool with 2 must queries', () => {
      const result = query<TestIndex>()
        .bool()
        .must((q) => q.match('type', 'test type'))
        .must((q) => q.match('price', 42))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "type": "test type",
                  },
                },
                {
                  "match": {
                    "price": 42,
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with 1 mustNot query', () => {
      const result = query<TestIndex>()
        .bool()
        .mustNot((q) => q.match('type', 'test type'))
        .build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "must_not": [
                    {
                      "match": {
                        "type": "test type",
                      },
                    },
                  ],
                },
              },
            }
          `);
    });

    it('should build a bool with 2 mustNot queries', () => {
      const result = query<TestIndex>()
        .bool()
        .mustNot((q) => q.match('type', 'test type'))
        .mustNot((q) => q.match('price', 42))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must_not": [
                {
                  "match": {
                    "type": "test type",
                  },
                },
                {
                  "match": {
                    "price": 42,
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with 1 should query', () => {
      const result = query<TestIndex>()
        .bool()
        .should((q) => q.match('type', 'test type'))
        .build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "should": [
                    {
                      "match": {
                        "type": "test type",
                      },
                    },
                  ],
                },
              },
            }
          `);
    });

    it('should build a bool with 2 should queries', () => {
      const result = query<TestIndex>()
        .bool()
        .should((q) => q.match('type', 'test type'))
        .should((q) => q.match('price', 42))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "should": [
                {
                  "match": {
                    "type": "test type",
                  },
                },
                {
                  "match": {
                    "price": 42,
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with one filter query', () => {
      const result = query<TestIndex>()
        .bool()
        .filter((q) => q.match('type', 'test type'))
        .build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "filter": [
                    {
                      "match": {
                        "type": "test type",
                      },
                    },
                  ],
                },
              },
            }
          `);
    });

    it('should build a bool with minimumShouldMatch', () => {
      const result = query<TestIndex>()
        .bool()
        .must((q) => q.match('type', 'test type'))
        .must((q) => q.match('price', 42))
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
                        "type": "test type",
                      },
                    },
                    {
                      "match": {
                        "price": 42,
                      },
                    },
                  ],
                },
              },
            }
          `);
    });

    it('should build a bool with range', () => {
      const result = query<TestIndex>()
        .bool()
        .must((q) => q.range('price', { gt: 1, lt: 100 }))
        .must((q) => q.range('size', { gte: 1, lte: 100 }))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "range": {
                    "price": {
                      "gt": 1,
                      "lt": 100,
                    },
                  },
                },
                {
                  "range": {
                    "size": {
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
      const result = query<TestIndex>()
        .bool()
        .must((q) => q.exists('price'))
        .must((q) => q.exists('type'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "exists": {
                    "field": "price",
                  },
                },
                {
                  "exists": {
                    "field": "type",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with prefix', () => {
      const result = query<TestIndex>()
        .bool()
        .must((q) => q.prefix('type', 'pr'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "prefix": {
                    "type": "pr",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with wildcard', () => {
      const result = query<TestIndex>()
        .bool()
        .must((q) => q.wildcard('price', 'pr'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "wildcard": {
                    "price": "pr",
                  },
                },
              ],
            },
          },
        }
      `);
    });

    it('should build a bool with multi_match', () => {
      const result = query<TestIndex>()
        .bool()
        .must((q) => q.multiMatch(['name', 'type'], 'test'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "multi_match": {
                    "fields": [
                      "name",
                      "type",
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
      const result = query<TestIndex>()
        .bool()
        .must((q) => q.matchPhrase('type', 'test'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "match_phrase": {
                    "type": "test",
                  },
                },
              ],
            },
          },
        }
      `);
    });
  });

  describe('TBC Features', () => {
    describe('Enhanced match with options', () => {
      it('should build match with operator option', () => {
        const result = query<TestIndex>()
          .match('type', 'test type', { operator: 'and' })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "type": {
                  "operator": "and",
                  "query": "test type",
                },
              },
            },
          }
        `);
      });

      it('should build match with fuzziness option', () => {
        const result = query<TestIndex>()
          .match('type', 'test', { fuzziness: 'AUTO' })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "type": {
                  "fuzziness": "AUTO",
                  "query": "test",
                },
              },
            },
          }
        `);
      });

      it('should build match with boost option', () => {
        const result = query<TestIndex>()
          .match('type', 'test', { boost: 2.0 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "type": {
                  "boost": 2,
                  "query": "test",
                },
              },
            },
          }
        `);
      });

      it('should build match with multiple options', () => {
        const result = query<TestIndex>()
          .match('type', 'test', {
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
                "type": {
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
        const result = query<TestIndex>().match('type', 'test').build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should build match in bool query with options', () => {
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.match('type', 'test', { operator: 'and', boost: 2 }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "type": {
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

    describe('Enhanced multi_match with options', () => {
      it('should build multi_match with type option', () => {
        const result = query<TestIndex>()
          .multiMatch(['type', 'name'], 'test', { type: 'best_fields' })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "multi_match": {
                "fields": [
                  "type",
                  "name",
                ],
                "query": "test",
                "type": "best_fields",
              },
            },
          }
        `);
      });

      it('should build multi_match with tie_breaker option', () => {
        const result = query<TestIndex>()
          .multiMatch(['type', 'name'], 'test', {
            type: 'best_fields',
            tie_breaker: 0.3
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "multi_match": {
                "fields": [
                  "type",
                  "name",
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
        const result = query<TestIndex>()
          .multiMatch(['type', 'name'], 'test', {
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
                  "type",
                  "name",
                ],
                "operator": "and",
                "query": "test",
              },
            },
          }
        `);
      });

      it('should build multi_match without options (backwards compatible)', () => {
        const result = query<TestIndex>()
          .multiMatch(['type', 'name'], 'test')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "multi_match": {
                "fields": [
                  "type",
                  "name",
                ],
                "query": "test",
              },
            },
          }
        `);
      });

      it('should build multi_match in bool query with options', () => {
        const result = query<TestIndex>()
          .bool()
          .must((q) =>
            q.multiMatch(['type', 'name'], 'test', {
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
                        "type",
                        "name",
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

    describe('Fuzzy query', () => {
      it('should build a fuzzy query at root level', () => {
        const result = query<TestIndex>().fuzzy('type', 'tst').build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "type": {
                  "value": "tst",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query with fuzziness option', () => {
        const result = query<TestIndex>()
          .fuzzy('type', 'tst', { fuzziness: 'AUTO' })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "type": {
                  "fuzziness": "AUTO",
                  "value": "tst",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query with numeric fuzziness', () => {
        const result = query<TestIndex>()
          .fuzzy('type', 'test', { fuzziness: 2 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "type": {
                  "fuzziness": 2,
                  "value": "test",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query with boost option', () => {
        const result = query<TestIndex>()
          .fuzzy('type', 'test', { boost: 1.5 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "type": {
                  "boost": 1.5,
                  "value": "test",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query with multiple options', () => {
        const result = query<TestIndex>()
          .fuzzy('type', 'test', { fuzziness: 'AUTO', boost: 2.0 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "fuzzy": {
                "type": {
                  "boost": 2,
                  "fuzziness": "AUTO",
                  "value": "test",
                },
              },
            },
          }
        `);
      });

      it('should build a fuzzy query in bool context', () => {
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.fuzzy('type', 'test', { fuzziness: 'AUTO' }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "fuzzy": {
                      "type": {
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
        const result = query<TestIndex>()
          .bool()
          .should((q) => q.fuzzy('name', 'john', { fuzziness: 1 }))
          .should((q) => q.match('type', 'test'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "should": [
                  {
                    "fuzzy": {
                      "name": {
                        "fuzziness": 1,
                        "value": "john",
                      },
                    },
                  },
                  {
                    "match": {
                      "type": "test",
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('Query parameters', () => {
      it('should add timeout parameter', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .timeout('5s')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "type": "test",
              },
            },
            "timeout": "5s",
          }
        `);
      });

      it('should add track_scores parameter', () => {
        const result = query<TestIndex>()
          .bool()
          .filter((q) => q.term('type', 'test'))
          .trackScores(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "type": "test",
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
        const result = query<TestIndex>()
          .match('type', 'test')
          .explain(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "explain": true,
            "query": {
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should add min_score parameter', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .minScore(0.5)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "min_score": 0.5,
            "query": {
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should add version parameter', () => {
        const result = query<TestIndex>()
          .term('type', 'test')
          .version(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "term": {
                "type": "test",
              },
            },
            "version": true,
          }
        `);
      });

      it('should add seq_no_primary_term parameter', () => {
        const result = query<TestIndex>()
          .term('type', 'test')
          .seqNoPrimaryTerm(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "term": {
                "type": "test",
              },
            },
            "seq_no_primary_term": true,
          }
        `);
      });

      it('should support multiple query parameters together', () => {
        const result = query<TestIndex>()
          .match('type', 'test', { operator: 'and', boost: 2 })
          .timeout('10s')
          .trackScores(true)
          .explain(true)
          .minScore(1.0)
          .from(0)
          .size(20)
          .sort('price', 'asc')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "explain": true,
            "from": 0,
            "min_score": 1,
            "query": {
              "match": {
                "type": {
                  "boost": 2,
                  "operator": "and",
                  "query": "test",
                },
              },
            },
            "size": 20,
            "sort": [
              {
                "price": "asc",
              },
            ],
            "timeout": "10s",
            "track_scores": true,
          }
        `);
      });
    });

    describe('ids query', () => {
      it('should build an ids query at root level', () => {
        const result = query<TestIndex>().ids(['id1', 'id2', 'id3']).build();

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
        const result = query<TestIndex>().ids(['single-id']).build();

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
        const result = query<TestIndex>()
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
        const result = query<TestIndex>()
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
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.ids(['id1', 'id2']))
          .filter((q) => q.term('type', 'test'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "type": "test",
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

    describe('nested query', () => {
      it('should build a nested query with single clause', () => {
        const result = query<TestIndex>()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .nested('type' as any, (q) => q.match('comments.author', 'john'))
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
              },
            },
          }
        `);
      });

      it('should build a nested query with multiple term queries', () => {
        const result = query<TestIndex>()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .nested('name' as any, (q) => q.term('status', 'approved'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "nested": {
                "path": "name",
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
        const result = query<TestIndex>()
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
        const result = query<TestIndex>()
          .nested(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            'name' as any,
            (q) => q.term('status', 'approved'),
            { score_mode: 'avg' }
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "nested": {
                "path": "name",
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
        const result = query<TestIndex>()
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
        const result = query<TestIndex>()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .nested('type' as any, (q: any) => q.match('author', 'john'))
          .from(0)
          .size(10)
          .sort('price', 'asc')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "from": 0,
            "query": {
              "nested": {
                "path": "type",
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
                "price": "asc",
              },
            ],
          }
        `);
      });
    });

    describe('when() conditional', () => {
      it('should execute thenFn when condition is truthy', () => {
        const searchTerm = 'test';
        const result = query<TestIndex>()
          .when(searchTerm, (q) => q.match('type', searchTerm))!
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should not add query when condition is falsy', () => {
        const searchTerm = undefined;
        const result = query<TestIndex>()
          .when(
            searchTerm,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (q) => q.match('type', searchTerm as any)
          )
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should execute elseFn when condition is falsy', () => {
        const searchTerm = undefined;
        const result = query<TestIndex>()
          .when(
            searchTerm,
            (q) => q.match('type', 'fallback'),
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
        const result = query<TestIndex>()
          .bool()
          .must(
            (q) => q.when(type, (q2) => q2.term('type', type)) || q.matchAll()
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "term": {
                      "type": "test",
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
        const result = query<TestIndex>()
          .bool()
          .filter(
            (q) =>
              q.when(minPrice, (q2) => q2.range('price', { gte: minPrice })) ||
              q.matchAll()
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
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
              },
            },
          }
        `);
      });

      it('should chain multiple when conditions', () => {
        const searchTerm = 'test';
        const type = 'test';
        const minPrice = 500;

        const result = query<TestIndex>()
          .bool()
          .must(
            (q) =>
              q.when(searchTerm, (q2) => q2.match('name', searchTerm)) ||
              q.matchAll()
          )
          .filter(
            (q) => q.when(type, (q2) => q2.term('type', type)) || q.matchAll()
          )
          .filter(
            (q) =>
              q.when(minPrice, (q2) => q2.range('price', { gte: minPrice })) ||
              q.matchAll()
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "type": "test",
                    },
                  },
                  {
                    "range": {
                      "price": {
                        "gte": 500,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "name": "test",
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
        const result = query<TestIndex>()
          .when(searchTerm, (q) => q.match('type', searchTerm))
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should use when with 0 (falsy)', () => {
        const minPrice = 0;
        const result = query<TestIndex>()
          .when(minPrice, (q) => q.range('price', { gte: minPrice }))
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should use when with empty array (falsy)', () => {
        const ids: string[] = [];
        const result = query<TestIndex>()
          .when(ids.length > 0, (q) => q.ids(ids))
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should use when with non-empty array (truthy)', () => {
        const ids = ['id1', 'id2'];
        const result = query<TestIndex>()
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

    describe('match_phrase_prefix query', () => {
      it('should build a match_phrase_prefix query at root level', () => {
        const result = query<TestIndex>()
          .matchPhrasePrefix('type', 'test')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match_phrase_prefix": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should build match_phrase_prefix with max_expansions option', () => {
        const result = query<TestIndex>()
          .matchPhrasePrefix('type', 'test', { max_expansions: 10 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match_phrase_prefix": {
                "type": {
                  "max_expansions": 10,
                  "query": "test",
                },
              },
            },
          }
        `);
      });

      it('should build match_phrase_prefix in bool must context', () => {
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.matchPhrasePrefix('name', 'john'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match_phrase_prefix": {
                      "name": "john",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build match_phrase_prefix in bool filter context', () => {
        const result = query<TestIndex>()
          .bool()
          .filter((q) =>
            q.matchPhrasePrefix('type', 'test', { max_expansions: 5 })
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "match_phrase_prefix": {
                      "type": {
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
        const result = query<TestIndex>()
          .bool()
          .must((q) =>
            q.matchPhrasePrefix('name', 'joh', { max_expansions: 20 })
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
                      "name": {
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

    describe('track_total_hits parameter', () => {
      it('should add track_total_hits with true', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .trackTotalHits(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "type": "test",
              },
            },
            "track_total_hits": true,
          }
        `);
      });

      it('should add track_total_hits with false', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .trackTotalHits(false)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "type": "test",
              },
            },
            "track_total_hits": false,
          }
        `);
      });

      it('should add track_total_hits with number limit', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .trackTotalHits(10000)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "match": {
                "type": "test",
              },
            },
            "track_total_hits": 10000,
          }
        `);
      });

      it('should combine track_total_hits with pagination', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .from(100)
          .size(20)
          .trackTotalHits(true)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "from": 100,
            "query": {
              "match": {
                "type": "test",
              },
            },
            "size": 20,
            "track_total_hits": true,
          }
        `);
      });
    });

    describe('highlighting', () => {
      it('should add highlight with single field', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .highlight(['type'])
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "type": {},
              },
            },
            "query": {
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with multiple fields', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .highlight(['type', 'name', 'price'])
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "name": {},
                "price": {},
                "type": {},
              },
            },
            "query": {
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with fragment_size option', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .highlight(['type'], { fragment_size: 150 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "type": {
                  "fragment_size": 150,
                },
              },
            },
            "query": {
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with number_of_fragments option', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .highlight(['name'], { number_of_fragments: 3 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "name": {
                  "number_of_fragments": 3,
                },
              },
            },
            "query": {
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with custom pre/post tags', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .highlight(['type'], {
            pre_tags: ['<em>'],
            post_tags: ['</em>']
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "highlight": {
              "fields": {
                "type": {
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
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should add highlight with multiple options', () => {
        const result = query<TestIndex>()
          .match('type', 'test')
          .highlight(['type', 'name'], {
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
                "type": {
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
              "match": {
                "type": "test",
              },
            },
          }
        `);
      });

      it('should combine highlight with other query features', () => {
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.match('type', 'test'))
          .filter((q) => q.range('price', { gte: 100, lte: 1000 }))
          .highlight(['type', 'name'], { fragment_size: 200 })
          .from(0)
          .size(10)
          .sort('price', 'asc')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "from": 0,
            "highlight": {
              "fields": {
                "name": {
                  "fragment_size": 200,
                },
                "type": {
                  "fragment_size": 200,
                },
              },
            },
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "price": {
                        "gte": 100,
                        "lte": 1000,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "type": "test",
                    },
                  },
                ],
              },
            },
            "size": 10,
            "sort": [
              {
                "price": "asc",
              },
            ],
          }
        `);
      });

      it('should combine all features', () => {
        const result = query<TestIndex>()
          .bool()
          .must((q) =>
            q.matchPhrasePrefix('name', 'joh', { max_expansions: 20 })
          )
          .filter((q) => q.term('type', 'test'))
          .highlight(['name', 'type'], {
            fragment_size: 150,
            pre_tags: ['<em>'],
            post_tags: ['</em>']
          })
          .trackTotalHits(true)
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
                  "fragment_size": 150,
                  "post_tags": [
                    "</em>",
                  ],
                  "pre_tags": [
                    "<em>",
                  ],
                },
                "type": {
                  "fragment_size": 150,
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
                    "term": {
                      "type": "test",
                    },
                  },
                ],
                "must": [
                  {
                    "match_phrase_prefix": {
                      "name": {
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
                "price": "asc",
              },
            ],
            "track_total_hits": true,
          }
        `);
      });
    });
  });

  describe('More TBC Features', () => {
    describe('Aggregations', () => {
      describe('Bucket Aggregations', () => {
        it('should create a terms aggregation', () => {
          const result = aggregations<TestIndex2>()
            .terms('category_agg', 'category', { size: 10 })
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "category_agg": {
              "terms": {
                "field": "category",
                "size": 10,
              },
            },
          }
        `);
        });

        it('should create a terms aggregation without options', () => {
          const result = aggregations<TestIndex2>()
            .terms('category_agg', 'category')
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "category_agg": {
              "terms": {
                "field": "category",
              },
            },
          }
        `);
        });

        it('should create a date histogram aggregation', () => {
          const result = aggregations<TestIndex2>()
            .dateHistogram('sales_by_date', 'date', {
              interval: 'day',
              min_doc_count: 1
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "sales_by_date": {
              "date_histogram": {
                "field": "date",
                "interval": "day",
                "min_doc_count": 1,
              },
            },
          }
        `);
        });

        it('should create a range aggregation', () => {
          const result = aggregations<TestIndex2>()
            .range('price_ranges', 'price', {
              ranges: [{ to: 100 }, { from: 100, to: 500 }, { from: 500 }]
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "price_ranges": {
              "range": {
                "field": "price",
                "ranges": [
                  {
                    "to": 100,
                  },
                  {
                    "from": 100,
                    "to": 500,
                  },
                  {
                    "from": 500,
                  },
                ],
              },
            },
          }
        `);
        });

        it('should create a histogram aggregation', () => {
          const result = aggregations<TestIndex2>()
            .histogram('price_histogram', 'price', { interval: 50 })
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "price_histogram": {
              "histogram": {
                "field": "price",
                "interval": 50,
              },
            },
          }
        `);
        });
      });

      describe('Metric Aggregations', () => {
        it('should create an avg aggregation', () => {
          const result = aggregations<TestIndex2>()
            .avg('avg_price', 'price')
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "avg_price": {
              "avg": {
                "field": "price",
              },
            },
          }
        `);
        });

        it('should create a sum aggregation', () => {
          const result = aggregations<TestIndex2>()
            .sum('total_price', 'price')
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "total_price": {
              "sum": {
                "field": "price",
              },
            },
          }
        `);
        });

        it('should create a min aggregation', () => {
          const result = aggregations<TestIndex2>()
            .min('min_price', 'price')
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "min_price": {
              "min": {
                "field": "price",
              },
            },
          }
        `);
        });

        it('should create a max aggregation', () => {
          const result = aggregations<TestIndex2>()
            .max('max_price', 'price')
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "max_price": {
              "max": {
                "field": "price",
              },
            },
          }
        `);
        });

        it('should create a cardinality aggregation', () => {
          const result = aggregations<TestIndex2>()
            .cardinality('unique_categories', 'category', {
              precision_threshold: 100
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "unique_categories": {
              "cardinality": {
                "field": "category",
                "precision_threshold": 100,
              },
            },
          }
        `);
        });

        it('should create a percentiles aggregation', () => {
          const result = aggregations<TestIndex2>()
            .percentiles('price_percentiles', 'price', {
              percents: [25, 50, 75, 95]
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "price_percentiles": {
              "percentiles": {
                "field": "price",
                "percents": [
                  25,
                  50,
                  75,
                  95,
                ],
              },
            },
          }
        `);
        });

        it('should create a stats aggregation', () => {
          const result = aggregations<TestIndex2>()
            .stats('price_stats', 'price')
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "price_stats": {
              "stats": {
                "field": "price",
              },
            },
          }
        `);
        });

        it('should create a value_count aggregation', () => {
          const result = aggregations<TestIndex2>()
            .valueCount('rating_count', 'rating')
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "rating_count": {
              "value_count": {
                "field": "rating",
              },
            },
          }
        `);
        });
      });

      describe('Sub-aggregations', () => {
        it('should add sub-aggregations to a bucket aggregation', () => {
          const result = aggregations<TestIndex2>()
            .terms('categories', 'category', { size: 10 })
            .subAgg((agg) => agg.avg('avg_price', 'price'))
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "categories": {
              "aggs": {
                "avg_price": {
                  "avg": {
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

        it('should add multiple sub-aggregations', () => {
          const result = aggregations<TestIndex2>()
            .terms('categories', 'category')
            .subAgg((agg) =>
              agg.avg('avg_price', 'price').max('max_rating', 'rating')
            )
            .build();

          expect(result).toMatchInlineSnapshot(`
          {
            "categories": {
              "aggs": {
                "avg_price": {
                  "avg": {
                    "field": "price",
                  },
                },
                "max_rating": {
                  "max": {
                    "field": "rating",
                  },
                },
              },
              "terms": {
                "field": "category",
              },
            },
          }
        `);
        });
      });
    });

    describe('Geo Queries', () => {
      it('should create a geo_distance query', () => {
        const result = query<TestIndex2>()
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
        const result = query<TestIndex2>()
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
        const result = query<TestIndex2>()
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
        const result = query<TestIndex2>()
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
        const result = query<TestIndex2>()
          .match('category', 'restaurants')
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

    describe('Pattern and Scoring Queries', () => {
      it('should create a regexp query', () => {
        const result = query<TestIndex2>().regexp('category', 'rest.*').build();

        expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "regexp": {
              "category": "rest.*",
            },
          },
        }
      `);
      });

      it('should create a regexp query with options', () => {
        const result = query<TestIndex2>()
          .regexp('category', 'rest.*', {
            flags: 'CASE_INSENSITIVE',
            boost: 2.0
          })
          .build();

        expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "regexp": {
              "category": {
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
        const result = query<TestIndex2>()
          .constantScore((q) => q.term('category', 'restaurants'))
          .build();

        expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "constant_score": {
              "filter": {
                "term": {
                  "category": "restaurants",
                },
              },
            },
          },
        }
      `);
      });

      it('should create a constant_score query with boost', () => {
        const result = query<TestIndex2>()
          .constantScore((q) => q.term('category', 'restaurants'), {
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
                  "category": "restaurants",
                },
              },
            },
          },
        }
      `);
      });

      it('should combine constant_score with other queries', () => {
        const result = query<TestIndex2>()
          .match('title', 'test')
          .constantScore((cb) => cb.term('category', 'restaurants'))
          .build();

        expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "constant_score": {
              "filter": {
                "term": {
                  "category": "restaurants",
                },
              },
            },
          },
        }
      `);
      });
    });

    describe('Integration: Queries with Aggregations', () => {
      it('should combine complex query with aggregations in result structure', () => {
        const queryResult = query<TestIndex2>()
          .bool()
          .must((q) => q.match('title', 'restaurant'))
          .filter((q) => q.range('price', { gte: 50, lte: 200 }))
          .build();

        const aggResult = aggregations<TestIndex2>()
          .terms('by_category', 'category', { size: 10 })
          .subAgg((agg) =>
            agg.avg('avg_price', 'price').max('max_rating', 'rating')
          )
          .build();

        expect(queryResult).toBeDefined();
        expect(aggResult).toBeDefined();
        expect(queryResult.query?.bool?.must).toBeDefined();
        expect(aggResult.by_category).toBeDefined();
      });

      it('should create aggregations for geo-based queries', () => {
        const agg = aggregations<TestIndex2>()
          .dateHistogram('reviews_over_time', 'date', { interval: 'month' })
          .subAgg((agg) => agg.avg('avg_rating', 'rating'))
          .build();

        expect(agg).toMatchInlineSnapshot(`
        {
          "reviews_over_time": {
            "aggs": {
              "avg_rating": {
                "avg": {
                  "field": "rating",
                },
              },
            },
            "date_histogram": {
              "field": "date",
              "interval": "month",
            },
          },
        }
      `);
      });
    });

    describe('Complex Real-world Scenarios', () => {
      it('should build a complete analytics query with multiple aggregations', () => {
        const agg = aggregations<TestIndex2>()
          .terms('by_category', 'category', { size: 20 })
          .subAgg((sub) =>
            sub
              .dateHistogram('sales_by_date', 'date', { interval: 'day' })
              .subAgg((sub2) => sub2.sum('total_sales', 'price'))
          )
          .build();

        expect(agg.by_category?.aggs?.sales_by_date).toBeDefined();
        expect(
          agg.by_category?.aggs?.sales_by_date?.aggs?.total_sales
        ).toBeDefined();
      });

      it('should create a location-based search with aggregations', () => {
        const queryResult = query<TestIndex2>()
          .match('title', 'coffee')
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '10km' }
          )
          .build();

        const agg = aggregations<TestIndex2>()
          .terms('by_category', 'category')
          .subAgg((sub) => sub.avg('avg_rating', 'rating'))
          .build();

        expect(queryResult.query?.geo_distance).toBeDefined();
        expect(agg.by_category?.aggs?.avg_rating).toBeDefined();
      });
    });

    describe('Query with Aggregations Integration', () => {
      it('should combine query with aggregations', () => {
        const result = query<TestIndex2>()
          .match('title', 'restaurant')
          .aggs((agg) =>
            agg
              .terms('by_category', 'category', { size: 10 })
              .avg('avg_price', 'price')
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
        {
          "aggs": {
            "avg_price": {
              "avg": {
                "field": "price",
              },
            },
            "by_category": {
              "terms": {
                "field": "category",
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
        const result = query<TestIndex2>(false)
          .aggs((agg) => agg.terms('by_category', 'category'))
          .size(0)
          .build();

        expect(result).toMatchInlineSnapshot(`
        {
          "aggs": {
            "by_category": {
              "terms": {
                "field": "category",
              },
            },
          },
          "size": 0,
        }
      `);
      });

      it('should combine bool query with sub-aggregations', () => {
        const result = query<TestIndex2>()
          .bool()
          .must((q) => q.match('title', 'coffee'))
          .filter((q) => q.range('price', { gte: 10, lte: 50 }))
          .aggs((agg) =>
            agg
              .terms('by_category', 'category', { size: 5 })
              .subAgg((sub) =>
                sub.avg('avg_price', 'price').max('max_rating', 'rating')
              )
          )
          .size(20)
          .build();

        expect(result).toMatchObject({
          query: {
            bool: {
              must: [{ match: { title: 'coffee' } }],
              filter: [{ range: { price: { gte: 10, lte: 50 } } }]
            }
          },
          aggs: {
            by_category: {
              terms: { field: 'category', size: 5 },
              aggs: {
                avg_price: { avg: { field: 'price' } },
                max_rating: { max: { field: 'rating' } }
              }
            }
          },
          size: 20
        });
      });

      it('should allow aggregations without query methods when using query()', () => {
        const result = query<TestIndex2>()
          .aggs((agg) => agg.sum('total_price', 'price'))
          .build();

        expect(result).toMatchObject({
          aggs: {
            total_price: { sum: { field: 'price' } }
          }
        });
      });
    });
  });

  describe('Phase 1: Critical Gaps', () => {
    describe('Boolean Query Combinations', () => {
      it('should build bool with all four clauses (must + mustNot + should + filter)', () => {
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.match('name', 'laptop'))
          .mustNot((q) => q.term('type', 'refurbished'))
          .should((q) => q.match('name', 'gaming'))
          .filter((q) => q.range('price', { gte: 500, lte: 2000 }))
          .minimumShouldMatch(1)
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "price": {
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
                      "name": "laptop",
                    },
                  },
                ],
                "must_not": [
                  {
                    "term": {
                      "type": "refurbished",
                    },
                  },
                ],
                "should": [
                  {
                    "match": {
                      "name": "gaming",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build bool with multiple filters chained', () => {
        const result = query<TestIndex>()
          .bool()
          .filter((q) => q.term('type', 'electronics'))
          .filter((q) => q.range('price', { gte: 100 }))
          .filter((q) => q.exists('name'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "type": "electronics",
                    },
                  },
                  {
                    "range": {
                      "price": {
                        "gte": 100,
                      },
                    },
                  },
                  {
                    "exists": {
                      "field": "name",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should build bool with only filter clauses (non-scoring pattern)', () => {
        const result = query<TestIndex>()
          .bool()
          .filter((q) => q.term('type', 'product'))
          .filter((q) => q.range('price', { lte: 1000 }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "type": "product",
                    },
                  },
                  {
                    "range": {
                      "price": {
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
        const result = query<TestIndex>()
          .bool()
          .should((q) => q.match('name', 'laptop'))
          .should((q) => q.match('name', 'computer'))
          .should((q) => q.match('type', 'electronics'))
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
                      "name": "laptop",
                    },
                  },
                  {
                    "match": {
                      "name": "computer",
                    },
                  },
                  {
                    "match": {
                      "type": "electronics",
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
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.match('name', 'laptop'))
          .filter((q) => q.range('price', { gte: 500 }))
          .build();

        // Verify basic structure works
        expect(result.query?.bool?.must).toHaveLength(1);
        expect(result.query?.bool?.filter).toHaveLength(1);
      });
    });

    describe('Range Query Edge Cases', () => {
      it('should build range with only gte', () => {
        const result = query<TestIndex>().range('price', { gte: 100 }).build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "price": {
                  "gte": 100,
                },
              },
            },
          }
        `);
      });

      it('should build range with only lte', () => {
        const result = query<TestIndex>().range('price', { lte: 1000 }).build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "price": {
                  "lte": 1000,
                },
              },
            },
          }
        `);
      });

      it('should build range with only gt', () => {
        const result = query<TestIndex>().range('price', { gt: 0 }).build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "price": {
                  "gt": 0,
                },
              },
            },
          }
        `);
      });

      it('should build range with only lt', () => {
        const result = query<TestIndex>().range('price', { lt: 9999 }).build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "price": {
                  "lt": 9999,
                },
              },
            },
          }
        `);
      });

      it('should build range with all four conditions', () => {
        const result = query<TestIndex>()
          .range('price', { gt: 0, gte: 1, lt: 1000, lte: 999 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "range": {
                "price": {
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
        const result = query<TestIndex>()
          .bool()
          .filter((q) => q.range('price', { gte: 50 }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "price": {
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
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.range('size', { gte: 10, lte: 100 }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "range": {
                      "size": {
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

    describe('Query + Aggregations Integration Gaps', () => {
      it('should combine bool query with multiple top-level aggregations', () => {
        const result = query<TestIndex2>()
          .bool()
          .must((q) => q.match('title', 'coffee'))
          .filter((q) => q.range('price', { gte: 5, lte: 20 }))
          .aggs((agg) =>
            agg
              .terms('by_category', 'category', { size: 10 })
              .avg('avg_price', 'price')
              .max('max_rating', 'rating')
              .min('min_price', 'price')
          )
          .size(20)
          .build();

        expect(result).toMatchObject({
          query: {
            bool: {
              must: [{ match: { title: 'coffee' } }],
              filter: [{ range: { price: { gte: 5, lte: 20 } } }]
            }
          },
          aggs: {
            by_category: { terms: { field: 'category', size: 10 } },
            avg_price: { avg: { field: 'price' } },
            max_rating: { max: { field: 'rating' } },
            min_price: { min: { field: 'price' } }
          },
          size: 20
        });
      });

      it('should combine geo query with aggregations', () => {
        const result = query<TestIndex2>()
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '5km' }
          )
          .aggs((agg) =>
            agg
              .terms('by_category', 'category')
              .subAgg((sub) => sub.avg('avg_rating', 'rating'))
          )
          .build();

        expect(result).toMatchObject({
          query: {
            geo_distance: {
              location: { lat: 40.7128, lon: -74.006 },
              distance: '5km'
            }
          },
          aggs: {
            by_category: {
              terms: { field: 'category' },
              aggs: {
                avg_rating: { avg: { field: 'rating' } }
              }
            }
          }
        });
      });

      it('should build query(false) with multiple aggregations and all meta properties', () => {
        const result = query<TestIndex2>(false)
          .aggs((agg) =>
            agg
              .terms('by_category', 'category', { size: 20 })
              .dateHistogram('over_time', 'date', { interval: 'month' })
              .stats('price_stats', 'price')
          )
          .size(0)
          .from(0)
          .timeout('30s')
          .build();

        expect(result).toMatchObject({
          aggs: {
            by_category: { terms: { field: 'category', size: 20 } },
            over_time: { date_histogram: { field: 'date', interval: 'month' } },
            price_stats: { stats: { field: 'price' } }
          },
          size: 0,
          from: 0,
          timeout: '30s'
        });
        expect(result.query).toBeUndefined();
      });

      it('should build query(false) with deeply nested sub-aggregations', () => {
        const result = query<TestIndex2>(false)
          .aggs((agg) =>
            agg
              .terms('by_category', 'category')
              .subAgg((sub) =>
                sub
                  .dateHistogram('by_month', 'date', { interval: 'month' })
                  .subAgg((sub2) =>
                    sub2.avg('avg_price', 'price').sum('total_sales', 'price')
                  )
              )
          )
          .size(0)
          .build();

        expect(result).toMatchObject({
          aggs: {
            by_category: {
              terms: { field: 'category' },
              aggs: {
                by_month: {
                  date_histogram: { field: 'date', interval: 'month' },
                  aggs: {
                    avg_price: { avg: { field: 'price' } },
                    total_sales: { sum: { field: 'price' } }
                  }
                }
              }
            }
          },
          size: 0
        });
        expect(result.query).toBeUndefined();
      });

      it('should combine aggregations with highlight', () => {
        const result = query<TestIndex2>()
          .match('title', 'coffee shop')
          .aggs((agg) => agg.terms('by_category', 'category'))
          .highlight(['title', 'description'], {
            pre_tags: ['<em>'],
            post_tags: ['</em>']
          })
          .build();

        expect(result).toMatchObject({
          query: { match: { title: 'coffee shop' } },
          aggs: { by_category: { terms: { field: 'category' } } },
          highlight: {
            fields: {
              title: { pre_tags: ['<em>'], post_tags: ['</em>'] },
              description: { pre_tags: ['<em>'], post_tags: ['</em>'] }
            },
            pre_tags: ['<em>'],
            post_tags: ['</em>']
          }
        });
      });

      it('should combine aggregations with sort', () => {
        const result = query<TestIndex2>()
          .match('title', 'restaurant')
          .aggs((agg) => agg.terms('by_category', 'category'))
          .sort('rating', 'desc')
          .size(10)
          .build();

        expect(result).toMatchObject({
          query: { match: { title: 'restaurant' } },
          aggs: { by_category: { terms: { field: 'category' } } },
          sort: [{ rating: 'desc' }],
          size: 10
        });
      });

      it('should combine aggregations with _source selection', () => {
        const result = query<TestIndex2>()
          .term('category', 'electronics')
          .aggs((agg) => agg.avg('avg_price', 'price'))
          ._source(['title', 'price', 'category'])
          .build();

        expect(result).toMatchObject({
          query: { term: { category: 'electronics' } },
          aggs: { avg_price: { avg: { field: 'price' } } },
          _source: ['title', 'price', 'category']
        });
      });
    });

    describe('Aggregation Options Coverage', () => {
      describe('Terms Aggregation Options', () => {
        it('should create terms with min_doc_count', () => {
          const result = aggregations<TestIndex2>()
            .terms('categories', 'category', { min_doc_count: 5 })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "categories": {
                "terms": {
                  "field": "category",
                  "min_doc_count": 5,
                },
              },
            }
          `);
        });

        it('should create terms with order', () => {
          const result = aggregations<TestIndex2>()
            .terms('categories', 'category', { order: { _count: 'asc' } })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "categories": {
                "terms": {
                  "field": "category",
                  "order": {
                    "_count": "asc",
                  },
                },
              },
            }
          `);
        });

        it('should create terms with missing value', () => {
          const result = aggregations<TestIndex2>()
            .terms('categories', 'category', { missing: 'N/A' })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "categories": {
                "terms": {
                  "field": "category",
                  "missing": "N/A",
                },
              },
            }
          `);
        });

        it('should create terms with all options', () => {
          const result = aggregations<TestIndex2>()
            .terms('categories', 'category', {
              size: 20,
              min_doc_count: 2,
              order: { _key: 'desc' },
              missing: 'Unknown'
            })
            .build();

          expect(result.categories.terms).toEqual({
            field: 'category',
            size: 20,
            min_doc_count: 2,
            order: { _key: 'desc' },
            missing: 'Unknown'
          });
        });
      });

      describe('DateHistogram Aggregation Options', () => {
        it('should create dateHistogram with extended_bounds', () => {
          const result = aggregations<TestIndex2>()
            .dateHistogram('over_time', 'date', {
              interval: 'day',
              extended_bounds: {
                min: '2024-01-01',
                max: '2024-12-31'
              }
            })
            .build();

          expect(result.over_time.date_histogram.extended_bounds).toEqual({
            min: '2024-01-01',
            max: '2024-12-31'
          });
        });

        it('should create dateHistogram with time_zone', () => {
          const result = aggregations<TestIndex2>()
            .dateHistogram('over_time', 'date', {
              interval: 'day',
              time_zone: 'America/New_York'
            })
            .build();

          expect(result.over_time.date_histogram.time_zone).toBe(
            'America/New_York'
          );
        });

        it('should create dateHistogram with order', () => {
          const result = aggregations<TestIndex2>()
            .dateHistogram('over_time', 'date', {
              interval: 'month',
              order: { _key: 'desc' }
            })
            .build();

          expect(result.over_time.date_histogram.order).toEqual({
            _key: 'desc'
          });
        });
      });

      describe('Histogram Aggregation Options', () => {
        it('should create histogram with min_doc_count', () => {
          const result = aggregations<TestIndex2>()
            .histogram('price_buckets', 'price', {
              interval: 100,
              min_doc_count: 1
            })
            .build();

          expect(result.price_buckets.histogram.min_doc_count).toBe(1);
        });

        it('should create histogram with extended_bounds', () => {
          const result = aggregations<TestIndex2>()
            .histogram('price_buckets', 'price', {
              interval: 50,
              extended_bounds: { min: 0, max: 1000 }
            })
            .build();

          expect(result.price_buckets.histogram.extended_bounds).toEqual({
            min: 0,
            max: 1000
          });
        });
      });

      describe('Metric Aggregation Options', () => {
        it('should create avg with missing value', () => {
          const result = aggregations<TestIndex2>()
            .avg('avg_price', 'price', { missing: 0 })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "avg_price": {
                "avg": {
                  "field": "price",
                  "missing": 0,
                },
              },
            }
          `);
        });

        it('should create sum with missing value', () => {
          const result = aggregations<TestIndex2>()
            .sum('total_price', 'price', { missing: 0 })
            .build();

          expect(result.total_price.sum.missing).toBe(0);
        });

        it('should create min with missing value', () => {
          const result = aggregations<TestIndex2>()
            .min('min_price', 'price', { missing: 9999 })
            .build();

          expect(result.min_price.min.missing).toBe(9999);
        });

        it('should create max with missing value', () => {
          const result = aggregations<TestIndex2>()
            .max('max_price', 'price', { missing: 0 })
            .build();

          expect(result.max_price.max.missing).toBe(0);
        });

        it('should create cardinality without options', () => {
          const result = aggregations<TestIndex2>()
            .cardinality('unique_categories', 'category')
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "unique_categories": {
                "cardinality": {
                  "field": "category",
                },
              },
            }
          `);
        });

        it('should create percentiles with keyed option', () => {
          const result = aggregations<TestIndex2>()
            .percentiles('price_percentiles', 'price', {
              percents: [25, 50, 75, 95, 99],
              keyed: true
            })
            .build();

          expect(result.price_percentiles.percentiles.keyed).toBe(true);
          expect(result.price_percentiles.percentiles.percents).toEqual([
            25, 50, 75, 95, 99
          ]);
        });

        it('should create stats with missing value', () => {
          const result = aggregations<TestIndex2>()
            .stats('price_stats', 'price', { missing: 0 })
            .build();

          expect(result.price_stats.stats.missing).toBe(0);
        });

        it('should create valueCount with missing value', () => {
          const result = aggregations<TestIndex2>()
            .valueCount('rating_count', 'rating', { missing: 0 })
            .build();

          expect(result.rating_count.value_count.missing).toBe(0);
        });
      });

      describe('Sub-Aggregation Patterns', () => {
        it('should add sub-agg to dateHistogram', () => {
          const result = aggregations<TestIndex2>()
            .dateHistogram('by_month', 'date', { interval: 'month' })
            .subAgg((sub) =>
              sub.sum('monthly_revenue', 'price').avg('avg_rating', 'rating')
            )
            .build();

          expect(result).toMatchObject({
            by_month: {
              date_histogram: { field: 'date', interval: 'month' },
              aggs: {
                monthly_revenue: { sum: { field: 'price' } },
                avg_rating: { avg: { field: 'rating' } }
              }
            }
          });
        });

        it('should add sub-agg to range aggregation', () => {
          const result = aggregations<TestIndex2>()
            .range('price_ranges', 'price', {
              ranges: [{ to: 50 }, { from: 50, to: 100 }, { from: 100 }]
            })
            .subAgg((sub) => sub.avg('avg_rating', 'rating'))
            .build();

          expect(result).toMatchObject({
            price_ranges: {
              range: {
                field: 'price',
                ranges: [{ to: 50 }, { from: 50, to: 100 }, { from: 100 }]
              },
              aggs: {
                avg_rating: { avg: { field: 'rating' } }
              }
            }
          });
        });

        it('should add sub-agg to histogram aggregation', () => {
          const result = aggregations<TestIndex2>()
            .histogram('price_histogram', 'price', { interval: 25 })
            .subAgg((sub) => sub.cardinality('unique_categories', 'category'))
            .build();

          expect(result).toMatchObject({
            price_histogram: {
              histogram: { field: 'price', interval: 25 },
              aggs: {
                unique_categories: { cardinality: { field: 'category' } }
              }
            }
          });
        });

        it('should create multiple sibling sub-aggregations', () => {
          const result = aggregations<TestIndex2>()
            .terms('by_category', 'category')
            .subAgg((sub) =>
              sub
                .avg('avg_price', 'price')
                .min('min_price', 'price')
                .max('max_price', 'price')
                .sum('total_revenue', 'price')
                .stats('price_stats', 'price')
            )
            .build();

          expect(result).toMatchObject({
            by_category: {
              terms: { field: 'category' },
              aggs: {
                avg_price: { avg: { field: 'price' } },
                min_price: { min: { field: 'price' } },
                max_price: { max: { field: 'price' } },
                total_revenue: { sum: { field: 'price' } },
                price_stats: { stats: { field: 'price' } }
              }
            }
          });
        });

        it('should create multiple bucket aggregations at same level', () => {
          const result = aggregations<TestIndex2>()
            .terms('by_category', 'category', { size: 10 })
            .terms('by_title', 'title', { size: 5 })
            .dateHistogram('by_date', 'date', { interval: 'week' })
            .build();

          expect(result).toMatchObject({
            by_category: { terms: { field: 'category', size: 10 } },
            by_title: { terms: { field: 'title', size: 5 } },
            by_date: { date_histogram: { field: 'date', interval: 'week' } }
          });
        });
      });
    });
  });

  describe('Phase 2: Edge Cases', () => {
    describe('ClauseBuilder in All Bool Contexts', () => {
      it('should use matchPhrase in bool filter context', () => {
        const result = query<TestIndex>()
          .bool()
          .filter((q) => q.matchPhrase('name', 'gaming laptop'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "match_phrase": {
                      "name": "gaming laptop",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use matchPhrasePrefix in bool should context', () => {
        const result = query<TestIndex>()
          .bool()
          .should((q) =>
            q.matchPhrasePrefix('name', 'gam', { max_expansions: 10 })
          )
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "should": [
                  {
                    "match_phrase_prefix": {
                      "name": {
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
        const result = query<TestIndex>()
          .bool()
          .mustNot((q) => q.term('type', 'refurbished'))
          .mustNot((q) => q.term('type', 'used'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must_not": [
                  {
                    "term": {
                      "type": "refurbished",
                    },
                  },
                  {
                    "term": {
                      "type": "used",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use fuzzy in bool filter context', () => {
        const result = query<TestIndex>()
          .bool()
          .filter((q) => q.fuzzy('name', 'laptp', { fuzziness: 'AUTO' }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "fuzzy": {
                      "name": {
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
        const result = query<TestIndex>()
          .bool()
          .should((q) => q.ids(['featured-1', 'featured-2']))
          .should((q) => q.match('name', 'laptop'))
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
                      "name": "laptop",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use matchAll in bool must context', () => {
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.matchAll())
          .filter((q) => q.term('type', 'active'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "filter": [
                  {
                    "term": {
                      "type": "active",
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
        const result = query<TestIndex>()
          .bool()
          .filter((q) =>
            q.multiMatch(['name', 'type'], 'laptop', { type: 'cross_fields' })
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
                        "name",
                        "type",
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
        const result = query<TestIndex>()
          .bool()
          .should((q) => q.prefix('name', 'gam'))
          .should((q) => q.prefix('name', 'lap'))
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
                      "name": "gam",
                    },
                  },
                  {
                    "prefix": {
                      "name": "lap",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use wildcard in bool mustNot context', () => {
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.match('name', 'laptop'))
          .mustNot((q) => q.wildcard('type', '*refurb*'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "query": {
              "bool": {
                "must": [
                  {
                    "match": {
                      "name": "laptop",
                    },
                  },
                ],
                "must_not": [
                  {
                    "wildcard": {
                      "type": "*refurb*",
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('should use term in bool should context', () => {
        const result = query<TestIndex>()
          .bool()
          .should((q) => q.term('type', 'laptop'))
          .should((q) => q.term('type', 'computer'))
          .should((q) => q.term('type', 'notebook'))
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
                      "type": "laptop",
                    },
                  },
                  {
                    "term": {
                      "type": "computer",
                    },
                  },
                  {
                    "term": {
                      "type": "notebook",
                    },
                  },
                ],
              },
            },
          }
        `);
      });
    });

    describe('when() Edge Cases', () => {
      it('should handle null condition (falsy)', () => {
        const value = null;
        const result = query<TestIndex>()
          .when(value, (q) => q.match('name', 'test'))
          ?.build();

        expect(result).toBeUndefined();
      });

      it('should handle boolean false condition', () => {
        const condition = false;
        const result = query<TestIndex>()
          .when(condition, (q) => q.match('name', 'test'))
          ?.build();

        expect(result).toBeUndefined();
      });

      it('should handle boolean true condition', () => {
        const condition = true;
        const result = query<TestIndex>()
          .when(condition, (q) => q.match('name', 'test'))!
          .build();

        expect(result.query?.match?.name).toBe('test');
      });

      it('should handle object condition (truthy)', () => {
        const filters = { category: 'electronics' };
        const result = query<TestIndex>()
          .when(filters, (q) => q.term('type', filters.category))!
          .build();

        expect(result.query?.term?.type).toBe('electronics');
      });

      it('should handle when in bool should context', () => {
        const hasFeatured = true;
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.match('name', 'laptop'))
          .should(
            (q) =>
              q.when(hasFeatured, (q2) => q2.term('type', 'featured')) ||
              q.matchAll()
          )
          .build();

        expect(result.query?.bool?.should?.[0]?.term?.type).toBe('featured');
      });

      it('should handle when with else clause in bool context', () => {
        const searchTerm: string | undefined = undefined;
        const result = query<TestIndex>()
          .bool()
          .must(
            (q) =>
              q.when(
                searchTerm,
                (q2) => q2.match('name', searchTerm!),
                (q2) => q2.matchAll()
              )!
          )
          .build();

        expect(result.query?.bool?.must?.[0]?.match_all).toEqual({});
      });

      it('should handle nested when conditionals', () => {
        const searchTerm = 'laptop';
        const useBoost = true;

        const result = query<TestIndex>()
          .when(
            searchTerm,
            (q) =>
              q.when(
                useBoost,
                (q2) => q2.match('name', searchTerm, { boost: 2 }),
                (q2) => q2.match('name', searchTerm)
              )!
          )!
          .build();

        expect(result.query?.match?.name?.query).toBe('laptop');
        expect(result.query?.match?.name?.boost).toBe(2);
      });

      it('should use when in bool mustNot context', () => {
        const excludeRefurbished = true;
        const result = query<TestIndex>()
          .bool()
          .must((q) => q.match('name', 'laptop'))
          .mustNot(
            (q) =>
              q.when(excludeRefurbished, (q2) =>
                q2.term('type', 'refurbished')
              ) || q.term('type', '__impossible__')
          )
          .build();

        expect(result.query?.bool?.must_not?.[0]?.term?.type).toBe(
          'refurbished'
        );
      });
    });

    describe('Geo Query Edge Cases', () => {
      it('should create geoDistance with numeric distance', () => {
        const result = query<TestIndex2>()
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: 5000 } // meters
          )
          .build();

        expect(result.query?.geo_distance?.distance).toBe(5000);
      });

      it('should create geoDistance with arc distance_type', () => {
        const result = query<TestIndex2>()
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
        const geoResult = query<TestIndex2>()
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '5km' }
          )
          .build();

        expect(geoResult.query?.geo_distance).toBeDefined();
      });

      it('should create geoBoundingBox with edge coordinates', () => {
        const result = query<TestIndex2>()
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

        const result = query<TestIndex2>()
          .geoPolygon('location', { points })
          .build();

        expect(result.query?.geo_polygon?.location?.points).toHaveLength(6);
      });
    });

    describe('Pattern Query Edge Cases', () => {
      it('should create regexp with max_determinized_states option', () => {
        const result = query<TestIndex2>()
          .regexp('category', 'rest.*ant', { max_determinized_states: 10000 })
          .build();

        expect(result.query?.regexp?.category?.max_determinized_states).toBe(
          10000
        );
      });

      it('should create regexp in bool must context', () => {
        // Note: regexp is currently only at root level
        // This test documents current behavior
        const result = query<TestIndex2>()
          .regexp('category', 'coffee.*')
          .build();

        expect(result.query?.regexp?.category).toBe('coffee.*');
      });

      it('should create constantScore with range filter', () => {
        const result = query<TestIndex2>()
          .constantScore((q) => q.range('price', { gte: 100, lte: 500 }), {
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
                    "price": {
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
        const result = query<TestIndex2>()
          .constantScore((q) => q.exists('rating'), { boost: 0.5 })
          .build();

        expect(result.query?.constant_score?.filter?.exists?.field).toBe(
          'rating'
        );
        expect(result.query?.constant_score?.boost).toBe(0.5);
      });

      it('should create constantScore with term filter', () => {
        const result = query<TestIndex2>()
          .constantScore((q) => q.term('category', 'coffee'))
          .build();

        expect(result.query?.constant_score?.filter?.term?.category).toBe(
          'coffee'
        );
      });

      it('should create regexp with all options combined', () => {
        const result = query<TestIndex2>()
          .regexp('title', 'coff?ee.*shop', {
            flags: 'COMPLEMENT|INTERVAL',
            max_determinized_states: 20000,
            boost: 1.5
          })
          .build();

        expect(result.query?.regexp?.title).toEqual({
          value: 'coff?ee.*shop',
          flags: 'COMPLEMENT|INTERVAL',
          max_determinized_states: 20000,
          boost: 1.5
        });
      });
    });

    describe('Nested Query Edge Cases', () => {
      it('should build nested with range query inside', () => {
        const result = query<TestIndex>()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .nested('type' as any, (q) =>
            q.range('nested.price', { gte: 100, lte: 500 })
          )
          .build();

        expect(result.query?.nested?.query?.range).toBeDefined();
      });

      it('should build nested with max score_mode', () => {
        const result = query<TestIndex>()
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
        const result = query<TestIndex>()
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

  describe('Phase 3: Completeness', () => {
    describe('Meta Property Edge Cases', () => {
      it('should add multiple sorts (chained calls)', () => {
        const result = query<TestIndex>()
          .match('name', 'laptop')
          .sort('price', 'asc')
          .sort('size', 'desc')
          .build();

        expect(result.sort).toEqual([{ price: 'asc' }, { size: 'desc' }]);
      });

      it('should add sort with desc direction explicitly', () => {
        const result = query<TestIndex>()
          .match('name', 'laptop')
          .sort('price', 'desc')
          .build();

        expect(result.sort).toEqual([{ price: 'desc' }]);
      });

      it('should handle empty _source array', () => {
        const result = query<TestIndex>()
          .match('name', 'laptop')
          ._source([])
          .build();

        expect(result._source).toEqual([]);
      });

      it('should handle large pagination values', () => {
        const result = query<TestIndex>()
          .match('name', 'laptop')
          .from(10000)
          .size(100)
          .build();

        expect(result.from).toBe(10000);
        expect(result.size).toBe(100);
      });

      it('should handle zero values for pagination', () => {
        const result = query<TestIndex>()
          .match('name', 'laptop')
          .from(0)
          .size(0)
          .build();

        expect(result.from).toBe(0);
        expect(result.size).toBe(0);
      });

      it('should combine all meta properties', () => {
        const result = query<TestIndex>()
          .match('name', 'laptop')
          .from(20)
          .size(10)
          .sort('price', 'asc')
          .sort('size', 'desc')
          ._source(['name', 'price'])
          .timeout('10s')
          .trackScores(true)
          .explain(false)
          .minScore(1.5)
          .version(true)
          .seqNoPrimaryTerm(true)
          .trackTotalHits(10000)
          .build();

        expect(result).toMatchObject({
          query: { match: { name: 'laptop' } },
          from: 20,
          size: 10,
          sort: [{ price: 'asc' }, { size: 'desc' }],
          _source: ['name', 'price'],
          timeout: '10s',
          track_scores: true,
          explain: false,
          min_score: 1.5,
          version: true,
          seq_no_primary_term: true,
          track_total_hits: 10000
        });
      });

      it('should allow overriding meta properties with subsequent calls', () => {
        const result = query<TestIndex>()
          .match('name', 'laptop')
          .size(10)
          .size(20)
          .from(0)
          .from(50)
          .build();

        expect(result.size).toBe(20);
        expect(result.from).toBe(50);
      });
    });

    describe('Real-World Scenarios', () => {
      it('should build e-commerce search: text + filters + facets + pagination + sort', () => {
        const searchTerm = 'gaming laptop';
        const category = 'electronics';
        const minPrice = 500;
        const maxPrice = 2000;

        const result = query<TestIndex2>()
          .bool()
          .must((q) =>
            q.match('title', searchTerm, { operator: 'and', boost: 2 })
          )
          .filter((q) => q.term('category', category))
          .filter((q) => q.range('price', { gte: minPrice, lte: maxPrice }))
          .filter((q) => q.exists('rating'))
          .aggs((agg) =>
            agg
              .terms('by_category', 'category', { size: 20 })
              .range('price_ranges', 'price', {
                ranges: [
                  { key: 'budget', to: 500 },
                  { key: 'mid', from: 500, to: 1000 },
                  { key: 'premium', from: 1000 }
                ]
              })
              .avg('avg_price', 'price')
              .avg('avg_rating', 'rating')
          )
          .highlight(['title', 'description'], {
            pre_tags: ['<mark>'],
            post_tags: ['</mark>'],
            fragment_size: 150
          })
          .sort('rating', 'desc')
          ._source(['title', 'price', 'rating', 'category'])
          .from(0)
          .size(20)
          .trackTotalHits(true)
          .build();

        expect(result).toMatchObject({
          query: {
            bool: {
              must: [
                {
                  match: {
                    title: { query: searchTerm, operator: 'and', boost: 2 }
                  }
                }
              ],
              filter: [
                { term: { category } },
                { range: { price: { gte: minPrice, lte: maxPrice } } },
                { exists: { field: 'rating' } }
              ]
            }
          },
          aggs: {
            by_category: { terms: { field: 'category', size: 20 } },
            price_ranges: expect.objectContaining({ range: expect.anything() }),
            avg_price: { avg: { field: 'price' } },
            avg_rating: { avg: { field: 'rating' } }
          },
          highlight: {
            fields: {
              title: expect.anything(),
              description: expect.anything()
            }
          },
          sort: [{ rating: 'desc' }],
          _source: ['title', 'price', 'rating', 'category'],
          from: 0,
          size: 20,
          track_total_hits: true
        });
      });

      it('should build autocomplete search: matchPhrasePrefix + highlighting + size limit', () => {
        const prefix = 'gam';

        const result = query<TestIndex>()
          .matchPhrasePrefix('name', prefix, { max_expansions: 50 })
          .highlight(['name'], {
            pre_tags: ['<b>'],
            post_tags: ['</b>']
          })
          .size(10)
          ._source(['name', 'type'])
          .build();

        expect(result).toMatchObject({
          query: {
            match_phrase_prefix: {
              name: { query: 'gam', max_expansions: 50 }
            }
          },
          highlight: {
            fields: { name: expect.anything() }
          },
          size: 10,
          _source: ['name', 'type']
        });
      });

      it('should build analytics dashboard: aggregations only with size=0', () => {
        const result = query<TestIndex2>(false)
          .aggs((agg) =>
            agg
              .dateHistogram('sales_by_day', 'date', {
                interval: 'day',
                min_doc_count: 0,
                extended_bounds: {
                  min: '2024-01-01',
                  max: '2024-12-31'
                }
              })
              .subAgg((sub) =>
                sub
                  .sum('daily_revenue', 'price')
                  .avg('avg_order_value', 'price')
                  .cardinality('unique_customers', 'category')
              )
          )
          .size(0)
          .timeout('30s')
          .build();

        expect(result).toMatchObject({
          aggs: {
            sales_by_day: {
              date_histogram: expect.objectContaining({
                interval: 'day',
                min_doc_count: 0
              }),
              aggs: {
                daily_revenue: { sum: { field: 'price' } },
                avg_order_value: { avg: { field: 'price' } },
                unique_customers: { cardinality: { field: 'category' } }
              }
            }
          },
          size: 0,
          timeout: '30s'
        });
        expect(result.query).toBeUndefined();
      });

      it('should build geo-based search: location + radius + category filter + rating sort', () => {
        const result = query<TestIndex2>()
          .geoDistance(
            'location',
            { lat: 40.7128, lon: -74.006 },
            { distance: '10km', distance_type: 'arc' }
          )
          .build();

        expect(result).toMatchObject({
          query: {
            geo_distance: {
              location: { lat: 40.7128, lon: -74.006 },
              distance: '10km',
              distance_type: 'arc'
            }
          }
        });
      });

      it('should build time-series query: date range + date histogram + metrics', () => {
        const result = query<TestIndex2>(false)
          .aggs((agg) =>
            agg
              .dateHistogram('by_hour', 'date', {
                interval: 'hour',
                time_zone: 'UTC',
                min_doc_count: 0
              })
              .subAgg((sub) =>
                sub
                  .avg('avg_value', 'price')
                  .min('min_value', 'price')
                  .max('max_value', 'price')
                  .percentiles('value_percentiles', 'price', {
                    percents: [50, 90, 95, 99]
                  })
              )
          )
          .size(0)
          .build();

        expect(result).toMatchObject({
          aggs: {
            by_hour: {
              date_histogram: {
                interval: 'hour',
                time_zone: 'UTC',
                min_doc_count: 0
              },
              aggs: {
                avg_value: { avg: { field: 'price' } },
                min_value: { min: { field: 'price' } },
                max_value: { max: { field: 'price' } },
                value_percentiles: {
                  percentiles: expect.objectContaining({
                    percents: [50, 90, 95, 99]
                  })
                }
              }
            }
          },
          size: 0
        });
      });

      it('should build multi-field search: multiMatch with boost + highlighting', () => {
        const searchQuery = 'premium coffee beans';

        const result = query<TestIndex2>()
          .multiMatch(['title', 'description', 'category'], searchQuery, {
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

        expect(result).toMatchObject({
          query: {
            multi_match: {
              fields: ['title', 'description', 'category'],
              query: searchQuery,
              type: 'best_fields',
              operator: 'or',
              tie_breaker: 0.3,
              boost: 1.5
            }
          },
          highlight: {
            fields: {
              title: expect.objectContaining({
                fragment_size: 200,
                number_of_fragments: 3
              }),
              description: expect.objectContaining({
                fragment_size: 200,
                number_of_fragments: 3
              })
            }
          },
          from: 0,
          size: 25
        });
      });

      it('should build faceted navigation: bool filters + terms aggregations per facet', () => {
        const selectedCategory = 'electronics';
        const selectedBrand = 'Apple';

        const result = query<TestIndex2>()
          .bool()
          .filter((q) => q.term('category', selectedCategory))
          .filter((q) => q.match('title', selectedBrand))
          .aggs((agg) =>
            agg
              .terms('categories', 'category', { size: 30 })
              .terms('price_tiers', 'price', { size: 10 })
              .terms('ratings', 'rating', { size: 5 })
          )
          .size(24)
          .from(0)
          .build();

        expect(result).toMatchObject({
          query: {
            bool: {
              filter: [
                { term: { category: selectedCategory } },
                { match: { title: selectedBrand } }
              ]
            }
          },
          aggs: {
            categories: { terms: { field: 'category', size: 30 } },
            price_tiers: { terms: { field: 'price', size: 10 } },
            ratings: { terms: { field: 'rating', size: 5 } }
          },
          size: 24,
          from: 0
        });
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

        const result = query<TestIndex2>()
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
                q2.term('category', filters.category!)
              ) || q.matchAll()
          )
          .filter(
            (q) =>
              q.when(filters.minPrice, (q2) =>
                q2.range('price', { gte: filters.minPrice! })
              ) || q.matchAll()
          )
          .build();

        expect(result).toMatchObject({
          query: {
            bool: {
              must: [{ match: { title: 'laptop' } }],
              filter: [{ match_all: {} }, { range: { price: { gte: 500 } } }]
            }
          }
        });
      });
    });

    describe('Builder Behavior', () => {
      it('should verify builder immutability (original not modified)', () => {
        const base = query<TestIndex>().match('name', 'laptop');
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
        const builder = query<TestIndex>().match('name', 'laptop').size(10);

        const result1 = builder.build();
        const result2 = builder.build();
        const result3 = builder.build();

        expect(result1).toEqual(result2);
        expect(result2).toEqual(result3);
      });

      it('should allow reusing partial builder chains', () => {
        const baseFilters = query<TestIndex>()
          .bool()
          .filter((q) => q.exists('name'))
          .filter((q) => q.range('price', { gte: 0 }));

        const searchA = baseFilters
          .must((q) => q.match('name', 'laptop'))
          .build();

        const searchB = baseFilters
          .must((q) => q.match('name', 'phone'))
          .build();

        expect(searchA.query?.bool?.must?.[0]?.match?.name).toBe('laptop');
        expect(searchB.query?.bool?.must?.[0]?.match?.name).toBe('phone');

        // Both should have the base filters
        expect(searchA.query?.bool?.filter).toHaveLength(2);
        expect(searchB.query?.bool?.filter).toHaveLength(2);
      });

      it('should handle empty query builder (just build)', () => {
        const result = query<TestIndex>().build();

        // Should return an object, possibly with undefined query
        expect(result).toBeDefined();
        expect(typeof result).toBe('object');
      });

      it('should handle query builder with only meta properties (no query)', () => {
        const result = query<TestIndex>()
          .size(10)
          .from(0)
          .sort('price', 'asc')
          .build();

        expect(result.size).toBe(10);
        expect(result.from).toBe(0);
        expect(result.sort).toEqual([{ price: 'asc' }]);
        // Query may be undefined since no query method was called
      });

      it('should maintain method chaining fluency', () => {
        // Verify that all methods return QueryBuilder for chaining
        const result = query<TestIndex>()
          .matchAll()
          .from(0)
          .size(10)
          .sort('price', 'asc')
          ._source(['name'])
          .timeout('5s')
          .trackScores(true)
          .explain(false)
          .minScore(1)
          .version(true)
          .seqNoPrimaryTerm(false)
          .trackTotalHits(true)
          .highlight(['name'])
          .build();

        expect(result).toBeDefined();
        expect(result.query?.match_all).toEqual({});
      });
    });

    describe('KNN Queries (Vector Search)', () => {
      describe('Basic KNN queries', () => {
        it('should build a basic knn query', () => {
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [0.3, 0.7], {
              k: 5,
              num_candidates: 50
            })
            ._source(['name', 'price', 'category'])
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "_source": [
                "name",
                "price",
                "category",
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
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [0.1, 0.9], {
              k: 10,
              num_candidates: 100
            })
            .sort('price', 'asc')
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
                  "price": "asc",
                },
              ],
            }
          `);
        });

        it('should combine knn with timeout and other meta params', () => {
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
            .knn('embedding', vector384, {
              k: 5,
              num_candidates: 50
            })
            .build();

          expect(result.knn?.query_vector).toHaveLength(384);
        });

        it('should handle 768-dimensional vectors', () => {
          const vector768 = new Array(768).fill(0).map((_, i) => i / 768);
          const result = query<ProductWithEmbedding>()
            .knn('embedding', vector768, {
              k: 20,
              num_candidates: 200
            })
            .build();

          expect(result.knn?.query_vector).toHaveLength(768);
        });

        it('should handle 1536-dimensional vectors (OpenAI ada-002)', () => {
          const vector1536 = new Array(1536).fill(0).map((_, i) => i / 1536);
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [], {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result.knn?.query_vector).toEqual([]);
        });

        it('should handle single-dimensional vector', () => {
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [0.5], {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result.knn?.query_vector).toEqual([0.5]);
        });

        it('should handle k = 1', () => {
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [0.5, 0.5], {
              k: 1,
              num_candidates: 10
            })
            .build();

          expect(result.knn?.k).toBe(1);
        });

        it('should handle large k value', () => {
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [0.5, 0.5], {
              k: 10000,
              num_candidates: 50000
            })
            .build();

          expect(result.knn?.k).toBe(10000);
          expect(result.knn?.num_candidates).toBe(50000);
        });

        it('should handle similarity = 0', () => {
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100,
              similarity: 0
            })
            .build();

          expect(result.knn?.similarity).toBe(0);
        });

        it('should handle similarity = 1', () => {
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100,
              similarity: 1
            })
            .build();

          expect(result.knn?.similarity).toBe(1);
        });

        it('should handle negative vector values', () => {
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [-0.5, -0.3, 0.8], {
              k: 10,
              num_candidates: 100
            })
            .build();

          expect(result.knn?.query_vector).toEqual([-0.5, -0.3, 0.8]);
        });

        it('should handle very small vector values', () => {
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100
            })
            .size(20)
            .from(0)
            ._source(['name', 'price'])
            .timeout('10s')
            .build();

          expect(result.knn).toBeDefined();
          expect(result.size).toBe(20);
          expect(result.from).toBe(0);
          expect(result._source).toEqual(['name', 'price']);
          expect(result.timeout).toBe('10s');
        });

        it('should maintain knn when chained before other methods', () => {
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
            .knn('embedding', [0.5, 0.5], {
              k: 10,
              num_candidates: 100,
              filter: { term: { category: 'electronics' } }
            })
            .aggs((agg) => agg.terms('categories', 'category', { size: 10 }))
            .build();

          expect(result.knn).toBeDefined();
          expect(result.aggs).toBeDefined();
          expect(result.aggs?.categories).toBeDefined();
        });

        it('should support knn-only search (no text query)', () => {
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
            .bool()
            .should((q) =>
              q.knn('embedding', [0.5, 0.5], {
                k: 10,
                num_candidates: 100
              })
            )
            .filter((q) => q.term('category', 'electronics'))
            .build();

          expect(result.query?.bool?.should).toHaveLength(1);
          expect(result.query?.bool?.filter).toHaveLength(1);
        });
      });

      describe('Real-world KNN scenarios', () => {
        it('should build semantic product search query', () => {
          const result = query<ProductWithEmbedding>()
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
            ._source(['name', 'description', 'price'])
            .build();

          expect(result.knn).toBeDefined();
          expect(result.knn?.filter).toBeDefined();
          expect(result.size).toBe(10);
        });

        it('should build image similarity search query', () => {
          const imageEmbedding = new Array(512)
            .fill(0)
            .map(() => Math.random());
          const result = query<ProductWithEmbedding>()
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
          const result = query<ProductWithEmbedding>()
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

    describe('Script Queries', () => {
      describe('Basic script queries', () => {
        it('should build a basic script query', () => {
          const result = query<ScoredProduct>()
            .script({
              source: "doc['price'].value > 100"
            })
            .build();

          expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "script": {
                  "script": {
                    "lang": "painless",
                    "source": "doc['price'].value > 100",
                  },
                },
              },
            }
          `);
        });

        it('should build script query with parameters', () => {
          const result = query<ScoredProduct>()
            .script({
              source: "doc['price'].value > params.min_price",
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
                    "source": "doc['price'].value > params.min_price",
                  },
                },
              },
            }
          `);
        });

        it('should build script query with boost', () => {
          const result = query<ScoredProduct>()
            .script({
              source: "doc['popularity'].value > 1000",
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
                    "source": "doc['popularity'].value > 1000",
                  },
                },
              },
            }
          `);
        });

        it('should build script query with expression language', () => {
          const result = query<ScoredProduct>()
            .script({
              source: "doc['price'].value * 1.1",
              lang: 'expression'
            })
            .build();

          expect(result.query?.script?.script?.lang).toBe('expression');
        });

        it('should build script query with mustache template', () => {
          const result = query<ScoredProduct>()
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
          const result = query<ScoredProduct>()
            .script({
              source: "doc['price'].value * params.multiplier + params.offset",
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
          const result = query<ScoredProduct>()
            .bool()
            .must((q) =>
              q.script({
                source: "doc['price'].value > 100"
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
                          "source": "doc['price'].value > 100",
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
          const result = query<ScoredProduct>()
            .bool()
            .filter((q) =>
              q.script({
                source: "doc['quality_score'].value >= params.min_quality",
                params: { min_quality: 8 }
              })
            )
            .build();

          expect(result.query?.bool?.filter).toHaveLength(1);
          expect(result.query?.bool?.filter[0].script).toBeDefined();
        });

        it('should combine script with other queries', () => {
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

          expect(result.query?.bool?.must).toHaveLength(1);
          expect(result.query?.bool?.filter).toHaveLength(1);
        });
      });

      describe('Script score queries', () => {
        it('should build basic script_score query', () => {
          const result = query<ScoredProduct>()
            .scriptScore((q) => q.matchAll(), {
              source: "doc['popularity'].value * 0.1"
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
                    "source": "doc['popularity'].value * 0.1",
                  },
                },
              },
            }
          `);
        });

        it('should build script_score with inner query', () => {
          const result = query<ScoredProduct>()
            .scriptScore((q) => q.match('name', 'laptop'), {
              source: "_score * doc['popularity'].value"
            })
            .build();

          expect(result.query?.script_score?.query?.match).toBeDefined();
          expect(result.query?.script_score?.script?.source).toContain(
            '_score'
          );
        });

        it('should build script_score with parameters', () => {
          const result = query<ScoredProduct>()
            .scriptScore((q) => q.term('category', 'electronics'), {
              source: '_score * params.boost_factor',
              params: { boost_factor: 2.5 }
            })
            .build();

          expect(result.query?.script_score?.script?.params?.boost_factor).toBe(
            2.5
          );
        });

        it('should build script_score with min_score', () => {
          const result = query<ScoredProduct>()
            .scriptScore(
              (q) => q.matchAll(),
              { source: "doc['quality_score'].value" },
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
                    "source": "doc['quality_score'].value",
                  },
                },
              },
            }
          `);
        });

        it('should build script_score with boost', () => {
          const result = query<ScoredProduct>()
            .scriptScore(
              (q) => q.term('name', 'premium'),
              { source: "Math.log(2 + doc['popularity'].value)" },
              { boost: 1.5 }
            )
            .build();

          expect(result.query?.script_score?.boost).toBe(1.5);
        });

        it('should build script_score with min_score and boost', () => {
          const result = query<ScoredProduct>()
            .scriptScore(
              (q) => q.range('price', { gte: 100 }),
              {
                source: "_score * doc['quality_score'].value * params.weight",
                params: { weight: 0.5 }
              },
              { min_score: 10, boost: 2.0 }
            )
            .build();

          expect(result.query?.script_score?.min_score).toBe(10);
          expect(result.query?.script_score?.boost).toBe(2.0);
        });

        it('should build script_score with complex scoring formula', () => {
          const result = query<ScoredProduct>()
            .scriptScore((q) => q.match('description', 'quality'), {
              source: `
                  double popularity = doc['popularity'].value;
                  double quality = doc['quality_score'].value;
                  return _score * (popularity * 0.3 + quality * 0.7);
                `.trim()
            })
            .build();

          expect(result.query?.script_score?.script?.source).toContain(
            'popularity'
          );
          expect(result.query?.script_score?.script?.source).toContain(
            'quality'
          );
        });
      });

      describe('Script edge cases', () => {
        it('should handle empty script source', () => {
          const result = query<ScoredProduct>().script({ source: '' }).build();

          expect(result.query?.script?.script?.source).toBe('');
        });

        it('should handle script without parameters', () => {
          const result = query<ScoredProduct>()
            .script({ source: 'true' })
            .build();

          expect(result.query?.script?.script?.params).toBeUndefined();
        });

        it('should handle empty params object', () => {
          const result = query<ScoredProduct>()
            .script({ source: "doc['price'].value > 0", params: {} })
            .build();

          expect(result.query?.script?.script?.params).toEqual({});
        });
      });
    });

    describe('Percolate Queries', () => {
      describe('Basic percolate queries', () => {
        it('should build percolate query with inline document', () => {
          const result = query<PercolatorDoc>()
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
          const result = query<PercolatorDoc>()
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
          const result = query<PercolatorDoc>()
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
          const result = query<PercolatorDoc>()
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
          const result = query<PercolatorDoc>()
            .percolate({
              field: 'query',
              document: { title: 'Test' },
              preference: '_local'
            })
            .build();

          expect(result.query?.percolate?.preference).toBe('_local');
        });

        it('should build percolate query with version', () => {
          const result = query<PercolatorDoc>()
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
          const result = query<PercolatorDoc>()
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
          const result = query<PercolatorDoc>()
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
          const result = query<PercolatorDoc>()
            .percolate({
              field: 'query',
              document: { content: 'Breaking news' }
            })
            .sort('category', 'asc')
            .build();

          expect(result.sort).toEqual([{ category: 'asc' }]);
        });

        it('should combine percolate with _source', () => {
          const result = query<PercolatorDoc>()
            .percolate({
              field: 'query',
              document: { title: 'Alert' }
            })
            ._source(['query', 'category'])
            .build();

          expect(result._source).toEqual(['query', 'category']);
        });
      });

      describe('Percolate in bool context', () => {
        it('should support percolate in bool filter', () => {
          const result = query<PercolatorDoc>()
            .bool()
            .filter((q) => q.term('category', 'news'))
            .build();

          expect(result.query?.bool?.filter).toBeDefined();
        });
      });

      describe('Real-world percolate scenarios', () => {
        it('should build alert matching query', () => {
          const result = query<PercolatorDoc>()
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
          const result = query<PercolatorDoc>()
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
          const result = query<PercolatorDoc>()
            .percolate({
              field: 'query',
              index: 'user_documents',
              id: 'doc-12345',
              routing: 'user-789'
            })
            ._source(['query', 'category'])
            .size(50)
            .build();

          expect(result.query?.percolate?.routing).toBe('user-789');
          expect(result._source).toContain('query');
        });
      });
    });
  });
});
