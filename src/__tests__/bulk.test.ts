import { bulk } from '..';
import { matterMappings } from './fixtures/legal.schema.js';
import { MATTERS } from './fixtures/legal.data.js';

describe('Bulk API', () => {
  describe('Builder behavior', () => {
    it('should return trailing newline for empty build', () => {
      const result = bulk(matterMappings).build();

      expect(result).toBe('\n');
    });

    it('should return empty array for empty buildArray', () => {
      const result = bulk(matterMappings).buildArray();

      expect(result).toMatchInlineSnapshot(`[]`);
    });

    it('should chain multiple index operations', () => {
      const result = bulk(matterMappings)
        .index(
          {
            matter_id: 'M-1001',
            title: 'Mergers & Acquisitions Advisory',
            practice_area: 'corporate',
            billing_rate: 850
          },
          { _index: 'matters', _id: '1' }
        )
        .index(
          {
            matter_id: 'M-1002',
            title: 'SEC Compliance Review',
            practice_area: 'securities',
            billing_rate: 725
          },
          { _index: 'matters', _id: '2' }
        )
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": {
              "_id": "1",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 850,
            "matter_id": "M-1001",
            "practice_area": "corporate",
            "title": "Mergers & Acquisitions Advisory",
          },
          {
            "index": {
              "_id": "2",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 725,
            "matter_id": "M-1002",
            "practice_area": "securities",
            "title": "SEC Compliance Review",
          },
        ]
      `);
    });
  });

  describe('Index operations', () => {
    it('should build single index operation', () => {
      const result = bulk(matterMappings)
        .index({
          matter_id: 'M-1001',
          title: 'Acquisition Review',
          practice_area: 'corporate',
          billing_rate: 750
        })
        .build();

      const lines = result.split('\n').filter((l) => l);

      expect(lines).toHaveLength(2); // action + document
    });

    it('should index with metadata', () => {
      const result = bulk(matterMappings)
        .index(
          {
            matter_id: 'M-1001',
            title: 'Acquisition Review',
            practice_area: 'corporate',
            billing_rate: 750
          },
          { _index: 'matters', _id: '1' }
        )
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": {
              "_id": "1",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 750,
            "matter_id": "M-1001",
            "practice_area": "corporate",
            "title": "Acquisition Review",
          },
        ]
      `);
    });

    it('should index with routing', () => {
      const result = bulk(matterMappings)
        .index(
          {
            matter_id: 'M-1001',
            title: 'Acquisition Review',
            practice_area: 'corporate',
            billing_rate: 750
          },
          { routing: 'user-123' }
        )
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": {
              "routing": "user-123",
            },
          },
          {
            "billing_rate": 750,
            "matter_id": "M-1001",
            "practice_area": "corporate",
            "title": "Acquisition Review",
          },
        ]
      `);
    });

    it('should index with version', () => {
      const result = bulk(matterMappings)
        .index(
          {
            matter_id: 'M-1001',
            title: 'Acquisition Review',
            practice_area: 'corporate',
            billing_rate: 750
          },
          { version: 5, version_type: 'external' }
        )
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": {
              "version": 5,
              "version_type": "external",
            },
          },
          {
            "billing_rate": 750,
            "matter_id": "M-1001",
            "practice_area": "corporate",
            "title": "Acquisition Review",
          },
        ]
      `);
    });

    it('should index with pipeline', () => {
      const result = bulk(matterMappings)
        .index(
          {
            matter_id: 'M-1001',
            title: 'Acquisition Review',
            practice_area: 'corporate',
            billing_rate: 750
          },
          { _index: 'matters', pipeline: 'enrichment-pipeline' }
        )
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": {
              "_index": "matters",
              "pipeline": "enrichment-pipeline",
            },
          },
          {
            "billing_rate": 750,
            "matter_id": "M-1001",
            "practice_area": "corporate",
            "title": "Acquisition Review",
          },
        ]
      `);
    });
  });

  describe('Create operations', () => {
    it('should build create operation', () => {
      const result = bulk(matterMappings)
        .create({
          matter_id: 'M-1002',
          title: 'SEC Filing Review',
          practice_area: 'securities',
          billing_rate: 700
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        "{"create":{}}
        {"matter_id":"M-1002","title":"SEC Filing Review","practice_area":"securities","billing_rate":700}
        "
      `);
    });

    it('should create with metadata', () => {
      const result = bulk(matterMappings)
        .create(
          {
            matter_id: 'M-1002',
            title: 'SEC Filing Review',
            practice_area: 'securities',
            billing_rate: 700
          },
          { _index: 'matters', _id: '2' }
        )
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "create": {
              "_id": "2",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 700,
            "matter_id": "M-1002",
            "practice_area": "securities",
            "title": "SEC Filing Review",
          },
        ]
      `);
    });

    it('should create with routing', () => {
      const result = bulk(matterMappings)
        .create(
          {
            matter_id: 'M-1003',
            title: 'Patent Portfolio Review',
            practice_area: 'intellectual-property',
            billing_rate: 650
          },
          { _index: 'matters', _id: '3', routing: 'tenant-abc' }
        )
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "create": {
              "_id": "3",
              "_index": "matters",
              "routing": "tenant-abc",
            },
          },
          {
            "billing_rate": 650,
            "matter_id": "M-1003",
            "practice_area": "intellectual-property",
            "title": "Patent Portfolio Review",
          },
        ]
      `);
    });
  });

  describe('Update operations', () => {
    it('should build update with doc', () => {
      const result = bulk(matterMappings)
        .update({
          _index: 'matters',
          _id: '3',
          doc: { title: 'Updated Title', billing_rate: 150 }
        })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "update": {
              "_id": "3",
              "_index": "matters",
            },
          },
          {
            "doc": {
              "billing_rate": 150,
              "title": "Updated Title",
            },
          },
        ]
      `);
    });

    it('should update with script', () => {
      const result = bulk(matterMappings)
        .update({
          _index: 'matters',
          _id: '4',
          script: {
            source: 'ctx._source.price += params.increment',
            params: { increment: 10 }
          }
        })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "update": {
              "_id": "4",
              "_index": "matters",
            },
          },
          {
            "script": {
              "params": {
                "increment": 10,
              },
              "source": "ctx._source.price += params.increment",
            },
          },
        ]
      `);
    });

    it('should update with upsert', () => {
      const result = bulk(matterMappings)
        .update({
          _index: 'matters',
          _id: '5',
          doc: {
            title: 'Updated Matter',
            billing_rate: 900,
            practice_area: 'corporate',
            matter_id: 'M-5'
          },
          upsert: {
            matter_id: 'M-5',
            title: 'New Matter',
            billing_rate: 900,
            practice_area: 'corporate'
          }
        })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "update": {
              "_id": "5",
              "_index": "matters",
            },
          },
          {
            "doc": {
              "billing_rate": 900,
              "matter_id": "M-5",
              "practice_area": "corporate",
              "title": "Updated Matter",
            },
            "upsert": {
              "billing_rate": 900,
              "matter_id": "M-5",
              "practice_area": "corporate",
              "title": "New Matter",
            },
          },
        ]
      `);
    });

    it('should update with doc_as_upsert', () => {
      const result = bulk(matterMappings)
        .update({
          _index: 'matters',
          _id: '6',
          doc: {
            matter_id: 'M-6',
            title: 'IP Dispute',
            billing_rate: 800,
            practice_area: 'intellectual-property'
          },
          doc_as_upsert: true
        })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "update": {
              "_id": "6",
              "_index": "matters",
            },
          },
          {
            "doc": {
              "billing_rate": 800,
              "matter_id": "M-6",
              "practice_area": "intellectual-property",
              "title": "IP Dispute",
            },
            "doc_as_upsert": true,
          },
        ]
      `);
    });

    it('should update with retry_on_conflict', () => {
      const result = bulk(matterMappings)
        .update({
          _index: 'matters',
          _id: '7',
          doc: { billing_rate: 200 },
          retry_on_conflict: 3
        })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "update": {
              "_id": "7",
              "_index": "matters",
              "retry_on_conflict": 3,
            },
          },
          {
            "doc": {
              "billing_rate": 200,
            },
          },
        ]
      `);
    });
  });

  describe('Update body + header passthrough (Phase 4)', () => {
    it('should forward every supported update body field in a single operation', () => {
      const result = bulk(matterMappings)
        .update({
          _index: 'matters',
          _id: 'kitchen-sink',
          retry_on_conflict: 3,
          require_alias: true,
          doc: { billing_rate: 999 },
          doc_as_upsert: true,
          upsert: {
            matter_id: 'M-9999',
            title: 'New matter',
            practice_area: 'corporate',
            billing_rate: 999
          },
          script: { source: 'ctx._source.billing_rate += params.bump', params: { bump: 50 } },
          scripted_upsert: true,
          detect_noop: false,
          _source: ['billing_rate', 'title']
        })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "update": {
              "_id": "kitchen-sink",
              "_index": "matters",
              "require_alias": true,
              "retry_on_conflict": 3,
            },
          },
          {
            "_source": [
              "billing_rate",
              "title",
            ],
            "detect_noop": false,
            "doc": {
              "billing_rate": 999,
            },
            "doc_as_upsert": true,
            "script": {
              "params": {
                "bump": 50,
              },
              "source": "ctx._source.billing_rate += params.bump",
            },
            "scripted_upsert": true,
            "upsert": {
              "billing_rate": 999,
              "matter_id": "M-9999",
              "practice_area": "corporate",
              "title": "New matter",
            },
          },
        ]
      `);
    });

    it('should route dynamic_templates and require_alias into the header line', () => {
      const result = bulk(matterMappings)
        .index(
          { matter_id: 'M-1', title: 'X', practice_area: 'corporate', billing_rate: 100 },
          { _index: 'matters', _id: '1', require_alias: true, dynamic_templates: { title: 'text_multi' } }
        )
        .buildArray();

      expect(result[0]).toMatchInlineSnapshot(`
        {
          "index": {
            "_id": "1",
            "_index": "matters",
            "dynamic_templates": {
              "title": "text_multi",
            },
            "require_alias": true,
          },
        }
      `);
    });
  });

  describe('Delete operations', () => {
    it('should build delete operation', () => {
      const result = bulk(matterMappings).delete({ _index: 'matters', _id: '8' }).buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "delete": {
              "_id": "8",
              "_index": "matters",
            },
          },
        ]
      `);
    });

    it('should delete with routing', () => {
      const result = bulk(matterMappings).delete({ _index: 'matters', _id: '9', routing: 'user-456' }).buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "delete": {
              "_id": "9",
              "_index": "matters",
              "routing": "user-456",
            },
          },
        ]
      `);
    });

    it('should delete with version', () => {
      const result = bulk(matterMappings).delete({ _index: 'matters', _id: '10', version: 3 }).buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "delete": {
              "_id": "10",
              "_index": "matters",
              "version": 3,
            },
          },
        ]
      `);
    });

    it('should delete with version and version_type', () => {
      const result = bulk(matterMappings)
        .delete({
          _index: 'matters',
          _id: '11',
          version: 7,
          version_type: 'external'
        })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "delete": {
              "_id": "11",
              "_index": "matters",
              "version": 7,
              "version_type": "external",
            },
          },
        ]
      `);
    });
  });

  describe('Mixed operations', () => {
    it('should combine multiple operation types', () => {
      const result = bulk(matterMappings)
        .index(
          {
            matter_id: 'M-2001',
            title: 'Contract Negotiation',
            practice_area: 'corporate',
            billing_rate: 800
          },
          { _index: 'matters', _id: '1' }
        )
        .create(
          {
            matter_id: 'M-2002',
            title: 'Regulatory Compliance',
            practice_area: 'securities',
            billing_rate: 750
          },
          { _index: 'matters', _id: '2' }
        )
        .update({
          _index: 'matters',
          _id: '3',
          doc: { title: 'Updated Matter 3' }
        })
        .delete({ _index: 'matters', _id: '4' })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": {
              "_id": "1",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 800,
            "matter_id": "M-2001",
            "practice_area": "corporate",
            "title": "Contract Negotiation",
          },
          {
            "create": {
              "_id": "2",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 750,
            "matter_id": "M-2002",
            "practice_area": "securities",
            "title": "Regulatory Compliance",
          },
          {
            "update": {
              "_id": "3",
              "_index": "matters",
            },
          },
          {
            "doc": {
              "title": "Updated Matter 3",
            },
          },
          {
            "delete": {
              "_id": "4",
              "_index": "matters",
            },
          },
        ]
      `);
    });
  });

  describe('Bulk output formats', () => {
    it('should build as NDJSON string', () => {
      const result = bulk(matterMappings)
        .index({
          matter_id: 'M-1001',
          title: 'Acquisition Review',
          practice_area: 'corporate',
          billing_rate: 750
        })
        .build();

      expect(result).toMatchInlineSnapshot(`
        "{"index":{}}
        {"matter_id":"M-1001","title":"Acquisition Review","practice_area":"corporate","billing_rate":750}
        "
      `);
    });

    it('should build as array', () => {
      const result = bulk(matterMappings)
        .index({
          matter_id: 'M-1001',
          title: 'Acquisition Review',
          practice_area: 'corporate',
          billing_rate: 750
        })
        .buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": {},
          },
          {
            "billing_rate": 750,
            "matter_id": "M-1001",
            "practice_area": "corporate",
            "title": "Acquisition Review",
          },
        ]
      `);
    });

    it('buildArray returns a typed array, not any[]', () => {
      const ops = bulk(matterMappings)
        .index({ matter_id: 'M-1', title: 'hello', practice_area: 'lit', billing_rate: 100 }, { _index: 'idx' })
        .buildArray();

      // Compile-time: ops is no longer `any[]`.
      // Runtime: verify the alternating header/body layout.
      expect(ops).toHaveLength(2);
    });
  });

  describe('Real-world bulk scenarios', () => {
    it('should batch matter index operations', () => {
      let bulkOp = bulk(matterMappings);
      for (const matter of MATTERS) {
        bulkOp = bulkOp.index(matter, {
          _index: 'matters',
          _id: matter.matter_id
        });
      }

      const result = bulkOp.buildArray();

      expect(result).toMatchInlineSnapshot(`
        [
          {
            "index": {
              "_id": "M-1001",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 850,
            "matter_id": "M-1001",
            "opened_at": "2023-01-10",
            "practice_area": "corporate",
            "risk_score": 3.2,
            "title": "Mergers & Acquisitions Advisory",
          },
          {
            "index": {
              "_id": "M-1002",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 920,
            "matter_id": "M-1002",
            "opened_at": "2023-05-22",
            "practice_area": "securities",
            "risk_score": 4.7,
            "title": "SEC Enforcement Defense",
          },
          {
            "index": {
              "_id": "M-1003",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 780,
            "matter_id": "M-1003",
            "opened_at": "2022-08-14",
            "practice_area": "intellectual-property",
            "risk_score": 3.9,
            "title": "Patent Infringement Litigation",
          },
          {
            "index": {
              "_id": "M-1004",
              "_index": "matters",
            },
          },
          {
            "billing_rate": 620,
            "matter_id": "M-1004",
            "opened_at": "2021-11-03",
            "practice_area": "real-estate",
            "risk_score": 2.1,
            "title": "Commercial Real Estate Finance",
          },
        ]
      `);
    });

    it('should handle mixed CRUD operations', () => {
      const result = bulk(matterMappings)
        // Create new products
        .create(
          {
            matter_id: 'M-5000',
            title: 'Cross-Border M&A',
            practice_area: 'corporate',
            billing_rate: 950
          },
          { _index: 'matters', _id: '100' }
        )
        // Update existing
        .update({
          _index: 'matters',
          _id: '50',
          doc: { billing_rate: 450 }
        })
        // Delete old
        .delete({ _index: 'matters', _id: '25' })
        .build();

      expect(result).toMatchInlineSnapshot(`
        "{"create":{"_index":"matters","_id":"100"}}
        {"matter_id":"M-5000","title":"Cross-Border M&A","practice_area":"corporate","billing_rate":950}
        {"update":{"_index":"matters","_id":"50"}}
        {"doc":{"billing_rate":450}}
        {"delete":{"_index":"matters","_id":"25"}}
        "
      `);
    });
  });
});
