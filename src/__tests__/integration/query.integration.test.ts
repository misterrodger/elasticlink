import { query, indexBuilder } from '../../index.js';
import { createIndex, deleteIndex, indexDoc, refreshIndex, search } from './helpers.js';
import { instrumentMappings, INSTRUMENTS } from './fixtures/finance.js';

const INDEX = 'int-query';

describe('QueryBuilder', () => {
  beforeAll(async () => {
    await createIndex(INDEX, indexBuilder().mappings(instrumentMappings).build());
    for (const doc of INSTRUMENTS) await indexDoc(INDEX, doc);
    await refreshIndex(INDEX);
  });

  afterAll(() => deleteIndex(INDEX));

  describe('Query — matchAll', () => {
    it('returns all documents', async () => {
      const result = await search(INDEX, query(instrumentMappings).matchAll().build());

      expect(result.hits.total.value).toBe(4);
    });

    it('respects size and from for pagination', async () => {
      const result = await search(INDEX, query(instrumentMappings).matchAll().size(2).from(1).build());

      expect(result.hits.hits).toHaveLength(2);
    });
  });

  describe('Query — term and terms', () => {
    it('filters by a single term', async () => {
      const result = await search(INDEX, query(instrumentMappings).term('asset_class', 'equity').build());

      expect(result.hits.total.value).toBe(2);
    });

    it('filters by multiple terms', async () => {
      const result = await search(
        INDEX,
        query(instrumentMappings).terms('sector', ['government', 'corporate']).build()
      );

      expect(result.hits.total.value).toBe(2);
    });
  });

  describe('Query — range', () => {
    it('filters documents within a numeric range', async () => {
      const result = await search(INDEX, query(instrumentMappings).range('price', { gte: 100, lte: 200 }).build());

      expect(result.hits.total.value).toBe(1);
    });

    it('filters documents by date range', async () => {
      const result = await search(INDEX, query(instrumentMappings).range('listed_date', { gte: '2023-01-01' }).build());

      expect(result.hits.total.value).toBe(2);
    });
  });

  describe('Query — bool', () => {
    it('combines must, mustNot, and filter clauses', async () => {
      const result = await search(
        INDEX,
        query(instrumentMappings)
          .bool()
          .must((q) => q.term('asset_class', 'fixed-income'))
          .mustNot((q) => q.term('sector', 'government'))
          .filter((q) => q.range('price', { lte: 200 }))
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.sector).toMatchInlineSnapshot(`"corporate"`);
    });
  });

  describe('Query — match and multiMatch', () => {
    it('performs full-text match on a text field', async () => {
      const result = await search(INDEX, query(instrumentMappings).match('name', 'Treasury').build());

      expect(result.hits.total.value).toBe(1);
    });

    it('searches across multiple fields with multiMatch', async () => {
      const result = await search(INDEX, query(instrumentMappings).multiMatch(['name'], 'fund').build());

      expect(result.hits.total.value).toBe(2);
    });
  });

  describe('Query — sort and _source', () => {
    it('sorts results by a numeric field', async () => {
      const result = await search(INDEX, query(instrumentMappings).matchAll().sort('price', 'asc').build());
      const prices = result.hits.hits.map((h: { _source: { price: number } }) => h._source.price);

      expect(prices).toMatchInlineSnapshot(`
        [
          54,
          98,
          112,
          479,
        ]
      `);
    });

    it('limits returned fields with _source', async () => {
      const result = await search(
        INDEX,
        query(instrumentMappings).matchAll().size(1)._source(['name', 'price']).build()
      );
      const {
        hits: {
          hits: [{ _source }]
        }
      } = result;

      expect(Object.keys(_source).sort()).toMatchInlineSnapshot(`
        [
          "name",
          "price",
        ]
      `);
    });
  });

  describe('Query — exists and ids', () => {
    it('matches documents where a field exists', async () => {
      const result = await search(INDEX, query(instrumentMappings).exists('yield_rate').build());

      expect(result.hits.total.value).toBe(4);
    });

    it('retrieves documents by their ids', async () => {
      const all = await search(INDEX, query(instrumentMappings).matchAll().build());
      const ids: string[] = all.hits.hits.slice(0, 2).map((h: { _id: string }) => h._id);

      const result = await search(INDEX, query(instrumentMappings).ids(ids).build());

      expect(result.hits.total.value).toBe(2);
    });
  });
});
