import {
  indexBuilder,
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
const INDEX_DYNAMIC = 'int-index-mgmt-dynamic';
const INDEX_ALIAS = 'int-index-mgmt-alias';

type FullDoc = {
  title: string;
  category: string;
  count: number;
  score: number;
  created_at: string;
  active: boolean;
  location: unknown;
  embedding: number[];
  tags: unknown[];
  suggest: string;
};

const fieldTypes = (props: Record<string, { type: string }>) =>
  Object.fromEntries(Object.entries(props).map(([k, v]) => [k, v.type]));

describe('Index Management — full index config', () => {
  beforeAll(() =>
    createIndex(
      INDEX_FULL,
      indexBuilder<FullDoc>()
        .mappings({
          title: text(),
          category: keyword(),
          count: integer(),
          score: float(),
          created_at: date(),
          active: boolean(),
          location: geoPoint(),
          embedding: denseVector({ dims: 3 }),
          tags: nested({ label: 'keyword', weight: 'float' }),
          suggest: completion()
        })
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

describe('Index Management — dynamic mapping option', () => {
  type Doc = { title: string };

  beforeAll(() =>
    createIndex(
      INDEX_DYNAMIC,
      indexBuilder<Doc>().mappings({ title: 'text', dynamic: 'strict' }).build()
    )
  );

  afterAll(() => deleteIndex(INDEX_DYNAMIC));

  it('persists the dynamic setting in the mapping', async () => {
    const result = await esGet(`/${INDEX_DYNAMIC}/_mapping`);

    expect(result[INDEX_DYNAMIC].mappings.dynamic).toMatchInlineSnapshot(
      `"strict"`
    );
  });
});

describe('Index Management — aliases', () => {
  type Doc = { title: string };

  beforeAll(() =>
    createIndex(
      INDEX_ALIAS,
      indexBuilder<Doc>()
        .mappings({ title: 'text' })
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
