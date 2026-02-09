import {
  query,
  indexBuilder,
  keyword,
  integer,
  float,
  date
} from '../../index.js';
import {
  createIndex,
  deleteIndex,
  indexDoc,
  refreshIndex,
  search
} from './helpers.js';
import { Matter, MATTERS } from './fixtures/legal.js';

const INDEX = 'int-aggregation';

describe('AggregationBuilder', () => {
  beforeAll(async () => {
    await createIndex(
      INDEX,
      indexBuilder<Matter>()
        .mappings({
          title: 'text',
          practice_area: keyword(),
          billing_rate: integer(),
          risk_score: float(),
          opened_at: date()
        })
        .build()
    );
    for (const doc of MATTERS) await indexDoc(INDEX, doc);
    await refreshIndex(INDEX);
  });

  afterAll(() => deleteIndex(INDEX));

  describe('Aggregation — terms', () => {
    it('buckets documents by a keyword field', async () => {
      const result = await search(
        INDEX,
        query<Matter>()
          .matchAll()
          .aggs((agg) => agg.terms('by_area', 'practice_area'))
          .size(0)
          .build()
      );

      expect(result.aggregations.by_area.buckets).toMatchInlineSnapshot(`
        [
          {
            "doc_count": 1,
            "key": "corporate",
          },
          {
            "doc_count": 1,
            "key": "intellectual-property",
          },
          {
            "doc_count": 1,
            "key": "real-estate",
          },
          {
            "doc_count": 1,
            "key": "securities",
          },
        ]
      `);
    });

    it('supports size option and sub-aggregations', async () => {
      const result = await search(
        INDEX,
        query<Matter>()
          .matchAll()
          .aggs((agg) =>
            agg
              .terms('by_area', 'practice_area', { size: 2 })
              .subAgg((sub) => sub.avg('avg_rate', 'billing_rate'))
          )
          .size(0)
          .build()
      );

      expect(result.aggregations.by_area.buckets).toMatchInlineSnapshot(`
        [
          {
            "avg_rate": {
              "value": 850,
            },
            "doc_count": 1,
            "key": "corporate",
          },
          {
            "avg_rate": {
              "value": 780,
            },
            "doc_count": 1,
            "key": "intellectual-property",
          },
        ]
      `);
    });
  });

  describe('Aggregation — metrics', () => {
    it('computes avg, min, max, sum, and value_count in one request', async () => {
      const result = await search(
        INDEX,
        query<Matter>()
          .matchAll()
          .aggs((agg) =>
            agg
              .avg('avg_rate', 'billing_rate')
              .min('min_rate', 'billing_rate')
              .max('max_rate', 'billing_rate')
              .sum('total_rate', 'billing_rate')
              .valueCount('count', 'billing_rate')
          )
          .size(0)
          .build()
      );

      expect(result.aggregations).toMatchInlineSnapshot(`
        {
          "avg_rate": {
            "value": 792.5,
          },
          "count": {
            "value": 4,
          },
          "max_rate": {
            "value": 920,
          },
          "min_rate": {
            "value": 620,
          },
          "total_rate": {
            "value": 3170,
          },
        }
      `);
    });

    it('computes stats and cardinality', async () => {
      const result = await search(
        INDEX,
        query<Matter>()
          .matchAll()
          .aggs((agg) =>
            agg
              .stats('rate_stats', 'billing_rate')
              .cardinality('unique_areas', 'practice_area')
          )
          .size(0)
          .build()
      );

      expect(result.aggregations).toMatchInlineSnapshot(`
        {
          "rate_stats": {
            "avg": 792.5,
            "count": 4,
            "max": 920,
            "min": 620,
            "sum": 3170,
          },
          "unique_areas": {
            "value": 4,
          },
        }
      `);
    });
  });

  describe('Aggregation — range', () => {
    it('buckets documents into named billing rate ranges', async () => {
      const result = await search(
        INDEX,
        query<Matter>()
          .matchAll()
          .aggs((agg) =>
            agg.range('rate_bands', 'billing_rate', {
              ranges: [
                { key: 'standard', to: 700 },
                { key: 'senior', from: 700, to: 850 },
                { key: 'partner', from: 850 }
              ]
            })
          )
          .size(0)
          .build()
      );

      expect(result.aggregations.rate_bands.buckets).toMatchInlineSnapshot(`
        [
          {
            "doc_count": 1,
            "key": "standard",
            "to": 700,
          },
          {
            "doc_count": 1,
            "from": 700,
            "key": "senior",
            "to": 850,
          },
          {
            "doc_count": 2,
            "from": 850,
            "key": "partner",
          },
        ]
      `);
    });
  });

  describe('Aggregation — dateHistogram', () => {
    it('groups documents into yearly buckets', async () => {
      const result = await search(
        INDEX,
        query<Matter>()
          .matchAll()
          .aggs((agg) =>
            agg.dateHistogram('by_year', 'opened_at', {
              calendar_interval: 'year',
              min_doc_count: 1,
              format: 'yyyy'
            })
          )
          .size(0)
          .build()
      );

      expect(
        result.aggregations.by_year.buckets.map(
          (b: { key_as_string: string; doc_count: number }) => ({
            year: b.key_as_string,
            doc_count: b.doc_count
          })
        )
      ).toMatchInlineSnapshot(`
        [
          {
            "doc_count": 1,
            "year": "2021",
          },
          {
            "doc_count": 1,
            "year": "2022",
          },
          {
            "doc_count": 2,
            "year": "2023",
          },
        ]
      `);
    });
  });
});
