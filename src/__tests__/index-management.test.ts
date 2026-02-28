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
  quantizedDenseVector
} from '..';

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

    it('should support object helper with no arguments', () => {
      const result = indexBuilder().mappings({ metadata: object() }).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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

    it('should support object helper with enabled: false', () => {
      const result = indexBuilder()
        .mappings({ raw: object(undefined, { enabled: false }) })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": "strict",
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
});
