import {
  indexBuilder,
  text,
  keyword,
  float,
  integer,
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
import { Instrument } from './fixtures/finance.js';

describe('Index Management', () => {
  describe('Builder behavior', () => {
    it('should return empty object for empty builder', () => {
      const result = indexBuilder<Instrument>().build();

      expect(result).toMatchInlineSnapshot(`{}`);
    });

    it('should replace mappings when called twice', () => {
      const result = indexBuilder<Instrument>()
        .mappings({ name: 'text' })
        .mappings({ market_cap: 'float' })
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
        .mappings({
          name: 'text',
          market_cap: 'float',
          asset_class: 'keyword'
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
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
      type InstrumentWithTranches = {
        name: string;
        tranches: Array<{ maturity: string; currency: string }>;
      };

      const result = indexBuilder<InstrumentWithTranches>()
        .mappings({
          tranches: nested({
            maturity: 'keyword',
            currency: 'keyword'
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
      type InstrumentWithVec = Instrument & { embedding: number[] };
      const result = indexBuilder<InstrumentWithVec>()
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

    it('should build mappings with dynamic strict', () => {
      const result = indexBuilder<Instrument>()
        .mappings({
          dynamic: 'strict',
          name: 'text'
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

    it('should build mappings with dynamic false', () => {
      const result = indexBuilder<Instrument>()
        .mappings({
          dynamic: false,
          name: 'text'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic": false,
            "properties": {
              "name": {
                "type": "text",
              },
            },
          },
        }
      `);
    });

    it('should build mappings with dynamic runtime', () => {
      const result = indexBuilder<Instrument>()
        .mappings({
          dynamic: 'runtime',
          name: 'text'
        })
        .build();

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

    it('should build mappings with dynamic_templates', () => {
      const result = indexBuilder<Instrument>()
        .mappings({
          dynamic_templates: [
            {
              strings_as_keywords: {
                match_mapping_type: 'string',
                mapping: { type: 'keyword' }
              }
            }
          ],
          name: 'text'
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
            "dynamic_templates": [
              {
                "strings_as_keywords": {
                  "mapping": {
                    "type": "keyword",
                  },
                  "match_mapping_type": "string",
                },
              },
            ],
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

  describe('Field type coverage', () => {
    it('should support integer field type', () => {
      type Doc = { count: number };
      const result = indexBuilder<Doc>().mappings({ count: 'integer' }).build();

      expect(result.mappings?.properties.count?.type).toBe('integer');
    });

    it('should support boolean field type', () => {
      type Doc = { active: boolean };
      const result = indexBuilder<Doc>()
        .mappings({ active: 'boolean' })
        .build();

      expect(result.mappings?.properties.active?.type).toBe('boolean');
    });

    it('should support geo_point field type', () => {
      type Doc = { location: { lat: number; lon: number } };
      const result = indexBuilder<Doc>()
        .mappings({ location: 'geo_point' })
        .build();

      expect(result.mappings?.properties.location?.type).toBe('geo_point');
    });

    it('should support date_range field type', () => {
      type Doc = { availability: string };
      const result = indexBuilder<Doc>()
        .mappings({ availability: 'date_range' })
        .build();

      expect(result.mappings?.properties.availability?.type).toBe('date_range');
    });

    it('should support scaled_float with scaling_factor', () => {
      type Doc = { score: number };
      const result = indexBuilder<Doc>()
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
      type Doc = { query: string };
      const result = indexBuilder<Doc>()
        .mappings({ query: percolator() })
        .build();

      expect(result.mappings?.properties.query?.type).toBe('percolator');
    });
  });

  describe('Field mapping properties', () => {
    it('should set boost on a field', () => {
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>().alias('products_alias').build();

      expect(result).toMatchInlineSnapshot(`
        {
          "aliases": {
            "products_alias": {},
          },
        }
      `);
    });

    it('should add multiple aliases', () => {
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
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
      const result = indexBuilder<Instrument>()
        .mappings({
          name: text({ analyzer: 'standard' }),
          market_cap: 'float',
          asset_class: 'keyword',
          tags: 'keyword',
          listed_date: 'date'
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
      const result = indexBuilder<Instrument>()
        .mappings({
          isin: 'keyword',
          name: text({
            analyzer: 'standard',
            fields: {
              keyword: { type: 'keyword' },
              suggest: { type: 'completion' }
            }
          }),
          sector: text({ analyzer: 'english' }),
          market_cap: 'float',
          asset_class: 'keyword',
          tags: 'keyword',
          listed_date: 'date'
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
      type VectorInstrument = {
        name: string;
        embedding: number[];
      };

      const result = indexBuilder<VectorInstrument>()
        .mappings({
          name: 'text',
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
      type LogEntry = {
        timestamp: string;
        level: string;
        message: string;
        source: string;
      };

      const result = indexBuilder<LogEntry>()
        .mappings({
          timestamp: 'date',
          level: 'keyword',
          message: 'text',
          source: 'keyword'
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
    it('should resolve shorthand strings to field mappings', () => {
      type Doc = { name: string; count: number };
      const result = indexBuilder<Doc>()
        .mappings({ name: 'text', count: 'integer' })
        .build();

      expect(result.mappings?.properties.name).toEqual({ type: 'text' });
      expect(result.mappings?.properties.count).toEqual({ type: 'integer' });
    });

    it('should support helpers called with no options', () => {
      type Doc = { name: string; price: number; active: boolean };
      const result = indexBuilder<Doc>()
        .mappings({ name: text(), price: float(), active: boolean() })
        .build();

      expect(result.mappings?.properties.name).toEqual({ type: 'text' });
      expect(result.mappings?.properties.price).toEqual({ type: 'float' });
      expect(result.mappings?.properties.active).toEqual({ type: 'boolean' });
    });

    it('should mix shorthand strings and helpers', () => {
      type InstrumentWithVec2 = Instrument & { embedding: number[] };
      const result = indexBuilder<InstrumentWithVec2>()
        .mappings({
          isin: 'keyword',
          name: text({ analyzer: 'standard' }),
          market_cap: 'float',
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
      type Doc = { a: number; b: number; c: number; d: number };
      const result = indexBuilder<Doc>()
        .mappings({ a: 'long', b: 'short', c: 'byte', d: 'double' })
        .build();

      expect(result.mappings?.properties.a?.type).toBe('long');
      expect(result.mappings?.properties.b?.type).toBe('short');
      expect(result.mappings?.properties.c?.type).toBe('byte');
      expect(result.mappings?.properties.d?.type).toBe('double');
    });

    it('should support geo and completion helpers', () => {
      type Doc = { location: unknown; suggest: string };
      const result = indexBuilder<Doc>()
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
      type Doc = { created: string };
      const result = indexBuilder<Doc>()
        .mappings({ created: date({ format: 'yyyy-MM-dd' }) })
        .build();

      expect(result.mappings?.properties.created).toEqual({
        type: 'date',
        format: 'yyyy-MM-dd'
      });
    });

    it('should support range type helpers', () => {
      type Doc = { availability: string };
      const result = indexBuilder<Doc>()
        .mappings({ availability: dateRange() })
        .build();

      expect(result.mappings?.properties.availability).toEqual({
        type: 'date_range'
      });
    });

    it('should support integer helper with options', () => {
      type Doc = { count: number };
      const result = indexBuilder<Doc>()
        .mappings({ count: integer({ store: true }) })
        .build();

      expect(result.mappings?.properties.count).toEqual({
        type: 'integer',
        store: true
      });
    });

    it('should support halfFloat helper', () => {
      type Doc = { score: number };
      const result = indexBuilder<Doc>()
        .mappings({ score: halfFloat() })
        .build();

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
      type Doc = { score: number };
      const result = indexBuilder<Doc>()
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
      type Doc = { blob: string };
      const result = indexBuilder<Doc>().mappings({ blob: binary() }).build();

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
      type Doc = { remote_ip: string };
      const result = indexBuilder<Doc>().mappings({ remote_ip: ip() }).build();

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
      type Doc = { remote_ip: string };
      const result = indexBuilder<Doc>()
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
      type Doc = { boundary: unknown };
      const result = indexBuilder<Doc>()
        .mappings({ boundary: geoShape() })
        .build();

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
      type Doc = { boundary: unknown };
      const result = indexBuilder<Doc>()
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
      type Doc = { age_range: unknown };
      const result = indexBuilder<Doc>()
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
      type Doc = { price_range: unknown };
      const result = indexBuilder<Doc>()
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
      type Doc = { timestamp_range: unknown };
      const result = indexBuilder<Doc>()
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
      type Doc = { score_range: unknown };
      const result = indexBuilder<Doc>()
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
      type Doc = { availability: unknown };
      const result = indexBuilder<Doc>()
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
      type Doc = { metadata: Record<string, unknown> };
      const result = indexBuilder<Doc>()
        .mappings({ metadata: object() })
        .build();

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
      type Doc = { address: { street: string; city: string } };
      const result = indexBuilder<Doc>()
        .mappings({
          address: object({ street: 'text', city: 'keyword' })
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
      type Doc = { raw: unknown };
      const result = indexBuilder<Doc>()
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
      type Doc = { address: { street: string } };
      const result = indexBuilder<Doc>()
        .mappings({
          address: object({ street: 'text' }, { enabled: true })
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
      type Doc = { name: string; full_name: string };
      const result = indexBuilder<Doc>()
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
      type Doc = { name: string; full_name: string };
      const result = indexBuilder<Doc>()
        .mappings({ full_name: alias() })
        .build();

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
      type Doc = { name: string; price: number };
      const result = indexBuilder<Doc>()
        .mappings({ name: 'text', price: undefined as unknown as 'float' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "mappings": {
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
});
