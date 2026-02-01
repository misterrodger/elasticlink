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
        const result = query<TestIndex>()
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
        const result = query<TestIndex>()
          .ids(['single-id'])
          .build();

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
          .nested('type' as any, (q) =>
            q.match('comments.author', 'john')
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
              },
            },
          }
        `);
      });

      it('should build a nested query with multiple term queries', () => {
        const result = query<TestIndex>()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .nested('name' as any, (q) =>
            q.term('status', 'approved')
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
          .nested('type' as any, (q: any) =>
            q.match('author', 'john')
          )
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
          .when(
            searchTerm,
            (q) => q.match('type', searchTerm)
          )!
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
          .must((q) =>
            q.when(
              type,
              (q2) => q2.term('type', type)
            ) || q.matchAll()
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
          .filter((q) =>
            q.when(
              minPrice,
              (q2) => q2.range('price', { gte: minPrice })
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
              q.when(
                searchTerm,
                (q2) => q2.match('name', searchTerm)
              ) || q.matchAll()
          )
          .filter(
            (q) =>
              q.when(
                type,
                (q2) => q2.term('type', type)
              ) || q.matchAll()
          )
          .filter(
            (q) =>
              q.when(
                minPrice,
                (q2) => q2.range('price', { gte: minPrice })
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
          .when(
            searchTerm,
            (q) => q.match('type', searchTerm)
          )
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should use when with 0 (falsy)', () => {
        const minPrice = 0;
        const result = query<TestIndex>()
          .when(
            minPrice,
            (q) => q.range('price', { gte: minPrice })
          )
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should use when with empty array (falsy)', () => {
        const ids: string[] = [];
        const result = query<TestIndex>()
          .when(
            ids.length > 0,
            (q) => q.ids(ids)
          )
          ?.build();

        expect(result).toMatchInlineSnapshot(`undefined`);
      });

      it('should use when with non-empty array (truthy)', () => {
        const ids = ['id1', 'id2'];
        const result = query<TestIndex>()
          .when(
            ids.length > 0,
            (q) => q.ids(ids)
          )!
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
          .filter((q) => q.matchPhrasePrefix('type', 'test', { max_expansions: 5 }))
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
        .regexp('category', 'rest.*', { flags: 'CASE_INSENSITIVE', boost: 2.0 })
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
        .constantScore((q) => q.term('category', 'restaurants'), { boost: 1.5 })
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

      expect(result.query?.bool?.must).toBeDefined();
      expect(result.query?.bool?.filter).toBeDefined();
      expect(result.aggs?.by_category?.terms).toBeDefined();
      expect(result.aggs?.by_category?.aggs?.avg_price).toBeDefined();
      expect(result.aggs?.by_category?.aggs?.max_rating).toBeDefined();
      expect(result.size).toBe(20);
    });

    it('should allow aggregations without query methods when using query()', () => {
      const result = query<TestIndex2>()
        .aggs((agg) => agg.sum('total_price', 'price'))
        .build();

      // With query() (default), query field is preserved even if undefined
      expect(result.aggs?.total_price).toBeDefined();
    });
  });
});
});
