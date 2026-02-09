import { query, suggest } from '..';
import { Matter } from './fixtures/legal.js';

type MatterWithSuggest = Matter & { title_suggest: string };

describe('Suggester API', () => {
  describe('Builder behavior', () => {
    it('should return empty suggest object for empty build', () => {
      const result = suggest<MatterWithSuggest>().build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {},
        }
      `);
    });

    it('should overwrite suggester when same name is used twice', () => {
      const result = suggest<MatterWithSuggest>()
        .term('spell-check', 'acquistion', { field: 'title' })
        .term('spell-check', 'corprate', { field: 'practice_area' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "spell-check": {
              "term": {
                "field": "practice_area",
              },
              "text": "corprate",
            },
          },
        }
      `);
    });
  });

  describe('Term Suggester', () => {
    it('should build basic term suggester', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-suggestions', 'acquistion', {
          field: 'title'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should build term suggester with size', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-suggestions', 'acquistion', {
          field: 'title',
          size: 5
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
                "size": 5,
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should build term suggester with suggest_mode', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-suggestions', 'acquistion', {
          field: 'title',
          suggest_mode: 'popular'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
                "suggest_mode": "popular",
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should build term suggester with string_distance', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-suggestions', 'acquistion', {
          field: 'title',
          string_distance: 'levenshtein'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
                "string_distance": "levenshtein",
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should build term suggester with max_edits', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-suggestions', 'acquistion', {
          field: 'title',
          max_edits: 2
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
                "max_edits": 2,
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should build term suggester with sort option', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-suggestions', 'acquistion', {
          field: 'title',
          sort: 'frequency'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
                "sort": "frequency",
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should build term suggester with prefix_length option', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-suggestions', 'acquistion', {
          field: 'title',
          prefix_length: 3
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
                "prefix_length": 3,
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should build term suggester with all options', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-suggestions', 'acquistion', {
          field: 'title',
          size: 5,
          sort: 'score',
          suggest_mode: 'popular',
          max_edits: 2,
          prefix_length: 1,
          min_word_length: 4,
          min_doc_freq: 0.01
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
                "max_edits": 2,
                "min_doc_freq": 0.01,
                "min_word_length": 4,
                "prefix_length": 1,
                "size": 5,
                "sort": "score",
                "suggest_mode": "popular",
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });
  });

  describe('Phrase Suggester', () => {
    it('should build basic phrase suggester', () => {
      const result = suggest<MatterWithSuggest>()
        .phrase('description-suggestions', 'powerfull laptop', {
          field: 'title'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "description-suggestions": {
              "phrase": {
                "field": "title",
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });

    it('should build phrase suggester with confidence', () => {
      const result = suggest<MatterWithSuggest>()
        .phrase('description-suggestions', 'powerfull laptop', {
          field: 'title',
          confidence: 2.0
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "description-suggestions": {
              "phrase": {
                "confidence": 2,
                "field": "title",
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });

    it('should build phrase suggester with direct_generator', () => {
      const result = suggest<MatterWithSuggest>()
        .phrase('description-suggestions', 'powerfull laptop', {
          field: 'title',
          direct_generator: [
            {
              field: 'title',
              suggest_mode: 'always',
              min_word_length: 1
            }
          ]
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "description-suggestions": {
              "phrase": {
                "direct_generator": [
                  {
                    "field": "title",
                    "min_word_length": 1,
                    "suggest_mode": "always",
                  },
                ],
                "field": "title",
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });

    it('should build phrase suggester with highlighting', () => {
      const result = suggest<MatterWithSuggest>()
        .phrase('description-suggestions', 'powerfull laptop', {
          field: 'title',
          highlight: {
            pre_tag: '<em>',
            post_tag: '</em>'
          }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "description-suggestions": {
              "phrase": {
                "field": "title",
                "highlight": {
                  "post_tag": "</em>",
                  "pre_tag": "<em>",
                },
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });

    it('should build phrase suggester with collate', () => {
      const result = suggest<MatterWithSuggest>()
        .phrase('description-suggestions', 'powerfull laptop', {
          field: 'title',
          collate: {
            query: {
              source: '{ "match": { "{{field_name}}": "{{suggestion}}" } }'
            },
            params: { field_name: 'description' },
            prune: true
          }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "description-suggestions": {
              "phrase": {
                "collate": {
                  "params": {
                    "field_name": "description",
                  },
                  "prune": true,
                  "query": {
                    "source": "{ "match": { "{{field_name}}": "{{suggestion}}" } }",
                  },
                },
                "field": "title",
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });

    it('should build phrase suggester with size option', () => {
      const result = suggest<MatterWithSuggest>()
        .phrase('description-suggestions', 'powerfull laptop', {
          field: 'title',
          size: 5
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "description-suggestions": {
              "phrase": {
                "field": "title",
                "size": 5,
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });

    it('should build phrase suggester with gram_size option', () => {
      const result = suggest<MatterWithSuggest>()
        .phrase('description-suggestions', 'powerfull laptop', {
          field: 'title',
          gram_size: 2
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "description-suggestions": {
              "phrase": {
                "field": "title",
                "gram_size": 2,
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });

    it('should build phrase suggester with all options', () => {
      const result = suggest<MatterWithSuggest>()
        .phrase('description-suggestions', 'powerfull laptop', {
          field: 'title',
          size: 3,
          real_word_error_likelihood: 0.95,
          confidence: 2.0,
          max_errors: 0.5,
          gram_size: 3,
          highlight: {
            pre_tag: '<em>',
            post_tag: '</em>'
          }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "description-suggestions": {
              "phrase": {
                "confidence": 2,
                "field": "title",
                "gram_size": 3,
                "highlight": {
                  "post_tag": "</em>",
                  "pre_tag": "<em>",
                },
                "max_errors": 0.5,
                "real_word_error_likelihood": 0.95,
                "size": 3,
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });
  });

  describe('Completion Suggester', () => {
    it('should build basic completion suggester', () => {
      const result = suggest<MatterWithSuggest>()
        .completion('autocomplete', 'lap', {
          field: 'title_suggest'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "autocomplete": {
              "completion": {
                "field": "title_suggest",
              },
              "prefix": "lap",
            },
          },
        }
      `);
    });

    it('should build completion suggester with size', () => {
      const result = suggest<MatterWithSuggest>()
        .completion('autocomplete', 'lap', {
          field: 'title_suggest',
          size: 10
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "autocomplete": {
              "completion": {
                "field": "title_suggest",
                "size": 10,
              },
              "prefix": "lap",
            },
          },
        }
      `);
    });

    it('should build completion suggester with skip_duplicates', () => {
      const result = suggest<MatterWithSuggest>()
        .completion('autocomplete', 'lap', {
          field: 'title_suggest',
          skip_duplicates: true
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "autocomplete": {
              "completion": {
                "field": "title_suggest",
                "skip_duplicates": true,
              },
              "prefix": "lap",
            },
          },
        }
      `);
    });

    it('should build completion suggester with fuzzy matching', () => {
      const result = suggest<MatterWithSuggest>()
        .completion('autocomplete', 'lap', {
          field: 'title_suggest',
          fuzzy: {
            fuzziness: 'AUTO',
            transpositions: true,
            min_length: 3,
            prefix_length: 1
          }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "autocomplete": {
              "completion": {
                "field": "title_suggest",
                "fuzzy": {
                  "fuzziness": "AUTO",
                  "min_length": 3,
                  "prefix_length": 1,
                  "transpositions": true,
                },
              },
              "prefix": "lap",
            },
          },
        }
      `);
    });

    it('should build completion suggester with contexts', () => {
      const result = suggest<MatterWithSuggest>()
        .completion('autocomplete', 'lap', {
          field: 'title_suggest',
          contexts: {
            category: 'electronics'
          }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "autocomplete": {
              "completion": {
                "contexts": {
                  "category": "electronics",
                },
                "field": "title_suggest",
              },
              "prefix": "lap",
            },
          },
        }
      `);
    });

    it('should build completion suggester with all options', () => {
      const result = suggest<MatterWithSuggest>()
        .completion('autocomplete', 'lap', {
          field: 'title_suggest',
          size: 10,
          skip_duplicates: true,
          fuzzy: {
            fuzziness: 2,
            transpositions: true,
            min_length: 3,
            prefix_length: 1,
            unicode_aware: false
          },
          contexts: {
            category: ['electronics', 'computers']
          }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "autocomplete": {
              "completion": {
                "contexts": {
                  "category": [
                    "electronics",
                    "computers",
                  ],
                },
                "field": "title_suggest",
                "fuzzy": {
                  "fuzziness": 2,
                  "min_length": 3,
                  "prefix_length": 1,
                  "transpositions": true,
                  "unicode_aware": false,
                },
                "size": 10,
                "skip_duplicates": true,
              },
              "prefix": "lap",
            },
          },
        }
      `);
    });
  });

  describe('Multiple Suggesters', () => {
    it('should combine multiple phrase suggesters', () => {
      const result = suggest<MatterWithSuggest>()
        .phrase('name-phrase', 'powerfull laptop', { field: 'title' })
        .phrase('desc-phrase', 'garming keybord', { field: 'title' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "desc-phrase": {
              "phrase": {
                "field": "title",
              },
              "text": "garming keybord",
            },
            "name-phrase": {
              "phrase": {
                "field": "title",
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });

    it('should combine multiple completion suggesters', () => {
      const result = suggest<MatterWithSuggest>()
        .completion('name-auto', 'lap', { field: 'title' })
        .completion('category-auto', 'ele', { field: 'practice_area' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "category-auto": {
              "completion": {
                "field": "practice_area",
              },
              "prefix": "ele",
            },
            "name-auto": {
              "completion": {
                "field": "title",
              },
              "prefix": "lap",
            },
          },
        }
      `);
    });

    it('should combine multiple term suggesters', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-suggestions', 'acquistion', { field: 'title' })
        .term('category-suggestions', 'electornics', { field: 'practice_area' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "category-suggestions": {
              "term": {
                "field": "practice_area",
              },
              "text": "electornics",
            },
            "name-suggestions": {
              "term": {
                "field": "title",
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should combine different suggester types', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-term', 'acquistion', { field: 'title' })
        .phrase('description-phrase', 'powerfull laptop', {
          field: 'title'
        })
        .completion('name-complete', 'lap', { field: 'title_suggest' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "suggest": {
            "description-phrase": {
              "phrase": {
                "field": "title",
              },
              "text": "powerfull laptop",
            },
            "name-complete": {
              "completion": {
                "field": "title_suggest",
              },
              "prefix": "lap",
            },
            "name-term": {
              "term": {
                "field": "title",
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });
  });

  describe('Suggester with QueryBuilder', () => {
    it('should add term suggester to query', () => {
      const result = query<MatterWithSuggest>()
        .match('practice_area', 'corporate')
        .suggest((s) =>
          s.term('name-suggestions', 'acquistion', { field: 'title' })
        )
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "practice_area": "corporate",
            },
          },
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should add phrase suggester to query', () => {
      const result = query<MatterWithSuggest>()
        .match('practice_area', 'corporate')
        .suggest((s) =>
          s.phrase('description-suggestions', 'powerfull laptop', {
            field: 'title',
            confidence: 2.0
          })
        )
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "practice_area": "corporate",
            },
          },
          "suggest": {
            "description-suggestions": {
              "phrase": {
                "confidence": 2,
                "field": "title",
              },
              "text": "powerfull laptop",
            },
          },
        }
      `);
    });

    it('should add completion suggester to query', () => {
      const result = query<MatterWithSuggest>()
        .match('practice_area', 'corporate')
        .suggest((s) =>
          s.completion('autocomplete', 'lap', {
            field: 'title_suggest',
            size: 5
          })
        )
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "practice_area": "corporate",
            },
          },
          "suggest": {
            "autocomplete": {
              "completion": {
                "field": "title_suggest",
                "size": 5,
              },
              "prefix": "lap",
            },
          },
        }
      `);
    });

    it('should add multiple suggesters to query', () => {
      const result = query<MatterWithSuggest>()
        .match('practice_area', 'corporate')
        .suggest((s) =>
          s
            .term('name-term', 'acquistion', { field: 'title', size: 3 })
            .completion('name-complete', 'lap', {
              field: 'title_suggest',
              size: 5
            })
        )
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "practice_area": "corporate",
            },
          },
          "suggest": {
            "name-complete": {
              "completion": {
                "field": "title_suggest",
                "size": 5,
              },
              "prefix": "lap",
            },
            "name-term": {
              "term": {
                "field": "title",
                "size": 3,
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should combine query, aggregations, and suggestions', () => {
      const result = query<MatterWithSuggest>()
        .match('practice_area', 'corporate')
        .aggs((agg) =>
          agg.terms('popular-areas', 'practice_area', { size: 10 })
        )
        .suggest((s) =>
          s.term('name-suggestions', 'acquistion', { field: 'title', size: 5 })
        )
        .size(20)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aggs": {
            "popular-areas": {
              "terms": {
                "field": "practice_area",
                "size": 10,
              },
            },
          },
          "query": {
            "match": {
              "practice_area": "corporate",
            },
          },
          "size": 20,
          "suggest": {
            "name-suggestions": {
              "term": {
                "field": "title",
                "size": 5,
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });
  });

  describe('Suggester method chaining', () => {
    it('should support fluent chaining', () => {
      const result = suggest<MatterWithSuggest>()
        .term('name-term', 'acquistion', { field: 'title' })
        .phrase('desc-phrase', 'powerfull', { field: 'title' })
        .completion('auto', 'lap', { field: 'title_suggest' })
        .build();

      expect(result.suggest).toHaveProperty('name-term');
      expect(result.suggest).toHaveProperty('desc-phrase');
      expect(result.suggest).toHaveProperty('auto');
    });
  });

  describe('Real-world suggester scenarios', () => {
    it('should build product search with autocomplete', () => {
      const result = query<MatterWithSuggest>()
        .bool()
        .filter((q) => q.term('practice_area', 'corporate'))
        .suggest((s) =>
          s.completion('product-autocomplete', 'lapt', {
            field: 'title_suggest',
            size: 10,
            fuzzy: {
              fuzziness: 'AUTO',
              prefix_length: 1
            },
            skip_duplicates: true
          })
        )
        .size(0)
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "bool": {
              "filter": [
                {
                  "term": {
                    "practice_area": "corporate",
                  },
                },
              ],
            },
          },
          "size": 0,
          "suggest": {
            "product-autocomplete": {
              "completion": {
                "field": "title_suggest",
                "fuzzy": {
                  "fuzziness": "AUTO",
                  "prefix_length": 1,
                },
                "size": 10,
                "skip_duplicates": true,
              },
              "prefix": "lapt",
            },
          },
        }
      `);
    });

    it('should build spell-check with term suggester', () => {
      const result = query<MatterWithSuggest>()
        .match('title', 'acquistion')
        .suggest((s) =>
          s.term('spelling-correction', 'acquistion', {
            field: 'title',
            size: 3,
            suggest_mode: 'popular',
            string_distance: 'levenshtein',
            max_edits: 2,
            prefix_length: 0,
            min_word_length: 3
          })
        )
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "title": "acquistion",
            },
          },
          "suggest": {
            "spelling-correction": {
              "term": {
                "field": "title",
                "max_edits": 2,
                "min_word_length": 3,
                "prefix_length": 0,
                "size": 3,
                "string_distance": "levenshtein",
                "suggest_mode": "popular",
              },
              "text": "acquistion",
            },
          },
        }
      `);
    });

    it('should build phrase correction with highlighting', () => {
      const result = query<MatterWithSuggest>()
        .match('title', 'powerfull gaming laptop')
        .suggest((s) =>
          s.phrase('phrase-correction', 'powerfull gaming laptop', {
            field: 'title',
            size: 3,
            confidence: 1.5,
            max_errors: 1,
            highlight: {
              pre_tag: '<strong>',
              post_tag: '</strong>'
            },
            direct_generator: [
              {
                field: 'title',
                suggest_mode: 'always',
                max_edits: 2,
                min_word_length: 3
              }
            ]
          })
        )
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "query": {
            "match": {
              "title": "powerfull gaming laptop",
            },
          },
          "suggest": {
            "phrase-correction": {
              "phrase": {
                "confidence": 1.5,
                "direct_generator": [
                  {
                    "field": "title",
                    "max_edits": 2,
                    "min_word_length": 3,
                    "suggest_mode": "always",
                  },
                ],
                "field": "title",
                "highlight": {
                  "post_tag": "</strong>",
                  "pre_tag": "<strong>",
                },
                "max_errors": 1,
                "size": 3,
              },
              "text": "powerfull gaming laptop",
            },
          },
        }
      `);
    });
  });
});
