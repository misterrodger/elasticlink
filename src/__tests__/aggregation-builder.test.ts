import { aggregations, integer, keyword, mappings, nested } from '..';
import { listingDetailMappings } from './fixtures/real-estate.schema.js';
import { productMappings } from './fixtures/ecommerce.schema.js';

describe('AggregationBuilder', () => {
  describe('Builder behavior', () => {
    it('should return empty object for empty builder', () => {
      const result = aggregations(listingDetailMappings).build();

      expect(result).toMatchInlineSnapshot(`{}`);
    });

    it('should support multiple top-level aggregations at same level', () => {
      const result = aggregations(listingDetailMappings)
        .terms('by_property_class', 'property_class')
        .avg('avg_price', 'list_price')
        .dateHistogram('over_time', 'listed_date', { interval: 'month' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "avg_price": {
            "avg": {
              "field": "list_price",
            },
          },
          "by_property_class": {
            "terms": {
              "field": "property_class",
            },
          },
          "over_time": {
            "date_histogram": {
              "field": "listed_date",
              "interval": "month",
            },
          },
        }
      `);
    });
  });

  describe('Bucket aggregations', () => {
    it('should create a terms aggregation', () => {
      const result = aggregations(listingDetailMappings).terms('category_agg', 'property_class', { size: 10 }).build();

      expect(result).toMatchInlineSnapshot(`
          {
            "category_agg": {
              "terms": {
                "field": "property_class",
                "size": 10,
              },
            },
          }
        `);
    });

    it('should create a terms aggregation without options', () => {
      const result = aggregations(listingDetailMappings).terms('category_agg', 'property_class').build();

      expect(result).toMatchInlineSnapshot(`
          {
            "category_agg": {
              "terms": {
                "field": "property_class",
              },
            },
          }
        `);
    });

    it('should create a date histogram aggregation', () => {
      const result = aggregations(listingDetailMappings)
        .dateHistogram('listings_by_date', 'listed_date', {
          interval: 'day',
          min_doc_count: 1
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "listings_by_date": {
            "date_histogram": {
              "field": "listed_date",
              "interval": "day",
              "min_doc_count": 1,
            },
          },
        }
      `);
    });

    it('should create a range aggregation', () => {
      const result = aggregations(listingDetailMappings)
        .range('price_ranges', 'list_price', {
          ranges: [{ to: 100 }, { from: 100, to: 500 }, { from: 500 }]
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
          {
            "price_ranges": {
              "range": {
                "field": "list_price",
                "ranges": [
                  {
                    "to": 100,
                  },
                  {
                    "from": 100,
                    "to": 500,
                  },
                  {
                    "from": 500,
                  },
                ],
              },
            },
          }
        `);
    });

    it('should create a histogram aggregation', () => {
      const result = aggregations(listingDetailMappings)
        .histogram('price_histogram', 'list_price', { interval: 50 })
        .build();

      expect(result).toMatchInlineSnapshot(`
          {
            "price_histogram": {
              "histogram": {
                "field": "list_price",
                "interval": 50,
              },
            },
          }
        `);
    });
  });

  describe('Metric aggregations', () => {
    it('should create an avg aggregation', () => {
      const result = aggregations(listingDetailMappings).avg('avg_price', 'list_price').build();

      expect(result).toMatchInlineSnapshot(`
          {
            "avg_price": {
              "avg": {
                "field": "list_price",
              },
            },
          }
        `);
    });

    it('should create a sum aggregation', () => {
      const result = aggregations(listingDetailMappings).sum('total_price', 'list_price').build();

      expect(result).toMatchInlineSnapshot(`
          {
            "total_price": {
              "sum": {
                "field": "list_price",
              },
            },
          }
        `);
    });

    it('should create a min aggregation', () => {
      const result = aggregations(listingDetailMappings).min('min_price', 'list_price').build();

      expect(result).toMatchInlineSnapshot(`
          {
            "min_price": {
              "min": {
                "field": "list_price",
              },
            },
          }
        `);
    });

    it('should create a max aggregation', () => {
      const result = aggregations(listingDetailMappings).max('max_price', 'list_price').build();

      expect(result).toMatchInlineSnapshot(`
          {
            "max_price": {
              "max": {
                "field": "list_price",
              },
            },
          }
        `);
    });

    it('should create a cardinality aggregation', () => {
      const result = aggregations(listingDetailMappings)
        .cardinality('unique_categories', 'property_class', {
          precision_threshold: 100
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
          {
            "unique_categories": {
              "cardinality": {
                "field": "property_class",
                "precision_threshold": 100,
              },
            },
          }
        `);
    });

    it('should create a percentiles aggregation', () => {
      const result = aggregations(listingDetailMappings)
        .percentiles('price_percentiles', 'list_price', {
          percents: [25, 50, 75, 95]
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
          {
            "price_percentiles": {
              "percentiles": {
                "field": "list_price",
                "percents": [
                  25,
                  50,
                  75,
                  95,
                ],
              },
            },
          }
        `);
    });

    it('should create a percentiles aggregation with no options', () => {
      const result = aggregations(listingDetailMappings).percentiles('price_percentiles', 'list_price').build();

      expect(result).toMatchInlineSnapshot(`
          {
            "price_percentiles": {
              "percentiles": {
                "field": "list_price",
              },
            },
          }
        `);
    });

    it('should create a stats aggregation', () => {
      const result = aggregations(listingDetailMappings).stats('price_stats', 'list_price').build();

      expect(result).toMatchInlineSnapshot(`
          {
            "price_stats": {
              "stats": {
                "field": "list_price",
              },
            },
          }
        `);
    });

    it('should create a value_count aggregation', () => {
      const result = aggregations(listingDetailMappings).valueCount('rating_count', 'cap_rate').build();

      expect(result).toMatchInlineSnapshot(`
          {
            "rating_count": {
              "value_count": {
                "field": "cap_rate",
              },
            },
          }
        `);
    });
  });

  describe('Sub-aggregations', () => {
    it('should add sub-aggregations to a bucket aggregation', () => {
      const result = aggregations(listingDetailMappings)
        .terms('categories', 'property_class', { size: 10 })
        .subAgg((agg) => agg.avg('avg_price', 'list_price'))
        .build();

      expect(result).toMatchInlineSnapshot(`
          {
            "categories": {
              "aggs": {
                "avg_price": {
                  "avg": {
                    "field": "list_price",
                  },
                },
              },
              "terms": {
                "field": "property_class",
                "size": 10,
              },
            },
          }
        `);
    });

    it('should add multiple sub-aggregations', () => {
      const result = aggregations(listingDetailMappings)
        .terms('categories', 'property_class')
        .subAgg((agg) => agg.avg('avg_price', 'list_price').max('max_rating', 'cap_rate'))
        .build();

      expect(result).toMatchInlineSnapshot(`
          {
            "categories": {
              "aggs": {
                "avg_price": {
                  "avg": {
                    "field": "list_price",
                  },
                },
                "max_rating": {
                  "max": {
                    "field": "cap_rate",
                  },
                },
              },
              "terms": {
                "field": "property_class",
              },
            },
          }
        `);
    });
  });

  describe('Aggregation options', () => {
    describe('Terms aggregation options', () => {
      it('should create terms with min_doc_count', () => {
        const result = aggregations(listingDetailMappings)
          .terms('categories', 'property_class', { min_doc_count: 5 })
          .build();

        expect(result).toMatchInlineSnapshot(`
            {
              "categories": {
                "terms": {
                  "field": "property_class",
                  "min_doc_count": 5,
                },
              },
            }
          `);
      });

      it('should create terms with order', () => {
        const result = aggregations(listingDetailMappings)
          .terms('categories', 'property_class', { order: { _count: 'asc' } })
          .build();

        expect(result).toMatchInlineSnapshot(`
            {
              "categories": {
                "terms": {
                  "field": "property_class",
                  "order": {
                    "_count": "asc",
                  },
                },
              },
            }
          `);
      });

      it('should create terms with missing value', () => {
        const result = aggregations(listingDetailMappings)
          .terms('categories', 'property_class', { missing: 'N/A' })
          .build();

        expect(result).toMatchInlineSnapshot(`
            {
              "categories": {
                "terms": {
                  "field": "property_class",
                  "missing": "N/A",
                },
              },
            }
          `);
      });

      it('should create terms with all options', () => {
        const result = aggregations(listingDetailMappings)
          .terms('categories', 'property_class', {
            size: 20,
            min_doc_count: 2,
            order: { _key: 'desc' },
            missing: 'Unknown'
          })
          .build();

        expect(result.categories.terms).toStrictEqual({
          field: 'property_class',
          size: 20,
          min_doc_count: 2,
          order: { _key: 'desc' },
          missing: 'Unknown'
        });
      });
    });

    describe('Range aggregation options', () => {
      it('should create range with keyed ranges', () => {
        const result = aggregations(listingDetailMappings)
          .range('price_ranges', 'list_price', {
            ranges: [
              { key: 'cheap', to: 100 },
              { key: 'moderate', from: 100, to: 500 },
              { key: 'expensive', from: 500 }
            ]
          })
          .build();

        expect(result.price_ranges.range.ranges).toMatchInlineSnapshot(`
          [
            {
              "key": "cheap",
              "to": 100,
            },
            {
              "from": 100,
              "key": "moderate",
              "to": 500,
            },
            {
              "from": 500,
              "key": "expensive",
            },
          ]
        `);
      });
    });

    describe('DateHistogram aggregation options', () => {
      it('should create dateHistogram with minimal options', () => {
        const result = aggregations(listingDetailMappings)
          .dateHistogram('by_day', 'listed_date', { interval: 'day' })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "by_day": {
              "date_histogram": {
                "field": "listed_date",
                "interval": "day",
              },
            },
          }
        `);
      });

      it('should create dateHistogram with extended_bounds', () => {
        const result = aggregations(listingDetailMappings)
          .dateHistogram('over_time', 'listed_date', {
            interval: 'day',
            extended_bounds: {
              min: '2024-01-01',
              max: '2024-12-31'
            }
          })
          .build();

        expect(result.over_time.date_histogram.extended_bounds).toStrictEqual({
          min: '2024-01-01',
          max: '2024-12-31'
        });
      });

      it('should create dateHistogram with time_zone', () => {
        const result = aggregations(listingDetailMappings)
          .dateHistogram('over_time', 'listed_date', {
            interval: 'day',
            time_zone: 'America/New_York'
          })
          .build();

        expect(result.over_time.date_histogram.time_zone).toBe('America/New_York');
      });

      it('should create dateHistogram with order', () => {
        const result = aggregations(listingDetailMappings)
          .dateHistogram('over_time', 'listed_date', {
            interval: 'month',
            order: { _key: 'desc' }
          })
          .build();

        expect(result.over_time.date_histogram.order).toStrictEqual({
          _key: 'desc'
        });
      });
    });

    describe('Histogram aggregation options', () => {
      it('should create histogram with min_doc_count', () => {
        const result = aggregations(listingDetailMappings)
          .histogram('price_buckets', 'list_price', {
            interval: 100,
            min_doc_count: 1
          })
          .build();

        expect(result.price_buckets.histogram.min_doc_count).toBe(1);
      });

      it('should create histogram with extended_bounds', () => {
        const result = aggregations(listingDetailMappings)
          .histogram('price_buckets', 'list_price', {
            interval: 50,
            extended_bounds: { min: 0, max: 1000 }
          })
          .build();

        expect(result.price_buckets.histogram.extended_bounds).toStrictEqual({
          min: 0,
          max: 1000
        });
      });
    });

    describe('Metric aggregation options', () => {
      it('should create avg with missing value', () => {
        const result = aggregations(listingDetailMappings).avg('avg_price', 'list_price', { missing: 0 }).build();

        expect(result).toMatchInlineSnapshot(`
            {
              "avg_price": {
                "avg": {
                  "field": "list_price",
                  "missing": 0,
                },
              },
            }
          `);
      });

      it('should create sum with missing value', () => {
        const result = aggregations(listingDetailMappings).sum('total_price', 'list_price', { missing: 0 }).build();

        expect(result.total_price.sum.missing).toBe(0);
      });

      it('should create min with missing value', () => {
        const result = aggregations(listingDetailMappings).min('min_price', 'list_price', { missing: 9999 }).build();

        expect(result.min_price.min.missing).toBe(9999);
      });

      it('should create max with missing value', () => {
        const result = aggregations(listingDetailMappings).max('max_price', 'list_price', { missing: 0 }).build();

        expect(result.max_price.max.missing).toBe(0);
      });

      it('should create cardinality without options', () => {
        const result = aggregations(listingDetailMappings).cardinality('unique_categories', 'property_class').build();

        expect(result).toMatchInlineSnapshot(`
            {
              "unique_categories": {
                "cardinality": {
                  "field": "property_class",
                },
              },
            }
          `);
      });

      it('should create percentiles with keyed option', () => {
        const result = aggregations(listingDetailMappings)
          .percentiles('price_percentiles', 'list_price', {
            percents: [25, 50, 75, 95, 99],
            keyed: true
          })
          .build();

        expect(result.price_percentiles.percentiles.keyed).toBe(true);
        expect(result.price_percentiles.percentiles.percents).toStrictEqual([25, 50, 75, 95, 99]);
      });

      it('should create stats with missing value', () => {
        const result = aggregations(listingDetailMappings).stats('price_stats', 'list_price', { missing: 0 }).build();

        expect(result.price_stats.stats.missing).toBe(0);
      });

      it('should create valueCount with missing value', () => {
        const result = aggregations(listingDetailMappings)
          .valueCount('rating_count', 'cap_rate', { missing: 0 })
          .build();

        expect(result.rating_count.value_count.missing).toBe(0);
      });
    });

    describe('Sub-aggregation patterns', () => {
      it('should add sub-agg to dateHistogram', () => {
        const result = aggregations(listingDetailMappings)
          .dateHistogram('by_month', 'listed_date', { interval: 'month' })
          .subAgg((sub) => sub.sum('monthly_revenue', 'list_price').avg('avg_rating', 'cap_rate'))
          .build();

        expect(result).toMatchObject({
          by_month: {
            date_histogram: { field: 'listed_date', interval: 'month' },
            aggs: {
              monthly_revenue: { sum: { field: 'list_price' } },
              avg_rating: { avg: { field: 'cap_rate' } }
            }
          }
        });
      });

      it('should add sub-agg to range aggregation', () => {
        const result = aggregations(listingDetailMappings)
          .range('price_ranges', 'list_price', {
            ranges: [{ to: 50 }, { from: 50, to: 100 }, { from: 100 }]
          })
          .subAgg((sub) => sub.avg('avg_rating', 'cap_rate'))
          .build();

        expect(result).toMatchObject({
          price_ranges: {
            range: {
              field: 'list_price',
              ranges: [{ to: 50 }, { from: 50, to: 100 }, { from: 100 }]
            },
            aggs: {
              avg_rating: { avg: { field: 'cap_rate' } }
            }
          }
        });
      });

      it('should add sub-agg to histogram aggregation', () => {
        const result = aggregations(listingDetailMappings)
          .histogram('price_histogram', 'list_price', { interval: 25 })
          .subAgg((sub) => sub.cardinality('unique_categories', 'property_class'))
          .build();

        expect(result).toMatchObject({
          price_histogram: {
            histogram: { field: 'list_price', interval: 25 },
            aggs: {
              unique_categories: { cardinality: { field: 'property_class' } }
            }
          }
        });
      });

      it('should create multiple sibling sub-aggregations', () => {
        const result = aggregations(listingDetailMappings)
          .terms('by_property_class', 'property_class')
          .subAgg((sub) =>
            sub
              .avg('avg_price', 'list_price')
              .min('min_price', 'list_price')
              .max('max_price', 'list_price')
              .sum('total_revenue', 'list_price')
              .stats('price_stats', 'list_price')
          )
          .build();

        expect(result).toMatchObject({
          by_property_class: {
            terms: { field: 'property_class' },
            aggs: {
              avg_price: { avg: { field: 'list_price' } },
              min_price: { min: { field: 'list_price' } },
              max_price: { max: { field: 'list_price' } },
              total_revenue: { sum: { field: 'list_price' } },
              price_stats: { stats: { field: 'list_price' } }
            }
          }
        });
      });

      // eslint-disable-next-line vitest/expect-expect
      it('rejects text fields in terms() — only keyword/numeric/boolean/ip allowed', () => {
        // @ts-expect-error — 'title' is a text field; terms() only accepts keyword/numeric/boolean/ip
        aggregations(listingDetailMappings).terms('by_title', 'title');
        // @ts-expect-error — 'embedding' is dense_vector; not valid in terms()
        aggregations(listingDetailMappings).terms('by_embedding', 'embedding');
        // valid: keyword
        aggregations(listingDetailMappings).terms('by_class', 'property_class');
        // valid: numeric
        aggregations(listingDetailMappings).terms('by_price', 'list_price');
      });

      // eslint-disable-next-line vitest/expect-expect
      it('rejects text/vector fields in range() — only numeric/date allowed', () => {
        // @ts-expect-error — 'title' is a text field; range() only accepts numeric/date
        aggregations(listingDetailMappings).range('r', 'title', { ranges: [] });
        // @ts-expect-error — 'property_class' is keyword; not valid in range()
        aggregations(listingDetailMappings).range('r', 'property_class', { ranges: [] });
        // valid: numeric
        aggregations(listingDetailMappings).range('r', 'list_price', { ranges: [] });
        // valid: date
        aggregations(listingDetailMappings).range('r', 'listed_date', { ranges: [] });
      });

      it('extended_stats emits correct DSL', () => {
        const result = aggregations(listingDetailMappings).extendedStats('price_stats', 'list_price').build();

        expect(result).toMatchInlineSnapshot(`
          {
            "price_stats": {
              "extended_stats": {
                "field": "list_price",
              },
            },
          }
        `);
      });

      it('top_hits emits correct DSL with options', () => {
        const result = aggregations(listingDetailMappings)
          .terms('by_class', 'property_class')
          .subAgg((sub) => sub.topHits('sample', { size: 3 }))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "by_class": {
              "aggs": {
                "sample": {
                  "top_hits": {
                    "size": 3,
                  },
                },
              },
              "terms": {
                "field": "property_class",
              },
            },
          }
        `);
      });

      it('auto_date_histogram emits correct DSL', () => {
        const result = aggregations(listingDetailMappings)
          .autoDateHistogram('over_time', 'listed_date', { buckets: 10 })
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "over_time": {
              "auto_date_histogram": {
                "buckets": 10,
                "field": "listed_date",
              },
            },
          }
        `);
      });

      it('composite emits correct DSL with multiple sources', () => {
        const result = aggregations(listingDetailMappings)
          .composite('paged', [
            { by_class: { terms: { field: 'property_class' } } },
            { by_date: { date_histogram: { field: 'listed_date', calendar_interval: 'month' } } }
          ])
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "paged": {
              "composite": {
                "sources": [
                  {
                    "by_class": {
                      "terms": {
                        "field": "property_class",
                      },
                    },
                  },
                  {
                    "by_date": {
                      "date_histogram": {
                        "calendar_interval": "month",
                        "field": "listed_date",
                      },
                    },
                  },
                ],
              },
            },
          }
        `);
      });

      it('composite emits after cursor for pagination', () => {
        const result = aggregations(listingDetailMappings)
          .composite('paged', [{ by_class: { terms: { field: 'property_class' } } }], {
            after: { by_class: 'condo' }
          })
          .build();

        expect(result.paged.composite.after).toStrictEqual({ by_class: 'condo' });
      });

      it('filter emits correct DSL wrapping a raw query', () => {
        const result = aggregations(listingDetailMappings)
          .filter('condos_only', { term: { property_class: 'condo' } })
          .subAgg((sub) => sub.avg('avg_price', 'list_price'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "condos_only": {
              "aggs": {
                "avg_price": {
                  "avg": {
                    "field": "list_price",
                  },
                },
              },
              "filter": {
                "term": {
                  "property_class": "condo",
                },
              },
            },
          }
        `);
      });

      it('global emits correct DSL', () => {
        const result = aggregations(listingDetailMappings).global('all_listings').build();

        expect(result).toMatchInlineSnapshot(`
          {
            "all_listings": {
              "global": {},
            },
          }
        `);
      });

      it('nested emits correct DSL for a nested path', () => {
        const result = aggregations(productMappings).nested('by_variants', 'variants').build();

        expect(result).toMatchInlineSnapshot(`
          {
            "by_variants": {
              "nested": {
                "path": "variants",
              },
            },
          }
        `);
      });

      it('nested with sub-aggregation aggregates inside nested context', () => {
        const result = aggregations(productMappings)
          .nested('by_variants', 'variants')
          .subAgg((sub) => sub.terms('colors', 'color'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "by_variants": {
              "aggs": {
                "colors": {
                  "terms": {
                    "field": "color",
                  },
                },
              },
              "nested": {
                "path": "variants",
              },
            },
          }
        `);
      });

      it('reverseNested emits correct DSL without path', () => {
        const result = aggregations(productMappings)
          .nested('by_variants', 'variants')
          .subAgg((sub) => sub.terms('colors', 'color').subAgg((inner) => inner.reverseNested('back_to_root')))
          .build();

        expect(result.by_variants.aggs.colors.aggs.back_to_root).toStrictEqual({ reverse_nested: {} });
      });

      it('reverseNested emits correct DSL with path', () => {
        const result = aggregations(productMappings)
          .nested('by_variants', 'variants')
          .subAgg((sub) => sub.reverseNested('back', 'variants'))
          .build();

        expect(result.by_variants.aggs.back).toStrictEqual({ reverse_nested: { path: 'variants' } });
      });

      it('global() chained after nested() adds global agg at root level', () => {
        const result = aggregations(productMappings).nested('by_variants', 'variants').global('all_products').build();

        expect(result).toMatchInlineSnapshot(`
          {
            "all_products": {
              "global": {},
            },
            "by_variants": {
              "nested": {
                "path": "variants",
              },
            },
          }
        `);
      });

      it('nested() chained after nested() adds two root-level nested aggs', () => {
        const result = aggregations(productMappings)
          .nested('by_variants', 'variants')
          .nested('by_variants_2', 'variants')
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "by_variants": {
              "nested": {
                "path": "variants",
              },
            },
            "by_variants_2": {
              "nested": {
                "path": "variants",
              },
            },
          }
        `);
      });

      it('nested sub-agg can itself contain a nested agg (multi-level)', () => {
        const deepMappings = mappings({
          orders: nested({
            items: nested({
              sku: keyword(),
              qty: integer()
            })
          })
        });

        const result = aggregations(deepMappings)
          .nested('by_orders', 'orders')
          .subAgg((sub) => sub.nested('by_items', 'items').subAgg((inner) => inner.terms('skus', 'sku')))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "by_orders": {
              "aggs": {
                "by_items": {
                  "aggs": {
                    "skus": {
                      "terms": {
                        "field": "sku",
                      },
                    },
                  },
                  "nested": {
                    "path": "items",
                  },
                },
              },
              "nested": {
                "path": "orders",
              },
            },
          }
        `);
      });

      it('chained .subAgg() calls merge sub-aggregations instead of overwriting', () => {
        const result = aggregations(listingDetailMappings)
          .terms('by_class', 'property_class')
          .subAgg((sub) => sub.avg('avg_price', 'list_price'))
          .subAgg((sub) => sub.max('max_price', 'list_price'))
          .build();

        expect(result).toMatchInlineSnapshot(`
          {
            "by_class": {
              "aggs": {
                "avg_price": {
                  "avg": {
                    "field": "list_price",
                  },
                },
                "max_price": {
                  "max": {
                    "field": "list_price",
                  },
                },
              },
              "terms": {
                "field": "property_class",
              },
            },
          }
        `);
      });

      // eslint-disable-next-line vitest/expect-expect
      it('reverseNested returns a builder typed to root-level fields', () => {
        aggregations(productMappings)
          .nested('by_variants', 'variants')
          .subAgg((sub) =>
            sub
              .terms('colors', 'color')
              .subAgg((inner) => inner.reverseNested('back_to_root').terms('by_category', 'category'))
          );

        aggregations(productMappings)
          .nested('by_variants', 'variants')
          .subAgg((sub) =>
            sub
              .reverseNested('back_to_root')
              // @ts-expect-error — 'color' is a nested sub-field, not available after reverseNested
              .terms('by_color', 'color')
          );
      });

      it('should create multiple bucket aggregations at same level', () => {
        const result = aggregations(listingDetailMappings)
          .terms('by_property_class', 'property_class', { size: 10 })
          .terms('by_cap_rate', 'cap_rate', { size: 5 })
          .dateHistogram('by_date', 'listed_date', { interval: 'week' })
          .build();

        expect(result).toMatchObject({
          by_property_class: { terms: { field: 'property_class', size: 10 } },
          by_cap_rate: { terms: { field: 'cap_rate', size: 5 } },
          by_date: {
            date_histogram: { field: 'listed_date', interval: 'week' }
          }
        });
      });
    });
  });
});
