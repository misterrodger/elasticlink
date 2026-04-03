import { queryBuilder, indexBuilder } from '../../index.js';
import { ensureIndex, deleteIndex, indexDoc, refreshIndex, search } from '../helpers';
import { vectorProductMappings } from '../fixtures/ecommerce.schema.js';
import { VECTOR_PRODUCTS } from '../fixtures/ecommerce.data.js';

const INDEX = `int-vector-${Date.now()}`;

describe('QueryBuilder — knn (vector search)', () => {
  beforeAll(async () => {
    await ensureIndex(INDEX, indexBuilder().mappings(vectorProductMappings).build());
    for (const doc of VECTOR_PRODUCTS) await indexDoc(INDEX, doc);
    await refreshIndex(INDEX);
  });

  afterAll(() => deleteIndex(INDEX));

  it('returns the nearest neighbor for a query vector aligned with x-axis', async () => {
    const result = await search(
      INDEX,
      queryBuilder(vectorProductMappings).knn('embedding', [1, 0, 0], { k: 1, num_candidates: 10 }).build()
    );

    expect(result.hits.hits).toHaveLength(1);
    expect(result.hits.hits[0]._source.title).toBe('alpha');
  });

  it('returns top-k neighbors ordered by cosine similarity', async () => {
    // Query vector aligned with y-axis — beta (0,1,0) is exact match, delta (0.707,0.707,0) next
    const result = await search(
      INDEX,
      queryBuilder(vectorProductMappings).knn('embedding', [0, 1, 0], { k: 3, num_candidates: 10 }).build()
    );

    const titles = result.hits.hits.map((h: { _source: { title: string } }) => h._source.title);

    expect(titles[0]).toBe('beta');
    expect(titles).toHaveLength(3);
  });

  it('respects a keyword filter — narrows candidates before scoring', async () => {
    // Without filter, alpha (1,0,0) wins for query [1,0,0].
    // With category=b filter only beta and delta qualify; delta (0.707,0.707,0) is nearer.
    const result = await search(
      INDEX,
      queryBuilder(vectorProductMappings)
        .knn('embedding', [1, 0, 0], {
          k: 1,
          num_candidates: 10,
          filter: { term: { category: 'b' } }
        })
        .build()
    );

    expect(result.hits.hits).toHaveLength(1);
    expect(result.hits.hits[0]._source.title).toBe('delta');
  });
});
