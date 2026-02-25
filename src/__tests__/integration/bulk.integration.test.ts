import { bulk, query, indexBuilder } from '../../index.js';
import {
  createIndex,
  deleteIndex,
  refreshIndex,
  search,
  bulkRequest
} from './helpers.js';
import { tradeMappings } from './fixtures/finance.js';

const INDEX = 'int-bulk';

describe('BulkBuilder', () => {
  beforeAll(() =>
    createIndex(INDEX, indexBuilder().mappings(tradeMappings).build())
  );

  afterAll(() => deleteIndex(INDEX));

  describe('Bulk — index and create', () => {
    it('indexes and creates documents via bulk, then retrieves them', async () => {
      const ndjson = bulk(tradeMappings)
        .index(
          { reference: 'TRD-001 AAPL Buy 100', status: 'settled', priority: 1 },
          { _index: INDEX, _id: 'trd-1' }
        )
        .index(
          { reference: 'TRD-002 MSFT Sell 50', status: 'pending', priority: 2 },
          { _index: INDEX, _id: 'trd-2' }
        )
        .create(
          { reference: 'TRD-003 GOOG Buy 25', status: 'pending', priority: 3 },
          { _index: INDEX, _id: 'trd-3' }
        )
        .build();

      const bulkResult = await bulkRequest(ndjson);
      await refreshIndex(INDEX);

      expect(bulkResult.errors).toBe(false);

      const searchResult = await search(
        INDEX,
        query(tradeMappings).matchAll().build()
      );

      expect(searchResult.hits.total.value).toBe(3);
    });
  });

  describe('Bulk — update', () => {
    it('partially updates a document', async () => {
      const ndjson = bulk(tradeMappings)
        .update({ _index: INDEX, _id: 'trd-2', doc: { status: 'settled' } })
        .build();

      await bulkRequest(ndjson);
      await refreshIndex(INDEX);

      const result = await search(
        INDEX,
        query(tradeMappings).term('status', 'settled').build()
      );

      expect(result.hits.total.value).toBe(2);
    });

    it('upserts a document that does not exist', async () => {
      const ndjson = bulk(tradeMappings)
        .update({
          _index: INDEX,
          _id: 'trd-4',
          doc: {
            reference: 'TRD-004 TSLA Buy 10',
            status: 'pending',
            priority: 4
          },
          doc_as_upsert: true
        })
        .build();

      await bulkRequest(ndjson);
      await refreshIndex(INDEX);

      const result = await search(
        INDEX,
        query(tradeMappings).matchAll().build()
      );

      expect(result.hits.total.value).toBe(4);
    });
  });

  describe('Bulk — delete', () => {
    it('deletes a document via bulk', async () => {
      const ndjson = bulk(tradeMappings)
        .delete({ _index: INDEX, _id: 'trd-4' })
        .build();

      await bulkRequest(ndjson);
      await refreshIndex(INDEX);

      const result = await search(
        INDEX,
        query(tradeMappings).matchAll().build()
      );

      expect(result.hits.total.value).toBe(3);
    });
  });

  describe('Bulk — mixed operations', () => {
    it('executes index, update, and delete in a single bulk call', async () => {
      const ndjson = bulk(tradeMappings)
        .index(
          { reference: 'TRD-099 NVDA Buy 5', status: 'pending', priority: 99 },
          { _index: INDEX, _id: 'trd-temp' }
        )
        .update({ _index: INDEX, _id: 'trd-1', doc: { priority: 10 } })
        .delete({ _index: INDEX, _id: 'trd-3' })
        .build();

      const bulkResult = await bulkRequest(ndjson);

      expect(bulkResult.errors).toBe(false);
      expect(
        bulkResult.items.map((i: Record<string, { result: string }>) => {
          const op = Object.keys(i)[0];
          return { op, result: i[op].result };
        })
      ).toMatchInlineSnapshot(`
        [
          {
            "op": "index",
            "result": "created",
          },
          {
            "op": "update",
            "result": "updated",
          },
          {
            "op": "delete",
            "result": "deleted",
          },
        ]
      `);
    });
  });
});
