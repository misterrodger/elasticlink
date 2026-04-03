import { queryBuilder, msearch, indexBuilder } from '../../index.js';
import { ensureIndex, deleteIndex, indexDoc, refreshIndex, msearchRequest } from '../helpers';
import { listingMappings } from '../fixtures/real-estate.schema.js';
import { LISTINGS } from '../fixtures/real-estate.data.js';

const INDEX = 'int-msearch';

describe('MSearchBuilder', () => {
  beforeAll(async () => {
    await ensureIndex(INDEX, indexBuilder().mappings(listingMappings).build());
    for (const doc of LISTINGS) await indexDoc(INDEX, doc);
    await refreshIndex(INDEX);
  });

  afterAll(() => deleteIndex(INDEX));

  describe('Multi-search — basic', () => {
    it('executes two independent queries in one request', async () => {
      const result = await msearchRequest(
        INDEX,
        msearch(listingMappings)
          .addQuery(queryBuilder(listingMappings).term('property_class', 'condo').build())
          .addQuery(queryBuilder(listingMappings).term('property_class', 'townhouse').build())
          .build()
      );

      expect(result.responses[0].hits.total.value).toBe(2);
      expect(result.responses[1].hits.total.value).toBe(2);
    });

    it('returns independent results per query', async () => {
      const result = await msearchRequest(
        INDEX,
        msearch(listingMappings)
          .addQuery(queryBuilder(listingMappings).range('list_price', { lte: 2_000_000 }).build())
          .addQuery(queryBuilder(listingMappings).range('list_price', { gte: 4_000_000, lte: 5_000_000 }).build())
          .build()
      );

      expect(result.responses[0].hits.total.value).toBe(1);
      expect(result.responses[1].hits.total.value).toBe(1);
    });
  });

  describe('Multi-search — with aggregations', () => {
    it('each search can carry its own aggregation', async () => {
      const result = await msearchRequest(
        INDEX,
        msearch(listingMappings)
          .addQuery(
            queryBuilder(listingMappings)
              .term('property_class', 'condo')
              .aggs((agg) => agg.avg('avg_price', 'list_price'))
              .size(0)
              .build()
          )
          .addQuery(
            queryBuilder(listingMappings)
              .term('property_class', 'townhouse')
              .aggs((agg) => agg.avg('avg_price', 'list_price'))
              .size(0)
              .build()
          )
          .build()
      );

      expect(result.responses[0].aggregations.avg_price.value).toBe(1_675_000);
      expect(result.responses[1].aggregations.avg_price.value).toBe(3_950_000);
    });
  });
});
