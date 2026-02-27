import { fastIngestSettings, productionSearchSettings, indexSortSettings, indexBuilder } from '..';

describe('Settings Presets', () => {
  describe('productionSearchSettings', () => {
    it('should return balanced production defaults', () => {
      const result = productionSearchSettings();

      expect(result).toMatchInlineSnapshot(`
        {
          "number_of_replicas": 1,
          "refresh_interval": "5s",
        }
      `);
    });

    it('should allow overriding defaults', () => {
      const result = productionSearchSettings({
        number_of_replicas: 2,
        refresh_interval: '10s'
      });

      expect(result).toMatchInlineSnapshot(`
        {
          "number_of_replicas": 2,
          "refresh_interval": "10s",
        }
      `);
    });

    it('should allow adding codec compression', () => {
      const result = productionSearchSettings({ codec: 'best_compression' });

      expect(result).toMatchInlineSnapshot(`
        {
          "codec": "best_compression",
          "number_of_replicas": 1,
          "refresh_interval": "5s",
        }
      `);
    });
  });

  describe('indexSortSettings', () => {
    it('should generate sort config from a single field', () => {
      const result = indexSortSettings({ timestamp: 'desc' });

      expect(result).toMatchInlineSnapshot(`
        {
          "sort": {
            "field": [
              "timestamp",
            ],
            "order": [
              "desc",
            ],
          },
        }
      `);
    });

    it('should generate sort config from multiple fields', () => {
      const result = indexSortSettings({
        timestamp: 'desc',
        status: 'asc',
        priority: 'desc'
      });

      expect(result).toMatchInlineSnapshot(`
        {
          "sort": {
            "field": [
              "timestamp",
              "status",
              "priority",
            ],
            "order": [
              "desc",
              "asc",
              "desc",
            ],
          },
        }
      `);
    });

    it('should compose with other settings via spread', () => {
      const result = {
        ...productionSearchSettings(),
        index: indexSortSettings({ timestamp: 'desc' })
      };

      expect(result).toMatchInlineSnapshot(`
        {
          "index": {
            "sort": {
              "field": [
                "timestamp",
              ],
              "order": [
                "desc",
              ],
            },
          },
          "number_of_replicas": 1,
          "refresh_interval": "5s",
        }
      `);
    });
  });

  describe('fastIngestSettings', () => {
    it('should return optimized settings for bulk ingestion', () => {
      const result = fastIngestSettings();

      expect(result).toMatchInlineSnapshot(`
        {
          "number_of_replicas": 0,
          "refresh_interval": "-1",
          "translog": {
            "durability": "async",
            "sync_interval": "30s",
          },
        }
      `);
    });

    it('should allow overriding defaults', () => {
      const result = fastIngestSettings({ number_of_replicas: 1 });

      expect(result).toMatchInlineSnapshot(`
        {
          "number_of_replicas": 1,
          "refresh_interval": "-1",
          "translog": {
            "durability": "async",
            "sync_interval": "30s",
          },
        }
      `);
    });

    it('should allow adding extra settings', () => {
      const result = fastIngestSettings({ number_of_shards: 3 });

      expect(result).toMatchInlineSnapshot(`
        {
          "number_of_replicas": 0,
          "number_of_shards": 3,
          "refresh_interval": "-1",
          "translog": {
            "durability": "async",
            "sync_interval": "30s",
          },
        }
      `);
    });

    it('should deep-merge translog overrides without clobbering defaults', () => {
      const result = fastIngestSettings({ translog: { durability: 'request' } });

      expect(result).toMatchInlineSnapshot(`
        {
          "number_of_replicas": 0,
          "refresh_interval": "-1",
          "translog": {
            "durability": "request",
            "sync_interval": "30s",
          },
        }
      `);
    });
  });

  describe('Preset integration with indexBuilder', () => {
    it('should work with indexBuilder().settings()', () => {
      const result = indexBuilder().settings(productionSearchSettings()).build();

      expect(result).toMatchInlineSnapshot(`
        {
          "settings": {
            "number_of_replicas": 1,
            "refresh_interval": "5s",
          },
        }
      `);
    });

    it('should allow spreading presets with additional settings', () => {
      const result = indexBuilder()
        .settings({
          ...productionSearchSettings(),
          number_of_shards: 3
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        {
          "settings": {
            "number_of_replicas": 1,
            "number_of_shards": 3,
            "refresh_interval": "5s",
          },
        }
      `);
    });
  });
});
