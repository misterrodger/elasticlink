import { queryBuilder, indexBuilder, mappings, text, keyword, join } from '../../index.js';
import { ensureIndex, deleteIndex, indexDoc, refreshIndex, search, esPost } from '../helpers';
import { instrumentMappings } from '../../__tests__/fixtures/finance.schema.js';
import { INSTRUMENTS } from '../../__tests__/fixtures/finance.data.js';

const INDEX = 'int-query';

describe('QueryBuilder', () => {
  beforeAll(async () => {
    await ensureIndex(INDEX, indexBuilder().mappings(instrumentMappings).build());
    for (const doc of INSTRUMENTS) await indexDoc(INDEX, doc);
    await refreshIndex(INDEX);
  });

  afterAll(() => deleteIndex(INDEX));

  describe('Query — matchAll', () => {
    it('returns all documents', async () => {
      const result = await search(INDEX, queryBuilder(instrumentMappings).matchAll().build());

      expect(result.hits.total.value).toBe(4);
    });

    it('respects size and from for pagination', async () => {
      const result = await search(INDEX, queryBuilder(instrumentMappings).matchAll().size(2).from(1).build());

      expect(result.hits.hits).toHaveLength(2);
    });
  });

  describe('Query — term and terms', () => {
    it('filters by a single term', async () => {
      const result = await search(INDEX, queryBuilder(instrumentMappings).term('asset_class', 'equity').build());

      expect(result.hits.total.value).toBe(2);
    });

    it('filters by multiple terms', async () => {
      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings).terms('sector', ['government', 'corporate']).build()
      );

      expect(result.hits.total.value).toBe(2);
    });
  });

  describe('Query — range', () => {
    it('filters documents within a numeric range', async () => {
      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings).range('yield_rate', { gte: 5.0, lte: 6.0 }).build()
      );

      expect(result.hits.total.value).toBe(1);
    });

    it('filters documents by date range', async () => {
      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings).range('listed_date', { gte: '2023-01-01' }).build()
      );

      expect(result.hits.total.value).toBe(2);
    });
  });

  describe('Query — bool', () => {
    it('combines must, mustNot, and filter clauses', async () => {
      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings)
          .bool()
          .must((q) => q.term('asset_class', 'fixed-income'))
          .mustNot((q) => q.term('sector', 'government'))
          .filter((q) => q.range('yield_rate', { lte: 5.5 }))
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.sector).toMatchInlineSnapshot(`"corporate"`);
    });
  });

  describe('Query — match and multiMatch', () => {
    it('performs full-text match on a text field', async () => {
      const result = await search(INDEX, queryBuilder(instrumentMappings).match('name', 'Treasury').build());

      expect(result.hits.total.value).toBe(1);
    });

    it('searches across multiple fields with multiMatch', async () => {
      const result = await search(INDEX, queryBuilder(instrumentMappings).multiMatch(['name'], 'fund').build());

      expect(result.hits.total.value).toBe(2);
    });
  });

  describe('Query — sort and _source', () => {
    it('sorts results by a numeric field', async () => {
      const result = await search(INDEX, queryBuilder(instrumentMappings).matchAll().sort('yield_rate', 'asc').build());
      const yields = result.hits.hits.map((h: { _source: { yield_rate: number } }) => h._source.yield_rate);

      expect(yields).toMatchInlineSnapshot(`
        [
          0.5,
          1.5,
          4.3,
          5.1,
        ]
      `);
    });

    it('limits returned fields with _source', async () => {
      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings).matchAll().size(1)._source(['name', 'yield_rate']).build()
      );
      const {
        hits: {
          hits: [{ _source }]
        }
      } = result;

      expect(Object.keys(_source).sort()).toMatchInlineSnapshot(`
        [
          "name",
          "yield_rate",
        ]
      `);
    });
  });

  describe('Query — exists and ids', () => {
    it('matches documents where a field exists', async () => {
      const result = await search(INDEX, queryBuilder(instrumentMappings).exists('yield_rate').build());

      expect(result.hits.total.value).toBe(4);
    });

    it('retrieves documents by their ids', async () => {
      const all = await search(INDEX, queryBuilder(instrumentMappings).matchAll().build());
      const ids: string[] = all.hits.hits.slice(0, 2).map((h: { _id: string }) => h._id);

      const result = await search(INDEX, queryBuilder(instrumentMappings).ids(ids).build());

      expect(result.hits.total.value).toBe(2);
    });
  });

  describe('Query — conditional .when()', () => {
    it('applies filter when condition is true', async () => {
      const assetClass: string | undefined = 'equity';

      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings)
          .bool()
          .when(assetClass, (q) => q.filter((q2) => q2.term('asset_class', assetClass!)))
          .build()
      );

      expect(result.hits.total.value).toBe(2);

      result.hits.hits.forEach((h: { _source: { asset_class: string } }) => {
        expect(h._source.asset_class).toBe('equity');
      });
    });

    it('returns all documents when condition is false', async () => {
      const assetClass: string | undefined = undefined;

      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings)
          .bool()
          .when(assetClass, (q) => q.filter((q2) => q2.term('asset_class', assetClass!)))
          .build()
      );

      expect(result.hits.total.value).toBe(4);
    });

    it('applies only truthy conditions in a chain', async () => {
      const assetClass: string | undefined = 'fixed-income';
      const minYield: number | undefined = undefined;
      const maxYield: number | undefined = 5.5;

      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings)
          .bool()
          .when(assetClass, (q) => q.filter((q2) => q2.term('asset_class', assetClass!)))
          .when(minYield, (q) => q.filter((q2) => q2.range('yield_rate', { gte: minYield! })))
          .when(maxYield, (q) => q.filter((q2) => q2.range('yield_rate', { lte: maxYield! })))
          .build()
      );

      // fixed-income (2 docs): yields 4.3 and 5.1, both <= 5.5 — minYield filter skipped
      expect(result.hits.total.value).toBe(2);
    });

    it('treats numeric zero as truthy — filter fires, not skipped', async () => {
      // Boolean(0) is false, but 0 != null is true — the filter must be applied
      const maxYield: number = 0;

      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings)
          .bool()
          .when(maxYield, (q) => q.filter((q2) => q2.range('yield_rate', { lte: maxYield })))
          .build()
      );

      // No documents have yield_rate <= 0, so filter applied = 0 results.
      // If zero were treated as falsy the filter would be skipped and return 4.
      expect(result.hits.total.value).toBe(0);
    });

    it('returns all documents when all conditions are false', async () => {
      const assetClass: string | undefined = undefined;
      const minYield: number | undefined = undefined;

      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings)
          .bool()
          .when(assetClass, (q) => q.filter((q2) => q2.term('asset_class', assetClass!)))
          .when(minYield, (q) => q.filter((q2) => q2.range('yield_rate', { gte: minYield! })))
          .build()
      );

      expect(result.hits.total.value).toBe(4);
    });

    it('complex: conditional must with nested conditional range filter', async () => {
      const searchTerm: string | undefined = 'Fund';
      const minYield: number | undefined = 5.0;
      const maxYield: number | undefined = undefined;

      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings)
          .bool()
          .when(Boolean(searchTerm), (q) =>
            q
              .must((q2) => q2.match('name', searchTerm!))
              .when(minYield, (q2) => q2.filter((q3) => q3.range('yield_rate', { gte: minYield! })))
              .when(maxYield, (q2) => q2.filter((q3) => q3.range('yield_rate', { lte: maxYield! })))
          )
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.yield_rate).toBe(5.1);
    });
  });

  describe('function_score query', () => {
    it('applies scoring functions to search results', async () => {
      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings)
          .functionScore((q) => q.matchAll(), {
            functions: [{ random_score: { seed: 1, field: '_seq_no' } }],
            boost_mode: 'replace'
          })
          .size(5)
          .build()
      );

      expect(result.hits.total.value).toBeGreaterThan(0);
      expect(result.hits.hits[0]._score).toBeDefined();
    });

    it('function_score inside bool must', async () => {
      const result = await search(
        INDEX,
        queryBuilder(instrumentMappings)
          .bool()
          .must((q) =>
            q.functionScore((inner) => inner.match('name', 'Apple'), {
              functions: [{ weight: 10 }],
              boost_mode: 'multiply'
            })
          )
          .build()
      );

      expect(result.hits.total.value).toBeGreaterThan(0);
    });
  });
});

const JOIN_INDEX = 'int-query-join';

const qaMapping = mappings({
  title: text(),
  body: text(),
  tag: keyword(),
  relation: join({ relations: { question: ['answer', 'comment'] } })
});

describe('QueryBuilder — parent/child queries', () => {
  beforeAll(async () => {
    await ensureIndex(JOIN_INDEX, indexBuilder().mappings(qaMapping).build());

    await esPost(`/${JOIN_INDEX}/_doc/1?refresh=false`, {
      title: 'What is Elasticsearch?',
      tag: 'search',
      relation: 'question'
    });
    await esPost(`/${JOIN_INDEX}/_doc/2?routing=1&refresh=false`, {
      body: 'A distributed search engine.',
      relation: { name: 'answer', parent: '1' }
    });
    await esPost(`/${JOIN_INDEX}/_doc/3?routing=1&refresh=true`, {
      body: 'Great question!',
      relation: { name: 'comment', parent: '1' }
    });
  });

  afterAll(() => deleteIndex(JOIN_INDEX));

  it('hasChild returns parent documents matching child query', async () => {
    const result = await search(
      JOIN_INDEX,
      queryBuilder(qaMapping)
        .hasChild('answer', (q) => q.match('body', 'search engine'))
        .build()
    );

    expect(result.hits.total.value).toBe(1);
    expect(result.hits.hits[0]._id).toBe('1');
  });

  it('hasParent returns child documents matching parent query', async () => {
    const result = await search(
      JOIN_INDEX,
      queryBuilder(qaMapping)
        .hasParent('question', (q) => q.match('title', 'Elasticsearch'))
        .build()
    );

    expect(result.hits.total.value).toBe(2);
  });

  it('parentId returns children of a specific parent', async () => {
    const result = await search(JOIN_INDEX, queryBuilder(qaMapping).parentId('answer', '1').build());

    expect(result.hits.total.value).toBe(1);
    expect(result.hits.hits[0]._id).toBe('2');
  });

  it('hasChild inside bool filter', async () => {
    const result = await search(
      JOIN_INDEX,
      queryBuilder(qaMapping)
        .bool()
        .filter((q) => q.hasChild('comment', (inner) => inner.matchAll()))
        .filter((q) => q.term('tag', 'search'))
        .build()
    );

    expect(result.hits.total.value).toBe(1);
    expect(result.hits.hits[0]._id).toBe('1');
  });
});
