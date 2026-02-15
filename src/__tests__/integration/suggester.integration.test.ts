import { query, indexBuilder, keyword } from '../../index.js';
import {
  createIndex,
  deleteIndex,
  indexDoc,
  refreshIndex,
  search
} from './helpers.js';
import { Attorney, ATTORNEYS } from './fixtures/legal.js';

const INDEX = 'int-suggester';

describe('SuggesterBuilder', () => {
  beforeAll(async () => {
    await createIndex(
      INDEX,
      indexBuilder<Attorney>()
        .mappings({
          name: 'text',
          practice_area: keyword(),
          name_suggest: { type: 'completion' }
        })
        .build()
    );
    for (const doc of ATTORNEYS) await indexDoc(INDEX, doc);
    await refreshIndex(INDEX);
  });

  afterAll(() => deleteIndex(INDEX));

  describe('Suggester — term', () => {
    it('returns spelling corrections for a misspelled term', async () => {
      const result = await search(
        INDEX,
        query<Attorney>()
          .suggest((s) =>
            s.term('name-suggestions', 'wiliams', { field: 'name' })
          )
          .size(0)
          .build()
      );

      expect(
        result.suggest['name-suggestions'][0].options.length
      ).toBeGreaterThan(0);
      expect(result.suggest['name-suggestions'][0].options[0].text).toBe(
        'williams'
      );
    });
  });

  describe('Suggester — completion', () => {
    it('returns autocomplete suggestions for a prefix', async () => {
      const result = await search(
        INDEX,
        query<Attorney>()
          .suggest((s) =>
            s.completion('autocomplete', 'kap', { field: 'name_suggest' })
          )
          .size(0)
          .build()
      );

      const options = result.suggest.autocomplete[0].options;
      const texts = options.map((o: { text: string }) => o.text);

      expect(options.length).toBeGreaterThan(0);
      expect(
        texts.some((t: string) => t.toLowerCase().includes('kapoor'))
      ).toBe(true);
    });

    it('limits results with size option', async () => {
      const result = await search(
        INDEX,
        query<Attorney>()
          .suggest((s) =>
            s.completion('autocomplete', '', { field: 'name_suggest', size: 2 })
          )
          .size(0)
          .build()
      );

      expect(result.suggest.autocomplete[0].options.length).toBeLessThanOrEqual(
        2
      );
    });
  });
});
