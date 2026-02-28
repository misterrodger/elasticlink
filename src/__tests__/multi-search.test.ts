import { query, msearch } from '..';
import { matterMappings } from './fixtures/legal.js';

describe('Multi-Search API', () => {
  describe('add() method', () => {
    it('should add a raw MSearchRequest with header and body', () => {
      const body = query(matterMappings).matchAll().build();
      const result = msearch(matterMappings)
        .add({ header: { index: 'matters' }, body })
        .build();

      expect(result).toMatchInlineSnapshot(`
        "{"index":"matters"}
        {"query":{"match_all":{}}}
        "
      `);
    });

    it('should add a raw MSearchRequest without header', () => {
      const body = query(matterMappings).match('title', 'acquisition').build();
      const result = msearch(matterMappings).add({ body }).buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {},
          {
            "query": {
              "match": {
                "title": "acquisition",
              },
            },
          },
        ]
      `);
    });
  });

  describe('Basic multi-search', () => {
    it('should build empty multi-search', () => {
      const result = msearch(matterMappings).build();

      expect(result).toBe('\n');
    });

    it('should build single search', () => {
      const q1 = query(matterMappings).match('title', 'acquisition').build();
      const result = msearch(matterMappings).addQuery(q1).build();

      expect(result).toMatchInlineSnapshot(`
        "{}
        {"query":{"match":{"title":"acquisition"}}}
        "
      `);
    });

    it('should build multiple searches', () => {
      const q1 = query(matterMappings).match('title', 'acquisition').build();
      const q2 = query(matterMappings).term('practice_area', 'corporate').build();

      const result = msearch(matterMappings).addQuery(q1).addQuery(q2).build();

      expect(result).toMatchInlineSnapshot(`
        "{}
        {"query":{"match":{"title":"acquisition"}}}
        {}
        {"query":{"term":{"practice_area":"corporate"}}}
        "
      `);
    });
  });

  describe('Multi-search with headers', () => {
    it('should add index to header', () => {
      const q1 = query(matterMappings).matchAll().build();
      const result = msearch(matterMappings).addQuery(q1, { index: 'matters' }).build();

      expect(result).toMatchInlineSnapshot(`
        "{"index":"matters"}
        {"query":{"match_all":{}}}
        "
      `);
    });

    it('should add multiple indices', () => {
      const q1 = query(matterMappings).matchAll().build();
      const result = msearch(matterMappings)
        .addQuery(q1, { index: ['matters-1', 'matters-2'] })
        .build();

      expect(result).toMatchInlineSnapshot(`
        "{"index":["matters-1","matters-2"]}
        {"query":{"match_all":{}}}
        "
      `);
    });

    it('should add routing', () => {
      const q1 = query(matterMappings).matchAll().build();
      const result = msearch(matterMappings).addQuery(q1, { routing: 'user-123' }).build();

      expect(result).toMatchInlineSnapshot(`
        "{"routing":"user-123"}
        {"query":{"match_all":{}}}
        "
      `);
    });

    it('should add preference', () => {
      const q1 = query(matterMappings).matchAll().build();
      const result = msearch(matterMappings).addQuery(q1, { preference: '_local' }).build();

      expect(result).toMatchInlineSnapshot(`
        "{"preference":"_local"}
        {"query":{"match_all":{}}}
        "
      `);
    });

    it('should add search_type', () => {
      const q1 = query(matterMappings).matchAll().build();
      const result = msearch(matterMappings).addQuery(q1, { search_type: 'dfs_query_then_fetch' }).build();

      expect(result).toMatchInlineSnapshot(`
        "{"search_type":"dfs_query_then_fetch"}
        {"query":{"match_all":{}}}
        "
      `);
    });

    it('should combine index and routing in header', () => {
      const q1 = query(matterMappings).matchAll().build();
      const result = msearch(matterMappings).addQuery(q1, { index: 'matters', routing: 'tenant-1' }).buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": "matters",
            "routing": "tenant-1",
          },
          {
            "query": {
              "match_all": {},
            },
          },
        ]
      `);
    });

    it('should combine index and search_type in header', () => {
      const q1 = query(matterMappings).matchAll().build();
      const result = msearch(matterMappings)
        .addQuery(q1, {
          index: 'matters',
          search_type: 'dfs_query_then_fetch'
        })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": "matters",
            "search_type": "dfs_query_then_fetch",
          },
          {
            "query": {
              "match_all": {},
            },
          },
        ]
      `);
    });
  });

  describe('Multi-search output formats', () => {
    it('should build as NDJSON string', () => {
      const q1 = query(matterMappings).match('title', 'test').build();
      const result = msearch(matterMappings).addQuery(q1).build();

      expect(result).toMatchInlineSnapshot(`
        "{}
        {"query":{"match":{"title":"test"}}}
        "
      `);
    });

    it('should build as array', () => {
      const q1 = query(matterMappings).match('title', 'test').build();
      const result = msearch(matterMappings).addQuery(q1).buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {},
          {
            "query": {
              "match": {
                "title": "test",
              },
            },
          },
        ]
      `);
    });

    it('should alternate headers and bodies in array', () => {
      const q1 = query(matterMappings).match('title', 'acquisition').build();
      const q2 = query(matterMappings).term('practice_area', 'corporate').build();

      const result = msearch(matterMappings)
        .addQuery(q1, { index: 'matters-1' })
        .addQuery(q2, { index: 'matters-2' })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": "matters-1",
          },
          {
            "query": {
              "match": {
                "title": "acquisition",
              },
            },
          },
          {
            "index": "matters-2",
          },
          {
            "query": {
              "term": {
                "practice_area": "corporate",
              },
            },
          },
        ]
      `);
    });
  });

  describe('Multi-search method chaining', () => {
    it('should support fluent chaining', () => {
      const q1 = query(matterMappings).match('title', 'acquisition').build();
      const q2 = query(matterMappings).term('practice_area', 'corporate').build();
      const q3 = query(matterMappings).range('billing_rate', { gte: 100 }).build();

      const result = msearch(matterMappings)
        .addQuery(q1, { index: 'matters' })
        .addQuery(q2, { index: 'matters' })
        .addQuery(q3, { index: 'matters' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        "{"index":"matters"}
        {"query":{"match":{"title":"acquisition"}}}
        {"index":"matters"}
        {"query":{"term":{"practice_area":"corporate"}}}
        {"index":"matters"}
        {"query":{"range":{"billing_rate":{"gte":100}}}}
        "
      `);
    });
  });

  describe('Complex query bodies', () => {
    it('should addQuery with bool query including size and from', () => {
      const complexQuery = query(matterMappings)
        .bool()
        .must((q) => q.match('title', 'acquisition'))
        .filter((q) => q.range('billing_rate', { gte: 100, lte: 2000 }))
        .size(10)
        .from(0)
        .build();

      const result = msearch(matterMappings).addQuery(complexQuery, { index: 'matters' }).buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": "matters",
          },
          {
            "from": 0,
            "query": {
              "bool": {
                "filter": [
                  {
                    "range": {
                      "billing_rate": {
                        "gte": 100,
                        "lte": 2000,
                      },
                    },
                  },
                ],
                "must": [
                  {
                    "match": {
                      "title": "acquisition",
                    },
                  },
                ],
              },
            },
            "size": 10,
          },
        ]
      `);
    });
  });

  describe('Real-world multi-search scenarios', () => {
    it('should search across multiple indices', () => {
      const acquisitionQuery = query(matterMappings)
        .match('title', 'acquisition')
        .range('billing_rate', { gte: 500, lte: 2000 })
        .build();

      const complianceQuery = query(matterMappings)
        .match('title', 'compliance')
        .range('billing_rate', { gte: 300, lte: 1000 })
        .build();

      const result = msearch(matterMappings)
        .addQuery(acquisitionQuery, { index: 'matters' })
        .addQuery(complianceQuery, { index: 'matters' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        "{"index":"matters"}
        {"query":{"range":{"billing_rate":{"gte":500,"lte":2000}}}}
        {"index":"matters"}
        {"query":{"range":{"billing_rate":{"gte":300,"lte":1000}}}}
        "
      `);
    });

    it('should search with different preferences', () => {
      const localQuery = query(matterMappings).matchAll().size(10).build();
      const primaryQuery = query(matterMappings).matchAll().size(20).build();

      const result = msearch(matterMappings)
        .addQuery(localQuery, { preference: '_local' })
        .addQuery(primaryQuery, { preference: '_primary' })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "preference": "_local",
          },
          {
            "query": {
              "match_all": {},
            },
            "size": 10,
          },
          {
            "preference": "_primary",
          },
          {
            "query": {
              "match_all": {},
            },
            "size": 20,
          },
        ]
      `);
    });
  });
});
