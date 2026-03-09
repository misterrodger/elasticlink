import { query, indexBuilder } from '../../index.js';
import { ensureIndex, deleteIndex, indexDoc, refreshIndex, search } from './helpers.js';
import { instrumentMappings, INSTRUMENTS } from './fixtures/finance.js';

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

  describe('Query — conditional .when()', () => {
    it('applies filter when condition is true', async () => {
      const assetClass: string | undefined = 'equity';

      const result = await search(
        INDEX,
        query(instrumentMappings)
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
        query(instrumentMappings)
          .bool()
          .when(assetClass, (q) => q.filter((q2) => q2.term('asset_class', assetClass!)))
          .build()
      );

      expect(result.hits.total.value).toBe(4);
    });

    it('applies only truthy conditions in a chain', async () => {
      const assetClass: string | undefined = 'fixed-income';
      const minPrice: number | undefined = undefined;
      const maxPrice: number | undefined = 200;

      const result = await search(
        INDEX,
        query(instrumentMappings)
          .bool()
          .when(assetClass, (q) => q.filter((q2) => q2.term('asset_class', assetClass!)))
          .when(minPrice, (q) => q.filter((q2) => q2.range('price', { gte: minPrice! })))
          .when(maxPrice, (q) => q.filter((q2) => q2.range('price', { lte: maxPrice! })))
          .build()
      );

      // fixed-income (2 docs): prices 98 and 112, both <= 200 — minPrice filter skipped
      expect(result.hits.total.value).toBe(2);
    });

    it('treats numeric zero as truthy — filter fires, not skipped', async () => {
      // Boolean(0) is false, but 0 != null is true — the filter must be applied
      const maxPrice: number = 0;

      const result = await search(
        INDEX,
        query(instrumentMappings)
          .bool()
          .when(maxPrice, (q) => q.filter((q2) => q2.range('price', { lte: maxPrice })))
          .build()
      );

      // No documents have price <= 0, so filter applied = 0 results.
      // If zero were treated as falsy the filter would be skipped and return 4.
      expect(result.hits.total.value).toBe(0);
    });

    it('returns all documents when all conditions are false', async () => {
      const assetClass: string | undefined = undefined;
      const minPrice: number | undefined = undefined;

      const result = await search(
        INDEX,
        query(instrumentMappings)
          .bool()
          .when(assetClass, (q) => q.filter((q2) => q2.term('asset_class', assetClass!)))
          .when(minPrice, (q) => q.filter((q2) => q2.range('price', { gte: minPrice! })))
          .build()
      );

      expect(result.hits.total.value).toBe(4);
    });

    it('complex: conditional must with nested conditional range filter', async () => {
      const searchTerm: string | undefined = 'Fund';
      const minPrice: number | undefined = 100;
      const maxPrice: number | undefined = undefined;

      const result = await search(
        INDEX,
        query(instrumentMappings)
          .bool()
          .when(Boolean(searchTerm), (q) =>
            q
              .must((q2) => q2.match('name', searchTerm!))
              .when(minPrice, (q2) => q2.filter((q3) => q3.range('price', { gte: minPrice! })))
              .when(maxPrice, (q2) => q2.filter((q3) => q3.range('price', { lte: maxPrice! })))
          )
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.price).toBe(479);
    });
  });
});
