import { query } from '..';

type TestIndex = {
  title: string;
  name: string;
  price: number;
  size: number;
};

describe('QueryBuilder', () => {
  describe('Root-level', () => {
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
      const result = query<TestIndex>().match('title', 'test title').build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "match": {
                  "title": "test title",
                },
              },
            }
          `);
    });

    it('should build a multi_match query', () => {
      const result = query<TestIndex>()
        .multiMatch(['title', 'name'], 'test')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "multi_match": {
              "fields": [
                "title",
                "name",
              ],
              "query": "test",
            },
          },
        }
      `);
    });

    it('should build a match_phrase query', () => {
      const result = query<TestIndex>().matchPhrase('title', 'test').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match_phrase": {
              "title": "test",
            },
          },
        }
      `);
    });

    it('should build a term query', () => {
      const result = query<TestIndex>().term('title', 'test').build();

      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "term": {
                     "title": "test",
                   },
                 },
               }
            `);
    });

    it('should build a terms query', () => {
      const result = query<TestIndex>()
        .terms('title', ['test', 'title'])
        .build();

      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "terms": {
                     "title": [
                       "test",
                       "title",
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
      const result = query<TestIndex>().exists('title').build();

      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "exists": {
                     "field": "title",
                   },
                 },
               }
            `);
    });

    it('should build a prefix query', () => {
      const result = query<TestIndex>().prefix('title', 'test').build();
      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "prefix": {
                     "title": "test",
                   },
                 },
               }
            `);
    });

    it('should build a wildcard query', () => {
      const result = query<TestIndex>().wildcard('title', 'test').build();

      expect(result).toMatchInlineSnapshot(`
               {
                 "query": {
                   "wildcard": {
                     "title": "test",
                   },
                 },
               }
            `);
    });

    // it('should add a conditional query when defined', () => {
    //   const title = 'title exists';
    //   const result = query<TestIndex>()
    //     .bool()
    //     .filter((q) => q.when(title, q.term('title', title)))
    //     ._build();

    //   expect(result).toMatchInlineSnapshot(`
    //            {
    //              "query": {
    //                "bool": {
    //                  "filter": [
    //                    {
    //                      "term": {
    //                        "title": "title exists",
    //                      },
    //                    },
    //                  ],
    //                },
    //              },
    //            }
    //         `);
    // });

    // it('should NOT add a conditional query when undefined', () => {
    //   const title = undefined;
    //   const result = query<TestIndex>()
    //     .bool()
    //     .filter((q) => q.when(title, q.term('title', title!))) // TBD - fix this
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
        .must((q) => q.match('title', 'test title'))
        .build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "must": [
                    {
                      "match": {
                        "title": "test title",
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
        .must((q) => q.match('title', 'test title'))
        .must((q) => q.match('price', 42))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "title": "test title",
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
        .mustNot((q) => q.match('title', 'test title'))
        .build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "must_not": [
                    {
                      "match": {
                        "title": "test title",
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
        .mustNot((q) => q.match('title', 'test title'))
        .mustNot((q) => q.match('price', 42))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must_not": [
                {
                  "match": {
                    "title": "test title",
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
        .should((q) => q.match('title', 'test title'))
        .build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "should": [
                    {
                      "match": {
                        "title": "test title",
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
        .should((q) => q.match('title', 'test title'))
        .should((q) => q.match('price', 42))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "should": [
                {
                  "match": {
                    "title": "test title",
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
        .filter((q) => q.match('title', 'test title'))
        .build();

      expect(result).toMatchInlineSnapshot(`
            {
              "query": {
                "bool": {
                  "filter": [
                    {
                      "match": {
                        "title": "test title",
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
        .must((q) => q.match('title', 'test title'))
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
                        "title": "test title",
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
        .must((q) => q.exists('title'))
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
                    "field": "title",
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
        .must((q) => q.prefix('title', 'pr'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "prefix": {
                    "title": "pr",
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
        .must((q) => q.multiMatch(['name', 'title'], 'test'))
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
                      "title",
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
        .must((q) => q.matchPhrase('title', 'test'))
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "must": [
                {
                  "match_phrase": {
                    "title": "test",
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
