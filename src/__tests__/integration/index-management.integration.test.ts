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
  completion,
  tokenCount,
  join
} from '../../index.js';
import { createIndex, deleteIndex, esGet, esPost } from '../helpers';

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
      indexBuilder().mappings(fullDocMappings).settings({ number_of_shards: 1, number_of_replicas: 0 }).build()
    )
  );

  afterAll(() => deleteIndex(INDEX_FULL));

  it('registers all field types in the mapping', async () => {
    const result = await esGet(`/${INDEX_FULL}/_mapping`);

    expect(fieldTypes(result[INDEX_FULL].mappings.properties)).toMatchInlineSnapshot(`
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
    const {
      [INDEX_FULL]: {
        settings: {
          index: { number_of_shards, number_of_replicas }
        }
      }
    } = result;

    expect({ number_of_shards, number_of_replicas }).toMatchInlineSnapshot(`
      {
        "number_of_replicas": "0",
        "number_of_shards": "1",
      }
    `);
  });
});

describe('Index Management — custom analysis round-trips through ES', () => {
  // Phase 2 integration test: prove that the AnalysisConfig passthrough produces
  // a structure Elasticsearch accepts, by creating an index with a custom analyzer
  // plus tokenizer + filter + char_filter, then asking the _analyze API to tokenize
  // input against it.
  const INDEX_ANALYSIS = 'int-index-mgmt-analysis';

  beforeAll(() =>
    createIndex(
      INDEX_ANALYSIS,
      indexBuilder()
        .mappings({ body: text() })
        .settings({ number_of_shards: 1, number_of_replicas: 0 })
        .analysis({
          analyzer: {
            my_analyzer: {
              type: 'custom',
              tokenizer: 'my_pattern_tokenizer',
              filter: ['lowercase', 'my_english_stop'],
              char_filter: ['my_html_strip']
            }
          },
          tokenizer: {
            my_pattern_tokenizer: { type: 'pattern', pattern: '\\W+' }
          },
          filter: {
            my_english_stop: { type: 'stop', stopwords: '_english_' }
          },
          char_filter: {
            my_html_strip: { type: 'html_strip' }
          }
        })
        .build()
    )
  );

  afterAll(() => deleteIndex(INDEX_ANALYSIS));

  it('tokenizes input through the custom analyzer', async () => {
    const result = await esPost(`/${INDEX_ANALYSIS}/_analyze`, {
      analyzer: 'my_analyzer',
      text: '<p>The Quick Brown Fox</p>'
    });

    const tokens = (result.tokens as Array<{ token: string }>).map((t) => t.token);

    // html_strip removes the tags, lowercase filter lowercases, stop filter removes 'the'
    expect(tokens).toStrictEqual(['quick', 'brown', 'fox']);
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

const INDEX_TOKEN = 'int-index-token-count';

describe('Index Management — tokenCount field', () => {
  beforeAll(() =>
    createIndex(
      INDEX_TOKEN,
      indexBuilder()
        .mappings({
          title: text(),
          title_length: tokenCount({ analyzer: 'standard', enable_position_increments: true })
        })
        .build()
    )
  );

  afterAll(() => deleteIndex(INDEX_TOKEN));

  it('creates a token_count mapping and indexes a document', async () => {
    const mapping = await esGet(`/${INDEX_TOKEN}/_mapping`);

    expect(mapping[INDEX_TOKEN].mappings.properties.title_length).toMatchInlineSnapshot(`
      {
        "analyzer": "standard",
        "type": "token_count",
      }
    `);

    await esPost(`/${INDEX_TOKEN}/_doc?refresh=true`, { title: 'hello world test', title_length: 'hello world test' });

    const result = await esPost(`/${INDEX_TOKEN}/_search`, {
      query: { range: { title_length: { gte: 2 } } }
    });

    expect(result.hits.total.value).toBe(1);
  });
});

const INDEX_JOIN = 'int-index-join';

describe('Index Management — join field', () => {
  beforeAll(() =>
    createIndex(
      INDEX_JOIN,
      indexBuilder()
        .mappings({
          title: text(),
          body: text(),
          relation: join({ relations: { question: 'answer' } })
        })
        .build()
    )
  );

  afterAll(() => deleteIndex(INDEX_JOIN));

  it('creates a join mapping and indexes parent + child documents', async () => {
    const mapping = await esGet(`/${INDEX_JOIN}/_mapping`);

    expect(mapping[INDEX_JOIN].mappings.properties.relation).toMatchInlineSnapshot(`
      {
        "eager_global_ordinals": true,
        "relations": {
          "question": "answer",
        },
        "type": "join",
      }
    `);

    await esPost(`/${INDEX_JOIN}/_doc/1?refresh=true`, {
      title: 'What is Elasticsearch?',
      relation: 'question'
    });

    await esPost(`/${INDEX_JOIN}/_doc/2?routing=1&refresh=true`, {
      body: 'A search engine.',
      relation: { name: 'answer', parent: '1' }
    });

    const result = await esPost(`/${INDEX_JOIN}/_search`, {
      query: { has_child: { type: 'answer', query: { match_all: {} } } }
    });

    expect(result.hits.total.value).toBe(1);
    expect(result.hits.hits[0]._id).toBe('1');
  });
});
