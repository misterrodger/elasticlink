import { query, indexBuilder } from '../../index.js';
import { ensureIndex, deleteIndex, indexDoc, refreshIndex, search } from '../helpers';
import { deepObjectMappings, deepNestedMappings } from '../fixtures/logistics.schema.js';
import { DEEP_OBJECT_DOCS, DEEP_NESTED_DOCS } from '../fixtures/logistics.data.js';

const OBJECT_INDEX = 'int-deep-object';
const NESTED_INDEX = 'int-deep-nested';

describe('Deep object/nested mappings — 2-level field access', () => {
  beforeAll(async () => {
    await ensureIndex(OBJECT_INDEX, indexBuilder().mappings(deepObjectMappings).build());
    await ensureIndex(NESTED_INDEX, indexBuilder().mappings(deepNestedMappings).build());
    for (const doc of DEEP_OBJECT_DOCS) await indexDoc(OBJECT_INDEX, doc);
    for (const doc of DEEP_NESTED_DOCS) await indexDoc(NESTED_INDEX, doc);
    await refreshIndex(OBJECT_INDEX);
    await refreshIndex(NESTED_INDEX);
  });

  afterAll(async () => {
    await deleteIndex(OBJECT_INDEX);
    await deleteIndex(NESTED_INDEX);
  });

  describe('object-within-object', () => {
    it('finds a document by a 2-level deep billing city', async () => {
      const result = await search(
        OBJECT_INDEX,
        query(deepObjectMappings).term('address.billing.city', 'Austin').build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.name).toBe('Widget A');
    });

    it('finds a document by a 2-level deep shipping country', async () => {
      const result = await search(
        OBJECT_INDEX,
        query(deepObjectMappings).term('address.shipping.country', 'DE').build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.name).toBe('Widget C');
    });

    it('returns all US-shipping documents via 2-level deep field', async () => {
      const result = await search(
        OBJECT_INDEX,
        query(deepObjectMappings).term('address.shipping.country', 'US').build()
      );

      expect(result.hits.total.value).toBe(2);
    });

    it('filters on two sibling 2-level deep fields via outer bool', async () => {
      const result = await search(
        OBJECT_INDEX,
        query(deepObjectMappings)
          .bool()
          .filter((q) => q.term('address.billing.city', 'Austin'))
          .filter((q) => q.term('address.shipping.country', 'US'))
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.name).toBe('Widget A');
    });
  });

  describe('sort and highlight on object mappings', () => {
    it('sorts documents by a 2-level deep object sub-field (keyword)', async () => {
      const result = await search(
        OBJECT_INDEX,
        query(deepObjectMappings).matchAll().sort('address.billing.city', 'asc').build()
      );

      const cities = result.hits.hits.map(
        (h: { _source: { address: { billing: { city: string } } } }) => h._source.address.billing.city
      );

      expect(cities).toStrictEqual(['Austin', 'London', 'Portland']);
    });

    it('sorts documents by a nested 2-level shipping country (keyword)', async () => {
      const result = await search(
        OBJECT_INDEX,
        query(deepObjectMappings).matchAll().sort('address.shipping.country', 'asc').build()
      );

      const countries = result.hits.hits.map(
        (h: { _source: { address: { shipping: { country: string } } } }) => h._source.address.shipping.country
      );

      expect(countries).toStrictEqual(['DE', 'US', 'US']);
    });

    it('highlights text sub-field matches in query results', async () => {
      const result = await search(
        OBJECT_INDEX,
        query(deepObjectMappings).match('name', 'Widget').highlight(['name']).build()
      );

      expect(result.hits.total.value).toBe(3);

      result.hits.hits.forEach((h: { highlight?: { name?: string[] } }) => {
        expect(h.highlight?.name).toBeDefined();
        expect(h.highlight?.name?.[0]).toMatch(/Widget/);
      });
    });
  });

  describe('nested-with-object-sub-field', () => {
    it('finds a document by a direct nested sub-field', async () => {
      const result = await search(
        NESTED_INDEX,
        query(deepNestedMappings)
          .nested('shipments', (q) => q.term('tracking', 'TRK-003'))
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.title).toBe('Order 2');
    });

    it('finds a document by a 2-level nested object sub-field (address.city)', async () => {
      const result = await search(
        NESTED_INDEX,
        query(deepNestedMappings)
          .nested('shipments', (q) => q.term('address.city', 'Paris'))
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.title).toBe('Order 2');
    });

    it('finds a document by a 2-level nested object sub-field (address.country)', async () => {
      const result = await search(
        NESTED_INDEX,
        query(deepNestedMappings)
          .nested('shipments', (q) => q.term('address.country', 'GB'))
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.title).toBe('Order 1');
    });

    it('finds documents by a range on a direct nested numeric sub-field', async () => {
      const result = await search(
        NESTED_INDEX,
        query(deepNestedMappings)
          .nested('shipments', (q) => q.range('price', { gte: 100 }))
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.title).toBe('Order 1');
    });

    it('matches a document that has any shipment going to a given country', async () => {
      const result = await search(
        NESTED_INDEX,
        query(deepNestedMappings)
          .nested('shipments', (q) => q.term('address.country', 'DE'))
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.title).toBe('Order 1');
    });

    it('nested isolation: outer bool with two nested clauses evaluates each per nested object independently', async () => {
      // Order 1 shipments: TRK-001 → GB, TRK-002 → DE
      // Each .nested() clause is satisfied independently across any shipment in Order 1,
      // so both conditions are met even though no single shipment satisfies both.
      const result = await search(
        NESTED_INDEX,
        query(deepNestedMappings)
          .bool()
          .must((q) => q.nested('shipments', (qn) => qn.term('tracking', 'TRK-001')))
          .must((q) => q.nested('shipments', (qn) => qn.term('address.country', 'DE')))
          .build()
      );

      expect(result.hits.total.value).toBe(1);
      expect(result.hits.hits[0]._source.title).toBe('Order 1');
    });
  });
});
