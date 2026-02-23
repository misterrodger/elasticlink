import {
  indexBuilder,
  mappings,
  text,
  keyword,
  integer,
  float,
  date,
  boolean,
  geoPoint,
  denseVector,
  nested,
  completion
} from '../../index.js';
import { createIndex, deleteIndex, esGet } from './helpers.js';

const INDEX_FULL = 'int-index-mgmt-full';
const INDEX_ALIAS = 'int-index-mgmt-alias';

const fullDocMappings = mappings({
  title: text(),
  category: keyword(),
  count: integer(),
  score: float(),
  created_at: date(),
  active: boolean(),
  location: geoPoint(),
  embedding: denseVector({ dims: 3 }),
  tags: nested({ label: keyword(), weight: float() }),
  suggest: completion()
});

const fieldTypes = (props: Record<string, { type: string }>) =>
  Object.fromEntries(Object.entries(props).map(([k, v]) => [k, v.type]));

describe('Index Management — full index config', () => {
  beforeAll(() =>
    createIndex(
      INDEX_FULL,
      indexBuilder()
        .mappings(fullDocMappings)
        .settings({ number_of_shards: 1, number_of_replicas: 0 })
        .build()
    )
  );

  afterAll(() => deleteIndex(INDEX_FULL));

  it('registers all field types in the mapping', async () => {
    const result = await esGet(`/${INDEX_FULL}/_mapping`);

    expect(fieldTypes(result[INDEX_FULL].mappings.properties))
      .toMatchInlineSnapshot(`
      {
        "active": "boolean",
        "category": "keyword",
        "count": "integer",
        "created_at": "date",
        "embedding": "dense_vector",
        "location": "geo_point",
        "score": "float",
        "suggest": "completion",
        "tags": "nested",
        "title": "text",
      }
    `);
  });

  it('applies index settings', async () => {
    const result = await esGet(`/${INDEX_FULL}/_settings`);
    const { number_of_shards, number_of_replicas } =
      result[INDEX_FULL].settings.index;

    expect({ number_of_shards, number_of_replicas }).toMatchInlineSnapshot(`
      {
        "number_of_replicas": "0",
        "number_of_shards": "1",
      }
    `);
  });
});

describe('Index Management — aliases', () => {
  beforeAll(() =>
    createIndex(
      INDEX_ALIAS,
      indexBuilder()
        .mappings({ title: text() })
        .alias('int-alias-read')
        .alias('int-alias-write', { is_write_index: true })
        .build()
    )
  );

  afterAll(() => deleteIndex(INDEX_ALIAS));

  it('creates aliases with correct configuration', async () => {
    const result = await esGet(`/${INDEX_ALIAS}/_alias`);

    expect(result[INDEX_ALIAS].aliases).toMatchInlineSnapshot(`
      {
        "int-alias-read": {},
        "int-alias-write": {
          "is_write_index": true,
        },
      }
    `);
  });
});
