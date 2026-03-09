import { query, indexBuilder } from '../../index.js';
import { ensureIndex, deleteIndex, indexDoc, refreshIndex, search } from './helpers.js';
import { deepObjectMappings, deepNestedMappings, DEEP_OBJECT_DOCS, DEEP_NESTED_DOCS } from '../fixtures/logistics.js';

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
  });
});
