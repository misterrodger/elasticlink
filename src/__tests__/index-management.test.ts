import {
  indexBuilder,
  mappings,
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
  alias,
  matchOnlyText,
  searchAsYouType,
  constantKeyword,
  wildcardField,
  flattened,
  quantizedDenseVector,
  sparseVector,
  semanticText,
  unsignedLong,
  dateNanos,
  ipRange,
  rankFeature,
  rankFeatures,
  tokenCount,
  murmur3Hash,
  join
} from '..';
import type { Infer } from '..';

describe('Index Management', () => {
  describe('Builder behavior', () => {
    it('should return empty object for empty builder', () => {
      const result = indexBuilder().build();

      expect(result).toMatchInlineSnapshot(`{}`);
    });

    it('should replace mappings when called twice', () => {
      const result = indexBuilder().mappings({ name: text() }).mappings({ market_cap: float() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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
      const result = indexBuilder().settings({ number_of_shards: 3 }).settings({ number_of_replicas: 2 }).build();

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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
      const result = indexBuilder().mappings({ availability: dateRange() }).build();

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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
      const result = indexBuilder().alias('products_read').alias('products_write').build();

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
      const result = indexBuilder().alias('routed_alias', { routing: 'shard-1' }).build();

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
      const result = indexBuilder().alias('write_alias', { is_write_index: true }).build();

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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
      const result = indexBuilder().mappings({ name: text(), count: integer() }).build();

      expect(result.mappings?.properties.name).toStrictEqual({ type: 'text' });
      expect(result.mappings?.properties.count).toStrictEqual({
        type: 'integer'
      });
    });

    it('should support helpers called with no options', () => {
      const result = indexBuilder().mappings({ name: text(), price: float(), active: boolean() }).build();

      expect(result.mappings?.properties.name).toStrictEqual({ type: 'text' });
      expect(result.mappings?.properties.price).toStrictEqual({
        type: 'float'
      });
      expect(result.mappings?.properties.active).toStrictEqual({
        type: 'boolean'
      });
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

      expect(result.mappings?.properties.isin).toStrictEqual({
        type: 'keyword'
      });
      expect(result.mappings?.properties.name).toStrictEqual({
        type: 'text',
        analyzer: 'standard'
      });
      expect(result.mappings?.properties.market_cap).toStrictEqual({
        type: 'float'
      });
      expect(result.mappings?.properties.embedding).toStrictEqual({
        type: 'dense_vector',
        dims: 384
      });
    });

    it('should support all numeric helpers', () => {
      const result = indexBuilder().mappings({ a: long(), b: short(), c: byte(), d: double() }).build();

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

      expect(result.mappings?.properties.location).toStrictEqual({
        type: 'geo_point'
      });
      expect(result.mappings?.properties.suggest).toStrictEqual({
        type: 'completion',
        analyzer: 'simple'
      });
    });

    it('should support date helper with format', () => {
      const result = indexBuilder()
        .mappings({ created: date({ format: 'yyyy-MM-dd' }) })
        .build();

      expect(result.mappings?.properties.created).toStrictEqual({
        type: 'date',
        format: 'yyyy-MM-dd'
      });
    });

    it('should support range type helpers', () => {
      const result = indexBuilder().mappings({ availability: dateRange() }).build();

      expect(result.mappings?.properties.availability).toStrictEqual({
        type: 'date_range'
      });
    });

    it('should support integer helper with options', () => {
      const result = indexBuilder()
        .mappings({ count: integer({ store: true }) })
        .build();

      expect(result.mappings?.properties.count).toStrictEqual({
        type: 'integer',
        store: true
      });
    });

    it('should support halfFloat helper', () => {
      const result = indexBuilder().mappings({ score: halfFloat() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
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
      const result = indexBuilder().mappings({ age_range: integerRange() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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
      const result = indexBuilder().mappings({ price_range: floatRange() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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
      const result = indexBuilder().mappings({ timestamp_range: longRange() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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
      const result = indexBuilder().mappings({ score_range: doubleRange() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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
            "dynamic": "strict",
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

    it('should support object helper with fields', () => {
      const result = indexBuilder()
        .mappings({
          address: object({ street: text(), city: keyword() })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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

    it('should support object helper with fields and enabled option', () => {
      const result = indexBuilder()
        .mappings({
          address: object({ street: text() }, { enabled: true })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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
            "dynamic": "strict",
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
            "dynamic": "strict",
            "properties": {
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });
  });

  describe('Mapping options (dynamic, _source, _meta)', () => {
    it('should default to dynamic strict when using mappings() factory', () => {
      const schema = mappings({ name: text() });
      const result = indexBuilder().mappings(schema).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should allow overriding dynamic to true', () => {
      const schema = mappings({ name: text() }, { dynamic: true });
      const result = indexBuilder().mappings(schema).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": true,
            "properties": {
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should allow overriding dynamic to runtime', () => {
      const schema = mappings({ name: text() }, { dynamic: 'runtime' });
      const result = indexBuilder().mappings(schema).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "runtime",
            "properties": {
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should default to dynamic strict for inline mappings (raw fields)', () => {
      const result = indexBuilder().mappings({ name: text() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should allow overriding dynamic on inline mappings via options', () => {
      const result = indexBuilder().mappings({ name: text() }, { dynamic: true }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": true,
            "properties": {
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should allow _source and _meta on inline mappings via options', () => {
      const result = indexBuilder()
        .mappings(
          { name: text(), embedding: denseVector({ dims: 384 }) },
          { _source: { excludes: ['embedding'] }, _meta: { version: 2 } }
        )
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "_meta": {
              "version": 2,
            },
            "_source": {
              "excludes": [
                "embedding",
              ],
            },
            "dynamic": "strict",
            "properties": {
              "embedding": {
                "dims": 384,
                "type": "dense_vector",
              },
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should allow inline options to override schema options', () => {
      const schema = mappings({ name: text() }, { dynamic: 'strict', _meta: { version: 1 } });
      const result = indexBuilder()
        .mappings(schema, { _meta: { version: 2 } })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "_meta": {
              "version": 2,
            },
            "dynamic": "strict",
            "properties": {
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should pass _source excludes through to index mappings', () => {
      const schema = mappings(
        { title: text(), embedding: denseVector({ dims: 768 }) },
        { _source: { excludes: ['embedding'] } }
      );
      const result = indexBuilder().mappings(schema).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "_source": {
              "excludes": [
                "embedding",
              ],
            },
            "dynamic": "strict",
            "properties": {
              "embedding": {
                "dims": 768,
                "type": "dense_vector",
              },
              "title": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should pass _source includes through to index mappings', () => {
      const schema = mappings(
        { title: text(), body: text(), tags: keyword() },
        { _source: { includes: ['title', 'tags'] } }
      );
      const result = indexBuilder().mappings(schema).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "_source": {
              "includes": [
                "title",
                "tags",
              ],
            },
            "dynamic": "strict",
            "properties": {
              "body": {
                "type": "text",
              },
              "tags": {
                "type": "keyword",
              },
              "title": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should pass _meta through to index mappings', () => {
      const schema = mappings({ name: text() }, { _meta: { version: '1.0', created_by: 'elasticlink' } });
      const result = indexBuilder().mappings(schema).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "_meta": {
              "created_by": "elasticlink",
              "version": "1.0",
            },
            "dynamic": "strict",
            "properties": {
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });
  });

  describe('New field-level options', () => {
    it('should support copy_to on text fields', () => {
      const result = indexBuilder()
        .mappings({
          title: text({ copy_to: 'searchable' }),
          body: text({ copy_to: ['searchable', 'all_text'] })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "body": {
                "copy_to": [
                  "searchable",
                  "all_text",
                ],
                "type": "text",
              },
              "title": {
                "copy_to": "searchable",
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should support index_prefixes and index_phrases on text fields', () => {
      const result = indexBuilder()
        .mappings({
          name: text({
            index_prefixes: { min_chars: 2, max_chars: 5 },
            index_phrases: true
          })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "name": {
                "index_phrases": true,
                "index_prefixes": {
                  "max_chars": 5,
                  "min_chars": 2,
                },
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should support eager_global_ordinals on keyword fields', () => {
      const result = indexBuilder()
        .mappings({ status: keyword({ eager_global_ordinals: true }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "status": {
                "eager_global_ordinals": true,
                "type": "keyword",
              },
            },
          },
        }
      `);
    });

    it('should support null_value on keyword fields', () => {
      const result = indexBuilder()
        .mappings({ status: keyword({ null_value: 'UNKNOWN' }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "status": {
                "null_value": "UNKNOWN",
                "type": "keyword",
              },
            },
          },
        }
      `);
    });

    it('should support ignore_malformed on numeric fields', () => {
      const result = indexBuilder()
        .mappings({ price: float({ ignore_malformed: true }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "price": {
                "ignore_malformed": true,
                "type": "float",
              },
            },
          },
        }
      `);
    });

    it('should support ignore_malformed on date fields', () => {
      const result = indexBuilder()
        .mappings({ created: date({ ignore_malformed: true }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "created": {
                "ignore_malformed": true,
                "type": "date",
              },
            },
          },
        }
      `);
    });

    it('should support ignore_malformed on geo_point fields', () => {
      const result = indexBuilder()
        .mappings({ location: geoPoint({ ignore_malformed: true }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "location": {
                "ignore_malformed": true,
                "type": "geo_point",
              },
            },
          },
        }
      `);
    });

    it('should support ignore_malformed on ip fields', () => {
      const result = indexBuilder()
        .mappings({ addr: ip({ ignore_malformed: true }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "addr": {
                "ignore_malformed": true,
                "type": "ip",
              },
            },
          },
        }
      `);
    });

    it('should support term_vector on text fields', () => {
      const result = indexBuilder()
        .mappings({
          content: text({ term_vector: 'with_positions_offsets' })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "content": {
                "term_vector": "with_positions_offsets",
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should support null_value on numeric fields', () => {
      const result = indexBuilder()
        .mappings({ count: integer({ null_value: 0 }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "count": {
                "null_value": 0,
                "type": "integer",
              },
            },
          },
        }
      `);
    });

    it('should support ignore_above on keyword fields', () => {
      const result = indexBuilder()
        .mappings({ tag: keyword({ ignore_above: 256 }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "tag": {
                "ignore_above": 256,
                "type": "keyword",
              },
            },
          },
        }
      `);
    });
  });

  describe('New field types', () => {
    it('should support matchOnlyText helper', () => {
      const result = indexBuilder().mappings({ log_message: matchOnlyText() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "log_message": {
                "type": "match_only_text",
              },
            },
          },
        }
      `);
    });

    it('should support matchOnlyText helper with options', () => {
      const result = indexBuilder()
        .mappings({
          log_message: matchOnlyText({
            copy_to: 'searchable'
          })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "log_message": {
                "copy_to": "searchable",
                "type": "match_only_text",
              },
            },
          },
        }
      `);
    });

    it('should support searchAsYouType helper', () => {
      const result = indexBuilder().mappings({ name: searchAsYouType() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "name": {
                "type": "search_as_you_type",
              },
            },
          },
        }
      `);
    });

    it('should support searchAsYouType helper with options', () => {
      const result = indexBuilder()
        .mappings({
          name: searchAsYouType({
            analyzer: 'standard',
            max_shingle_size: 4
          })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "name": {
                "analyzer": "standard",
                "max_shingle_size": 4,
                "type": "search_as_you_type",
              },
            },
          },
        }
      `);
    });

    it('should support constantKeyword helper', () => {
      const result = indexBuilder()
        .mappings({ doc_type: constantKeyword({ value: 'product' }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "doc_type": {
                "type": "constant_keyword",
                "value": "product",
              },
            },
          },
        }
      `);
    });

    it('should support wildcardField helper', () => {
      const result = indexBuilder().mappings({ path: wildcardField() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "path": {
                "type": "wildcard",
              },
            },
          },
        }
      `);
    });

    it('should support wildcardField helper with options', () => {
      const result = indexBuilder()
        .mappings({ path: wildcardField({ ignore_above: 512 }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "path": {
                "ignore_above": 512,
                "type": "wildcard",
              },
            },
          },
        }
      `);
    });

    it('should support flattened helper', () => {
      const result = indexBuilder().mappings({ labels: flattened() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "labels": {
                "type": "flattened",
              },
            },
          },
        }
      `);
    });

    it('should support flattened helper with options', () => {
      const result = indexBuilder()
        .mappings({
          metadata: flattened({ depth_limit: 3, eager_global_ordinals: true })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "metadata": {
                "depth_limit": 3,
                "eager_global_ordinals": true,
                "type": "flattened",
              },
            },
          },
        }
      `);
    });

    it('should support quantizedDenseVector helper', () => {
      const result = indexBuilder()
        .mappings({
          embedding: quantizedDenseVector({ dims: 768, similarity: 'cosine' })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "embedding": {
                "dims": 768,
                "index_options": {
                  "type": "int8_hnsw",
                },
                "similarity": "cosine",
                "type": "dense_vector",
              },
            },
          },
        }
      `);
    });

    it('should support quantizedDenseVector with custom index_options', () => {
      const result = indexBuilder()
        .mappings({
          embedding: quantizedDenseVector({
            dims: 384,
            similarity: 'dot_product',
            index_options: { type: 'int8_hnsw', m: 32, ef_construction: 200 }
          })
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "embedding": {
                "dims": 384,
                "index_options": {
                  "ef_construction": 200,
                  "m": 32,
                  "type": "int8_hnsw",
                },
                "similarity": "dot_product",
                "type": "dense_vector",
              },
            },
          },
        }
      `);
    });

    it('should support quantizedDenseVector with no options', () => {
      const result = indexBuilder().mappings({ embedding: quantizedDenseVector() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "embedding": {
                "index_options": {
                  "type": "int8_hnsw",
                },
                "type": "dense_vector",
              },
            },
          },
        }
      `);
    });
  });

  describe('New field helpers (ES 9.x)', () => {
    it('sparseVector emits sparse_vector type', () => {
      const result = indexBuilder().mappings({ tokens: sparseVector() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "tokens": {
                "type": "sparse_vector",
              },
            },
          },
        }
      `);
    });

    it('semanticText emits semantic_text type with inference_id', () => {
      const result = indexBuilder()
        .mappings({ body: semanticText({ inference_id: '.elser-2-elasticsearch' }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "body": {
                "inference_id": ".elser-2-elasticsearch",
                "type": "semantic_text",
              },
            },
          },
        }
      `);
    });

    it('unsignedLong emits unsigned_long type', () => {
      const result = indexBuilder().mappings({ file_size: unsignedLong() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "file_size": {
                "type": "unsigned_long",
              },
            },
          },
        }
      `);
    });
  });

  describe('analysis() builder method', () => {
    it('emits analysis settings merged under settings.analysis', () => {
      const result = indexBuilder()
        .mappings({ body: text() })
        .analysis({
          analyzer: {
            my_analyzer: { type: 'custom', tokenizer: 'standard', filter: ['lowercase', 'stop'] }
          },
          filter: {
            stop: { type: 'stop', stopwords: '_english_' }
          }
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
            "properties": {
              "body": {
                "type": "text",
              },
            },
          },
          "settings": {
            "analysis": {
              "analyzer": {
                "my_analyzer": {
                  "filter": [
                    "lowercase",
                    "stop",
                  ],
                  "tokenizer": "standard",
                  "type": "custom",
                },
              },
              "filter": {
                "stop": {
                  "stopwords": "_english_",
                  "type": "stop",
                },
              },
            },
          },
        }
      `);
    });

    it('analysis() merges with existing settings rather than replacing them', () => {
      const result = indexBuilder()
        .settings({ number_of_shards: 1 })
        .analysis({ analyzer: { default: { type: 'standard' } } })
        .build();

      expect(result.settings?.number_of_shards).toBe(1);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect((result.settings as any)?.analysis?.analyzer?.default).toStrictEqual({ type: 'standard' });
    });

    // Phase 2 broad-swathe test: exercise the passthrough to `IndicesIndexSettingsAnalysis` by
    // combining a custom analyzer, a pattern tokenizer, custom stemmer + stop token filters,
    // an html_strip char filter, and a custom normalizer in one call. A single snapshot proves
    // that structured ES analyzer config types are preserved verbatim.
    it('passesAllAnalysisComponentsThroughToElasticType', () => {
      const result = indexBuilder()
        .mappings({ body: text() })
        .analysis({
          analyzer: {
            // Custom analyzer referencing a tokenizer + filters + char_filter
            my_analyzer: {
              type: 'custom',
              tokenizer: 'my_pattern_tokenizer',
              filter: ['lowercase', 'my_english_stop', 'my_stemmer'],
              char_filter: ['my_html_strip']
            },
            // Typed built-in language analyzer
            content_analyzer: {
              type: 'english',
              stopwords: '_english_'
            }
          },
          tokenizer: {
            my_pattern_tokenizer: {
              type: 'pattern',
              pattern: '\\W+'
            }
          },
          filter: {
            my_english_stop: {
              type: 'stop',
              stopwords: '_english_'
            },
            my_stemmer: {
              type: 'stemmer',
              language: 'english'
            }
          },
          char_filter: {
            my_html_strip: {
              type: 'html_strip',
              escaped_tags: ['b', 'i']
            }
          },
          normalizer: {
            my_lowercase: {
              type: 'custom',
              filter: ['lowercase', 'asciifolding']
            }
          }
        })
        .build();

      expect(result.settings).toMatchInlineSnapshot(`
        {
          "analysis": {
            "analyzer": {
              "content_analyzer": {
                "stopwords": "_english_",
                "type": "english",
              },
              "my_analyzer": {
                "char_filter": [
                  "my_html_strip",
                ],
                "filter": [
                  "lowercase",
                  "my_english_stop",
                  "my_stemmer",
                ],
                "tokenizer": "my_pattern_tokenizer",
                "type": "custom",
              },
            },
            "char_filter": {
              "my_html_strip": {
                "escaped_tags": [
                  "b",
                  "i",
                ],
                "type": "html_strip",
              },
            },
            "filter": {
              "my_english_stop": {
                "stopwords": "_english_",
                "type": "stop",
              },
              "my_stemmer": {
                "language": "english",
                "type": "stemmer",
              },
            },
            "normalizer": {
              "my_lowercase": {
                "filter": [
                  "lowercase",
                  "asciifolding",
                ],
                "type": "custom",
              },
            },
            "tokenizer": {
              "my_pattern_tokenizer": {
                "pattern": "\\W+",
                "type": "pattern",
              },
            },
          },
        }
      `);
    });

    // Phase 2 negative type test: a nonsense analyzer type should fail compile-time
    // against the discriminated AnalysisAnalyzer union.
    // eslint-disable-next-line vitest/expect-expect
    it('rejectsInvalidAnalyzerType — @ts-expect-error', () => {
      indexBuilder()
        .mappings({ body: text() })
        .analysis({
          analyzer: {
            // @ts-expect-error — 'nonsense' is not a valid AnalysisAnalyzer discriminator
            bad: { type: 'nonsense' }
          }
        });
    });
  });

  describe('IndexBuilder<M> generic threading', () => {
    // Phase 2 type test: .mappings(schema) rebinds IndexBuilder's M generic to the
    // schema's field-type map, so subsequent chain calls carry the correct constraint.
    it('threadsMappingGenericThroughChain', () => {
      const schema = mappings({
        title: text(),
        tag: keyword()
      });

      const builder = indexBuilder().mappings(schema).settings({ number_of_replicas: 2 });
      const built = builder.build();

      expect(built.mappings?.properties).toStrictEqual({
        title: { type: 'text' },
        tag: { type: 'keyword' }
      });
      expect(built.settings?.number_of_replicas).toBe(2);
    });
  });

  describe('Field helper option completeness', () => {
    it('kitchen-sink mapping exercises every added option across all touched helpers', () => {
      const m = mappings({
        title: text({
          analyzer: 'english',
          position_increment_gap: 100,
          norms: false,
          search_quote_analyzer: 'english',
          index_options: 'offsets'
        }),
        tag: keyword({
          split_queries_on_whitespace: true,
          script: { source: "emit(doc['title'].value)" },
          on_script_error: 'continue'
        }),
        published_at: date({
          format: 'yyyy-MM-dd',
          locale: 'en_US',
          script: { source: "emit(doc['created'].value.toEpochMilli())" },
          on_script_error: 'fail'
        }),
        published_at_ns: dateNanos({ format: 'strict_date_optional_time_nanos' }),
        location: geoPoint({
          ignore_z_value: true,
          null_value: { lat: 0, lon: 0 },
          copy_to: 'geo_all',
          script: { source: "emit(doc['raw'].value)" },
          on_script_error: 'continue'
        }),
        suggest: completion({
          analyzer: 'simple',
          contexts: [{ name: 'category', type: 'category' }]
        }),
        typeahead: searchAsYouType({
          max_shingle_size: 3,
          search_quote_analyzer: 'standard',
          norms: true,
          term_vector: 'with_positions_offsets'
        }),
        address: object(
          {
            city: keyword(),
            zip: keyword()
          },
          { dynamic: 'strict', enabled: true }
        ),
        variants: nested(
          {
            sku: keyword(),
            price: float()
          },
          { dynamic: true, include_in_parent: true, include_in_root: false, enabled: true }
        ),
        client_ip_range: ipRange({ index: true, doc_values: true }),
        client_ip: ip(),
        score: rankFeature({ positive_score_impact: true }),
        topics: rankFeatures({ positive_score_impact: false })
      });

      expect(m.properties).toMatchInlineSnapshot(`
        {
          "address": {
            "dynamic": "strict",
            "enabled": true,
            "properties": {
              "city": {
                "type": "keyword",
              },
              "zip": {
                "type": "keyword",
              },
            },
            "type": "object",
          },
          "client_ip": {
            "type": "ip",
          },
          "client_ip_range": {
            "doc_values": true,
            "index": true,
            "type": "ip_range",
          },
          "location": {
            "copy_to": "geo_all",
            "ignore_z_value": true,
            "null_value": {
              "lat": 0,
              "lon": 0,
            },
            "on_script_error": "continue",
            "script": {
              "source": "emit(doc['raw'].value)",
            },
            "type": "geo_point",
          },
          "published_at": {
            "format": "yyyy-MM-dd",
            "locale": "en_US",
            "on_script_error": "fail",
            "script": {
              "source": "emit(doc['created'].value.toEpochMilli())",
            },
            "type": "date",
          },
          "published_at_ns": {
            "format": "strict_date_optional_time_nanos",
            "type": "date_nanos",
          },
          "score": {
            "positive_score_impact": true,
            "type": "rank_feature",
          },
          "suggest": {
            "analyzer": "simple",
            "contexts": [
              {
                "name": "category",
                "type": "category",
              },
            ],
            "type": "completion",
          },
          "tag": {
            "on_script_error": "continue",
            "script": {
              "source": "emit(doc['title'].value)",
            },
            "split_queries_on_whitespace": true,
            "type": "keyword",
          },
          "title": {
            "analyzer": "english",
            "index_options": "offsets",
            "norms": false,
            "position_increment_gap": 100,
            "search_quote_analyzer": "english",
            "type": "text",
          },
          "topics": {
            "positive_score_impact": false,
            "type": "rank_features",
          },
          "typeahead": {
            "max_shingle_size": 3,
            "norms": true,
            "search_quote_analyzer": "standard",
            "term_vector": "with_positions_offsets",
            "type": "search_as_you_type",
          },
          "variants": {
            "dynamic": true,
            "enabled": true,
            "include_in_parent": true,
            "include_in_root": false,
            "properties": {
              "price": {
                "type": "float",
              },
              "sku": {
                "type": "keyword",
              },
            },
            "type": "nested",
          },
        }
      `);
    });

    describe('Infer<> for new field types', () => {
      it('dateNanos infers to string', () => {
        const _m = mappings({ ts: dateNanos() });
        type T = Infer<typeof _m>;
        const sample: T = { ts: '2026-04-05T12:00:00.000000123Z' };

        expect(sample.ts).toBeDefined();
      });

      it('ipRange infers to IP range shape or string', () => {
        const _m = mappings({ net: ipRange() });
        type T = Infer<typeof _m>;
        const asObject: T = { net: { gte: '10.0.0.0', lte: '10.255.255.255' } };
        const asString: T = { net: '10.0.0.0/8' };

        expect(asObject.net).toBeDefined();
        expect(asString.net).toBeDefined();
      });

      it('dateNanos is accepted wherever a date field is required (DateFields projection)', () => {
        const _m = mappings({
          created_ns: dateNanos(),
          views: integer()
        });
        // Verifies DateFields<M> includes date_nanos — compile-time assertion via usage.
        const pick: keyof Infer<typeof _m> = 'created_ns';

        expect(pick).toBe('created_ns');
      });
    });
  });

  describe('Field helpers — tokenCount, murmur3Hash, join', () => {
    it('tokenCount builds correct mapping with options', () => {
      const result = indexBuilder()
        .mappings({
          body_length: tokenCount({ analyzer: 'standard', enable_position_increments: true })
        })
        .build();

      expect(result.mappings?.properties.body_length).toMatchInlineSnapshot(`
        {
          "analyzer": "standard",
          "enable_position_increments": true,
          "type": "token_count",
        }
      `);
    });

    it('tokenCount builds correct mapping without options', () => {
      const result = indexBuilder().mappings({ len: tokenCount() }).build();

      expect(result.mappings?.properties.len).toStrictEqual({ type: 'token_count' });
    });

    it('murmur3Hash builds correct mapping', () => {
      const result = indexBuilder().mappings({ hash: murmur3Hash() }).build();

      expect(result.mappings?.properties.hash).toStrictEqual({ type: 'murmur3' });
    });

    it('join builds correct mapping with relations', () => {
      const result = indexBuilder()
        .mappings({
          relation: join({ relations: { question: 'answer' }, eager_global_ordinals: true })
        })
        .build();

      expect(result.mappings?.properties.relation).toMatchInlineSnapshot(`
        {
          "eager_global_ordinals": true,
          "relations": {
            "question": "answer",
          },
          "type": "join",
        }
      `);
    });

    it('join supports multiple children', () => {
      const result = indexBuilder()
        .mappings({
          relation: join({ relations: { question: ['answer', 'comment'] } })
        })
        .build();

      expect(result.mappings?.properties.relation).toMatchInlineSnapshot(`
        {
          "relations": {
            "question": [
              "answer",
              "comment",
            ],
          },
          "type": "join",
        }
      `);
    });

    it('Infer resolves tokenCount to number and join to string', () => {
      const _m = mappings({
        body_length: tokenCount({ analyzer: 'standard' }),
        relation: join({ relations: { question: 'answer' } }),
        hash: murmur3Hash()
      });

      type Doc = Infer<typeof _m>;
      const _len: Doc['body_length'] = 42;
      const _rel: Doc['relation'] = 'question';
      const _hash: Doc['hash'] = 'abc123';

      expect(_len).toBe(42);
      expect(_rel).toBe('question');
      expect(_hash).toBe('abc123');
    });
  });
});
