import {
  indexBuilder,
  text,
  keyword,
  float,
  long,
  integer,
  short,
  byte,
  double,
  date,
  boolean,
  denseVector,
  nested,
  scaledFloat,
  geoPoint,
  dateRange,
  percolator,
  completion,
  halfFloat,
  geoShape,
  ip,
  binary,
  integerRange,
  floatRange,
  longRange,
  doubleRange,
  object,
  alias
} from '..';

describe('Index Management', () => {
  describe('Builder behavior', () => {
    it('should return empty object for empty builder', () => {
      const result = indexBuilder().build();

      expect(result).toMatchInlineSnapshot(`{}`);
    });

    it('should replace mappings when called twice', () => {
      const result = indexBuilder()
        .mappings({ name: text() })
        .mappings({ market_cap: float() })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "market_cap": {
                "type": "float",
              },
            },
          },
        }
      `);
    });

    it('should replace settings when called twice', () => {
      const result = indexBuilder()
        .settings({ number_of_shards: 3 })
        .settings({ number_of_replicas: 2 })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "settings": {
            "number_of_replicas": 2,
          },
        }
      `);
    });
  });

  describe('Mappings', () => {
    it('should build basic mappings', () => {
      const result = indexBuilder()
        .mappings({
          name: text(),
          market_cap: float(),
          asset_class: keyword()
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "asset_class": {
                "type": "keyword",
              },
              "market_cap": {
                "type": "float",
              },
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should build mappings with analyzers', () => {
      const result = indexBuilder()
        .mappings({
          name: text({
            analyzer: 'standard',
            search_analyzer: 'english'
          })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "name": {
                "analyzer": "standard",
                "search_analyzer": "english",
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should build mappings with multi-fields', () => {
      const result = indexBuilder()
        .mappings({
          name: text({
            fields: {
              keyword: { type: 'keyword' },
              ngram: { type: 'text', analyzer: 'ngram' }
            }
          })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "name": {
                "fields": {
                  "keyword": {
                    "type": "keyword",
                  },
                  "ngram": {
                    "analyzer": "ngram",
                    "type": "text",
                  },
                },
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should build mappings with nested fields', () => {
      const result = indexBuilder()
        .mappings({
          tranches: nested({
            maturity: keyword(),
            currency: keyword()
          })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "tranches": {
                "properties": {
                  "currency": {
                    "type": "keyword",
                  },
                  "maturity": {
                    "type": "keyword",
                  },
                },
                "type": "nested",
              },
            },
          },
        }
      `);
    });

    it('should build mappings with dense_vector', () => {
      const result = indexBuilder()
        .mappings({
          embedding: denseVector({
            dims: 384,
            index_options: {
              type: 'hnsw',
              m: 16,
              ef_construction: 100
            }
          })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "embedding": {
                "dims": 384,
                "index_options": {
                  "ef_construction": 100,
                  "m": 16,
                  "type": "hnsw",
                },
                "type": "dense_vector",
              },
            },
          },
        }
      `);
    });
  });

  describe('Field type coverage', () => {
    it('should support integer field type', () => {
      const result = indexBuilder().mappings({ count: integer() }).build();

      expect(result.mappings?.properties.count?.type).toBe('integer');
    });

    it('should support boolean field type', () => {
      const result = indexBuilder().mappings({ active: boolean() }).build();

      expect(result.mappings?.properties.active?.type).toBe('boolean');
    });

    it('should support geo_point field type', () => {
      const result = indexBuilder().mappings({ location: geoPoint() }).build();

      expect(result.mappings?.properties.location?.type).toBe('geo_point');
    });

    it('should support date_range field type', () => {
      const result = indexBuilder()
        .mappings({ availability: dateRange() })
        .build();

      expect(result.mappings?.properties.availability?.type).toBe('date_range');
    });

    it('should support scaled_float with scaling_factor', () => {
      const result = indexBuilder()
        .mappings({
          score: scaledFloat({ scaling_factor: 100 })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "score": {
                "scaling_factor": 100,
                "type": "scaled_float",
              },
            },
          },
        }
      `);
    });

    it('should support percolator field type', () => {
      const result = indexBuilder().mappings({ query: percolator() }).build();

      expect(result.mappings?.properties.query?.type).toBe('percolator');
    });
  });

  describe('Field mapping properties', () => {
    it('should set boost on a field', () => {
      const result = indexBuilder()
        .mappings({
          name: text({ boost: 2 })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "name": {
                "boost": 2,
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should set store and doc_values', () => {
      const result = indexBuilder()
        .mappings({
          asset_class: keyword({ store: true, doc_values: false })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "asset_class": {
                "doc_values": false,
                "store": true,
                "type": "keyword",
              },
            },
          },
        }
      `);
    });

    it('should set index to false', () => {
      const result = indexBuilder()
        .mappings({
          name: text({ index: false })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "name": {
                "index": false,
                "type": "text",
              },
            },
          },
        }
      `);
    });
  });

  describe('Settings', () => {
    it('should build basic settings', () => {
      const result = indexBuilder()
        .settings({
          number_of_shards: 2,
          number_of_replicas: 1
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "settings": {
            "number_of_replicas": 1,
            "number_of_shards": 2,
          },
        }
      `);
    });

    it('should configure refresh interval', () => {
      const result = indexBuilder()
        .settings({
          refresh_interval: '30s'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "settings": {
            "refresh_interval": "30s",
          },
        }
      `);
    });

    it('should configure max result window', () => {
      const result = indexBuilder()
        .settings({
          max_result_window: 100000
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "settings": {
            "max_result_window": 100000,
          },
        }
      `);
    });
  });

  describe('Aliases', () => {
    it('should add simple alias', () => {
      const result = indexBuilder().alias('products_alias').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aliases": {
            "products_alias": {},
          },
        }
      `);
    });

    it('should add multiple aliases', () => {
      const result = indexBuilder()
        .alias('products_read')
        .alias('products_write')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aliases": {
            "products_read": {},
            "products_write": {},
          },
        }
      `);
    });

    it('should add alias with filter', () => {
      const result = indexBuilder()
        .alias('electronics_alias', {
          filter: { term: { category: 'electronics' } }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aliases": {
            "electronics_alias": {
              "filter": {
                "term": {
                  "category": "electronics",
                },
              },
            },
          },
        }
      `);
    });

    it('should add alias with routing', () => {
      const result = indexBuilder()
        .alias('routed_alias', { routing: 'shard-1' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aliases": {
            "routed_alias": {
              "routing": "shard-1",
            },
          },
        }
      `);
    });

    it('should add alias with is_write_index', () => {
      const result = indexBuilder()
        .alias('write_alias', { is_write_index: true })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aliases": {
            "write_alias": {
              "is_write_index": true,
            },
          },
        }
      `);
    });
  });

  describe('Complete index configuration', () => {
    it('should combine mappings, settings, and aliases', () => {
      const result = indexBuilder()
        .mappings({
          name: text({ analyzer: 'standard' }),
          market_cap: float(),
          asset_class: keyword(),
          tags: keyword(),
          listed_date: date()
        })
        .settings({
          number_of_shards: 2,
          number_of_replicas: 1,
          refresh_interval: '1s'
        })
        .alias('products_alias')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aliases": {
            "products_alias": {},
          },
          "mappings": {
            "properties": {
              "asset_class": {
                "type": "keyword",
              },
              "listed_date": {
                "type": "date",
              },
              "market_cap": {
                "type": "float",
              },
              "name": {
                "analyzer": "standard",
                "type": "text",
              },
              "tags": {
                "type": "keyword",
              },
            },
          },
          "settings": {
            "number_of_replicas": 1,
            "number_of_shards": 2,
            "refresh_interval": "1s",
          },
        }
      `);
    });
  });

  describe('Real-world index configurations', () => {
    it('should build e-commerce product index', () => {
      const result = indexBuilder()
        .mappings({
          isin: keyword(),
          name: text({
            analyzer: 'standard',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' }
            }
          }),
          sector: text({ analyzer: 'english' }),
          market_cap: float(),
          asset_class: keyword(),
          tags: keyword(),
          listed_date: date()
        })
        .settings({
          number_of_shards: 3,
          number_of_replicas: 2,
          refresh_interval: '5s',
          max_result_window: 50000
        })
        .alias('products_live')
        .alias('products_search', {
          filter: { range: { market_cap: { gte: 0 } } }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aliases": {
            "products_live": {},
            "products_search": {
              "filter": {
                "range": {
                  "market_cap": {
                    "gte": 0,
                  },
                },
              },
            },
          },
          "mappings": {
            "properties": {
              "asset_class": {
                "type": "keyword",
              },
              "isin": {
                "type": "keyword",
              },
              "listed_date": {
                "type": "date",
              },
              "market_cap": {
                "type": "float",
              },
              "name": {
                "analyzer": "standard",
                "fields": {
                  "keyword": {
                    "type": "keyword",
                  },
                  "suggest": {
                    "type": "completion",
                  },
                },
                "type": "text",
              },
              "sector": {
                "analyzer": "english",
                "type": "text",
              },
              "tags": {
                "type": "keyword",
              },
            },
          },
          "settings": {
            "max_result_window": 50000,
            "number_of_replicas": 2,
            "number_of_shards": 3,
            "refresh_interval": "5s",
          },
        }
      `);
    });

    it('should build vector search index', () => {
      const result = indexBuilder()
        .mappings({
          name: text(),
          embedding: denseVector({
            dims: 768,
            index: true,
            index_options: {
              type: 'hnsw',
              m: 16,
              ef_construction: 200
            }
          })
        })
        .settings({
          number_of_shards: 1,
          number_of_replicas: 0
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "embedding": {
                "dims": 768,
                "index": true,
                "index_options": {
                  "ef_construction": 200,
                  "m": 16,
                  "type": "hnsw",
                },
                "type": "dense_vector",
              },
              "name": {
                "type": "text",
              },
            },
          },
          "settings": {
            "number_of_replicas": 0,
            "number_of_shards": 1,
          },
        }
      `);
    });

    it('should build time-series index', () => {
      const result = indexBuilder()
        .mappings({
          timestamp: date(),
          level: keyword(),
          message: text(),
          source: keyword()
        })
        .settings({
          number_of_shards: 1,
          number_of_replicas: 1,
          refresh_interval: '30s'
        })
        .alias('logs_current')
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aliases": {
            "logs_current": {},
          },
          "mappings": {
            "properties": {
              "level": {
                "type": "keyword",
              },
              "message": {
                "type": "text",
              },
              "source": {
                "type": "keyword",
              },
              "timestamp": {
                "type": "date",
              },
            },
          },
          "settings": {
            "number_of_replicas": 1,
            "number_of_shards": 1,
            "refresh_interval": "30s",
          },
        }
      `);
    });
  });

  describe('Field helpers', () => {
    it('should resolve field helpers to field mappings', () => {
      const result = indexBuilder()
        .mappings({ name: text(), count: integer() })
        .build();

      expect(result.mappings?.properties.name).toEqual({ type: 'text' });
      expect(result.mappings?.properties.count).toEqual({ type: 'integer' });
    });

    it('should support helpers called with no options', () => {
      const result = indexBuilder()
        .mappings({ name: text(), price: float(), active: boolean() })
        .build();

      expect(result.mappings?.properties.name).toEqual({ type: 'text' });
      expect(result.mappings?.properties.price).toEqual({ type: 'float' });
      expect(result.mappings?.properties.active).toEqual({ type: 'boolean' });
    });

    it('should support helpers with and without options', () => {
      const result = indexBuilder()
        .mappings({
          isin: keyword(),
          name: text({ analyzer: 'standard' }),
          market_cap: float(),
          embedding: denseVector({ dims: 384 })
        })
        .build();

      expect(result.mappings?.properties.isin).toEqual({ type: 'keyword' });
      expect(result.mappings?.properties.name).toEqual({
        type: 'text',
        analyzer: 'standard'
      });
      expect(result.mappings?.properties.market_cap).toEqual({ type: 'float' });
      expect(result.mappings?.properties.embedding).toEqual({
        type: 'dense_vector',
        dims: 384
      });
    });

    it('should support all numeric helpers', () => {
      const result = indexBuilder()
        .mappings({ a: long(), b: short(), c: byte(), d: double() })
        .build();

      expect(result.mappings?.properties.a?.type).toBe('long');
      expect(result.mappings?.properties.b?.type).toBe('short');
      expect(result.mappings?.properties.c?.type).toBe('byte');
      expect(result.mappings?.properties.d?.type).toBe('double');
    });

    it('should support geo and completion helpers', () => {
      const result = indexBuilder()
        .mappings({
          location: geoPoint(),
          suggest: completion({ analyzer: 'simple' })
        })
        .build();

      expect(result.mappings?.properties.location).toEqual({
        type: 'geo_point'
      });
      expect(result.mappings?.properties.suggest).toEqual({
        type: 'completion',
        analyzer: 'simple'
      });
    });

    it('should support date helper with format', () => {
      const result = indexBuilder()
        .mappings({ created: date({ format: 'yyyy-MM-dd' }) })
        .build();

      expect(result.mappings?.properties.created).toEqual({
        type: 'date',
        format: 'yyyy-MM-dd'
      });
    });

    it('should support range type helpers', () => {
      const result = indexBuilder()
        .mappings({ availability: dateRange() })
        .build();

      expect(result.mappings?.properties.availability).toEqual({
        type: 'date_range'
      });
    });

    it('should support integer helper with options', () => {
      const result = indexBuilder()
        .mappings({ count: integer({ store: true }) })
        .build();

      expect(result.mappings?.properties.count).toEqual({
        type: 'integer',
        store: true
      });
    });

    it('should support halfFloat helper', () => {
      const result = indexBuilder().mappings({ score: halfFloat() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "score": {
                "type": "half_float",
              },
            },
          },
        }
      `);
    });

    it('should support halfFloat helper with options', () => {
      const result = indexBuilder()
        .mappings({ score: halfFloat({ index: false }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "score": {
                "index": false,
                "type": "half_float",
              },
            },
          },
        }
      `);
    });

    it('should support binary helper', () => {
      const result = indexBuilder().mappings({ blob: binary() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "blob": {
                "type": "binary",
              },
            },
          },
        }
      `);
    });

    it('should support ip helper', () => {
      const result = indexBuilder().mappings({ remote_ip: ip() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "remote_ip": {
                "type": "ip",
              },
            },
          },
        }
      `);
    });

    it('should support ip helper with options', () => {
      const result = indexBuilder()
        .mappings({ remote_ip: ip({ store: true }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "remote_ip": {
                "store": true,
                "type": "ip",
              },
            },
          },
        }
      `);
    });

    it('should support geoShape helper', () => {
      const result = indexBuilder().mappings({ boundary: geoShape() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "boundary": {
                "type": "geo_shape",
              },
            },
          },
        }
      `);
    });

    it('should support geoShape helper with options', () => {
      const result = indexBuilder()
        .mappings({ boundary: geoShape({ ignore_malformed: true }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "boundary": {
                "ignore_malformed": true,
                "type": "geo_shape",
              },
            },
          },
        }
      `);
    });

    it('should support integerRange helper', () => {
      const result = indexBuilder()
        .mappings({ age_range: integerRange() })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "age_range": {
                "type": "integer_range",
              },
            },
          },
        }
      `);
    });

    it('should support floatRange helper', () => {
      const result = indexBuilder()
        .mappings({ price_range: floatRange() })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "price_range": {
                "type": "float_range",
              },
            },
          },
        }
      `);
    });

    it('should support longRange helper', () => {
      const result = indexBuilder()
        .mappings({ timestamp_range: longRange() })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "timestamp_range": {
                "type": "long_range",
              },
            },
          },
        }
      `);
    });

    it('should support doubleRange helper', () => {
      const result = indexBuilder()
        .mappings({ score_range: doubleRange() })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "score_range": {
                "type": "double_range",
              },
            },
          },
        }
      `);
    });

    it('should support range helpers with options', () => {
      const result = indexBuilder()
        .mappings({ availability: integerRange({ store: true }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "availability": {
                "store": true,
                "type": "integer_range",
              },
            },
          },
        }
      `);
    });

    it('should support object helper with no arguments', () => {
      const result = indexBuilder().mappings({ metadata: object() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "metadata": {
                "type": "object",
              },
            },
          },
        }
      `);
    });

    it('should support object helper with fields', () => {
      const result = indexBuilder()
        .mappings({
          address: object({ street: text(), city: keyword() })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "address": {
                "properties": {
                  "city": {
                    "type": "keyword",
                  },
                  "street": {
                    "type": "text",
                  },
                },
                "type": "object",
              },
            },
          },
        }
      `);
    });

    it('should support object helper with enabled: false', () => {
      const result = indexBuilder()
        .mappings({ raw: object(undefined, { enabled: false }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "raw": {
                "enabled": false,
                "type": "object",
              },
            },
          },
        }
      `);
    });

    it('should support object helper with fields and enabled option', () => {
      const result = indexBuilder()
        .mappings({
          address: object({ street: text() }, { enabled: true })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "address": {
                "enabled": true,
                "properties": {
                  "street": {
                    "type": "text",
                  },
                },
                "type": "object",
              },
            },
          },
        }
      `);
    });

    it('should support alias helper with path', () => {
      const result = indexBuilder()
        .mappings({ full_name: alias({ path: 'name' }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "full_name": {
                "path": "name",
                "type": "alias",
              },
            },
          },
        }
      `);
    });

    it('should support alias helper with no options', () => {
      const result = indexBuilder().mappings({ full_name: alias() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "full_name": {
                "type": "alias",
              },
            },
          },
        }
      `);
    });
  });

  describe('Undefined field guard', () => {
    it('should skip fields with undefined values in mappings', () => {
      const result = indexBuilder()
        .mappings({
          name: text(),
          price: undefined as unknown as ReturnType<typeof float>
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "properties": {
              "name": {
                "type": "text",
              },
              "price": undefined,
            },
          },
        }
      `);
    });
  });
});
